
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';

interface AIAction {
  id: string;
  label: string;
  description: string;
}

const aiActions: AIAction[] = [
  {
    id: 'summarize',
    label: 'Summarize Selection',
    description: 'Create a concise summary of the selected text'
  },
  {
    id: 'rephrase',
    label: 'Rephrase Paragraph',
    description: 'Rewrite the selected text in a different way'
  },
  {
    id: 'translate',
    label: 'Translate Selection',
    description: 'Translate the selected text to another language'
  }
];

interface AIAssistantPanelProps {
  onActionSelect: (actionId: string) => void;
  disabled?: boolean;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onActionSelect, disabled }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="gap-2"
          disabled={disabled}
        >
          <Bot size={18} />
          <span className="hidden sm:inline">AI Assistant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>AI Assistant</SheetTitle>
        </SheetHeader>
        
        <div className="grid gap-4 py-4">
          {aiActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className="flex flex-col items-start gap-1 h-auto p-4"
              onClick={() => onActionSelect(action.id)}
            >
              <span className="font-medium">{action.label}</span>
              <span className="text-sm text-muted-foreground">{action.description}</span>
            </Button>
          ))}
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Select text in the editor and choose an action to get AI assistance.
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AIAssistantPanel;
