import { useState } from "react";
import { Calendar, Users, UserCheck, LayoutDashboard, FileText, CalendarDays, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChantierModal } from "@/components/modales/ChantierModal";
import { ClientModal } from "@/components/modales/ClientModal";
import { useToast } from "@/hooks/use-toast";
import { useCreateClient, useUpdateClient } from "@/hooks/useClients";
import { useCreateChantier, useUpdateChantier } from "@/hooks/useChantiers";
import { useAuth } from "@/contexts/AuthContext";

const navigationTabs = [
  {
    id: "planning",
    label: "Planning prévisionnel", 
    icon: Calendar,
    description: "Vue calendrier des chantiers"
  },
  {
    id: "encadrants",
    label: "Encadrants",
    icon: UserCheck,
    description: "Gestion des encadrants et disponibilités"
  },
  {
    id: "salaries", 
    label: "Salariés",
    icon: Users,
    description: "Gestion des salariés en insertion"
  },
  {
    id: "affectation",
    label: "Affectation quotidienne",
    icon: LayoutDashboard,
    description: "Affectation jour par jour avec drag & drop"
  },
  {
    id: "hebdomadaire",
    label: "Planning hebdomadaire", 
    icon: CalendarDays,
    description: "Vue par encadrant et par semaine"
  },
  {
    id: "feuilles",
    label: "Feuilles de route",
    icon: FileText,
    description: "Génération des feuilles de route PDF"
  }
];

interface NavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [showChantierModal, setShowChantierModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const { toast } = useToast();
  const createClient = useCreateClient();
  const createChantier = useCreateChantier();
  const { signOut, user } = useAuth();

  const handleNewChantier = () => {
    setShowChantierModal(true);
  };

  const handleNewClient = () => {
    setShowClientModal(true);
  };

  const handleSaveChantier = (chantier: any) => {
    if (chantier.id) {
      // Modification (pas encore implémentée)
    } else {
      // Création
      createChantier.mutate(chantier);
    }
  };

  const handleSaveClient = (client: any) => {
    if (client.id) {
      // Modification (pas encore implémentée)  
    } else {
      // Création
      createClient.mutate(client);
    }
  };

  return (
    <header className="bg-card border-b border-border shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AMS Planning</h1>
                <p className="text-sm text-muted-foreground">Planification des équipes</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              Semaine 37 - 2025
            </Badge>
            <Button size="sm" variant="outline" onClick={handleNewClient}>
              + Nouveau client
            </Button>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground" onClick={handleNewChantier}>
              + Nouveau chantier
            </Button>
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-border">
              <span className="text-sm text-muted-foreground">
                {user?.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navigationTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-smooth",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
      
      <ChantierModal 
        open={showChantierModal} 
        onOpenChange={setShowChantierModal}
        onSave={handleSaveChantier}
      />
      
      <ClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal}
        onSave={handleSaveClient}
      />
    </header>
  );
}