
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Revision } from '@/utils/commentTypes';

interface EditRevisionProps {
  revision: Revision;
  onSave: (revisionId: string, label: string, description?: string) => void;
  onCancel: () => void;
}

export const EditRevision: React.FC<EditRevisionProps> = ({ revision, onSave, onCancel }) => {
  const [editLabel, setEditLabel] = React.useState(revision.label || '');
  const [editDescription, setEditDescription] = React.useState(revision.description || '');

  const handleSaveEditRevision = () => {
    onSave(revision.id, editLabel, editDescription);
  };

  return (
    <div className="mt-4 space-y-3">
      <div>
        <Label htmlFor="edit-label">Label</Label>
        <Input
          id="edit-label"
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          placeholder="Version label"
        />
      </div>
      <div>
        <Label htmlFor="edit-description">Description (optional)</Label>
        <Textarea
          id="edit-description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Add a description..."
          rows={2}
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button onClick={handleSaveEditRevision}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};
