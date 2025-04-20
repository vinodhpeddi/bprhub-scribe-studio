
import { useCallback } from 'react';
import { useTableOperations } from './editor/useTableOperations';
import { useListOperations } from './editor/useListOperations';
import { useInsertOperations } from './editor/useInsertOperations';
import { useFormatOperations } from './editor/useFormatOperations';

export interface EditorOperations {
  insertTable: (isLayout?: boolean) => void;
  insertChecklist: () => void;
  insertImage: () => void;
  handleListIndent: (increase: boolean) => void;
  handleFormatClick: (formatType: string, value?: string) => void;
  insertDefaultHeading: () => void;
}

export const useEditorOperations = (onChange: (content: string) => void) => {
  const { insertTable } = useTableOperations();
  const { handleListIndent } = useListOperations();
  const { insertChecklist, insertImage, insertDefaultHeading } = useInsertOperations();
  const { handleFormatClick } = useFormatOperations();

  // We're returning a stable object structure to prevent unnecessary re-renders
  return {
    insertTable,
    insertChecklist,
    insertImage,
    insertDefaultHeading,
    handleListIndent,
    handleFormatClick,
  };
};
