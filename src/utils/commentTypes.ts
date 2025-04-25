
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  parentId?: string;
  resolved?: boolean;
  mentions?: string[];
  elementId?: string; // For block-level comments
  position?: { x: number; y: number }; // For inline comments
}

export type CommentDisplayMode = 'inline' | 'narrow-sidebar' | 'wide-sidebar';
