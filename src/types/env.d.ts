declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    NEXT_PUBLIC_APP_URL: string;
    NEXT_PUBLIC_BRAND_NAME: string;
    INNGEST_EVENT_KEY?: string;
    INNGEST_SIGNING_KEY?: string;
    GOOGLE_PLACES_API_KEY?: string;
    OPENAI_API_KEY?: string;
    OPENAI_MODEL?: string;
    CRON_SECRET?: string;
  }
}
