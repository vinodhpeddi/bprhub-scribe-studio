
import React, { useState } from 'react';
import TextFormatting from '../toolbar/TextFormatting';
import { ListFormatting } from '../toolbar/ListFormatting';
import { HeadingControls } from '../toolbar/HeadingControls';
import { InsertTools } from '../toolbar/InsertTools';
import { ExportTools } from '../toolbar/ExportTools';
import { Separator } from '../ui/separator';
import { Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../ui/button';
import { FormatToolbarProps } from '@/types/editor';

export function EditorToolbar({
  onFormatClick,
  activeFormats,
  documentContent,
  documentTitle = 'Document',
  onToggleFullScreen,
  isFullScreen = false,
  operations,
  children,
  disabled = false
}: FormatToolbarProps) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  return (
    <div className="bg-white border rounded-md mb-4 shadow-sm">
      <div className="p-1 flex flex-wrap items-center gap-1">
        <TextFormatting onFormatClick={onFormatClick} activeFormats={activeFormats} disabled={disabled} />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <ListFormatting onFormatClick={onFormatClick} activeFormats={activeFormats} disabled={disabled} />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <HeadingControls onFormatClick={onFormatClick} disabled={disabled} />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <InsertTools 
          onFormatClick={onFormatClick} 
          onInsertTable={operations?.handleTableInsert} 
          onInsertImage={operations?.handleImageInsert}
          disabled={disabled}
        />
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <ExportTools 
          documentContent={documentContent} 
          documentTitle={documentTitle}
          disabled={disabled}
        />
        
        {children && (
          <>
            <Separator orientation="vertical" className="mx-1 h-6" />
            {children}
          </>
        )}
        
        <div className="ml-auto">
          {onToggleFullScreen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onToggleFullScreen}
              className="h-8 w-8"
            >
              {isFullScreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
