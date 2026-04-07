/*
  # Add Admin Account and New Features

  1. New Tables
    - `admin_credentials` - Stores admin login credentials
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password` (text)
      - `updated_at` (timestamp)
    
    - `fasce_eta` - Age groups configuration
      - `id` (uuid, primary key)
      - `nome` (text) - e.g., "Under 18", "18-30", "30-45", "45+"
      - `min_eta` (integer)
      - `max_eta` (integer, nullable)
      - `created_at` (timestamp)

  2. Changes to Existing Tables
    - Add `fascia_eta_id` to `atleti` table
    - Add `min_donne` to global settings
    - Add `live_stream_url` to `giochi` table
    - Add `live_stream_enabled` to global settings

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated access
*/

-- Admin credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read own credentials"
  ON admin_credentials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update own credentials"
  ON admin_credentials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default admin credentials
INSERT INTO admin_credentials (username, password)
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- Age groups table
CREATE TABLE IF NOT EXISTS fasce_eta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  min_eta integer NOT NULL,
  max_eta integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fasce_eta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read age groups"
  ON fasce_eta
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert age groups"
  ON fasce_eta
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update age groups"
  ON fasce_eta
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin can delete age groups"
  ON fasce_eta
  FOR DELETE
  TO authenticated
  USING (true);

-- Add fascia_eta_id to atleti if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'atleti' AND column_name = 'fascia_eta_id'
  ) THEN
    ALTER TABLE atleti ADD COLUMN fascia_eta_id uuid REFERENCES fasce_eta(id);
  END IF;
END $$;

-- Add live_stream_url to giochi if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'giochi' AND column_name = 'live_stream_url'
  ) THEN
    ALTER TABLE giochi ADD COLUMN live_stream_url text;
  END IF;
END $$;

-- Insert default age groups
INSERT INTO fasce_eta (nome, min_eta, max_eta)
VALUES 
  ('Under 18', 0, 17),
  ('18-30', 18, 30),
  ('31-45', 31, 45),
  ('Over 45', 46, NULL)
ON CONFLICT DO NOTHING;

-- Add settings for minimum women requirement
INSERT INTO impostazioni (key, value)
VALUES ('min_donne_default', '0'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO impostazioni (key, value)
VALUES ('live_stream_enabled', 'false'::jsonb)
ON CONFLICT (key) DO NOTHING;
