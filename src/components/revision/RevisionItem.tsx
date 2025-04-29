
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, RotateCcw, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Revision } from '@/utils/commentTypes';
import { cn } from '@/lib/utils';

interface RevisionItemProps {
  revision: Revision;
  isActive: boolean;
  onView: (revisionId: string) => void;
  onRestore: (revisionId: string) => void;
  onUpdate: (revisionId: string, label: string, description?: string) => void;
  isViewingRevision: boolean;
}

export const RevisionItem: React.FC<RevisionItemProps> = ({
  revision,
  isActive,
  onView,
  onRestore,
  onUpdate,
  isViewingRevision,
}) => {
  const { id, label, timestamp, authorName, description, isAuto } = revision;
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(label || '');
  const [editedDescription, setEditedDescription] = useState(description || '');

  const handleStartEdit = () => {
    setEditedLabel(label || '');
    setEditedDescription(description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdate(id, editedLabel, editedDescription);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all",
        isActive
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Label</label>
            <input 
              type="text"
              className="w-full mt-1 px-3 py-1.5 border rounded-md"
              value={editedLabel}
              onChange={(e) => setEditedLabel(e.target.value)}
              placeholder="Add a label to this revision"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea 
              className="w-full mt-1 px-3 py-1.5 border rounded-md"
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              placeholder="Add more details about this revision"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div>
            <div className="font-medium">
              {label || formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
              {isAuto && (
                <Badge className="ml-2 bg-gray-500">Auto</Badge>
              )}
            </div>
            <div className="text-sm text-gray-500 flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1 inline" />
              {new Date(timestamp).toLocaleString()}
              <span className="mx-2">•</span>
              {authorName}
            </div>
            {description && (
              <p className="mt-2 text-sm text-gray-700">{description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleStartEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              onClick={() => onRestore(id)}
              disabled={isViewingRevision}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restore
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
