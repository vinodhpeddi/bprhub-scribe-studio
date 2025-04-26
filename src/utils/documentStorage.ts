import { UserDocument } from './documentTypes';
import { acquireLock, releaseLock, getCurrentUser } from './collaborationService';
import { Revision } from './commentTypes';
import { v4 as uuidv4 } from 'uuid';

// Maximum document count to keep in local storage
const MAX_DOCUMENT_COUNT = 10;
// Maximum number of revisions per document
const MAX_REVISIONS_PER_DOCUMENT = 10;
// Maximum content size for a single revision in characters
const MAX_REVISION_CONTENT_SIZE = 100000;

export function saveDocument(document: UserDocument): void {
  try {
    const storedDocs = localStorage.getItem('userDocuments');
    let docs: UserDocument[] = storedDocs ? JSON.parse(storedDocs) : [];
    
    const existingIndex = docs.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      docs[existingIndex] = document;
    } else {
      // If we're at the storage limit, remove the oldest document
      if (docs.length >= MAX_DOCUMENT_COUNT) {
        // Sort by lastModified (oldest first)
        docs.sort((a, b) => 
          new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
        );
        
        // Remove the oldest document and its revisions
        const oldestDoc = docs.shift();
        if (oldestDoc) {
          deleteDocumentRevisions(oldestDoc.id);
        }
      }
      
      docs.push(document);
    }
    
    try {
      localStorage.setItem('userDocuments', JSON.stringify(docs));
    } catch (error) {
      // If we still hit quota errors, perform aggressive cleanup
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, performing aggressive cleanup');
        
        // Remove half of the oldest documents
        if (docs.length > 1) {
          docs.sort((a, b) => 
            new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
          );
          
          const removeCount = Math.max(1, Math.floor(docs.length / 2));
          const removedDocs = docs.splice(0, removeCount);
          
          // Clean up revisions for removed docs
          removedDocs.forEach(doc => {
            deleteDocumentRevisions(doc.id);
          });
          
          // Try to save again with reduced documents
          localStorage.setItem('userDocuments', JSON.stringify(docs));
        } else {
          // If we only have one document and still hit quota, truncate its content
          if (docs.length === 1 && docs[0].content.length > 1000) {
            docs[0].content = docs[0].content.substring(0, 1000) + 
              '<p><em>Content truncated due to storage limitations</em></p>';
            localStorage.setItem('userDocuments', JSON.stringify(docs));
          }
          throw error; // Re-throw if we can't resolve the issue
        }
      } else {
        throw error; // Re-throw non-quota errors
      }
    }
  } catch (error) {
    console.error('Error saving document:', error);
    throw error;
  }
}

export function getAllDocuments(): UserDocument[] {
  try {
    const storedDocs = localStorage.getItem('userDocuments');
    return storedDocs ? JSON.parse(storedDocs) : [];
  } catch (error) {
    console.error('Error getting documents:', error);
    return [];
  }
}

export function getDocumentById(id: string): UserDocument | null {
  try {
    const docs = getAllDocuments();
    return docs.find(doc => doc.id === id) || null;
  } catch (error) {
    console.error('Error getting document:', error);
    return null;
  }
}

export function deleteDocument(id: string): void {
  try {
    const docs = getAllDocuments();
    const filteredDocs = docs.filter(doc => doc.id !== id);
    localStorage.setItem('userDocuments', JSON.stringify(filteredDocs));
    
    // Delete associated revisions
    deleteDocumentRevisions(id);
    
    // Make sure to release any existing lock when deleting
    releaseLock(id);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

export function createNewDraft(template: import('./documentTypes').DocumentTemplate, title: string = 'Untitled Document'): UserDocument {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    title,
    content: template.initialContent,
    template: template.id,
    lastModified: now,
    createdAt: now,
    isDraft: true
  };
}

export function finalizeDraft(document: UserDocument): UserDocument {
  const finalizedDoc = {
    ...document,
    isDraft: false,
    lastModified: new Date().toISOString()
  };
  
  // Save the finalized document
  saveDocument(finalizedDoc);
  return finalizedDoc;
}

export function lockDocument(document: UserDocument): boolean {
  const lock = acquireLock(document.id);
  return lock !== null;
}

export function unlockDocument(document: UserDocument): boolean {
  return releaseLock(document.id);
}

export function isDocumentLocked(documentId: string): boolean {
  try {
    // This would normally check with the server
    // For now we'll simulate by checking local storage
    const lockedDocs = localStorage.getItem('lockedDocuments');
    if (!lockedDocs) return false;
    
    const locks = JSON.parse(lockedDocs);
    const lock = locks[documentId];
    
    if (!lock) return false;
    
    // Check if lock has expired
    return new Date(lock.expiresAt) > new Date();
  } catch (error) {
    console.error('Error checking document lock:', error);
    return false;
  }
}

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
    // Keep only the most recent revisions up to MAX_REVISIONS_PER_DOCUMENT
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

// Utility function to estimate the size of a string in bytes
function getStringByteSize(str: string): number {
  // A rough estimate: in UTF-16, each character is 2 bytes
  return str.length * 2;
}

// Helper function to clean up storage when needed
export function performStorageCleanup(): void {
  try {
    // Clear automatic revisions first
    const docs = getAllDocuments();
    docs.forEach(doc => {
      const revisions = getDocumentRevisions(doc.id);
      const manualRevisions = revisions.filter(rev => !rev.isAuto);
      if (manualRevisions.length !== revisions.length) {
        // Keep only manual revisions
        localStorage.setItem(`revisions_${doc.id}`, JSON.stringify(manualRevisions));
      }
    });
  } catch (error) {
    console.error('Error performing storage cleanup:', error);
  }
}
