
import * as DT from './documentTypes';

/**
 * Convert document model to HTML string
 */
export function modelToHtml(doc: DT.Doc): string {
  if (!doc.content || doc.content.length === 0) {
    return '';
  }

  return doc.content.map(node => renderNode(node)).join('');
}

function renderNode(node: DT.Node | DT.TextNode): string {
  switch (node.type) {
    case 'text':
      return renderTextNode(node as DT.TextNode);
    case 'paragraph':
      return renderParagraph(node);
    case 'heading':
      return renderHeading(node as DT.HeadingNode);
    case 'bullet_list':
      return renderBulletList(node as DT.ListNode);
    case 'ordered_list':
      return renderOrderedList(node as DT.ListNode);
    case 'list_item':
      return renderListItem(node as DT.ListItemNode);
    case 'table':
      return renderTable(node as DT.TableNode);
    case 'table_row':
      return renderTableRow(node as DT.TableRowNode);
    case 'table_cell':
      return renderTableCell(node as DT.TableCellNode);
    case 'image':
      return renderImage(node as DT.ImageNode);
    case 'code_block':
      return renderCodeBlock(node as DT.CodeBlockNode);
    case 'blockquote':
      return renderBlockquote(node as DT.BlockquoteNode);
    case 'horizontal_rule':
      return renderHorizontalRule();
    default:
      return '';
  }
}

function renderTextNode(node: DT.TextNode): string {
  let text = escapeHtml(node.text);
  
  // If there are no marks, return the text as is
  if (!node.marks || node.marks.length === 0) {
    return text;
  }
  
  // Apply marks inside-out
  let html = text;
  const sortedMarks = [...(node.marks || [])].sort((a, b) => {
    // Define rendering order (innermost first)
    const order: Record<string, number> = {
      'code': 1, 
      'bold': 2, 
      'italic': 3, 
      'underline': 4, 
      'strike': 5, 
      'highlight': 6, 
      'comment': 7, 
      'link': 8
    };
    return (order[a.type] || 99) - (order[b.type] || 99);
  });
  
  // Apply each mark
  for (const mark of sortedMarks) {
    html = applyMark(html, mark);
  }
  
  return html;
}

function applyMark(content: string, mark: DT.Mark): string {
  switch (mark.type) {
    case 'bold':
      return `<strong class="text-bold">${content}</strong>`;
    case 'italic':
      return `<em class="text-italic">${content}</em>`;
    case 'underline':
      return `<u class="text-underline">${content}</u>`;
    case 'strike':
      return `<s class="text-strike">${content}</s>`;
    case 'code':
      return `<code class="text-code">${content}</code>`;
    case 'link':
      const href = mark.attrs?.href || '';
      return `<a href="${href}" class="text-link">${content}</a>`;
    case 'highlight':
      return `<span class="text-highlight" style="background-color: #FEF7CD;">${content}</span>`;
    case 'comment':
      const commentText = mark.attrs?.text || '';
      return `<span class="comment" title="${escapeHtml(commentText)}" style="background-color: #FEF7CD; cursor: help;">${content}</span>`;
    default:
      return content;
  }
}

function renderParagraph(node: DT.Node): string {
  if (node.attrs?.boxType) {
    // Special case for info/warning boxes
    const boxType = node.attrs.boxType;
    let style = '';
    let icon = '';
    let textColor = '';
    let className = '';
    
    switch (boxType) {
      case 'warning':
        style = 'background-color: #FEF7CD; border: 1px solid #EAB308; border-radius: 4px; padding: 12px; margin: 8px 0;';
        textColor = 'color: #854D0E;';
        icon = '⚠️ Warning:';
        className = 'box-warning';
        break;
      case 'safety':
        style = 'background-color: #E5DEFF; border: 1px solid #6E59A5; border-radius: 4px; padding: 12px; margin: 8px 0;';
        textColor = 'color: #1A1F2C;';
        icon = '🛡️ Safety Note:';
        className = 'box-safety';
        break;
      case 'info':
        style = 'background-color: #D3E4FD; border: 1px solid #0EA5E9; border-radius: 4px; padding: 12px; margin: 8px 0;';
        textColor = 'color: #0C4A6E;';
        icon = 'ℹ️ Note:';
        className = 'box-info';
        break;
    }
    
    const content = node.content ? node.content.map(renderNode).join('') : '';
    return `<div class="${className}" style="${style}" data-block-id="${node.blockId || ''}">
      <p class="box-content" style="${textColor} margin: 0;"><strong>${icon}</strong> ${content}</p>
    </div>`;
  }
  
  const content = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<p class="editor-paragraph" data-block-id="${node.blockId || ''}" ${metadata}>${content}</p>`;
}

function renderHeading(node: DT.HeadingNode): string {
  const level = node.attrs.level;
  const content = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<h${level} class="editor-heading heading-${level}" data-block-id="${node.blockId || ''}" ${metadata}>${content}</h${level}>`;
}

function renderBulletList(node: DT.ListNode): string {
  const items = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<ul class="bullet-list" data-block-id="${node.blockId || ''}" ${metadata}>${items}</ul>`;
}

function renderOrderedList(node: DT.ListNode): string {
  const items = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<ol class="ordered-list" data-block-id="${node.blockId || ''}" ${metadata}>${items}</ol>`;
}

function renderListItem(node: DT.ListItemNode): string {
  const content = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<li class="list-item" data-block-id="${node.blockId || ''}" ${metadata}>${content}</li>`;
}

function renderTable(node: DT.TableNode): string {
  const rows = node.content ? node.content.map(renderNode).join('') : '';
  const isLayout = node.attrs?.layout;
  const tableClass = isLayout ? 'layout-table table' : 'data-table table';
  const styleAttr = node.attrs?.width ? ` style="border-collapse: collapse; width: ${node.attrs.width};"` : ' style="border-collapse: collapse; width: 100%;"';
  const metadata = renderMetadata(node);
  
  return `<table class="${tableClass}"${styleAttr} data-block-id="${node.blockId || ''}" ${metadata}>${rows}</table>`;
}

function renderTableRow(node: DT.TableRowNode): string {
  const cells = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<tr class="table-row" data-block-id="${node.blockId || ''}" ${metadata}>${cells}</tr>`;
}

function renderTableCell(node: DT.TableCellNode): string {
  const content = node.content ? node.content.map(renderNode).join('') : '';
  const rowspan = node.attrs?.rowspan ? ` rowspan="${node.attrs.rowspan}"` : '';
  const colspan = node.attrs?.colspan ? ` colspan="${node.attrs.colspan}"` : '';
  const metadata = renderMetadata(node);
  
  // Determine if this is a layout table cell (no borders) or regular table cell
  const parentTable = getParentTable(node);
  const isLayout = parentTable?.attrs?.layout;
  
  const style = isLayout 
    ? 'border: none; padding: 8px;' 
    : 'border: 1px solid #ddd; padding: 8px;';
  const cellClass = isLayout ? 'layout-cell table-cell' : 'data-cell table-cell';
  
  return `<td class="${cellClass}" style="${style}" data-block-id="${node.blockId || ''}"${rowspan}${colspan} ${metadata}>${content}</td>`;
}

function getParentTable(node: DT.Node): DT.TableNode | null {
  // This is a placeholder - in a real implementation, we would track parent nodes
  // For now, we'll use a simple check of the node's metadata
  return node.metadata?.parentTable || null;
}

function renderImage(node: DT.ImageNode): string {
  const src = node.attrs.src;
  const alt = node.attrs.alt || '';
  const title = node.attrs.title ? ` title="${node.attrs.title}"` : '';
  const width = node.attrs.width ? ` width="${node.attrs.width}"` : '';
  const height = node.attrs.height ? ` height="${node.attrs.height}"` : '';
  const style = 'max-width: 100%; height: auto; margin: 10px 0;';
  const metadata = renderMetadata(node);
  
  return `<img class="editor-image" src="${src}" alt="${alt}"${title}${width}${height} style="${style}" data-block-id="${node.blockId || ''}" ${metadata}>`;
}

function renderCodeBlock(node: DT.CodeBlockNode): string {
  const content = node.content ? node.content.map(n => (n as DT.TextNode).text).join('') : '';
  const language = node.attrs?.language || '';
  const languageClass = language ? ` language-${language}` : '';
  const metadata = renderMetadata(node);
  
  return `<pre class="code-block" data-block-id="${node.blockId || ''}" ${metadata}><code class="code-content${languageClass}">${escapeHtml(content)}</code></pre>`;
}

function renderBlockquote(node: DT.BlockquoteNode): string {
  const content = node.content ? node.content.map(renderNode).join('') : '';
  const metadata = renderMetadata(node);
  
  return `<blockquote class="editor-blockquote" data-block-id="${node.blockId || ''}" ${metadata}>${content}</blockquote>`;
}

function renderHorizontalRule(): string {
  return '<hr class="editor-hr">';
}

function renderMetadata(node: DT.Node): string {
  if (!node.metadata || Object.keys(node.metadata).length === 0) {
    return '';
  }
  
  const attrs: string[] = [];
  for (const [key, value] of Object.entries(node.metadata)) {
    if (typeof value === 'string') {
      attrs.push(`data-${key}="${escapeHtml(value)}"`);
    } else {
      attrs.push(`data-${key}="${escapeHtml(JSON.stringify(value))}"`);
    }
  }
  
  return attrs.join(' ');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
