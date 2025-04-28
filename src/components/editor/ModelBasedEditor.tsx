
import React, { useEffect, useCallback } from 'react';
import { useModelEditor } from '@/hooks/editor/useModelEditor';
import { EditorToolbar } from './EditorToolbar';
import { EditorToolbarActions } from './EditorToolbarActions';
import { CommentControls } from './CommentControls';
import { TableProperties } from '../TableProperties';
import MergeFieldsDropdown from '../MergeFieldsDropdown';
import { Comments } from '../comments/Comments';
import { useComments } from '@/hooks/useComments';
import { toast } from 'sonner';

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
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showChangeTracking, setShowChangeTracking] = useState(false);
  
  const {
    isLocked,
    lockedBy,
    trackChanges,
    changes,
    toggleTrackChanges
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

  useEffect(() => {
    if (state.isReady) {
      actions.forceHtmlUpdate(initialContent);
    }
  }, [initialContent, state.isReady, actions]);

  const handleFormatClick = useCallback((formatType: string, value?: string) => {
    if (isReadOnly) return;
    
    switch (formatType) {
      case 'bold':
        actions.formatText('bold');
        break;
      case 'italic':
        actions.formatText('italic');
        break;
      case 'underline':
        actions.formatText('underline');
        break;
      case 'link':
        const url = prompt('Enter link URL:');
        if (url) {
          actions.formatText('link', { href: url });
        }
        break;
      case 'highlight':
        actions.formatText('highlight');
        break;
      case 'comment':
        const comment = prompt('Enter your comment:');
        if (comment) {
          actions.formatText('comment', { text: comment });
        }
        break;
      // Block types
      case 'formatBlock':
        if (value === 'h1') {
          actions.setBlockType('heading', { level: 1 });
        } else if (value === 'h2') {
          actions.setBlockType('heading', { level: 2 });
        } else if (value === 'h3') {
          actions.setBlockType('heading', { level: 3 });
        } else if (value === 'p') {
          actions.setBlockType('paragraph');
        }
        break;
      case 'bulletList':
        // Simplified - would need to handle conversion from other block types
        actions.setBlockType('bullet_list');
        break;
      case 'orderedList':
        // Simplified - would need to handle conversion from other block types
        actions.setBlockType('ordered_list');
        break;
      // More handlers would go here
    }
    
    // Update active formats based on selection
    updateActiveFormats();
  }, [actions, isReadOnly]);

  const updateActiveFormats = useCallback(() => {
    const formats: string[] = [];
    // Logic to detect active formats based on model and selection
    // This would need to be implemented based on the current selection
    setActiveFormats(formats);
  }, []);

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

  const handleTableInsert = useCallback((isLayout: boolean = false) => {
    if (isReadOnly) return;

    // Import factory functions
    const { createTable, createTableRow, createTableCell, createParagraph, createText } = require('@/utils/editor/model/documentFactory');
    
    // Create a simple 2x2 table
    const table = createTable([
      createTableRow([
        createTableCell([createParagraph([createText('')])]),
        createTableCell([createParagraph([createText('')])])
      ]),
      createTableRow([
        createTableCell([createParagraph([createText('')])]),
        createTableCell([createParagraph([createText('')])])
      ])
    ], isLayout);
    
    actions.insertBlock(table);
  }, [actions, isReadOnly]);

  const handleInsertImage = useCallback(() => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    const url = prompt('Enter image URL:');
    if (!url) return;
    
    const { createImage } = require('@/utils/editor/model/documentFactory');
    const image = createImage(url, 'Inserted image');
    actions.insertBlock(image);
  }, [actions, isReadOnly]);

  const handleInsertChecklist = useCallback(() => {
    if (isReadOnly) return;
    
    const { createParagraph, createText } = require('@/utils/editor/model/documentFactory');
    const checklistHtml = `
      <ul style="list-style-type: none; padding-left: 0;">
        <li><input type="checkbox" /> Checklist item 1</li>
        <li><input type="checkbox" /> Checklist item 2</li>
        <li><input type="checkbox" /> Checklist item 3</li>
      </ul>
    `;
    
    // For now, we'll insert as HTML until we have proper checklist support in the model
    if (state.editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.getRangeAt(0).insertNode(document.createTextNode(checklistHtml));
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      } else {
        state.editorRef.current.innerHTML += checklistHtml;
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      }
    }
  }, [actions, state.editorRef, isReadOnly]);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Convert standard editor operations to model operations
  const editorOperations = {
    insertTable: handleTableInsert,
    insertChecklist: handleInsertChecklist,
    insertImage: handleInsertImage,
    handleListIndent: (increase: boolean) => {
      // To be implemented with model operations
      toast.info('List indentation support coming soon');
    },
    handleFormatClick,
    insertDefaultHeading: () => {
      if (isReadOnly) return;
      const { createHeading, createParagraph, createText } = require('@/utils/editor/model/documentFactory');
      actions.insertBlock(createHeading(1, [createText('Your Document Title')]));
      actions.insertBlock(createParagraph([createText('Start writing your content here...')]));
    },
    handleTableInsert: handleTableInsert,
    handleImageInsert: handleInsertImage
  };

  const handleInsertMergeField = useCallback((field: string) => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    if (state.editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(field));
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      } else {
        state.editorRef.current.innerHTML += field;
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      }
    }
  }, [state.editorRef, actions, isReadOnly]);

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
          onFormatClick={editorOperations.handleFormatClick}
          activeFormats={activeFormats}
          documentContent={state.html}
          documentTitle={documentTitle}
          onToggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
          operations={editorOperations}
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

export default React.memo(ModelBasedEditor);

// Missing imports that need to be added
import { useState } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';
import ChangeTracking from '../collaboration/ChangeTracking';
