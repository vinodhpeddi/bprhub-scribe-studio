
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
      case 'safety':
      case 'info':
        const boxStyles = {
          warning: {
            bg: '#FEF7CD',
            border: '#EAB308',
            text: '#854D0E',
            icon: '⚠️ Warning:',
          },
          safety: {
            bg: '#E5DEFF',
            border: '#6E59A5',
            text: '#1A1F2C',
            icon: '🛡️ Safety Note:',
          },
          info: {
            bg: '#D3E4FD',
            border: '#0EA5E9',
            text: '#0C4A6E',
            icon: 'ℹ️ Note:',
          },
        };
        
        const style = boxStyles[formatType as keyof typeof boxStyles];
        const boxHtml = `<div style="background-color: ${style.bg}; border: 1px solid ${style.border}; border-radius: 4px; padding: 12px; margin: 8px 0;">
          <p style="color: ${style.text}; margin: 0;"><strong>${style.icon}</strong> Add your text here</p>
        </div><p></p>`;
        document.execCommand('insertHTML', false, boxHtml);
        return;
      default:
        return;
    }

    document.execCommand(command, false, commandValue);
  };

  return { handleFormatClick };
};
