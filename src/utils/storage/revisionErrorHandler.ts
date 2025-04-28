
import { v4 as uuidv4 } from 'uuid';
import { Revision } from '../commentTypes';
import { getCurrentUser } from '../collaborationService';

export function handleRevisionSaveError(documentId: string, title: string): Revision {
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
  
  try {
    // Attempt to save this minimal revision
    localStorage.setItem(`revisions_${documentId}`, JSON.stringify([errorRevision]));
  } catch (err) {
    console.error('Failed to save even error revision', err);
  }
  
  return errorRevision;
}
