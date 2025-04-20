
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import FormatToolbar from './FormatToolbar';
import { TableProperties } from './TableProperties';
import EditorContent from './editor/EditorContent';
import { useEditorOperations } from '../hooks/useEditorOperations';
import MergeFieldsDropdown from './MergeFieldsDropdown';
import { useEditorState } from '../hooks/useEditorState';

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
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Use the new hook for editor state management
  const { 
    content, 
    setContent, 
    isInitialized,
    setIsInitialized
  } = useEditorState(initialContent);
  
  // Use memoized operations to prevent unnecessary re-renders
  const operations = useEditorOperations(onChange);

  // Handle programmatic content updates
  useEffect(() => {
    if (isInitialized && initialContent !== content) {
      // Update the content if it's changed externally
      setContent(initialContent);
    }
  }, [initialContent, isInitialized, content, setContent]);

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
    if (actualEditorRef.current) {
      updateActiveFormats();
      
      // Get content and propagate change
      const newContent = actualEditorRef.current.innerHTML;
      setContent(newContent);
      onChange(newContent);
    }
  }, [updateActiveFormats, onChange, actualEditorRef, setContent]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text');
    document.execCommand('insertHTML', false, text);
  }, []);

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
  }, [onChange, actualEditorRef, setContent]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Memoize toolbar to prevent re-renders
  const formatToolbar = useMemo(() => (
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
  ), [operations, activeFormats, documentTitle, toggleFullScreen, isFullScreen, handleInsertMergeField, content]);

  return (
    <div className={`w-full transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <div className={`${isFullScreen ? 'container mx-auto max-w-6xl' : ''}`}>
        {formatToolbar}
        
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
          initialContent={initialContent}
          isInitialized={isInitialized}
          setIsInitialized={setIsInitialized}
        />
      </div>
    </div>
  );
};

export default React.memo(TextEditor);
