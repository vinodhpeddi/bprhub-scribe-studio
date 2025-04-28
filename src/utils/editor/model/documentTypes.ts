
/**
 * Type definitions for the JSON document model
 */

export type NodeType = 
  | 'doc' 
  | 'paragraph'
  | 'heading'
  | 'text'
  | 'bullet_list'
  | 'ordered_list'
  | 'list_item'
  | 'table'
  | 'table_row'
  | 'table_cell'
  | 'image'
  | 'code_block'
  | 'blockquote'
  | 'hard_break'
  | 'horizontal_rule';

export type MarkType = 
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'link'
  | 'highlight'
  | 'comment';

export interface Mark {
  type: MarkType;
  attrs?: Record<string, any>;
}

export interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
}

export interface Node {
  type: NodeType;
  attrs?: Record<string, any>;
  content?: (Node | TextNode)[];
  blockId?: string;
  metadata?: Record<string, any>;
}

export interface Doc extends Node {
  type: 'doc';
  content: Node[];
  version: string;
}

export interface ListNode extends Node {
  type: 'bullet_list' | 'ordered_list';
  content: ListItemNode[];
}

export interface ListItemNode extends Node {
  type: 'list_item';
  content: Node[];
}

export interface TableNode extends Node {
  type: 'table';
  content: TableRowNode[];
  attrs: {
    width?: string;
    layout?: boolean; // true for layout table, false for data table
  };
}

export interface TableRowNode extends Node {
  type: 'table_row';
  content: TableCellNode[];
}

export interface TableCellNode extends Node {
  type: 'table_cell';
  content: Node[];
  attrs?: {
    rowspan?: number;
    colspan?: number;
  };
}

export interface HeadingNode extends Node {
  type: 'heading';
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ImageNode extends Node {
  type: 'image';
  attrs: {
    src: string;
    alt?: string;
    title?: string;
    width?: string;
    height?: string;
  };
}

export interface BlockquoteNode extends Node {
  type: 'blockquote';
}

export interface HorizontalRuleNode extends Node {
  type: 'horizontal_rule';
}

export interface CodeBlockNode extends Node {
  type: 'code_block';
  attrs?: {
    language?: string;
  };
}

export interface DocumentSelection {
  anchorPath: number[];
  anchorOffset: number;
  focusPath: number[];
  focusOffset: number;
}
