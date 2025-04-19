
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllDocuments, UserDocument, deleteDocument } from '@/utils/editorUtils';
import { BookOpen, FileText, FilePen, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface DocumentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentSelect: (document: UserDocument) => void;
}

const DocumentListModal: React.FC<DocumentListModalProps> = ({ 
  isOpen, 
  onClose,
  onDocumentSelect
}) => {
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load documents when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = () => {
    const docs = getAllDocuments();
    setDocuments(docs);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDocumentClick = (document: UserDocument) => {
    onDocumentSelect(document);
    onClose();
  };

  const handleDeleteDocument = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation(); // Prevent the click from being registered on the parent
    
    try {
      deleteDocument(docId);
      loadDocuments();
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  // Filter documents based on search query
  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort documents by last modified date (newest first)
  const sortedDocuments = [...filteredDocuments].sort((a, b) => 
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Document Library</DialogTitle>
          <DialogDescription>
            Access your saved documents and drafts
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="mb-4"
          />
          
          {sortedDocuments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No documents found</p>
              {searchQuery && (
                <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {sortedDocuments.map(doc => (
                <div 
                  key={doc.id}
                  className="flex items-center p-3 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleDocumentClick(doc)}
                >
                  {doc.isDraft ? (
                    <FilePen className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                  ) : (
                    <FileText className="h-5 w-5 text-editor-primary mr-3 flex-shrink-0" />
                  )}
                  
                  <div className="flex-grow overflow-hidden">
                    <p className="font-medium truncate">{doc.title}</p>
                    <div className="flex text-xs text-gray-500 mt-1">
                      <span className="mr-3">
                        Last edited: {new Date(doc.lastModified).toLocaleDateString()}
                      </span>
                      {doc.isDraft && <span className="text-amber-600 font-medium">DRAFT</span>}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 text-gray-400 hover:text-red-500"
                    onClick={(e) => handleDeleteDocument(e, doc.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentListModal;
