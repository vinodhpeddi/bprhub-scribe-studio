
import React from 'react';
import { Table, LayoutGrid, Check, Image, Highlighter, Pencil, MessageSquare, AlertTriangle, Shield, Info } from 'lucide-react';
import IconButton from '../ui/IconButton';

interface InsertToolsProps {
  onFormatClick: (formatType: string) => void;
  onInsertTable: (isLayout?: boolean) => void;
  onInsertImage: () => void;
}

export const InsertTools: React.FC<InsertToolsProps> = ({ 
  onFormatClick,
  onInsertTable,
  onInsertImage
}) => {
  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon={<Table size={18} />}
        label="Insert Table"
        onClick={() => onInsertTable(false)}
      />
      <IconButton
        icon={<LayoutGrid size={18} />}
        label="Layout Table"
        onClick={() => onInsertTable(true)}
      />
      <IconButton
        icon={<Check size={18} />}
        label="Checklist"
        onClick={() => onFormatClick('checklist')}
      />
      <IconButton
        icon={<Image size={18} />}
        label="Insert Image"
        onClick={onInsertImage}
      />
      <IconButton
        icon={<Highlighter size={18} />}
        label="Highlight"
        onClick={() => onFormatClick('highlight')}
      />
      <IconButton
        icon={<Pencil size={18} />}
        label="Redline"
        onClick={() => onFormatClick('redline')}
      />
      <IconButton
        icon={<MessageSquare size={18} />}
        label="Add Comment"
        onClick={() => onFormatClick('comment')}
      />
      <IconButton
        icon={<AlertTriangle size={18} />}
        label="Add Warning Box"
        onClick={() => onFormatClick('warning')}
      />
      <IconButton
        icon={<Shield size={18} />}
        label="Add Safety Note"
        onClick={() => onFormatClick('safety')}
      />
      <IconButton
        icon={<Info size={18} />}
        label="Add Information Box"
        onClick={() => onFormatClick('info')}
      />
    </div>
  );
};
