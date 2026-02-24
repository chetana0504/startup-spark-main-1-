-- Create user_analytics table for tracking enhanced analytics
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_meetings INTEGER DEFAULT 0,
  total_transcripts INTEGER DEFAULT 0,
  total_cofounder_searches INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  positive_meetings INTEGER DEFAULT 0,
  negative_meetings INTEGER DEFAULT 0,
  languages_used JSONB DEFAULT '[]'::jsonb,
  weekly_activity JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" 
ON public.user_analytics 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analytics" 
ON public.user_analytics 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_user_analytics_updated_at
BEFORE UPDATE ON public.user_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add language_used column to meeting_analyses
ALTER TABLE public.meeting_analyses 
ADD COLUMN IF NOT EXISTS language_used TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS analysis_type TEXT DEFAULT 'transcript';

-- Add preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';