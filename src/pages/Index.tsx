
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorHeader from '@/components/EditorHeader';
import TextEditor from '@/components/TextEditor';
import DocumentOutline from '@/components/DocumentOutline';
import ImportModal from '@/components/ImportModal';
import DocumentListModal from '@/components/DocumentListModal';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';
import { useDocument } from '@/hooks/useDocument';
import { initPdfWorker } from '@/utils/pdfWorker';
import { connectToCollaborationService, getCurrentUser, updateCurrentUserName } from '@/utils/collaborationService';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Initialize PDF.js worker
initPdfWorker();

const Index = () => {
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
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
  const [showUserNameDialog, setShowUserNameDialog] = useState(false);
  const [userName, setUserName] = useState(getCurrentUser().name);
  const [isCollaborationConnected, setIsCollaborationConnected] = useState(false);

  useEffect(() => {
    // Connect to the collaboration service
    connectToCollaborationService().then(() => {
      setIsCollaborationConnected(true);
      
      // Show username dialog if it's the default
      if (getCurrentUser().name === 'Anonymous User') {
        setShowUserNameDialog(true);
      }
    });
  }, []);

  const handleImportComplete = (content: string) => {
    setDocumentContent(content);
  };

  const handleUserNameSave = () => {
    if (userName.trim()) {
      updateCurrentUserName(userName.trim());
      setShowUserNameDialog(false);
    }
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUserNameDialog(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              <span>{getCurrentUser().name}</span>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <EditorHeader 
              documentTitle={documentTitle || ""}
              onTitleChange={(title) => setDocumentTitle(title)}
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
              editorRef={editorRef}
              documentTitle={documentTitle}
              onSave={handleSaveDocument}
              documentId={currentDocument?.id}
            />
          </div>
          
          <div className="lg:col-span-1">
            <DocumentOutline 
              content={documentContent} 
              editorRef={editorRef}
            />
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
      
      <Dialog open={showUserNameDialog} onOpenChange={setShowUserNameDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Your Name</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
            />
            <p className="text-sm text-gray-500 mt-2">
              This name will be visible to others when collaborating on documents.
            </p>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUserNameSave}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
