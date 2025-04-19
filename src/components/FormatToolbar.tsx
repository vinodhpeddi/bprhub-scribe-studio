
import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Table, Check, Image, IndentIncrease, IndentDecrease, FileDown } from 'lucide-react';
import IconButton from './ui/IconButton';
import { exportDocument } from '@/utils/documentExport';
import { defaultExportOptions } from '@/utils/documentTypes';
import { toast } from 'sonner';

interface FormatToolbarProps {
  onFormatClick: (formatType: string) => void;
  activeFormats: string[];
  documentContent: string;
  documentTitle: string;
  children?: React.ReactNode;
}

const FormatToolbar: React.FC<FormatToolbarProps> = ({ 
  onFormatClick, 
  activeFormats,
  documentContent,
  documentTitle,
  children
}) => {
  const [isSticky, setIsSticky] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

  const formatOptions = [
    { id: 'bold', icon: <Bold size={18} />, label: 'Bold' },
    { id: 'italic', icon: <Italic size={18} />, label: 'Italic' },
    { id: 'underline', icon: <Underline size={18} />, label: 'Underline' },
    { id: 'bulletList', icon: <List size={18} />, label: 'Bullet List' },
    { id: 'orderedList', icon: <ListOrdered size={18} />, label: 'Numbered List' },
    { id: 'indentList', icon: <IndentIncrease size={18} />, label: 'Increase Indent' },
    { id: 'outdentList', icon: <IndentDecrease size={18} />, label: 'Decrease Indent' },
    { id: 'table', icon: <Table size={18} />, label: 'Insert Table' },
    { id: 'layoutTable', icon: <Table size={18} />, label: 'Layout Table' },
    { id: 'checklist', icon: <Check size={18} />, label: 'Checklist' },
    { id: 'image', icon: <Image size={18} />, label: 'Insert Image' },
  ];

  return (
    <div 
      className={`flex items-center border rounded-md p-1 bg-white z-10 transition-all duration-300 mb-2 gap-1 ${
        isSticky ? 'sticky top-0 shadow-md animate-slide-in' : ''
      }`}
    >
      {formatOptions.map((option) => (
        <IconButton
          key={option.id}
          icon={option.icon}
          label={option.label}
          active={activeFormats.includes(option.id)}
          onClick={() => onFormatClick(option.id)}
        />
      ))}

      <div className="h-5 w-px bg-gray-200 mx-1" />
      
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

      {children}
    </div>
  );
};

export default FormatToolbar;
