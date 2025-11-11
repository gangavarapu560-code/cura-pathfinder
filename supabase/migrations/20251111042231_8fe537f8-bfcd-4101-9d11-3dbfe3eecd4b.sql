-- Create publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  researcher_id UUID NOT NULL,
  title TEXT NOT NULL,
  journal TEXT,
  year INTEGER,
  authors TEXT,
  doi TEXT,
  abstract TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view publications"
ON public.publications FOR SELECT
USING (true);

CREATE POLICY "Researchers can create their own publications"
ON public.publications FOR INSERT
WITH CHECK (auth.uid() = researcher_id);

CREATE POLICY "Researchers can update their own publications"
ON public.publications FOR UPDATE
USING (auth.uid() = researcher_id);

CREATE POLICY "Researchers can delete their own publications"
ON public.publications FOR DELETE
USING (auth.uid() = researcher_id);

-- Create forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.forum_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view comments"
ON public.forum_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.forum_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.forum_comments FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.forum_comments FOR DELETE
USING (auth.uid() = user_id);

-- Add bio field to researcher profiles
ALTER TABLE public.researcher_profiles
ADD COLUMN bio TEXT,
ADD COLUMN location TEXT,
ADD COLUMN website TEXT;

-- Add bio field to patient profiles
ALTER TABLE public.patient_profiles
ADD COLUMN bio TEXT;

-- Trigger for publications updated_at
CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for forum_comments updated_at
CREATE TRIGGER update_forum_comments_updated_at
BEFORE UPDATE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();