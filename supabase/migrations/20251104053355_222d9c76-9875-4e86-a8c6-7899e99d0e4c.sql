-- Create forum_questions table
CREATE TABLE public.forum_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.forum_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for forum questions
CREATE POLICY "Anyone can view forum questions" 
ON public.forum_questions 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create questions" 
ON public.forum_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" 
ON public.forum_questions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions" 
ON public.forum_questions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_forum_questions_updated_at
BEFORE UPDATE ON public.forum_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();