
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
  getDocumentById,
  saveRevision,
  getDocumentRevisions,
  getRevisionById,
  updateRevisionLabel
} from '@/utils/documentStorage';
import { templates } from '@/utils/documentTypes';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { Revision } from '@/utils/commentTypes';

export function useDocument() {
  const location = useLocation();
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [currentDocument, setCurrentDocument] = useState<UserDocument | null>(null);
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [currentRevision, setCurrentRevision] = useState<Revision | null>(null);
  const [isViewingRevision, setIsViewingRevision] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number | null>(null);
  
  // Refs to store current values without triggering re-renders
  const contentRef = useRef(documentContent);
  const titleRef = useRef(documentTitle);
  // Timeout ref for debouncing updates
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref for auto-save interval
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const existingDoc = location.state?.document;
    if (existingDoc) {
      handleDocumentSelect(existingDoc);
    } else {
      // If no document is provided in location state, create a new document
      initializeNewDocument();
    }
  }, [location.state]);

  // Load revisions when document changes
  useEffect(() => {
    if (currentDocument?.id) {
      const docRevisions = getDocumentRevisions(currentDocument.id);
      setRevisions(docRevisions);
    }
  }, [currentDocument?.id]);

  // Set up auto-save if enabled
  useEffect(() => {
    if (autoSaveInterval && currentDocument?.id && !isViewingRevision) {
      // Clear any existing interval
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
      
      // Set up new interval
      autoSaveIntervalRef.current = setInterval(() => {
        const docContent = contentRef.current;
        const docTitle = titleRef.current;
        
        // Create auto-save revision
        if (currentDocument) {
          saveRevision(
            currentDocument.id,
            docContent,
            docTitle,
            true, // isAuto
            `Auto-save at ${new Date().toLocaleTimeString()}`
          );
          toast.info("Document auto-saved");
        }
      }, autoSaveInterval * 60 * 1000); // Convert minutes to milliseconds
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveInterval, currentDocument?.id, isViewingRevision]);

  const initializeNewDocument = useCallback(() => {
    // Get the default template (blank document)
    const defaultTemplate = templates.find(t => t.id === 'blank') || templates[0];
    
    // Create a new draft document with basic HTML structure
    const initialContent = `
      <div class="document-content">
        <h1>Untitled Document</h1>
        <p><br></p>
      </div>
    `;
    
    const newDoc = {
      ...createNewDraft(defaultTemplate, 'Untitled Document'),
      content: initialContent
    };
    
    // Set up the document in our state
    setCurrentDocument(newDoc);
    setDocumentTitle(newDoc.title);
    titleRef.current = newDoc.title;
    setDocumentContent(newDoc.content);
    contentRef.current = newDoc.content;
    
    // Save the new document to storage right away
    saveDocument(newDoc);
    
    // Create initial revision
    saveRevision(
      newDoc.id,
      newDoc.content,
      newDoc.title,
      false,
      'Initial version'
    );
    
    return newDoc;
  }, []);

  const handleDocumentSelect = useCallback((document: UserDocument) => {
    setCurrentDocument(document);
    setDocumentTitle(document.title);
    titleRef.current = document.title;
    setDocumentContent(document.content);
    contentRef.current = document.content;
    setIsViewingRevision(false);
    setCurrentRevision(null);
    
    // Load revisions for this document
    const docRevisions = getDocumentRevisions(document.id);
    setRevisions(docRevisions);
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
      return newDoc; // Return the new document
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
      
      // Create a manual save revision
      saveRevision(
        updatedDoc.id,
        updatedDoc.content,
        updatedDoc.title,
        false,
        `Manual save at ${new Date().toLocaleTimeString()}`
      );
      
      // Update revisions list
      const docRevisions = getDocumentRevisions(updatedDoc.id);
      setRevisions(docRevisions);
      
      return updatedDoc; // Return the updated document
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
      return currentDocument; // Return the current document in case of error
    }
  }, [currentDocument, initializeNewDocument]);

  const handleFinalizeDocument = useCallback(() => {
    if (!currentDocument) {
      const newDoc = initializeNewDocument();
      toast.info('Created a new document before finalizing');
      
      // We need to wait for the next tick to ensure the document is saved
      setTimeout(() => {
        if (newDoc) {
          const finalizedDoc = finalizeDraft(newDoc);
          saveDocument(finalizedDoc);
          setCurrentDocument(finalizedDoc);
          
          // Create a finalization revision
          saveRevision(
            finalizedDoc.id,
            finalizedDoc.content,
            finalizedDoc.title,
            false,
            'Document finalized'
          );
          
          toast.success('Document finalized');
        }
      }, 100);
      
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
      
      // Create a finalization revision
      saveRevision(
        finalizedDoc.id,
        finalizedDoc.content,
        finalizedDoc.title,
        false,
        'Document finalized'
      );
      
      toast.success('Document finalized');
    } catch (error) {
      console.error('Error finalizing document:', error);
      toast.error('Failed to finalize document');
    }
  }, [currentDocument, initializeNewDocument]);
  
  // New revision functions
  const saveDocumentRevision = useCallback((label?: string, description?: string) => {
    if (!currentDocument) {
      toast.error('No document to create revision for');
      return;
    }
    
    try {
      const revision = saveRevision(
        currentDocument.id,
        contentRef.current,
        titleRef.current,
        false,
        label || `Manual revision at ${new Date().toLocaleTimeString()}`,
        description
      );
      
      // Update revisions list
      const docRevisions = getDocumentRevisions(currentDocument.id);
      setRevisions(docRevisions);
      
      toast.success('Revision saved successfully');
      return revision;
    } catch (error) {
      console.error('Error saving revision:', error);
      toast.error('Failed to save revision');
      return null;
    }
  }, [currentDocument]);
  
  const viewRevision = useCallback((revisionId: string) => {
    if (!currentDocument) {
      toast.error('No active document');
      return;
    }
    
    const revision = getRevisionById(currentDocument.id, revisionId);
    if (!revision) {
      toast.error('Revision not found');
      return;
    }
    
    // Store the revision and set viewing mode
    setCurrentRevision(revision);
    setIsViewingRevision(true);
    
    // Update displayed content to revision content
    setDocumentTitle(revision.title);
    setDocumentContent(revision.content);
    
    toast.info(`Viewing revision from ${new Date(revision.timestamp).toLocaleString()}`);
  }, [currentDocument]);
  
  const restoreRevision = useCallback((revisionId: string) => {
    if (!currentDocument || isViewingRevision === false) {
      toast.error('Cannot restore while not viewing a revision');
      return;
    }
    
    const revision = getRevisionById(currentDocument.id, revisionId);
    if (!revision) {
      toast.error('Revision not found');
      return;
    }
    
    // Update the current content and title
    titleRef.current = revision.title;
    setDocumentTitle(revision.title);
    contentRef.current = revision.content;
    setDocumentContent(revision.content);
    
    // Exit revision viewing mode
    setIsViewingRevision(false);
    setCurrentRevision(null);
    
    // Save the document with the restored content
    const updatedDoc: UserDocument = {
      ...currentDocument,
      title: revision.title,
      content: revision.content,
      lastModified: new Date().toISOString()
    };
    
    saveDocument(updatedDoc);
    setCurrentDocument(updatedDoc);
    
    // Create a new revision marking the restore
    saveRevision(
      currentDocument.id,
      revision.content,
      revision.title,
      false,
      `Restored from revision ${new Date(revision.timestamp).toLocaleString()}`
    );
    
    toast.success('Revision restored successfully');
  }, [currentDocument, isViewingRevision]);
  
  const exitRevisionView = useCallback(() => {
    if (!isViewingRevision || !currentDocument) return;
    
    // Revert to current document content
    setDocumentTitle(currentDocument.title);
    titleRef.current = currentDocument.title;
    setDocumentContent(currentDocument.content);
    contentRef.current = currentDocument.content;
    
    // Exit revision view mode
    setIsViewingRevision(false);
    setCurrentRevision(null);
    
    toast.info('Exited revision view');
  }, [currentDocument, isViewingRevision]);
  
  const updateRevision = useCallback((revisionId: string, label: string, description?: string) => {
    if (!currentDocument) return;
    
    try {
      updateRevisionLabel(currentDocument.id, revisionId, label, description);
      
      // Update revisions list
      const docRevisions = getDocumentRevisions(currentDocument.id);
      setRevisions(docRevisions);
      
      toast.success('Revision updated successfully');
    } catch (error) {
      console.error('Error updating revision:', error);
      toast.error('Failed to update revision');
    }
  }, [currentDocument]);
  
  const setAutoSaveConfig = useCallback((intervalMinutes: number | null) => {
    setAutoSaveInterval(intervalMinutes);
    
    if (intervalMinutes === null && autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
      autoSaveIntervalRef.current = null;
    }
    
    toast.success(intervalMinutes ? `Auto-save set to every ${intervalMinutes} minute${intervalMinutes !== 1 ? 's' : ''}` : 'Auto-save disabled');
  }, []);

  return {
    documentTitle,
    setDocumentTitle: setDocumentTitleDebounced,
    documentContent,
    setDocumentContent: setDocumentContentDebounced,
    currentDocument,
    handleSaveDocument,
    handleFinalizeDocument,
    handleDocumentSelect,
    initializeNewDocument,
    // Revision functionality
    revisions,
    currentRevision,
    isViewingRevision,
    saveDocumentRevision,
    viewRevision,
    restoreRevision,
    exitRevisionView,
    updateRevision,
    // Auto-save configuration
    autoSaveInterval,
    setAutoSaveConfig
  };
}
