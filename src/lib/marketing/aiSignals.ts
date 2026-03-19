export async function sendAISignal(signal:string,data:any){

  try{

    await fetch("/api/bi/ai-signal",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        signal,
        data,
        timestamp:Date.now()
      })
    })

  }catch(e){
    void e
  }
}
