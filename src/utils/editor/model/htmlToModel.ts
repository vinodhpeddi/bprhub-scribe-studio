
import * as DT from './documentTypes';
import * as Factory from './documentFactory';
import { processNode } from './parsers/elementParsers';

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
    if (processedNode && 'type' in processedNode) {
      blocks.push(processedNode as DT.Node);
    }
  }
  
  return Factory.createDoc(blocks);
}
