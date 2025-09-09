import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Chantier {
  id: string;
  name: string;
  description?: string;
  address: string;
  start_date: string;
  end_date?: string;
  status: string;
  manager_id?: string;
  client_id?: string;
  besoins_encadrants?: number;
  besoins_salaries?: number;
  type?: string;
}

export function useChantiers() {
  return useQuery({
    queryKey: ['chantiers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Chantier[];
    },
  });
}

export function useCreateChantier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (chantier: {
      name: string;
      description?: string;
      address: string;
      start_date: string;
      end_date?: string;
      status?: string;
      client_id?: string;
      besoins_encadrants?: number;
      besoins_salaries?: number;
      type?: string;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...chantier,
          status: chantier.status || 'planned'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      toast({
        title: "Succès",
        description: "Chantier créé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer le chantier",
        variant: "destructive"
      });
      console.error('Erreur création chantier:', error);
    }
  });
}

export function useUpdateChantier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...chantier }: {
      id: string;
      name: string;
      description?: string;
      address: string;
      start_date: string;
      end_date?: string;
      status?: string;
      client_id?: string;
      besoins_encadrants?: number;
      besoins_salaries?: number;
      type?: string;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(chantier)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      toast({
        title: "Succès",
        description: "Chantier modifié avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de modifier le chantier",
        variant: "destructive"
      });
      console.error('Erreur modification chantier:', error);
    }
  });
}

export function useDeleteChantier() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chantiers'] });
      toast({
        title: "Succès",
        description: "Chantier supprimé avec succès",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chantier",
        variant: "destructive"
      });
      console.error('Erreur suppression chantier:', error);
    }
  });
}