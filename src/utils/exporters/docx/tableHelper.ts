
import { Table, TableRow, TableCell, Paragraph, BorderStyle, WidthType } from 'docx';

export const processTableCell = (cell: Element, cellChildren: any[]) => {
  if (cell.childNodes.length === 0 && (!cell.textContent || !cell.textContent.trim())) {
    cellChildren.push(new Paragraph(""));
    return;
  }

  if (cell.hasChildNodes()) {
    Array.from(cell.childNodes).forEach(childNode => {
      if (childNode.nodeType === Node.TEXT_NODE && childNode.textContent?.trim()) {
        cellChildren.push(new Paragraph({ text: childNode.textContent }));
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const element = childNode as HTMLElement;
        if (element.tagName === 'P' || element.tagName === 'DIV') {
          cellChildren.push(new Paragraph({ text: element.textContent || '' }));
        }
      }
    });
  }

  if (cellChildren.length === 0) {
    cellChildren.push(new Paragraph(""));
  }
};

export const processTable = (element: HTMLElement, sections: any[]) => {
  const rows = element.querySelectorAll('tr');
  const tableRows = [];
  const isLayoutTable = element.classList.contains('layout-table');
  
  for (const row of Array.from(rows)) {
    const cells = row.querySelectorAll('td, th');
    if (cells.length === 0) continue;

    const tableCells = Array.from(cells).map(cell => {
      const cellChildren: any[] = [];
      processTableCell(cell, cellChildren);

      return new TableCell({
        children: cellChildren,
        borders: isLayoutTable ? {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE }
        } : undefined
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
      }
    }));
    sections.push(new Paragraph(""));
  }
};
