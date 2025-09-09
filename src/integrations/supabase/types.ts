export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          actif: boolean | null
          adresse: string | null
          contact: string | null
          couleur: string | null
          created_at: string | null
          email: string | null
          id: string
          nom: string
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          adresse?: string | null
          contact?: string | null
          couleur?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom: string
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          adresse?: string | null
          contact?: string | null
          couleur?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      disponibilites: {
        Row: {
          created_at: string | null
          date: string
          id: string
          personne_id: string
          personne_type: string
          statut: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          personne_id: string
          personne_type: string
          statut?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          personne_id?: string
          personne_type?: string
          statut?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      encadrants: {
        Row: {
          actif: boolean | null
          couleur: string | null
          created_at: string | null
          email: string | null
          id: string
          initiales: string | null
          nom: string
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          couleur?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          initiales?: string | null
          nom: string
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          couleur?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          initiales?: string | null
          nom?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          address: string
          besoins_encadrants: number | null
          besoins_salaries: number | null
          client_id: string | null
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          manager_id: string | null
          name: string
          start_date: string
          status: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          address: string
          besoins_encadrants?: number | null
          besoins_salaries?: number | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name: string
          start_date: string
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          besoins_encadrants?: number | null
          besoins_salaries?: number | null
          client_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          start_date?: string
          status?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      salaries: {
        Row: {
          actif: boolean | null
          conducteur: boolean | null
          contrat_debut: string | null
          contrat_fin: string | null
          created_at: string | null
          email: string | null
          encadrant_referent_id: string | null
          id: string
          niveau_autonomie: string | null
          nom: string
          telephone: string | null
          updated_at: string | null
        }
        Insert: {
          actif?: boolean | null
          conducteur?: boolean | null
          contrat_debut?: string | null
          contrat_fin?: string | null
          created_at?: string | null
          email?: string | null
          encadrant_referent_id?: string | null
          id?: string
          niveau_autonomie?: string | null
          nom: string
          telephone?: string | null
          updated_at?: string | null
        }
        Update: {
          actif?: boolean | null
          conducteur?: boolean | null
          contrat_debut?: string | null
          contrat_fin?: string | null
          created_at?: string | null
          email?: string | null
          encadrant_referent_id?: string | null
          id?: string
          niveau_autonomie?: string | null
          nom?: string
          telephone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salaries_encadrant_referent_id_fkey"
            columns: ["encadrant_referent_id"]
            isOneToOne: false
            referencedRelation: "encadrants"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          created_at: string
          description: string | null
          end_date: string
          end_time: string | null
          estimated_hours: number | null
          id: string
          priority: string | null
          project_id: string
          start_date: string
          start_time: string | null
          status: string | null
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          end_time?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id: string
          start_date: string
          start_time?: string | null
          status?: string | null
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          end_time?: string | null
          estimated_hours?: number | null
          id?: string
          priority?: string | null
          project_id?: string
          start_date?: string
          start_time?: string | null
          status?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string | null
          created_at: string
          id: string
          leader_id: string | null
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          leader_id?: string | null
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          leader_id?: string | null
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "teams_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          start_time: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          start_time: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          start_time?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
