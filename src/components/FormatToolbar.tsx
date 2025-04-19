
import React, { useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Table, Check, Image, IndentIncrease, IndentDecrease, FileDown, Heading, Heading1, Heading2, Heading3 } from 'lucide-react';
import IconButton from './ui/IconButton';
import { exportDocument } from '@/utils/documentExport';
import { defaultExportOptions } from '@/utils/documentTypes';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';

interface FormatToolbarProps {
  onFormatClick: (formatType: string, value?: string) => void;
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

  // Available font families
  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' }
  ];

  // Font sizes
  const fontSizes = [
    { value: '1', label: '8pt' },
    { value: '2', label: '10pt' },
    { value: '3', label: '12pt' },
    { value: '4', label: '14pt' },
    { value: '5', label: '18pt' },
    { value: '6', label: '24pt' },
    { value: '7', label: '36pt' }
  ];

  return (
    <div 
      className={`flex items-center border rounded-md p-1 bg-white z-10 transition-all duration-300 mb-2 gap-1 ${
        isSticky ? 'sticky top-0 shadow-md animate-slide-in' : ''
      }`}
    >
      {/* Heading Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-2 flex items-center">
            <Heading size={18} className="mr-1" />
            <span>Heading</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onFormatClick('formatBlock', 'h1')}>
            <Heading1 size={16} className="mr-2" /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatClick('formatBlock', 'h2')}>
            <Heading2 size={16} className="mr-2" /> Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatClick('formatBlock', 'h3')}>
            <Heading3 size={16} className="mr-2" /> Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFormatClick('formatBlock', 'p')}>
            Normal Text
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font Family Selector */}
      <Select onValueChange={(value) => onFormatClick('fontName', value)}>
        <SelectTrigger className="h-8 w-32">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {fontFamilies.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Font Size Selector */}
      <Select onValueChange={(value) => onFormatClick('fontSize', value)}>
        <SelectTrigger className="h-8 w-20">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {fontSizes.map((size) => (
            <SelectItem key={size.value} value={size.value}>
              {size.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="h-5 w-px bg-gray-200 mx-1" />

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
