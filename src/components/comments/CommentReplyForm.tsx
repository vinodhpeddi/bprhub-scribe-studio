
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, X } from 'lucide-react';

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
    <div className="mt-4 space-y-3 border border-gray-200 rounded-lg p-4 bg-gray-50">
      <Textarea
        placeholder="Write a reply..."
        value={replyContent}
        onChange={(e) => onReplyChange(e.target.value)}
        className="min-h-[100px] resize-none bg-white focus-visible:ring-editor-primary"
      />
      <div className="flex items-center justify-end space-x-2">
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={onCancelReply}
          className="text-gray-600 hover:text-gray-900"
        >
          <X className="h-4 w-4 mr-1" />
          Cancel
        </Button>
        <Button 
          size="sm" 
          onClick={onSubmitReply}
          className="bg-editor-primary hover:bg-editor-secondary text-white"
          disabled={!replyContent.trim()}
        >
          <Send className="h-4 w-4 mr-1" />
          Reply
        </Button>
      </div>
    </div>
  );
}
