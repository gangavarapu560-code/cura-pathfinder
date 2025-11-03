-- Create clinical_trials table
CREATE TABLE public.clinical_trials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT,
  status TEXT DEFAULT 'recruiting',
  start_date DATE,
  end_date DATE,
  eligibility_criteria TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clinical_trials ENABLE ROW LEVEL SECURITY;

-- Create policies for clinical_trials
CREATE POLICY "Researchers can view all trials" 
ON public.clinical_trials 
FOR SELECT 
USING (true);

CREATE POLICY "Researchers can create their own trials" 
ON public.clinical_trials 
FOR INSERT 
WITH CHECK (auth.uid() = researcher_id);

CREATE POLICY "Researchers can update their own trials" 
ON public.clinical_trials 
FOR UPDATE 
USING (auth.uid() = researcher_id);

CREATE POLICY "Researchers can delete their own trials" 
ON public.clinical_trials 
FOR DELETE 
USING (auth.uid() = researcher_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_clinical_trials_updated_at
BEFORE UPDATE ON public.clinical_trials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();