
import { useState, useRef, useEffect } from 'react';

export interface EditorOperations {
  insertTable: (isLayout?: boolean) => void;
  insertChecklist: () => void;
  insertImage: () => void;
  handleListIndent: (increase: boolean) => void;
  handleFormatClick: (formatType: string, value?: string) => void;
}

export const useEditorOperations = (onChange: (content: string) => void) => {
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

  const insertDefaultHeading = () => {
    const headingHtml = `<h1>Document Title</h1><p>Start writing your content here...</p>`;
    document.execCommand('insertHTML', false, headingHtml);
  };

  const handleListIndent = (increase: boolean) => {
    const selection = window.getSelection();
    if (!selection) return;
    
    const listItem = selection.anchorNode?.parentElement?.closest('li');
    if (!listItem) return;
    
    const list = listItem.closest('ol, ul');
    if (!list) return;

    if (increase) {
      const previousSibling = listItem.previousElementSibling;
      if (!previousSibling) return;

      let subList = previousSibling.querySelector('ol, ul');
      if (!subList) {
        subList = document.createElement(list.tagName);
        previousSibling.appendChild(subList);
      }
      subList.appendChild(listItem);
    } else {
      const parentList = list.parentElement?.closest('ol, ul');
      if (!parentList) return;

      const parentItem = list.parentElement;
      if (!parentItem) return;

      parentList.insertBefore(listItem, parentItem.nextSibling);
      if (list.children.length === 0) {
        list.remove();
      }
    }
  };

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
      case 'indentList':
        handleListIndent(true);
        return;
      case 'outdentList':
        handleListIndent(false);
        return;
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

  return {
    insertTable,
    insertChecklist,
    insertImage,
    insertDefaultHeading,
    handleListIndent,
    handleFormatClick,
  };
};
