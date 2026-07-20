-- Migration: Consolidated RLS policies and security hardening
-- Run this in Supabase SQL Editor after migration 005.
-- This ensures all tables have proper RLS and adds admin-only policies.

-- ========== PROFILES ==========
-- Only admins can view/update other users' profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== CHATS ==========
-- Admins can view all chats (for dashboard)
CREATE POLICY "Admins can view all chats"
  ON public.chats FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== MESSAGES ==========
-- Admins can view all messages
CREATE POLICY "Admins can view all messages"
  ON public.messages FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== CHAT FILES ==========
-- Admins can view all files
CREATE POLICY "Admins can view all files"
  ON public.chat_files FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== PROMPTS ==========
-- Admins can view all prompts
CREATE POLICY "Admins can view all prompts"
  ON public.prompts FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ========== PREVENT USER SELF-DELETE ==========
-- Prevent non-admin users from deleting their own profile via direct API
-- (Account deletion should go through auth.admin API)
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- ========== RATE LIMIT AUDIT LOG (optional) ==========
-- Uncomment to track auth attempts for security auditing:
-- CREATE TABLE IF NOT EXISTS public.auth_audit_log (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
--   action TEXT NOT NULL,
--   ip_address TEXT,
--   user_agent TEXT,
--   success BOOLEAN NOT NULL,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- ALTER TABLE public.auth_audit_log ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Admins can view audit log" ON public.auth_audit_log FOR SELECT
--   USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
