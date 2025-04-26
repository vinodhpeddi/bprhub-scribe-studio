
import { useCallback } from 'react';
import { saveRevision, performStorageCleanup } from '@/utils/documentStorage';
import { toast } from 'sonner';

export function useAutoSave(state: ReturnType<typeof import('./useDocumentState').useDocumentState>) {
  const setAutoSaveConfig = useCallback((intervalMinutes: number | null) => {
    state.setAutoSaveInterval(intervalMinutes);
    
    // Clear existing auto-save interval if it exists
    if (state.autoSaveIntervalRef.current) {
      clearInterval(state.autoSaveIntervalRef.current);
      state.autoSaveIntervalRef.current = null;
    }
    
    // If turning off auto-save, clean up storage to free space
    if (intervalMinutes === null) {
      performStorageCleanup();
      toast.success('Auto-save disabled');
      return;
    }
    
    // Don't set up extremely frequent auto-saves to prevent storage issues
    const actualInterval = Math.max(intervalMinutes, 5); // Minimum 5 minutes
    if (actualInterval !== intervalMinutes) {
      toast.info(`Auto-save frequency limited to ${actualInterval} minutes to prevent storage issues`);
    }
    
    toast.success(`Auto-save set to every ${actualInterval} minute${actualInterval !== 1 ? 's' : ''}`);
  }, [state]);

  return {
    setAutoSaveConfig
  };
}
