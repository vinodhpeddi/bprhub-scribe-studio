
export interface User {
  id: string;
  name: string;
  avatar?: string;
  color?: string;
}

export interface DocumentLock {
  documentId: string;
  lockedBy: User;
  lockedAt: string;
  expiresAt: string;
}

export interface DocumentChange {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  type: 'addition' | 'deletion' | 'modification' | 'suggestion';
  content: string;
  originalContent?: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected';
  element?: string; // The type of element being changed (paragraph, table, etc.)
  position?: { start: number; end: number }; // Position in the document
}

export interface DocumentComment {
  id: string;
  documentId: string;
  changeId?: string; // Related change if commenting on a change
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  parentId?: string; // For threaded comments
}

export type CollaborationPermission = 'view' | 'comment' | 'suggest' | 'edit';

export interface CollaborationUser {
  userId: string;
  userName: string;
  permission: CollaborationPermission;
}

