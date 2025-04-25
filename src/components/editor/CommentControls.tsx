
import { Button } from '../ui/button';
import { CommentDisplayMode } from '@/utils/commentTypes';

interface CommentControlsProps {
  displayMode: CommentDisplayMode;
  setDisplayMode: (mode: CommentDisplayMode) => void;
}

export function CommentControls({ displayMode, setDisplayMode }: CommentControlsProps) {
  return (
    <div className="flex items-center space-x-2 mt-4">
      <Button
        variant={displayMode === 'inline' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setDisplayMode('inline')}
      >
        Inline Comments
      </Button>
      <Button
        variant={displayMode === 'narrow-sidebar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setDisplayMode('narrow-sidebar')}
      >
        Narrow Sidebar
      </Button>
      <Button
        variant={displayMode === 'wide-sidebar' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setDisplayMode('wide-sidebar')}
      >
        Wide Sidebar
      </Button>
    </div>
  );
}
