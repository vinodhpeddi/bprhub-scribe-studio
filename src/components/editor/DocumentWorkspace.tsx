
import React, { useState } from 'react';
import { UserDocument } from '@/utils/documentTypes';
import EditorHeader from '@/components/EditorHeader';
import TextEditor from '@/components/TextEditor';
import ModelBasedEditor from '@/components/editor/ModelBasedEditor';
import { RevisionHistory } from '@/components/revision/RevisionHistory';
import { Button } from '../ui/button';
import { Save } from 'lucide-react';
import { Revision } from '@/utils/commentTypes';
import { toast } from 'sonner';

interface DocumentWorkspaceProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  documentContent: string;
  onDocumentContentChange: (content: string) => void;
  currentDocument: UserDocument | null;
  onSaveDocument: (title?: string, content?: string) => void;
  onFinalizeDocument?: () => void;
  editorRef?: React.RefObject<HTMLDivElement>;
  onImportComplete?: (content: string) => void;
  onDocumentSelect?: (document: UserDocument) => void;
  isDraft?: boolean;
  revisions?: Revision[];
  currentRevision?: Revision | null;
  isViewingRevision?: boolean;
  onSaveRevision?: (label?: string, description?: string) => void;
  onViewRevision?: (revisionId: string) => void;
  onRestoreRevision?: (revisionId: string) => void;
  onExitRevisionView?: () => void;
  onUpdateRevision?: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave?: (intervalMinutes: number | null) => void;
  autoSaveInterval?: number | null;
}

const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({
  documentTitle,
  onTitleChange,
  documentContent,
  onDocumentContentChange,
  currentDocument,
  onSaveDocument,
  onFinalizeDocument = () => {},
  editorRef,
  onImportComplete = () => {},
  onDocumentSelect = () => {},
  isDraft = false,
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
  const [useModelEditor, setUseModelEditor] = useState(false);

  const handleSave = () => {
    onSaveDocument(documentTitle, documentContent);
    toast.success('Document saved successfully');
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <EditorHeader
          documentTitle={documentTitle}
          onTitleChange={onTitleChange}
          onSave={handleSave}
          documentContent={documentContent}
          onImport={onImportComplete}
          onDocumentSelect={onDocumentSelect}
        />
        <div className="flex gap-2">
          <Button 
            onClick={handleSave}
            className="flex items-center"
            variant="outline"
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {(revisions && revisions.length > 0) && (
            <RevisionHistory
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
              documentTitle={documentTitle}
              documentId={currentDocument?.id || 'temp-doc-id'}
            />
          )}
          {/* Toggle between editor implementations */}
          <Button
            onClick={() => setUseModelEditor(!useModelEditor)}
            variant="outline"
            size="sm"
          >
            {useModelEditor ? 'Use Classic Editor' : 'Use Model Editor'}
          </Button>
        </div>
      </div>

      {useModelEditor ? (
        <ModelBasedEditor
          initialContent={documentContent}
          onChange={onDocumentContentChange}
          documentTitle={documentTitle}
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
      ) : (
        <TextEditor 
          initialContent={documentContent}
          onChange={onDocumentContentChange}
          editorRef={editorRef}
          documentTitle={documentTitle}
          onSave={handleSave}
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
      )}
    </div>
  );
};

export default DocumentWorkspace;
