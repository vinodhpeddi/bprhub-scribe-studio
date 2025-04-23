
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import ImportModalFilePicker from './ImportModalFilePicker';
import ImportModalError from './ImportModalError';
import ImportModalTestPanel from './ImportModalTestPanel';
import ImportModalFooter from './ImportModalFooter';
import { useImportModalLogic } from './hooks/useImportModalLogic';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (content: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const logic = useImportModalLogic(isOpen, onClose, onImportComplete);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import content from Word, PDF, or HTML files
          </DialogDescription>
        </DialogHeader>

        {!logic.testMode ? (
          <div className="grid gap-6 py-4">
            <ImportModalFilePicker
              selectedFile={logic.selectedFile}
              onFileSelect={logic.handleFileSelect}
              onBrowseClick={logic.handleBrowseClick}
              onDrop={logic.handleDrop}
              onDragOver={logic.handleDragOver}
              fileInputRef={logic.fileInputRef}
            />
            {logic.importError && <ImportModalError message={logic.importError} />}
          </div>
        ) : (
          <ImportModalTestPanel
            testResults={logic.testResults}
            onBack={() => logic.setTestMode(false)}
            onRunTests={logic.runTests}
          />
        )}

        {!logic.testMode ? (
          <DialogFooter>
            <ImportModalFooter
              onClose={onClose}
              onRunTests={logic.runTests}
              onImport={logic.handleImport}
              isUploading={logic.isUploading}
              isImportEnabled={!!logic.selectedFile}
            />
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
