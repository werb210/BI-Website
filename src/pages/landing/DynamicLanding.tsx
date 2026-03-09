import { useEffect, useState } from "react"

export default function DynamicLanding() {

  const [content,setContent] = useState<any>(null)

  useEffect(()=>{

    const params = new URLSearchParams(window.location.search)
    const campaign = params.get("utm_campaign")

    fetch("/api/bi/landing?campaign="+campaign)
      .then(r=>r.json())
      .then(setContent)
      .catch(()=>{})

  },[])

  if(!content) return null

  return (

    <div>

      <h1>{content.title}</h1>

      <p>{content.subtitle}</p>

    </div>

  )

}
