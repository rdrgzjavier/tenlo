import { redirect } from "next/navigation";
import PrivateAreaUnavailable from "@/components/PrivateAreaUnavailable";
import PublishForm from "@/components/PublishForm";
import { createSupabaseServerClient, hasSupabaseServerConfig } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  if (!hasSupabaseServerConfig()) return <PrivateAreaUnavailable />;

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login?next=/publicar");

  return <PublishForm />;
}
