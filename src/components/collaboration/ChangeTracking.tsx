
import React, { useState, useEffect } from 'react';
import { 
  DocumentChange, 
  DocumentComment 
} from '@/utils/collaborationTypes';
import { 
  getChanges, 
  updateChangeStatus, 
  subscribeToDocumentEvents,
  addComment,
  getComments
} from '@/utils/collaborationService';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Check, X, MessageSquare, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';

interface ChangeTrackingProps {
  documentId: string;
  onAcceptChange?: (change: DocumentChange) => void;
  onRejectChange?: (change: DocumentChange) => void;
}

const ChangeTracking: React.FC<ChangeTrackingProps> = ({ 
  documentId,
  onAcceptChange,
  onRejectChange 
}) => {
  const [changes, setChanges] = useState<DocumentChange[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [comments, setComments] = useState<{ [key: string]: DocumentComment[] }>({});
  const [showCommentFor, setShowCommentFor] = useState<string | null>(null);

  useEffect(() => {
    // Get initial changes
    setChanges(getChanges(documentId));
    
    // Get initial comments
    const allComments = getComments(documentId);
    const commentsByChange = allComments.reduce((acc, comment) => {
      if (comment.changeId) {
        if (!acc[comment.changeId]) {
          acc[comment.changeId] = [];
        }
        acc[comment.changeId].push(comment);
      }
      return acc;
    }, {} as { [key: string]: DocumentComment[] });
    setComments(commentsByChange);
    
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
    
    // Subscribe to comment updates
    const unsubscribeComments = subscribeToDocumentEvents(
      documentId,
      'comments',
      (data) => {
        if (data.type === 'comment-added' && data.comment.changeId) {
          setComments(prev => {
            const newComments = { ...prev };
            if (!newComments[data.comment.changeId!]) {
              newComments[data.comment.changeId!] = [];
            }
            newComments[data.comment.changeId!] = [
              ...newComments[data.comment.changeId!],
              data.comment
            ];
            return newComments;
          });
        }
      }
    );
    
    return () => {
      unsubscribeChanges();
      unsubscribeComments();
    };
  }, [documentId]);

  const handleAcceptChange = (change: DocumentChange) => {
    const updatedChange = updateChangeStatus(documentId, change.id, 'accepted');
    if (updatedChange && onAcceptChange) {
      onAcceptChange(updatedChange);
    }
  };

  const handleRejectChange = (change: DocumentChange) => {
    const updatedChange = updateChangeStatus(documentId, change.id, 'rejected');
    if (updatedChange && onRejectChange) {
      onRejectChange(updatedChange);
    }
  };

  const handleSubmitComment = (changeId: string) => {
    if (!commentText[changeId] || !commentText[changeId].trim()) return;
    
    addComment(documentId, {
      content: commentText[changeId],
      changeId
    });
    
    // Clear comment text
    setCommentText(prev => ({
      ...prev,
      [changeId]: ''
    }));
  };

  const filteredChanges = changes.filter(change => {
    if (activeTab === 'pending') return change.status === 'pending';
    if (activeTab === 'accepted') return change.status === 'accepted';
    if (activeTab === 'rejected') return change.status === 'rejected';
    return true;
  });

  const pendingCount = changes.filter(c => c.status === 'pending').length;
  const acceptedCount = changes.filter(c => c.status === 'accepted').length;
  const rejectedCount = changes.filter(c => c.status === 'rejected').length;

  return (
    <div className="border rounded-md">
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {pendingCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1 min-w-[18px]">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="accepted">Accepted ({acceptedCount})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedCount})</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="h-[300px] p-4">
            {filteredChanges.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No {activeTab} changes
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChanges.map(change => {
                  const changeComments = comments[change.id] || [];
                  
                  return (
                    <div key={change.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-sm">{change.userName}</div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(change.timestamp), { addSuffix: true })}
                          </div>
                        </div>
                        
                        {change.status === 'pending' && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 h-8 w-8 p-0"
                              onClick={() => handleAcceptChange(change)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 h-8 w-8 p-0"
                              onClick={() => handleRejectChange(change)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 h-8 w-8 p-0"
                              onClick={() => setShowCommentFor(showCommentFor === change.id ? null : change.id)}
                            >
                              <MessageSquare className="h-4 w-4" />
                              {changeComments.length > 0 && (
                                <span className="ml-1 text-xs">{changeComments.length}</span>
                              )}
                            </Button>
                          </div>
                        )}
                        
                        {change.status === 'accepted' && (
                          <span className="text-green-600 text-xs font-medium">Accepted</span>
                        )}
                        
                        {change.status === 'rejected' && (
                          <span className="text-red-600 text-xs font-medium">Rejected</span>
                        )}
                      </div>
                      
                      <div className="text-sm mb-2">
                        <span className="font-medium">{change.type.charAt(0).toUpperCase() + change.type.slice(1)}:</span>
                        {change.type === 'deletion' && change.originalContent && (
                          <div className="bg-red-50 p-2 mt-1 rounded border border-red-100 line-through">
                            <div dangerouslySetInnerHTML={{ __html: change.originalContent }} />
                          </div>
                        )}
                        {(change.type === 'addition' || change.type === 'modification' || change.type === 'suggestion') && (
                          <div className="bg-green-50 p-2 mt-1 rounded border border-green-100">
                            <div dangerouslySetInnerHTML={{ __html: change.content }} />
                          </div>
                        )}
                      </div>
                      
                      {/* Comments section */}
                      {(changeComments.length > 0 || showCommentFor === change.id) && (
                        <div className="mt-3">
                          <Separator className="my-2" />
                          <div className="text-xs font-medium mb-2">Comments</div>
                          
                          {changeComments.length > 0 && (
                            <div className="space-y-2 mb-2">
                              {changeComments.map(comment => (
                                <div key={comment.id} className="bg-gray-50 p-2 rounded text-xs">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{comment.userName}</span>
                                    <span className="text-gray-500">
                                      {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                                    </span>
                                  </div>
                                  <div className="mt-1">{comment.content}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {showCommentFor === change.id && (
                            <div className="flex space-x-2">
                              <Textarea
                                placeholder="Add a comment..."
                                className="text-xs min-h-[60px]"
                                value={commentText[change.id] || ''}
                                onChange={(e) => setCommentText(prev => ({
                                  ...prev,
                                  [change.id]: e.target.value
                                }))}
                              />
                              <Button 
                                size="sm" 
                                onClick={() => handleSubmitComment(change.id)}
                                disabled={!commentText[change.id] || !commentText[change.id].trim()}
                              >
                                Post
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChangeTracking;
