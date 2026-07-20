-- Migration: Add system_prompt columns
-- Run in Supabase SQL Editor after migration 003.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS system_prompt TEXT DEFAULT '';
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS system_prompt TEXT DEFAULT '';
