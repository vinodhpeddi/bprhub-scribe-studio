import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, RotateCcw, ArrowLeft, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Revision } from '@/utils/commentTypes';
import { AutoSaveDialog } from './AutoSaveDialog';
import { cn } from '@/lib/utils';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RevisionListProps {
  revisions: Revision[];
  currentRevision: Revision | null;
  isViewingRevision: boolean;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onExitRevisionView: () => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
}

interface RevisionItemProps extends Revision {
  currentRevisionId: string | undefined;
  onView: (revisionId: string) => void;
  onRestore: (revisionId: string) => void;
  onStartEdit: (revision: Revision) => void;
}

interface EditRevisionProps {
  revision: Revision;
  onSave: (revisionId: string, label: string, description?: string) => void;
  onCancel: () => void;
}

const RevisionItem: React.FC<RevisionItemProps> = ({
  id,
  label,
  timestamp,
  authorName,
  description,
  isAuto,
  currentRevisionId,
  onView,
  onRestore,
  onStartEdit,
}) => {
  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all",
        currentRevisionId === id
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
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
            onClick={() => onStartEdit({ id, label, timestamp, authorName, description, isAuto })}
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
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
        </div>
      </div>
    </div>
  );
};

const EditRevision: React.FC<EditRevisionProps> = ({ revision, onSave, onCancel }) => {
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

interface RevisionListHeaderProps {
  revisions: Revision[];
  autoSaveInterval: number | null;
  onSetAutoSave: (intervalMinutes: number | null) => void;
}

const RevisionListHeader: React.FC<RevisionListHeaderProps> = ({ revisions, autoSaveInterval, onSetAutoSave }) => {
  const [isAutoSaveDialogOpen, setIsAutoSaveDialogOpen] = React.useState(false);

  const autoSaveCount = revisions.filter(rev => rev.isAuto).length;
  const manualCount = revisions.length - autoSaveCount;

  const getAutoSaveLabel = () => {
    if (autoSaveInterval === null) return 'Off';
    if (autoSaveInterval === 1) return 'Every minute';
    return `Every ${autoSaveInterval} minutes`;
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium">Document Versions</h3>
        <div className="text-sm text-gray-500">
          {revisions.length} versions ({manualCount} manual, {autoSaveCount} auto-save)
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAutoSaveDialogOpen(true)}
        >
          <Clock className="h-4 w-4 mr-1" />
          Auto-save: {getAutoSaveLabel()}
        </Button>
      </div>
      <AutoSaveDialog
        open={isAutoSaveDialogOpen}
        onOpenChange={setIsAutoSaveDialogOpen}
        selectedInterval={autoSaveInterval}
        onSave={onSetAutoSave}
      />
    </div>
  );
};

export function RevisionList({
  revisions,
  currentRevision,
  isViewingRevision,
  onViewRevision,
  onRestoreRevision,
  onExitRevisionView,
  onUpdateRevision,
  onSetAutoSave,
  autoSaveInterval
}: RevisionListProps) {
  const [editingRevision, setEditingRevision] = React.useState<Revision | null>(null);

  const sortedRevisions = [...revisions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleStartEditRevision = (revision: Revision) => {
    setEditingRevision(revision);
  };

  const handleSaveRevision = (revisionId: string, label: string, description?: string) => {
    onUpdateRevision(revisionId, label, description);
    setEditingRevision(null);
  };

  const handleCancelEdit = () => {
    setEditingRevision(null);
  };

  return (
    <div className="md:w-3/4 space-y-6 overflow-hidden flex flex-col">
      <RevisionListHeader revisions={revisions} autoSaveInterval={autoSaveInterval} onSetAutoSave={onSetAutoSave} />
      
      <ScrollArea className="h-[400px] pr-4 -mr-4">
        <div className="space-y-4">
          {sortedRevisions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No revisions yet. Save a version to start tracking changes.
            </div>
          ) : (
            sortedRevisions.map((revision) => (
              <React.Fragment key={revision.id}>
                <RevisionItem
                  {...revision}
                  currentRevisionId={currentRevision?.id}
                  onView={onViewRevision}
                  onRestore={onRestoreRevision}
                  onStartEdit={handleStartEditRevision}
                />
                {editingRevision?.id === revision.id && (
                  <EditRevision
                    revision={revision}
                    onSave={handleSaveRevision}
                    onCancel={handleCancelEdit}
                  />
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
