
import React, { useState, useRef, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';
import { TableProperties } from './TableProperties';
import EditorContent from './editor/EditorContent';
import { useEditorOperations } from '../hooks/useEditorOperations';
import { toast } from 'sonner';
import MergeFieldsDropdown from './MergeFieldsDropdown';
import { replaceMergeFields } from '@/utils/mergeFields';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  documentTitle?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  initialContent, 
  onChange, 
  editorRef,
  documentTitle = "Document" 
}) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [content, setContent] = useState(initialContent);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const operations = useEditorOperations(onChange);

  useEffect(() => {
    if (actualEditorRef.current) {
      actualEditorRef.current.innerHTML = initialContent;
      
      // Check if document has any headings, if not, insert a default one
      setTimeout(() => {
        if (actualEditorRef.current) {
          const headings = actualEditorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings.length === 0 && initialContent.trim() === '') {
            operations.insertDefaultHeading();
            if (actualEditorRef.current) {
              const newContent = actualEditorRef.current.innerHTML;
              setContent(newContent);
              onChange(newContent);
            }
          }
        }
      }, 100);
    }
  }, [initialContent, actualEditorRef, operations, onChange]);

  useEffect(() => {
    // Handle Escape key to exit fullscreen
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullScreen]);

  const updateActiveFormats = () => {
    const formats: string[] = [];
    
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.push('bulletList');
    if (document.queryCommandState('insertOrderedList')) formats.push('orderedList');
    
    setActiveFormats(formats);
  };

  const handleTableClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const table = target.closest('table');
    
    if (table) {
      setSelectedTable(table as HTMLTableElement);
      setShowTableProperties(true);
    } else {
      setSelectedTable(null);
      setShowTableProperties(false);
    }
  };

  const handleEditorInput = () => {
    if (actualEditorRef.current) {
      updateActiveFormats();
      const newContent = actualEditorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text');
    document.execCommand('insertHTML', false, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      operations.handleListIndent(!e.shiftKey);
    }
  };

  const handleInsertMergeField = (field: string) => {
    document.execCommand('insertHTML', false, field);
    if (actualEditorRef.current) {
      const newContent = actualEditorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className={`w-full transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <div className={`${isFullScreen ? 'container mx-auto max-w-6xl' : ''}`}>
        <FormatToolbar 
          onFormatClick={operations.handleFormatClick} 
          activeFormats={activeFormats}
          documentContent={content}
          documentTitle={documentTitle}
          onToggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
        >
          <MergeFieldsDropdown onInsertField={handleInsertMergeField} />
        </FormatToolbar>
        
        {showTableProperties && selectedTable && (
          <TableProperties 
            table={selectedTable}
            onClose={() => setShowTableProperties(false)}
          />
        )}
        
        <EditorContent
          editorRef={actualEditorRef}
          onInput={handleEditorInput}
          onPaste={handlePaste}
          onKeyUp={updateActiveFormats}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveFormats}
          onClick={handleTableClick}
        />
      </div>
    </div>
  );
};

export default TextEditor;
