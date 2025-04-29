
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RevisionDiff } from "./RevisionDiff";
import { Revision } from '@/utils/commentTypes';

interface RevisionCompareProps {
  documentId: string;
  revisions: Revision[];
}

export function RevisionCompare({ documentId, revisions }: RevisionCompareProps) {
  const [fromRevision, setFromRevision] = useState<string | null>(null);
  const [toRevision, setToRevision] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const sortedRevisions = [...revisions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleCompare = () => {
    if (fromRevision && toRevision) {
      setIsComparing(true);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-sm font-medium mb-2">Compare Revisions</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500 mb-1 block">From:</label>
          <Select onValueChange={value => setFromRevision(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select earlier revision" />
            </SelectTrigger>
            <SelectContent>
              {sortedRevisions.map((revision) => (
                <SelectItem key={`from-${revision.id}`} value={revision.id}>
                  {revision.label || new Date(revision.timestamp).toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="text-sm text-gray-500 mb-1 block">To:</label>
          <Select onValueChange={value => setToRevision(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select later revision" />
            </SelectTrigger>
            <SelectContent>
              {sortedRevisions.map((revision) => (
                <SelectItem key={`to-${revision.id}`} value={revision.id}>
                  {revision.label || new Date(revision.timestamp).toLocaleString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Button 
        onClick={handleCompare}
        disabled={!fromRevision || !toRevision || fromRevision === toRevision}
        className="w-full"
        variant="outline"
      >
        Compare Revisions
      </Button>
      
      {isComparing && fromRevision && toRevision && (
        <div className="mt-4">
          <RevisionDiff 
            documentId={documentId}
            fromRevisionId={fromRevision}
            toRevisionId={toRevision}
          />
          
          <Button 
            variant="ghost" 
            className="mt-2"
            onClick={() => setIsComparing(false)}
          >
            Close Comparison
          </Button>
        </div>
      )}
    </div>
  );
}
