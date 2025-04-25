
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentReplyFormProps {
  replyContent: string;
  onReplyChange: (content: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
}

export function CommentReplyForm({
  replyContent,
  onReplyChange,
  onSubmitReply,
  onCancelReply
}: CommentReplyFormProps) {
  return (
    <div className="mt-2 space-y-2">
      <Textarea
        placeholder="Write a reply..."
        value={replyContent}
        onChange={(e) => onReplyChange(e.target.value)}
        className="min-h-[100px]"
      />
      <div className="flex space-x-2">
        <Button size="sm" onClick={onSubmitReply}>Reply</Button>
        <Button size="sm" variant="ghost" onClick={onCancelReply}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
