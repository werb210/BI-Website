export function track(event: string, payload?: any) {
  if ((window as any).gtag) {
    (window as any).gtag("event", event, payload);
  }
}
