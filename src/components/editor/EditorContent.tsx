
import React from 'react';

interface EditorContentProps {
  editorRef: React.RefObject<HTMLDivElement>;
  onInput: () => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onKeyUp: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onMouseUp: () => void;
  onClick: (e: React.MouseEvent) => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
  editorRef,
  onInput,
  onPaste,
  onKeyUp,
  onKeyDown,
  onMouseUp,
  onClick,
}) => {
  return (
    <div
      ref={editorRef}
      className="editor-content"
      contentEditable
      onInput={onInput}
      onPaste={onPaste}
      onKeyUp={onKeyUp}
      onKeyDown={onKeyDown}
      onMouseUp={onMouseUp}
      onClick={onClick}
    />
  );
};

export default EditorContent;
