
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  DocumentTemplate, 
  UserDocument,
} from '@/utils/documentTypes';
import { 
  createNewDraft,
  saveDocument,
  finalizeDraft,
  getAllDocuments,
  getDocumentById 
} from '@/utils/documentStorage';
import { templates } from '@/utils/documentTypes';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function useDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [currentDocument, setCurrentDocument] = useState<UserDocument | null>(null);
  
  // Refs to store current values without triggering re-renders
  const contentRef = useRef(documentContent);
  const titleRef = useRef(documentTitle);
  // Timeout ref for debouncing updates
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const existingDoc = location.state?.document;
    if (existingDoc) {
      handleDocumentSelect(existingDoc);
    } else {
      // If no document is provided in location state, create a new document
      initializeNewDocument();
    }
  }, [location.state]);

  const initializeNewDocument = useCallback(() => {
    // Get the default template (blank document)
    const defaultTemplate = templates.find(t => t.id === 'blank') || templates[0];
    
    // Create a new draft document
    const newDoc = createNewDraft(defaultTemplate, 'Untitled Document');
    
    // Set up the document in our state
    setCurrentDocument(newDoc);
    setDocumentTitle(newDoc.title);
    titleRef.current = newDoc.title;
    setDocumentContent(newDoc.content);
    contentRef.current = newDoc.content;
    
    // Save the new document to storage right away
    saveDocument(newDoc);
    
    return newDoc;
  }, []);

  const handleDocumentSelect = useCallback((document: UserDocument) => {
    setCurrentDocument(document);
    setDocumentTitle(document.title);
    titleRef.current = document.title;
    setDocumentContent(document.content);
    contentRef.current = document.content;
  }, []);

  // Debounced title setter that updates the ref immediately
  const setDocumentTitleDebounced = useCallback((title: string) => {
    titleRef.current = title;
    setDocumentTitle(title);
  }, []);

  // Debounced content setter that updates the ref immediately
  const setDocumentContentDebounced = useCallback((content: string) => {
    // Store current value in ref immediately
    contentRef.current = content;
    
    // Debounce the state update to reduce re-renders
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
    }
    
    contentUpdateTimeoutRef.current = setTimeout(() => {
      setDocumentContent(content);
    }, 300);
  }, []);

  const handleSaveDocument = useCallback(() => {
    // If we don't have a document, try to create one first
    if (!currentDocument) {
      const newDoc = initializeNewDocument();
      toast.success('New document created and saved');
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
  }, [currentDocument, initializeNewDocument]);

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
    handleDocumentSelect,
    initializeNewDocument
  };
}
