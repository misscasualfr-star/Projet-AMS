import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface SalarieModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salarie?: any;
  onSave?: (salarie: any) => void;
}

const encadrants = [
  { id: 1, nom: "Jean Dupont" },
  { id: 2, nom: "Marie Martin" },
  { id: 3, nom: "Pierre Durand" },
  { id: 4, nom: "Sophie Lambert" }
];

const niveauxAutonomie = [
  "Débutant",
  "Intermédiaire", 
  "Confirmé"
];

export function SalarieModal({ open, onOpenChange, salarie, onSave }: SalarieModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: salarie?.nom || "",
    telephone: salarie?.telephone || "",
    email: salarie?.email || "",
    conducteur: salarie?.conducteur || false,
    actif: salarie?.actif ?? true,
    encadrant_referent_id: salarie?.encadrant_referent_id || "",
    contrat_debut: salarie?.contrat_debut ? new Date(salarie.contrat_debut) : undefined,
    contrat_fin: salarie?.contrat_fin ? new Date(salarie.contrat_fin) : undefined,
    niveau_autonomie: salarie?.niveau_autonomie || "Débutant",
  });

  const handleSave = () => {
    if (!formData.nom || !formData.telephone || !formData.email || !formData.encadrant_referent_id || !formData.contrat_debut || !formData.contrat_fin) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    const encadrantReferent = encadrants.find(e => e.id.toString() === formData.encadrant_referent_id.toString());
    
    const newSalarie = {
      ...salarie,
      ...formData,
      encadrant_referent: encadrantReferent?.nom,
      contrat_debut: format(formData.contrat_debut!, "yyyy-MM-dd"),
      contrat_fin: format(formData.contrat_fin!, "yyyy-MM-dd"),
      id: salarie?.id || Date.now(),
    };

    onSave?.(newSalarie);
    toast({ title: "Succès", description: "Salarié sauvegardé avec succès" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {salarie ? "Modifier le salarié" : "Nouveau salarié"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom complet *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Alexandre Dubois"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              placeholder="06 11 22 33 44"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="a.dubois@ams.fr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="encadrant">Encadrant référent *</Label>
            <Select value={formData.encadrant_referent_id.toString()} onValueChange={(value) => setFormData({...formData, encadrant_referent_id: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un encadrant" />
              </SelectTrigger>
              <SelectContent>
                {encadrants.map(encadrant => (
                  <SelectItem key={encadrant.id} value={encadrant.id.toString()}>
                    {encadrant.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Début de contrat *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.contrat_debut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.contrat_debut ? format(formData.contrat_debut, "dd/MM/yyyy") : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.contrat_debut}
                    onSelect={(date) => setFormData({...formData, contrat_debut: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Fin de contrat *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.contrat_fin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.contrat_fin ? format(formData.contrat_fin, "dd/MM/yyyy") : "Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.contrat_fin}
                    onSelect={(date) => setFormData({...formData, contrat_fin: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="niveau">Niveau d'autonomie</Label>
            <Select value={formData.niveau_autonomie} onValueChange={(value) => setFormData({...formData, niveau_autonomie: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {niveauxAutonomie.map(niveau => (
                  <SelectItem key={niveau} value={niveau}>
                    {niveau}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="conducteur"
              checked={formData.conducteur}
              onCheckedChange={(checked) => setFormData({...formData, conducteur: !!checked})}
            />
            <Label htmlFor="conducteur">Titulaire du permis B</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData({...formData, actif: checked})}
            />
            <Label htmlFor="actif">Salarié actif</Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary text-primary-foreground">
            Sauvegarder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}