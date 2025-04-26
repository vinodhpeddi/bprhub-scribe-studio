
import React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { History } from 'lucide-react';
import { RevisionDialogContent } from './RevisionDialogContent';
import { Revision } from '@/utils/commentTypes';

interface RevisionHistoryProps {
  revisions: Revision[];
  currentRevision: Revision | null;
  isViewingRevision: boolean;
  onSaveRevision: (label?: string, description?: string) => void;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onExitRevisionView: () => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
  documentTitle: string;
}

export function RevisionHistory(props: RevisionHistoryProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showStorageWarning, setShowStorageWarning] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      try {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key) || '';
            totalSize += key.length + value.length;
          }
        }
        
        const WARN_THRESHOLD = 4 * 1024 * 1024;
        if (totalSize * 2 > WARN_THRESHOLD) {
          setShowStorageWarning(true);
        }
      } catch (error) {
        console.error('Error checking storage usage:', error);
      }
    }
  }, [isOpen]);

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center"
        size="sm"
      >
        <History className="h-4 w-4 mr-2" />
        <span>Revision History</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <RevisionDialogContent
          {...props}
          showStorageWarning={showStorageWarning}
        />
      </Dialog>
    </>
  );
}
