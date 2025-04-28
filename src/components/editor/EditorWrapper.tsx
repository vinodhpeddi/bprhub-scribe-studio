import React from 'react';
import UserPresence from '../collaboration/UserPresence';
import ChangeTracking from '../collaboration/ChangeTracking';
import { EditorToolbar } from './EditorToolbar';
import { EditorToolbarActions } from './EditorToolbarActions';
import { CommentControls } from './CommentControls';
import { Comments } from '../comments/Comments';
import MergeFieldsDropdown from '../MergeFieldsDropdown';
import { TableProperties } from '../TableProperties';
import { CommentDisplayMode } from '@/utils/commentTypes';

interface EditorWrapperProps {
  documentId: string;
  documentTitle: string;
  isLocked: boolean;
  lockedBy: any;
  isViewingRevision: boolean;
  currentRevision: any;
  revisions: any[];
  trackChanges: boolean;
  toggleTrackChanges: () => void;
  showChangeTracking: boolean;
  setShowChangeTracking: (show: boolean) => void;
  changes: any[];
  onExitRevisionView: () => void;
  onSaveRevision: (label?: string, description?: string) => void;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
  isReadOnly: boolean;
  isFullScreen: boolean;
  toggleFullScreen: () => void;
  activeFormats: string[];
  documentContent: string;
  operations: any;
  onHandleFormatClick: (formatType: string, value?: string) => void;
  onInsertMergeField: (field: string) => void;
  showTableProperties: boolean;
  selectedTable: HTMLTableElement | null;
  onCloseTableProperties: () => void;
  children: React.ReactNode;
  displayMode: string;
  setDisplayMode: (mode: string) => void;
  comments: any[];
  commentActions: {
    addComment: (blockId: string, text: string, user?: any) => void;
    editComment: (commentId: string, text: string) => void;
    deleteComment: (commentId: string) => void;
    resolveComment: (commentId: string) => void;
    reopenComment: (commentId: string) => void;
  };
}

const EditorWrapper: React.FC<EditorWrapperProps> = ({
  documentId,
  documentTitle,
  isLocked,
  lockedBy,
  isViewingRevision,
  currentRevision,
  revisions,
  trackChanges,
  toggleTrackChanges,
  showChangeTracking,
  setShowChangeTracking,
  changes,
  onExitRevisionView,
  onSaveRevision,
  onViewRevision,
  onRestoreRevision,
  onUpdateRevision,
  onSetAutoSave,
  autoSaveInterval,
  isReadOnly,
  isFullScreen,
  toggleFullScreen,
  activeFormats,
  documentContent,
  operations,
  onHandleFormatClick,
  onInsertMergeField,
  showTableProperties,
  selectedTable,
  onCloseTableProperties,
  children,
  displayMode,
  setDisplayMode,
  comments,
  commentActions
}) => {
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
          onFormatClick={onHandleFormatClick}
          activeFormats={activeFormats}
          documentContent={documentContent}
          documentTitle={documentTitle}
          onToggleFullScreen={toggleFullScreen}
          isFullScreen={isFullScreen}
          operations={operations}
          disabled={isReadOnly}
        >
          <MergeFieldsDropdown onInsertField={onInsertMergeField} disabled={isReadOnly} />
        </EditorToolbar>

        {showTableProperties && selectedTable && (
          <TableProperties 
            table={selectedTable}
            onClose={onCloseTableProperties}
          />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={showChangeTracking ? "md:col-span-2" : "md:col-span-3"}>
            {children}
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
          displayMode={displayMode as CommentDisplayMode}
          setDisplayMode={setDisplayMode}
        />
        
        <Comments
          comments={comments}
          displayMode={displayMode as CommentDisplayMode}
          onAddComment={commentActions.addComment}
          onEditComment={commentActions.editComment}
          onDeleteComment={commentActions.deleteComment}
          onResolveComment={commentActions.resolveComment}
          onReopenComment={commentActions.reopenComment}
        />
      </div>
    </div>
  );
};

export default EditorWrapper;
