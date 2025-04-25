
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Comment } from '@/utils/commentTypes';

interface CommentContentProps {
  comment: Comment;
  isEditing: boolean;
  editContent: string;
  onEditChange: (content: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export function CommentContent({
  comment,
  isEditing,
  editContent,
  onEditChange,
  onSaveEdit,
  onCancelEdit
}: CommentContentProps) {
  return (
    <div className="flex justify-between items-start mb-2">
      <div>
        <span className="font-medium">{comment.userName}</span>
        <span className="text-gray-500 text-sm ml-2">
          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
        </span>
      </div>
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
          <div className="flex space-x-2">
            <button 
              className="px-3 py-1 bg-primary text-white rounded-md text-sm"
              onClick={onSaveEdit}
            >
              Save
            </button>
            <button 
              className="px-3 py-1 bg-gray-200 rounded-md text-sm"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700 mb-2">{comment.content}</div>
      )}
      
      {comment.mentions?.length > 0 && !isEditing && (
        <div className="text-sm text-blue-600">
          {comment.mentions.map(mention => `@${mention}`).join(' ')}
        </div>
      )}
    </div>
  );
}
