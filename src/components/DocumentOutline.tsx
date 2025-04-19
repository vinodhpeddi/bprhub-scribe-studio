
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { parseDocumentOutline, countElements } from '@/utils/editorUtils';

interface DocumentOutlineProps {
  content: string;
}

const DocumentOutline: React.FC<DocumentOutlineProps> = ({ content }) => {
  const headings = parseDocumentOutline(content);
  const stats = countElements(content);

  return (
    <div className="border rounded-md h-full flex flex-col bg-white">
      <div className="p-4 font-semibold bg-editor-soft-gray border-b">
        Document Outline
      </div>
      
      <ScrollArea className="flex-grow p-4">
        {headings.length > 0 ? (
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li 
                key={heading.id} 
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                className="py-1 px-2 rounded hover:bg-editor-soft-purple cursor-pointer text-sm truncate"
              >
                {heading.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No headings found in document</p>
        )}
      </ScrollArea>

      <Separator />
      
      <div className="p-4">
        <h3 className="font-semibold mb-2 text-sm">Document Statistics</h3>
        <ul className="text-xs space-y-1 text-muted-foreground">
          <li className="flex justify-between">
            <span>Words:</span> 
            <span className="font-medium">{stats.words}</span>
          </li>
          <li className="flex justify-between">
            <span>Paragraphs:</span> 
            <span className="font-medium">{stats.paragraphs}</span>
          </li>
          <li className="flex justify-between">
            <span>Tables:</span> 
            <span className="font-medium">{stats.tables}</span>
          </li>
          <li className="flex justify-between">
            <span>Lists:</span> 
            <span className="font-medium">{stats.lists}</span>
          </li>
          <li className="flex justify-between">
            <span>Images:</span> 
            <span className="font-medium">{stats.images}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentOutline;
