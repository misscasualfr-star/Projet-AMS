import { useState } from "react";
import { Users, Phone, Mail, Car, Plus, Edit, Trash2, Filter, Calendar, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { SalarieModal } from "@/components/modales/SalarieModal";
import { useSalaries, useCreateSalarie, useUpdateSalarie, useDeleteSalarie } from "@/hooks/useSalaries";
import { useEncadrants, useDisponibilites, useUpdateDisponibilite } from "@/hooks/useEncadrants";
import { useToast } from "@/hooks/use-toast";

// Remove mock salaries data - using Supabase data now

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
  const { data: salaries = [], isLoading, error } = useSalaries();
  const { data: encadrants = [] } = useEncadrants();
  const { data: disponibilites = [] } = useDisponibilites('SALARIE', weekDays[0]?.date, weekDays[weekDays.length - 1]?.date);
  const updateDisponibilite = useUpdateDisponibilite();
  const createSalarie = useCreateSalarie();
  const updateSalarie = useUpdateSalarie();
  const deleteSalarie = useDeleteSalarie();

  // Vérifier si l'utilisateur n'a pas accès aux données
  const isAccessDenied = error?.message.includes('admin');

  if (isAccessDenied) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Salariés</h2>
            <p className="text-muted-foreground">
              Gestion des salariés en parcours d'insertion
            </p>
          </div>
        </div>
        
        <Alert className="border-orange-200 bg-orange-50">
          <Shield className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Accès restreint :</strong> Seuls les administrateurs peuvent accéder aux données personnelles des salariés pour des raisons de confidentialité et de sécurité.
            <br />
            <span className="text-sm">Contactez votre administrateur si vous avez besoin d'accéder à ces informations.</span>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleNewSalarie = () => {
    setEditingSalarie(null);
    setShowSalarieModal(true);
  };

  const handleEditSalarie = (salarie: any) => {
    setEditingSalarie(salarie);
    setShowSalarieModal(true);
  };

  const handleDeleteSalarie = (salarie: any) => {
    deleteSalarie.mutate(salarie.id);
  };

  const handleSaveSalarie = (salarie: any) => {
    if (editingSalarie) {
      // Modification
      updateSalarie.mutate({
        id: editingSalarie.id,
        ...salarie
      });
    } else {
      // Création
      createSalarie.mutate(salarie);
    }
  };

  const handleAvailabilityClick = (salarieId: string, date: string) => {
    const currentStatus = getAvailabilityStatus(salarieId, date);
    const statusCycle: ('available' | 'absent' | 'conges' | 'maladie')[] = ['available', 'absent', 'conges', 'maladie'];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];
    
    updateDisponibilite.mutate({
      personneType: 'SALARIE',
      personneId: salarieId,
      date,
      statut: nextStatus
    });
  };
  
  // Get availability status from database or default pattern
  const getAvailabilityStatus = (salarieId: string, date: string): 'available' | 'absent' | 'conges' | 'maladie' => {
    // Chercher dans les données de la base d'abord
    const savedDisponibilite = disponibilites.find(d => 
      d.personne_id === salarieId && d.date === date
    );
    
    if (savedDisponibilite) {
      return savedDisponibilite.statut as 'available' | 'absent' | 'conges' | 'maladie';
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

  const filteredSalaries = salaries.filter(salarie => {
    const encadrantMatch = selectedEncadrant === "all" || salarie.encadrant_referent_id === selectedEncadrant;
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
        return "bg-conges text-white";
      case "Débutant":
        return "bg-maladie text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="text-center">Chargement des salariés...</div>
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
                      <SelectItem key={encadrant.id} value={encadrant.id}>
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
                          <span className="text-sm font-medium">{salarie.encadrants?.nom}</span>
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
                            {getInitials(salarie.nom)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{salarie.nom}</div>
                          <div className="text-xs text-muted-foreground">{salarie.encadrants?.nom}</div>
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