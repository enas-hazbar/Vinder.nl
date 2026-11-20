/** Same-origin frontend API. No browser storage of session tokens or passwords. */
export async function api(endpoint, {method='GET', body}={}) {
  const result=await fetch('/api'+endpoint,{
    method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-Vinder-Request':'1'},
    ...(body!==undefined?{body:JSON.stringify(body)}:{})
  });
  const response=await result.json().catch(()=>({}));
  if(!result.ok)throw new Error(response.error||`Request failed (${result.status})`);
  return response;
}
