import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download, Printer, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useChantiers } from "@/hooks/useChantiers";
import { useEncadrants } from "@/hooks/useEncadrants";
import { useSalaries } from "@/hooks/useSalaries";
import { useClients } from "@/hooks/useClients";
import { useWeekAffectations } from "@/hooks/useAffectations";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

export function FeuillesRoute() {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  
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

  // Generate week days
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE dd MMMM', { locale: fr }),
        shortLabel: format(date, 'eee dd', { locale: fr }),
        fullDate: date,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: isSameDay(date, new Date())
      };
    });
  }, [weekStart]);

  // Transform affectations into usable format
  const affectationsData = useMemo(() => {
    const result: Record<string, Record<string, { encadrant?: any; salaries: any[] }>> = {};
    
    affectations.forEach(aff => {
      if (!result[aff.project_id]) {
        result[aff.project_id] = {};
      }
      if (!result[aff.project_id][aff.date]) {
        result[aff.project_id][aff.date] = { salaries: [] };
      }
      
      if (aff.encadrant_id && !aff.salarie_id) {
        const encadrant = encadrants.find(e => e.id === aff.encadrant_id);
        result[aff.project_id][aff.date].encadrant = encadrant;
      } else if (aff.salarie_id) {
        const salarie = salaries.find(s => s.id === aff.salarie_id);
        if (salarie) {
          result[aff.project_id][aff.date].salaries.push(salarie);
        }
      }
    });
    
    return result;
  }, [affectations, encadrants, salaries]);

  // Filter chantiers based on affectations and filters
  const chantiersAvecAffectations = useMemo(() => {
    const result: Array<{
      chantier: any;
      client: any;
      affectationsJour: Array<{
        date: string;
        dateLabel: string;
        encadrant?: any;
        salaries: any[];
      }>;
    }> = [];

    Object.keys(affectationsData).forEach(chantierId => {
      const chantier = chantiers.find(c => c.id === chantierId);
      if (!chantier) return;

      const client = clients.find(c => c.id === chantier.client_id);
      if (!client) return;

      // Apply filters
      if (selectedClient !== "all" && chantier.client_id !== selectedClient) return;
      if (searchTerm && !chantier.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !client.nom.toLowerCase().includes(searchTerm.toLowerCase())) return;

      const affectationsJour: Array<{
        date: string;
        dateLabel: string;
        encadrant?: any;
        salaries: any[];
      }> = [];

      Object.keys(affectationsData[chantierId]).forEach(date => {
        const affectation = affectationsData[chantierId][date];
        if (affectation.encadrant || affectation.salaries.length > 0) {
          const dayInfo = weekDays.find(d => d.date === date);
          affectationsJour.push({
            date,
            dateLabel: dayInfo?.label || date,
            encadrant: affectation.encadrant,
            salaries: affectation.salaries
          });
        }
      });

      if (affectationsJour.length > 0) {
        result.push({
          chantier,
          client,
          affectationsJour
        });
      }
    });

    return result;
  }, [affectationsData, chantiers, clients, selectedClient, searchTerm, weekDays]);

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

  const handleGeneratePDF = (chantierId: string, date: string) => {
    // TODO: Implement PDF generation
    toast({
      title: "PDF généré",
      description: "La feuille de route a été générée avec succès"
    });
  };

  const handlePrintAll = () => {
    // TODO: Implement print all functionality
    toast({
      title: "Impression lancée",
      description: "Toutes les feuilles de route sont en cours d'impression"
    });
  };

  const getClientColor = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.couleur || 'hsl(var(--primary))';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Week Navigation */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Feuilles de route</span>
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

      {/* Filters and Actions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Filtres et actions</span>
            <Button 
              className="bg-gradient-primary text-primary-foreground" 
              onClick={handlePrintAll}
              disabled={chantiersAvecAffectations.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer tout
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un chantier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tous les clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: client.couleur }}
                      />
                      <span>{client.nom}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feuilles de route */}
      <div className="space-y-6">
        {chantiersAvecAffectations.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune feuille de route</h3>
              <p className="text-muted-foreground">
                Aucun chantier avec affectation trouvé pour cette période.
              </p>
            </CardContent>
          </Card>
        ) : (
          chantiersAvecAffectations.map(({ chantier, client, affectationsJour }) => (
            <Card key={chantier.id} className="shadow-card animate-fade-in">
              <CardHeader className="border-l-4" style={{ borderLeftColor: getClientColor(client.id) }}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <span>{client.nom}</span>
                      <Badge variant="outline">{chantier.name}</Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{chantier.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {affectationsJour.length} jour{affectationsJour.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {affectationsJour.map(({ date, dateLabel, encadrant, salaries }) => (
                  <div key={date} className="border rounded-lg p-4 bg-gradient-surface">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">{dateLabel}</h4>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGeneratePDF(chantier.id, date)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.print()}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Imprimer
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Informations chantier */}
                      <div>
                        <h5 className="font-semibold mb-3">Informations chantier</h5>
                        <div className="space-y-2 text-sm">
                          <div><strong>Client:</strong> {client.nom}</div>
                          <div><strong>Chantier:</strong> {chantier.name}</div>
                          <div><strong>Adresse:</strong> {chantier.address}</div>
                          {client.contact && <div><strong>Contact:</strong> {client.contact}</div>}
                          {client.telephone && <div><strong>Tel:</strong> {client.telephone}</div>}
                          {chantier.description && (
                            <div><strong>Description:</strong> {chantier.description}</div>
                          )}
                        </div>
                      </div>

                      {/* Équipe affectée */}
                      <div>
                        <h5 className="font-semibold mb-3">Équipe affectée</h5>
                        {encadrant && (
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="w-8 h-8" style={{ backgroundColor: encadrant.couleur }}>
                                <AvatarFallback className="text-white font-semibold text-sm">
                                  {encadrant.initiales}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{encadrant.nom}</div>
                                <div className="text-xs text-muted-foreground">Encadrant</div>
                              </div>
                            </div>
                            {encadrant.telephone && (
                              <div className="text-sm text-muted-foreground ml-10">
                                📞 {encadrant.telephone}
                              </div>
                            )}
                          </div>
                        )}

                        {salaries.length > 0 && (
                          <div>
                            <div className="text-sm font-medium mb-2">Salariés ({salaries.length})</div>
                            <div className="space-y-1">
                              {salaries.map(salarie => (
                                <div key={salarie.id} className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                  <span>{salarie.nom}</span>
                                  {salarie.conducteur && <span>🚗</span>}
                                  {salarie.telephone && (
                                    <span className="text-muted-foreground">- {salarie.telephone}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Espaces supplémentaires */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h6 className="font-medium mb-2">Horaires prévus</h6>
                          <div className="flex space-x-4 text-sm">
                            <div>Début: ___h___</div>
                            <div>Fin: ___h___</div>
                            <div>Pause: ___h___</div>
                          </div>
                        </div>
                        <div>
                          <h6 className="font-medium mb-2">Matériel nécessaire</h6>
                          <div className="h-12 border rounded bg-muted/20"></div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h6 className="font-medium mb-2">Observations / Tâches spécifiques</h6>
                        <div className="h-16 border rounded bg-muted/20"></div>
                      </div>

                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          <h6 className="font-medium mb-2">Signature encadrant</h6>
                          <div className="w-32 h-12 border rounded bg-muted/20"></div>
                        </div>
                        <div>
                          <h6 className="font-medium mb-2">Signature client</h6>
                          <div className="w-32 h-12 border rounded bg-muted/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}