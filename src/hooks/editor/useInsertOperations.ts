
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
    const url = prompt('Enter image URL:');
    if (url) {
      const imgHtml = `<img src="${url}" alt="Inserted image" style="max-width: 100%;" /><p></p>`;
      document.execCommand('insertHTML', false, imgHtml);
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
