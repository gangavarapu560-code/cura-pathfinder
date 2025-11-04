-- Create researcher profiles table
CREATE TABLE public.researcher_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialty TEXT,
  institution TEXT,
  interests TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.researcher_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for researcher profiles
CREATE POLICY "Anyone can view researcher profiles" 
ON public.researcher_profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.researcher_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.researcher_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
ON public.researcher_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_researcher_profiles_updated_at
BEFORE UPDATE ON public.researcher_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create collaboration_requests table
CREATE TABLE public.collaboration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_user_id UUID NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT different_users CHECK (from_user_id != to_user_id),
  CONSTRAINT unique_request UNIQUE (from_user_id, to_user_id)
);

-- Enable Row Level Security
ALTER TABLE public.collaboration_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for collaboration requests
CREATE POLICY "Users can view their own requests" 
ON public.collaboration_requests 
FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can create collaboration requests" 
ON public.collaboration_requests 
FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update requests they received" 
ON public.collaboration_requests 
FOR UPDATE 
USING (auth.uid() = to_user_id);

CREATE POLICY "Users can delete their own requests" 
ON public.collaboration_requests 
FOR DELETE 
USING (auth.uid() = from_user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_collaboration_requests_updated_at
BEFORE UPDATE ON public.collaboration_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();