
import { UserDocument } from './documentTypes';
import { acquireLock, releaseLock, getCurrentUser } from './collaborationService';
import { Revision } from './commentTypes';
import { v4 as uuidv4 } from 'uuid';

export function saveDocument(document: UserDocument): void {
  try {
    const storedDocs = localStorage.getItem('userDocuments');
    const docs: UserDocument[] = storedDocs ? JSON.parse(storedDocs) : [];
    
    const existingIndex = docs.findIndex(doc => doc.id === document.id);
    
    if (existingIndex >= 0) {
      docs[existingIndex] = document;
    } else {
      docs.push(document);
    }
    
    localStorage.setItem('userDocuments', JSON.stringify(docs));
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
  return {
    ...document,
    isDraft: false,
    lastModified: new Date().toISOString()
  };
}

// New methods for collaboration
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

// New revision history functionality
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
    
    // Create new revision
    const newRevision: Revision = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      content,
      title,
      authorId: user.id,
      authorName: user.name,
      isAuto,
      label,
      description
    };
    
    // Add to revisions list
    revisions.push(newRevision);
    
    // Save to local storage
    localStorage.setItem(`revisions_${documentId}`, JSON.stringify(revisions));
    
    return newRevision;
  } catch (error) {
    console.error('Error saving revision:', error);
    throw error;
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

