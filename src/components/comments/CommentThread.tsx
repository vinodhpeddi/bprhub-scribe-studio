
import { Comment } from '@/utils/commentTypes';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

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
          <div>
            <span className="font-medium">{comment.userName}</span>
            <span className="text-gray-500 text-sm ml-2">
              {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
            </span>
          </div>
          <div className="flex space-x-2">
            {!comment.resolved ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onResolve(comment.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Resolve</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReopen(comment.id)}
              >
                <XCircle className="h-4 w-4 mr-1" />
                <span>Reopen</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSubmitEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-gray-700 mb-2">{comment.content}</div>
            {comment.mentions?.length > 0 && (
              <div className="text-sm text-blue-600">
                {comment.mentions.map(mention => `@${mention}`).join(' ')}
              </div>
            )}
          </>
        )}

        {!isReplying && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsReplying(true)}
            className="mt-2"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            <span>Reply</span>
          </Button>
        )}

        {isReplying && (
          <div className="mt-2 space-y-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleSubmitReply}>Reply</Button>
              <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)}>
                Cancel
              </Button>
            </div>
          </div>
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
