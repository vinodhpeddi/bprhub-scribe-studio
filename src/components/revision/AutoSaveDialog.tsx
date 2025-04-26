
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

interface AutoSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedInterval: number | null;
  onSave: (interval: number | null) => void;
}

export function AutoSaveDialog({ open, onOpenChange, selectedInterval, onSave }: AutoSaveDialogProps) {
  const [selected, setSelected] = React.useState(selectedInterval?.toString() || 'off');

  const handleSave = () => {
    const interval = selected === 'off' ? null : parseInt(selected);
    onSave(interval);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Auto-save Settings</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label className="mb-3 block">Auto-save interval</Label>
          <RadioGroup 
            value={selected} 
            onValueChange={setSelected}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="off" id="off" />
              <Label htmlFor="off">Off</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5" id="5min" />
              <Label htmlFor="5min">Every 5 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="10min" />
              <Label htmlFor="10min">Every 10 minutes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="30" id="30min" />
              <Label htmlFor="30min">Every 30 minutes</Label>
            </div>
          </RadioGroup>
          <div className="mt-3 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            Frequent auto-saves may cause storage issues. Consider using 10 or 30 minutes.
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
