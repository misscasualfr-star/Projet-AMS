-- CORRECTION DU PROBLÈME DE SÉCURITÉ : Restriction d'accès aux données sensibles des clients

-- 1. Supprimer les politiques actuelles trop permissives
DROP POLICY "Authenticated users can view clients" ON public.clients;
DROP POLICY "Authenticated users can insert clients" ON public.clients;
DROP POLICY "Authenticated users can update clients" ON public.clients;
DROP POLICY "Authenticated users can delete clients" ON public.clients;

-- 2. Créer des politiques restrictives pour les administrateurs seulement
-- Utilisant la même approche sécurisée que pour les salariés (politiques RLS directes)

CREATE POLICY "Admin only: view client sensitive data" 
ON public.clients FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin only: insert client data" 
ON public.clients FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin only: update client data" 
ON public.clients FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admin only: delete client data" 
ON public.clients FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

COMMENT ON TABLE public.clients IS 'Table des clients - Accès restreint aux administrateurs pour protéger les données sensibles (email, téléphone, adresse)';