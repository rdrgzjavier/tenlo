"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileChallengeProps = {
  action: "login" | "registration" | "password_recovery";
  onTokenChange: (token: string | null) => void;
  resetKey?: number;
};

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
const scriptId = "tenlo-turnstile-script";

export const turnstileEnabled = Boolean(siteKey);

export default function TurnstileChallenge({ action, onTokenChange, resetKey = 0 }: TurnstileChallengeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let widgetId: string | null = null;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetId) return;
      widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme: "light",
        size: "flexible",
        callback: (token: string) => onTokenChange(token),
        "expired-callback": () => onTokenChange(null),
        "error-callback": () => onTokenChange(null)
      });
    };

    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    if (window.turnstile) render();
    else script.addEventListener("load", render, { once: true });

    return () => {
      cancelled = true;
      script?.removeEventListener("load", render);
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      onTokenChange(null);
    };
  }, [action, onTokenChange, resetKey]);

  if (!siteKey) return null;

  return (
    <div className="rounded-2xl border border-line bg-soft p-3">
      <p className="mb-2 text-xs font-semibold text-muted">Comprobación de seguridad</p>
      <div ref={containerRef} className="min-h-[65px]" />
    </div>
  );
}
