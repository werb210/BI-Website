interface MarketingEvent {
  event: string
  timestamp: number
  campaign?: any
  referrer?: string | null
  data?: any
}

const QUEUE_KEY = "bi_event_queue"

export function queueEvent(e: MarketingEvent) {

  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")

  queue.push(e)

  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function flushEvents() {

  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]")

  if(queue.length === 0) return

  fetch("/api/v1/marketing-events/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(queue),
    credentials: "include"
  }).catch(()=>{})

  localStorage.removeItem(QUEUE_KEY)
}
