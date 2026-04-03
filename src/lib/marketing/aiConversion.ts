export function notifyAIConversion(type:string,value:number){

  fetch("/api/v1/ai-conversion",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      type,
      value,
      timestamp:Date.now()
    }),
    credentials:"include"
  }).catch(()=>{})

}
