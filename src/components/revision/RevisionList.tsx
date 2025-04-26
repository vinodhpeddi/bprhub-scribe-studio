
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Revision } from '@/utils/commentTypes';
import { RevisionItem } from './RevisionItem';
import { EditRevision } from './EditRevision';
import { RevisionListHeader } from './RevisionListHeader';

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
      <RevisionListHeader 
        revisions={revisions} 
        autoSaveInterval={autoSaveInterval} 
        onSetAutoSave={onSetAutoSave} 
      />
      
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
                  revision={revision}
                  currentRevisionId={currentRevision?.id}
                  onView={onViewRevision}
                  onRestore={onRestoreRevision}
                  onStartEdit={handleStartEditRevision}
                />
                {editingRevision?.id === revision.id && (
                  <EditRevision
                    revision={editingRevision}
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
