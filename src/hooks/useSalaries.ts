import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['salaries'],
    queryFn: async () => {
      // Seuls les administrateurs peuvent voir les données des salariés
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('salaries')
        .select(`
          *,
          encadrants:encadrant_referent_id(nom)
        `)
        .order('nom');
      
      if (error) {
        // Si l'utilisateur n'est pas admin, il n'aura pas accès aux données
        console.log('Access denied to salaries data - admin role required');
        throw new Error('Access denied - admin role required');
      }
      
      return data as Salarie[];
    },
    enabled: !!user, // Ne lance la requête que si l'utilisateur est connecté
    retry: false, // Ne pas retry si l'accès est refusé
  });
}

export function useCreateSalarie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('salaries')
        .insert(salarie)
        .select(`
          *,
          encadrants:encadrant_referent_id(nom)
        `)
        .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter les erreurs
      
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
      const message = error.message.includes('admin') 
        ? "Seuls les administrateurs peuvent créer des salariés"
        : "Impossible de créer le salarié";
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      console.error('Erreur création salarié:', error);
    }
  });
}

export function useUpdateSalarie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('salaries')
        .update(salarie)
        .eq('id', id)
        .select(`
          *,
          encadrants:encadrant_referent_id(nom)
        `)
        .maybeSingle();
      
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
      const message = error.message.includes('admin') 
        ? "Seuls les administrateurs peuvent modifier des salariés"
        : "Impossible de modifier le salarié";
        
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      console.error('Erreur modification salarié:', error);
    }
  });
}

export function useDeleteSalarie() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
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
      const message = error.message.includes('admin') 
        ? "Seuls les administrateurs peuvent supprimer des salariés"
        : "Impossible de supprimer le salarié";
        
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      console.error('Erreur suppression salarié:', error);
    }
  });
}