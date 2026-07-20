-- Migration: Create chat_files table
-- Run this in the Supabase SQL Editor after migration 001.

CREATE TABLE IF NOT EXISTS public.chat_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON public.chat_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own files"
  ON public.chat_files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own files"
  ON public.chat_files FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_files_chat_id ON public.chat_files(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_files_user_id ON public.chat_files(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_files_message_id ON public.chat_files(message_id);
