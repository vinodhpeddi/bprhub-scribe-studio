
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Users } from 'lucide-react';
import { getCurrentUser } from '@/utils/collaborationService';

interface MainHeaderProps {
  userName: string;
  setShowUserNameDialog: (show: boolean) => void;
  currentDocumentIsDraft?: boolean;
  onFinalizeDocument?: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({
  userName,
  setShowUserNameDialog,
  currentDocumentIsDraft,
  onFinalizeDocument
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex items-center">
        <h1 className="text-xl font-bold text-editor-dark">BPRHub Scribe Studio</h1>
        
        <div className="ml-auto flex space-x-2">
          {currentDocumentIsDraft && (
            <Button 
              variant="default" 
              size="sm"
              onClick={onFinalizeDocument}
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
            <span>{userName}</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
