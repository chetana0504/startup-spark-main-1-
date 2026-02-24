-- Create a table for storing co-founder search history
CREATE TABLE public.cofounder_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  search_name TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  experience TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  company_name TEXT,
  search_type TEXT DEFAULT 'person',
  matches_found INTEGER DEFAULT 0,
  matches_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.cofounder_searches ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own cofounder searches" 
ON public.cofounder_searches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cofounder searches" 
ON public.cofounder_searches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cofounder searches" 
ON public.cofounder_searches 
FOR DELETE 
USING (auth.uid() = user_id);