import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Encadrant {
  id: string;
  nom: string;
  initiales: string;
  telephone: string;
  email: string;
  couleur: string;
  actif: boolean;
}

export interface Disponibilite {
  id?: string;
  personne_type: 'ENCADRANT' | 'SALARIE';
  personne_id: string;
  date: string;
  statut: 'available' | 'absent' | 'suivi' | 'formation';
}

export function useEncadrants() {
  return useQuery({
    queryKey: ['encadrants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('encadrants')
        .select('*')
        .order('nom');
      
      if (error) throw error;
      return data as Encadrant[];
    },
  });
}

export function useDisponibilites(personneType: 'ENCADRANT' | 'SALARIE', dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['disponibilites', personneType, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('disponibilites')
        .select('*')
        .eq('personne_type', personneType);
      
      if (dateFrom) query = query.gte('date', dateFrom);
      if (dateTo) query = query.lte('date', dateTo);
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Disponibilite[];
    },
  });
}

export function useUpdateDisponibilite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: {
      personneType: 'ENCADRANT' | 'SALARIE';
      personneId: string;
      date: string;
      statut: 'available' | 'absent' | 'suivi' | 'formation';
    }) => {
      const { data, error } = await supabase
        .from('disponibilites')
        .upsert({
          personne_type: params.personneType,
          personne_id: params.personneId,
          date: params.date,
          statut: params.statut,
        }, {
          onConflict: 'personne_type,personne_id,date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalider les caches pour rafraîchir l'interface
      queryClient.invalidateQueries({ queryKey: ['disponibilites'] });
      
      const statusLabels = {
        available: 'Disponible',
        absent: 'Absent', 
        suivi: 'Suivi',
        formation: 'Formation'
      };
      
      toast({
        title: "Disponibilité sauvegardée",
        description: `${statusLabels[data.statut]} le ${new Date(data.date).toLocaleDateString('fr-FR')}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la disponibilité",
        variant: "destructive"
      });
      console.error('Erreur sauvegarde disponibilité:', error);
    }
  });
}