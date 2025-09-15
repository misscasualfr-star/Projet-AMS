import { useState, useEffect } from "react";
import { UserCheck, Phone, Mail, Calendar, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { EncadrantModal } from "@/components/modales/EncadrantModal";
import { useEncadrants, useDisponibilites, useUpdateDisponibilite, useCreateEncadrant, useUpdateEncadrant, useDeleteEncadrant } from "@/hooks/useEncadrants";
import { useSalaries } from "@/hooks/useSalaries";
import { useToast } from "@/hooks/use-toast";

// Remove mock data - using Supabase data now

const generateWeekDays = (weekStart: Date) => {
  const days = [];
  const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      day: date.getDate(),
      weekday: format(date, 'eee', { locale: fr }),
      fullDate: date
    });
  }
  return days;
};

export function Encadrants() {
  const [selectedEncadrant, setSelectedEncadrant] = useState<number | null>(null);
  const [view, setView] = useState<'list' | 'calendar' | 'encadrant-view'>('list');
  const [showEncadrantModal, setShowEncadrantModal] = useState(false);
  const [editingEncadrant, setEditingEncadrant] = useState<any>(null);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const { toast } = useToast();
  
  const weekDays = generateWeekDays(currentWeek);
  const { data: encadrants = [], isLoading } = useEncadrants();
  const { data: salaries = [] } = useSalaries();
  const { data: disponibilites = [] } = useDisponibilites('ENCADRANT', weekDays[0]?.date, weekDays[weekDays.length - 1]?.date);
  const updateDisponibilite = useUpdateDisponibilite();
  const createEncadrant = useCreateEncadrant();
  const updateEncadrant = useUpdateEncadrant();
  const deleteEncadrant = useDeleteEncadrant();

  // Fonction pour compter les salariés d'un encadrant
  const getSalariesCount = (encadrantId: string) => {
    return salaries.filter(salarie => salarie.encadrant_referent_id === encadrantId).length;
  };

  const handleNewEncadrant = () => {
    setEditingEncadrant(null);
    setShowEncadrantModal(true);
  };

  const handleEditEncadrant = (encadrant: any) => {
    setEditingEncadrant(encadrant);
    setShowEncadrantModal(true);
  };

  const handleDeleteEncadrant = (encadrant: any) => {
    deleteEncadrant.mutate(encadrant.id);
  };

  const handleSaveEncadrant = (encadrant: any) => {
    if (editingEncadrant) {
      // Modification
      updateEncadrant.mutate({
        id: editingEncadrant.id,
        ...encadrant
      });
    } else {
      // Création - on exclut l'ID pour laisser Supabase le générer
      const { id, ...encadrantData } = encadrant;
      createEncadrant.mutate(encadrantData);
    }
  };

  const handleAvailabilityClick = (encadrantId: string, date: string) => {
    const currentStatus = getAvailabilityStatus(encadrantId, date);
    const statusCycle: ('available' | 'absent' | 'conges' | 'maladie')[] = ['available', 'absent', 'conges', 'maladie'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    updateDisponibilite.mutate({
      personneType: 'ENCADRANT',
      personneId: encadrantId,
      date,
      statut: nextStatus
    });
  };
  
  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };
  
  const getAvailabilityStatus = (encadrantId: string, date: string): 'available' | 'absent' | 'conges' | 'maladie' => {
    const savedDisponibilite = disponibilites.find(d => 
      d.personne_id === encadrantId && d.date === date
    );
    
    if (savedDisponibilite) {
      return savedDisponibilite.statut;
    }
    
    // Par défaut: disponible (vert)
    return 'available';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-available';
      case 'absent':
        return 'bg-absent';
      case 'conges':
        return 'bg-conges';
      case 'maladie':
        return 'bg-maladie';
      default:
        return 'bg-autre';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Présent';
      case 'absent':
        return 'Absent';
      case 'conges':
        return 'Congés';
      case 'maladie':
        return 'Maladie/Accident';
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
              <Button
                variant={view === 'encadrant-view' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('encadrant-view')}
              >
                <Users className="w-4 h-4 mr-2" />
                Vision par encadrant
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
                        {getSalariesCount(encadrant.id)} salariés
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={encadrant.actif ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}>
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
          ) : view === 'calendar' ? (
            <div className="space-y-6">
              {/* Navigation semaine */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">
                    Semaine du {format(weekDays[0]?.fullDate || new Date(), 'dd MMM', { locale: fr })} au {format(weekDays[6]?.fullDate || new Date(), 'dd MMM yyyy', { locale: fr })}
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleNextWeek}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-available"></div>
                    <span>Présent</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-conges"></div>
                    <span>Congés</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-maladie"></div>
                    <span>Maladie/Accident</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-3 h-3 rounded bg-autre"></div>
                    <span>Autres</span>
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
          ) : (
            // Vision par encadrant
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Vision par encadrant</h3>
              <div className="grid gap-6">
                {encadrants.filter(e => e.actif).map(encadrant => {
                  const salariesEncadrant = salaries.filter(s => s.encadrant_referent_id === encadrant.id && s.actif);
                  
                  return (
                    <Card key={encadrant.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10" style={{ backgroundColor: encadrant.couleur }}>
                            <AvatarFallback className="text-white font-semibold">
                              {encadrant.initiales}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{encadrant.nom}</h4>
                            <p className="text-sm text-muted-foreground">
                              {salariesEncadrant.length} salarié{salariesEncadrant.length !== 1 ? 's' : ''} assigné{salariesEncadrant.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {salariesEncadrant.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {salariesEncadrant.map(salarie => (
                              <div key={salarie.id} className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
                                <Avatar className="w-6 h-6 bg-secondary">
                                  <AvatarFallback className="text-secondary-foreground font-semibold text-xs">
                                    {salarie.nom.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{salarie.nom}</div>
                                  <div className="text-xs text-muted-foreground">{salarie.niveau_autonomie}</div>
                                </div>
                                {salarie.conducteur && (
                                  <Badge variant="secondary" className="text-xs">Conducteur</Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Aucun salarié assigné à cet encadrant</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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