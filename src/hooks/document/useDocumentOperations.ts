
import { useCallback } from 'react';
import { UserDocument } from '@/utils/documentTypes';
import { templates } from '@/utils/documentTypes';
import { 
  createNewDraft, 
  saveDocument, 
  finalizeDraft,
  saveRevision,
  getDocumentRevisions 
} from '@/utils/documentStorage';
import { toast } from 'sonner';

export function useDocumentOperations(state: ReturnType<typeof import('./useDocumentState').useDocumentState>) {
  const initializeNewDocument = useCallback(() => {
    const defaultTemplate = templates.find(t => t.id === 'blank') || templates[0];
    
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
    
    state.setCurrentDocument(newDoc);
    state.setDocumentTitle(newDoc.title);
    state.titleRef.current = newDoc.title;
    state.setDocumentContent(newDoc.content);
    state.contentRef.current = newDoc.content;
    
    saveDocument(newDoc);
    
    saveRevision(
      newDoc.id,
      newDoc.content,
      newDoc.title,
      false,
      'Initial version'
    );
    
    return newDoc;
  }, [state]);

  const handleDocumentSelect = useCallback((document: UserDocument) => {
    state.setCurrentDocument(document);
    state.setDocumentTitle(document.title);
    state.titleRef.current = document.title;
    state.setDocumentContent(document.content);
    state.contentRef.current = document.content;
    state.setIsViewingRevision(false);
    state.setCurrentRevision(null);
    
    const docRevisions = getDocumentRevisions(document.id);
    state.setRevisions(docRevisions);
  }, [state]);

  return {
    initializeNewDocument,
    handleDocumentSelect
  };
}
