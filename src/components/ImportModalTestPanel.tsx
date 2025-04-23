
import React from 'react';
import { Button } from '@/components/ui/button';

interface ImportModalTestPanelProps {
  testResults: string | null;
  onBack: () => void;
  onRunTests: () => void;
}

const ImportModalTestPanel: React.FC<ImportModalTestPanelProps> = ({
  testResults,
  onBack,
  onRunTests,
}) => (
  <div className="py-4">
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 font-mono text-xs overflow-auto max-h-80">
      <pre className="whitespace-pre-wrap">{testResults}</pre>
    </div>
    <div className="flex gap-2 mt-4 justify-end">
      <Button variant="outline" onClick={onBack}>Back to Import</Button>
      <Button variant="outline" onClick={onRunTests}>Run Tests Again</Button>
    </div>
  </div>
);

export default ImportModalTestPanel;
