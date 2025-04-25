
import { v4 as uuidv4 } from 'uuid';
import { 
  User, 
  DocumentLock, 
  DocumentChange, 
  DocumentComment,
  CollaborationUser
} from './collaborationTypes';

// Mock current user - In a real app, this would come from authentication
const currentUser: User = {
  id: localStorage.getItem('userId') || uuidv4(),
  name: localStorage.getItem('userName') || 'Anonymous User',
  color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
};

// Store the user ID in localStorage for consistency between sessions
if (!localStorage.getItem('userId')) {
  localStorage.setItem('userId', currentUser.id);
  localStorage.setItem('userName', currentUser.name);
}

// These would typically be stored in a database
const documentLocks = new Map<string, DocumentLock>();
const activeUsers = new Map<string, Set<User>>();
const documentChanges = new Map<string, DocumentChange[]>();
const documentComments = new Map<string, DocumentComment[]>();
const documentCollaborators = new Map<string, CollaborationUser[]>();

// Mock WebSocket connection for real-time updates
let mockWebSocketCallbacks: {[key: string]: ((data: any) => void)[]} = {};

// Simulated WebSocket
const mockWebSocket = {
  connect: () => {
    console.log('Connected to collaboration service');
    return Promise.resolve();
  },
  
  subscribe: (channel: string, callback: (data: any) => void) => {
    if (!mockWebSocketCallbacks[channel]) {
      mockWebSocketCallbacks[channel] = [];
    }
    mockWebSocketCallbacks[channel].push(callback);
    return () => {
      mockWebSocketCallbacks[channel] = mockWebSocketCallbacks[channel]
        .filter(cb => cb !== callback);
    };
  },
  
  publish: (channel: string, data: any) => {
    if (mockWebSocketCallbacks[channel]) {
      mockWebSocketCallbacks[channel].forEach(callback => {
        setTimeout(() => callback(data), 0);
      });
    }
  }
};

// Lock management
export const acquireLock = (documentId: string): DocumentLock | null => {
  // Check if document is already locked
  const existingLock = documentLocks.get(documentId);
  
  // If locked by someone else and not expired
  if (existingLock && 
      existingLock.lockedBy.id !== currentUser.id && 
      new Date(existingLock.expiresAt) > new Date()) {
    return null;
  }
  
  // Create a new lock that expires in 5 minutes
  const lock: DocumentLock = {
    documentId,
    lockedBy: currentUser,
    lockedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60000).toISOString() // 5 minutes
  };
  
  documentLocks.set(documentId, lock);
  
  // Publish lock update
  mockWebSocket.publish(`document:${documentId}:locks`, {
    type: 'lock-acquired',
    lock
  });
  
  return lock;
};

export const releaseLock = (documentId: string): boolean => {
  const existingLock = documentLocks.get(documentId);
  
  // Only the lock owner can release it
  if (existingLock && existingLock.lockedBy.id === currentUser.id) {
    documentLocks.delete(documentId);
    
    // Publish lock update
    mockWebSocket.publish(`document:${documentId}:locks`, {
      type: 'lock-released',
      documentId
    });
    
    return true;
  }
  
  return false;
};

export const refreshLock = (documentId: string): DocumentLock | null => {
  const existingLock = documentLocks.get(documentId);
  
  // Only the lock owner can refresh it
  if (existingLock && existingLock.lockedBy.id === currentUser.id) {
    // Extend for another 5 minutes
    const updatedLock = {
      ...existingLock,
      expiresAt: new Date(Date.now() + 5 * 60000).toISOString()
    };
    
    documentLocks.set(documentId, updatedLock);
    return updatedLock;
  }
  
  return null;
};

// Change tracking
export const addChange = (documentId: string, change: Omit<DocumentChange, 'id' | 'userId' | 'userName' | 'timestamp' | 'status'>): DocumentChange => {
  if (!documentChanges.has(documentId)) {
    documentChanges.set(documentId, []);
  }
  
  const newChange: DocumentChange = {
    id: uuidv4(),
    documentId,
    userId: currentUser.id,
    userName: currentUser.name,
    timestamp: new Date().toISOString(),
    status: 'pending',
    ...change
  };
  
  documentChanges.get(documentId)!.push(newChange);
  
  // Publish change
  mockWebSocket.publish(`document:${documentId}:changes`, {
    type: 'change-added',
    change: newChange
  });
  
  return newChange;
};

export const updateChangeStatus = (documentId: string, changeId: string, status: 'accepted' | 'rejected'): DocumentChange | null => {
  const changes = documentChanges.get(documentId);
  if (!changes) return null;
  
  const changeIndex = changes.findIndex(c => c.id === changeId);
  if (changeIndex === -1) return null;
  
  const updatedChange = {
    ...changes[changeIndex],
    status
  };
  
  changes[changeIndex] = updatedChange;
  
  // Publish change update
  mockWebSocket.publish(`document:${documentId}:changes`, {
    type: 'change-updated',
    change: updatedChange
  });
  
  return updatedChange;
};

export const getChanges = (documentId: string): DocumentChange[] => {
  return documentChanges.get(documentId) || [];
};

// Comments
export const addComment = (documentId: string, comment: Omit<DocumentComment, 'id' | 'userId' | 'userName' | 'timestamp'>): DocumentComment => {
  if (!documentComments.has(documentId)) {
    documentComments.set(documentId, []);
  }
  
  const newComment: DocumentComment = {
    id: uuidv4(),
    documentId,
    userId: currentUser.id,
    userName: currentUser.name,
    timestamp: new Date().toISOString(),
    ...comment
  };
  
  documentComments.get(documentId)!.push(newComment);
  
  // Publish comment
  mockWebSocket.publish(`document:${documentId}:comments`, {
    type: 'comment-added',
    comment: newComment
  });
  
  return newComment;
};

export const getComments = (documentId: string, changeId?: string): DocumentComment[] => {
  const comments = documentComments.get(documentId) || [];
  return changeId ? comments.filter(c => c.changeId === changeId) : comments;
};

// Presence awareness
export const joinDocument = (documentId: string): void => {
  if (!activeUsers.has(documentId)) {
    activeUsers.set(documentId, new Set());
  }
  
  activeUsers.get(documentId)!.add(currentUser);
  
  // Publish presence update
  mockWebSocket.publish(`document:${documentId}:presence`, {
    type: 'user-joined',
    user: currentUser
  });
};

export const leaveDocument = (documentId: string): void => {
  if (activeUsers.has(documentId)) {
    activeUsers.get(documentId)!.delete(currentUser);
    
    // Publish presence update
    mockWebSocket.publish(`document:${documentId}:presence`, {
      type: 'user-left',
      userId: currentUser.id
    });
  }
};

export const getActiveUsers = (documentId: string): User[] => {
  return Array.from(activeUsers.get(documentId) || []);
};

// Collaborators
export const addCollaborator = (documentId: string, collaborator: CollaborationUser): void => {
  if (!documentCollaborators.has(documentId)) {
    documentCollaborators.set(documentId, []);
  }
  
  // Make sure this collaborator doesn't exist already
  const existing = documentCollaborators.get(documentId)!
    .findIndex(c => c.userId === collaborator.userId);
  
  if (existing !== -1) {
    documentCollaborators.get(documentId)![existing] = collaborator;
  } else {
    documentCollaborators.get(documentId)!.push(collaborator);
  }
  
  // Publish collaborator update
  mockWebSocket.publish(`document:${documentId}:collaborators`, {
    type: 'collaborator-added',
    collaborator
  });
};

export const removeCollaborator = (documentId: string, userId: string): void => {
  if (documentCollaborators.has(documentId)) {
    documentCollaborators.set(
      documentId,
      documentCollaborators.get(documentId)!.filter(c => c.userId !== userId)
    );
    
    // Publish collaborator update
    mockWebSocket.publish(`document:${documentId}:collaborators`, {
      type: 'collaborator-removed',
      userId
    });
  }
};

export const getCollaborators = (documentId: string): CollaborationUser[] => {
  return documentCollaborators.get(documentId) || [];
};

// Web Socket connection
export const connectToCollaborationService = (): Promise<void> => {
  return mockWebSocket.connect();
};

export const subscribeToDocumentEvents = (
  documentId: string, 
  eventType: 'locks' | 'changes' | 'comments' | 'presence' | 'collaborators',
  callback: (data: any) => void
): (() => void) => {
  return mockWebSocket.subscribe(`document:${documentId}:${eventType}`, callback);
};

// Current user info
export const getCurrentUser = (): User => {
  return {...currentUser};
};

export const updateCurrentUserName = (name: string): void => {
  currentUser.name = name;
  localStorage.setItem('userName', name);
};

