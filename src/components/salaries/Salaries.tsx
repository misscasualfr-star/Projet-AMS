import { useState } from "react";
import { Users, Phone, Mail, Car, Plus, Edit, Trash2, Filter } from "lucide-react";
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

export function Salaries() {
  const [selectedEncadrant, setSelectedEncadrant] = useState<string>("all");
  const [selectedStatut, setSelectedStatut] = useState<string>("all");
  const [showSalarieModal, setShowSalarieModal] = useState(false);
  const [editingSalarie, setEditingSalarie] = useState<any>(null);
  const { toast } = useToast();

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
            <Button className="bg-gradient-primary text-primary-foreground" onClick={handleNewSalarie}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau salarié
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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