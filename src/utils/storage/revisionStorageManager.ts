import { Revision } from '../commentTypes';

export function saveRevisionContent(documentId: string, revisions: Revision[], newRevision: Revision): Revision {
  try {
    localStorage.setItem(`revisions_${documentId}`, JSON.stringify(revisions));
    return newRevision;
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
}
