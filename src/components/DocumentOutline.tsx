
import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { parseDocumentOutline, countElements } from '@/utils/editorUtils';

interface DocumentOutlineProps {
  content: string;
  editorRef?: React.RefObject<HTMLDivElement>;
}

const DocumentOutline: React.FC<DocumentOutlineProps> = ({ content, editorRef }) => {
  const headings = parseDocumentOutline(content);
  const stats = countElements(content);

  const scrollToHeading = (id: string) => {
    if (!editorRef?.current) return;
    
    const element = editorRef.current.querySelector(`[data-heading-id="${id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a brief highlight effect
      element.classList.add('bg-editor-soft-purple');
      setTimeout(() => {
        element.classList.remove('bg-editor-soft-purple');
      }, 1000);
    }
  };

  // Add heading IDs to the editor content when the outline is updated
  useEffect(() => {
    if (!editorRef?.current) return;
    
    const headingElements = editorRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headingElements.forEach((element, index) => {
      const headingText = element.textContent || '';
      const headingId = `heading-${index}-${headingText.toLowerCase().replace(/\s+/g, '-')}`;
      element.setAttribute('data-heading-id', headingId);
    });
  }, [content, editorRef]);

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
                className="py-1 px-2 rounded hover:bg-editor-soft-purple cursor-pointer text-sm truncate transition-colors"
                onClick={() => scrollToHeading(heading.id)}
                title={heading.text}
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
