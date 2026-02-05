-- Add quarterly_goal_effect column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN quarterly_goal_effect boolean DEFAULT true;