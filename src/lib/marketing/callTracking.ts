export function trackCallIntent(){

  fetch("/api/v1/call-intent",{
    method:"POST",
    credentials:"include"
  }).catch(()=>{})

}
