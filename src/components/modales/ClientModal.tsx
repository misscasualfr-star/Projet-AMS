import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: any;
  onSave?: (client: any) => void;
}

const couleurs = [
  { value: "hsl(220 100% 50)", label: "Bleu électrique" },
  { value: "hsl(16 100% 60)", label: "Orange pétant" },
  { value: "hsl(310 100% 55)", label: "Rose fuchsia" },
  { value: "hsl(240 100% 60)", label: "Violet pétant" },
  { value: "hsl(0 100% 60)", label: "Rouge vif" },
  { value: "hsl(120 100% 40)", label: "Vert pétant" },
  { value: "hsl(180 100% 50)", label: "Cyan électrique" },
  { value: "hsl(60 100% 50)", label: "Jaune vif" },
  { value: "hsl(280 100% 60)", label: "Magenta" },
  { value: "hsl(30 100% 55)", label: "Orange brûlé" },
  { value: "hsl(200 100% 50)", label: "Bleu azur" },
  { value: "hsl(340 100% 55)", label: "Rose bonbon" },
  { value: "hsl(90 100% 40)", label: "Vert lime" },
  { value: "hsl(270 100% 65)", label: "Pourpre" },
  { value: "hsl(150 100% 45)", label: "Turquoise" },
  { value: "hsl(45 100% 55)", label: "Or" },
  { value: "hsl(300 100% 50)", label: "Magenta vif" },
  { value: "hsl(210 100% 55)", label: "Bleu roi" },
];

export function ClientModal({ open, onOpenChange, client, onSave }: ClientModalProps) {
  const { toast } = useToast();
  const [expandedColorPalette, setExpandedColorPalette] = useState(false);
  const [formData, setFormData] = useState({
    nom: client?.nom || "",
    contact: client?.contact || "",
    telephone: client?.telephone || "",
    email: client?.email || "",
    adresse: client?.adresse || "",
    couleur: client?.couleur || "hsl(220 100% 50)",
    actif: client?.actif ?? true,
  });

  const handleSave = () => {
    if (!formData.nom) {
      toast({ title: "Erreur", description: "Le nom du client est obligatoire", variant: "destructive" });
      return;
    }

    const clientData = {
      ...formData,
      ...(client?.id && { id: client.id }), // Seulement inclure l'ID si on modifie un client existant
    };

    onSave?.(clientData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {client ? "Modifier le client" : "Nouveau client"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du client *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Nom du client"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Personne de contact</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                value={formData.telephone}
                onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                placeholder="06 12 34 56 78"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="contact@client.fr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Textarea
              id="adresse"
              value={formData.adresse}
              onChange={(e) => setFormData({...formData, adresse: e.target.value})}
              placeholder="Adresse complète"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="couleur">Couleur</Label>
            <div className="space-y-2">
              {/* Palette compacte */}
              <div className="flex flex-wrap gap-2">
                {couleurs.slice(0, expandedColorPalette ? couleurs.length : 6).map(couleur => (
                  <button
                    key={couleur.value}
                    type="button"
                    onClick={() => setFormData({...formData, couleur: couleur.value})}
                    style={{ backgroundColor: couleur.value }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${formData.couleur === couleur.value ? 'ring-2 ring-foreground ring-offset-2' : ''}`}
                    title={couleur.label}
                  />
                ))}
              </div>
              
              {/* Bouton pour étendre/réduire la palette */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setExpandedColorPalette(!expandedColorPalette)}
                className="text-xs"
              >
                {expandedColorPalette ? 'Moins de couleurs' : 'Plus de couleurs'}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="actif"
              checked={formData.actif}
              onCheckedChange={(checked) => setFormData({...formData, actif: checked})}
            />
            <Label htmlFor="actif">Client actif</Label>
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