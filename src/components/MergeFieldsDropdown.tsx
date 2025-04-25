
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Database, ChevronDown } from 'lucide-react';
import { MergeField, availableMergeFields } from '@/utils/mergeFields';

export interface MergeFieldsDropdownProps {
  onInsertField: (field: string) => void;
  disabled?: boolean;
}

const MergeFieldsDropdown: React.FC<MergeFieldsDropdownProps> = ({ 
  onInsertField,
  disabled = false
}) => {
  const [open, setOpen] = useState(false);
  
  // Use the availableMergeFields imported from the utility file
  // which matches the MergeField interface
  
  const handleSelectField = (field: string) => {
    onInsertField(field);
    setOpen(false);
  };
  
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center h-8" 
          size="sm"
          disabled={disabled}
        >
          <Database className="h-4 w-4 mr-1" />
          <span>Merge Fields</span>
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {availableMergeFields.map((field) => (
          <DropdownMenuItem 
            key={field.key} 
            onClick={() => handleSelectField(`{{${field.key}}}`)}
          >
            {field.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MergeFieldsDropdown;
