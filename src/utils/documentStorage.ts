
import { UserDocument } from './documentTypes';
import { getCurrentUser } from './collaborationService';
import { v4 as uuidv4 } from 'uuid';
import { 
  MAX_DOCUMENT_COUNT,
  cleanupStorage,
  getAllDocuments,
  getStringByteSize
} from './storage/documentStorageUtils';

import {
  getDocumentRevisions,
  saveRevision,
  updateRevisionLabel,
  deleteDocumentRevisions,
  getRevisionById
} from './storage/documentRevisions';

import {
  lockDocument,
  unlockDocument,
  isDocumentLocked,
  releaseLock
} from './storage/documentLockUtils';

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

export { 
  getAllDocuments,
  cleanupStorage as performStorageCleanup,
  MAX_DOCUMENT_COUNT
};

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

// Re-export from documentLockUtils
export { lockDocument, unlockDocument, isDocumentLocked, releaseLock };

// Re-export from documentRevisions
export {
  getDocumentRevisions,
  saveRevision,
  updateRevisionLabel,
  deleteDocumentRevisions,
  getRevisionById
};

// Export predefined constants
export { MAX_REVISIONS_PER_DOCUMENT } from './storage/documentStorageUtils';
