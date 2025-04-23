
export const useTableOperations = () => {
  const insertTable = (isLayout: boolean = false) => {
    // First, ensure we have focus in the editor
    const editable = document.querySelector('[contenteditable=true]');
    if (editable) {
      // Focus the editor if it's not already focused
      if (document.activeElement !== editable) {
        // Cast to HTMLElement to access focus method
        (editable as HTMLElement).focus();
      }
      
      // Create the table HTML
      const tableHtml = `
        <table class="${isLayout ? 'layout-table' : ''}" style="${isLayout ? 'border-collapse: collapse; width: 100%;' : 'border-collapse: collapse; width: 100%;'}">
          <tr>
            <td style="${isLayout ? 'border: none; padding: 8px;' : 'border: 1px solid #ddd; padding: 8px;'}">&nbsp;</td>
            <td style="${isLayout ? 'border: none; padding: 8px;' : 'border: 1px solid #ddd; padding: 8px;'}">&nbsp;</td>
          </tr>
          <tr>
            <td style="${isLayout ? 'border: none; padding: 8px;' : 'border: 1px solid #ddd; padding: 8px;'}">&nbsp;</td>
            <td style="${isLayout ? 'border: none; padding: 8px;' : 'border: 1px solid #ddd; padding: 8px;'}">&nbsp;</td>
          </tr>
        </table><p></p>
      `;
      
      // Insert the table
      document.execCommand('insertHTML', false, tableHtml);
      
      // Ensure the table is visible and cursor is positioned after it
      window.getSelection()?.collapseToEnd();
    } else {
      console.error('No editable element found');
    }
  };

  return { insertTable };
};
