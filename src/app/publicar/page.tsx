import { redirect } from "next/navigation";
import PublishForm from "@/components/PublishForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login?next=/publicar");

  return <PublishForm />;
}
