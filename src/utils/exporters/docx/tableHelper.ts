
import { Table, TableRow, TableCell, Paragraph, BorderStyle, WidthType, ShadingType } from 'docx';
import { processNodeToDocx } from '../docxHelpers';

// Convert HTML color to docx color
const convertColor = (color: string): string | undefined => {
  if (!color) return undefined;
  
  if (color.startsWith('rgb')) {
    const rgb = color.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      return '#' + [0, 1, 2].map(i => {
        const hex = parseInt(rgb[i], 10).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    }
  }
  return color;
};

export const processTableCell = (cell: Element) => {
  const cellChildren: any[] = [];
  
  if (cell.childNodes.length === 0 && (!cell.textContent || !cell.textContent.trim())) {
    cellChildren.push(new Paragraph(""));
    return cellChildren;
  }

  // Process each child node to maintain formatting
  Array.from(cell.childNodes).forEach(childNode => {
    if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent?.trim()) {
      cellChildren.push(new Paragraph({ text: childNode.textContent }));
    } else if (childNode.nodeType === Node.ELEMENT_NODE) {
      const element = childNode as HTMLElement;
      const sections: any[] = [];
      
      processNodeToDocx(element, sections);
      
      if (sections.length > 0) {
        sections.forEach(section => cellChildren.push(section));
      } else if (element.textContent?.trim()) {
        cellChildren.push(new Paragraph({ text: element.textContent }));
      }
    }
  });

  if (cellChildren.length === 0) {
    cellChildren.push(new Paragraph(""));
  }
  
  return cellChildren;
};

export const processTable = (element: HTMLElement, sections: any[]) => {
  const rows = element.querySelectorAll('tr');
  const tableRows = [];
  const isLayoutTable = element.classList.contains('layout-table');
  
  for (const row of Array.from(rows)) {
    const cells = row.querySelectorAll('td, th');
    if (cells.length === 0) continue;

    const tableCells = Array.from(cells).map(cell => {
      const cellElement = cell as HTMLElement;
      const cellChildren = processTableCell(cellElement);
      
      // Extract cell styling
      const backgroundColor = cellElement.style?.backgroundColor;
      const borderWidth = cellElement.style?.borderWidth;
      const borderColor = cellElement.style?.borderColor;
      
      return new TableCell({
        children: cellChildren,
        shading: backgroundColor ? {
          fill: convertColor(backgroundColor),
          type: ShadingType.SOLID,
        } : undefined,
        borders: isLayoutTable ? {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        } : {
          top: { style: borderWidth ? BorderStyle.SINGLE : BorderStyle.SINGLE, size: 1, color: convertColor(borderColor) || "#000000" },
          bottom: { style: borderWidth ? BorderStyle.SINGLE : BorderStyle.SINGLE, size: 1, color: convertColor(borderColor) || "#000000" },
          left: { style: borderWidth ? BorderStyle.SINGLE : BorderStyle.SINGLE, size: 1, color: convertColor(borderColor) || "#000000" },
          right: { style: borderWidth ? BorderStyle.SINGLE : BorderStyle.SINGLE, size: 1, color: convertColor(borderColor) || "#000000" }
        },
        verticalAlign: cellElement.style?.verticalAlign === 'top' ? 'top' : 
                       cellElement.style?.verticalAlign === 'bottom' ? 'bottom' : 'center'
      });
    });

    if (tableCells.length > 0) {
      tableRows.push(new TableRow({
        children: tableCells
      }));
    }
  }

  if (tableRows.length > 0) {
    sections.push(new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      // Add table borders if not a layout table
      borders: isLayoutTable ? undefined : {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 }
      }
    }));
    sections.push(new Paragraph(""));
  }
};
