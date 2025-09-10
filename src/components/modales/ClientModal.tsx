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
  { value: "hsl(220 38 127)", label: "Pink" },
  { value: "hsl(16 185 129)", label: "Émeraude" },
  { value: "hsl(59 130 246)", label: "Bleu" },
  { value: "hsl(245 158 11)", label: "Ambre" },
  { value: "hsl(239 68 68)", label: "Rouge" },
  { value: "hsl(168 85 247)", label: "Violet" },
  { value: "hsl(34 197 94)", label: "Vert" },
  { value: "hsl(251 146 60)", label: "Orange" },
  { value: "hsl(6 182 212)", label: "Cyan" },
  { value: "hsl(244 63 94)", label: "Rose" },
  { value: "hsl(139 69 19)", label: "Marron" },
  { value: "hsl(99 102 241)", label: "Indigo" },
];

export function ClientModal({ open, onOpenChange, client, onSave }: ClientModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nom: client?.nom || "",
    contact: client?.contact || "",
    telephone: client?.telephone || "",
    email: client?.email || "",
    adresse: client?.adresse || "",
    couleur: client?.couleur || "hsl(220 38 127)",
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
            <div className="flex space-x-2">
              {couleurs.map(couleur => (
                <button
                  key={couleur.value}
                  type="button"
                  onClick={() => setFormData({...formData, couleur: couleur.value})}
                  style={{ backgroundColor: couleur.value }}
                  className={`w-8 h-8 rounded ${formData.couleur === couleur.value ? 'ring-2 ring-foreground' : ''}`}
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