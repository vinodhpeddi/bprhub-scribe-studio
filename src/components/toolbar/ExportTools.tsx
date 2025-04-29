
import React, { useState } from 'react';
import { FileDown, Loader2, FileText, BookOpen } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { exportDocument } from '@/utils/documentExport';
import { defaultExportOptions } from '@/utils/documentTypes';
import { toast } from 'sonner';
import { validatePdfWorker } from '@/utils/pdfWorker';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface ExportToolsProps {
  documentContent: string;
  documentTitle: string;
  disabled?: boolean; // Add disabled prop
}

export const ExportTools: React.FC<ExportToolsProps> = ({ 
  documentContent, 
  documentTitle,
  disabled = false // Default to enabled
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [activeExport, setActiveExport] = useState<'pdf' | 'word' | 'html' | null>(null);
  
  const handleExport = async (format: 'pdf' | 'word' | 'html') => {
    if (isExporting) return;
    
    // Check that we actually have content to export
    if (!documentContent || documentContent.trim() === '') {
      toast.error("Document appears to be empty. Please add some content before exporting.");
      return;
    }
    
    setIsExporting(true);
    setActiveExport(format);
    try {
      // Pre-validate PDF worker if exporting to PDF
      if (format === 'pdf') {
        const isWorkerValid = await validatePdfWorker();
        if (!isWorkerValid) {
          toast.error("PDF export is currently unavailable. Try exporting as Word instead.");
          setIsExporting(false);
          setActiveExport(null);
          return;
        }
      }
      
      console.log(`Exporting document, content length: ${documentContent.length}, format: ${format}`);
      
      const options = {
        ...defaultExportOptions,
        format: format,
      };
      
      await exportDocument(documentContent, options, documentTitle || "Document");
      
      if (format === 'word') {
        toast.success(`Document exported as DOCX with formatting preserved.`);
      } else {
        toast.success(`Document exported as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setActiveExport(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* PDF Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('pdf')}
        disabled={isExporting || disabled}
        className="flex items-center"
      >
        {isExporting && activeExport === 'pdf' ? (
          <Loader2 size={16} className="mr-1 animate-spin" />
        ) : (
          <BookOpen size={16} className="mr-1" />
        )}
        PDF
      </Button>

      {/* DOCX Export Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport('word')}
        disabled={isExporting || disabled}
        className="flex items-center"
      >
        {isExporting && activeExport === 'word' ? (
          <Loader2 size={16} className="mr-1 animate-spin" />
        ) : (
          <FileText size={16} className="mr-1" />
        )}
        DOCX
      </Button>

      {/* More Export Options Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div>
            <IconButton
              icon={isExporting && activeExport === 'html' ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
              label="More Export Options"
              disabled={isExporting || disabled}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>More Export Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExport('html')}>
            HTML Document (.html)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
