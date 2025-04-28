
import { useState } from 'react';
import * as DT from '@/utils/editor/model/documentTypes';

export function useModelSelection() {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [selection, setSelection] = useState<DT.DocumentSelection | null>(null);
  
  return { 
    activeBlockId, 
    selection, 
    setActiveBlockId, 
    setSelection 
  };
}
