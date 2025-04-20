
import React from 'react';
import { Bold, Italic, Underline } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface TextFormattingProps {
  onFormatClick: (formatType: string, value?: string) => void;
  activeFormats: string[];
}

export const TextFormatting: React.FC<TextFormattingProps> = ({ onFormatClick, activeFormats }) => {
  const fontFamilies = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Times New Roman, serif', label: 'Times New Roman' },
    { value: 'Courier New, monospace', label: 'Courier New' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' }
  ];

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
    <div className="flex items-center gap-1">
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

      <div className="flex items-center gap-1">
        <IconButton
          icon={<Bold size={18} />}
          label="Bold"
          active={activeFormats.includes('bold')}
          onClick={() => onFormatClick('bold')}
        />
        <IconButton
          icon={<Italic size={18} />}
          label="Italic"
          active={activeFormats.includes('italic')}
          onClick={() => onFormatClick('italic')}
        />
        <IconButton
          icon={<Underline size={18} />}
          label="Underline"
          active={activeFormats.includes('underline')}
          onClick={() => onFormatClick('underline')}
        />
      </div>
    </div>
  );
};
