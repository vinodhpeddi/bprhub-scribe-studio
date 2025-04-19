
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DocumentTemplate, 
  UserDocument,
  createNewDraft,
  saveDocument,
  finalizeDraft
} from '@/utils/editorUtils';
import { toast } from 'sonner';

export function useDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [currentDocument, setCurrentDocument] = useState<UserDocument | null>(null);

  useEffect(() => {
    const existingDoc = location.state?.document;
    if (existingDoc) {
      handleDocumentSelect(existingDoc);
    }
  }, [location.state]);

  const handleDocumentSelect = (document: UserDocument) => {
    setCurrentDocument(document);
    setDocumentTitle(document.title);
    setDocumentContent(document.content);
  };

  const handleSaveDocument = () => {
    if (!currentDocument) {
      toast.error('No active document to save');
      return;
    }
    
    const updatedDoc: UserDocument = {
      ...currentDocument,
      title: documentTitle,
      content: documentContent,
      lastModified: new Date().toISOString()
    };
    
    try {
      saveDocument(updatedDoc);
      setCurrentDocument(updatedDoc);
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const handleFinalizeDocument = () => {
    if (!currentDocument) {
      toast.error('No active document to finalize');
      return;
    }
    
    if (!currentDocument.isDraft) {
      toast.info('Document is already finalized');
      return;
    }
    
    const finalizedDoc = finalizeDraft(currentDocument);
    
    try {
      saveDocument(finalizedDoc);
      setCurrentDocument(finalizedDoc);
      toast.success('Document finalized');
    } catch (error) {
      console.error('Error finalizing document:', error);
      toast.error('Failed to finalize document');
    }
  };

  return {
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    currentDocument,
    handleSaveDocument,
    handleFinalizeDocument,
    handleDocumentSelect
  };
}
