
-- Add model column to ai_generations table to store which AI model was used
ALTER TABLE public.ai_generations 
ADD COLUMN model text;
