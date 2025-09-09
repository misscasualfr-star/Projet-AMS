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
import { useClients } from "@/hooks/useClients";

interface ChantierModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chantier?: any;
  onSave?: (chantier: any) => void;
}

export function ChantierModal({ open, onOpenChange, chantier, onSave }: ChantierModalProps) {
  const { toast } = useToast();
  const { data: clients = [], error: clientsError } = useClients();
  const [formData, setFormData] = useState({
    client_id: chantier?.client_id || "",
    name: chantier?.name || "",
    description: chantier?.description || "",
    address: chantier?.address || "",
    start_date: chantier?.start_date ? new Date(chantier.start_date) : undefined,
    end_date: chantier?.end_date ? new Date(chantier.end_date) : undefined,
    besoins_encadrants: chantier?.besoins_encadrants || 1,
    besoins_salaries: chantier?.besoins_salaries || 6,
    type: chantier?.type || "INTERVENTION",
  });

  const isAccessDenied = clientsError?.message.includes('admin');

  const handleSave = () => {
    if (!formData.name || !formData.address || !formData.start_date) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    // Si l'accès aux clients est refusé, on peut quand même créer le chantier sans client
    if (isAccessDenied && !formData.client_id) {
      toast({ 
        title: "Information", 
        description: "Chantier créé sans client assigné (accès admin requis pour assigner un client)",
        variant: "default"
      });
    }

    const chantierData = {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      start_date: format(formData.start_date!, "yyyy-MM-dd"),
      end_date: formData.end_date ? format(formData.end_date, "yyyy-MM-dd") : null,
      client_id: formData.client_id || null, // Permettre null si pas d'accès aux clients
      besoins_encadrants: formData.besoins_encadrants,
      besoins_salaries: formData.besoins_salaries,
      type: formData.type,
      status: chantier?.status || 'planned',
      ...(chantier?.id && { id: chantier.id }),
    };

    onSave?.(chantierData);
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
          {isAccessDenied && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                ⚠️ <strong>Accès restreint :</strong> Seuls les administrateurs peuvent voir la liste des clients pour des raisons de confidentialité.
                <br />
                <span className="text-xs">Vous pouvez créer le chantier mais ne pourrez pas sélectionner de client.</span>
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
            {isAccessDenied ? (
              <div className="p-3 border border-muted rounded-md bg-muted/50 text-muted-foreground">
                Liste des clients non disponible (accès admin requis)
              </div>
            ) : (
              <Select value={formData.client_id} onValueChange={(value) => setFormData({...formData, client_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nom">Nom du chantier *</Label>
            <Input
              id="nom"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Entretien espaces verts"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lieu">Lieu *</Label>
            <Input
              id="lieu"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Zone Nord"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.start_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.start_date ? format(formData.start_date, "dd/MM/yyyy") : "Date début"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.start_date}
                    onSelect={(date) => setFormData({...formData, start_date: date})}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Date de fin (optionnelle)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.end_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.end_date ? format(formData.end_date, "dd/MM/yyyy") : "Date fin"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.end_date}
                    onSelect={(date) => setFormData({...formData, end_date: date})}
                    disabled={(date) => formData.start_date ? date < formData.start_date : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
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