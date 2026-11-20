import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const temp=mkdtempSync(join(tmpdir(),'vinder-db-test-'));
process.env.NODE_ENV='test';
process.env.VINDER_DATA_DIR=temp;
const { server }=await import('../server/app.mjs');
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const request=async(url,body,method='GET',cookie='')=>{
 const res=await fetch(base+url,{
  method,headers:{'Content-Type':'application/json','X-Vinder-Request':'1',...(cookie?{Cookie:cookie}:{})},
  ...(body!==undefined?{body:JSON.stringify(body)}:{})
 });
 const data=await res.json();return {res,data,cookie:res.headers.get('set-cookie')?.split(';')[0]};
};
const demoPhoto='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y6jFz8AAAAASUVORK5CYII=';
test('test accounts publish to Discover; old seed profiles never appear',async()=>{
 assert.equal((await request('/api/profiles')).res.status,401);
 const a=await request('/api/register',{email:'ava@vinder.test',name:'Ava Demo',birthDate:'1988-04-17',password:'UniqueTestPassword-123'},'POST');
 assert.equal(a.res.status,201,JSON.stringify(a.data));
 const cookieA=a.cookie;
 assert.deepEqual((await request('/api/profiles',undefined,'GET',cookieA)).data.profiles,[]);
 const b=await request('/api/register',{email:'sam@vinder.test',name:'Sam Demo',birthDate:'1991-06-15',password:'UniqueTestPassword-234'},'POST');
 assert.equal(b.res.status,201,JSON.stringify(b.data));
 const cookieB=b.cookie;
 const sessionB=(await request('/api/session',undefined,'GET',cookieB)).data.user;
 assert.equal(sessionB.profile.listed,false);
 const bad=await request('/api/me/profile',{...sessionB.profile,listed:true},'PUT',cookieB);
 assert.equal(bad.res.status,400);
 const published={...sessionB.profile,name:'Sam Demo',city:'Utrecht',work:'Musician',bio:'Looking for real fictional demo matches',interests:['Music','Hiking'],photos:[demoPhoto],goal:'Relationship',listed:true};
 const updated=await request('/api/me/profile',published,'PUT',cookieB);
 assert.equal(updated.res.status,200,JSON.stringify(updated.data));
 const asA=await request('/api/profiles',undefined,'GET',cookieA);
 assert.equal(asA.data.profiles.length,1);
 assert.equal(asA.data.profiles[0].name,'Sam Demo');
 assert.equal(asA.data.profiles[0].image,demoPhoto);
 assert.equal(asA.data.profiles[0].city,'Utrecht');
 assert.ok(!('email' in asA.data.profiles[0]));
 assert.ok(!('password_hash' in asA.data.profiles[0]));
 const asB=await request('/api/profiles',undefined,'GET',cookieB);
 assert.equal(asB.data.profiles.length,0,'user never sees themselves');
 const state=await request('/api/me/state',{likes:[asA.data.profiles[0].id,'ethan'],passes:[],chats:{[asA.data.profiles[0].id]:[{from:'me',text:'Fictional hello'}]}},'PUT',cookieA);
 assert.equal(state.res.status,200);
 assert.deepEqual(state.data.state.likes,[asA.data.profiles[0].id]);
 const login=await request('/api/login',{email:'ava@vinder.test',password:'UniqueTestPassword-123'},'POST');
 assert.equal(login.res.status,200);
 const reload=(await request('/api/session',undefined,'GET',login.cookie)).data.user;
 assert.deepEqual(reload.state.likes,[asA.data.profiles[0].id]);
 const hidden=await request('/api/me/profile',{...published,listed:false},'PUT',cookieB);
 assert.equal(hidden.res.status,200);
 assert.deepEqual((await request('/api/profiles',undefined,'GET',login.cookie)).data.profiles,[]);
 const logout=await request('/api/logout',{},'POST',login.cookie);
 assert.equal(logout.res.status,200);
 assert.equal((await request('/api/session',undefined,'GET',login.cookie)).res.status,401);
});
test('local Vite origin allowed; unrelated origin blocked',async()=>{
 const headers={'Content-Type':'application/json','X-Vinder-Request':'1'};
 const body=JSON.stringify({email:'another@vinder.test',name:'Demo User',birthDate:'1989-05-15',password:'UniqueTestPassword-345'});
 assert.equal((await fetch(base+'/api/register',{method:'POST',headers:{...headers,Origin:'http://127.0.0.1:5173'},body})).status,201);
 assert.equal((await fetch(base+'/api/register',{method:'POST',headers:{...headers,Origin:'https://unrelated.example'},body:JSON.stringify({email:'bad@vinder.test',name:'Demo',birthDate:'1989-05-15',password:'UniqueTestPassword-345'})})).status,403);
});
test('registration rejects birth years outside millennial window',async()=>{
 const data=await request('/api/register',{email:'too-young@vinder.test',name:'Demo',birthDate:'2004-01-01',password:'UniqueTestPassword-9876'},'POST');
 assert.equal(data.res.status,400);
});
test.after(async()=>{await new Promise(resolve=>server.close(resolve));rmSync(temp,{recursive:true,force:true});});
