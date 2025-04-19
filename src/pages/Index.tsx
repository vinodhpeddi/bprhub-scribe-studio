
import React, { useState, useEffect } from 'react';
import EditorHeader from '@/components/EditorHeader';
import TextEditor from '@/components/TextEditor';
import DocumentOutline from '@/components/DocumentOutline';
import TemplateSelector from '@/components/TemplateSelector';
import ImportModal from '@/components/ImportModal';
import DocumentListModal from '@/components/DocumentListModal';
import { 
  templates, 
  DocumentTemplate, 
  UserDocument, 
  createNewDraft,
  saveDocument,
  getAllDocuments,
  finalizeDraft
} from '@/utils/editorUtils';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(true);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDocListModalOpen, setIsDocListModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [currentDocument, setCurrentDocument] = useState<UserDocument | null>(null);

  // Handle template selection
  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentContent(template.initialContent);
    
    // Create a new draft document
    const newDraft = createNewDraft(template, 'Untitled Document');
    setCurrentDocument(newDraft);
    setDocumentTitle(newDraft.title);
    
    setIsTemplateModalOpen(false);
  };

  // Handle saving the document
  const handleSaveDocument = () => {
    if (!currentDocument) {
      toast.error('No active document to save');
      return;
    }
    
    // Update the current document
    const updatedDoc: UserDocument = {
      ...currentDocument,
      title: documentTitle,
      content: documentContent,
      lastModified: new Date().toISOString()
    };
    
    try {
      saveDocument(updatedDoc);
      setCurrentDocument(updatedDoc);
      toast.success('Document saved successfully');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  // Handle finalizing a draft document
  const handleFinalizeDocument = () => {
    if (!currentDocument) {
      toast.error('No active document to finalize');
      return;
    }
    
    if (!currentDocument.isDraft) {
      toast.info('Document is already finalized');
      return;
    }
    
    // Finalize the document
    const finalizedDoc = finalizeDraft(currentDocument);
    
    try {
      saveDocument(finalizedDoc);
      setCurrentDocument(finalizedDoc);
      toast.success('Document finalized');
    } catch (error) {
      console.error('Error finalizing document:', error);
      toast.error('Failed to finalize document');
    }
  };

  // Handle import completion
  const handleImportComplete = (content: string) => {
    setDocumentContent(content);
    
    // Create a new draft using the blank template
    const blankTemplate = templates.find(t => t.id === 'blank') || templates[0];
    const importDraft = createNewDraft(blankTemplate, 'Imported Document');
    importDraft.content = content;
    
    setCurrentDocument(importDraft);
    setDocumentTitle(importDraft.title);
    
    setIsImportModalOpen(false);
  };

  // Handle document selection from the library
  const handleDocumentSelect = (document: UserDocument) => {
    setCurrentDocument(document);
    setDocumentTitle(document.title);
    setDocumentContent(document.content);
    
    // Find the matching template
    const template = templates.find(t => t.id === document.template) || templates[0];
    setSelectedTemplate(template);
  };

  // Check for auto-saved document on mount
  useEffect(() => {
    const docs = getAllDocuments();
    
    if (docs.length > 0 && !currentDocument) {
      // Find the most recently modified document
      const latestDoc = docs.reduce((latest, doc) => {
        return new Date(doc.lastModified) > new Date(latest.lastModified) ? doc : latest;
      }, docs[0]);
      
      // Ask the user if they want to continue with the latest document
      const shouldContinue = window.confirm(`Continue with "${latestDoc.title}"?`);
      
      if (shouldContinue) {
        handleDocumentSelect(latestDoc);
        setIsTemplateModalOpen(false);
      }
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (currentDocument && documentContent) {
        // Only auto-save if there's actual content and changes
        if (documentContent !== currentDocument.content || documentTitle !== currentDocument.title) {
          const updatedDoc: UserDocument = {
            ...currentDocument,
            title: documentTitle,
            content: documentContent,
            lastModified: new Date().toISOString()
          };
          
          try {
            saveDocument(updatedDoc);
            setCurrentDocument(updatedDoc);
            console.log('Auto-saved document');
          } catch (error) {
            console.error('Error auto-saving document:', error);
          }
        }
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [currentDocument, documentContent, documentTitle]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Application Bar */}
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
              onClick={() => setIsTemplateModalOpen(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Editor Section - Takes up 3/4 of the space on larger screens */}
          <div className="lg:col-span-3 space-y-4">
            {/* Editor Header with title and actions */}
            <EditorHeader 
              documentTitle={documentTitle}
              onTitleChange={setDocumentTitle}
              onSave={handleSaveDocument}
              documentContent={documentContent}
              onImport={handleImportComplete}
              onDocumentSelect={handleDocumentSelect}
            />
            
            {/* Draft Status Indicator */}
            {currentDocument?.isDraft && (
              <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-amber-800 text-sm flex items-center">
                <span className="font-medium mr-2">DRAFT</span>
                <span>This document is in draft mode. Click "Finalize Document" when you're ready to publish it.</span>
              </div>
            )}
            
            {/* Text Editor Component */}
            <TextEditor 
              initialContent={documentContent}
              onChange={setDocumentContent}
            />
          </div>
          
          {/* Document Outline & Info Panel - Takes up 1/4 of the space on larger screens */}
          <div className="lg:col-span-1">
            <DocumentOutline content={documentContent} />
          </div>
        </div>
      </main>
      
      {/* Template Selector Modal */}
      <TemplateSelector
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        onShowImport={() => {
          setIsTemplateModalOpen(false);
          setIsImportModalOpen(true);
        }}
        onShowDocuments={() => {
          setIsTemplateModalOpen(false);
          setIsDocListModalOpen(true);
        }}
      />
      
      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
      
      {/* Document List Modal */}
      <DocumentListModal
        isOpen={isDocListModalOpen}
        onClose={() => setIsDocListModalOpen(false)}
        onDocumentSelect={handleDocumentSelect}
      />
    </div>
  );
};

export default Index;
