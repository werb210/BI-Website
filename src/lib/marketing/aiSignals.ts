export async function sendAISignal(signal:string,data:any){

  try{

    await fetch("/api/v1/ai-signal",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        signal,
        data,
        timestamp:Date.now()
      }),
      credentials:"include"
    })

  }catch(e){
    void e
  }
}
