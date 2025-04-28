
import { v4 as uuidv4 } from 'uuid';
import * as DT from './documentTypes';
import * as Factory from './documentFactory';

/**
 * Convert HTML content to our document model
 */
export function htmlToModel(html: string): DT.Doc {
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = html;
  
  const blocks: DT.Node[] = [];
  
  // Process top-level elements
  for (const node of Array.from(tempContainer.childNodes)) {
    const processedNode = processNode(node);
    if (processedNode) {
      blocks.push(processedNode);
    }
  }
  
  return Factory.createDoc(blocks);
}

function processNode(node: Node): DT.Node | DT.TextNode | null {
  if (node.nodeType === Node.TEXT_NODE) {
    // Don't create empty text nodes
    if (node.textContent?.trim() === '') return null;
    return Factory.createText(node.textContent || '');
  }
  
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  
  const element = node as HTMLElement;
  const blockId = element.getAttribute('data-block-id') || uuidv4();
  
  // Process based on tag name
  switch (element.tagName.toLowerCase()) {
    case 'p':
      return createParagraphFromElement(element, blockId);
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return createHeadingFromElement(element, blockId);
    case 'ul':
      return createListFromElement(element, 'bullet_list', blockId);
    case 'ol':
      return createListFromElement(element, 'ordered_list', blockId);
    case 'table':
      return createTableFromElement(element, blockId);
    case 'img':
      return createImageFromElement(element, blockId);
    case 'blockquote':
      return createBlockquoteFromElement(element, blockId);
    case 'pre':
      return createCodeBlockFromElement(element, blockId);
    case 'hr':
      return Factory.createHorizontalRule();
    case 'div':
      // Special handling for div containers
      return createNodeFromDiv(element, blockId);
    default:
      // For any other element, we'll extract its content
      return createInlineContent(element);
  }
}

function createParagraphFromElement(element: HTMLElement, blockId: string): DT.Node {
  const content = processElementChildren(element);
  const paragraph = Factory.createParagraph(content);
  paragraph.blockId = blockId;
  
  // Extract any metadata from data attributes
  const metadata: Record<string, any> = {};
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith('data-') && attr.name !== 'data-block-id') {
      metadata[attr.name.substring(5)] = attr.value;
    }
  }
  
  if (Object.keys(metadata).length > 0) {
    paragraph.metadata = metadata;
  }
  
  return paragraph;
}

function createHeadingFromElement(element: HTMLElement, blockId: string): DT.HeadingNode {
  const level = parseInt(element.tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6;
  const content = processElementChildren(element);
  const heading = Factory.createHeading(level, content);
  heading.blockId = blockId;
  
  // Extract any metadata
  const metadata: Record<string, any> = {};
  for (const attr of Array.from(element.attributes)) {
    if (attr.name.startsWith('data-') && attr.name !== 'data-block-id') {
      metadata[attr.name.substring(5)] = attr.value;
    }
  }
  
  if (Object.keys(metadata).length > 0) {
    heading.metadata = metadata;
  }
  
  return heading;
}

function createListFromElement(element: HTMLElement, type: 'bullet_list' | 'ordered_list', blockId: string): DT.ListNode {
  const items: DT.ListItemNode[] = [];
  
  for (const childNode of Array.from(element.children)) {
    if (childNode.tagName.toLowerCase() === 'li') {
      items.push(createListItemFromElement(childNode as HTMLElement));
    }
  }
  
  const list = type === 'bullet_list' 
    ? Factory.createBulletList(items) 
    : Factory.createOrderedList(items);
  
  list.blockId = blockId;
  return list;
}

function createListItemFromElement(element: HTMLElement): DT.ListItemNode {
  const content: DT.Node[] = [];
  let hasBlock = false;
  
  // Process list item content
  for (const childNode of Array.from(element.childNodes)) {
    if (childNode.nodeType === Node.ELEMENT_NODE) {
      const el = childNode as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      
      // If the list item contains a block element like p, ul, ol
      if (['p', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tagName)) {
        hasBlock = true;
        const processedNode = processNode(childNode);
        if (processedNode) content.push(processedNode as DT.Node);
      } else {
        const inlineContent = createInlineContent(el);
        if (inlineContent) content.push(inlineContent as DT.Node);
      }
    } else if (childNode.nodeType === Node.TEXT_NODE) {
      const text = childNode.textContent?.trim();
      if (text) {
        content.push(Factory.createParagraph([Factory.createText(text)]));
      }
    }
  }
  
  // If no block elements were found, wrap text in a paragraph
  if (!hasBlock && element.textContent?.trim()) {
    content.push(Factory.createParagraph([Factory.createText(element.textContent)]));
  }
  
  const listItem = Factory.createListItem(content);
  const blockId = element.getAttribute('data-block-id');
  if (blockId) listItem.blockId = blockId;
  
  return listItem;
}

function createTableFromElement(element: HTMLElement, blockId: string): DT.TableNode {
  const rows: DT.TableRowNode[] = [];
  const isLayout = element.classList.contains('layout-table');
  
  // Process rows
  for (const rowElement of Array.from(element.querySelectorAll('tr'))) {
    const cells: DT.TableCellNode[] = [];
    
    // Process cells
    for (const cellElement of Array.from(rowElement.querySelectorAll('td, th'))) {
      const rowspan = cellElement.getAttribute('rowspan');
      const colspan = cellElement.getAttribute('colspan');
      
      const content: DT.Node[] = [];
      for (const child of Array.from(cellElement.childNodes)) {
        const processedNode = processNode(child);
        if (processedNode && 'type' in processedNode) {
          content.push(processedNode as DT.Node);
        }
      }
      
      // If no content was created, add an empty paragraph
      if (content.length === 0) {
        content.push(Factory.createParagraph([Factory.createText('')]));
      }
      
      const cell = Factory.createTableCell(content, {
        rowspan: rowspan ? parseInt(rowspan) : undefined,
        colspan: colspan ? parseInt(colspan) : undefined,
      });
      
      const cellBlockId = cellElement.getAttribute('data-block-id');
      if (cellBlockId) cell.blockId = cellBlockId;
      
      cells.push(cell);
    }
    
    const row = Factory.createTableRow(cells);
    const rowBlockId = rowElement.getAttribute('data-block-id');
    if (rowBlockId) row.blockId = rowBlockId;
    
    rows.push(row);
  }
  
  const table = Factory.createTable(rows, isLayout);
  table.blockId = blockId;
  
  return table;
}

function createImageFromElement(element: HTMLImageElement, blockId: string): DT.ImageNode {
  const src = element.src;
  const alt = element.alt || '';
  const title = element.title;
  const width = element.width ? `${element.width}px` : undefined;
  const height = element.height ? `${element.height}px` : undefined;
  
  const image = Factory.createImage(src, alt, {
    title,
    width,
    height,
  });
  
  image.blockId = blockId;
  
  return image;
}

function createBlockquoteFromElement(element: HTMLElement, blockId: string): DT.BlockquoteNode {
  const content: DT.Node[] = [];
  
  for (const child of Array.from(element.childNodes)) {
    const processedNode = processNode(child);
    if (processedNode && 'type' in processedNode) {
      content.push(processedNode as DT.Node);
    }
  }
  
  // If no content was created, add the text content
  if (content.length === 0 && element.textContent?.trim()) {
    content.push(Factory.createParagraph([Factory.createText(element.textContent)]));
  }
  
  const blockquote = Factory.createBlockquote(content);
  blockquote.blockId = blockId;
  
  return blockquote;
}

function createCodeBlockFromElement(element: HTMLElement, blockId: string): DT.CodeBlockNode {
  const content: DT.TextNode[] = [];
  let language = '';
  
  // Check for language class
  const codeElement = element.querySelector('code');
  if (codeElement) {
    // Try to extract language from class (e.g. language-javascript)
    for (const className of Array.from(codeElement.classList)) {
      if (className.startsWith('language-')) {
        language = className.substring(9);
        break;
      }
    }
    content.push(Factory.createText(codeElement.textContent || ''));
  } else {
    content.push(Factory.createText(element.textContent || ''));
  }
  
  const codeBlock = Factory.createCodeBlock(content, language);
  codeBlock.blockId = blockId;
  
  return codeBlock;
}

function createNodeFromDiv(element: HTMLElement, blockId: string): DT.Node {
  // Check for special div types like warning/info boxes
  if (element.style.backgroundColor) {
    let type: string | null = null;
    
    // Detect color to determine box type
    const bgColor = element.style.backgroundColor.toLowerCase();
    if (bgColor.includes('fef7cd')) type = 'warning';
    else if (bgColor.includes('e5deff')) type = 'safety';
    else if (bgColor.includes('d3e4fd')) type = 'info';
    
    if (type) {
      const content = processElementChildren(element);
      const paragraph = Factory.createParagraph(content);
      paragraph.attrs = { boxType: type };
      paragraph.blockId = blockId;
      return paragraph;
    }
  }
  
  // Process as regular container
  const content = processElementChildren(element);
  if (content.length === 0) {
    return Factory.createParagraph([]);
  } else if (content.length === 1) {
    return content[0] as DT.Node;
  } else {
    // Wrap multiple nodes in a paragraph if needed
    const paragraph = Factory.createParagraph(content);
    paragraph.blockId = blockId;
    return paragraph;
  }
}

function createInlineContent(element: HTMLElement): DT.TextNode | DT.Node | null {
  // Handle inline elements and extract text with marks
  const content = element.textContent || '';
  if (!content.trim()) return null;
  
  let textNode = Factory.createText(content);
  
  // Apply marks based on element type or style
  const tagName = element.tagName.toLowerCase();
  switch (tagName) {
    case 'strong':
    case 'b':
      textNode = Factory.addMarkToText(textNode, Factory.createMark('bold'));
      break;
    case 'em':
    case 'i':
      textNode = Factory.addMarkToText(textNode, Factory.createMark('italic'));
      break;
    case 'u':
      textNode = Factory.addMarkToText(textNode, Factory.createMark('underline'));
      break;
    case 'code':
      textNode = Factory.addMarkToText(textNode, Factory.createMark('code'));
      break;
    case 'a':
      const href = element.getAttribute('href');
      if (href) {
        textNode = Factory.addMarkToText(
          textNode, 
          Factory.createMark('link', { href })
        );
      }
      break;
    case 'span':
      // Check for special styling
      if (element.style.fontWeight === 'bold' || element.style.fontWeight === '700') {
        textNode = Factory.addMarkToText(textNode, Factory.createMark('bold'));
      }
      if (element.style.fontStyle === 'italic') {
        textNode = Factory.addMarkToText(textNode, Factory.createMark('italic'));
      }
      if (element.style.textDecoration === 'underline') {
        textNode = Factory.addMarkToText(textNode, Factory.createMark('underline'));
      }
      if (element.style.backgroundColor === '#FEF7CD') {
        textNode = Factory.addMarkToText(textNode, Factory.createMark('highlight'));
      }
      if (element.className === 'comment') {
        const comment = element.getAttribute('title') || '';
        textNode = Factory.addMarkToText(
          textNode, 
          Factory.createMark('comment', { text: comment })
        );
      }
      break;
  }
  
  return textNode;
}

function processElementChildren(element: HTMLElement): (DT.Node | DT.TextNode)[] {
  const content: (DT.Node | DT.TextNode)[] = [];
  
  for (const child of Array.from(element.childNodes)) {
    const processedNode = processNode(child);
    if (processedNode) {
      content.push(processedNode);
    }
  }
  
  return content;
}
