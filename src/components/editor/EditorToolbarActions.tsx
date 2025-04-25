
import React from 'react';
import { Button } from '../ui/button';
import { Eye, PenLine } from 'lucide-react';
import { RevisionHistory } from '../revision/RevisionHistory';
import { DocumentChange } from '@/utils/collaborationTypes';
import { Revision } from '@/utils/commentTypes';

interface EditorToolbarActionsProps {
  documentId: string;
  documentTitle: string;
  isLocked: boolean;
  lockedBy: string | null;
  isViewingRevision: boolean;
  currentRevision: Revision | null;
  revisions: Revision[];
  trackChanges: boolean;
  toggleTrackChanges: () => void;
  showChangeTracking: boolean;
  setShowChangeTracking: (show: boolean) => void;
  changes: DocumentChange[];
  onExitRevisionView: () => void;
  onSaveRevision: (label?: string, description?: string) => void;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
  isReadOnly: boolean;
}

export function EditorToolbarActions({
  documentId,
  documentTitle,
  isLocked,
  lockedBy,
  isViewingRevision,
  currentRevision,
  revisions,
  trackChanges,
  toggleTrackChanges,
  showChangeTracking,
  setShowChangeTracking,
  changes,
  onExitRevisionView,
  onSaveRevision,
  onViewRevision,
  onRestoreRevision,
  onUpdateRevision,
  onSetAutoSave,
  autoSaveInterval,
  isReadOnly
}: EditorToolbarActionsProps) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center space-x-2">
        {isLocked && lockedBy !== null && (
          <div className="flex items-center text-sm text-amber-600">
            <Eye className="h-4 w-4 mr-1" />
            <span>View only (locked by {lockedBy})</span>
          </div>
        )}
        
        {isViewingRevision && (
          <div className="flex items-center text-sm text-blue-600">
            <Eye className="h-4 w-4 mr-1" />
            <span>
              Viewing revision{currentRevision?.label ? `: ${currentRevision.label}` : ''}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <RevisionHistory 
          revisions={revisions}
          currentRevision={currentRevision}
          isViewingRevision={isViewingRevision}
          onSaveRevision={onSaveRevision}
          onViewRevision={onViewRevision}
          onRestoreRevision={onRestoreRevision}
          onExitRevisionView={onExitRevisionView}
          onUpdateRevision={onUpdateRevision}
          onSetAutoSave={onSetAutoSave}
          autoSaveInterval={autoSaveInterval}
          documentTitle={documentTitle}
        />
        
        <Button
          variant={trackChanges ? "default" : "outline"}
          size="sm"
          onClick={toggleTrackChanges}
          className="flex items-center"
          disabled={isReadOnly}
        >
          <PenLine className="h-4 w-4 mr-1" />
          <span>Track Changes</span>
        </Button>
        
        <Button
          variant={showChangeTracking ? "default" : "outline"}
          size="sm"
          onClick={() => setShowChangeTracking(!showChangeTracking)}
          className="flex items-center"
        >
          <span>Changes</span>
          {changes.filter(c => c.status === 'pending').length > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px]">
              {changes.filter(c => c.status === 'pending').length}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
