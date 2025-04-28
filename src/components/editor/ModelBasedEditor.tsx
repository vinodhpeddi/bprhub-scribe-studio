
import React from 'react';
import { useModelEditor } from '@/hooks/editor/useModelEditor';
import EditorWrapper from './EditorWrapper';
import { useEditorOperations } from '@/hooks/useEditorOperations';
import { useModelEditorContent } from '@/hooks/editor/useModelEditorContent';
import { useModelEditorFormatting } from '@/hooks/editor/useModelEditorFormatting';
import { useModelEditorCollaboration } from '@/hooks/editor/useModelEditorCollaboration';

interface ModelBasedEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
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

const ModelBasedEditor: React.FC<ModelBasedEditorProps> = ({
  initialContent,
  onChange,
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
  const [state, actions] = useModelEditor(initialContent, onChange);
  
  // Use custom hooks for different functionality groups
  const { 
    showTableProperties, 
    selectedTable, 
    isFullScreen, 
    toggleFullScreen, 
    closeTableProperties,
    handleTableClick
  } = useModelEditorContent(state.editorRef, state.isReady);
  
  const {
    activeFormats,
    handleFormatClick,
    handleInsertMergeField
  } = useModelEditorFormatting(actions, state);
  
  const {
    isLocked,
    lockedBy,
    trackChanges,
    changes,
    toggleTrackChanges,
    showChangeTracking,
    setShowChangeTracking
  } = useModelEditorCollaboration(documentId);
  
  // Get comment functionality from the useComments hook
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
  
  // Check if the editor is in read-only mode
  const isReadOnly = (isLocked && lockedBy !== null) || isViewingRevision;
  
  // Update content when initialContent changes
  useEffect(() => {
    if (state.isReady) {
      actions.forceHtmlUpdate(initialContent);
    }
  }, [initialContent, state.isReady, actions]);
  
  // Get standard editor operations
  const editorOperations = useModelEditorOperations(
    actions,
    state,
    isReadOnly
  );

  return (
    <EditorWrapper
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
      isFullScreen={isFullScreen}
      toggleFullScreen={toggleFullScreen}
      activeFormats={activeFormats}
      documentContent={state.html}
      operations={editorOperations}
      onHandleFormatClick={handleFormatClick}
      onInsertMergeField={handleInsertMergeField}
      showTableProperties={showTableProperties}
      selectedTable={selectedTable}
      onCloseTableProperties={closeTableProperties}
      displayMode={displayMode}
      setDisplayMode={setDisplayMode}
      comments={comments}
      commentActions={{
        addComment,
        editComment,
        deleteComment,
        resolveComment,
        reopenComment
      }}
    >
      <div
        ref={state.editorRef}
        className={`editor-content min-h-[400px] border border-gray-200 rounded-md p-4 overflow-auto ${
          isReadOnly ? 'bg-gray-50 cursor-default' : ''
        }`}
        contentEditable={!isReadOnly}
        suppressContentEditableWarning={true}
        onClick={handleTableClick}
        spellCheck={!isReadOnly}
        aria-readonly={isReadOnly}
        style={{
          fontSize: '14px',
          lineHeight: '1.6',
          fontFamily: 'Arial, sans-serif',
          minHeight: '50vh',
          maxHeight: '70vh',
          overflowY: 'auto',
          userSelect: isReadOnly ? 'text' : 'auto',
          WebkitUserSelect: isReadOnly ? 'text' : 'auto',
        }}
      />
    </EditorWrapper>
  );
};

export default React.memo(ModelBasedEditor);

// Import statements for hooks used in the component
import { useState, useEffect } from 'react';
import { useComments } from '@/hooks/useComments';
import { useModelEditorOperations } from '@/hooks/editor/useModelEditorOperations';
