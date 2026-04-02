export const env = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
};

export function assertPublicEnv() {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Missing public Supabase environment variables.");
  }
}
