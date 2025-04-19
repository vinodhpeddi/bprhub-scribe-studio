import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorHeader from '@/components/EditorHeader';
import TextEditor from '@/components/TextEditor';
import DocumentOutline from '@/components/DocumentOutline';
import ImportModal from '@/components/ImportModal';
import DocumentListModal from '@/components/DocumentListModal';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { useDocument } from '@/hooks/useDocument';
import { initPdfWorker } from '@/utils/pdfWorker';

// Initialize PDF.js worker
initPdfWorker();

const Index = () => {
  const navigate = useNavigate();
  const {
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    currentDocument,
    handleSaveDocument,
    handleFinalizeDocument,
    handleDocumentSelect
  } = useDocument();

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDocListModalOpen, setIsDocListModalOpen] = useState(false);

  const handleImportComplete = (content: string) => {
    setDocumentContent(content);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <h1 className="text-xl font-bold text-editor-dark">BPRHub Scribe Studio</h1>
          
          <div className="ml-auto flex space-x-2">
            {currentDocument?.isDraft && (
              <Button 
                variant="default" 
                size="sm"
                onClick={handleFinalizeDocument}
              >
                Finalize Document
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Back to Documents
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <EditorHeader 
              documentTitle={documentTitle}
              onTitleChange={setDocumentTitle}
              onSave={handleSaveDocument}
              documentContent={documentContent}
              onImport={handleImportComplete}
              onDocumentSelect={handleDocumentSelect}
            />
            
            {currentDocument?.isDraft && (
              <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-amber-800 text-sm flex items-center">
                <span className="font-medium mr-2">DRAFT</span>
                <span>This document is in draft mode. Click "Finalize Document" when you're ready to publish it.</span>
              </div>
            )}
            
            <TextEditor 
              initialContent={documentContent}
              onChange={setDocumentContent}
            />
          </div>
          
          <div className="lg:col-span-1">
            <DocumentOutline content={documentContent} />
          </div>
        </div>
      </main>
      
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
      
      <DocumentListModal
        isOpen={isDocListModalOpen}
        onClose={() => setIsDocListModalOpen(false)}
        onDocumentSelect={handleDocumentSelect}
      />
    </div>
  );
};

export default Index;
