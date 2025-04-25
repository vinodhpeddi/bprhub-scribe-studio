
import React from 'react';
import TextEditor from '@/components/TextEditor';
import DocumentOutline from '@/components/DocumentOutline';
import EditorHeader from '@/components/EditorHeader';
import { UserDocument } from '@/utils/documentTypes';

interface DocumentWorkspaceProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  documentContent: string;
  onDocumentContentChange: (content: string) => void;
  currentDocument: UserDocument | null;
  onSaveDocument: () => void;
  onFinalizeDocument: () => void;
  editorRef: React.RefObject<HTMLDivElement>;
  onImportComplete: (content: string) => void;
  onDocumentSelect: (document: UserDocument) => void;
  isDraft: boolean;
  // Revision props
  revisions: import('@/utils/commentTypes').Revision[];
  currentRevision: import('@/utils/commentTypes').Revision | null;
  isViewingRevision: boolean;
  onSaveRevision: (label?: string, description?: string) => void;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onExitRevisionView: () => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
}

const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({
  documentTitle,
  onTitleChange,
  documentContent,
  onDocumentContentChange,
  currentDocument,
  onSaveDocument,
  onFinalizeDocument,
  editorRef,
  onImportComplete,
  onDocumentSelect,
  isDraft,
  // Revision props
  revisions,
  currentRevision,
  isViewingRevision,
  onSaveRevision,
  onViewRevision,
  onRestoreRevision,
  onExitRevisionView,
  onUpdateRevision,
  onSetAutoSave,
  autoSaveInterval
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <EditorHeader 
          documentTitle={documentTitle || ""}
          onTitleChange={onTitleChange}
          onSave={onSaveDocument}
          documentContent={documentContent}
          onImport={onImportComplete}
          onDocumentSelect={onDocumentSelect}
        />
        
        {isDraft && (
          <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-amber-800 text-sm flex items-center">
            <span className="font-medium mr-2">DRAFT</span>
            <span>This document is in draft mode. Click "Finalize Document" when you're ready to publish it.</span>
          </div>
        )}
        
        <TextEditor 
          initialContent={documentContent}
          onChange={onDocumentContentChange}
          editorRef={editorRef}
          documentTitle={documentTitle}
          onSave={onSaveDocument}
          documentId={currentDocument?.id}
          revisions={revisions}
          currentRevision={currentRevision}
          isViewingRevision={isViewingRevision}
          onSaveRevision={onSaveRevision}
          onViewRevision={onViewRevision}
          onRestoreRevision={onRestoreRevision}
          onExitRevisionView={onExitRevisionView}
          onUpdateRevision={onUpdateRevision}
          onSetAutoSave={onSetAutoSave}
          autoSaveInterval={autoSaveInterval}
        />
      </div>
      
      <div className="lg:col-span-1">
        <DocumentOutline 
          content={documentContent} 
          editorRef={editorRef}
        />
      </div>
    </div>
  );
};

export default DocumentWorkspace;
