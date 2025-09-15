import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

interface MonthCalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  events?: Array<{
    date: Date;
    endDate?: Date;
    title: string;
    color?: string;
  }>;
}

export function MonthCalendar({ selectedDate, onDateSelect, events = [] }: MonthCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    onDateSelect?.(date);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      // Check if event spans multiple days and include all days in range
      if (event.endDate) {
        return date >= event.date && date <= event.endDate;
      }
      return isSameDay(event.date, date);
    });
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((date) => {
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isSelected = selectedDate && isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const dayEvents = getEventsForDate(date);
            
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "p-2 min-h-[60px] cursor-pointer hover:bg-muted/50 border border-border rounded-md transition-colors",
                  !isCurrentMonth && "text-muted-foreground bg-muted/30",
                  isSelected && "bg-primary text-primary-foreground",
                  isToday && !isSelected && "bg-accent text-accent-foreground font-semibold"
                )}
                onClick={() => handleDateClick(date)}
              >
                <div className="text-sm">{format(date, 'd')}</div>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event, index) => (
                    <div
                      key={index}
                      className="text-xs p-1 rounded text-white truncate"
                      style={{ backgroundColor: event.color || 'hsl(var(--primary))' }}
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}