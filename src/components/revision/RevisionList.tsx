
import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { RevisionCompare } from "./RevisionCompare";
import { RevisionListHeader } from "./RevisionListHeader";
import { RevisionItem } from "./RevisionItem";
import { Revision } from '@/utils/commentTypes';

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
  documentId: string;
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
  autoSaveInterval,
  documentId
}: RevisionListProps) {
  const sortedRevisions = [...revisions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className="md:w-1/2 p-4 flex flex-col h-[400px]">
      <RevisionListHeader 
        revisions={revisions}
        isViewingRevision={isViewingRevision}
        onExitRevisionView={onExitRevisionView}
        autoSaveInterval={autoSaveInterval}
        onSetAutoSave={onSetAutoSave}
      />
      
      <ScrollArea className="flex-grow pr-4">
        <div className="space-y-2">
          {sortedRevisions.length > 0 ? (
            sortedRevisions.map((revision) => (
              <RevisionItem 
                key={revision.id}
                revision={revision}
                isActive={currentRevision?.id === revision.id}
                onView={() => onViewRevision(revision.id)}
                onRestore={() => onRestoreRevision(revision.id)}
                onUpdate={onUpdateRevision}
                isViewingRevision={isViewingRevision}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500 italic py-10 text-center">
              No revisions yet
            </div>
          )}
        </div>
      </ScrollArea>
      
      {sortedRevisions.length >= 2 && (
        <RevisionCompare 
          documentId={documentId}
          revisions={sortedRevisions}
        />
      )}
    </Card>
  );
}
