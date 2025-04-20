
import React from 'react';
import { FileDown } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { exportDocument } from '@/utils/documentExport';
import { defaultExportOptions } from '@/utils/documentTypes';
import { toast } from 'sonner';

interface ExportToolsProps {
  documentContent: string;
  documentTitle: string;
}

export const ExportTools: React.FC<ExportToolsProps> = ({ documentContent, documentTitle }) => {
  const handleExport = async (format: 'pdf' | 'word') => {
    try {
      const options = {
        ...defaultExportOptions,
        format: format,
      };
      await exportDocument(documentContent, options, documentTitle);
      toast.success(`Document exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document');
    }
  };

  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon={<FileDown size={18} />}
        label="Export as PDF"
        onClick={() => handleExport('pdf')}
      />
      <IconButton
        icon={<FileDown size={18} />}
        label="Export as Word"
        onClick={() => handleExport('word')}
      />
    </div>
  );
};
