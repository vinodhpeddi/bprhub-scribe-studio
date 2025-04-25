
import { DocumentChange } from '@/utils/collaborationTypes';

export interface FormatToolbarProps {
  onFormatClick: (format: string) => void;
  activeFormats: string[];
  documentContent: string;
  documentTitle?: string;
  onToggleFullScreen?: () => void;
  isFullScreen?: boolean;
  operations?: {
    handleTableInsert?: (isLayout: boolean) => void;
    handleImageInsert?: () => void;
  };
  children?: React.ReactNode;
  disabled?: boolean;
}
