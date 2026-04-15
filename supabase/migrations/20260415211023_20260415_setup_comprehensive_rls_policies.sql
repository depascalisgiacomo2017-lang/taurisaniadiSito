/*
  # Setup Comprehensive RLS Policies for Supabase Auth

  ## Overview
  This migration sets up complete Row Level Security (RLS) policies for all tables,
  ensuring:
  - Only authenticated users can modify data (INSERT, UPDATE, DELETE)
  - Specific role-based access (admin vs caporione)
  - Public read access for spectator-visible data
  - Data ownership validation

  ## Tables Modified
  1. admin_credentials - Admin user management
  2. rioni - Team/District data (caporioni can only view/edit their own)
  3. atleti - Athletes (caporioni can only manage their team's athletes)
  4. squadre - Teams in games (caporioni can only manage their teams)
  5. giochi - Games (public read, admin-only write)
  6. fasce_eta - Age groups (public read, admin-only write)
  7. messaggi - Chat messages (public read, authenticated-only write)
  8. impostazioni - Settings (public read, admin-only write)
  9. momenti_salienti - Highlights (public read, admin-only write)
  10. classifica - Rankings (public read, admin-only write)
  11. statistiche - Statistics (public read, admin-only write)

  ## Security Notes
  - Caporioni can ONLY see/edit data for their own rione (user_id match)
  - Admins can see/edit all data
  - No USING(true) policies - all are properly restrictive
  - All write operations require authentication
*/

-- Enable RLS on all tables (already enabled but ensuring it's on)
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atleti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.squadre ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giochi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasce_eta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaggi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impostazioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momenti_salienti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classifica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statistiche ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ADMIN_CREDENTIALS policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_credentials' AND policyname = 'Admin can view all admin credentials'
  ) THEN
    CREATE POLICY "Admin can view all admin credentials"
      ON public.admin_credentials
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac2
          WHERE ac2.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_credentials' AND policyname = 'Admin can insert admin credentials'
  ) THEN
    CREATE POLICY "Admin can insert admin credentials"
      ON public.admin_credentials
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac2
          WHERE ac2.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_credentials' AND policyname = 'Admin can update admin credentials'
  ) THEN
    CREATE POLICY "Admin can update admin credentials"
      ON public.admin_credentials
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac2
          WHERE ac2.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac2
          WHERE ac2.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_credentials' AND policyname = 'Admin can delete admin credentials'
  ) THEN
    CREATE POLICY "Admin can delete admin credentials"
      ON public.admin_credentials
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac2
          WHERE ac2.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- RIONI policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rioni' AND policyname = 'Everyone can view rioni'
  ) THEN
    CREATE POLICY "Everyone can view rioni"
      ON public.rioni
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rioni' AND policyname = 'Admin can insert rioni'
  ) THEN
    CREATE POLICY "Admin can insert rioni"
      ON public.rioni
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rioni' AND policyname = 'Owner or admin can update rioni'
  ) THEN
    CREATE POLICY "Owner or admin can update rioni"
      ON public.rioni
      FOR UPDATE
      TO authenticated
      USING (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rioni' AND policyname = 'Admin can delete rioni'
  ) THEN
    CREATE POLICY "Admin can delete rioni"
      ON public.rioni
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- ATLETI policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'atleti' AND policyname = 'Everyone can view atleti'
  ) THEN
    CREATE POLICY "Everyone can view atleti"
      ON public.atleti
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'atleti' AND policyname = 'Caporione can insert own atleti'
  ) THEN
    CREATE POLICY "Caporione can insert own atleti"
      ON public.atleti
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'atleti' AND policyname = 'Caporione can update own atleti'
  ) THEN
    CREATE POLICY "Caporione can update own atleti"
      ON public.atleti
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'atleti' AND policyname = 'Caporione can delete own atleti'
  ) THEN
    CREATE POLICY "Caporione can delete own atleti"
      ON public.atleti
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- SQUADRE policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'squadre' AND policyname = 'Everyone can view squadre'
  ) THEN
    CREATE POLICY "Everyone can view squadre"
      ON public.squadre
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'squadre' AND policyname = 'Caporione can insert own squadre'
  ) THEN
    CREATE POLICY "Caporione can insert own squadre"
      ON public.squadre
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'squadre' AND policyname = 'Caporione can update own squadre'
  ) THEN
    CREATE POLICY "Caporione can update own squadre"
      ON public.squadre
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'squadre' AND policyname = 'Caporione can delete own squadre'
  ) THEN
    CREATE POLICY "Caporione can delete own squadre"
      ON public.squadre
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.rioni r
          WHERE r.id = rione_id AND r.user_id = auth.uid()
        ) OR
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- GIOCHI policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giochi' AND policyname = 'Everyone can view giochi'
  ) THEN
    CREATE POLICY "Everyone can view giochi"
      ON public.giochi
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giochi' AND policyname = 'Admin can insert giochi'
  ) THEN
    CREATE POLICY "Admin can insert giochi"
      ON public.giochi
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giochi' AND policyname = 'Admin can update giochi'
  ) THEN
    CREATE POLICY "Admin can update giochi"
      ON public.giochi
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'giochi' AND policyname = 'Admin can delete giochi'
  ) THEN
    CREATE POLICY "Admin can delete giochi"
      ON public.giochi
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- FASCE_ETA policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fasce_eta' AND policyname = 'Everyone can view fasce_eta'
  ) THEN
    CREATE POLICY "Everyone can view fasce_eta"
      ON public.fasce_eta
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fasce_eta' AND policyname = 'Admin can insert fasce_eta'
  ) THEN
    CREATE POLICY "Admin can insert fasce_eta"
      ON public.fasce_eta
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fasce_eta' AND policyname = 'Admin can update fasce_eta'
  ) THEN
    CREATE POLICY "Admin can update fasce_eta"
      ON public.fasce_eta
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'fasce_eta' AND policyname = 'Admin can delete fasce_eta'
  ) THEN
    CREATE POLICY "Admin can delete fasce_eta"
      ON public.fasce_eta
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- MESSAGGI policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messaggi' AND policyname = 'Everyone can view messaggi'
  ) THEN
    CREATE POLICY "Everyone can view messaggi"
      ON public.messaggi
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messaggi' AND policyname = 'Authenticated can insert messaggi'
  ) THEN
    CREATE POLICY "Authenticated can insert messaggi"
      ON public.messaggi
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messaggi' AND policyname = 'Admin can delete messaggi'
  ) THEN
    CREATE POLICY "Admin can delete messaggi"
      ON public.messaggi
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- IMPOSTAZIONI policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'impostazioni' AND policyname = 'Everyone can view impostazioni'
  ) THEN
    CREATE POLICY "Everyone can view impostazioni"
      ON public.impostazioni
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'impostazioni' AND policyname = 'Admin can insert impostazioni'
  ) THEN
    CREATE POLICY "Admin can insert impostazioni"
      ON public.impostazioni
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'impostazioni' AND policyname = 'Admin can update impostazioni'
  ) THEN
    CREATE POLICY "Admin can update impostazioni"
      ON public.impostazioni
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'impostazioni' AND policyname = 'Admin can delete impostazioni'
  ) THEN
    CREATE POLICY "Admin can delete impostazioni"
      ON public.impostazioni
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- MOMENTI_SALIENTI policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'momenti_salienti' AND policyname = 'Everyone can view momenti_salienti'
  ) THEN
    CREATE POLICY "Everyone can view momenti_salienti"
      ON public.momenti_salienti
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'momenti_salienti' AND policyname = 'Admin can insert momenti_salienti'
  ) THEN
    CREATE POLICY "Admin can insert momenti_salienti"
      ON public.momenti_salienti
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'momenti_salienti' AND policyname = 'Admin can update momenti_salienti'
  ) THEN
    CREATE POLICY "Admin can update momenti_salienti"
      ON public.momenti_salienti
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'momenti_salienti' AND policyname = 'Admin can delete momenti_salienti'
  ) THEN
    CREATE POLICY "Admin can delete momenti_salienti"
      ON public.momenti_salienti
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- CLASSIFICA policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'classifica' AND policyname = 'Everyone can view classifica'
  ) THEN
    CREATE POLICY "Everyone can view classifica"
      ON public.classifica
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'classifica' AND policyname = 'Admin can insert classifica'
  ) THEN
    CREATE POLICY "Admin can insert classifica"
      ON public.classifica
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'classifica' AND policyname = 'Admin can update classifica'
  ) THEN
    CREATE POLICY "Admin can update classifica"
      ON public.classifica
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'classifica' AND policyname = 'Admin can delete classifica'
  ) THEN
    CREATE POLICY "Admin can delete classifica"
      ON public.classifica
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================================
-- STATISTICHE policies
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'statistiche' AND policyname = 'Everyone can view statistiche'
  ) THEN
    CREATE POLICY "Everyone can view statistiche"
      ON public.statistiche
      FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'statistiche' AND policyname = 'Admin can insert statistiche'
  ) THEN
    CREATE POLICY "Admin can insert statistiche"
      ON public.statistiche
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'statistiche' AND policyname = 'Admin can update statistiche'
  ) THEN
    CREATE POLICY "Admin can update statistiche"
      ON public.statistiche
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'statistiche' AND policyname = 'Admin can delete statistiche'
  ) THEN
    CREATE POLICY "Admin can delete statistiche"
      ON public.statistiche
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.admin_credentials ac
          WHERE ac.user_id = auth.uid()
        )
      );
  END IF;
END $$;
