
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock } from 'lucide-react';
import { DocumentLock as LockType } from '@/utils/collaborationTypes';
import { 
  subscribeToDocumentEvents,
  acquireLock,
  releaseLock,
  getCurrentUser
} from '@/utils/collaborationService';
import { toast } from 'sonner';

interface DocumentLockStatusProps {
  documentId: string;
  onLockChange?: (isLocked: boolean, lockedBy?: string) => void;
}

const DocumentLockStatus: React.FC<DocumentLockStatusProps> = ({ 
  documentId,
  onLockChange 
}) => {
  const [lock, setLock] = useState<LockType | null>(null);
  const currentUser = getCurrentUser();
  const isLockedByMe = lock?.lockedBy.id === currentUser.id;
  const isLocked = !!lock && new Date(lock.expiresAt) > new Date();

  useEffect(() => {
    // Subscribe to lock updates
    const unsubscribe = subscribeToDocumentEvents(
      documentId,
      'locks',
      (data) => {
        if (data.type === 'lock-acquired') {
          setLock(data.lock);
          if (onLockChange) {
            onLockChange(true, data.lock.lockedBy.name);
          }
        } else if (data.type === 'lock-released') {
          setLock(null);
          if (onLockChange) {
            onLockChange(false);
          }
        }
      }
    );
    
    return unsubscribe;
  }, [documentId, onLockChange]);

  const handleToggleLock = async () => {
    if (isLocked && isLockedByMe) {
      // Release lock
      const success = releaseLock(documentId);
      if (success) {
        toast.success('Document unlocked');
        setLock(null);
        if (onLockChange) onLockChange(false);
      } else {
        toast.error('Failed to unlock document');
      }
    } else if (!isLocked) {
      // Acquire lock
      const newLock = acquireLock(documentId);
      if (newLock) {
        toast.success('Document locked for editing');
        setLock(newLock);
        if (onLockChange) onLockChange(true, currentUser.name);
      } else {
        toast.error('Document is locked by another user');
      }
    }
  };

  if (isLocked && !isLockedByMe) {
    return (
      <div className="flex items-center text-sm text-amber-600">
        <Lock className="h-4 w-4 mr-1" />
        <span>Locked by {lock?.lockedBy.name || 'another user'}</span>
      </div>
    );
  }

  return (
    <Button
      variant={isLocked ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleToggleLock}
      className="flex items-center"
    >
      {isLocked ? (
        <>
          <Unlock className="h-4 w-4 mr-1" />
          <span>Unlock</span>
        </>
      ) : (
        <>
          <Lock className="h-4 w-4 mr-1" />
          <span>Lock for Editing</span>
        </>
      )}
    </Button>
  );
};

export default DocumentLockStatus;
