// Read-only inspection of the local lab database; intentionally never outputs passwords.
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
const dir=dirname(fileURLToPath(import.meta.url));
const file=join(process.env.VINDER_DATA_DIR||join(dir,'data'),'vinder.sqlite');
if(!existsSync(file)){console.error('No database yet. Start the backend once using: npm run server');process.exit(1);}
const db=new DatabaseSync(file,{readOnly:true});
console.log('Database:',file);
console.log('Created fictional test accounts:',db.prepare('SELECT COUNT(*) AS n FROM users').get().n);
const rows=db.prepare('SELECT id,profile_json FROM users ORDER BY id').all().map(row=>({id:row.id,...JSON.parse(row.profile_json)}));
console.log('Published Discover members:',rows.filter(p=>p.listed===true && p.photos?.length).length);
console.table(rows.map(p=>({ id:p.id, name:p.name, age:p.age, city:p.city, published: p.listed===true })));
db.close();
