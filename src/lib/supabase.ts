import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  role: 'owner' | 'worker';
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  frame_size: string;
  size_unit: string;
  quantity: number;
  quality: string;
  order_date: string;
  delivery_date: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
