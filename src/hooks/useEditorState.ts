import { useState, useRef } from 'react';

export function useEditorState(initialValue: string) {
  const [content, setContent] = useState(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Create refs to keep track of content and avoid unnecessary re-renders
  const contentRef = useRef(initialValue);
  const contentUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const skipNextUpdateRef = useRef(false);
  
  // Update content with debounce
  const updateContent = (newContent: string) => {
    contentRef.current = newContent;
    
    // Clear previous timeout if it exists
    if (contentUpdateTimeoutRef.current) {
      clearTimeout(contentUpdateTimeoutRef.current);
    }
    
    // Set a new timeout
    contentUpdateTimeoutRef.current = setTimeout(() => {
      setContent(newContent);
    }, 300);
  };
  
  return {
    content,
    setContent: updateContent,
    contentRef,
    isInitialized,
    setIsInitialized,
    skipNextUpdateRef
  };
}
