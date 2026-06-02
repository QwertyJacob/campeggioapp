import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Registrazione = {
  nome: string;
  cognome: string;
  eta: number;
  date_disponibili: string[];
  area_campeggio: string;
  area_altro_dettaglio?: string;
  ruolo: string;
};
