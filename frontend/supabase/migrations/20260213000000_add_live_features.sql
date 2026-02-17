-- Create comments table for live chat
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.comments FOR SELECT 
USING (true);

-- Policy: Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments" 
ON public.comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can delete comments (using admin role check function)
CREATE POLICY "Admins can delete comments" 
ON public.comments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create match_events table for live timeline
CREATE TABLE IF NOT EXISTS public.match_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'goal', 'wicket', 'foul', 'start', 'end', etc.
    description TEXT NOT NULL,
    score_update JSONB, -- Optional snapshot of score at that event
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on match_events
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view events
CREATE POLICY "Match events are viewable by everyone" 
ON public.match_events FOR SELECT 
USING (true);

-- Policy: Only admins can insert events
CREATE POLICY "Admins can insert match events" 
ON public.match_events FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Only admins can update/delete events
CREATE POLICY "Admins can maintain match events" 
ON public.match_events FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    CONSTRAINT one_favorite_target CHECK (
        (team_id IS NOT NULL AND player_id IS NULL) OR 
        (team_id IS NULL AND player_id IS NOT NULL)
    ),
    UNIQUE(user_id, team_id),
    UNIQUE(user_id, player_id)
);

-- Enable RLS on favorites
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own favorites
CREATE POLICY "Users can view own favorites" 
ON public.favorites FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own favorites
CREATE POLICY "Users can insert own favorites" 
ON public.favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" 
ON public.favorites FOR DELETE 
USING (auth.uid() = user_id);

-- Enable Realtime for these tables
-- Note: This requires the publication to exist. Default 'supabase_realtime' usually exists.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END IF;
  
  ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.matches; 
END $$;
