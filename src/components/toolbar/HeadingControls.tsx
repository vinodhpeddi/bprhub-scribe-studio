
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
  return (
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
  );
};
