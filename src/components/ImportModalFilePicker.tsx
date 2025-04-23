
import React from 'react';
import { Upload, FileSymlink } from 'lucide-react';

interface ImportModalFilePickerProps {
  selectedFile: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBrowseClick: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

const ImportModalFilePicker: React.FC<ImportModalFilePickerProps> = ({
  selectedFile,
  onFileSelect,
  onBrowseClick,
  onDrop,
  onDragOver,
  fileInputRef,
}) => {
  return (
    <div 
      className="border-2 border-dashed rounded-lg p-10 text-center hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onBrowseClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept=".docx,.pdf,.html,.htm,.txt"
      />
      <Upload className="h-10 w-10 mx-auto mb-2 text-gray-400" />
      {selectedFile ? (
        <div className="mt-2">
          <p className="font-medium">Selected file:</p>
          <p className="text-sm text-gray-600 mt-1">{selectedFile.name}</p>
        </div>
      ) : (
        <div>
          <p className="font-medium">Click to select a file</p>
          <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
          <p className="text-xs text-gray-400 mt-2">Supports Word, PDF, HTML, and text files</p>
        </div>
      )}

      <div className="space-y-2 mt-8">
        <h3 className="text-sm font-medium">Supported formats:</h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2 text-sm">
            <FileSymlink className="h-4 w-4 text-blue-500" />
            <span>Word (.docx)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileSymlink className="h-4 w-4 text-red-500" />
            <span>PDF (.pdf)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileSymlink className="h-4 w-4 text-orange-500" />
            <span>HTML (.html, .htm)</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileSymlink className="h-4 w-4 text-gray-500" />
            <span>Text (.txt)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModalFilePicker;
