import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, UserCheck, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChantiers } from "@/hooks/useChantiers";
import { useEncadrants } from "@/hooks/useEncadrants";
import { useSalaries } from "@/hooks/useSalaries";
import { useClients } from "@/hooks/useClients";
import { useAffectations, useWeekAffectations, useCreateAffectation, useDeleteAffectations } from "@/hooks/useAffectations";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

export function PlanningHebdomadaire() {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ chantierId: string; date: string } | null>(null);
  
  const { toast } = useToast();
  
  // Data hooks
  const { data: chantiers = [] } = useChantiers();
  const { data: encadrants = [] } = useEncadrants();
  const { data: salaries = [] } = useSalaries();
  const { data: clients = [] } = useClients();
  
  // Get affectations for the current week
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);
  const weekDates = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'));
  
  const { data: affectations = [] } = useWeekAffectations(weekDates);
  const createAffectation = useCreateAffectation();
  const deleteAffectations = useDeleteAffectations();

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'eee dd', { locale: fr }),
        fullDate: date,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: isSameDay(date, new Date())
      };
    });
  }, [weekStart]);

  // Filter chantiers for current week
  const chantiersActifs = useMemo(() => {
    return chantiers.filter(chantier => {
      const startDate = new Date(chantier.start_date);
      const endDate = chantier.end_date ? new Date(chantier.end_date) : null;
      
      return startDate <= weekEnd && (!endDate || endDate >= weekStart);
    });
  }, [chantiers, weekStart, weekEnd]);

  // Transform affectations into usable format
  const affectationsData = useMemo(() => {
    const result: Record<string, Record<string, { encadrant?: string; salaries: string[] }>> = {};
    
    affectations.forEach(aff => {
      if (!result[aff.project_id]) {
        result[aff.project_id] = {};
      }
      if (!result[aff.project_id][aff.date]) {
        result[aff.project_id][aff.date] = { salaries: [] };
      }
      
      if (aff.encadrant_id && !aff.salarie_id) {
        result[aff.project_id][aff.date].encadrant = aff.encadrant_id;
      } else if (aff.salarie_id) {
        result[aff.project_id][aff.date].salaries.push(aff.salarie_id);
      }
    });
    
    return result;
  }, [affectations]);

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

  const getClientColor = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.couleur || 'hsl(var(--primary))';
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.nom || 'Client inconnu';
  };

  const getEncadrantForAffectation = (chantierId: string, date: string) => {
    const encadrantId = affectationsData[chantierId]?.[date]?.encadrant;
    return encadrantId ? encadrants.find(e => e.id === encadrantId) : null;
  };

  const getSalariesForAffectation = (chantierId: string, date: string) => {
    const salariesIds = affectationsData[chantierId]?.[date]?.salaries || [];
    return salariesIds.map(id => salaries.find(s => s.id === id)).filter(Boolean);
  };

  const handleCellClick = (chantierId: string, date: string) => {
    setSelectedCell({ chantierId, date });
  };

  const getCellStats = (chantierId: string, date: string) => {
    const chantier = chantiersActifs.find(c => c.id === chantierId);
    const encadrant = getEncadrantForAffectation(chantierId, date);
    const salariesAffectes = getSalariesForAffectation(chantierId, date);
    
    const besoinsEncadrants = chantier?.besoins_encadrants || 1;
    const besoinsSalaries = chantier?.besoins_salaries || 0;
    
    return {
      encadrantsAffectes: encadrant ? 1 : 0,
      salariesAffectes: salariesAffectes.length,
      besoinsEncadrants,
      besoinsSalaries,
      isComplete: (encadrant ? 1 : 0) >= besoinsEncadrants && salariesAffectes.length >= besoinsSalaries
    };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Week Navigation */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5" />
              <span>Planning hebdomadaire</span>
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
                      className={cn("p-3 pointer-events-auto")}
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
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              Semaine du {format(weekStart, "dd", { locale: fr })} au {format(weekEnd, "dd MMMM yyyy", { locale: fr })}
            </h3>
          </div>
        </CardContent>
      </Card>

      {/* Planning Grid */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Vue d'ensemble des affectations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header with days */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="font-semibold text-sm p-2">Chantiers</div>
                {weekDays.map(day => (
                  <div 
                    key={day.date} 
                    className={cn(
                      "text-center p-2 rounded-lg font-semibold text-sm",
                      day.isWeekend ? "bg-muted/50 text-muted-foreground" : "bg-muted",
                      day.isToday ? "bg-primary text-primary-foreground" : ""
                    )}
                  >
                    <div>{day.label}</div>
                  </div>
                ))}
              </div>

              {/* Chantiers rows */}
              <div className="space-y-2">
                {chantiersActifs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun chantier actif pour cette semaine</p>
                  </div>
                ) : (
                  chantiersActifs.map(chantier => (
                    <div key={chantier.id} className="grid grid-cols-8 gap-2 animate-fade-in hover:bg-muted/5 rounded-lg p-1 transition-smooth">
                      {/* Chantier info */}
                      <div className="p-3 border rounded-lg bg-background">
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getClientColor(chantier.client_id || '') }}
                          />
                          <div>
                            <h4 className="font-semibold text-sm">
                              {getClientName(chantier.client_id || '')}
                            </h4>
                            <p className="text-xs text-muted-foreground">{chantier.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="flex items-center space-x-1">
                            <UserCheck className="w-3 h-3 text-primary" />
                            <span>{chantier.besoins_encadrants || 1}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-accent" />
                            <span>{chantier.besoins_salaries || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Daily cells */}
                      {weekDays.map(day => {
                        const encadrant = getEncadrantForAffectation(chantier.id, day.date);
                        const salariesAffectes = getSalariesForAffectation(chantier.id, day.date);
                        const stats = getCellStats(chantier.id, day.date);
                        
                        return (
                          <div
                            key={`${chantier.id}-${day.date}`}
                            className={cn(
                              "p-2 border-2 rounded-lg cursor-pointer transition-smooth hover:shadow-elevated min-h-[80px] animate-fade-in",
                              day.isWeekend ? "bg-muted/20" : "bg-background hover:bg-muted/10",
                              selectedCell?.chantierId === chantier.id && selectedCell?.date === day.date 
                                ? "ring-2 ring-primary animate-scale-in" : "",
                              stats.isComplete ? "bg-available/10" : "bg-destructive/10"
                            )}
                            style={{ 
                              borderColor: getClientColor(chantier.client_id || ''),
                              backgroundColor: stats.isComplete ? undefined : 'hsl(var(--destructive) / 0.1)'
                            }}
                            onClick={() => handleCellClick(chantier.id, day.date)}
                          >
                            {/* Stats */}
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center space-x-1">
                                <UserCheck className="w-3 h-3" />
                                <span className={stats.encadrantsAffectes >= stats.besoinsEncadrants ? "text-available" : "text-destructive"}>
                                  {stats.encadrantsAffectes}/{stats.besoinsEncadrants}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span className={stats.salariesAffectes >= stats.besoinsSalaries ? "text-available" : "text-destructive"}>
                                  {stats.salariesAffectes}/{stats.besoinsSalaries}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Légende et actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Clients</h4>
              <div className="grid grid-cols-2 gap-2">
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
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Légende</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-available/10 border-2 border-available rounded" />
                  <span>Affectation complète</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-destructive/10 border-2 border-destructive rounded" />
                  <span>Affectation incomplète</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-muted/20 rounded" />
                  <span>Week-end</span>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  <Users className="w-4 h-4 text-accent" />
                  <span>Encadrants / Salariés</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground animate-fade-in">
            💡 <strong>Instructions :</strong> Cliquez sur une cellule pour voir les détails de l'affectation. 
            Utilisez l'affectation quotidienne pour gérer les équipes en détail. Les cellules avec bordure verte indiquent des affectations complètes.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}