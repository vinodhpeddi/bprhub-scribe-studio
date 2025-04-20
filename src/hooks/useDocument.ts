
import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  const contentRef = useRef(documentContent);
  const titleRef = useRef(documentTitle);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const existingDoc = location.state?.document;
    if (existingDoc) {
      handleDocumentSelect(existingDoc);
    }
  }, [location.state]);

  const handleDocumentSelect = useCallback((document: UserDocument) => {
    setCurrentDocument(document);
    setDocumentTitle(document.title);
    titleRef.current = document.title;
    setDocumentContent(document.content);
    contentRef.current = document.content;
  }, []);

  const setDocumentTitleDebounced = useCallback((title: string) => {
    titleRef.current = title;
    setDocumentTitle(title);
  }, []);

  const setDocumentContentDebounced = useCallback((content: string) => {
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
    }
    
    contentRef.current = content;
    
    contentUpdateTimeoutRef.current = setTimeout(() => {
      setDocumentContent(content);
    }, 300);
  }, []);

  const handleSaveDocument = useCallback(() => {
    if (!currentDocument) {
      toast.error('No active document to save');
      return;
    }
    
    const updatedDoc: UserDocument = {
      ...currentDocument,
      title: titleRef.current,
      content: contentRef.current,
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
  }, [currentDocument]);

  const handleFinalizeDocument = useCallback(() => {
    if (!currentDocument) {
      toast.error('No active document to finalize');
      return;
    }
    
    if (!currentDocument.isDraft) {
      toast.info('Document is already finalized');
      return;
    }
    
    try {
      const finalizedDoc = finalizeDraft(currentDocument);
      saveDocument(finalizedDoc);
      setCurrentDocument(finalizedDoc);
      toast.success('Document finalized');
    } catch (error) {
      console.error('Error finalizing document:', error);
      toast.error('Failed to finalize document');
    }
  }, [currentDocument]);

  return {
    documentTitle,
    setDocumentTitle: setDocumentTitleDebounced,
    documentContent,
    setDocumentContent: setDocumentContentDebounced,
    currentDocument,
    handleSaveDocument,
    handleFinalizeDocument,
    handleDocumentSelect
  };
}
