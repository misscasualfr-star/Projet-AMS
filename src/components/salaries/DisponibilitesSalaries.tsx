import { useState } from "react";
import { Calendar, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useDisponibilites, useUpdateDisponibilite } from "@/hooks/useEncadrants";
import { useSalaries } from "@/hooks/useSalaries";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";

// Mock data for demonstration
const salaries = [
  {
    id: 1,
    nom: "Alice Moreau",
    initiales: "AM",
    encadrant_referent: "Jean Dupont",
    actif: true
  },
  {
    id: 2,
    nom: "Bob Martin",
    initiales: "BM",
    encadrant_referent: "Marie Martin",
    actif: true
  },
  {
    id: 3,
    nom: "Claire Durand",
    initiales: "CD",
    encadrant_referent: "Pierre Durand",
    actif: true
  },
  {
    id: 4,
    nom: "David Lambert",
    initiales: "DL",
    encadrant_referent: "Jean Dupont",
    actif: true
  },
  {
    id: 5,
    nom: "Emma Bernard",
    initiales: "EB",
    encadrant_referent: "Marie Martin",
    actif: true
  },
  {
    id: 6,
    nom: "François Petit",
    initiales: "FP",
    encadrant_referent: "Pierre Durand",
    actif: true
  }
];

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

export function DisponibilitesSalaries() {
  const { toast } = useToast();
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  
  const weekDays = generateWeekDays(currentWeek);
  const { data: disponibilites = [] } = useDisponibilites('SALARIE', weekDays[0]?.date, weekDays[weekDays.length - 1]?.date);
  const updateDisponibilite = useUpdateDisponibilite();

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleAvailabilityClick = (salarieId: number, date: string) => {
    const currentStatus = getAvailabilityStatus(salarieId, date);
    const statusCycle = ['available', 'absent', 'conges', 'maladie'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    updateDisponibilite.mutate({
      personneType: 'SALARIE',
      personneId: salarieId.toString(),
      date,
      statut: nextStatus
    });
    
    toast({ 
      title: "Disponibilité mise à jour", 
      description: `${getStatusLabel(nextStatus)} le ${new Date(date).toLocaleDateString('fr-FR')}` 
    });
  };
  
  const getAvailabilityStatus = (salarieId: number, date: string) => {
    const savedDisponibilite = disponibilites.find(d => 
      d.personne_id === salarieId.toString() && d.date === date
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

  const weekStartFormatted = format(weekDays[0]?.fullDate || new Date(), 'dd MMM', { locale: fr });
  const weekEndFormatted = format(weekDays[6]?.fullDate || new Date(), 'dd MMM yyyy', { locale: fr });

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Disponibilités des salariés</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Navigation semaine */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-lg font-semibold">
                  Semaine du {weekStartFormatted} au {weekEndFormatted}
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
                <div className="p-3 font-semibold text-sm">Salarié</div>
                {weekDays.map(day => (
                  <div key={day.date} className="p-3 text-center">
                    <div className="font-semibold text-sm">{day.weekday}</div>
                    <div className="text-xs text-muted-foreground">{day.day}</div>
                  </div>
                ))}
              </div>
              
              {salaries.filter(s => s.actif).map(salarie => (
                <div key={salarie.id} className="grid grid-cols-8 border-t border-border">
                  <div className="p-3 border-r border-border">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6 bg-secondary">
                        <AvatarFallback className="text-secondary-foreground font-semibold text-xs">
                          {salarie.initiales}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{salarie.nom}</div>
                        <div className="text-xs text-muted-foreground">{salarie.encadrant_referent}</div>
                      </div>
                    </div>
                  </div>
                  {weekDays.map(day => {
                    const status = getAvailabilityStatus(salarie.id, day.date);
                    return (
                      <div
                        key={`${salarie.id}-${day.date}`}
                        className="p-3 border-r border-border cursor-pointer hover:bg-muted/50"
                        title={getStatusLabel(status)}
                        onClick={() => handleAvailabilityClick(salarie.id, day.date)}
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
        </CardContent>
      </Card>
    </div>
  );
}