import { spawn } from 'node:child_process';
// Start the Vite web UI and the localhost-only Node API together.
const running=[spawn(process.execPath,['server/app.mjs'],{stdio:'inherit'}),spawn('npm',['run','dev'],{stdio:'inherit',shell:process.platform==='win32'})];
for(const child of running)child.on('exit',()=>{for(const c of running)if(!c.killed)c.kill();});
process.on('SIGINT',()=>{for(const c of running)c.kill();});
