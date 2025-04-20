
import React from 'react';
import { Heading, Heading1, Heading2, Heading3 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface HeadingControlsProps {
  onFormatClick: (formatType: string, value?: string) => void;
}

export const HeadingControls: React.FC<HeadingControlsProps> = ({ onFormatClick }) => {
  const handleHeadingClick = (headingType: string) => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      // Save the selection range
      const range = selection.getRangeAt(0);
      
      // Apply the heading format
      onFormatClick('formatBlock', headingType);
      
      // Restore the selection after formatting
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      onFormatClick('formatBlock', headingType);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 px-2 flex items-center">
          <Heading size={18} className="mr-1" />
          <span>Heading</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleHeadingClick('h1')}>
          <Heading1 size={16} className="mr-2" /> Heading 1
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleHeadingClick('h2')}>
          <Heading2 size={16} className="mr-2" /> Heading 2
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleHeadingClick('h3')}>
          <Heading3 size={16} className="mr-2" /> Heading 3
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleHeadingClick('p')}>
          Normal Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
