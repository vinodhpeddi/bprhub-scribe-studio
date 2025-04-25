
import { useCallback, useMemo } from 'react';
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
  handleTableInsert?: (isLayout: boolean) => void;
  handleImageInsert?: () => void;
}

export const useEditorOperations = (onChange: (content: string) => void) => {
  const { insertTable } = useTableOperations();
  const { handleListIndent } = useListOperations();
  const { insertChecklist, insertImage, insertDefaultHeading } = useInsertOperations();
  const { handleFormatClick } = useFormatOperations();

  // Wrap each operation with a stable callback to prevent unnecessary re-renders
  const stableInsertTable = useCallback((isLayout?: boolean) => {
    insertTable(isLayout);
  }, [insertTable]);

  const stableInsertChecklist = useCallback(() => {
    insertChecklist();
  }, [insertChecklist]);

  const stableInsertImage = useCallback(() => {
    insertImage();
  }, [insertImage]);

  const stableInsertDefaultHeading = useCallback(() => {
    insertDefaultHeading();
  }, [insertDefaultHeading]);

  const stableHandleListIndent = useCallback((increase: boolean) => {
    handleListIndent(increase);
  }, [handleListIndent]);

  const stableHandleFormatClick = useCallback((formatType: string, value?: string) => {
    handleFormatClick(formatType, value);
  }, [handleFormatClick]);

  // Memoize the operations object to prevent unnecessary re-renders
  return useMemo(() => ({
    insertTable: stableInsertTable,
    insertChecklist: stableInsertChecklist,
    insertImage: stableInsertImage,
    insertDefaultHeading: stableInsertDefaultHeading,
    handleListIndent: stableHandleListIndent,
    handleFormatClick: stableHandleFormatClick,
    // Add these properties to match the expected interface in EditorToolbar
    handleTableInsert: stableInsertTable,
    handleImageInsert: stableInsertImage
  }), [
    stableInsertTable,
    stableInsertChecklist,
    stableInsertImage,
    stableInsertDefaultHeading,
    stableHandleListIndent,
    stableHandleFormatClick
  ]);
};
