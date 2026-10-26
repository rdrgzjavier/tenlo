import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/area-personal";
}

const supportedEmailOtpTypes = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup"
]);

function emailOtpType(value: string | null): EmailOtpType | null {
  return value && supportedEmailOtpTypes.has(value as EmailOtpType)
    ? value as EmailOtpType
    : null;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = emailOtpType(requestUrl.searchParams.get("type"));
  const next = safeNextPath(requestUrl.searchParams.get("next"));

  if (code || (tokenHash && type)) {
    const supabase = await createSupabaseServerClient();
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type! });

    if (error) {
      const destination = new URL(next, requestUrl.origin);
      destination.searchParams.set("error", "invalid_link");
      return NextResponse.redirect(destination);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
