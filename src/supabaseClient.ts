import { createClient } from "@supabase/supabase-js";
import { Context } from "hono";
import "dotenv/config";

// Supabase Configuration
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to return the Supabase client (useful for RLS)
export const createSupabaseClient = (c: Context) => {
  return supabase;
};
