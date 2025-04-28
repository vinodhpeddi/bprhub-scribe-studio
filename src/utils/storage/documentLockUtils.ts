
import { UserDocument } from '../documentTypes';
import { acquireLock, releaseLock } from '../collaborationService';

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

// Export releaseLock to fix the missing export
export { releaseLock };
