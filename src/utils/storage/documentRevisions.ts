
import { v4 as uuidv4 } from 'uuid';
import { Revision } from '../commentTypes';
import { getCurrentUser } from '../collaborationService';
import { MAX_REVISION_CONTENT_SIZE, MAX_REVISIONS_PER_DOCUMENT } from './documentStorageUtils';
import { saveRevisionContent } from './revisionStorageManager';
import { handleRevisionSaveError } from './revisionErrorHandler';

export function getDocumentRevisions(documentId: string): Revision[] {
  try {
    const storedRevisions = localStorage.getItem(`revisions_${documentId}`);
    return storedRevisions ? JSON.parse(storedRevisions) : [];
  } catch (error) {
    console.error('Error getting document revisions:', error);
    return [];
  }
}

export function saveRevision(
  documentId: string, 
  content: string, 
  title: string, 
  isAuto: boolean = false, 
  label?: string, 
  description?: string
): Revision {
  try {
    const user = getCurrentUser();
    const revisions = getDocumentRevisions(documentId);
    
    // Truncate content if it's too large to avoid quota issues
    let truncatedContent = content;
    if (content.length > MAX_REVISION_CONTENT_SIZE) {
      console.warn(`Revision content exceeds max size (${content.length} > ${MAX_REVISION_CONTENT_SIZE}), truncating`);
      truncatedContent = content.substring(0, MAX_REVISION_CONTENT_SIZE) + 
        '<p><em>Content truncated due to storage limitations</em></p>';
    }
    
    // Create new revision
    const newRevision: Revision = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      content: truncatedContent,
      title,
      authorId: user.id,
      authorName: user.name,
      isAuto,
      label,
      description
    };
    
    // Limit the number of revisions to prevent storage overflow
    revisions.push(newRevision);
    
    const limitedRevisions = revisions.length > MAX_REVISIONS_PER_DOCUMENT ? 
      revisions.slice(revisions.length - MAX_REVISIONS_PER_DOCUMENT) : 
      revisions;
    
    // Try to save to local storage
    return saveRevisionContent(documentId, limitedRevisions, newRevision);
  } catch (error) {
    console.error('Error saving revision:', error);
    return handleRevisionSaveError(documentId, title);
  }
}

export function updateRevisionLabel(documentId: string, revisionId: string, label: string, description?: string): void {
  try {
    const revisions = getDocumentRevisions(documentId);
    const index = revisions.findIndex(rev => rev.id === revisionId);
    
    if (index >= 0) {
      revisions[index] = {
        ...revisions[index],
        label,
        description: description || revisions[index].description
      };
      
      localStorage.setItem(`revisions_${documentId}`, JSON.stringify(revisions));
    }
  } catch (error) {
    console.error('Error updating revision label:', error);
    throw error;
  }
}

export function deleteDocumentRevisions(documentId: string): void {
  try {
    localStorage.removeItem(`revisions_${documentId}`);
  } catch (error) {
    console.error('Error deleting document revisions:', error);
    throw error;
  }
}

export function getRevisionById(documentId: string, revisionId: string): Revision | null {
  try {
    const revisions = getDocumentRevisions(documentId);
    return revisions.find(rev => rev.id === revisionId) || null;
  } catch (error) {
    console.error('Error getting revision:', error);
    return null;
  }
}
