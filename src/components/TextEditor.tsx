
import React, { useState, useRef, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialContent, onChange, editorRef }) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  useEffect(() => {
    if (actualEditorRef.current) {
      actualEditorRef.current.innerHTML = initialContent;
    }
  }, [initialContent, actualEditorRef]);

  const handleFormatClick = (formatType: string) => {
    let command = '';
    let value = null;

    switch (formatType) {
      case 'bold':
        command = 'bold';
        break;
      case 'italic':
        command = 'italic';
        break;
      case 'underline':
        command = 'underline';
        break;
      case 'bulletList':
        command = 'insertUnorderedList';
        break;
      case 'orderedList':
        command = 'insertOrderedList';
        break;
      case 'table':
        insertTable();
        return;
      case 'checklist':
        insertChecklist();
        return;
      case 'image':
        insertImage();
        return;
      default:
        return;
    }

    document.execCommand(command, false, value);
    updateActiveFormats();
  };

  const insertTable = () => {
    const tableHtml = `
      <table>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
          <th>Header 3</th>
        </tr>
        <tr>
          <td>Row 1, Cell 1</td>
          <td>Row 1, Cell 2</td>
          <td>Row 1, Cell 3</td>
        </tr>
        <tr>
          <td>Row 2, Cell 1</td>
          <td>Row 2, Cell 2</td>
          <td>Row 2, Cell 3</td>
        </tr>
      </table><p></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
  };

  const insertChecklist = () => {
    const checklistHtml = `
      <ul style="list-style-type: none; padding-left: 0;">
        <li><input type="checkbox" /> Checklist item 1</li>
        <li><input type="checkbox" /> Checklist item 2</li>
        <li><input type="checkbox" /> Checklist item 3</li>
      </ul><p></p>
    `;
    document.execCommand('insertHTML', false, checklistHtml);
  };

  const insertImage = () => {
    // In a real implementation, this would open a file dialog
    const url = prompt('Enter image URL:');
    if (url) {
      const imgHtml = `<img src="${url}" alt="Inserted image" style="max-width: 100%;" /><p></p>`;
      document.execCommand('insertHTML', false, imgHtml);
    }
  };

  const handleEditorInput = () => {
    if (actualEditorRef.current) {
      updateActiveFormats();
      onChange(actualEditorRef.current.innerHTML);
    }
  };

  const updateActiveFormats = () => {
    const formats: string[] = [];
    
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    
    // List checks are more complex
    if (document.queryCommandState('insertUnorderedList')) formats.push('bulletList');
    if (document.queryCommandState('insertOrderedList')) formats.push('orderedList');
    
    setActiveFormats(formats);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // Prevent the default paste
    e.preventDefault();
    
    // Get text representation
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text');
    
    // Insert as HTML to preserve formatting
    document.execCommand('insertHTML', false, text);
  };

  return (
    <div className="w-full">
      <FormatToolbar onFormatClick={handleFormatClick} activeFormats={activeFormats} />
      
      <div
        ref={actualEditorRef}
        className="editor-content"
        contentEditable
        onInput={handleEditorInput}
        onPaste={handlePaste}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
      />
    </div>
  );
};

export default TextEditor;
