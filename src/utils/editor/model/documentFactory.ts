
import { v4 as uuidv4 } from 'uuid';
import * as DT from './documentTypes';

/**
 * Factories to create document model nodes
 */

export function createDoc(content: DT.Node[] = []): DT.Doc {
  return {
    type: 'doc',
    content,
    version: '1.0',
  };
}

export function createParagraph(content: (DT.Node | DT.TextNode)[] = [], attrs: Record<string, any> = {}): DT.Node {
  return {
    type: 'paragraph',
    content,
    attrs,
    blockId: uuidv4(),
  };
}

export function createText(text: string, marks: DT.Mark[] = []): DT.TextNode {
  return {
    type: 'text',
    text,
    marks: marks.length > 0 ? marks : undefined,
  };
}

export function createHeading(
  level: 1 | 2 | 3 | 4 | 5 | 6, 
  content: (DT.Node | DT.TextNode)[] = []
): DT.HeadingNode {
  return {
    type: 'heading',
    attrs: { level },
    content,
    blockId: uuidv4(),
  } as DT.HeadingNode;
}

export function createBulletList(items: DT.ListItemNode[] = []): DT.ListNode {
  return {
    type: 'bullet_list',
    content: items,
    blockId: uuidv4(),
  } as DT.ListNode;
}

export function createOrderedList(items: DT.ListItemNode[] = []): DT.ListNode {
  return {
    type: 'ordered_list',
    content: items,
    blockId: uuidv4(),
  } as DT.ListNode;
}

export function createListItem(content: DT.Node[] = []): DT.ListItemNode {
  return {
    type: 'list_item',
    content,
    blockId: uuidv4(),
  } as DT.ListItemNode;
}

export function createTable(rows: DT.TableRowNode[] = [], isLayout: boolean = false): DT.TableNode {
  return {
    type: 'table',
    content: rows,
    attrs: {
      width: '100%',
      layout: isLayout,
    },
    blockId: uuidv4(),
  } as DT.TableNode;
}

export function createTableRow(cells: DT.TableCellNode[] = []): DT.TableRowNode {
  return {
    type: 'table_row',
    content: cells,
    blockId: uuidv4(),
  } as DT.TableRowNode;
}

export function createTableCell(content: DT.Node[] = [], attrs: { rowspan?: number, colspan?: number } = {}): DT.TableCellNode {
  return {
    type: 'table_cell',
    content,
    attrs,
    blockId: uuidv4(),
  } as DT.TableCellNode;
}

export function createImage(src: string, alt: string = '', attrs: Record<string, any> = {}): DT.ImageNode {
  return {
    type: 'image',
    attrs: { 
      src,
      alt,
      ...attrs
    },
    blockId: uuidv4(),
  } as DT.ImageNode;
}

export function createCodeBlock(content: (DT.Node | DT.TextNode)[] = [], language: string = ''): DT.CodeBlockNode {
  return {
    type: 'code_block',
    content,
    attrs: { language },
    blockId: uuidv4(),
  } as DT.CodeBlockNode;
}

export function createBlockquote(content: DT.Node[] = []): DT.BlockquoteNode {
  return {
    type: 'blockquote',
    content,
    blockId: uuidv4(),
  } as DT.BlockquoteNode;
}

export function createHorizontalRule(): DT.HorizontalRuleNode {
  return {
    type: 'horizontal_rule',
    blockId: uuidv4(),
  } as DT.HorizontalRuleNode;
}

export function createMark(type: DT.MarkType, attrs: Record<string, any> = {}): DT.Mark {
  return {
    type,
    attrs: Object.keys(attrs).length > 0 ? attrs : undefined,
  };
}

export function addMarkToText(textNode: DT.TextNode, mark: DT.Mark): DT.TextNode {
  const marks = textNode.marks || [];
  // Avoid duplicate marks of the same type
  const filteredMarks = marks.filter(m => m.type !== mark.type);
  return {
    ...textNode,
    marks: [...filteredMarks, mark],
  };
}

export function removeMarkFromText(textNode: DT.TextNode, markType: DT.MarkType): DT.TextNode {
  if (!textNode.marks || textNode.marks.length === 0) {
    return textNode;
  }
  
  const newMarks = textNode.marks.filter(mark => mark.type !== markType);
  return {
    ...textNode,
    marks: newMarks.length > 0 ? newMarks : undefined,
  };
}

// Helper to ensure a node has a blockId
export function ensureBlockId(node: DT.Node): DT.Node {
  if (node.blockId) return node;
  return {
    ...node,
    blockId: uuidv4(),
  };
}
