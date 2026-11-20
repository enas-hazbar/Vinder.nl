/** Vinder local university demo backend. Node >= 22.13; no external server dependencies. */
import http from 'node:http';
import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { defaultMyProfile } from '../src/data/myProfile.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = process.env.VINDER_DATA_DIR || path.join(currentDir, 'data');
mkdirSync(DB_DIR, { recursive: true, mode: 0o700 });
const db = new DatabaseSync(path.join(DB_DIR, 'vinder.sqlite'));
db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  profile_json TEXT NOT NULL,
  state_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL
);`);
const statement = (q) => db.prepare(q);
const publicUser = (row) => ({ id:row.id, email:row.email, profile:JSON.parse(row.profile_json), state:JSON.parse(row.state_json) });
const defaultState = () => ({likes: [], passes: [], chats:{}});
const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 64).toString('hex');
const sessionHash = token => crypto.createHash('sha256').update(token).digest('hex');
const failures=new Map();
const loginThreshold=10; const loginWindow=300000;
const now=()=>Date.now();
const normalizeEmail=s=>String(s||'').trim().toLowerCase();
const err=(message,status=400)=>{const e=new Error(message); e.status=status; throw e;};
function send(res,status,body,extra={}){
 res.writeHead(status,{ 'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff',...extra });
 res.end(JSON.stringify(body));
}
async function getBody(req){
 let raw='';
 for await(const chunk of req){raw+=chunk.toString('utf8'); if(Buffer.byteLength(raw)>5_000_000)err('Request too large',413);}
 try{return JSON.parse(raw||'{}')}catch{err('Invalid JSON')}
}
function parseSession(req){
 const match=/(?:^|;\s*)vinder_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'');
 if(!match)return null;
 const session=statement('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE sessions.token_hash=? AND sessions.expires_at>?').get(sessionHash(match[1]),now());
 return session||null;
}
function newSession(res,userId){
 const token=crypto.randomBytes(32).toString('hex');
 statement('DELETE FROM sessions WHERE expires_at<=?').run(now());
 statement('INSERT INTO sessions (token_hash,user_id,expires_at) VALUES(?,?,?)').run(sessionHash(token),userId,now()+24*60*60*1000);
 const secure=process.env.COOKIE_SECURE==='1' ? '; Secure' : '';
 res.setHeader('Set-Cookie',`vinder_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`);
}
// Discover only exposes a deliberately published, fictional profile, never credentials.
// Existing legacy member_profiles fixtures (if present) are ignored, never deleted.
function jsonProfiles(viewerId){
 return statement('SELECT id,profile_json FROM users WHERE id != ? ORDER BY id DESC').all(viewerId)
  .flatMap(row=>{
   const p=JSON.parse(row.profile_json);
   if(p.listed!==true || !p.photos?.length) return [];
   return [{
    id:`member-${row.id}`, name:p.name, age:p.age, city:p.city,
    // Illustrative demo-only distances: no GPS information is collected.
    distance:8+(row.id*13)%78, work:p.work, verified:false,
    compatibility:85, image:p.photos[0], photos:p.photos,
    interests:p.interests, goal:p.goal, bio:p.bio
   }];
  });
}
function validPhoto(photo){
 if(typeof photo!=='string')return false;
 const m=/^data:image\/(jpeg|png|webp);base64,([a-zA-Z0-9+/]+={0,2})$/.exec(photo);
 if(!m || m[2].length>650_000)return false; // approx <=487 KB per resized image
 const data=Buffer.from(m[2],'base64');
 const type=m[1];
 if(data.length>480_000)return false;
 if(type==='jpeg')return data.length>3 && data[0]===0xff && data[1]===0xd8 && data[2]===0xff;
 if(type==='png')return data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 return data.subarray(0,4).toString()==='RIFF' && data.subarray(8,12).toString()==='WEBP';
}
function sanitizeProfile(input,old){
 if(!input||typeof input!=='object'||Array.isArray(input))err('Invalid profile');
 const name=String(input.name||'').trim();
 const age=Number(input.age);
 const city=String(input.city||'').trim();
 const work=String(input.work||'').trim();
 const bio=String(input.bio||'').trim();
 if(!name||name.length>40||!Number.isInteger(age)||age<29||age>45)err('Name and age (29–45) are required for this');
 if(city.length>50||work.length>70||bio.length>320)err('Profile field too long');
 if(!['Relationship','Open to dating','Friendship'].includes(input.goal))err('Invalid relationship goal');
 if(!Array.isArray(input.interests)||input.interests.length>12||input.interests.some(x=>typeof x!=='string'||x.length>24))err('Invalid interests');
 if(!Array.isArray(input.photos)||input.photos.length>6||input.photos.some(x=>!validPhoto(x)))err('Pictures must be resized JPEG/PNG/WebP under 480 KB each');
 if(typeof input.listed !== 'boolean')err('Profile visibility must be selected');
 if(input.listed && (!city || !bio || !input.photos.length))err('To appear in Discover, add a city, bio, and at least one fictional photo');
 return {name,age,city,work,bio,goal:input.goal,interests:[...new Set(input.interests.map(x=>x.trim()))],photos:input.photos,listed:input.listed};
}
function sanitizeState(input,viewerId){
 if(!input||typeof input!=='object')err('Invalid state');
 const validIds=new Set(jsonProfiles(viewerId).map(p=>p.id));
 const cleanIds=value=>Array.isArray(value)?[...new Set(value.filter(x=>validIds.has(x)))]:[];
 const chats={};
 if(input.chats&&typeof input.chats==='object')for(const [key,messages] of Object.entries(input.chats)){
   if(!validIds.has(key)||!Array.isArray(messages))continue;
   chats[key]=messages.slice(-100).filter(m=>m&&['me','them'].includes(m.from)&&typeof m.text==='string').map(m=>({from:m.from,text:m.text.slice(0,300)}));
 }
 return {likes:cleanIds(input.likes),passes:cleanIds(input.passes),chats};
}
function loginRate(ip,email){const key=`${ip}|${email}`;const v=failures.get(key)||[];const valid=v.filter(t=>now()-t<loginWindow);if(valid.length>=loginThreshold)err('Too many login attempts. Try again later.',429);return {key,valid};}
const PORT=Number(process.env.PORT||3001);
const HOST=process.env.HOST||'127.0.0.1';
export const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,'http://127.0.0.1').pathname;
  if(!pathname.startsWith('/api/'))return send(res,404,{error:'Not found'});
  if(!['GET','POST','PUT'].includes(req.method))return send(res,405,{error:'Method not allowed'});
  const isWrite=req.method!=='GET';
  if(isWrite){
    if(req.headers['x-vinder-request']!=='1')err('Missing application request header',403);
    const origin=req.headers.origin;
    if(origin){
      // Vite's development proxy forwards browser Origin :5173 to the local API :3001.
      // Allow ONLY the two expected localhost dev origins, never arbitrary websites.
      const devOrigins = new Set(['http://127.0.0.1:5173','http://localhost:5173']);
      const isDevProxy = process.env.NODE_ENV !== 'production' && HOST === '127.0.0.1';
      try {
        const received = new URL(origin);
        if (!(received.host === req.headers.host || (isDevProxy && devOrigins.has(received.origin)))) {
          err('Cross-origin request blocked',403);
        }
      } catch(e) {if(e.status)throw e;err('Invalid origin',403);}
    }
    if(!String(req.headers['content-type']||'').startsWith('application/json'))err('JSON required',415);
  }
  if(pathname==='/api/health'&&req.method==='GET')return send(res,200,{ok:true,service:'vinder-lab'});
  if(pathname==='/api/register'&&req.method==='POST'){
    const body=await getBody(req),email=normalizeEmail(body.email),name=String(body.name||'').trim();
    const password=body.password;
  if (name.length < 1 || name.length > 40) {
    err('Please enter a name between 1 and 40 characters.');
  }

  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 180) {
    err('Please enter a valid email address.');
  }

  if (typeof password !== 'string' ||
      password.length < 12 ||
      password.length > 128) {
    err('Your password must contain between 12 and 128 characters.');
  }    const dateText = String(body.birthDate||'');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateText))err('Enter a valid birth date');
    const birth = new Date(dateText+'T00:00:00Z');
    if(Number.isNaN(birth.getTime()) || birth.toISOString().slice(0,10)!==dateText)err('Enter a valid birth date');
    const birthYear = birth.getUTCFullYear();
    if(birthYear < 1981 || birthYear > 1996)err('This fictional is for millennials born 1981–1996');
    const today = new Date();
    let age=today.getUTCFullYear()-birthYear;
    if(today.getUTCMonth()<birth.getUTCMonth()||(today.getUTCMonth()===birth.getUTCMonth()&&today.getUTCDate()<birth.getUTCDate()))age--;
    if(age < 18)err('this account must be 30+');
    if(statement('SELECT id FROM users WHERE email=?').get(email))err('Account already exists',409);
    const salt=crypto.randomBytes(16).toString('hex');
    const profile={...defaultMyProfile,name,age,photos:[],listed:false,interests:[...defaultMyProfile.interests]};
    const result=statement('INSERT INTO users(email,password_hash,salt,profile_json,state_json,created_at) VALUES (?,?,?,?,?,?)').run(email,hashPassword(password,salt),salt,JSON.stringify(profile),JSON.stringify(defaultState()),new Date().toISOString());
    newSession(res,Number(result.lastInsertRowid));
    return send(res,201,{ok:true});
  }
  if(pathname==='/api/login'&&req.method==='POST'){
    const body=await getBody(req),email=normalizeEmail(body.email),pass=body.password;
    if(typeof pass!=='string'||pass.length>128||email.length>180)err('Invalid credentials',401);
    const ip=req.socket.remoteAddress||'unknown';const rate=loginRate(ip,email);
    const user=statement('SELECT * FROM users WHERE email=?').get(email);
    // Always run one scrypt operation, even when email is unknown
    const actual=hashPassword(pass,user?.salt||'00000000000000000000000000000000');
    const expected=user?.password_hash||'0'.repeat(128);
    if(!user||!crypto.timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(expected,'hex'))){
      failures.set(rate.key,[...rate.valid,now()]);err('Invalid credentials',401);
    }
    failures.delete(rate.key);
    newSession(res,user.id);
    return send(res,200,{ok:true});
  }
  if(pathname==='/api/session'&&req.method==='GET'){
    const user=parseSession(req);return user?send(res,200,{user:publicUser(user)}):send(res,401,{error:'Not signed in'});
  }
  if(pathname==='/api/logout'&&req.method==='POST'){
    const match=/(?:^|;\s*)vinder_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'');
    if(match)statement('DELETE FROM sessions WHERE token_hash=?').run(sessionHash(match[1]));
    res.setHeader('Set-Cookie','vinder_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    return send(res,200,{ok:true});
  }
  const user=parseSession(req);
  if(!user) return send(res,401,{error:'Please sign in'});
  if(pathname==='/api/profiles'&&req.method==='GET')return send(res,200,{profiles:jsonProfiles(user.id)});
  if(pathname==='/api/me/profile'&&req.method==='PUT'){
    const value=sanitizeProfile(await getBody(req),JSON.parse(user.profile_json));
    statement('UPDATE users SET profile_json=? WHERE id=?').run(JSON.stringify(value),user.id);
    return send(res,200,{profile:value});
  }
  if(pathname==='/api/me/state'&&req.method==='PUT'){
    const value=sanitizeState(await getBody(req),user.id);
    statement('UPDATE users SET state_json=? WHERE id=?').run(JSON.stringify(value),user.id);
    return send(res,200,{state:value});
  }
  return send(res,404,{error:'Not found'});
 }catch(e){
  const code=e.status||(e.code?.startsWith('SQLITE_CONSTRAINT')?409:500);
  if(code>=500)console.error('[Vinder API]',e);
  send(res,code,{error:code>=500?'Server error':e.message});
 }
});
if(process.env.NODE_ENV!=='test')server.listen(PORT,HOST,()=>console.log(`Vinder API listening on http://${HOST}:${PORT} (lab-only)`));
