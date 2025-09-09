import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Salarie {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  conducteur: boolean;
  actif: boolean;
  encadrant_referent_id: string;
  contrat_debut: string;
  contrat_fin: string;
  niveau_autonomie: string;
  encadrants?: {
    nom: string;
  };
}

export function useSalaries() {
  return useQuery({
    queryKey: ['salaries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salaries')
        .select(`
          *,
          encadrants:encadrant_referent_id(nom)
        `)
        .order('nom');
      
      if (error) throw error;
      return data as Salarie[];
    },
  });
}