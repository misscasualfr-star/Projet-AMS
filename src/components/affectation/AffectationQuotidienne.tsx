import { useState } from "react";
import { Calendar, LayoutDashboard, Users, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DatePickerModal } from "@/components/modales/DatePickerModal";
import { useToast } from "@/hooks/use-toast";

// Mock data for a specific day
const selectedDate = "2025-09-16";

const chantiersJour = [
  {
    id: 1,
    client: "Client A",
    chantier: "Entretien espaces verts", 
    lieu: "Zone Nord",
    besoins_encadrants: 1,
    besoins_salaries: 6,
    couleur_client: "client-1",
    encadrants_affectes: [1],
    commentaire: "RDV 7h30 - Matériel tondeuse et débroussailleuse"
  },
  {
    id: 2,
    client: "Mairie Locale",
    chantier: "Aménagement parc",
    lieu: "Parc Municipal", 
    besoins_encadrants: 1,
    besoins_salaries: 4,
    couleur_client: "client-3",
    encadrants_affectes: [],
    commentaire: "Plantation d'arbustes - Apporter pelles et arrosoirs"
  },
  {
    id: 3,
    client: "Seconde Pousse",
    chantier: "Formation sécurité",
    lieu: "Locaux AMS",
    besoins_encadrants: 1,
    besoins_salaries: 12,
    couleur_client: "client-6", 
    encadrants_affectes: [],
    commentaire: "Formation EPI obligatoire pour nouveaux arrivants"
  }
];

const encadrantsDisponibles = [
  {
    id: 1,
    nom: "Jean Dupont",
    initiales: "JD",
    couleur: "bg-primary",
    salaries_affectes: [1, 2, 3, 4, 5, 6],
    deja_affecte_ailleurs: false
  },
  {
    id: 2, 
    nom: "Marie Martin",
    initiales: "MM",
    couleur: "bg-accent",
    salaries_affectes: [],
    deja_affecte_ailleurs: false
  },
  {
    id: 3,
    nom: "Pierre Durand", 
    initiales: "PD",
    couleur: "bg-available",
    salaries_affectes: [],
    deja_affecte_ailleurs: false
  }
];

const salariesDisponibles = [
  { id: 1, nom: "Alexandre Dubois", conducteur: true, encadrant_referent_id: 1 },
  { id: 2, nom: "Fatima Benali", conducteur: false, encadrant_referent_id: 1 },
  { id: 3, nom: "Mohamed Karimi", conducteur: true, encadrant_referent_id: 2 },
  { id: 4, nom: "Sarah Moreau", conducteur: false, encadrant_referent_id: 2 },
  { id: 5, nom: "David Rousseau", conducteur: true, encadrant_referent_id: 3 },
  { id: 6, nom: "Lisa Petit", conducteur: false, encadrant_referent_id: 1 },
  { id: 7, nom: "Ahmed Ziani", conducteur: false, encadrant_referent_id: 1 },
  { id: 8, nom: "Julie Lefebvre", conducteur: true, encadrant_referent_id: 3 },
];

export function AffectationQuotidienne() {
  const [selectedChantier, setSelectedChantier] = useState<number | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const { toast } = useToast();

  const handleDateChange = () => {
    setShowDatePicker(true);
  };

  const handleNewDate = (date: Date) => {
    setCurrentDate(date);
    toast({ title: "Date mise à jour", description: `Affectation pour le ${date.toLocaleDateString('fr-FR')}` });
  };

  const handleValidateDay = () => {
    toast({ 
      title: "Journée validée", 
      description: `Les affectations du ${currentDate.toLocaleDateString('fr-FR')} ont été sauvegardées`
    });
  };

  // Calculate coverage indicators
  const totalChantiers = chantiersJour.length;
  const chantiersAvecEncadrant = chantiersJour.filter(c => c.encadrants_affectes.length > 0).length;
  const totalBesoinsEncadrants = chantiersJour.reduce((sum, c) => sum + c.besoins_encadrants, 0);
  const totalEncadrantsAffectes = chantiersJour.reduce((sum, c) => sum + c.encadrants_affectes.length, 0);
  
  const totalBesoinsSalaries = chantiersJour.reduce((sum, c) => sum + c.besoins_salaries, 0);
  const totalSalariesAffectes = encadrantsDisponibles.reduce((sum, e) => sum + e.salaries_affectes.length, 0);

  const getSalariesPourEncadrant = (encadrantId: number) => {
    return salariesDisponibles.filter(s => 
      encadrantsDisponibles.find(e => e.id === encadrantId)?.salaries_affectes.includes(s.id)
    );
  };

  const getEncadrantPourChantier = (chantierId: number) => {
    const chantier = chantiersJour.find(c => c.id === chantierId);
    if (!chantier || chantier.encadrants_affectes.length === 0) return null;
    
    const encadrantId = chantier.encadrants_affectes[0];
    return encadrantsDisponibles.find(e => e.id === encadrantId);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with date and indicators */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <LayoutDashboard className="w-5 h-5" />
              <span>Affectation quotidienne</span>
              <Badge variant="outline" className="ml-4">
                {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleDateChange}>
                <Calendar className="w-4 h-4 mr-2" />
                Changer de jour
              </Button>
              <Button className="bg-gradient-primary text-primary-foreground" onClick={handleValidateDay}>
                Valider la journée
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Coverage indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {chantiersAvecEncadrant}/{totalChantiers}
              </div>
              <div className="text-sm text-muted-foreground">Chantiers couverts</div>
              <div className="w-full bg-border rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-smooth"
                  style={{ width: `${(chantiersAvecEncadrant / totalChantiers) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {totalEncadrantsAffectes}/{totalBesoinsEncadrants}
              </div>
              <div className="text-sm text-muted-foreground">Encadrants affectés</div>
              <div className="w-full bg-border rounded-full h-2 mt-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-smooth"
                  style={{ width: `${(totalEncadrantsAffectes / totalBesoinsEncadrants) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {totalSalariesAffectes}/{totalBesoinsSalaries}
              </div>
              <div className="text-sm text-muted-foreground">Salariés affectés</div>
              <div className="w-full bg-border rounded-full h-2 mt-2">
                <div 
                  className="bg-available h-2 rounded-full transition-smooth"
                  style={{ width: `${(totalSalariesAffectes / totalBesoinsSalaries) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center space-x-2">
                {(chantiersAvecEncadrant === totalChantiers && totalSalariesAffectes >= totalBesoinsSalaries) ? (
                  <CheckCircle className="w-6 h-6 text-available" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-suivi" />
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {(chantiersAvecEncadrant === totalChantiers && totalSalariesAffectes >= totalBesoinsSalaries) 
                  ? "Journée complète" 
                  : "Affectation incomplète"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drag & Drop Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Chantiers du jour */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Chantiers du jour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {chantiersJour.map(chantier => {
              const encadrant = getEncadrantPourChantier(chantier.id);
              const salariesAffectes = encadrant ? getSalariesPourEncadrant(encadrant.id) : [];
              
              return (
                <Card 
                  key={chantier.id}
                  className={cn(
                    "cursor-pointer transition-smooth hover:shadow-elevated border-l-4",
                    `border-l-${chantier.couleur_client} bg-${chantier.couleur_client}/10`,
                    selectedChantier === chantier.id ? "ring-2 ring-primary" : ""
                  )}
                  onClick={() => setSelectedChantier(chantier.id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">
                          {chantier.client}
                        </h4>
                        <p className="text-sm font-medium text-card-foreground">
                          {chantier.chantier}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {chantier.lieu}
                        </p>
                      </div>
                      {chantier.encadrants_affectes.length === 0 && (
                        <AlertTriangle className="w-5 h-5 text-suivi" />
                      )}
                    </div>

                    {/* Encadrant affecté */}
                    {encadrant && (
                      <div className="pt-2 border-t border-border">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className={cn("w-6 h-6", encadrant.couleur)}>
                            <AvatarFallback className="text-white font-semibold text-xs">
                              {encadrant.initiales}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{encadrant.nom}</span>
                        </div>
                        
                        {/* Salariés affectés */}
                        {salariesAffectes.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Équipe :</div>
                            <div className="flex flex-wrap gap-1">
                              {salariesAffectes.map(salarie => (
                                <Badge 
                                  key={salarie.id} 
                                  variant="secondary" 
                                  className="text-xs flex items-center space-x-1"
                                >
                                  <span>{salarie.nom.split(' ')[0]}</span>
                                  {salarie.conducteur && <span>🚗</span>}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Besoins */}
                    <div className="flex justify-between items-center pt-2 border-t border-border">
                      <div className="flex items-center space-x-1 text-xs">
                        <UserCheck className="w-3 h-3 text-primary" />
                        <span>{chantier.encadrants_affectes.length}/{chantier.besoins_encadrants}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs">
                        <Users className="w-3 h-3 text-accent" />
                        <span>{salariesAffectes.length}/{chantier.besoins_salaries}</span>
                      </div>
                    </div>

                    {/* Commentaire */}
                    {chantier.commentaire && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground italic">
                          💬 {chantier.commentaire}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        </Card>

        {/* Column 2: Encadrants disponibles */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Encadrants disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {encadrantsDisponibles.map(encadrant => (
              <Card 
                key={encadrant.id}
                className="cursor-move transition-smooth hover:shadow-elevated bg-gradient-surface"
              >
                <CardContent className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className={cn("w-8 h-8", encadrant.couleur)}>
                      <AvatarFallback className="text-white font-semibold text-sm">
                        {encadrant.initiales}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{encadrant.nom}</span>
                        {encadrant.deja_affecte_ailleurs && (
                          <Badge variant="secondary" className="text-xs">
                            Multi-affecté
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {encadrant.salaries_affectes.length} salarié{encadrant.salaries_affectes.length > 1 ? 's' : ''} affecté{encadrant.salaries_affectes.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Column 3: Salariés disponibles */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Salariés disponibles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {salariesDisponibles
              .filter(salarie => !encadrantsDisponibles.some(e => e.salaries_affectes.includes(salarie.id)))
              .map(salarie => (
                <Card 
                  key={salarie.id}
                  className="cursor-move transition-smooth hover:shadow-card bg-gradient-surface"
                >
                  <CardContent className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{salarie.nom}</span>
                      <div className="flex items-center space-x-1">
                        {salarie.conducteur && (
                          <Badge variant="secondary" className="text-xs">🚗</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground">
            💡 <strong>Instructions :</strong> Glissez les encadrants vers les chantiers, puis glissez les salariés sous les encadrants. 
            Les salariés grisés ne sont pas disponibles ce jour-là.
          </div>
        </CardContent>
      </Card>
      
      <DatePickerModal 
        open={showDatePicker} 
        onOpenChange={setShowDatePicker}
        selectedDate={currentDate}
        onDateChange={handleNewDate}
        title="Sélectionner le jour d'affectation"
      />
    </div>
  );
}