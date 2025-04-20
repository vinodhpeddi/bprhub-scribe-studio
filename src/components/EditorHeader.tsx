
import React from 'react';
import DocumentTitleInput from './editor/DocumentTitleInput';
import EditorActionButtons from './editor/EditorActionButtons';
import { UserDocument } from '@/utils/editorUtils';

interface EditorHeaderProps {
  documentTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  documentContent: string;
  onImport: (content: string) => void;
  onDocumentSelect: (document: UserDocument) => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
  documentTitle,
  onTitleChange,
  onSave,
  documentContent,
  onImport,
  onDocumentSelect,
}) => {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <DocumentTitleInput 
          title={documentTitle} 
          onTitleChange={onTitleChange} 
        />
        
        <EditorActionButtons
          onSave={onSave}
          documentContent={documentContent}
          documentTitle={documentTitle}
          onImport={onImport}
          onDocumentSelect={onDocumentSelect}
        />
      </div>
    </div>
  );
};

export default React.memo(EditorHeader);
