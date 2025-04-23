
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ImportModalError: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-800 text-sm">
    <div className="flex items-start">
      <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
      <div>
        <p className="font-medium">Import error</p>
        <p className="mt-1">{message}</p>
      </div>
    </div>
  </div>
);

export default ImportModalError;
