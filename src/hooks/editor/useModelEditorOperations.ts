
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ModelEditorActions } from './useModelEditor';
import * as Factory from '@/utils/editor/model/documentFactory';

export function useModelEditorOperations(
  actions: ModelEditorActions,
  state: any,
  isReadOnly: boolean
) {
  const handleTableInsert = useCallback((isLayout: boolean = false) => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }

    // Create a simple 2x2 table
    const table = Factory.createTable([
      Factory.createTableRow([
        Factory.createTableCell([Factory.createParagraph([Factory.createText('')])]),
        Factory.createTableCell([Factory.createParagraph([Factory.createText('')])])
      ]),
      Factory.createTableRow([
        Factory.createTableCell([Factory.createParagraph([Factory.createText('')])]),
        Factory.createTableCell([Factory.createParagraph([Factory.createText('')])])
      ])
    ], isLayout);
    
    actions.insertBlock(table);
  }, [actions, isReadOnly]);

  const handleInsertImage = useCallback(() => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    const url = prompt('Enter image URL:');
    if (!url) return;
    
    const image = Factory.createImage(url, 'Inserted image');
    actions.insertBlock(image);
  }, [actions, isReadOnly]);

  const handleInsertChecklist = useCallback(() => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    const checklistHtml = `
      <ul style="list-style-type: none; padding-left: 0;">
        <li><input type="checkbox" /> Checklist item 1</li>
        <li><input type="checkbox" /> Checklist item 2</li>
        <li><input type="checkbox" /> Checklist item 3</li>
      </ul>
    `;
    
    // For now, we'll insert as HTML until we have proper checklist support in the model
    if (state.editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        selection.getRangeAt(0).insertNode(document.createTextNode(checklistHtml));
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      } else {
        state.editorRef.current.innerHTML += checklistHtml;
        actions.forceHtmlUpdate(state.editorRef.current.innerHTML);
      }
    }
  }, [actions, state.editorRef, isReadOnly]);

  const insertDefaultHeading = useCallback(() => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    actions.insertBlock(Factory.createHeading(1, [Factory.createText('Your Document Title')]));
    actions.insertBlock(Factory.createParagraph([Factory.createText('Start writing your content here...')]));
  }, [actions, isReadOnly]);

  const handleListIndent = useCallback((increase: boolean) => {
    if (isReadOnly) {
      toast.error('Document is locked for editing');
      return;
    }
    
    // To be implemented with model operations
    toast.info('List indentation support coming soon');
  }, [isReadOnly]);

  return {
    insertTable: handleTableInsert,
    insertChecklist: handleInsertChecklist,
    insertImage: handleInsertImage,
    handleListIndent,
    handleFormatClick: (formatType: string, value?: string) => {
      if (isReadOnly) {
        toast.error('Document is locked for editing');
        return;
      }
      // This is delegated to the parent component's handler
    },
    insertDefaultHeading,
    handleTableInsert,
    handleImageInsert: handleInsertImage
  };
}
