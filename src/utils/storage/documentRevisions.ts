import { v4 as uuidv4 } from 'uuid';
import { Revision } from '../commentTypes';
import { getCurrentUser } from '../collaborationService';
import { MAX_REVISION_CONTENT_SIZE, MAX_REVISIONS_PER_DOCUMENT } from './documentStorageUtils';

export function getDocumentRevisions(documentId: string): Revision[] {
  try {
    const storedRevisions = localStorage.getItem(`revisions_${documentId}`);
    return storedRevisions ? JSON.parse(storedRevisions) : [];
  } catch (error) {
    console.error('Error getting document revisions:', error);
    return [];
  }
}

export function saveRevision(documentId: string, content: string, title: string, isAuto: boolean = false, label?: string, description?: string): Revision {
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
    try {
      localStorage.setItem(`revisions_${documentId}`, JSON.stringify(limitedRevisions));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded for revisions, performing cleanup');
        
        // First try: Keep only 5 revisions
        if (revisions.length > 5) {
          const reducedRevisions = revisions
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
          
          try {
            localStorage.setItem(`revisions_${documentId}`, JSON.stringify(reducedRevisions));
            return newRevision;
          } catch (err) {
            // Continue to more aggressive cleanup
            console.warn('Still exceeding quota with 5 revisions, reducing content size');
          }
        }
        
        // Second try: Keep only the newest revision but truncate its content further
        try {
          const singleRevision = {
            ...newRevision,
            content: newRevision.content.substring(0, 5000) + 
                    '<p><em>Content heavily truncated due to storage limitations</em></p>'
          };
          localStorage.setItem(`revisions_${documentId}`, JSON.stringify([singleRevision]));
          return singleRevision;
        } catch (err) {
          // Last resort: Clear all revisions and save just a stub
          console.error('Failed to save even with content truncation, clearing all revisions');
          const stubRevision = {
            ...newRevision,
            content: '<p>Unable to save content due to browser storage limitations.</p>'
          };
          localStorage.setItem(`revisions_${documentId}`, JSON.stringify([stubRevision]));
          return stubRevision;
        }
      } else {
        throw error; // Re-throw non-quota errors
      }
    }
    
    return newRevision;
  } catch (error) {
    console.error('Error saving revision:', error);
    // Return a minimal revision object to prevent further errors
    const errorRevision: Revision = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      content: '<p>Error saving revision. Storage limit may be exceeded.</p>',
      title: title || 'Error Revision',
      authorId: getCurrentUser().id,
      authorName: getCurrentUser().name,
      isAuto: false,
      label: 'Error Saving'
    };
    return errorRevision;
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
