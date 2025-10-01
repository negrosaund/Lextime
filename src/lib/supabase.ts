import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  firm_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type Case = {
  id: string;
  user_id: string;
  case_number: string;
  case_name: string;
  court: string;
  client_name: string;
  description: string | null;
  status: 'active' | 'archived' | 'closed';
  created_at: string;
  updated_at: string;
};

export type Deadline = {
  id: string;
  case_id: string;
  user_id: string;
  title: string;
  deadline_type: 'filing' | 'hearing' | 'response' | 'appeal' | 'other';
  start_date: string;
  business_days: number;
  due_date: string;
  notes: string | null;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Reminder = {
  id: string;
  deadline_id: string;
  user_id: string;
  days_before: number;
  reminder_date: string;
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
};

export type Holiday = {
  id: string;
  user_id: string | null;
  holiday_date: string;
  name: string;
  is_national: boolean;
  created_at: string;
};

export type NotificationSettings = {
  id: string;
  user_id: string;
  email_enabled: boolean;
  default_reminders: number[];
  google_calendar_enabled: boolean;
  google_calendar_token: string | null;
  updated_at: string;
};
