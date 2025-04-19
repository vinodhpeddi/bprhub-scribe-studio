
import React, { useState, useEffect } from 'react';
import EditorHeader from '@/components/EditorHeader';
import TextEditor from '@/components/TextEditor';
import DocumentOutline from '@/components/DocumentOutline';
import TemplateSelector from '@/components/TemplateSelector';
import { templates, DocumentTemplate } from '@/utils/editorUtils';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const Index = () => {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  // Handle template selection
  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setDocumentContent(template.initialContent);
    setIsTemplateModalOpen(false);
  };

  // Handle saving the document
  const handleSaveDocument = () => {
    // In a real app, this would save to a backend or local storage
    console.log('Saving document:', { title: documentTitle, content: documentContent });
    
    // For demo purposes, save to localStorage
    localStorage.setItem('savedDocument', JSON.stringify({
      title: documentTitle,
      content: documentContent,
      lastSaved: new Date().toISOString()
    }));
  };

  // Check for saved document on mount
  useEffect(() => {
    const savedDoc = localStorage.getItem('savedDocument');
    if (savedDoc && !selectedTemplate) {
      try {
        const { title, content } = JSON.parse(savedDoc);
        setDocumentTitle(title);
        setDocumentContent(content);
        setIsTemplateModalOpen(false);
      } catch (error) {
        console.error('Error loading saved document:', error);
      }
    }
  }, [selectedTemplate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Application Bar */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <h1 className="text-xl font-bold text-editor-dark">BPRHub Scribe Studio</h1>
          
          <div className="ml-auto">
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
            />
            
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
      />
    </div>
  );
};

export default Index;
