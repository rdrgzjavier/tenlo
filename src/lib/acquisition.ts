export type AcquisitionContext = {
  entry_channel: "campaign" | "organic_search" | "referral" | "direct";
  referrer_host?: string;
  traffic_source?: string;
  traffic_medium?: string;
  traffic_campaign?: string;
  traffic_content?: string;
  landing_path?: string;
};

const searchHosts = ["google.", "bing.com", "duckduckgo.com", "yahoo.", "ecosia.org"];
const acquisitionSessionKey = "tenlo_acquisition_context_v1";

function safeCampaignValue(value: string | null) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80);
  if (!normalized || normalized.includes("@") || /(?:\+?34)?[\s.-]*\d(?:[\s.-]*\d){7,}/.test(normalized)) return undefined;
  return normalized;
}

function referrerHost() {
  if (!document.referrer) return undefined;
  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    return hostname === window.location.hostname.toLowerCase() ? undefined : hostname.slice(0, 120);
  } catch {
    return undefined;
  }
}

export function currentAcquisitionContext(): AcquisitionContext {
  try {
    const stored = window.sessionStorage.getItem(acquisitionSessionKey);
    if (stored) return JSON.parse(stored) as AcquisitionContext;
  } catch {
    // La atribución no debe bloquear la navegación si el almacenamiento está restringido.
  }

  const params = new URLSearchParams(window.location.search);
  const source = safeCampaignValue(params.get("utm_source"));
  const medium = safeCampaignValue(params.get("utm_medium"));
  const campaign = safeCampaignValue(params.get("utm_campaign"));
  const content = safeCampaignValue(params.get("utm_content"));
  const referrer = referrerHost();

  const entryChannel = source || medium || campaign
    ? "campaign"
    : referrer && searchHosts.some((host) => referrer.includes(host))
      ? "organic_search"
      : referrer
        ? "referral"
        : "direct";

  const context: AcquisitionContext = {
    entry_channel: entryChannel,
    referrer_host: referrer,
    traffic_source: source,
    traffic_medium: medium,
    traffic_campaign: campaign,
    traffic_content: content,
    landing_path: window.location.pathname.startsWith("/") ? window.location.pathname.slice(0, 200) : "/"
  };

  try {
    window.sessionStorage.setItem(acquisitionSessionKey, JSON.stringify(context));
  } catch {
    // La atribución de sesión es auxiliar y puede degradar sin afectar al producto.
  }

  return context;
}
