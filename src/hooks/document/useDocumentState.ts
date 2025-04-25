
import { useState, useRef } from 'react';
import { UserDocument } from '@/utils/documentTypes';
import { toast } from 'sonner';

export function useDocumentState() {
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [documentContent, setDocumentContent] = useState('');
  const [currentDocument, setCurrentDocument] = useState<UserDocument | null>(null);
  const [revisions, setRevisions] = useState<import('@/utils/commentTypes').Revision[]>([]);
  const [currentRevision, setCurrentRevision] = useState<import('@/utils/commentTypes').Revision | null>(null);
  const [isViewingRevision, setIsViewingRevision] = useState(false);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number | null>(null);

  // Refs to store current values without triggering re-renders
  const contentRef = useRef(documentContent);
  const titleRef = useRef(documentTitle);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  return {
    documentTitle,
    setDocumentTitle,
    documentContent,
    setDocumentContent,
    currentDocument,
    setCurrentDocument,
    revisions,
    setRevisions,
    currentRevision,
    setCurrentRevision,
    isViewingRevision,
    setIsViewingRevision,
    autoSaveInterval,
    setAutoSaveInterval,
    contentRef,
    titleRef,
    autoSaveIntervalRef
  };
}
