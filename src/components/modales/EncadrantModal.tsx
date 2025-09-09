import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface EncadrantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  encadrant?: any;
  onSave?: (encadrant: any) => void;
}

const couleurs = [
  { value: "bg-primary", label: "Bleu" },
  { value: "bg-accent", label: "Violet" },
  { value: "bg-available", label: "Vert" },
  { value: "bg-formation", label: "Orange" },
  { value: "bg-suivi", label: "Jaune" },
];

export function EncadrantModal({ open, onOpenChange, encadrant, onSave }: EncadrantModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: encadrant?.nom || "",
    telephone: encadrant?.telephone || "",
    email: encadrant?.email || "",
    couleur: encadrant?.couleur || "bg-primary",
    actif: encadrant?.actif ?? true,
  });

  const handleSave = () => {
    if (!formData.nom || !formData.telephone || !formData.email) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    const initiales = formData.nom.split(' ').map(part => part[0]).join('').toUpperCase();
    
    const newEncadrant = {
      ...encadrant,
      ...formData,
      initiales,
      id: encadrant?.id || Date.now(),
    };

    onSave?.(newEncadrant);
    toast({ title: "Succès", description: "Encadrant sauvegardé avec succès" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {encadrant ? "Modifier l'encadrant" : "Nouvel encadrant"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom complet *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone *</Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({...formData, telephone: e.target.value})}
              placeholder="06 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="j.dupont@ams.fr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="couleur">Couleur</Label>
            <div className="flex space-x-2">
              {couleurs.map(couleur => (
                <button
                  key={couleur.value}
                  type="button"
                  onClick={() => setFormData({...formData, couleur: couleur.value})}
                  className={`w-8 h-8 rounded ${couleur.value} ${formData.couleur === couleur.value ? 'ring-2 ring-foreground' : ''}`}
                  title={couleur.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData({...formData, actif: checked})}
            />
            <Label htmlFor="actif">Encadrant actif</Label>
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