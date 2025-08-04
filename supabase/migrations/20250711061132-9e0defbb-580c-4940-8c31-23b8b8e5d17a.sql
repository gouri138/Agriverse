-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_time TIME,
  due_date DATE,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed')) DEFAULT 'pending',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  crop_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crops table
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  area_planted DECIMAL,
  status TEXT CHECK (status IN ('planted', 'growing', 'harvested', 'failed')) DEFAULT 'planted',
  location_field TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  crop_id UUID REFERENCES public.crops(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pest_reports table
CREATE TABLE public.pest_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id),
  image_url TEXT,
  ai_identification JSONB,
  user_description TEXT,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('reported', 'treating', 'resolved')) DEFAULT 'reported',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create irrigation_schedules table
CREATE TABLE public.irrigation_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id),
  field_name TEXT NOT NULL,
  schedule_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'bi-weekly', 'monthly')) DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  last_irrigated TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create revenue_records table
CREATE TABLE public.revenue_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id),
  quantity_sold DECIMAL NOT NULL,
  price_per_unit DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_name TEXT,
  market_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_alerts table
CREATE TABLE public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'severe')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expert_queries table
CREATE TABLE public.expert_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  category TEXT,
  images TEXT[],
  expert_response TEXT,
  status TEXT CHECK (status IN ('pending', 'answered', 'closed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pest_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_queries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for crops
CREATE POLICY "Users can view their own crops" ON public.crops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own crops" ON public.crops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own crops" ON public.crops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own crops" ON public.crops FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" ON public.expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expenses" ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expenses" ON public.expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expenses" ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for pest_reports
CREATE POLICY "Users can view their own pest reports" ON public.pest_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own pest reports" ON public.pest_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pest reports" ON public.pest_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own pest reports" ON public.pest_reports FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for irrigation_schedules
CREATE POLICY "Users can view their own irrigation schedules" ON public.irrigation_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own irrigation schedules" ON public.irrigation_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own irrigation schedules" ON public.irrigation_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own irrigation schedules" ON public.irrigation_schedules FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for revenue_records
CREATE POLICY "Users can view their own revenue records" ON public.revenue_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own revenue records" ON public.revenue_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own revenue records" ON public.revenue_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own revenue records" ON public.revenue_records FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for weather_alerts
CREATE POLICY "Users can view their own weather alerts" ON public.weather_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own weather alerts" ON public.weather_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own weather alerts" ON public.weather_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own weather alerts" ON public.weather_alerts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for expert_queries
CREATE POLICY "Users can view their own expert queries" ON public.expert_queries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own expert queries" ON public.expert_queries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own expert queries" ON public.expert_queries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own expert queries" ON public.expert_queries FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crops_updated_at BEFORE UPDATE ON public.crops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pest_reports_updated_at BEFORE UPDATE ON public.pest_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_irrigation_schedules_updated_at BEFORE UPDATE ON public.irrigation_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for pest images
INSERT INTO storage.buckets (id, name, public) VALUES ('pest-images', 'pest-images', true);

-- Create storage policies for pest images
CREATE POLICY "Users can upload pest images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pest-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view pest images" ON storage.objects FOR SELECT USING (bucket_id = 'pest-images');
CREATE POLICY "Users can update their pest images" ON storage.objects FOR UPDATE USING (bucket_id = 'pest-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their pest images" ON storage.objects FOR DELETE USING (bucket_id = 'pest-images' AND auth.uid()::text = (storage.foldername(name))[1]);