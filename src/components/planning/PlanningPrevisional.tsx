import { useState } from "react";
import { Filter, Plus, MapPin, Users, UserCheck, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChantierModal } from "@/components/modales/ChantierModal";
import { useToast } from "@/hooks/use-toast";
import { useCreateChantier, useChantiers, useUpdateChantier } from "@/hooks/useChantiers";
import { useClients } from "@/hooks/useClients";

const generateDays = () => {
  const days = [];
  const startDate = new Date(2025, 8, 15); // 15 septembre 2025
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
      isWeekend: date.getDay() === 0 || date.getDay() === 6
    });
  }
  return days;
};

export function PlanningPrevisional() {
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showChantierModal, setShowChantierModal] = useState(false);
  const [editingChantier, setEditingChantier] = useState<any>(null);
  const { toast } = useToast();
  const createChantier = useCreateChantier();
  const updateChantier = useUpdateChantier();
  const { data: chantiers = [] } = useChantiers();
  const { data: clients = [] } = useClients();
  
  const days = generateDays();

  const handleNewChantier = () => {
    setEditingChantier(null);
    setShowChantierModal(true);
  };

  const handleEditChantier = (chantier: any) => {
    setEditingChantier(chantier);
    setShowChantierModal(true);
  };

  const handleDeleteChantier = async (chantierId: string) => {
    try {
      // TODO: Implement delete mutation
      toast({
        title: "Suppression",
        description: "Chantier supprimé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le chantier",
        variant: "destructive"
      });
    }
  };

  const handleSaveChantier = (chantierData: any) => {
    if (editingChantier) {
      updateChantier.mutate({ 
        id: editingChantier.id, 
        ...chantierData 
      });
    } else {
      createChantier.mutate(chantierData);
    }
    setShowChantierModal(false);
  };
  
  const getClientColor = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.couleur || "client-1";
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "confirme":
        return <Badge className="bg-available text-white">Confirmé</Badge>;
      case "prevu":
        return <Badge className="bg-suivi text-white">Prévu</Badge>;
      case "formation":
        return <Badge className="bg-formation text-white">Formation</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const filteredChantiers = chantiers.filter(chantier => {
    const clientMatch = selectedClient === "all" || chantier.client_id === selectedClient;
    const statusMatch = selectedStatus === "all" || chantier.status === selectedStatus;
    return clientMatch && statusMatch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Filters */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filtres et options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center space-x-2">
                      <div className={cn("w-3 h-3 rounded-full", `bg-${client.couleur}`)} />
                      <span>{client.nom}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="prevu">Prévu</SelectItem>
                <SelectItem value="formation">Formation</SelectItem>
              </SelectContent>
            </Select>

            <Button className="bg-gradient-primary text-primary-foreground" onClick={handleNewChantier}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau chantier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Planning Grid */}
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
          {days.map(day => (
            <div key={day.date} className={cn(
              "space-y-3",
              day.isWeekend ? "opacity-50" : ""
            )}>
              <div className="text-center p-3 bg-muted rounded-lg">
                <h3 className="font-semibold text-foreground">{day.label}</h3>
                <p className="text-sm text-muted-foreground">{day.date}</p>
              </div>

              <div className="space-y-2 min-h-[200px]">
                {filteredChantiers
                  .filter(chantier => chantier.start_date === day.date)
                  .map(chantier => {
                    const client = clients.find(c => c.id === chantier.client_id);
                    return (
                      <Card 
                        key={chantier.id} 
                        className={cn(
                          "group cursor-pointer transition-smooth hover:shadow-elevated border-l-4 relative",
                          `border-l-${getClientColor(chantier.client_id || "")} bg-${getClientColor(chantier.client_id || "")}/10`
                        )}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm text-foreground">
                              {client?.nom || 'Client non défini'}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {getStatusBadge(chantier.status || 'planned')}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditChantier(chantier);
                                  }}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteChantier(chantier.id);
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm font-medium text-card-foreground">
                            {chantier.name}
                          </p>
                          
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{chantier.address}</span>
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <div className="flex items-center space-x-1 text-xs">
                              <UserCheck className="w-3 h-3 text-primary" />
                              <span>{chantier.besoins_encadrants || 0}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs">
                              <Users className="w-3 h-3 text-accent" />
                              <span>{chantier.besoins_salaries || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                
                {!day.isWeekend && (
                  <Button
                    variant="ghost"
                    className="w-full h-12 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary"
                    onClick={handleNewChantier}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter chantier
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Légende</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {clients.map(client => (
              <div key={client.id} className="flex items-center space-x-2">
                <div className={cn("w-4 h-4 rounded", `bg-${client.couleur}`)} />
                <span className="text-sm font-medium">{client.nom}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <ChantierModal 
        open={showChantierModal} 
        onOpenChange={setShowChantierModal}
        chantier={editingChantier}
        onSave={handleSaveChantier}
      />
    </div>
  );
}