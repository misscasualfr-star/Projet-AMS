import { useState, useEffect } from "react";
import { UserCheck, Phone, Mail, Calendar, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EncadrantModal } from "@/components/modales/EncadrantModal";
import { useEncadrants, useDisponibilites, useUpdateDisponibilite, useCreateEncadrant, useUpdateEncadrant } from "@/hooks/useEncadrants";
import { useToast } from "@/hooks/use-toast";

// Remove mock data - using Supabase data now

const generateWeekDays = () => {
  const days = [];
  const startDate = new Date(2025, 8, 15); // 15 septembre 2025 (lundi)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      weekday: date.toLocaleDateString('fr-FR', { weekday: 'short' })
    });
  }
  return days;
};

export function Encadrants() {
  const [selectedEncadrant, setSelectedEncadrant] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [showEncadrantModal, setShowEncadrantModal] = useState(false);
  const [editingEncadrant, setEditingEncadrant] = useState<any>(null);
  const { toast } = useToast();
  
  const weekDays = generateWeekDays();
  const { data: encadrants = [], isLoading } = useEncadrants();
  const { data: disponibilites = [] } = useDisponibilites('ENCADRANT', weekDays[0]?.date, weekDays[weekDays.length - 1]?.date);
  const updateDisponibilite = useUpdateDisponibilite();
  const createEncadrant = useCreateEncadrant();
  const updateEncadrant = useUpdateEncadrant();

  const handleNewEncadrant = () => {
    setEditingEncadrant(null);
    setShowEncadrantModal(true);
  };

  const handleEditEncadrant = (encadrant: any) => {
    setEditingEncadrant(encadrant);
    setShowEncadrantModal(true);
  };

  const handleDeleteEncadrant = (encadrant: any) => {
    toast({ 
      title: "Suppression", 
      description: `${encadrant.nom} a été supprimé`,
      variant: "destructive" 
    });
  };

  const handleSaveEncadrant = (encadrant: any) => {
    if (editingEncadrant) {
      // Modification
      updateEncadrant.mutate({
        id: editingEncadrant.id,
        ...encadrant
      });
    } else {
      // Création
      createEncadrant.mutate(encadrant);
    }
  };

  const handleAvailabilityClick = (encadrantId: string, date: string) => {
    const currentStatus = getAvailabilityStatus(encadrantId, date);
    const statusCycle: ('available' | 'absent' | 'suivi' | 'formation')[] = ['available', 'absent', 'suivi', 'formation'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    updateDisponibilite.mutate({
      personneType: 'ENCADRANT',
      personneId: encadrantId,
      date,
      statut: nextStatus
    });
  };
  
  // Mock availability data
  const getAvailabilityStatus = (encadrantId: string, date: string): 'available' | 'absent' | 'suivi' | 'formation' => {
    // Chercher dans les données de la base d'abord
    const savedDisponibilite = disponibilites.find(d => 
      d.personne_id === encadrantId && d.date === date
    );
    
    if (savedDisponibilite) {
      return savedDisponibilite.statut;
    }
    
    // Fallback sur le pattern par défaut si pas de données sauvegardées
    const day = new Date(date).getDay();
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) return 'absent';
    
    // Pattern par défaut: la plupart disponibles
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-available';
      case 'absent':
        return 'bg-absent';
      case 'suivi':
        return 'bg-suivi';
      case 'formation':
        return 'bg-formation';
      default:
        return 'bg-autre';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'absent':
        return 'Absent';
      case 'suivi':
        return 'Suivi';
      case 'formation':
        return 'Formation';
      default:
        return 'Autre';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="text-center">Chargement des encadrants...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>Gestion des encadrants</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
              >
                Liste
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('calendar')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Disponibilités
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground" onClick={handleNewEncadrant}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvel encadrant
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'list' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Encadrant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encadrants.map(encadrant => (
                  <TableRow key={encadrant.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className={cn("w-8 h-8")} style={{ backgroundColor: encadrant.couleur }}>
                          <AvatarFallback className="text-white font-semibold text-xs">
                            {encadrant.initiales}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{encadrant.nom}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-3 h-3" />
                          <span>{encadrant.telephone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{encadrant.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        6 salariés {/* TODO: count real salariés */}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={encadrant.actif ? "bg-available text-white" : "bg-absent text-white"}>
                        {encadrant.actif ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditEncadrant(encadrant)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteEncadrant(encadrant)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Semaine du 15 au 21 septembre 2025</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-available"></div>
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-absent"></div>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-suivi"></div>
                    <span>Suivi</span>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-8 bg-muted">
                  <div className="p-3 font-semibold text-sm">Encadrant</div>
                  {weekDays.map(day => (
                    <div key={day.date} className="p-3 text-center">
                      <div className="font-semibold text-sm">{day.weekday}</div>
                      <div className="text-xs text-muted-foreground">{day.day}</div>
                    </div>
                  ))}
                </div>
                
                {encadrants.filter(e => e.actif).map(encadrant => (
                  <div key={encadrant.id} className="grid grid-cols-8 border-t border-border">
                    <div className="p-3 border-r border-border">
                      <div className="flex items-center space-x-2">
                        <Avatar className={cn("w-6 h-6")} style={{ backgroundColor: encadrant.couleur }}>
                          <AvatarFallback className="text-white font-semibold text-xs">
                            {encadrant.initiales}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{encadrant.nom}</span>
                      </div>
                    </div>
                    {weekDays.map(day => {
                      const status = getAvailabilityStatus(encadrant.id, day.date);
                      return (
                        <div
                          key={`${encadrant.id}-${day.date}`}
                          className="p-3 border-r border-border cursor-pointer hover:bg-muted/50"
                          title={getStatusLabel(status)}
                          onClick={() => handleAvailabilityClick(encadrant.id, day.date)}
                        >
                          <div className={cn(
                            "w-full h-8 rounded transition-smooth",
                            getStatusColor(status)
                          )} />
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground">
                💡 Cliquez sur une case pour modifier la disponibilité
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <EncadrantModal 
        open={showEncadrantModal} 
        onOpenChange={setShowEncadrantModal}
        encadrant={editingEncadrant}
        onSave={handleSaveEncadrant}
      />
    </div>
  );
}