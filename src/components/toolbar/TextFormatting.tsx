
import React from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

interface TextFormattingProps {
  onFormatClick: (formatType: string, value?: string) => void;
  activeFormats: string[];
  disabled?: boolean; // Add disabled prop
}

const TextFormatting: React.FC<TextFormattingProps> = ({ 
  onFormatClick, 
  activeFormats,
  disabled = false // Default to enabled
}) => {
  return (
    <>
      <IconButton
        onClick={() => onFormatClick('bold')}
        active={activeFormats.includes('bold')}
        icon={<Bold className="h-4 w-4" />}
        tooltip="Bold"
        disabled={disabled}
      />
      <IconButton
        onClick={() => onFormatClick('italic')}
        active={activeFormats.includes('italic')}
        icon={<Italic className="h-4 w-4" />}
        tooltip="Italic"
        disabled={disabled}
      />
      <IconButton
        onClick={() => onFormatClick('underline')}
        active={activeFormats.includes('underline')}
        icon={<Underline className="h-4 w-4" />}
        tooltip="Underline"
        disabled={disabled}
      />

      <span className="mx-1 text-gray-200">|</span>

      <IconButton
        onClick={() => onFormatClick('align', 'left')}
        icon={<AlignLeft className="h-4 w-4" />}
        tooltip="Align Left"
        disabled={disabled}
      />
      <IconButton
        onClick={() => onFormatClick('align', 'center')}
        icon={<AlignCenter className="h-4 w-4" />}
        tooltip="Align Center"
        disabled={disabled}
      />
      <IconButton
        onClick={() => onFormatClick('align', 'right')}
        icon={<AlignRight className="h-4 w-4" />}
        tooltip="Align Right"
        disabled={disabled}
      />
      <IconButton
        onClick={() => onFormatClick('align', 'justify')}
        icon={<AlignJustify className="h-4 w-4" />}
        tooltip="Justify"
        disabled={disabled}
      />
    </>
  );
};

export default TextFormatting;
