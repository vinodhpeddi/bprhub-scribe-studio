
import React, { useState, useEffect } from 'react';
import { TextFormatting } from './toolbar/TextFormatting';
import { ListFormatting } from './toolbar/ListFormatting';
import { HeadingControls } from './toolbar/HeadingControls';
import { InsertTools } from './toolbar/InsertTools';
import { ExportTools } from './toolbar/ExportTools';
import AIAssistantPanel from './AIAssistantPanel';
import { toast } from 'sonner';
import { Maximize, Minimize } from 'lucide-react';
import IconButton from './ui/IconButton';

interface FormatToolbarProps {
  onFormatClick: (formatType: string, value?: string) => void;
  activeFormats: string[];
  documentContent: string;
  documentTitle: string;
  onToggleFullScreen: () => void;
  isFullScreen: boolean;
  operations: {
    insertTable: (isLayout?: boolean) => void;
    insertImage: () => void;
  };
  children?: React.ReactNode;
}

const FormatToolbar: React.FC<FormatToolbarProps> = ({
  onFormatClick,
  activeFormats,
  documentContent,
  documentTitle,
  onToggleFullScreen,
  isFullScreen,
  operations,
  children
}) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div 
      className={`flex flex-wrap items-center border rounded-md p-1 bg-white z-10 transition-all duration-300 mb-2 gap-1 ${
        isSticky ? 'sticky top-0 shadow-md animate-slide-in' : ''
      }`}
    >
      <HeadingControls onFormatClick={onFormatClick} />
      <TextFormatting onFormatClick={onFormatClick} activeFormats={activeFormats} />
      
      <div className="h-5 w-px bg-gray-200 mx-1" />
      
      <ListFormatting onFormatClick={onFormatClick} activeFormats={activeFormats} />
      
      <div className="h-5 w-px bg-gray-200 mx-1" />
      
      <InsertTools 
        onFormatClick={onFormatClick} 
        onInsertTable={operations.insertTable}
        onInsertImage={operations.insertImage}
      />
      
      <div className="h-5 w-px bg-gray-200 mx-1" />
      
      <AIAssistantPanel onActionSelect={(actionId) => toast.info('Please connect to Supabase to use AI features')} />
      
      <ExportTools documentContent={documentContent} documentTitle={documentTitle} />
      
      <div className="h-5 w-px bg-gray-200 mx-1" />
      
      <IconButton
        icon={isFullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
        label={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        onClick={onToggleFullScreen}
      />
      
      {children}
    </div>
  );
};

export default FormatToolbar;
