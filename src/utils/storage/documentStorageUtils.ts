
import { UserDocument } from '../documentTypes';

// Storage limits
export const MAX_DOCUMENT_COUNT = 10;
export const MAX_REVISIONS_PER_DOCUMENT = 10;
export const MAX_REVISION_CONTENT_SIZE = 100000;

export function getStringByteSize(str: string): number {
  return str.length * 2;
}

export function cleanupStorage() {
  try {
    const docs = getAllDocuments();
    docs.forEach(doc => {
      const revisions = localStorage.getItem(`revisions_${doc.id}`);
      if (revisions) {
        const parsedRevisions = JSON.parse(revisions);
        const manualRevisions = parsedRevisions.filter((rev: any) => !rev.isAuto);
        if (manualRevisions.length !== parsedRevisions.length) {
          localStorage.setItem(`revisions_${doc.id}`, JSON.stringify(manualRevisions));
        }
      }
    });
  } catch (error) {
    console.error('Error performing storage cleanup:', error);
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
