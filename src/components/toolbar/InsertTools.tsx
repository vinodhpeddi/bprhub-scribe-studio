
import React from 'react';
import { Table, LayoutGrid, Check, Image, Highlighter, Pencil, MessageSquare, AlertTriangle, Shield, Info } from 'lucide-react';
import IconButton from '../ui/IconButton';

interface InsertToolsProps {
  onFormatClick: (formatType: string) => void;
  onInsertTable: (isLayout?: boolean) => void;
  onInsertImage: () => void;
  disabled?: boolean; // Add disabled prop
}

export const InsertTools: React.FC<InsertToolsProps> = ({ 
  onFormatClick,
  onInsertTable,
  onInsertImage,
  disabled = false // Default to enabled
}) => {
  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon={<Table size={18} />}
        label="Insert Table"
        onClick={() => onInsertTable(false)}
        disabled={disabled}
      />
      <IconButton
        icon={<LayoutGrid size={18} />}
        label="Layout Table"
        onClick={() => onInsertTable(true)}
        disabled={disabled}
      />
      <IconButton
        icon={<Check size={18} />}
        label="Checklist"
        onClick={() => onFormatClick('checklist')}
        disabled={disabled}
      />
      <IconButton
        icon={<Image size={18} />}
        label="Insert Image"
        onClick={onInsertImage}
        disabled={disabled}
      />
      <IconButton
        icon={<Highlighter size={18} />}
        label="Highlight"
        onClick={() => onFormatClick('highlight')}
        disabled={disabled}
      />
      <IconButton
        icon={<Pencil size={18} />}
        label="Redline"
        onClick={() => onFormatClick('redline')}
        disabled={disabled}
      />
      <IconButton
        icon={<MessageSquare size={18} />}
        label="Add Comment"
        onClick={() => onFormatClick('comment')}
        disabled={disabled}
      />
      <IconButton
        icon={<AlertTriangle size={18} />}
        label="Add Warning Box"
        onClick={() => onFormatClick('warning')}
        disabled={disabled}
      />
      <IconButton
        icon={<Shield size={18} />}
        label="Add Safety Note"
        onClick={() => onFormatClick('safety')}
        disabled={disabled}
      />
      <IconButton
        icon={<Info size={18} />}
        label="Add Information Box"
        onClick={() => onFormatClick('info')}
        disabled={disabled}
      />
    </div>
  );
};
