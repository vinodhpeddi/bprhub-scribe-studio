
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy, Save, FileUp, List } from 'lucide-react';
import ExportModal from '../ExportModal';
import ImportModal from '../ImportModal';
import DocumentListModal from '../DocumentListModal';
import { toast } from 'sonner';
import { UserDocument } from '@/utils/editorUtils';

interface EditorActionButtonsProps {
  onSave: () => void;
  documentContent: string;
  documentTitle: string;
  onImport: (content: string) => void;
  onDocumentSelect: (document: UserDocument) => void;
}

const EditorActionButtons: React.FC<EditorActionButtonsProps> = ({
  onSave,
  documentContent,
  documentTitle,
  onImport,
  onDocumentSelect,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDocListModalOpen, setIsDocListModalOpen] = useState(false);

  const handleCopyAsText = useCallback(() => {
    try {
      // Create a new div element
      const tempElement = document.createElement('div');
      tempElement.innerHTML = documentContent;
      
      // Get the text content
      const textContent = tempElement.textContent || tempElement.innerText;
      
      // Copy to clipboard
      navigator.clipboard.writeText(textContent);
      toast.success('Content copied to clipboard');
    } catch (error) {
      console.error('Failed to copy content:', error);
      toast.error('Failed to copy content');
    }
  }, [documentContent]);

  const handleSave = useCallback(() => {
    onSave();
  }, [onSave]);

  const handleImportComplete = useCallback((content: string) => {
    onImport(content);
  }, [onImport]);

  return (
    <div className="flex gap-2 ml-auto">
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap" 
        onClick={() => setIsDocListModalOpen(true)}
      >
        <List className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Documents</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap" 
        onClick={() => setIsImportModalOpen(true)}
      >
        <FileUp className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Import</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap" 
        onClick={handleCopyAsText}
      >
        <Copy className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Copy Text</span>
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="whitespace-nowrap"
        onClick={() => setIsExportModalOpen(true)}
      >
        <Download className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Export</span>
      </Button>
      
      <Button 
        variant="default" 
        size="sm" 
        className="whitespace-nowrap bg-editor-primary hover:bg-editor-secondary"
        onClick={handleSave}
      >
        <Save className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Save</span>
      </Button>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documentContent={documentContent}
        documentTitle={documentTitle}
      />
      
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
      
      <DocumentListModal
        isOpen={isDocListModalOpen}
        onClose={() => setIsDocListModalOpen(false)}
        onDocumentSelect={onDocumentSelect}
      />
    </div>
  );
};

export default React.memo(EditorActionButtons);
