
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ExportOptions, defaultExportOptions, exportDocument } from '@/utils/editorUtils';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, documentContent }) => {
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions);

  const handleExport = () => {
    exportDocument(documentContent, options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Document</DialogTitle>
          <DialogDescription>
            Choose your export options
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-base">File Format</Label>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => setOptions({ ...options, format: value as ExportOptions['format'] })}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf">PDF Document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="word" id="word" />
                <Label htmlFor="word">Word Document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="html" id="html" />
                <Label htmlFor="html">HTML Document</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label className="text-base">Paper Size</Label>
            <RadioGroup
              value={options.paperSize}
              onValueChange={(value) => setOptions({ ...options, paperSize: value as ExportOptions['paperSize'] })}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="a4" id="a4" />
                <Label htmlFor="a4">A4</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="letter" id="letter" />
                <Label htmlFor="letter">Letter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="legal" id="legal" />
                <Label htmlFor="legal">Legal</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-4">
            <Label className="text-base">Options</Label>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="toc" className="cursor-pointer">Include Table of Contents</Label>
              <Switch
                id="toc"
                checked={options.includeToc}
                onCheckedChange={(checked) => setOptions({ ...options, includeToc: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="compress" className="cursor-pointer">Compress Images</Label>
              <Switch
                id="compress"
                checked={options.compressImages}
                onCheckedChange={(checked) => setOptions({ ...options, compressImages: checked })}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleExport}>Export Document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
