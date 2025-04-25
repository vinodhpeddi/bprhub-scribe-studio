
import { useState } from 'react';
import { Comment } from '@/utils/commentTypes';
import { CommentContent } from './CommentContent';
import { CommentActions } from './CommentActions';
import { CommentReplyForm } from './CommentReplyForm';

interface CommentThreadProps {
  comment: Comment;
  replies: Comment[];
  onReply: (content: string, parentId: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onResolve: (id: string) => void;
  onReopen: (id: string) => void;
}

export function CommentThread({
  comment,
  replies,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReopen
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent, comment.id);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleSubmitEdit = () => {
    if (editContent.trim()) {
      onEdit(comment.id, editContent);
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg border ${comment.resolved ? 'bg-gray-50' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-2">
          <CommentContent 
            comment={comment}
            isEditing={isEditing}
            editContent={editContent}
            onEditChange={setEditContent}
            onSaveEdit={handleSubmitEdit}
            onCancelEdit={() => setIsEditing(false)}
          />
          
          <CommentActions 
            isResolved={!!comment.resolved}
            onResolve={() => onResolve(comment.id)}
            onReopen={() => onReopen(comment.id)}
            onEdit={() => setIsEditing(!isEditing)}
            onDelete={() => onDelete(comment.id)}
            onReply={() => setIsReplying(true)}
            isReplying={isReplying}
          />
        </div>

        {isReplying && (
          <CommentReplyForm 
            replyContent={replyContent}
            onReplyChange={setReplyContent}
            onSubmitReply={handleSubmitReply}
            onCancelReply={() => setIsReplying(false)}
          />
        )}
      </div>

      {replies.length > 0 && (
        <div className="ml-8 space-y-4">
          {replies.map(reply => (
            <CommentThread
              key={reply.id}
              comment={reply}
              replies={[]}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onResolve={onResolve}
              onReopen={onReopen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
