
import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { User } from '@/utils/collaborationTypes';
import { getCurrentUser, getActiveUsers, subscribeToDocumentEvents, joinDocument, leaveDocument } from '@/utils/collaborationService';

interface UserPresenceProps {
  documentId: string;
}

const UserPresence: React.FC<UserPresenceProps> = ({ documentId }) => {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const currentUser = getCurrentUser();
  
  useEffect(() => {
    // Join this document
    joinDocument(documentId);
    
    // Get initial active users
    setActiveUsers(getActiveUsers(documentId));
    
    // Subscribe to presence updates
    const unsubscribe = subscribeToDocumentEvents(
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
    
    // Leave document when unmounting
    return () => {
      unsubscribe();
      leaveDocument(documentId);
    };
  }, [documentId]);
  
  // Don't display yourself in the list
  const otherUsers = activeUsers.filter(user => user.id !== currentUser.id);
  
  if (otherUsers.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-gray-500 mr-1">
        {otherUsers.length === 1 ? '1 person viewing' : `${otherUsers.length} people viewing`}
      </span>
      
      <div className="flex -space-x-2">
        {otherUsers.slice(0, 3).map(user => (
          <TooltipProvider key={user.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="h-6 w-6 border border-white">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <AvatarFallback 
                      style={{ backgroundColor: user.color || '#888888' }}
                      className="text-xs text-white"
                    >
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{user.name}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
        
        {otherUsers.length > 3 && (
          <Avatar className="h-6 w-6 border border-white">
            <AvatarFallback className="text-xs bg-gray-500 text-white">
              +{otherUsers.length - 3}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

export default UserPresence;
