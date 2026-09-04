-- =====================================================================
-- Pediatric ASD Screening Decision Support System (CDSS)
-- Supabase PostgreSQL Schema & Storage Setup
-- Developed under guidance of Prof. Shyam Kamal, IIT BHU
-- =====================================================================

-- Enable UUID extension if not present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Patients Table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,                       -- e.g. ASD-PT001, ASD-98F2A1
    name TEXT NOT NULL,                        -- Child's name or pseudonym
    date_of_birth DATE NOT NULL,               -- Used to dynamically compute exact age
    biological_sex TEXT NOT NULL CHECK (biological_sex IN ('male', 'female', 'other')),
    parent_name TEXT,                          -- Parent / caregiver name
    contact_email TEXT,                        -- Guardian email
    contact_phone TEXT,                        -- Guardian phone number
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Screenings Table ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS screenings (
    id TEXT PRIMARY KEY,                       -- e.g. SCR-ASD-PT001 or UUID
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    risk_tier TEXT NOT NULL DEFAULT 'typical' CHECK (risk_tier IN ('typical', 'moderate', 'elevated')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('uploaded', 'analyzing', 'ai_complete', 'under_review', 'pending', 'reviewed', 'referred')),
    clinical_notes JSONB DEFAULT '{"notes": "", "diagnosticImpressions": "", "referral": "none", "signedOff": false, "signedAt": null, "reviewedBy": ""}'::jsonb,
    isaa_scores JSONB DEFAULT '{"items": {}, "aiPrefilledItems": []}'::jsonb,
    biomarkers JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Videos Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,                       -- e.g. VID-XXXXXX or UUID
    screening_id TEXT NOT NULL REFERENCES screenings(id) ON DELETE CASCADE,
    protocol_number INT NOT NULL CHECK (protocol_number IN (1, 2, 3)),
    cloud_storage_url TEXT NOT NULL,          -- Direct public Supabase Storage URL
    file_name TEXT,                            -- Original or saved filename
    analysis_result JSONB DEFAULT '{}'::jsonb, -- Telemetry, ISAA flags & CV metrics
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Indices for Performant Querying ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_screenings_patient_id ON screenings(patient_id);
CREATE INDEX IF NOT EXISTS idx_screenings_submission_date ON screenings(submission_date DESC);
CREATE INDEX IF NOT EXISTS idx_screenings_risk_tier ON screenings(risk_tier);
CREATE INDEX IF NOT EXISTS idx_screenings_status ON screenings(status);
CREATE INDEX IF NOT EXISTS idx_videos_screening_id ON videos(screening_id);

-- ─── 5. Supabase Storage Bucket Setup ────────────────────────────────
-- Insert the screening-videos public storage bucket if not already created
INSERT INTO storage.buckets (id, name, public)
VALUES ('screening-videos', 'screening-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policy: Allow public read access to videos
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Screening Videos'
    ) THEN
        CREATE POLICY "Public Access for Screening Videos"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'screening-videos');
    END IF;
END $$;

-- Storage Policy: Allow service role / authenticated upload
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Allow Video Uploads'
    ) THEN
        CREATE POLICY "Allow Video Uploads"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'screening-videos');
    END IF;
END $$;
