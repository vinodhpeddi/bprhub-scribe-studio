
import React, { useState } from 'react';
import { FileDown, Loader2 } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { exportDocument } from '@/utils/documentExport';
import { defaultExportOptions } from '@/utils/documentTypes';
import { toast } from 'sonner';
import { validatePdfWorker } from '@/utils/pdfWorker';

interface ExportToolsProps {
  documentContent: string;
  documentTitle: string;
}

export const ExportTools: React.FC<ExportToolsProps> = ({ documentContent, documentTitle }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async (format: 'pdf' | 'word' | 'html') => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      // Pre-validate PDF worker if exporting to PDF
      if (format === 'pdf') {
        const isWorkerValid = await validatePdfWorker();
        if (!isWorkerValid) {
          toast.error("PDF export is currently unavailable. Try exporting as Word instead.");
          setIsExporting(false);
          return;
        }
      }
      
      const options = {
        ...defaultExportOptions,
        format: format,
      };
      
      await exportDocument(documentContent, options, documentTitle || "Document");
      toast.success(`Document exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon={isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        label="Export as PDF"
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
      />
      <IconButton
        icon={isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        label="Export as Word"
        onClick={() => handleExport('word')}
        disabled={isExporting}
      />
      <IconButton
        icon={isExporting ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />}
        label="Export as HTML"
        onClick={() => handleExport('html')}
        disabled={isExporting}
      />
    </div>
  );
};
