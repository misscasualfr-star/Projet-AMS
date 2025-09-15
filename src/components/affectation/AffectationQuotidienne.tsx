import { useState, useMemo } from "react";
import { Calendar, LayoutDashboard, Users, UserCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DatePickerModal } from "@/components/modales/DatePickerModal";
import { useToast } from "@/hooks/use-toast";
import { useChantiers } from "@/hooks/useChantiers";
import { useEncadrants, useDisponibilites } from "@/hooks/useEncadrants";
import { useSalaries } from "@/hooks/useSalaries";
import { useClients } from "@/hooks/useClients";
import { useAffectations, useCreateAffectation, useDeleteAffectations } from "@/hooks/useAffectations";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

interface DraggableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function DraggableItem({ id, children, className }: DraggableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      {children}
    </div>
  );
}

interface DroppableProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

function DroppableArea({ id, children, className }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        className,
        isOver ? "ring-2 ring-primary ring-opacity-50 bg-primary/5" : ""
      )}
    >
      {children}
    </div>
  );
}

export function AffectationQuotidienne() {
  const [selectedChantier, setSelectedChantier] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [actionHistory, setActionHistory] = useState<Array<{type: 'create' | 'delete', data: any}>>([]);
  
  const { toast } = useToast();
  
  // Data hooks
  const { data: chantiers = [] } = useChantiers();
  const { data: encadrants = [] } = useEncadrants();
  const { data: salaries = [] } = useSalaries();
  const { data: clients = [], error: clientsError } = useClients();
  
  // Format date for API calls
  const dateString = currentDate.toISOString().split('T')[0];
  
  // Get disponibilités and affectations for current date
  const { data: disponibilitesEncadrants = [] } = useDisponibilites('ENCADRANT', dateString, dateString);
  const { data: disponibilitesSalaries = [] } = useDisponibilites('SALARIE', dateString, dateString);
  const { data: affectations = [] } = useAffectations(dateString);
  
  // Mutations
  const createAffectation = useCreateAffectation();
  const deleteAffectations = useDeleteAffectations();

  // Transform affectations data into usable format
  const affectationsData = useMemo(() => {
    const result: Record<string, { encadrant?: string; salaries: string[] }> = {};
    
    affectations.forEach(aff => {
      if (!result[aff.project_id]) {
        result[aff.project_id] = { salaries: [] };
      }
      
      if (aff.encadrant_id && !aff.salarie_id) {
        result[aff.project_id].encadrant = aff.encadrant_id;
      } else if (aff.salarie_id) {
        result[aff.project_id].salaries.push(aff.salarie_id);
      }
    });
    
    return result;
  }, [affectations]);

  // Sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: () => ({ x: 0, y: 0 }),
    })
  );

  // Filter data for current date
  const chantiersJour = useMemo(() => {
    return chantiers.filter(chantier => {
      const startDate = new Date(chantier.start_date);
      const endDate = chantier.end_date ? new Date(chantier.end_date) : null;
      
      return startDate <= currentDate && (!endDate || endDate >= currentDate);
    });
  }, [chantiers, currentDate]);

  const encadrantsDisponibles = useMemo(() => {
    const encadrantsAffectes = Object.values(affectationsData)
      .map(aff => aff.encadrant)
      .filter(Boolean);
    
    return encadrants.filter(encadrant => {
      const dispo = disponibilitesEncadrants.find(d => d.personne_id === encadrant.id);
      const isAvailable = !dispo || dispo.statut === 'available';
      const notAssigned = !encadrantsAffectes.includes(encadrant.id);
      return isAvailable && notAssigned;
    });
  }, [encadrants, disponibilitesEncadrants, affectationsData]);

  const salariesDisponibles = useMemo(() => {
    const salariesAffectes = Object.values(affectationsData)
      .flatMap(aff => aff.salaries);
    
    return salaries.filter(salarie => {
      const dispo = disponibilitesSalaries.find(d => d.personne_id === salarie.id);
      const isAvailable = !dispo || dispo.statut === 'available';
      const notAssigned = !salariesAffectes.includes(salarie.id);
      return isAvailable && notAssigned;
    });
  }, [salaries, disponibilitesSalaries, affectationsData]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const draggedId = active.id as string;
    const targetId = over.id as string;

    console.log('Drag end:', { draggedId, targetId });

    // Check if dragging back to remove assignment
    if (targetId === 'remove-zone') {
      // Find and remove the assignment
      const affectationToRemove = affectations.find(aff => 
        aff.encadrant_id === draggedId || aff.salarie_id === draggedId
      );
      
      if (affectationToRemove) {
        // Store action for undo
        setActionHistory(prev => [...prev, { type: 'delete', data: affectationToRemove }]);
        
        deleteAffectations.mutate({ 
          projectId: affectationToRemove.project_id,
          encadrantId: affectationToRemove.encadrant_id,
          salarieId: affectationToRemove.salarie_id,
          date: dateString 
        });
        
        toast({
          title: "Affectation supprimée",
          description: "L'affectation a été retirée du chantier"
        });
      }
      return;
    }

    // Check if dragging an encadrant to a chantier
    if (encadrantsDisponibles.find(e => e.id === draggedId) && chantiersJour.find(c => c.id === targetId)) {
      const affectationData = {
        project_id: targetId,
        encadrant_id: draggedId,
        date: dateString
      };
      
      // Store action for undo
      setActionHistory(prev => [...prev, { type: 'create', data: affectationData }]);
      
      createAffectation.mutate(affectationData);
      
      toast({
        title: "Encadrant affecté",
        description: "L'encadrant a été affecté au chantier"
      });
      return;
    }
    
    // Check if dragging a salarié to an encadrant (in a chantier)
    if (salariesDisponibles.find(s => s.id === draggedId) && encadrants.find(e => e.id === targetId)) {
      // Find which chantier this encadrant is assigned to
      const encadrantAffectation = affectations.find(aff => aff.encadrant_id === targetId && !aff.salarie_id);
      
      if (encadrantAffectation) {
        const affectationData = {
          project_id: encadrantAffectation.project_id,
          salarie_id: draggedId,
          date: dateString
        };
        
        // Store action for undo
        setActionHistory(prev => [...prev, { type: 'create', data: affectationData }]);
        
        createAffectation.mutate(affectationData);
        
        toast({
          title: "Salarié affecté",
          description: "Le salarié a été affecté à l'équipe"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Cet encadrant n'est pas encore affecté à un chantier"
        });
      }
      return;
    }
    
    // Check if dragging a salarié to a chantier directly
    if (salariesDisponibles.find(s => s.id === draggedId) && chantiersJour.find(c => c.id === targetId)) {
      // Check if chantier has an encadrant
      const chantierAffectation = affectationsData[targetId];
      if (chantierAffectation?.encadrant) {
        const affectationData = {
          project_id: targetId,
          salarie_id: draggedId,
          date: dateString
        };
        
        // Store action for undo
        setActionHistory(prev => [...prev, { type: 'create', data: affectationData }]);
        
        createAffectation.mutate(affectationData);
        
        toast({
          title: "Salarié affecté",
          description: "Le salarié a été affecté au chantier"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Vous devez d'abord affecter un encadrant au chantier"
        });
      }
    }
  };

  const handleUndo = () => {
    if (actionHistory.length === 0) return;
    
    const lastAction = actionHistory[actionHistory.length - 1];
    
    if (lastAction.type === 'create') {
      // Undo creation by deleting
      deleteAffectations.mutate({ 
        projectId: lastAction.data.project_id,
        encadrantId: lastAction.data.encadrant_id,
        salarieId: lastAction.data.salarie_id,
        date: dateString 
      });
    } else if (lastAction.type === 'delete') {
      // Undo deletion by recreating
      createAffectation.mutate(lastAction.data);
    }
    
    // Remove from history
    setActionHistory(prev => prev.slice(0, -1));
    
    toast({
      title: "Action annulée",
      description: "La dernière action a été annulée"
    });
  };

  const getClientColor = (clientId: string) => {
    // Si l'accès aux clients est refusé, utiliser une couleur par défaut
    if (clientsError?.message.includes('admin')) {
      return 'hsl(var(--muted))';
    }
    const client = clients.find(c => c.id === clientId);
    return client?.couleur || 'hsl(var(--primary))';
  };

  const getClientName = (clientId: string) => {
    // Si l'accès aux clients est refusé, afficher un message générique
    if (clientsError?.message.includes('admin')) {
      return 'Client (accès restreint)';
    }
    const client = clients.find(c => c.id === clientId);
    return client?.nom || 'Client inconnu';
  };

  // Calculate coverage indicators  
  const totalChantiers = chantiersJour.length;
  const chantiersAvecEncadrant = Object.keys(affectationsData).filter(id => affectationsData[id]?.encadrant).length;
  
  const totalBesoinsEncadrants = chantiersJour.reduce((sum, c) => sum + (c.besoins_encadrants || 1), 0);
  const totalEncadrantsAffectes = Object.values(affectationsData).filter(aff => aff.encadrant).length;
  
  const totalBesoinsSalaries = chantiersJour.reduce((sum, c) => sum + (c.besoins_salaries || 0), 0);
  const totalSalariesAffectes = Object.values(affectationsData).reduce((sum, aff) => sum + aff.salaries.length, 0);

  const getSalariesPourChantier = (chantierId: string) => {
    const chantierAffectation = affectationsData[chantierId];
    if (!chantierAffectation?.salaries) return [];
    
    return chantierAffectation.salaries.map(salarieId => 
      salaries.find(s => s.id === salarieId)
    ).filter(Boolean);
  };

  const getEncadrantPourChantier = (chantierId: string) => {
    const chantierAffectation = affectationsData[chantierId];
    if (!chantierAffectation?.encadrant) return null;
    
    return encadrants.find(e => e.id === chantierAffectation.encadrant);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6 p-6">
        {/* Header with date and indicators */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <CardTitle className="flex items-center space-x-2">
                <LayoutDashboard className="w-5 h-5" />
                <span>Affectation quotidienne</span>
              </CardTitle>
              
              <div className="text-4xl font-bold text-primary text-center p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                {currentDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              
              <div className="flex items-center justify-end space-x-4">
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
                    style={{ width: totalChantiers > 0 ? `${(chantiersAvecEncadrant / totalChantiers) * 100}%` : '0%' }}
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
                    className="bg-primary h-2 rounded-full transition-smooth"
                    style={{ width: totalBesoinsEncadrants > 0 ? `${(totalEncadrantsAffectes / totalBesoinsEncadrants) * 100}%` : '0%' }}
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
                    className="bg-accent h-2 rounded-full transition-smooth"
                    style={{ width: totalBesoinsSalaries > 0 ? `${(totalSalariesAffectes / totalBesoinsSalaries) * 100}%` : '0%' }}
                  />
                </div>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  {(chantiersAvecEncadrant === totalChantiers && totalSalariesAffectes >= totalBesoinsSalaries) ? (
                    <CheckCircle className="w-6 h-6 text-available" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-destructive" />
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

        {/* Drag & Drop Board - Ajout fonction annuler et undo */}
        <div className="mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <div className="flex items-center space-x-2">
              💡 <strong>Instructions :</strong> Glissez les encadrants vers les chantiers pour les affecter. 
              Glissez ensuite les salariés vers les encadrants déjà affectés pour former les équipes.
              Glissez vers la zone de suppression pour retirer une affectation.
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleUndo}
                disabled={actionHistory.length === 0}
              >
                Annuler dernière action ({actionHistory.length})
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Supprimer toutes les affectations du jour
                  deleteAffectations.mutate({ date: dateString });
                  setActionHistory([]);
                  toast({
                    title: "Affectations annulées",
                    description: "Toutes les affectations du jour ont été supprimées"
                  });
                }}
              >
                Annuler toutes les affectations
              </Button>
            </div>
          </div>
        </div>
        
        {/* Zone de suppression */}
        <DroppableArea id="remove-zone" className="mb-4 p-4 border-2 border-dashed border-destructive bg-destructive/5 rounded-lg text-center">
          <div className="text-destructive font-medium">
            🗑️ Zone de suppression - Glissez ici pour retirer une affectation
          </div>
        </DroppableArea>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Chantiers du jour */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Chantiers du jour ({chantiersJour.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chantiersJour.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aucun chantier prévu pour cette date</p>
                </div>
              ) : (
                chantiersJour.map(chantier => {
                  const encadrant = getEncadrantPourChantier(chantier.id);
                  const salariesAffectes = getSalariesPourChantier(chantier.id);
                  
                  return (
                    <DroppableArea
                      key={chantier.id}
                      id={chantier.id}
                      className="w-full"
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer transition-smooth hover:shadow-elevated border-l-4 relative",
                          selectedChantier === chantier.id ? "ring-2 ring-primary" : ""
                        )}
                        onClick={() => setSelectedChantier(chantier.id)}
                        style={{ borderLeftColor: getClientColor(chantier.client_id || '') }}
                      >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-sm text-foreground">
                              {getClientName(chantier.client_id || '')}
                            </h4>
                            <p className="text-sm font-medium text-card-foreground">
                              {chantier.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {chantier.address}
                            </p>
                          </div>
                          {!encadrant && (
                            <AlertTriangle className="w-5 h-5 text-suivi" />
                          )}
                        </div>

                        {/* Encadrant affecté */}
                        {encadrant && (
                          <div className="pt-2 border-t border-border">
                            <DroppableArea id={encadrant.id} className="w-full">
                              <div className="flex items-center space-x-2 mb-2 p-2 rounded transition-smooth hover:bg-muted/50">
                                <Avatar className="w-6 h-6" style={{ backgroundColor: encadrant.couleur }}>
                                  <AvatarFallback className="text-white font-semibold text-xs">
                                    {encadrant.initiales}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium">{encadrant.nom}</span>
                              </div>
                            </DroppableArea>
                            
                            {/* Salariés affectés */}
                            {salariesAffectes.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs text-muted-foreground">Équipe :</div>
                                <div className="flex flex-wrap gap-1">
                                  {salariesAffectes.map(salarie => (
                                    <Badge 
                                      key={salarie?.id} 
                                      variant="secondary" 
                                      className="text-xs flex items-center space-x-1"
                                    >
                                      <span>{salarie?.nom.split(' ')[0]}</span>
                                      {salarie?.conducteur && <span>🚗</span>}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Besoins */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="font-medium">Enc: {encadrant ? 1 : 0}/{chantier.besoins_encadrants || 1}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <span className="font-medium">Sal: {salariesAffectes.length}/{chantier.besoins_salaries || 0}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {chantier.description && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground italic">
                              💬 {chantier.description}
                            </p>
                          </div>
                        )}
                      </CardContent>
                      
                      </Card>
                    </DroppableArea>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Column 2: Encadrants disponibles */}
          <DroppableArea id="encadrants-disponibles" className="h-full">
            <Card className="shadow-card h-full">
              <CardHeader>
                <CardTitle className="text-lg">Encadrants disponibles ({encadrantsDisponibles.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {encadrantsDisponibles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun encadrant disponible</p>
                    <p className="text-xs mt-2">Glissez ici pour désaffecter</p>
                  </div>
                ) : (
                  encadrantsDisponibles.map(encadrant => (
                    <DraggableItem 
                      key={encadrant.id} 
                      id={encadrant.id}
                      className="cursor-move"
                    >
                      <Card className="transition-smooth hover:shadow-elevated bg-gradient-surface">
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8" style={{ backgroundColor: encadrant.couleur }}>
                              <AvatarFallback className="text-white font-semibold text-sm">
                                {encadrant.initiales}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{encadrant.nom}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Disponible pour affectation
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </DraggableItem>
                  ))
                )}
              </CardContent>
            </Card>
          </DroppableArea>

          {/* Column 3: Salariés disponibles */}
          <DroppableArea id="salaries-disponibles" className="h-full">
            <Card className="shadow-card h-full">
              <CardHeader>
                <CardTitle className="text-lg">Salariés disponibles ({salariesDisponibles.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {salariesDisponibles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Aucun salarié disponible</p>
                    <p className="text-xs mt-2">Glissez ici pour désaffecter</p>
                  </div>
                ) : (
                  salariesDisponibles.map(salarie => (
                    <DraggableItem 
                      key={salarie.id} 
                      id={salarie.id}
                      className="cursor-move"
                    >
                      <Card className="transition-smooth hover:shadow-card bg-gradient-surface">
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
                    </DraggableItem>
                  ))
                )}
              </CardContent>
            </Card>
          </DroppableArea>
        </div>

        {/* Instructions */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">
              💡 <strong>Instructions :</strong> Glissez les encadrants vers les chantiers pour les affecter. 
              Glissez ensuite les salariés vers les encadrants déjà affectés pour former les équipes.
              Utilisez le bouton "Annuler toutes les affectations" ci-dessus pour recommencer.
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
    </DndContext>
  );
}