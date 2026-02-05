-- Add quarterly_reminder column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN quarterly_reminder boolean DEFAULT false;