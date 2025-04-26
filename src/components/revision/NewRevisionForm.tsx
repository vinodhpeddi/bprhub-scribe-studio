
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from 'lucide-react';

interface NewRevisionFormProps {
  onSaveRevision: (label?: string, description?: string) => void;
}

export function NewRevisionForm({ onSaveRevision }: NewRevisionFormProps) {
  const [newRevisionLabel, setNewRevisionLabel] = React.useState('');
  const [newRevisionDescription, setNewRevisionDescription] = React.useState('');

  const handleSaveNewRevision = () => {
    onSaveRevision(newRevisionLabel || undefined, newRevisionDescription || undefined);
    setNewRevisionLabel('');
    setNewRevisionDescription('');
  };

  return (
    <div className="md:w-1/4 space-y-4">
      <h3 className="text-lg font-medium">New Version</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="new-label">Version Label</Label>
          <Input 
            id="new-label"
            value={newRevisionLabel}
            onChange={(e) => setNewRevisionLabel(e.target.value)}
            placeholder="e.g. First draft"
          />
        </div>
        <div>
          <Label htmlFor="new-description">Description (optional)</Label>
          <Textarea 
            id="new-description"
            value={newRevisionDescription}
            onChange={(e) => setNewRevisionDescription(e.target.value)}
            placeholder="Add a description..."
            rows={3}
          />
        </div>
        <Button 
          className="w-full" 
          onClick={handleSaveNewRevision}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Current Version
        </Button>
      </div>
    </div>
  );
}
