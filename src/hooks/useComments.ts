
import { useState, useCallback } from 'react';
import { Comment } from '@/utils/commentTypes';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function useComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [displayMode, setDisplayMode] = useState<'inline' | 'narrow-sidebar' | 'wide-sidebar'>('inline');

  const addComment = useCallback((
    content: string,
    parentId?: string,
    mentions?: string[],
    elementId?: string,
    position?: { x: number; y: number }
  ) => {
    const newComment: Comment = {
      id: uuidv4(),
      userId: 'current-user', // In a real app, get from auth
      userName: 'Current User', // In a real app, get from auth
      content,
      timestamp: new Date().toISOString(),
      parentId,
      mentions,
      elementId,
      position,
      resolved: false
    };

    setComments(prev => [...prev, newComment]);
    toast.success('Comment added');
    return newComment;
  }, []);

  const editComment = useCallback((id: string, content: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === id ? { ...comment, content } : comment
    ));
    toast.success('Comment updated');
  }, []);

  const deleteComment = useCallback((id: string) => {
    setComments(prev => prev.filter(comment => comment.id !== id));
    toast.success('Comment deleted');
  }, []);

  const resolveComment = useCallback((id: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === id ? { ...comment, resolved: true } : comment
    ));
    toast.success('Comment resolved');
  }, []);

  const reopenComment = useCallback((id: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === id ? { ...comment, resolved: false } : comment
    ));
    toast.success('Comment reopened');
  }, []);

  return {
    comments,
    displayMode,
    setDisplayMode,
    addComment,
    editComment,
    deleteComment,
    resolveComment,
    reopenComment
  };
}
