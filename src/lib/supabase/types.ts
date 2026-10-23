export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProfileRole =
  | "family"
  | "school"
  | "nursery"
  | "shop"
  | "sports_center"
  | "activity_provider"
  | "technology_provider"
  | "transport_provider"
  | "event_provider"
  | "teacher"
  | "childcare"
  | "health_wellness"
  | "camp_provider"
  | "community_org"
  | "tenlo_admin";

export type ModerationStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected"
  | "archived";

export type TrustLevel = "collected" | "managed" | "verified" | "official";

type ProfileRow = {
  id: string;
  role: ProfileRole;
  display_name: string;
  contact_email: string | null;
  phone: string | null;
  municipality: string | null;
  related_center_name: string | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  marketing_consent_source: string | null;
  marketing_consent_withdrawn_at: string | null;
  interests: string[];
  public_name: string | null;
  status: ModerationStatus;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
};

type ProfileInsert = {
  id: string;
  role?: ProfileRole;
  display_name: string;
  contact_email?: string | null;
  phone?: string | null;
  municipality?: string | null;
  related_center_name?: string | null;
  marketing_consent?: boolean;
  marketing_consent_at?: string | null;
  marketing_consent_source?: string | null;
  marketing_consent_withdrawn_at?: string | null;
  interests?: string[];
  public_name?: string | null;
  status?: ModerationStatus;
  review_notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ServiceRow = {
  id: string;
  owner_id: string | null;
  slug: string;
  title: string;
  category_id: string;
  municipality: string;
  status: ModerationStatus;
  trust_level: TrustLevel;
  tags: string[];
  created_at: string;
  updated_at: string;
};

type BusinessProfileRow = {
  id: string;
  owner_id: string;
  business_name: string;
  legal_name: string | null;
  website: string | null;
  address: string | null;
  municipality: string | null;
  service_area: string | null;
  category: string;
  subtype: string | null;
  trust_level: TrustLevel;
  status: ModerationStatus;
  source_name: string | null;
  source_url: string | null;
  last_reviewed: string | null;
  details: Json;
  claim_status: string;
  commercial_plan: string;
  completeness_percent: number;
  accepts_requests: boolean;
  contact_preferences: string[];
  inactive_reason: string | null;
  external_key: string | null;
  description: string | null;
  phone: string | null;
  contact_email: string | null;
  tags: string[];
  image_url: string | null;
  record_origin: string;
  latitude: number | null;
  longitude: number | null;
  location_visibility: string;
  service_municipalities: string[];
  location_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type BusinessProfileInsert = {
  id?: string;
  owner_id: string;
  business_name: string;
  legal_name?: string | null;
  website?: string | null;
  address?: string | null;
  municipality?: string | null;
  service_area?: string | null;
  category: string;
  subtype?: string | null;
  trust_level?: TrustLevel;
  status?: ModerationStatus;
  source_name?: string | null;
  source_url?: string | null;
  last_reviewed?: string | null;
  details?: Json;
  claim_status?: string;
  commercial_plan?: string;
  completeness_percent?: number;
  accepts_requests?: boolean;
  contact_preferences?: string[];
  inactive_reason?: string | null;
  external_key?: string | null;
  description?: string | null;
  phone?: string | null;
  contact_email?: string | null;
  tags?: string[];
  image_url?: string | null;
  record_origin?: string;
  latitude?: number | null;
  longitude?: number | null;
  location_visibility?: string;
  service_municipalities?: string[];
  location_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

type ServiceInsert = {
  id?: string;
  owner_id?: string | null;
  slug: string;
  title: string;
  category_id: string;
  municipality: string;
  status?: ModerationStatus;
  trust_level?: TrustLevel;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
};

type ClaimRequestRow = {
  id: string;
  user_id: string | null;
  entity_type: "center" | "provider" | "community";
  entity_id: string;
  entity_name: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  role_description: string;
  corrections: string | null;
  official_website: string | null;
  image_url: string | null;
  status: ModerationStatus;
  created_at: string;
  updated_at: string;
};

type ClaimRequestInsert = {
  id?: string;
  user_id?: string | null;
  entity_type: ClaimRequestRow["entity_type"];
  entity_id: string;
  entity_name: string;
  requester_name: string;
  requester_email: string;
  requester_phone?: string | null;
  role_description: string;
  corrections?: string | null;
  official_website?: string | null;
  image_url?: string | null;
  status?: ModerationStatus;
  created_at?: string;
  updated_at?: string;
};

type FeedbackRequestRow = {
  id: string;
  user_id: string | null;
  context: string | null;
  item_id: string | null;
  name: string | null;
  email: string | null;
  message: string;
  status: ModerationStatus;
  created_at: string;
  updated_at: string;
};

type FeedbackRequestInsert = {
  id?: string;
  user_id?: string | null;
  context?: string | null;
  item_id?: string | null;
  name?: string | null;
  email?: string | null;
  message: string;
  status?: ModerationStatus;
  created_at?: string;
  updated_at?: string;
};

type AdminQueueNoteRow = {
  id: string;
  queue: "claim" | "connection" | "submission" | "feedback" | "business_profile";
  record_id: string;
  note: string;
  created_by: string | null;
  created_at: string;
};

type AdminQueueNoteInsert = {
  id?: string;
  queue: AdminQueueNoteRow["queue"];
  record_id: string;
  note: string;
  created_by: string;
  created_at?: string;
};

type ConnectionFeedbackRow = {
  id: string;
  request_id: string;
  family_id: string;
  useful: boolean;
  outcome: "information" | "conversation" | "proposal" | "booking" | "hired" | "not_progressed";
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      business_profiles: {
        Row: BusinessProfileRow;
        Insert: BusinessProfileInsert;
        Update: Partial<BusinessProfileRow>;
        Relationships: [];
      };
      services: {
        Row: ServiceRow;
        Insert: ServiceInsert;
        Update: Partial<ServiceRow>;
        Relationships: [];
      };
      claim_requests: {
        Row: ClaimRequestRow;
        Insert: ClaimRequestInsert;
        Update: Partial<ClaimRequestRow>;
        Relationships: [];
      };
      feedback_requests: {
        Row: FeedbackRequestRow;
        Insert: FeedbackRequestInsert;
        Update: Partial<FeedbackRequestRow>;
        Relationships: [];
      };
      admin_queue_notes: {
        Row: AdminQueueNoteRow;
        Insert: AdminQueueNoteInsert;
        Update: Partial<AdminQueueNoteRow>;
        Relationships: [];
      };
      connection_feedback: {
        Row: ConnectionFeedbackRow;
        Insert: Omit<ConnectionFeedbackRow, "id" | "created_at" | "updated_at">;
        Update: Partial<Pick<ConnectionFeedbackRow, "useful" | "outcome">>;
        Relationships: [];
      };
      data_export_audit: {
        Row: {
          id: string;
          actor_id: string;
          export_scope: "admin_operation" | "account_portability";
          record_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          export_scope: "admin_operation" | "account_portability";
          record_count?: number;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
      moderation_status: ModerationStatus;
      trust_level: TrustLevel;
    };
  };
};
