export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tenlocerca@gmail.com";
export const BRAND = {
  name: "Tenlo",
  claim: "Todo lo que necesitas alrededor del colegio, filtrado por tu zona y tu centro.",
  ink: "#0F172A",
  soft: "#FCF8FA",
  petrol: "#215B68",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://tenlo.es"
};

type Mail = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function tenloEmailShell(title: string, body: string) {
  return `
  <div style="margin:0;background:${BRAND.soft};padding:28px;font-family:Arial,sans-serif;color:${BRAND.ink}">
    <div style="max-width:620px;margin:0 auto;background:#fff;border:1px solid #E2E8F0;border-radius:16px;overflow:hidden">
      <div style="padding:24px;border-bottom:1px solid #E2E8F0">
        <div style="display:flex;align-items:center;gap:12px">
          <img src="${BRAND.siteUrl}/brand/tenlo-isotipo-180.png" alt="Tenlo" width="36" height="36" style="display:block;border-radius:8px" />
          <div style="font-size:24px;font-weight:800;color:${BRAND.ink}">${BRAND.name}</div>
        </div>
        <div style="margin-top:8px;color:#475569;font-size:14px;line-height:1.5">${BRAND.claim}</div>
      </div>
      <div style="padding:24px">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25;color:${BRAND.ink}">${title}</h1>
        ${body}
      </div>
    </div>
  </div>`;
}

export function rows(data: Record<string, unknown>) {
  return Object.entries(data).map(([key, value]) => `<p style="margin:0 0 10px"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value || "No indicado")}</p>`).join("");
}

export async function sendMail(mail: Mail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Tenlo <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("Email no enviado: falta RESEND_API_KEY", mail.subject);
    return { sent: false, reason: "missing_email_provider" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: mail.to, subject: mail.subject, html: mail.html, reply_to: mail.replyTo })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`No se pudo enviar el email: ${error}`);
  }

  return { sent: true };
}
