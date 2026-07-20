-- Migration: Create prompts library table
-- Run in Supabase SQL Editor after migration 004.

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prompts"
  ON public.prompts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts"
  ON public.prompts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts"
  ON public.prompts FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category ON public.prompts(category);
