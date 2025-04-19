
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileSymlink } from 'lucide-react';
import { importDocument } from '@/utils/editorUtils';
import { toast } from 'sonner';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (content: string) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setIsUploading(true);
      const content = await importDocument(selectedFile);
      onImportComplete(content);
      onClose();
      toast.success('Document imported successfully');
    } catch (error) {
      console.error('Error importing document:', error);
      toast.error('Failed to import document. Please try a different file or format.');
    } finally {
      setIsUploading(false);
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
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleImport} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Importing...' : 'Import Document'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
