
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface DocumentTitleInputProps {
  title: string;
  onTitleChange: (title: string) => void;
}

const DocumentTitleInput: React.FC<DocumentTitleInputProps> = ({
  title,
  onTitleChange,
}) => {
  const [localTitle, setLocalTitle] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const skipUpdateRef = useRef(false);
  const titleChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserTypingRef = useRef(false);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    isUserTypingRef.current = true;
    
    // Store cursor position immediately
    if (titleInputRef.current) {
      cursorPositionRef.current = e.target.selectionStart;
    }
    
    // Update local state immediately to prevent lag
    setLocalTitle(newTitle);
    
    // Debounce the update to parent
    if (titleChangeTimeoutRef.current) {
      clearTimeout(titleChangeTimeoutRef.current);
    }
    
    titleChangeTimeoutRef.current = setTimeout(() => {
      onTitleChange(newTitle);
      isUserTypingRef.current = false;
    }, 500); // Increased debounce time to reduce updates
  }, [onTitleChange]);

  // Restore cursor position with proper timing
  useEffect(() => {
    if (titleInputRef.current && cursorPositionRef.current !== null && isUserTypingRef.current) {
      const cursorPosition = cursorPositionRef.current;
      requestAnimationFrame(() => {
        if (titleInputRef.current) {
          titleInputRef.current.selectionStart = cursorPosition;
          titleInputRef.current.selectionEnd = cursorPosition;
        }
      });
    }
  }, [localTitle]);

  // Update local title when prop changes (but only if not from local edit)
  useEffect(() => {
    if (skipUpdateRef.current) {
      skipUpdateRef.current = false;
      return;
    }
    
    if (title !== localTitle && !isUserTypingRef.current) {
      setLocalTitle(title);
    }
  }, [title, localTitle]);

  const handleTitleFocus = useCallback(() => {
    if (titleInputRef.current) {
      titleInputRef.current.select();
    }
  }, []);
  
  const handleTitleBlur = useCallback(() => {
    skipUpdateRef.current = true;
    isUserTypingRef.current = false;
    onTitleChange(localTitle);
  }, [localTitle, onTitleChange]);

  return (
    <Input
      ref={titleInputRef}
      value={localTitle}
      onChange={handleTitleChange}
      className="text-xl font-semibold flex-grow"
      placeholder="Document Title"
      onFocus={handleTitleFocus}
      onBlur={handleTitleBlur}
    />
  );
};

export default React.memo(DocumentTitleInput);
