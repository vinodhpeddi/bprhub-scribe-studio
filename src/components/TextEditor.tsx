
import React, { useState, useRef, useCallback } from 'react';
import { useEditorOperations } from '../hooks/useEditorOperations';
import { useEditorState } from '../hooks/useEditorState';
import { useCollaboration } from '../hooks/useCollaboration';
import EditableContent from './editor/EditableContent';
import { TableProperties } from './TableProperties';
import MergeFieldsDropdown from './MergeFieldsDropdown';
import { toast } from 'sonner';
import { DocumentChange } from '@/utils/collaborationTypes';
import { useComments } from '@/hooks/useComments';
import { Comments } from './comments/Comments';
import { EditorToolbar } from './editor/EditorToolbar';
import { EditorToolbarActions } from './editor/EditorToolbarActions';
import { CommentControls } from './editor/CommentControls';
import UserPresence from './collaboration/UserPresence';
import ChangeTracking from './collaboration/ChangeTracking';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  documentTitle?: string;
  onSave?: () => void;
  documentId?: string;
  revisions?: import('@/utils/commentTypes').Revision[];
  currentRevision?: import('@/utils/commentTypes').Revision | null;
  isViewingRevision?: boolean;
  onSaveRevision?: (label?: string, description?: string) => void;
  onViewRevision?: (revisionId: string) => void;
  onRestoreRevision?: (revisionId: string) => void;
  onExitRevisionView?: () => void;
  onUpdateRevision?: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave?: (intervalMinutes: number | null) => void;
  autoSaveInterval?: number | null;
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialContent,
  onChange,
  editorRef,
  documentTitle = '',
  documentId = 'temp-doc-id',
  revisions = [],
  currentRevision = null,
  isViewingRevision = false,
  onSaveRevision = () => {},
  onViewRevision = () => {},
  onRestoreRevision = () => {},
  onExitRevisionView = () => {},
  onUpdateRevision = () => {},
  onSetAutoSave = () => {},
  autoSaveInterval = null
}) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChangeTracking, setShowChangeTracking] = useState(false);
  
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
    trackChanges,
    changes,
    toggleTrackChanges,
    addDocumentChange
  } = useCollaboration(documentId);

  const isReadOnly = (isLocked && lockedBy !== null) || isViewingRevision;

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

  const handleTableClick = useCallback((e: React.MouseEvent) => {
    if (isReadOnly) return;
    
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

  const handleInsertMergeField = useCallback((field: string) => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    document.execCommand('insertHTML', false, field);
  }, [isReadOnly]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  return (
    <div className={`w-full transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : ''}`}>
      <div className={`${isFullScreen ? 'container mx-auto max-w-6xl' : ''}`}>
        <EditorToolbarActions
          documentId={documentId}
          documentTitle={documentTitle}
          isLocked={isLocked}
          lockedBy={lockedBy}
          isViewingRevision={isViewingRevision}
          currentRevision={currentRevision}
          revisions={revisions}
          trackChanges={trackChanges}
          toggleTrackChanges={toggleTrackChanges}
          showChangeTracking={showChangeTracking}
          setShowChangeTracking={setShowChangeTracking}
          changes={changes}
          onExitRevisionView={onExitRevisionView}
          onSaveRevision={onSaveRevision}
          onViewRevision={onViewRevision}
          onRestoreRevision={onRestoreRevision}
          onUpdateRevision={onUpdateRevision}
          onSetAutoSave={onSetAutoSave}
          autoSaveInterval={autoSaveInterval}
          isReadOnly={isReadOnly}
        />
        
        <EditorToolbar
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
        </EditorToolbar>

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
              onInput={() => {
                operations.handleFormatClick('');
                onChange(actualEditorRef.current?.innerHTML || '');
              }}
              onKeyUp={() => operations.handleFormatClick('')}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  operations.handleListIndent(!e.shiftKey);
                }
              }}
              onMouseUp={() => operations.handleFormatClick('')}
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
                onAcceptChange={() => {}}
                onRejectChange={() => {}}
              />
            </div>
          )}
        </div>
        
        <CommentControls
          displayMode={displayMode}
          setDisplayMode={setDisplayMode}
        />
        
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
