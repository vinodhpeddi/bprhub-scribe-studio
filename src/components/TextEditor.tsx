
import React, { useState, useRef, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';
import { TableProperties } from './TableProperties';
import EditorContent from './editor/EditorContent';
import { useEditorOperations } from '../hooks/useEditorOperations';
import { importDocument } from '@/utils/documentImport';
import { toast } from 'sonner';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialContent, onChange, editorRef }) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [content, setContent] = useState(initialContent);
  
  const operations = useEditorOperations(onChange);

  useEffect(() => {
    if (actualEditorRef.current) {
      actualEditorRef.current.innerHTML = initialContent;
    }
  }, [initialContent, actualEditorRef]);

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

  return (
    <div className="w-full">
      <FormatToolbar 
        onFormatClick={operations.handleFormatClick} 
        activeFormats={activeFormats}
        documentContent={content}
        documentTitle="Document"
      />
      
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
  );
};

export default TextEditor;
