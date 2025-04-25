
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Comment, CommentDisplayMode } from '@/utils/commentTypes';
import { CommentThread } from './CommentThread';
import { useState } from 'react';

interface CommentsProps {
  comments: Comment[];
  displayMode: CommentDisplayMode;
  onAddComment: (content: string, parentId?: string, mentions?: string[]) => void;
  onEditComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onResolveComment: (id: string) => void;
  onReopenComment: (id: string) => void;
}

export function Comments({
  comments,
  displayMode,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  onReopenComment
}: CommentsProps) {
  const [newCommentContent, setNewCommentContent] = useState('');

  const handleAddComment = () => {
    if (newCommentContent.trim()) {
      // Extract mentions from content
      const mentionRegex = /@(\w+)/g;
      const mentions = [...newCommentContent.matchAll(mentionRegex)].map(match => match[1]);
      
      onAddComment(newCommentContent, undefined, mentions.length > 0 ? mentions : undefined);
      setNewCommentContent('');
    }
  };

  // Group comments by their parent ID
  const commentThreads = comments.reduce((acc, comment) => {
    if (!comment.parentId) {
      const replies = comments.filter(reply => reply.parentId === comment.id);
      acc.push({ comment, replies });
    }
    return acc;
  }, [] as { comment: Comment; replies: Comment[] }[]);

  const content = (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Add a comment... Use @ to mention users"
          value={newCommentContent}
          onChange={(e) => setNewCommentContent(e.target.value)}
          className="min-h-[100px]"
        />
        <Button onClick={handleAddComment}>Add Comment</Button>
      </div>

      <div className="space-y-6">
        {commentThreads.map(({ comment, replies }) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            replies={replies}
            onReply={onAddComment}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            onResolve={onResolveComment}
            onReopen={onReopenComment}
          />
        ))}
      </div>
    </div>
  );

  if (displayMode === 'inline') {
    return <div className="mt-4">{content}</div>;
  }

  return (
    <Sheet>
      <SheetContent side="right" className={displayMode === 'wide-sidebar' ? 'w-[600px]' : 'w-[400px]'}>
        <SheetHeader>
          <SheetTitle>Comments</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          {content}
        </div>
      </SheetContent>
    </Sheet>
  );
}
