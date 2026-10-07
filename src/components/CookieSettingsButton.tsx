"use client";

export default function CookieSettingsButton() {
  const openSettings = () => window.Cookiebot?.renew?.();

  return (
    <button type="button" className="btn-secondary mt-5" onClick={openSettings}>
      Modificar preferencias de cookies
    </button>
  );
}
