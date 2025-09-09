import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

export function useCreateSalarie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (salarie: {
      nom: string;
      telephone: string;
      email: string;
      conducteur: boolean;
      actif: boolean;
      encadrant_referent_id: string;
      contrat_debut: string;
      contrat_fin: string;
      niveau_autonomie: string;
    }) => {
      const { data, error } = await supabase
        .from('salaries')
        .insert(salarie)
        .select(`
          *,
          encadrants:encadrant_referent_id(nom)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast({
        title: "Succès",
        description: "Salarié créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le salarié",
        variant: "destructive"
      });
      console.error('Erreur création salarié:', error);
    }
  });
}

export function useUpdateSalarie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...salarie }: {
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
    }) => {
      const { data, error } = await supabase
        .from('salaries')
        .update(salarie)
        .eq('id', id)
        .select(`
          *,
          encadrants:encadrant_referent_id(nom)
        `)
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast({
        title: "Succès",
        description: "Salarié modifié avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le salarié",
        variant: "destructive"
      });
      console.error('Erreur modification salarié:', error);
    }
  });
}

export function useDeleteSalarie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salaries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
      toast({
        title: "Succès",
        description: "Salarié supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le salarié",
        variant: "destructive"
      });
      console.error('Erreur suppression salarié:', error);
    }
  });
}