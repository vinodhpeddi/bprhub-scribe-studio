
export const useFormatOperations = () => {
  const handleFormatClick = (formatType: string, value?: string) => {
    let command = '';
    let commandValue = null;

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
      case 'foreColor':
        command = 'foreColor';
        commandValue = value;
        break;
      case 'hiliteColor':
        command = 'hiliteColor';
        commandValue = value;
        break;  
      case 'highlight':
        document.execCommand('backColor', false, '#FEF7CD');
        return;
      case 'redline':
        document.execCommand('foreColor', false, '#ea384c');
        document.execCommand('strikeThrough', false, null);
        return;
      case 'comment':
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) {
          const comment = prompt('Enter your comment:');
          if (comment) {
            const range = selection.getRangeAt(0);
            const span = document.createElement('span');
            span.className = 'comment';
            span.title = comment;
            span.style.backgroundColor = '#FEF7CD';
            span.style.cursor = 'help';
            range.surroundContents(span);
          }
        } else {
          alert('Please select some text to comment on');
        }
        return;
      case 'formatBlock':
        command = 'formatBlock';
        commandValue = value;
        break;
      case 'fontName':
        command = 'fontName';
        commandValue = value;
        break;
      case 'fontSize':
        command = 'fontSize';
        commandValue = value;
        break;
      case 'warning':
        const warningHtml = `<div style="background-color: #FEF7CD; border: 1px solid #EAB308; border-radius: 4px; padding: 12px; margin: 8px 0;">
          <p style="color: #854D0E; margin: 0;"><strong>⚠️ Warning:</strong> Add your warning text here</p>
        </div><p></p>`;
        document.execCommand('insertHTML', false, warningHtml);
        return;
      case 'safety':
        const safetyHtml = `<div style="background-color: #E5DEFF; border: 1px solid #6E59A5; border-radius: 4px; padding: 12px; margin: 8px 0;">
          <p style="color: #1A1F2C; margin: 0;"><strong>🛡️ Safety Note:</strong> Add safety instructions here</p>
        </div><p></p>`;
        document.execCommand('insertHTML', false, safetyHtml);
        return;
      case 'info':
        const infoHtml = `<div style="background-color: #D3E4FD; border: 1px solid #0EA5E9; border-radius: 4px; padding: 12px; margin: 8px 0;">
          <p style="color: #0C4A6E; margin: 0;"><strong>ℹ️ Note:</strong> Add important information here</p>
        </div><p></p>`;
        document.execCommand('insertHTML', false, infoHtml);
        return;
      default:
        return;
    }

    document.execCommand(command, false, commandValue);
  };

  return { handleFormatClick };
};
