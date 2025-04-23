
export const useInsertOperations = () => {
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
    // First, ensure we have focus in the editor
    const editable = document.querySelector('[contenteditable=true]');
    if (editable) {
      // Focus the editor if it's not already focused
      if (document.activeElement !== editable) {
        editable.focus();
      }
      
      const url = prompt('Enter image URL:');
      if (url) {
        const imgHtml = `<img src="${url}" alt="Inserted image" style="max-width: 100%;" /><p></p>`;
        document.execCommand('insertHTML', false, imgHtml);
        
        // Make sure cursor is positioned after the image
        window.getSelection()?.collapseToEnd();
      }
    } else {
      console.error('No editable element found');
    }
  };

  const insertDefaultHeading = () => {
    const headingHtml = `<h1>Your Document Title</h1><p>Start writing your content here...</p>`;
    document.execCommand('insertHTML', false, headingHtml);
  };

  return {
    insertChecklist,
    insertImage,
    insertDefaultHeading
  };
};
