"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError("No hemos podido cerrar la sesión. Inténtalo de nuevo.");
      setIsSigningOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-line bg-white px-5 py-3 font-bold text-slatecopy transition-colors hover:border-ink disabled:cursor-wait disabled:opacity-60"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        <LogOut size={19} aria-hidden />
        {isSigningOut ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
      {error ? <p className="mt-2 text-sm font-semibold text-coral" role="alert">{error}</p> : null}
    </div>
  );
}
