
import React from 'react';
import { Table, Check, Image, Highlighter, Pencil, MessageSquare, AlertTriangle, Shield, Info } from 'lucide-react';
import IconButton from '../ui/IconButton';

interface InsertToolsProps {
  onFormatClick: (formatType: string) => void;
}

export const InsertTools: React.FC<InsertToolsProps> = ({ onFormatClick }) => {
  return (
    <div className="flex items-center gap-1">
      <IconButton
        icon={<Table size={18} />}
        label="Insert Table"
        onClick={() => onFormatClick('table')}
      />
      <IconButton
        icon={<Table size={18} />}
        label="Layout Table"
        onClick={() => onFormatClick('layoutTable')}
      />
      <IconButton
        icon={<Check size={18} />}
        label="Checklist"
        onClick={() => onFormatClick('checklist')}
      />
      <IconButton
        icon={<Image size={18} />}
        label="Insert Image"
        onClick={() => onFormatClick('image')}
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
