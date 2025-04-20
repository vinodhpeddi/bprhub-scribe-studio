
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

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    
    // Save cursor position
    if (titleInputRef.current) {
      cursorPositionRef.current = titleInputRef.current.selectionStart;
    }
    
    // Debounce the propagation to parent component
    if (titleChangeTimeoutRef.current) {
      clearTimeout(titleChangeTimeoutRef.current);
    }
    
    titleChangeTimeoutRef.current = setTimeout(() => {
      onTitleChange(newTitle);
    }, 300);
  }, [onTitleChange]);

  // Restore cursor position after input update
  useEffect(() => {
    if (titleInputRef.current && cursorPositionRef.current !== null) {
      titleInputRef.current.selectionStart = cursorPositionRef.current;
      titleInputRef.current.selectionEnd = cursorPositionRef.current;
      cursorPositionRef.current = null;
    }
  }, [localTitle]);

  // Update local title when prop changes (but only if not from local edit)
  useEffect(() => {
    if (skipUpdateRef.current) {
      skipUpdateRef.current = false;
      return;
    }
    
    if (title !== localTitle) {
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
