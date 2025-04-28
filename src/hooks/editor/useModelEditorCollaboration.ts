
import { useState, useEffect } from 'react';
import { useCollaboration } from '@/hooks/useCollaboration';

export function useModelEditorCollaboration(documentId: string) {
  const [showChangeTracking, setShowChangeTracking] = useState(false);
  
  const {
    isLocked,
    lockedBy,
    trackChanges,
    changes,
    toggleTrackChanges
  } = useCollaboration(documentId);

  return {
    isLocked,
    lockedBy,
    trackChanges,
    changes,
    toggleTrackChanges,
    showChangeTracking,
    setShowChangeTracking
  };
}
