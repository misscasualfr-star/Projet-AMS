import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Affectation {
  id: string;
  project_id: string;
  encadrant_id?: string;
  salarie_id?: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export const useAffectations = (date: string) => {
  return useQuery({
    queryKey: ["affectations", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affectations")
        .select("*")
        .eq("date", date);

      if (error) throw error;
      return data as Affectation[];
    },
  });
};

export const useWeekAffectations = (weekDates: string[]) => {
  return useQuery({
    queryKey: ["affectations-week", weekDates],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affectations")
        .select("*")
        .in("date", weekDates);

      if (error) throw error;
      return data as Affectation[];
    },
    enabled: weekDates.length > 0,
  });
};

export const useCreateAffectation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (affectation: Omit<Affectation, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("affectations")
        .insert(affectation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affectations"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de créer l'affectation",
        variant: "destructive",
      });
      console.error("Error creating affectation:", error);
    },
  });
};

export const useDeleteAffectations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ projectId, date, encadrantId, salarieId }: {
      projectId?: string;
      date: string;
      encadrantId?: string;
      salarieId?: string;
    }) => {
      let query = supabase.from("affectations").delete().eq("date", date);
      
      if (projectId) query = query.eq("project_id", projectId);
      if (encadrantId) query = query.eq("encadrant_id", encadrantId);
      if (salarieId) query = query.eq("salarie_id", salarieId);

      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affectations"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'affectation",
        variant: "destructive",
      });
      console.error("Error deleting affectation:", error);
    },
  });
};