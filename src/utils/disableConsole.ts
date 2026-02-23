export function disableConsoleInProd() {
  if (import.meta.env.PROD) {
    console.log = () => {};
    console.warn = () => {};
  }
}
