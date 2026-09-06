-- =====================================================================
-- Pediatric ASD Screening Decision Support System (CDSS)
-- Supabase PostgreSQL Schema, RBAC Profiles & Storage Setup
-- Developed under guidance of Prof. Shyam Kamal, IIT BHU
-- =====================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Role-Based Access Control (RBAC) Types & Profiles Table ───────

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('parent', 'doctor', 'admin');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    role user_role NOT NULL DEFAULT 'parent',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on profile role for fast RBAC lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Function to handle auto-creation of profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role public.user_role;
    raw_role TEXT;
BEGIN
    raw_role := NEW.raw_user_meta_data->>'role';
    IF raw_role = 'doctor' THEN
        assigned_role := 'doctor'::public.user_role;
    ELSIF raw_role = 'admin' THEN
        assigned_role := 'admin'::public.user_role;
    ELSE
        assigned_role := 'parent'::public.user_role;
    END IF;

    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
        NEW.email,
        assigned_role
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger firing on every new Supabase Auth registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── 2. Patients Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,                       -- e.g. ASD-PT001, ASD-98F2A1
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Data ownership
    name TEXT NOT NULL,                        -- Child's name or pseudonym
    date_of_birth DATE NOT NULL,               -- Used to dynamically compute exact age
    biological_sex TEXT NOT NULL CHECK (biological_sex IN ('male', 'female', 'other')),
    parent_name TEXT,                          -- Parent / caregiver name
    contact_email TEXT,                        -- Guardian email
    contact_phone TEXT,                        -- Guardian phone number
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id column exists if table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.patients ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ─── 3. Screenings Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.screenings (
    id TEXT PRIMARY KEY,                       -- e.g. SCR-ASD-PT001 or UUID
    patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Parent user ownership
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    risk_tier TEXT NOT NULL DEFAULT 'typical' CHECK (risk_tier IN ('typical', 'moderate', 'elevated')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('uploaded', 'analyzing', 'ai_complete', 'under_review', 'pending', 'reviewed', 'referred')),
    clinical_notes JSONB DEFAULT '{"notes": "", "diagnosticImpressions": "", "referral": "none", "signedOff": false, "signedAt": null, "reviewedBy": ""}'::jsonb,
    isaa_scores JSONB DEFAULT '{"items": {}, "aiPrefilledItems": []}'::jsonb,
    biomarkers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id column exists if table was created previously
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'screenings' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.screenings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ─── 4. Videos Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,                       -- e.g. VID-XXXXXX or UUID
    screening_id TEXT NOT NULL REFERENCES public.screenings(id) ON DELETE CASCADE,
    protocol_number INT NOT NULL CHECK (protocol_number IN (1, 2, 3)),
    cloud_storage_url TEXT NOT NULL,          -- Direct public Supabase Storage URL
    file_name TEXT,                            -- Original or saved filename
    analysis_result JSONB DEFAULT '{}'::jsonb, -- Telemetry, ISAA flags & CV metrics
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Indices for Performant Querying ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_user_id ON public.screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_patient_id ON public.screenings(patient_id);
CREATE INDEX IF NOT EXISTS idx_screenings_submission_date ON public.screenings(submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_screenings_risk_tier ON public.screenings(risk_tier);
CREATE INDEX IF NOT EXISTS idx_screenings_status ON public.screenings(status);
CREATE INDEX IF NOT EXISTS idx_videos_screening_id ON public.videos(screening_id);

-- ─── 6. Row-Level Security (RLS) Policies ───────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can view their own profile; clinicians/admins can view all
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
    CREATE POLICY "Users can read own profile"
        ON public.profiles FOR SELECT
        TO authenticated
        USING (auth.uid() = id);

    DROP POLICY IF EXISTS "Clinicians and Admins can read all profiles" ON public.profiles;
    CREATE POLICY "Clinicians and Admins can read all profiles"
        ON public.profiles FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('doctor', 'admin')
            )
        );

    DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
    CREATE POLICY "Admins can update any profile"
        ON public.profiles FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'admin'
            )
        );

    DROP POLICY IF EXISTS "Allow user to insert own profile fallback" ON public.profiles;
    CREATE POLICY "Allow user to insert own profile fallback"
        ON public.profiles FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = id);
END $$;

-- Patients & Screenings: Parents see only their submissions; Clinicians & Admins see all
DO $$
BEGIN
    DROP POLICY IF EXISTS "Parents manage own patients" ON public.patients;
    CREATE POLICY "Parents manage own patients"
        ON public.patients FOR ALL
        TO authenticated
        USING (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('doctor', 'admin')
            )
        )
        WITH CHECK (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('doctor', 'admin')
            )
        );

    DROP POLICY IF EXISTS "Parents manage own screenings" ON public.screenings;
    CREATE POLICY "Parents manage own screenings"
        ON public.screenings FOR ALL
        TO authenticated
        USING (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('doctor', 'admin')
            )
        )
        WITH CHECK (
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role IN ('doctor', 'admin')
            )
        );

    DROP POLICY IF EXISTS "Videos access matching screening access" ON public.videos;
    CREATE POLICY "Videos access matching screening access"
        ON public.videos FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.screenings s
                WHERE s.id = videos.screening_id AND (
                    s.user_id = auth.uid() OR
                    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor', 'admin'))
                )
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.screenings s
                WHERE s.id = videos.screening_id AND (
                    s.user_id = auth.uid() OR
                    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('doctor', 'admin'))
                )
            )
        );
END $$;

-- ─── 7. Supabase Storage Bucket Setup ────────────────────────────────
-- Insert the public storage bucket for video recordings ('videos')
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('screening-videos', 'screening-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Policy: Allow public read access to videos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Videos'
    ) THEN
        CREATE POLICY "Public Access for Videos"
        ON storage.objects FOR SELECT
        USING (bucket_id IN ('videos', 'screening-videos'));
    END IF;
END $$;

-- Storage Policy: Allow upload to videos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow Video Uploads'
    ) THEN
        CREATE POLICY "Allow Video Uploads"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id IN ('videos', 'screening-videos'));
    END IF;
END $$;
