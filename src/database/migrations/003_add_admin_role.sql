-- Migration: Add role column and admin management
-- Run this in the Supabase SQL Editor after migration 002.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- To set a user as admin (replace with actual user UUID):
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-uuid-here';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
