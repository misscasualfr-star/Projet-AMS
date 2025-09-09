import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Client {
  id: string;
  nom: string;
  contact?: string;
  telephone?: string;
  email?: string;
  adresse?: string;
  couleur: string;
  actif: boolean;
}

export function useClients() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      // Seuls les administrateurs peuvent voir les données sensibles des clients
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('nom');
      
      if (error) {
        // Si l'utilisateur n'est pas admin, il n'aura pas accès aux données
        console.log('Access denied to clients data - admin role required');
        throw new Error('Access denied - admin role required');
      }
      
      return data as Client[];
    },
    enabled: !!user, // Ne lance la requête que si l'utilisateur est connecté
    retry: false, // Ne pas retry si l'accès est refusé
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (client: {
      nom: string;
      contact?: string;
      telephone?: string;
      email?: string;
      adresse?: string;
      couleur: string;
      actif: boolean;
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .maybeSingle(); // Utiliser maybeSingle au lieu de single pour éviter les erreurs
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Succès",
        description: "Client créé avec succès",
      });
    },
    onError: (error) => {
      const message = error.message.includes('admin') 
        ? "Seuls les administrateurs peuvent créer des clients"
        : "Impossible de créer le client";
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      console.error('Erreur création client:', error);
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async ({ id, ...client }: {
      id: string;
      nom: string;
      contact?: string;
      telephone?: string;
      email?: string;
      adresse?: string;
      couleur: string;
      actif: boolean;
    }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('clients')
        .update(client)
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Succès",
        description: "Client modifié avec succès",
      });
    },
    onError: (error) => {
      const message = error.message.includes('admin') 
        ? "Seuls les administrateurs peuvent modifier des clients"
        : "Impossible de modifier le client";
        
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      console.error('Erreur modification client:', error);
    }
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      });
    },
    onError: (error) => {
      const message = error.message.includes('admin') 
        ? "Seuls les administrateurs peuvent supprimer des clients"
        : "Impossible de supprimer le client";
        
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive"
      });
      console.error('Erreur suppression client:', error);
    }
  });
}