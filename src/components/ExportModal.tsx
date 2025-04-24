import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ExportOptions, defaultExportOptions, exportDocument, validateDocument } from '@/utils/editorUtils';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentContent: string;
  documentTitle: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, documentContent, documentTitle }) => {
  const [options, setOptions] = useState<ExportOptions>(defaultExportOptions);
  const [isExporting, setIsExporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleExport = async () => {
    try {
      const validation = validateDocument(documentTitle, documentContent);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return;
      }

      setValidationErrors([]);
      setIsExporting(true);
      await exportDocument(documentContent, options, documentTitle);
      toast.success(`Document exported as ${options.format.toUpperCase()}`);
      if (options.format === 'word') {
        toast.info("For best formatting results, you may want to use the 'Export as HTML' option and convert to DOCX using an online converter.");
      }
      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export document. Try exporting as HTML first.');
    } finally {
      setIsExporting(false);
    }
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
        
        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>
              <ul className="list-disc pl-4">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
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
            
            <div className="flex items-center justify-between">
              <Label htmlFor="watermark" className="cursor-pointer">Add "DRAFT - DO NOT USE" Watermark</Label>
              <Switch
                id="watermark"
                checked={options.addWatermark}
                onCheckedChange={(checked) => setOptions({ ...options, addWatermark: checked })}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>Cancel</Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
