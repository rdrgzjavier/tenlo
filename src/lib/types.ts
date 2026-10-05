export type Role = "family" | "provider" | "center" | "admin";
export type ModerationStatus = "draft" | "pending_review" | "published" | "rejected" | "archived";
export type CenterType = "publico" | "concertado" | "privado";
export type ProviderPlan = "gratuito" | "destacado" | "premium";
export type TrustLevel = "collected" | "managed" | "verified" | "official";

export type Municipality = { id: string; name: string; slug: string; description: string; };
export type Category = { id: string; name: string; slug: string; description: string; seoTitle: string; seoDescription: string; };

export type Center = {
  id: string; slug: string; name: string; type: CenterType; stages: string[]; municipality: string; address: string; phone: string; email: string; website: string; languages: string[]; services: string[]; description: string; source: string; sourceUrl?: string; lastReviewed?: string; verificationStatus?: string; isPublicInformation?: boolean; religiousCharacter?: "catolico" | "laico" | "no indicado"; tags: string[]; image?: string; verified: boolean; trustLevel: TrustLevel;
};

export type Listing = {
  id: string; slug: string; userId: string; categoryId: string; centerId?: string; title: string; description: string; municipality: string; area: string; recommendedAgeMin?: number; recommendedAgeMax?: number; price?: number; priceLabel?: string; condition?: "nuevo" | "usado" | "buen estado"; availability?: string; sourceName?: string; sourceUrl?: string; lastReviewed?: string; verificationStatus?: string; isPublicInformation?: boolean; publicationType: "familia" | "proveedor" | "centro" | "comunidad"; status: ModerationStatus; verified: boolean; trustLevel: TrustLevel; image?: string; tags: string[]; details: Record<string, string>;
};

export type Provider = {
  id: string; userId: string; businessName: string; category: string; description: string; municipality: string; serviceArea: string; website: string; phone: string; email: string; sourceName?: string; sourceUrl?: string; lastReviewed?: string; verificationStatus?: string; isPublicInformation?: boolean; verified: boolean; trustLevel: TrustLevel; plan: ProviderPlan; tags: string[]; image?: string;
};

export type CommunityPost = { id: string; title: string; category: string; municipality: string; summary: string; status: ModerationStatus; };
export type CommunityInitiative = { id: string; name: string; url: string; municipality: string; summary: string; tags: string[]; image?: string; ctaLabel: string; };
