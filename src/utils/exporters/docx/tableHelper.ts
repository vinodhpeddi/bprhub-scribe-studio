
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

export const processTable = (element: HTMLElement, sections: any[]) => {
  const rows = element.querySelectorAll('tr');
  const tableRows = [];
  const isLayoutTable = element.classList.contains('layout-table');
  
  for (const row of Array.from(rows)) {
    const cells = row.querySelectorAll('td, th');
    const tableCells = Array.from(cells).map(cell => {
      const cellElement = cell as HTMLElement;
      const backgroundColor = cellElement.style?.backgroundColor;
      const borderColor = cellElement.style?.borderColor || '#000000';
      
      // Process cell content
      const cellContent: any[] = [];
      Array.from(cellElement.childNodes).forEach(node => {
        processNodeToDocx(node, cellContent);
      });
      
      if (cellContent.length === 0) {
        cellContent.push(new Paragraph({ text: '' }));
      }

      return new TableCell({
        children: cellContent,
        shading: backgroundColor ? {
          fill: convertColor(backgroundColor),
          type: ShadingType.SOLID,
        } : undefined,
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          left: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
          right: { style: BorderStyle.SINGLE, size: 1, color: borderColor },
        },
        margins: {
          top: 100,
          bottom: 100,
          left: 100,
          right: 100,
        },
        width: {
          size: Math.floor(100 / cells.length),
          type: WidthType.PERCENTAGE,
        },
      });
    });

    if (tableCells.length > 0) {
      tableRows.push(new TableRow({ children: tableCells }));
    }
  }

  if (tableRows.length > 0) {
    sections.push(new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      margins: {
        top: 100,
        bottom: 100,
        left: 100,
        right: 100,
      },
    }));
    sections.push(new Paragraph({ text: "" }));
  }
};
