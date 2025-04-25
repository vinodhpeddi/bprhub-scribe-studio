
import { useState, useEffect, useCallback } from 'react';
import { 
  acquireLock, 
  releaseLock, 
  subscribeToDocumentEvents,
  joinDocument,
  leaveDocument,
  getActiveUsers,
  addChange,
  getChanges,
  updateChangeStatus
} from '@/utils/collaborationService';
import { DocumentChange, User } from '@/utils/collaborationTypes';
import { toast } from 'sonner';

export function useCollaboration(documentId: string) {
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [changes, setChanges] = useState<DocumentChange[]>([]);
  const [trackChanges, setTrackChanges] = useState(false);

  // Lock/unlock functionality
  const lockDocument = useCallback(() => {
    const lock = acquireLock(documentId);
    if (lock) {
      setIsLocked(true);
      setLockedBy(lock.lockedBy.name);
      return true;
    }
    return false;
  }, [documentId]);

  const unlockDocument = useCallback(() => {
    const success = releaseLock(documentId);
    if (success) {
      setIsLocked(false);
      setLockedBy(null);
    }
    return success;
  }, [documentId]);

  // Change tracking
  const toggleTrackChanges = useCallback(() => {
    setTrackChanges(prev => !prev);
    toast.info(trackChanges ? 'Change tracking disabled' : 'Change tracking enabled');
  }, [trackChanges]);

  const addDocumentChange = useCallback((
    type: 'addition' | 'deletion' | 'modification' | 'suggestion',
    content: string,
    originalContent?: string,
    element?: string,
    position?: { start: number; end: number }
  ) => {
    return addChange(documentId, {
      type,
      content,
      originalContent,
      element,
      position
    });
  }, [documentId]);

  const acceptChange = useCallback((changeId: string) => {
    return updateChangeStatus(documentId, changeId, 'accepted');
  }, [documentId]);

  const rejectChange = useCallback((changeId: string) => {
    return updateChangeStatus(documentId, changeId, 'rejected');
  }, [documentId]);

  // Initialize and cleanup
  useEffect(() => {
    joinDocument(documentId);
    setActiveUsers(getActiveUsers(documentId));
    setChanges(getChanges(documentId));
    
    // Subscribe to lock updates
    const unsubscribeLocks = subscribeToDocumentEvents(
      documentId,
      'locks',
      (data) => {
        if (data.type === 'lock-acquired') {
          setIsLocked(true);
          setLockedBy(data.lock.lockedBy.name);
        } else if (data.type === 'lock-released') {
          setIsLocked(false);
          setLockedBy(null);
        }
      }
    );
    
    // Subscribe to presence updates
    const unsubscribePresence = subscribeToDocumentEvents(
      documentId,
      'presence',
      (data) => {
        if (data.type === 'user-joined') {
          setActiveUsers(prev => [...prev.filter(u => u.id !== data.user.id), data.user]);
        } else if (data.type === 'user-left') {
          setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
        }
      }
    );
    
    // Subscribe to change updates
    const unsubscribeChanges = subscribeToDocumentEvents(
      documentId,
      'changes',
      (data) => {
        if (data.type === 'change-added') {
          setChanges(prev => [...prev, data.change]);
        } else if (data.type === 'change-updated') {
          setChanges(prev => 
            prev.map(change => 
              change.id === data.change.id ? data.change : change
            )
          );
        }
      }
    );
    
    return () => {
      unsubscribeLocks();
      unsubscribePresence();
      unsubscribeChanges();
      leaveDocument(documentId);
      // Make sure to release any locks when leaving
      releaseLock(documentId);
    };
  }, [documentId]);

  return {
    isLocked,
    lockedBy,
    activeUsers,
    changes,
    trackChanges,
    lockDocument,
    unlockDocument,
    toggleTrackChanges,
    addDocumentChange,
    acceptChange,
    rejectChange
  };
}
