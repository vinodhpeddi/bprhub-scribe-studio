
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
  
  // Use refs to track the previous values and detect actual changes
  const previousTitleRef = useRef(documentTitle);
  const previousContentRef = useRef(documentContent);
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
    previousTitleRef.current = document.title;
    setDocumentContent(document.content);
    previousContentRef.current = document.content;
  }, []);

  // Debounced title change handler
  const setDocumentTitleDebounced = useCallback((title: string) => {
    if (title !== previousTitleRef.current) {
      previousTitleRef.current = title;
      setDocumentTitle(title);
    }
  }, []);

  // Debounced content change handler
  const setDocumentContentDebounced = useCallback((content: string) => {
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
    }
    
    contentUpdateTimeoutRef.current = setTimeout(() => {
      if (content !== previousContentRef.current) {
        previousContentRef.current = content;
        setDocumentContent(content);
      }
    }, 300);
  }, []);

  const handleSaveDocument = useCallback(() => {
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
  }, [currentDocument, documentTitle, documentContent]);

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
