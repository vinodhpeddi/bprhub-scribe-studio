
import { v4 as uuidv4 } from 'uuid';
import * as DT from './documentTypes';
import { htmlToModel } from './htmlToModel';
import { modelToHtml } from './modelToHtml';

/**
 * Utilities to track and sync changes between the model and DOM
 */

interface SyncOptions {
  updateDOM: boolean;
  updateModel: boolean;
}

export class DocumentSync {
  private model: DT.Doc;
  private editorRef: React.RefObject<HTMLDivElement>;
  private isProcessing: boolean = false;
  private observer: MutationObserver | null = null;
  private onModelChange: (model: DT.Doc) => void;
  private onHtmlChange: (html: string) => void;
  
  constructor(
    editorRef: React.RefObject<HTMLDivElement>,
    initialContent: string,
    onModelChange: (model: DT.Doc) => void,
    onHtmlChange: (html: string) => void
  ) {
    this.editorRef = editorRef;
    this.model = initialContent ? htmlToModel(initialContent) : { type: 'doc', content: [], version: '1.0' };
    this.onModelChange = onModelChange;
    this.onHtmlChange = onHtmlChange;
  }
  
  initialize() {
    if (this.observer) {
      this.disconnect();
    }
    
    // Set up observer to track DOM changes
    this.observer = new MutationObserver(mutations => {
      if (this.isProcessing) return;
      this.handleDOMChange(mutations);
    });
    
    if (this.editorRef.current) {
      this.observer.observe(this.editorRef.current, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['data-block-id']
      });
      
      // Initial render
      this.render();
    }
  }
  
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  render() {
    if (!this.editorRef.current) return;
    
    this.isProcessing = true;
    try {
      const html = modelToHtml(this.model);
      this.editorRef.current.innerHTML = html;
      this.onHtmlChange(html);
    } finally {
      this.isProcessing = false;
    }
  }
  
  getModel(): DT.Doc {
    return this.model;
  }
  
  updateModel(newModel: DT.Doc, options: SyncOptions = { updateDOM: true, updateModel: true }) {
    this.model = newModel;
    
    if (options.updateDOM) {
      this.render();
    }
    
    if (options.updateModel) {
      this.onModelChange(newModel);
    }
  }
  
  handleDOMChange(mutations: MutationRecord[]) {
    if (!this.editorRef.current) return;
    
    this.isProcessing = true;
    try {
      // Extract the current HTML and convert to model
      const newModel = htmlToModel(this.editorRef.current.innerHTML);
      
      // Ensure all blocks have IDs
      this.ensureBlockIds(newModel);
      
      // Update the model
      this.model = newModel;
      this.onModelChange(newModel);
    } finally {
      this.isProcessing = false;
    }
  }
  
  applyAction(action: EditorAction) {
    this.isProcessing = true;
    try {
      const newModel = this.executeAction(action);
      this.updateModel(newModel);
    } finally {
      this.isProcessing = false;
    }
  }
  
  private executeAction(action: EditorAction): DT.Doc {
    switch (action.type) {
      case 'toggle_mark':
        return this.toggleMark(action);
      case 'set_block_type':
        return this.setBlockType(action);
      case 'insert_block':
        return this.insertBlock(action);
      case 'delete_block':
        return this.deleteBlock(action);
      case 'update_text':
        return this.updateText(action);
      default:
        return this.model;
    }
  }
  
  private toggleMark(action: ToggleMarkAction): DT.Doc {
    // Implementation for toggling marks on selected text
    // This would use the current selection to find the affected blocks
    // and toggle the specified mark on/off
    return this.model; // Placeholder
  }
  
  private setBlockType(action: SetBlockTypeAction): DT.Doc {
    // Implementation for changing a block's type
    return this.model; // Placeholder  
  }
  
  private insertBlock(action: InsertBlockAction): DT.Doc {
    // Implementation for inserting a new block
    return this.model; // Placeholder
  }
  
  private deleteBlock(action: DeleteBlockAction): DT.Doc {
    // Implementation for deleting a block
    return this.model; // Placeholder
  }
  
  private updateText(action: UpdateTextAction): DT.Doc {
    // Implementation for updating text in a block
    return this.model; // Placeholder
  }
  
  private ensureBlockIds(doc: DT.Doc): void {
    if (doc.content) {
      doc.content.forEach(this.ensureNodeBlockId);
    }
  }
  
  private ensureNodeBlockId = (node: DT.Node | DT.TextNode) => {
    if ('type' in node && node.type !== 'text') {
      if (!node.blockId) {
        node.blockId = uuidv4();
      }
      
      if (node.content) {
        node.content.forEach(this.ensureNodeBlockId);
      }
    }
  };
}

// Action types for model manipulation

export type EditorAction = 
  | ToggleMarkAction
  | SetBlockTypeAction
  | InsertBlockAction
  | DeleteBlockAction
  | UpdateTextAction;

export interface ToggleMarkAction {
  type: 'toggle_mark';
  markType: DT.MarkType;
  selection: DT.DocumentSelection;
  attrs?: Record<string, any>;
}

export interface SetBlockTypeAction {
  type: 'set_block_type';
  blockType: DT.NodeType;
  blockId: string;
  attrs?: Record<string, any>;
}

export interface InsertBlockAction {
  type: 'insert_block';
  block: DT.Node;
  position: 'before' | 'after' | 'child';
  referenceBlockId?: string; // If not provided, insert at end
}

export interface DeleteBlockAction {
  type: 'delete_block';
  blockId: string;
}

export interface UpdateTextAction {
  type: 'update_text';
  blockId: string;
  path: number[]; // Path to the text node
  text: string;
}
