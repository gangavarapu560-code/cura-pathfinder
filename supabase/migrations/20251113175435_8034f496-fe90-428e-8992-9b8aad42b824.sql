-- Create favorites table for bookmarking trials, researchers, and publications
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('trial', 'researcher', 'publication')),
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own favorites"
ON public.favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
ON public.favorites FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
ON public.favorites FOR DELETE
USING (auth.uid() = user_id);

-- Add location to patient_profiles if not exists (for location-based filtering)
ALTER TABLE public.patient_profiles 
ALTER COLUMN location TYPE TEXT,
ALTER COLUMN location SET DEFAULT NULL;

-- Add location to clinical_trials for location-based search
ALTER TABLE public.clinical_trials 
ADD COLUMN IF NOT EXISTS location TEXT;