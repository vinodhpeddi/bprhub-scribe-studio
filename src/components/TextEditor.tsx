
import React, { useState, useRef, useCallback, useMemo } from 'react';
import FormatToolbar from './FormatToolbar';
import { TableProperties } from './TableProperties';
import MergeFieldsDropdown from './MergeFieldsDropdown';
import { useEditorOperations } from '../hooks/useEditorOperations';
import { useEditorState } from '../hooks/useEditorState';
import EditableContent from './editor/EditableContent';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  documentTitle?: string;
  onSave?: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  initialContent, 
  onChange, 
  editorRef,
  documentTitle,
  onSave 
}) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const { 
    content, 
    setContent,
    isInitialized,
    setIsInitialized
  } = useEditorState(initialContent);
  
  const operations = useEditorOperations(onChange);

  // Removed the useAutosave hook here

  const updateActiveFormats = useCallback(() => {
    const formats: string[] = [];
    
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.push('bulletList');
    if (document.queryCommandState('insertOrderedList')) formats.push('orderedList');
    
    setActiveFormats(formats);
  }, []);

  const handleTableClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const table = target.closest('table');
    
    if (table) {
      setSelectedTable(table as HTMLTableElement);
      setShowTableProperties(true);
    } else {
      setSelectedTable(null);
      setShowTableProperties(false);
    }
  }, []);

  const handleEditorInput = useCallback(() => {
    if (!actualEditorRef.current) return;
    updateActiveFormats();
    const newContent = actualEditorRef.current.innerHTML;
    setContent(newContent);
    onChange(newContent);
  }, [updateActiveFormats, onChange, actualEditorRef]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      operations.handleListIndent(!e.shiftKey);
    }
  }, [operations]);

  const handleInsertMergeField = useCallback((field: string) => {
    document.execCommand('insertHTML', false, field);
    if (actualEditorRef.current) {
      const newContent = actualEditorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  }, [onChange, actualEditorRef]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  const formatToolbar = useMemo(() => (
    <FormatToolbar 
      onFormatClick={operations.handleFormatClick} 
      activeFormats={activeFormats}
      documentContent={content}
      documentTitle={documentTitle}
      onToggleFullScreen={toggleFullScreen}
      isFullScreen={isFullScreen}
      operations={operations}
    >
      <MergeFieldsDropdown onInsertField={handleInsertMergeField} />
    </FormatToolbar>
  ), [operations, activeFormats, documentTitle, toggleFullScreen, isFullScreen, handleInsertMergeField, content]);

  return (
    <div className={`w-full transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : ''}`}>
      <div className={`${isFullScreen ? 'container mx-auto max-w-6xl' : ''}`}>
        {formatToolbar}
        
        {showTableProperties && selectedTable && (
          <TableProperties 
            table={selectedTable}
            onClose={() => setShowTableProperties(false)}
          />
        )}
        
        <EditableContent
          editorRef={actualEditorRef}
          onInput={handleEditorInput}
          onKeyUp={updateActiveFormats}
          onKeyDown={handleKeyDown}
          onMouseUp={updateActiveFormats}
          onClick={handleTableClick}
          initialContent={initialContent}
          isInitialized={isInitialized}
          setIsInitialized={setIsInitialized}
          onChange={onChange}
          setContent={setContent}
        />
      </div>
    </div>
  );
};

export default React.memo(TextEditor);
