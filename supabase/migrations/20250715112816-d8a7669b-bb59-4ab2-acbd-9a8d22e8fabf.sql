-- Add updated_at column to irrigation_schedules table (only if it doesn't exist)
ALTER TABLE public.irrigation_schedules 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();