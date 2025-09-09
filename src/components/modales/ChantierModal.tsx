import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ChantierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chantier?: any;
  onSave?: (chantier: any) => void;
}

const clients = [
  { id: 1, nom: "Client A" },
  { id: 2, nom: "Client B" },
  { id: 3, nom: "Mairie Locale" },
  { id: 4, nom: "Seconde Pousse" },
];

export function ChantierModal({ open, onOpenChange, chantier, onSave }: ChantierModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_id: chantier?.client_id || "",
    nom: chantier?.nom || "",
    description: chantier?.description || "",
    lieu: chantier?.lieu || "",
    date: chantier?.date ? new Date(chantier.date) : undefined,
    besoins_encadrants: chantier?.besoins_encadrants || 1,
    besoins_salaries: chantier?.besoins_salaries || 6,
    type: chantier?.type || "INTERVENTION",
  });

  const handleSave = () => {
    if (!formData.client_id || !formData.nom || !formData.lieu || !formData.date) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    const newChantier = {
      ...chantier,
      ...formData,
      date: format(formData.date!, "yyyy-MM-dd"),
    };

    onSave?.(newChantier);
    toast({ title: "Succès", description: "Chantier sauvegardé avec succès" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {chantier ? "Modifier le chantier" : "Nouveau chantier"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            <Select value={formData.client_id.toString()} onValueChange={(value) => setFormData({...formData, client_id: parseInt(value)})}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id.toString()}>
                    {client.nom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">Nom du chantier *</Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              placeholder="Entretien espaces verts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu *</Label>
            <Input
              id="lieu"
              value={formData.lieu}
              onChange={(e) => setFormData({...formData, lieu: e.target.value})}
              placeholder="Zone Nord"
            />
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({...formData, date})}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="encadrants">Encadrants requis</Label>
              <Input
                id="encadrants"
                type="number"
                min="0"
                value={formData.besoins_encadrants}
                onChange={(e) => setFormData({...formData, besoins_encadrants: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salaries">Salariés requis</Label>
              <Input
                id="salaries"
                type="number"
                min="0"
                value={formData.besoins_salaries}
                onChange={(e) => setFormData({...formData, besoins_salaries: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERVENTION">Intervention</SelectItem>
                <SelectItem value="SUIVI">Suivi</SelectItem>
                <SelectItem value="FORMATION">Formation</SelectItem>
                <SelectItem value="DIVERS">Divers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Description du chantier..."
            />
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