
import React from 'react';
import { Button } from '@/components/ui/button';

interface ImportModalFooterProps {
  onClose: () => void;
  onRunTests: () => void;
  onImport: () => void;
  isUploading: boolean;
  isImportEnabled: boolean;
}

const ImportModalFooter: React.FC<ImportModalFooterProps> = ({
  onClose,
  onRunTests,
  onImport,
  isUploading,
  isImportEnabled,
}) => (
  <div className="flex flex-col sm:flex-row gap-2">
    <Button variant="outline" onClick={onClose} className="sm:order-1">
      Cancel
    </Button>
    <Button variant="outline" onClick={onRunTests} className="sm:order-2">
      Test Import Functionality
    </Button>
    <Button onClick={onImport} disabled={!isImportEnabled || isUploading} className="sm:order-3">
      {isUploading ? 'Importing...' : 'Import Document'}
    </Button>
  </div>
);

export default ImportModalFooter;
