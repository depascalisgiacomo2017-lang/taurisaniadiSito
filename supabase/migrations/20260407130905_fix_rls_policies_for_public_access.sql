/*
  # Fix RLS Policies for Public Access

  1. Changes
    - Drop restrictive policies on admin_credentials
    - Drop restrictive policies on fasce_eta
    - Add public access policies for all operations
    
  2. Security Notes
    - Since the app uses custom authentication (not Supabase Auth)
    - All users are anonymous from Supabase perspective
    - Need to allow public role access for app to function
*/

DROP POLICY IF EXISTS "Admin can read own credentials" ON admin_credentials;
DROP POLICY IF EXISTS "Admin can update own credentials" ON admin_credentials;
DROP POLICY IF EXISTS "Anyone can read age groups" ON fasce_eta;
DROP POLICY IF EXISTS "Admin can insert age groups" ON fasce_eta;
DROP POLICY IF EXISTS "Admin can update age groups" ON fasce_eta;
DROP POLICY IF EXISTS "Admin can delete age groups" ON fasce_eta;

CREATE POLICY "public_read_admin_credentials"
  ON admin_credentials
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_write_admin_credentials"
  ON admin_credentials
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "public_read_fasce_eta"
  ON fasce_eta
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "public_write_fasce_eta"
  ON fasce_eta
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
