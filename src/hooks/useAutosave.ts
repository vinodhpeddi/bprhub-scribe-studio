
import { useEffect, useRef } from 'react';

interface UseAutosaveProps {
  onSave: () => void;
  delay?: number;
  enabled?: boolean;
}

export function useAutosave({ onSave, delay = 3000, enabled = true }: UseAutosaveProps) {
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const triggerAutosave = () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      autosaveTimeoutRef.current = setTimeout(() => {
        onSave();
      }, delay);
    };
    
    // Add event listeners for user activity
    const events = ['keyup', 'paste', 'cut', 'mouseup'];
    const editor = document.querySelector('.editor-content');
    
    if (editor) {
      events.forEach(event => {
        editor.addEventListener(event, triggerAutosave);
      });
    }
    
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      if (editor) {
        events.forEach(event => {
          editor.removeEventListener(event, triggerAutosave);
        });
      }
    };
  }, [onSave, delay, enabled]);
}

