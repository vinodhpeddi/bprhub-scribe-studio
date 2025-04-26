
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, RotateCcw, Pencil } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Revision } from '@/utils/commentTypes';
import { cn } from '@/lib/utils';

interface RevisionItemProps {
  revision: Revision;
  currentRevisionId: string | undefined;
  onView: (revisionId: string) => void;
  onRestore: (revisionId: string) => void;
  onStartEdit: (revision: Revision) => void;
}

export const RevisionItem: React.FC<RevisionItemProps> = ({
  revision,
  currentRevisionId,
  onView,
  onRestore,
  onStartEdit,
}) => {
  const { id, label, timestamp, authorName, description, isAuto } = revision;

  return (
    <div 
      className={cn(
        "border rounded-lg p-4 transition-all",
        currentRevisionId === id
          ? "border-primary bg-primary/5"
          : "border-gray-200 hover:border-gray-300"
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-medium">
            {label || formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            {isAuto && (
              <Badge className="ml-2 bg-gray-500">Auto</Badge>
            )}
          </div>
          <div className="text-sm text-gray-500 flex items-center mt-1">
            <Clock className="h-3 w-3 mr-1 inline" />
            {new Date(timestamp).toLocaleString()}
            <span className="mx-2">•</span>
            {authorName}
          </div>
          {description && (
            <p className="mt-2 text-sm text-gray-700">{description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(revision)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            onClick={() => onRestore(id)}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Restore
          </Button>
        </div>
      </div>
    </div>
  );
};
