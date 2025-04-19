import React, { useState, useRef, useEffect } from 'react';
import FormatToolbar from './FormatToolbar';
import { TableProperties } from './TableProperties';

interface TextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
  editorRef?: React.RefObject<HTMLDivElement>;
}

const TextEditor: React.FC<TextEditorProps> = ({ initialContent, onChange, editorRef }) => {
  const defaultEditorRef = useRef<HTMLDivElement>(null);
  const actualEditorRef = editorRef || defaultEditorRef;
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);

  useEffect(() => {
    if (actualEditorRef.current) {
      actualEditorRef.current.innerHTML = initialContent;
    }
  }, [initialContent, actualEditorRef]);

  const insertTable = (isLayout: boolean = false) => {
    const tableHtml = `
      <table class="${isLayout ? 'layout-table' : ''}" style="${isLayout ? 'border-collapse: collapse; width: 100%;' : ''}">
        <tr>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
        </tr>
        <tr>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
          <td style="${isLayout ? 'border: none; padding: 8px;' : ''}">&nbsp;</td>
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
    const url = prompt('Enter image URL:');
    if (url) {
      const imgHtml = `<img src="${url}" alt="Inserted image" style="max-width: 100%;" /><p></p>`;
      document.execCommand('insertHTML', false, imgHtml);
    }
  };

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
      case 'layoutTable':
        insertTable(true);
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

  const handleTableClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const table = target.closest('table');
    
    if (table) {
      setSelectedTable(table as HTMLTableElement);
      setShowTableProperties(true);
    } else {
      setSelectedTable(null);
      setShowTableProperties(false);
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
    
    if (document.queryCommandState('insertUnorderedList')) formats.push('bulletList');
    if (document.queryCommandState('insertOrderedList')) formats.push('orderedList');
    
    setActiveFormats(formats);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    
    const text = e.clipboardData.getData('text/html') || e.clipboardData.getData('text');
    
    document.execCommand('insertHTML', false, text);
  };

  return (
    <div className="w-full">
      <FormatToolbar onFormatClick={handleFormatClick} activeFormats={activeFormats} />
      
      {showTableProperties && selectedTable && (
        <TableProperties 
          table={selectedTable}
          onClose={() => setShowTableProperties(false)}
        />
      )}
      
      <div
        ref={actualEditorRef}
        className="editor-content"
        contentEditable
        onInput={handleEditorInput}
        onPaste={handlePaste}
        onKeyUp={updateActiveFormats}
        onMouseUp={updateActiveFormats}
        onFocus={updateActiveFormats}
        onClick={handleTableClick}
      />
    </div>
  );
};

export default TextEditor;
