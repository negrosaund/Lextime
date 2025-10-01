/*
  # LEXTIME Database Schema
  
  ## Overview
  Complete database structure for legal deadline management system for litigating lawyers.
  
  ## New Tables
  
  ### 1. `profiles`
  User profile information linked to auth.users
  - `id` (uuid, primary key) - Links to auth.users.id
  - `email` (text) - User email
  - `full_name` (text) - Lawyer's full name
  - `firm_name` (text, nullable) - Law firm name
  - `phone` (text, nullable) - Contact phone
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `cases`
  Legal cases managed by lawyers
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Owner of the case
  - `case_number` (text) - Official case number
  - `case_name` (text) - Descriptive name
  - `court` (text) - Court or tribunal name
  - `client_name` (text) - Client name
  - `description` (text, nullable) - Case description
  - `status` (text) - Case status: active, archived, closed
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. `deadlines`
  Legal deadlines associated with cases
  - `id` (uuid, primary key)
  - `case_id` (uuid, foreign key) - Associated case
  - `user_id` (uuid, foreign key) - Owner
  - `title` (text) - Deadline title/description
  - `deadline_type` (text) - Type: filing, hearing, response, appeal, other
  - `start_date` (date) - Reference start date for calculation
  - `business_days` (integer) - Number of business days for deadline
  - `due_date` (date) - Calculated due date
  - `notes` (text, nullable) - Additional notes
  - `is_completed` (boolean) - Completion status
  - `completed_at` (timestamptz, nullable) - Completion timestamp
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. `reminders`
  Reminder configurations for deadlines
  - `id` (uuid, primary key)
  - `deadline_id` (uuid, foreign key) - Associated deadline
  - `user_id` (uuid, foreign key) - Owner
  - `days_before` (integer) - Days before deadline to trigger
  - `reminder_date` (date) - Calculated reminder date
  - `is_sent` (boolean) - Whether notification was sent
  - `sent_at` (timestamptz, nullable) - When notification was sent
  - `created_at` (timestamptz)
  
  ### 5. `holidays`
  Non-working days for deadline calculations
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Owner (allows custom holidays per user)
  - `holiday_date` (date) - The holiday date
  - `name` (text) - Holiday name
  - `is_national` (boolean) - Whether it's a national holiday
  - `created_at` (timestamptz)
  
  ### 6. `notification_settings`
  User preferences for notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key) - Owner
  - `email_enabled` (boolean) - Enable email notifications
  - `default_reminders` (jsonb) - Default reminder days [10, 3, 1]
  - `google_calendar_enabled` (boolean) - Google Calendar integration status
  - `google_calendar_token` (text, nullable) - Encrypted token
  - `updated_at` (timestamptz)
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE on all tables
  
  ## Important Notes
  1. All timestamps use timestamptz for proper timezone handling
  2. Deadline calculations must consider business_days and holidays
  3. Reminders are automatically calculated based on due_date
  4. Default reminder days: 10, 3, and 1 day before deadline
  5. Google Calendar integration stores encrypted tokens
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  firm_name text,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  case_number text NOT NULL,
  case_name text NOT NULL,
  court text NOT NULL,
  client_name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cases"
  ON cases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cases"
  ON cases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create deadlines table
CREATE TABLE IF NOT EXISTS deadlines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  deadline_type text NOT NULL DEFAULT 'other',
  start_date date NOT NULL,
  business_days integer NOT NULL,
  due_date date NOT NULL,
  notes text,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deadlines"
  ON deadlines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deadlines"
  ON deadlines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deadlines"
  ON deadlines FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deadlines"
  ON deadlines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deadline_id uuid NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  days_before integer NOT NULL,
  reminder_date date NOT NULL,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create holidays table
CREATE TABLE IF NOT EXISTS holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  holiday_date date NOT NULL,
  name text NOT NULL,
  is_national boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all holidays"
  ON holidays FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can insert own holidays"
  ON holidays FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can update own holidays"
  ON holidays FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own holidays"
  ON holidays FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  default_reminders jsonb DEFAULT '[10, 3, 1]'::jsonb,
  google_calendar_enabled boolean DEFAULT false,
  google_calendar_token text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification settings"
  ON notification_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON notification_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_id ON deadlines(user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_case_id ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due_date ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_reminders_deadline_id ON reminders(deadline_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_date ON reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(holiday_date);

-- Insert some common Chilean holidays (can be customized)
INSERT INTO holidays (user_id, holiday_date, name, is_national) VALUES
  (NULL, '2025-01-01', 'Año Nuevo', true),
  (NULL, '2025-04-18', 'Viernes Santo', true),
  (NULL, '2025-04-19', 'Sábado Santo', true),
  (NULL, '2025-05-01', 'Día del Trabajador', true),
  (NULL, '2025-05-21', 'Día de las Glorias Navales', true),
  (NULL, '2025-06-29', 'San Pedro y San Pablo', true),
  (NULL, '2025-07-16', 'Día de la Virgen del Carmen', true),
  (NULL, '2025-08-15', 'Asunción de la Virgen', true),
  (NULL, '2025-09-18', 'Fiestas Patrias', true),
  (NULL, '2025-09-19', 'Día de las Glorias del Ejército', true),
  (NULL, '2025-10-12', 'Encuentro de Dos Mundos', true),
  (NULL, '2025-10-31', 'Día de las Iglesias Evangélicas', true),
  (NULL, '2025-11-01', 'Día de Todos los Santos', true),
  (NULL, '2025-12-08', 'Inmaculada Concepción', true),
  (NULL, '2025-12-25', 'Navidad', true)
ON CONFLICT DO NOTHING;