import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock } from "lucide-react";

interface TimePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onTimeSelect: (time: string) => void;
  title: string;
}

const TimePickerDialog = ({ open, onOpenChange, value, onTimeSelect, title }: TimePickerDialogProps) => {
  const [selectedHour, setSelectedHour] = useState(value ? parseInt(value.split(':')[0]) : 8);
  const [selectedMinute, setSelectedMinute] = useState(value ? parseInt(value.split(':')[1]) : 0);
  const [step, setStep] = useState<'hour' | 'minute'>('hour');

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleHourSelect = (hour: number) => {
    setSelectedHour(hour);
    setStep('minute');
  };

  const handleMinuteSelect = (minute: number) => {
    setSelectedMinute(minute);
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onTimeSelect(timeString);
    onOpenChange(false);
    setStep('hour');
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-center">
            <Clock className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-mono font-bold text-foreground">
              {formatTime(selectedHour, selectedMinute)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {step === 'hour' ? 'Selecione a hora' : 'Selecione os minutos'}
            </div>
          </div>

          {step === 'hour' && (
            <ScrollArea className="h-48">
              <div className="grid grid-cols-4 gap-2 p-2">
                {hours.map((hour) => (
                  <Button
                    key={hour}
                    variant={selectedHour === hour ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleHourSelect(hour)}
                    className="h-12 text-sm"
                  >
                    {hour.toString().padStart(2, '0')}h
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}

          {step === 'minute' && (
            <ScrollArea className="h-48">
              <div className="grid grid-cols-6 gap-2 p-2">
                {minutes.filter(m => m % 5 === 0).map((minute) => (
                  <Button
                    key={minute}
                    variant={selectedMinute === minute ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleMinuteSelect(minute)}
                    className="h-12 text-xs"
                  >
                    {minute.toString().padStart(2, '0')}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}

          {step === 'minute' && (
            <Button
              variant="outline"
              onClick={() => setStep('hour')}
              className="w-full"
            >
              Voltar para horas
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimePickerDialog;