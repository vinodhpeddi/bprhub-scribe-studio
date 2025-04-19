
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, FileType, Copy, Save } from 'lucide-react';
import ExportModal from './ExportModal';
import { toast } from 'sonner';

interface EditorHeaderProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  documentContent: string;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  documentTitle,
  onTitleChange,
  onSave,
  documentContent,
}) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleCopyAsText = () => {
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
  };

  const handleSave = () => {
    onSave();
    toast.success('Document saved successfully');
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <Input
          value={documentTitle}
          onChange={(e) => onTitleChange(e.target.value)}
          className="text-xl font-semibold flex-grow"
          placeholder="Document Title"
        />
        
        <div className="flex gap-2 ml-auto">
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
        </div>
      </div>

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        documentContent={documentContent}
      />
    </div>
  );
};

export default EditorHeader;
