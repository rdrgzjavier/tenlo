export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "tenlocerca@gmail.com";
export const BRAND = {
  name: "Tenlo",
  claim: "Servicios y recursos para familias, organizados por zona.",
  ink: "#171717",
  soft: "#F6F4F1",
  purple: "#5325E0",
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
  <div style="margin:0;background:${BRAND.soft};padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink}">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#fff;border:1px solid #e7e2dc;border-radius:20px;overflow:hidden">
          <tr><td style="padding:28px 24px 20px;text-align:center;border-bottom:1px solid #eeeae5">
            <img src="${BRAND.siteUrl}/brand/tenlo-isotipo-192.png" alt="Tenlo" width="56" height="56" style="display:block;margin:0 auto 12px;border:0" />
            <div style="font-size:26px;font-weight:800;color:${BRAND.purple}">${BRAND.name}</div>
            <div style="margin-top:8px;color:#6c6670;font-size:14px;line-height:1.5">${BRAND.claim}</div>
          </td></tr>
          <tr><td style="padding:28px 24px">
            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;color:${BRAND.ink}">${escapeHtml(title)}</h1>
            ${body}
          </td></tr>
          <tr><td style="padding:20px 24px;background:#faf9f7;border-top:1px solid #eeeae5;text-align:center;font-size:13px;line-height:1.6;color:#77717a">
            Tenlo · Servicios y recursos para familias<br />
            <a href="${BRAND.siteUrl}" style="color:${BRAND.purple};text-decoration:none">tenlo.es</a> ·
            <a href="mailto:solicitudes@tenlo.es" style="color:${BRAND.purple};text-decoration:none">solicitudes@tenlo.es</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
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
