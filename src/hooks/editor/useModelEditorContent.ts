
import { useCallback, useState, RefObject } from 'react';

export function useModelEditorContent(
  editorRef: RefObject<HTMLDivElement>,
  isReady: boolean
) {
  const [showTableProperties, setShowTableProperties] = useState(false);
  const [selectedTable, setSelectedTable] = useState<HTMLTableElement | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  const closeTableProperties = useCallback(() => {
    setShowTableProperties(false);
  }, []);

  const handleTableClick = useCallback((e: React.MouseEvent) => {
    if (!isReady) return;
    
    const target = e.target as HTMLElement;
    const table = target.closest('table');
    
    if (table) {
      setSelectedTable(table as HTMLTableElement);
      setShowTableProperties(true);
    } else {
      setSelectedTable(null);
      setShowTableProperties(false);
    }
  }, [isReady]);

  return {
    showTableProperties,
    selectedTable,
    isFullScreen,
    toggleFullScreen,
    closeTableProperties,
    handleTableClick
  };
}
