
import React, { useEffect, useState, useRef } from 'react';
import { useDocument } from '@/hooks/useDocument';
import { initPdfWorker } from '@/utils/pdfWorker';
import { connectToCollaborationService, getCurrentUser, updateCurrentUserName } from '@/utils/collaborationService';
import MainHeader from '@/components/layout/MainHeader';
import DocumentWorkspace from '@/components/editor/DocumentWorkspace';
import UserNameDialog from '@/components/dialogs/UserNameDialog';
import ImportModal from '@/components/ImportModal';
import DocumentListModal from '@/components/DocumentListModal';

// Initialize PDF.js worker
initPdfWorker();

const Index = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const {
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    currentDocument,
    handleSaveDocument,
    handleFinalizeDocument,
    handleDocumentSelect,
    // Revision history props
    revisions,
    currentRevision,
    isViewingRevision,
    saveDocumentRevision,
    viewRevision,
    restoreRevision,
    exitRevisionView,
    updateRevision,
    autoSaveInterval,
    setAutoSaveConfig
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
      <MainHeader 
        userName={getCurrentUser().name}
        setShowUserNameDialog={setShowUserNameDialog}
        currentDocumentIsDraft={currentDocument?.isDraft}
        onFinalizeDocument={handleFinalizeDocument}
      />
      
      <main className="container mx-auto px-4 py-6">
        <DocumentWorkspace
          documentTitle={documentTitle}
          onTitleChange={setDocumentTitle}
          documentContent={documentContent}
          onDocumentContentChange={setDocumentContent}
          currentDocument={currentDocument}
          onSaveDocument={handleSaveDocument}
          onFinalizeDocument={handleFinalizeDocument}
          editorRef={editorRef}
          onImportComplete={handleImportComplete}
          onDocumentSelect={handleDocumentSelect}
          isDraft={!!currentDocument?.isDraft}
          revisions={revisions}
          currentRevision={currentRevision}
          isViewingRevision={isViewingRevision}
          onSaveRevision={saveDocumentRevision}
          onViewRevision={viewRevision}
          onRestoreRevision={restoreRevision}
          onExitRevisionView={exitRevisionView}
          onUpdateRevision={updateRevision}
          onSetAutoSave={setAutoSaveConfig}
          autoSaveInterval={autoSaveInterval}
        />
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
      
      <UserNameDialog 
        showDialog={showUserNameDialog}
        setShowDialog={setShowUserNameDialog}
        userName={userName}
        setUserName={setUserName}
        onSave={handleUserNameSave}
      />
    </div>
  );
};

export default Index;
