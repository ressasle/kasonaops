-- Add quarterly_goal column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN quarterly_goal TEXT;