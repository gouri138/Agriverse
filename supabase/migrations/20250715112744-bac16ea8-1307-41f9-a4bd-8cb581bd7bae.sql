-- Add updated_at column to irrigation_schedules table
ALTER TABLE public.irrigation_schedules 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- Create trigger for automatic timestamp updates on irrigation_schedules
CREATE TRIGGER update_irrigation_schedules_updated_at
BEFORE UPDATE ON public.irrigation_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();