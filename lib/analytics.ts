export function trackEvent(name: string, payload?: Record<string, string | number | boolean>) {
  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", name, payload ?? {});
  }
}
