-- Create patient profiles table with RLS
CREATE TABLE public.patient_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  condition text NOT NULL,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on patient_profiles
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;

-- Patients can view their own profile
CREATE POLICY "Users can view their own patient profile"
ON public.patient_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Patients can insert their own profile
CREATE POLICY "Users can insert their own patient profile"
ON public.patient_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Patients can update their own profile
CREATE POLICY "Users can update their own patient profile"
ON public.patient_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Patients can delete their own profile
CREATE POLICY "Users can delete their own patient profile"
ON public.patient_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_patient_profiles_updated_at
BEFORE UPDATE ON public.patient_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update clinical_trials RLS to require authentication
DROP POLICY IF EXISTS "Researchers can view all trials" ON public.clinical_trials;
CREATE POLICY "Authenticated users can view trials"
ON public.clinical_trials
FOR SELECT
USING (auth.uid() IS NOT NULL);