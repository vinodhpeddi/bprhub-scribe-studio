
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSymlink, AlertTriangle } from 'lucide-react';
import { importDocument } from '@/utils/documentImport';
import { runDocumentImportTests } from '@/utils/__tests__/documentImport.test';
import { toast } from 'sonner';

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

  // Reset state when modal opens/closes
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
    
    // Capture console output for tests
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
            <div 
              className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={handleBrowseClick}
            >
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".docx,.pdf,.html,.htm,.txt"
              />
              <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              
              {selectedFile ? (
                <div className="mt-2">
                  <p className="font-medium">Selected file:</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedFile.name}</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">Click to select a file</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-2">Supports Word, PDF, HTML, and text files</p>
                </div>
              )}
            </div>
            
            {importError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-medium">Import error</p>
                    <p className="mt-1">{importError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Supported formats:</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 text-sm">
                  <FileSymlink className="h-4 w-4 text-blue-500" />
                  <span>Word (.docx)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileSymlink className="h-4 w-4 text-red-500" />
                  <span>PDF (.pdf)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileSymlink className="h-4 w-4 text-orange-500" />
                  <span>HTML (.html, .htm)</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <FileSymlink className="h-4 w-4 text-gray-500" />
                  <span>Text (.txt)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-xs overflow-auto max-h-80">
              <pre className="whitespace-pre-wrap">{testResults}</pre>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {!testMode ? (
            <>
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
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setTestMode(false)} className="sm:order-1">
                Back to Import
              </Button>
              <Button 
                variant="outline" 
                onClick={runTests} 
                className="sm:order-2"
              >
                Run Tests Again
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
