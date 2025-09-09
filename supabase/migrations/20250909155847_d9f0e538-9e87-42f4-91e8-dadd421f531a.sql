-- Create affectations table to store daily work assignments
CREATE TABLE public.affectations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  encadrant_id UUID,
  salarie_id UUID,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.affectations ENABLE ROW LEVEL SECURITY;

-- Create policies for affectations
CREATE POLICY "Anyone can view affectations" 
ON public.affectations 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create affectations" 
ON public.affectations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update affectations" 
ON public.affectations 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete affectations" 
ON public.affectations 
FOR DELETE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_affectations_updated_at
BEFORE UPDATE ON public.affectations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();