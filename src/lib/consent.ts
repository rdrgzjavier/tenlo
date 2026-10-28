export const analyticsConsentCookie = "tenlo_analytics_consent";
export const analyticsConsentChangedEvent = "tenlo:consent-change";
export const analyticsConsentOpenEvent = "tenlo:open-consent";

export type AnalyticsConsentChoice = "accepted" | "rejected";

export function readAnalyticsConsent(): AnalyticsConsentChoice | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${analyticsConsentCookie}=`))
    ?.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

export function storeAnalyticsConsent(choice: AnalyticsConsentChoice) {
  document.cookie = `${analyticsConsentCookie}=${choice}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  if (choice === "rejected") {
    document.cookie
      .split(";")
      .map((part) => part.trim().split("=")[0])
      .filter((name) => name === "_ga" || name.startsWith("_ga_"))
      .forEach((name) => {
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
        document.cookie = `${name}=; Domain=.tenlo.es; Path=/; Max-Age=0; SameSite=Lax; Secure`;
      });
  }
  window.dispatchEvent(new CustomEvent(analyticsConsentChangedEvent, { detail: { choice } }));
}

export function openAnalyticsConsentSettings() {
  window.dispatchEvent(new Event(analyticsConsentOpenEvent));
}
