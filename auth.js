/** Login + register wiring for the original HTML pages. */
const isCreate=window.location.pathname.endsWith('/create.html');
const form=document.querySelector('form:not(.dim)');
if(form){
 form.removeAttribute('onsubmit');
 const status=document.createElement('p');status.setAttribute('role','alert');status.className='auth-status';status.style.cssText='font-size:14px;color:#a12655;margin:12px 0;min-height:1em';
 form.querySelector('button[type="submit"],button.btn.full')?.before(status);
 form.addEventListener('submit',async event=>{
   event.preventDefault();
   const submit=form.querySelector('button.btn.full');
   const email=form.querySelector('input[type=email]')?.value.trim();
   const password = form.querySelector(
    'input[autocomplete="new-password"], input[autocomplete="current-password"]'
  )?.value;   const data={email,password};
   if(isCreate){
     data.name=form.querySelector('input:not([type])')?.value.trim();
     const selects=form.querySelectorAll('.dob select');
     const month=Array.from(selects[0]?.options||[]).findIndex(o=>o.selected);
     const day=Number(selects[1]?.value), year=Number(selects[2]?.value);
     const birth=new Date(Date.UTC(year,month-1,day));
     if(!year||month<1||!day||birth.getUTCFullYear()!==year||birth.getUTCMonth()!==month-1||birth.getUTCDate()!==day){status.textContent='Enter a valid date of birth.';return;}
     const today=new Date();let age=today.getUTCFullYear()-year;
     if(today.getUTCMonth()<month-1 || (today.getUTCMonth()===month-1&&today.getUTCDate()<day)) age--;
     if(year<1981 || year>1996){status.textContent='This dating website is designed for millennials born 1981–1996.';return;}
     data.birthDate=birth.toISOString().slice(0,10);
   }
   status.textContent='';submit.disabled=true;
   try{
     const response=await fetch('/api/'+(isCreate?'register':'login'),{method:'POST',headers:{'Content-Type':'application/json','X-Vinder-Request':'1'},credentials:'same-origin',body:JSON.stringify(data)});
     const json=await response.json();
     if(!response.ok)throw new Error(json.error||'Unable to sign in');
     location.assign('/dashboard.html');
   }catch(e){status.textContent=e.message;}finally{submit.disabled=false;}
 });
}
