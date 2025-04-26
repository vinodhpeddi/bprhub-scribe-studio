
import React from 'react';
import { Button } from "@/components/ui/button";
import { Clock } from 'lucide-react';
import { Revision } from '@/utils/commentTypes';
import { AutoSaveDialog } from './AutoSaveDialog';

interface RevisionListHeaderProps {
  revisions: Revision[];
  autoSaveInterval: number | null;
  onSetAutoSave: (intervalMinutes: number | null) => void;
}

export const RevisionListHeader: React.FC<RevisionListHeaderProps> = ({ 
  revisions, 
  autoSaveInterval, 
  onSetAutoSave 
}) => {
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
