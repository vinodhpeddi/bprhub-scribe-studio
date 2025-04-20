
import React from 'react';
import { List, ListOrdered, IndentIncrease, IndentDecrease } from 'lucide-react';
import IconButton from '../ui/IconButton';

interface ListFormattingProps {
  onFormatClick: (formatType: string) => void;
  activeFormats: string[];
}

export const ListFormatting: React.FC<ListFormattingProps> = ({ onFormatClick, activeFormats }) => {
  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon={<List size={18} />}
        label="Bullet List"
        active={activeFormats.includes('bulletList')}
        onClick={() => onFormatClick('bulletList')}
      />
      <IconButton
        icon={<ListOrdered size={18} />}
        label="Numbered List"
        active={activeFormats.includes('orderedList')}
        onClick={() => onFormatClick('orderedList')}
      />
      <IconButton
        icon={<IndentIncrease size={18} />}
        label="Increase Indent"
        onClick={() => onFormatClick('indentList')}
      />
      <IconButton
        icon={<IndentDecrease size={18} />}
        label="Decrease Indent"
        onClick={() => onFormatClick('outdentList')}
      />
    </div>
  );
};
