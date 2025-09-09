import { useState } from "react";
import { Users, Phone, Mail, Car, Plus, Edit, Trash2, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SalarieModal } from "@/components/modales/SalarieModal";
import { useToast } from "@/hooks/use-toast";

// Mock data for demonstration
const salaries = [
  {
    id: 1,
    nom: "Alexandre Dubois",
    telephone: "06 11 22 33 44",
    email: "a.dubois@ams.fr",
    conducteur: true,
    actif: true,
    encadrant_referent_id: 1,
    encadrant_referent: "Jean Dupont",
    contrat_debut: "2024-01-15",
    contrat_fin: "2025-12-31",
    niveau_autonomie: "Confirmé"
  },
  {
    id: 2,
    nom: "Fatima Benali",
    telephone: "06 22 33 44 55",
    email: "f.benali@ams.fr",
    conducteur: false,
    actif: true,
    encadrant_referent_id: 1,
    encadrant_referent: "Jean Dupont",
    contrat_debut: "2024-03-01",
    contrat_fin: "2025-08-31",
    niveau_autonomie: "Débutant"
  },
  {
    id: 3,
    nom: "Mohamed Karimi",
    telephone: "06 33 44 55 66",
    email: "m.karimi@ams.fr",
    conducteur: true,
    actif: true,
    encadrant_referent_id: 2,
    encadrant_referent: "Marie Martin",
    contrat_debut: "2023-09-01",
    contrat_fin: "2025-03-31",
    niveau_autonomie: "Confirmé"
  },
  {
    id: 4,
    nom: "Sarah Moreau",
    telephone: "06 44 55 66 77",
    email: "s.moreau@ams.fr",
    conducteur: false,
    actif: true,
    encadrant_referent_id: 2,
    encadrant_referent: "Marie Martin",
    contrat_debut: "2024-06-15",
    contrat_fin: "2026-01-15",
    niveau_autonomie: "Intermédiaire"
  },
  {
    id: 5,
    nom: "David Rousseau",
    telephone: "06 55 66 77 88",
    email: "d.rousseau@ams.fr",
    conducteur: true,
    actif: false,
    encadrant_referent_id: 3,
    encadrant_referent: "Pierre Durand",
    contrat_debut: "2023-01-01",
    contrat_fin: "2024-12-31",
    niveau_autonomie: "Confirmé"
  }
];

const encadrants = [
  { id: 1, nom: "Jean Dupont" },
  { id: 2, nom: "Marie Martin" },
  { id: 3, nom: "Pierre Durand" },
  { id: 4, nom: "Sophie Lambert" }
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

export function Salaries() {
  const [selectedEncadrant, setSelectedEncadrant] = useState<string>("all");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [showSalarieModal, setShowSalarieModal] = useState(false);
  const [editingSalarie, setEditingSalarie] = useState<any>(null);
  const [view, setView] = useState<'list' | 'disponibilites'>('list');
  const { toast } = useToast();
  
  const weekDays = generateWeekDays();

  const handleNewSalarie = () => {
    setEditingSalarie(null);
    setShowSalarieModal(true);
  };

  const handleEditSalarie = (salarie: any) => {
    setEditingSalarie(salarie);
    setShowSalarieModal(true);
  };

  const handleDeleteSalarie = (salarie: any) => {
    toast({ 
      title: "Suppression", 
      description: `${salarie.nom} a été supprimé`,
      variant: "destructive" 
    });
  };

  const handleSaveSalarie = (salarie: any) => {
    console.log("Salarié sauvegardé:", salarie);
  };

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

  const filteredSalaries = salaries.filter(salarie => {
    const encadrantMatch = selectedEncadrant === "all" || salarie.encadrant_referent_id.toString() === selectedEncadrant;
    const statutMatch = selectedStatut === "all" || 
      (selectedStatut === "actif" && salarie.actif) || 
      (selectedStatut === "inactif" && !salarie.actif);
    return encadrantMatch && statutMatch;
  });

  const getInitials = (nom: string) => {
    return nom.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const getContractStatus = (debut: string, fin: string) => {
    const now = new Date();
    const finDate = new Date(fin);
    const diffTime = finDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: "Expiré", variant: "destructive" as const };
    } else if (diffDays < 30) {
      return { label: `${diffDays}j restants`, variant: "destructive" as const };
    } else if (diffDays < 90) {
      return { label: `${diffDays}j restants`, variant: "secondary" as const };
    } else {
      return { label: "En cours", variant: "default" as const };
    }
  };

  const getNiveauColor = (niveau: string) => {
    switch (niveau) {
      case "Confirmé":
        return "bg-available text-white";
      case "Intermédiaire":
        return "bg-suivi text-white";
      case "Débutant":
        return "bg-formation text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Gestion des salariés en insertion</span>
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
                variant={view === 'disponibilites' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('disponibilites')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Disponibilités
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground" onClick={handleNewSalarie}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau salarié
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === 'list' ? (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtres :</span>
                </div>
                
                <Select value={selectedEncadrant} onValueChange={setSelectedEncadrant}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Encadrant référent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les encadrants</SelectItem>
                    {encadrants.map(encadrant => (
                      <SelectItem key={encadrant.id} value={encadrant.id.toString()}>
                        {encadrant.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatut} onValueChange={setSelectedStatut}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="actif">Actifs</SelectItem>
                    <SelectItem value="inactif">Inactifs</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="secondary" className="px-3 py-1">
                  {filteredSalaries.length} salarié{filteredSalaries.length > 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Salarié</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Encadrant référent</TableHead>
                    <TableHead>Contrat</TableHead>
                    <TableHead>Niveau</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.map(salarie => {
                    const contractStatus = getContractStatus(salarie.contrat_debut, salarie.contrat_fin);
                    return (
                      <TableRow key={salarie.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8 bg-muted">
                              <AvatarFallback className="text-foreground font-semibold text-xs">
                                {getInitials(salarie.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{salarie.nom}</span>
                                {salarie.conducteur && (
                                  <div title="Titulaire du permis B">
                                    <Car className="w-4 h-4 text-primary" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 text-sm">
                              <Phone className="w-3 h-3" />
                              <span>{salarie.telephone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{salarie.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{salarie.encadrant_referent}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              {new Date(salarie.contrat_debut).toLocaleDateString('fr-FR')} - {new Date(salarie.contrat_fin).toLocaleDateString('fr-FR')}
                            </div>
                            <Badge className={contractStatus.variant === "destructive" ? "bg-absent text-white" : "bg-available text-white"}>
                              {contractStatus.label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getNiveauColor(salarie.niveau_autonomie)}>
                            {salarie.niveau_autonomie}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={salarie.actif ? "bg-available text-white" : "bg-absent text-white"}>
                            {salarie.actif ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditSalarie(salarie)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSalarie(salarie)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </>
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
                            {getInitials(salarie.nom)}
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
          )}
        </CardContent>
      </Card>
      
      <SalarieModal 
        open={showSalarieModal} 
        onOpenChange={setShowSalarieModal}
        salarie={editingSalarie}
        onSave={handleSaveSalarie}
      />
    </div>
  );
}