
import { useState, useCallback, useEffect } from 'react';
import { ModelEditorActions } from './useModelEditor';
import { toast } from 'sonner';

export function useModelEditorFormatting(actions: ModelEditorActions, state: any) {
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const handleFormatClick = useCallback((formatType: string, value?: string) => {
    switch (formatType) {
      case 'bold':
        actions.formatText('bold');
        break;
      case 'italic':
        actions.formatText('italic');
        break;
      case 'underline':
        actions.formatText('underline');
        break;
      case 'link':
        const url = prompt('Enter link URL:');
        if (url) {
          actions.formatText('link', { href: url });
        }
        break;
      case 'highlight':
        actions.formatText('highlight');
        break;
      case 'comment':
        const comment = prompt('Enter your comment:');
        if (comment) {
          actions.formatText('comment', { text: comment });
        }
        break;
      // Block types
      case 'formatBlock':
        if (value === 'h1') {
          actions.setBlockType('heading', { level: 1 });
        } else if (value === 'h2') {
          actions.setBlockType('heading', { level: 2 });
        } else if (value === 'h3') {
          actions.setBlockType('heading', { level: 3 });
        } else if (value === 'p') {
          actions.setBlockType('paragraph');
        }
        break;
      case 'bulletList':
        actions.setBlockType('bullet_list');
        break;
      case 'orderedList':
        actions.setBlockType('ordered_list');
        break;
    }
    
    // Update active formats based on selection
    updateActiveFormats();
  }, [actions]);

  const updateActiveFormats = useCallback(() => {
    const formats: string[] = [];
    // Logic to detect active formats based on model and selection
    setActiveFormats(formats);
  }, []);

  const handleInsertMergeField = useCallback((field: string) => {
    if (state.editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(field));
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      } else {
        state.editorRef.current.innerHTML += field;
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      }
    }
  }, [state.editorRef, actions]);

  return {
    activeFormats,
    handleFormatClick,
    handleInsertMergeField
  };
}
