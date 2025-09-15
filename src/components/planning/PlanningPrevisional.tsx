import { useState } from "react";
import { Filter, Plus, MapPin, Users, UserCheck, Edit, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChantierModal } from "@/components/modales/ChantierModal";
import { useToast } from "@/hooks/use-toast";
import { useCreateChantier, useChantiers, useUpdateChantier, useDeleteChantier } from "@/hooks/useChantiers";
import { useClients } from "@/hooks/useClients";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { MonthCalendar } from "@/components/ui/month-calendar";

const generateDays = (weekStart: Date) => {
  const days = [];
  const monday = startOfWeek(weekStart, { weekStartsOn: 1 }); // Start from Monday
  
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);
    days.push({
      date: format(date, 'yyyy-MM-dd'),
      label: format(date, 'eee d', { locale: fr }),
      fullDate: date,
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
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  
  const { toast } = useToast();
  const createChantier = useCreateChantier();
  const updateChantier = useUpdateChantier();
  const deleteChantier = useDeleteChantier();
  const { data: chantiers = [], error: chantiersError } = useChantiers();
  const { data: clients = [], error: clientsError } = useClients();
  
  const days = generateDays(currentWeek);

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setCurrentWeek(date);
      setShowCalendar(false);
    }
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  const handleNewChantier = () => {
    setEditingChantier(null);
    setShowChantierModal(true);
  };

  const handleEditChantier = (chantier: any) => {
    setEditingChantier(chantier);
    setShowChantierModal(true);
  };

  const handleDeleteChantier = async (chantierId: string) => {
    deleteChantier.mutate(chantierId);
  };

  const handleSaveChantier = (chantierData: any) => {
    console.log('Données du chantier à sauvegarder:', chantierData);
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
    return client?.couleur || 'hsl(220 38 127)';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'planned': { label: 'Planifié', variant: 'secondary' as const },
      'confirmed': { label: 'Confirmé', variant: 'default' as const },
      'in_progress': { label: 'En cours', variant: 'default' as const },
      'completed': { label: 'Terminé', variant: 'secondary' as const },
      'cancelled': { label: 'Annulé', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.planned;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredChantiers = chantiers.filter(chantier => {
    const matchesClient = selectedClient === "all" || chantier.client_id === selectedClient;
    const matchesStatus = selectedStatus === "all" || chantier.status === selectedStatus;
    
    // Vérifier si le chantier couvre au moins un jour de la semaine actuelle
    const chantierStart = new Date(chantier.start_date);
    const chantierEnd = chantier.end_date ? new Date(chantier.end_date) : chantierStart;
    const weekStart = new Date(days[0].date);
    const weekEnd = new Date(days[6].date);
    
    const isInWeek = chantierStart <= weekEnd && chantierEnd >= weekStart;
    
  return matchesClient && matchesStatus && isInWeek;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Week Navigation */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Planning prévisionnel</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleToday}>
                Aujourd'hui
              </Button>
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="min-w-[200px]">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {format(currentWeek, "dd MMMM yyyy", { locale: fr })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={currentWeek}
                      onSelect={handleDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button variant="outline" size="sm" onClick={handleNextWeek}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filtres :</span>
            </div>

            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clientsError?.message.includes('admin') ? (
                  <SelectItem value="restricted" disabled>🔒 Accès restreint</SelectItem>
                ) : (
                  clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))
                )}
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

      {/* Planning Grid avec calendrier mensuel */}
      <div className="space-y-6">
        {/* Vue semaine */}
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
                    .filter(chantier => {
                      const chantierStart = new Date(chantier.start_date);
                      const chantierEnd = chantier.end_date ? new Date(chantier.end_date) : chantierStart;
                      const dayDate = new Date(day.date);
                      
                      // Afficher le chantier sur tous les jours où il est actif
                      return dayDate >= chantierStart && dayDate <= chantierEnd;
                    })
                    .map(chantier => {
                      const client = clients.find(c => c.id === chantier.client_id);
                      return (
                        <Card 
                          key={chantier.id} 
                          className="group cursor-pointer transition-smooth hover:shadow-elevated border-l-4 relative"
                          style={{ 
                            borderLeftColor: getClientColor(chantier.client_id || ''),
                            backgroundColor: `${getClientColor(chantier.client_id || '')}15`
                          }}
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
                                 <span className="font-medium">Encadrants: {chantier.besoins_encadrants || 0}</span>
                               </div>
                               <div className="flex items-center space-x-1 text-xs">
                                 <span className="font-medium">Salariés: {chantier.besoins_salaries || 0}</span>
                               </div>
                             </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  
                   {!day.isWeekend && (
                     <Button
                       variant="ghost"
                       className="w-full h-12 border-2 border-dashed border-border hover:border-accent text-muted-foreground hover:text-accent"
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
        
        {/* Vue calendrier mensuel */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Vue mensuelle</h3>
          <MonthCalendar
            selectedDate={currentWeek}
            onDateSelect={(date) => setCurrentWeek(date)}
            events={chantiers.map(chantier => {
              const client = clients.find(c => c.id === chantier.client_id);
              return {
                date: new Date(chantier.start_date),
                endDate: chantier.end_date ? new Date(chantier.end_date) : undefined,
                title: `${client?.nom || 'Client'} - ${chantier.name}`,
                color: getClientColor(chantier.client_id || '')
              };
            })}
          />
        </div>
      </div>

      {/* Legend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clientsError?.message.includes('admin') ? (
            <div className="p-4 text-center text-muted-foreground">
              <p className="text-sm">🔒 Légende des clients non disponible</p>
              <p className="text-xs">Accès administrateur requis pour voir les informations clients</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {clients.map(client => (
                <div key={client.id} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: client.couleur }}
                  />
                  <span className="text-sm font-medium">{client.nom}</span>
                </div>
              ))}
            </div>
          )}
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