import type { Role } from "@/lib/types";

const roleStyles: Record<Role, { shape: string; bg: string; label: string }> = {
  family: { shape: "rounded-full", bg: "bg-lavender text-ink", label: "Familia" },
  provider: { shape: "rounded-2xl", bg: "bg-petrol/10 text-petrol", label: "Profesional" },
  center: { shape: "rounded-2xl", bg: "bg-sage/15 text-sage", label: "Centro educativo" },
  admin: { shape: "rounded-2xl", bg: "bg-soft text-slatecopy", label: "Equipo Tenlo" }
};

export default function ProfileAvatar({ name, role, image }: { name: string; role: Role; image?: string }) {
  const style = roleStyles[role];
  const initials = name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  if (image && role !== "family") {
    // Provider logos can come from owner-confirmed external hosts that are not known at build time.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={`Logo de ${name}`} className={`h-12 w-12 object-cover ${style.shape}`} />;
  }

  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center text-sm font-extrabold ${style.shape} ${style.bg}`} aria-label={`${style.label}: ${name}`}>
      {initials || "T"}
    </span>
  );
}
