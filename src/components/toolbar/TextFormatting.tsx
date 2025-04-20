
import React from 'react';
import { Bold, Italic, Underline, Palette, Highlighter } from 'lucide-react';
import IconButton from '../ui/IconButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';

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

  const textColors = [
    { value: '#000000', label: 'Black' },
    { value: '#9b87f5', label: 'Primary Purple' },
    { value: '#7E69AB', label: 'Secondary Purple' },
    { value: '#D946EF', label: 'Magenta Pink' },
    { value: '#ea384c', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#0EA5E9', label: 'Blue' },
    { value: '#10B981', label: 'Green' },
    { value: '#555555', label: 'Gray' }
  ];

  const highlightColors = [
    { value: '#FEF7CD', label: 'Soft Yellow' },
    { value: '#FEC6A1', label: 'Soft Orange' },
    { value: '#E5DEFF', label: 'Soft Purple' },
    { value: '#FFDEE2', label: 'Soft Pink' },
    { value: '#D3E4FD', label: 'Soft Blue' },
    { value: '#F2FCE2', label: 'Soft Green' },
    { value: '#F1F0FB', label: 'Soft Gray' }
  ];

  return (
    <div className="flex items-center gap-1 flex-wrap">
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
        
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <IconButton
                icon={<Palette size={18} />}
                label="Text Color"
                onClick={() => {}}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-3 gap-1">
              {textColors.map((color) => (
                <Button
                  key={color.value}
                  className="h-6 w-full"
                  style={{ backgroundColor: color.value }}
                  onClick={() => onFormatClick('foreColor', color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <div>
              <IconButton
                icon={<Highlighter size={18} />}
                label="Highlight Color"
                onClick={() => {}}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-3 gap-1">
              {highlightColors.map((color) => (
                <Button
                  key={color.value}
                  className="h-6 w-full"
                  style={{ backgroundColor: color.value }}
                  onClick={() => onFormatClick('hiliteColor', color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
