
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Edit2, Trash2, MessageSquare } from 'lucide-react';

interface CommentActionsProps {
  isResolved: boolean;
  onResolve: () => void;
  onReopen: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  isReplying: boolean;
}

export function CommentActions({
  isResolved,
  onResolve,
  onReopen,
  onEdit,
  onDelete,
  onReply,
  isReplying
}: CommentActionsProps) {
  return (
    <div className="flex space-x-2">
      {!isResolved ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResolve}
        >
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span>Resolve</span>
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReopen}
        >
          <XCircle className="h-4 w-4 mr-1" />
          <span>Reopen</span>
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      {!isReplying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReply}
          className="mt-2"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>Reply</span>
        </Button>
      )}
    </div>
  );
}
