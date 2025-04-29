
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookOpen, AlertCircle } from 'lucide-react';
import { RevisionList } from './RevisionList';
import { NewRevisionForm } from './NewRevisionForm';
import { Revision } from '@/utils/commentTypes';

interface RevisionDialogContentProps {
  documentTitle: string;
  documentId: string; // Add documentId prop
  showStorageWarning: boolean;
  revisions: Revision[];
  currentRevision: Revision | null;
  isViewingRevision: boolean;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onExitRevisionView: () => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSaveRevision: (label?: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
}

export function RevisionDialogContent({
  documentTitle,
  documentId, // Include the documentId
  showStorageWarning,
  revisions,
  currentRevision,
  isViewingRevision,
  onViewRevision,
  onRestoreRevision,
  onExitRevisionView,
  onUpdateRevision,
  onSaveRevision,
  onSetAutoSave,
  autoSaveInterval
}: RevisionDialogContentProps) {
  return (
    <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          Revision History - {documentTitle}
        </DialogTitle>
      </DialogHeader>

      {showStorageWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Storage usage is high. Consider deleting unused documents or reducing auto-save frequency to prevent data loss.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex md:flex-row flex-col gap-4 h-full">
        <RevisionList
          documentId={documentId} // Pass documentId to RevisionList
          revisions={revisions}
          currentRevision={currentRevision}
          isViewingRevision={isViewingRevision}
          onViewRevision={onViewRevision}
          onRestoreRevision={onRestoreRevision}
          onExitRevisionView={onExitRevisionView}
          onUpdateRevision={onUpdateRevision}
          onSetAutoSave={onSetAutoSave}
          autoSaveInterval={autoSaveInterval}
        />
        <NewRevisionForm onSaveRevision={onSaveRevision} />
      </div>
    </DialogContent>
  );
}
