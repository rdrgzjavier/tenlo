"use client";

import Link from "next/link";
import { LogIn, MapPin, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import AnimatedLogo from "@/components/AnimatedLogo";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

const nav = [
  ["Centros", "/centros"],
  ["Servicios", "/servicios"],
  ["Comunidad", "/comunidad"]
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!hasSupabaseBrowserConfig()) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(Boolean(data.session));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const pageContent = [document.querySelector("main"), document.querySelector("footer")].filter(Boolean) as HTMLElement[];
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    pageContent.forEach((element) => {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    });
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      pageContent.forEach((element) => {
        element.removeAttribute("inert");
        element.removeAttribute("aria-hidden");
      });
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-[100] border-b border-line bg-panel/90 backdrop-blur-xl">
      <div className="page flex min-h-16 items-center justify-between gap-3">
        <Link href="/" className="shrink-0"><AnimatedLogo /></Link>
        <nav className="hidden min-w-0 items-center gap-5 lg:flex" aria-label="Principal">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-1 py-2 text-sm font-semibold text-slatecopy transition-colors hover:text-ink">
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/buscar?region=madrid" className="mr-3 inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-slatecopy transition-colors hover:text-ink lg:mr-5">
            <MapPin size={16} className="text-ink" aria-hidden />
            Madrid
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/area-personal" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-panel px-4 text-base font-bold text-slatecopy transition-colors hover:border-ink hover:text-ink">
                <UserRound size={16} aria-hidden />
                Área personal
              </Link>
              <Link href="/publicar" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-4 text-base font-bold text-white shadow-lift transition-colors hover:bg-ink/90">Publicar oferta</Link>
            </>
          ) : (
            <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-ink px-4 text-base font-bold text-white shadow-lift transition-colors hover:bg-ink/90">Iniciar sesión</Link>
          )}
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Link href={isLoggedIn ? "/area-personal" : "/login"} className="icon-button rounded-xl" aria-label={isLoggedIn ? "Área personal" : "Iniciar sesión"}>
            <UserRound size={20} />
          </Link>
          <button className="icon-button rounded-xl" onClick={() => setOpen((value) => !value)} aria-label="Abrir menú">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-[90] md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/30" aria-hidden />
          <nav className="relative grid gap-1 border-t border-line bg-panel px-5 py-4 shadow-soft" aria-label="Menú móvil" onClick={(event) => event.stopPropagation()}>
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="flex min-h-14 items-center rounded-2xl px-4 text-base font-semibold text-slatecopy transition-colors hover:bg-soft" onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
              <Link href="/buscar?region=madrid" className="flex min-h-14 items-center rounded-2xl px-4 text-base font-semibold text-slatecopy" onClick={() => setOpen(false)}>
                Madrid
              </Link>
              {isLoggedIn ? (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href="/area-personal" className="btn-secondary text-center" onClick={() => setOpen(false)}><UserRound size={16} />Área personal</Link>
                  <Link href="/publicar" className="btn-primary text-center" onClick={() => setOpen(false)}>Publicar oferta</Link>
                </div>
              ) : (
                <Link href="/login" className="btn-primary mt-2 text-center" onClick={() => setOpen(false)}><LogIn size={16} />Iniciar sesión</Link>
              )}
            </nav>
        </div>
      ) : null}
    </header>
  );
}
