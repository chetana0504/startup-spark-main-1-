-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create startup_ideas table for idea validation persistence
CREATE TABLE public.startup_ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  industry TEXT NOT NULL,
  swot JSONB,
  feasibility_score INTEGER,
  innovation_score INTEGER,
  market_potential_score INTEGER,
  recommendation TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create meeting_analyses table
CREATE TABLE public.meeting_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transcript TEXT NOT NULL,
  summary TEXT,
  action_items JSONB,
  key_decisions JSONB,
  participants JSONB,
  next_steps JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create cofounder_profiles table
CREATE TABLE public.cofounder_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  skills TEXT[] NOT NULL,
  experience TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create growth_predictions table
CREATE TABLE public.growth_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  historical_data JSONB NOT NULL,
  predictions JSONB,
  growth_rate NUMERIC,
  projected_revenue NUMERIC,
  confidence NUMERIC,
  insights JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cofounder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for startup_ideas
CREATE POLICY "Users can view their own ideas" ON public.startup_ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ideas" ON public.startup_ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ideas" ON public.startup_ideas FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for meeting_analyses
CREATE POLICY "Users can view their own meetings" ON public.meeting_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own meetings" ON public.meeting_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meetings" ON public.meeting_analyses FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for cofounder_profiles
CREATE POLICY "Users can view all cofounder profiles" ON public.cofounder_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own cofounder profile" ON public.cofounder_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cofounder profile" ON public.cofounder_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cofounder profile" ON public.cofounder_profiles FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for growth_predictions
CREATE POLICY "Users can view their own predictions" ON public.growth_predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own predictions" ON public.growth_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own predictions" ON public.growth_predictions FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cofounder_profiles_updated_at BEFORE UPDATE ON public.cofounder_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();