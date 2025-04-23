import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSymlink, AlertTriangle } from 'lucide-react';
import { importDocument } from '@/utils/documentImport';
import { runDocumentImportTests } from '@/utils/__tests__/documentImport.test';
import { toast } from 'sonner';
import ImportModalFilePicker from './ImportModalFilePicker';
import ImportModalError from './ImportModalError';
import ImportModalTestPanel from './ImportModalTestPanel';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (content: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setImportError(null);
      setTestMode(false);
      setTestResults(null);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImportError(null);
    try {
      setIsUploading(true);
      const content = await importDocument(selectedFile);

      if (!content || content.trim() === '') {
        throw new Error('Imported document contains no content');
      }

      onImportComplete(content);
      onClose();
      toast.success('Document imported successfully');
    } catch (error) {
      console.error('Error importing document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setImportError(errorMessage);
      toast.error('Failed to import document. Please try a different file or format.');
    } finally {
      setIsUploading(false);
    }
  };

  const runTests = async () => {
    setTestMode(true);
    setTestResults('Running tests...');

    const originalLog = console.log;
    const originalError = console.error;
    let testOutput = '';

    console.log = (...args) => {
      testOutput += args.join(' ') + '\n';
      originalLog(...args);
    };
    console.error = (...args) => {
      testOutput += 'ERROR: ' + args.join(' ') + '\n';
      originalError(...args);
    };

    try {
      await runDocumentImportTests();
      setTestResults(testOutput);
    } catch (error) {
      setTestResults(testOutput + '\nTest execution failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      console.log = originalLog;
      console.error = originalError;
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setImportError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Import Document</DialogTitle>
          <DialogDescription>
            Import content from Word, PDF, or HTML files
          </DialogDescription>
        </DialogHeader>

        {!testMode ? (
          <div className="grid gap-6 py-4">
            <ImportModalFilePicker
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onBrowseClick={handleBrowseClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              fileInputRef={fileInputRef}
            />
            {importError && <ImportModalError message={importError} />}
          </div>
        ) : (
          <ImportModalTestPanel
            testResults={testResults}
            onBack={() => setTestMode(false)}
            onRunTests={runTests}
          />
        )}

        {!testMode ? (
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={onClose} className="sm:order-1">Cancel</Button>
            <Button
              variant="outline"
              onClick={runTests}
              className="sm:order-2"
            >
              Test Import Functionality
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isUploading}
              className="sm:order-3"
            >
              {isUploading ? 'Importing...' : 'Import Document'}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
