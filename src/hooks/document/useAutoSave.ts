
import { useCallback } from 'react';
import { saveRevision } from '@/utils/documentStorage';
import { toast } from 'sonner';

export function useAutoSave(state: ReturnType<typeof import('./useDocumentState').useDocumentState>) {
  const setAutoSaveConfig = useCallback((intervalMinutes: number | null) => {
    state.setAutoSaveInterval(intervalMinutes);
    
    if (intervalMinutes === null && state.autoSaveIntervalRef.current) {
      clearInterval(state.autoSaveIntervalRef.current);
      state.autoSaveIntervalRef.current = null;
    }
    
    toast.success(intervalMinutes ? 
      `Auto-save set to every ${intervalMinutes} minute${intervalMinutes !== 1 ? 's' : ''}` : 
      'Auto-save disabled'
    );
  }, [state]);

  return {
    setAutoSaveConfig
  };
}
