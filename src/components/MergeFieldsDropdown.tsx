
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { availableMergeFields } from '@/utils/mergeFields';

interface MergeFieldsDropdownProps {
  onInsertField: (field: string) => void;
}

const MergeFieldsDropdown: React.FC<MergeFieldsDropdownProps> = ({ onInsertField }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 w-9 p-0" title="Insert Merge Field">
          <FileText className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {availableMergeFields.map((field) => (
          <DropdownMenuItem
            key={field.key}
            onClick={() => onInsertField(`{{${field.key}}}`)}
          >
            {field.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MergeFieldsDropdown;
