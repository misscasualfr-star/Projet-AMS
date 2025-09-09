import { useState } from "react";
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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

export function DisponibilitesSalaries() {
  const { toast } = useToast();
  
  const weekDays = generateWeekDays();

  const handleAvailabilityClick = (salarieId: number, date: string) => {
    const currentStatus = getAvailabilityStatus(salarieId, date);
    const statusCycle = ['available', 'absent', 'suivi', 'formation'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    toast({ 
      title: "Disponibilité mise à jour", 
      description: `${nextStatus === 'available' ? 'Disponible' : nextStatus} le ${new Date(date).toLocaleDateString('fr-FR')}` 
    });
  };
  
  // Mock availability data
  const getAvailabilityStatus = (salarieId: number, date: string) => {
    const day = new Date(date).getDay();
    const isWeekend = day === 0 || day === 6;
    
    if (isWeekend) return 'weekend';
    
    // Random pattern for demo
    const random = (salarieId * date.length) % 10;
    if (random < 6) return 'available';
    if (random < 8) return 'absent';
    return 'suivi';
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
      case 'weekend':
        return 'bg-muted';
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
      case 'weekend':
        return 'Week-end';
      default:
        return 'Autre';
    }
  };

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
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-3 h-3 rounded bg-formation"></div>
                  <span>Formation</span>
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