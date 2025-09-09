import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DatePickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
  title?: string;
}

export function DatePickerModal({ 
  open, 
  onOpenChange, 
  selectedDate = new Date(), 
  onDateChange,
  title = "Sélectionner une date"
}: DatePickerModalProps) {
  const [tempDate, setTempDate] = useState<Date>(selectedDate);

  const handleConfirm = () => {
    onDateChange?.(tempDate);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-fit">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={tempDate}
            onSelect={(date) => date && setTempDate(date)}
            locale={fr}
            className="p-3 pointer-events-auto"
          />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Date sélectionnée : {format(tempDate, "EEEE d MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} className="bg-gradient-primary text-primary-foreground">
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}