import React from 'react';
import { Button } from './ui/button';
import { Table, TableIcon } from 'lucide-react';

interface TablePropertiesProps {
  table: HTMLTableElement;
  onClose: () => void;
}

export const TableProperties: React.FC<TablePropertiesProps> = ({ table, onClose }) => {
  const insertRow = () => {
    const rows = table.rows;
    const newRow = table.insertRow(rows.length);
    const cells = rows[0].cells.length;
    
    for (let i = 0; i < cells; i++) {
      const cell = newRow.insertCell(i);
      cell.innerHTML = '&nbsp;';
      if (table.classList.contains('layout-table')) {
        cell.style.border = 'none';
        cell.style.padding = '8px';
      }
    }
  };

  const insertColumn = () => {
    const rows = table.rows;
    
    for (let i = 0; i < rows.length; i++) {
      const cell = rows[i].insertCell(rows[i].cells.length);
      cell.innerHTML = '&nbsp;';
      if (table.classList.contains('layout-table')) {
        cell.style.border = 'none';
        cell.style.padding = '8px';
      }
    }
  };

  return (
    <div className="bg-white border rounded-md p-2 mb-2 flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={insertRow}
        className="flex items-center gap-1"
      >
        <TableIcon size={16} />
        Add Row
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={insertColumn}
        className="flex items-center gap-1"
      >
        <TableIcon size={16} />
        Add Column
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
      >
        Done
      </Button>
    </div>
  );
};
