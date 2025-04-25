import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';
import { TableProperties } from './TableProperties';
import MergeFieldsDropdown from './MergeFieldsDropdown';
import { useEditorOperations } from '../hooks/useEditorOperations';
import { useEditorState } from '../hooks/useEditorState';
import { useCollaboration } from '../hooks/useCollaboration';
import EditableContent from './editor/EditableContent';
import DocumentLockStatus from './collaboration/DocumentLockStatus';
import UserPresence from './collaboration/UserPresence';
import ChangeTracking from './collaboration/ChangeTracking';
import { Button } from '@/components/ui/button';
import { Eye, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentChange } from '@/utils/collaborationTypes';
import { useComments } from '@/hooks/useComments';
import { Comments } from './comments/Comments';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  documentTitle?: string;
  onSave?: () => void;
  documentId?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ 
  initialContent, 
  onChange, 
  editorRef,
  documentTitle,
  onSave,
  documentId = 'temp-doc-id'
}) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChangeTracking, setShowChangeTracking] = useState(false);
  const [lastSelectedText, setLastSelectedText] = useState('');
  const [lastRangePosition, setLastRangePosition] = useState<{ start: number; end: number } | null>(null);
  
  const { 
    content, 
    setContent,
    isInitialized,
    setIsInitialized
  } = useEditorState(initialContent);
  
  const operations = useEditorOperations(onChange);
  
  const {
    isLocked,
    lockedBy,
    activeUsers,
    changes,
    trackChanges,
    lockDocument,
    unlockDocument,
    toggleTrackChanges,
    addDocumentChange
  } = useCollaboration(documentId);

  // Handle read-only mode when document is locked by someone else
  const isReadOnly = isLocked && lockedBy !== null;

  const updateActiveFormats = useCallback(() => {
    if (isReadOnly) return; // Don't update formats in read-only mode
    
    const formats: string[] = [];
    
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('insertUnorderedList')) formats.push('bulletList');
    if (document.queryCommandState('insertOrderedList')) formats.push('orderedList');
    
    setActiveFormats(formats);
    
    // Store the currently selected text for change tracking
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      setLastSelectedText(selectedText);
      
      // Also store the range position for tracking changes
      if (actualEditorRef.current) {
        const editorContent = actualEditorRef.current.innerHTML;
        // This is a simplified approach - in a real app you'd need a more robust way to track positions
        setLastRangePosition({
          start: editorContent.indexOf(selectedText),
          end: editorContent.indexOf(selectedText) + selectedText.length
        });
      }
    }
  }, [isReadOnly, actualEditorRef]);

  const handleTableClick = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return; // Don't handle table clicks in read-only mode
    
    const target = e.target as HTMLElement;
    const table = target.closest('table');
    
    if (table) {
      setSelectedTable(table as HTMLTableElement);
      setShowTableProperties(true);
    } else {
      setSelectedTable(null);
      setShowTableProperties(false);
    }
  }, [isReadOnly]);

  const handleEditorInput = useCallback(() => {
    if (!actualEditorRef.current) return;
    updateActiveFormats();
    const newContent = actualEditorRef.current.innerHTML;
    
    // If track changes is on, record the change
    if (trackChanges) {
      // This is a simplified approach - in a real app you'd need more sophisticated diff detection
      const previousContent = content;
      if (previousContent !== newContent) {
        addDocumentChange(
          'modification',
          newContent,
          previousContent,
          'text',
          lastRangePosition || undefined
        );
      }
    }
    
    setContent(newContent);
    onChange(newContent);
  }, [updateActiveFormats, onChange, actualEditorRef, trackChanges, content, addDocumentChange, lastRangePosition]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isReadOnly) {
      // Prevent editing in read-only mode
      if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && 
          e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' &&
          e.key !== 'Home' && e.key !== 'End' && 
          e.key !== 'PageUp' && e.key !== 'PageDown') {
        e.preventDefault();
        return;
      }
    }
    
    if (e.key === 'Tab') {
      e.preventDefault();
      operations.handleListIndent(!e.shiftKey);
    }
  }, [operations, isReadOnly]);

  const handleInsertMergeField = useCallback((field: string) => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    document.execCommand('insertHTML', false, field);
    if (actualEditorRef.current) {
      const newContent = actualEditorRef.current.innerHTML;
      
      // If track changes is on, record the insertion
      if (trackChanges) {
        addDocumentChange(
          'addition',
          field,
          undefined,
          'mergeField'
        );
      }
      
      setContent(newContent);
      onChange(newContent);
    }
  }, [onChange, actualEditorRef, isReadOnly, trackChanges, addDocumentChange]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Handle change acceptance
  const handleAcceptChange = useCallback((change: DocumentChange) => {
    // In a real app, you'd apply the change to the document content
    // For now, we'll just show a toast
    toast.success('Change accepted');
  }, []);

  // Handle change rejection
  const handleRejectChange = useCallback((change: DocumentChange) => {
    // In a real app, you'd revert the change
    // For now, we'll just show a toast
    toast.error('Change rejected');
  }, []);

  const formatToolbar = useMemo(() => (
    <FormatToolbar 
      onFormatClick={operations.handleFormatClick} 
      activeFormats={activeFormats}
      documentContent={content}
      documentTitle={documentTitle}
      onToggleFullScreen={toggleFullScreen}
      isFullScreen={isFullScreen}
      operations={operations}
      disabled={isReadOnly}
    >
      <MergeFieldsDropdown onInsertField={handleInsertMergeField} disabled={isReadOnly} />
    </FormatToolbar>
  ), [
    operations, 
    activeFormats, 
    documentTitle, 
    toggleFullScreen, 
    isFullScreen, 
    handleInsertMergeField, 
    content, 
    isReadOnly
  ]);
  
  const {
    comments,
    displayMode,
    setDisplayMode,
    addComment,
    editComment,
    deleteComment,
    resolveComment,
    reopenComment
  } = useComments();

  return (
    <div className={`w-full transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : ''}`}>
      <div className={`${isFullScreen ? 'container mx-auto max-w-6xl' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {documentId && <UserPresence documentId={documentId} />}
            
            {isReadOnly && (
              <div className="flex items-center text-sm text-amber-600">
                <Eye className="h-4 w-4 mr-1" />
                <span>View only (locked by {lockedBy})</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={trackChanges ? "default" : "outline"}
              size="sm"
              onClick={toggleTrackChanges}
              className="flex items-center"
              disabled={isReadOnly}
            >
              <PenLine className="h-4 w-4 mr-1" />
              <span>Track Changes</span>
            </Button>
            
            <Button
              variant={showChangeTracking ? "default" : "outline"}
              size="sm"
              onClick={() => setShowChangeTracking(!showChangeTracking)}
              className="flex items-center"
            >
              <span>Changes</span>
              {changes.filter(c => c.status === 'pending').length > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px]">
                  {changes.filter(c => c.status === 'pending').length}
                </span>
              )}
            </Button>
            
            {documentId && (
              <DocumentLockStatus 
                documentId={documentId}
              />
            )}
          </div>
        </div>
        
        {formatToolbar}
        
        {showTableProperties && selectedTable && (
          <TableProperties 
            table={selectedTable}
            onClose={() => setShowTableProperties(false)}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={showChangeTracking ? "md:col-span-2" : "md:col-span-3"}>
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
              isReadOnly={isReadOnly}
            />
          </div>
          
          {showChangeTracking && (
            <div className="md:col-span-1">
              <h3 className="text-sm font-medium mb-2">Document Changes</h3>
              <ChangeTracking 
                documentId={documentId}
                onAcceptChange={handleAcceptChange}
                onRejectChange={handleRejectChange}
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={displayMode === 'inline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDisplayMode('inline')}
          >
            Inline Comments
          </Button>
          <Button
            variant={displayMode === 'narrow-sidebar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDisplayMode('narrow-sidebar')}
          >
            Narrow Sidebar
          </Button>
          <Button
            variant={displayMode === 'wide-sidebar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDisplayMode('wide-sidebar')}
          >
            Wide Sidebar
          </Button>
        </div>
        
        <Comments
          comments={comments}
          displayMode={displayMode}
          onAddComment={addComment}
          onEditComment={editComment}
          onDeleteComment={deleteComment}
          onResolveComment={resolveComment}
          onReopenComment={reopenComment}
        />
      </div>
    </div>
  );
};

export default React.memo(TextEditor);
