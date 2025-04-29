
import { v4 as uuidv4 } from 'uuid';
import * as DT from '@/utils/editor/model/documentTypes';
import { htmlToModel } from '@/utils/editor/model/htmlToModel';

export interface DocumentVersion {
  id: string;
  timestamp: string;
  model: DT.Doc;
  html: string;
  title: string;
  authorId: string;
  authorName: string;
  isAuto: boolean;
  label?: string;
  description?: string;
}

export interface VersionDiff {
  addedNodes: DT.TextNode[];
  removedNodes: DT.TextNode[];
  changedNodes: Array<{
    before: DT.TextNode;
    after: DT.TextNode;
  }>;
}

/**
 * Create a new document version
 */
export function createDocumentVersion(
  html: string,
  title: string,
  authorId: string,
  authorName: string,
  isAuto: boolean = false,
  label?: string,
  description?: string
): DocumentVersion {
  // Convert HTML to model for storage
  const model = htmlToModel(html);
  
  return {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    model,
    html,
    title,
    authorId,
    authorName,
    isAuto,
    label,
    description
  };
}

/**
 * Compare two document versions and identify differences
 */
export function compareVersions(oldVersion: DocumentVersion, newVersion: DocumentVersion): VersionDiff {
  const addedNodes: DT.TextNode[] = [];
  const removedNodes: DT.TextNode[] = [];
  const changedNodes: Array<{ before: DT.TextNode; after: DT.TextNode }> = [];
  
  // Extract all text nodes from both versions
  const oldTextNodes = extractTextNodes(oldVersion.model);
  const newTextNodes = extractTextNodes(newVersion.model);
  
  // Create lookup maps of text content to detect changes
  const oldContentMap = new Map<string, DT.TextNode[]>();
  const newContentMap = new Map<string, DT.TextNode[]>();
  
  // Index old text nodes by content
  oldTextNodes.forEach(node => {
    const key = getNodeSignature(node);
    if (!oldContentMap.has(key)) {
      oldContentMap.set(key, []);
    }
    oldContentMap.get(key)!.push(node);
  });
  
  // Index new text nodes by content
  newTextNodes.forEach(node => {
    const key = getNodeSignature(node);
    if (!newContentMap.has(key)) {
      newContentMap.set(key, []);
    }
    newContentMap.get(key)!.push(node);
  });
  
  // Find removed nodes (in old but not in new or fewer occurrences)
  oldContentMap.forEach((nodes, key) => {
    const newNodes = newContentMap.get(key) || [];
    if (newNodes.length < nodes.length) {
      // Some occurrences were removed
      const removedCount = nodes.length - newNodes.length;
      removedNodes.push(...nodes.slice(0, removedCount));
    }
  });
  
  // Find added nodes (in new but not in old or more occurrences)
  newContentMap.forEach((nodes, key) => {
    const oldNodes = oldContentMap.get(key) || [];
    if (oldNodes.length < nodes.length) {
      // Some occurrences were added
      const addedCount = nodes.length - oldNodes.length;
      addedNodes.push(...nodes.slice(0, addedCount));
    }
  });
  
  // Find changed nodes (text is similar but marks or other properties changed)
  oldTextNodes.forEach(oldNode => {
    const similarNewNodes = newTextNodes.filter(newNode => 
      areNodesSimilar(oldNode, newNode) && !areNodesEqual(oldNode, newNode)
    );
    
    similarNewNodes.forEach(newNode => {
      changedNodes.push({
        before: oldNode,
        after: newNode
      });
    });
  });
  
  return {
    addedNodes,
    removedNodes,
    changedNodes
  };
}

/**
 * Extract all text nodes from a document model
 */
function extractTextNodes(doc: DT.Doc): DT.TextNode[] {
  const textNodes: DT.TextNode[] = [];
  
  const processNode = (node: DT.Node | DT.TextNode): void => {
    if (node.type === 'text') {
      textNodes.push(node as DT.TextNode);
    } else if ('content' in node && node.content) {
      node.content.forEach(processNode);
    }
  };
  
  if (doc.content) {
    doc.content.forEach(processNode);
  }
  
  return textNodes;
}

/**
 * Generate a signature for a node to help with comparison
 */
function getNodeSignature(node: DT.TextNode): string {
  // For text nodes, use the text content as the key
  return node.text;
}

/**
 * Check if two nodes are similar (have similar content but maybe different formatting)
 */
function areNodesSimilar(node1: DT.TextNode, node2: DT.TextNode): boolean {
  // Text nodes are similar if they have the same text content
  // This is a simplified version - you could use more sophisticated comparison
  return node1.text === node2.text;
}

/**
 * Check if two nodes are completely equal
 */
function areNodesEqual(node1: DT.TextNode, node2: DT.TextNode): boolean {
  // Basic equality check
  if (node1.text !== node2.text) {
    return false;
  }
  
  // Check if marks are the same
  const marks1 = node1.marks || [];
  const marks2 = node2.marks || [];
  
  if (marks1.length !== marks2.length) {
    return false;
  }
  
  // Compare each mark
  for (let i = 0; i < marks1.length; i++) {
    const mark1 = marks1[i];
    const mark2 = marks2[i];
    
    if (mark1.type !== mark2.type) {
      return false;
    }
    
    // Compare attributes if they exist
    if (mark1.attrs || mark2.attrs) {
      const attrs1 = mark1.attrs || {};
      const attrs2 = mark2.attrs || {};
      
      // Simple comparison of attribute objects
      if (JSON.stringify(attrs1) !== JSON.stringify(attrs2)) {
        return false;
      }
    }
  }
  
  return true;
}
