
import React from 'react';
import { templates, DocumentTemplate } from '@/utils/editorUtils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Import } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: DocumentTemplate) => void;
  onShowImport: () => void;
  onShowDocuments: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onSelectTemplate,
  onShowImport,
  onShowDocuments
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Select a Template</DialogTitle>
          <DialogDescription>
            Choose a template to start your document or import an existing one
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={onShowImport}>
            <Import className="h-4 w-4 mr-2" />
            Import Document
          </Button>
          
          <Button variant="outline" onClick={onShowDocuments}>
            Open Existing Document
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card 
              key={template.id}
              className="cursor-pointer hover:border-editor-primary transition-colors"
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {template.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelector;
