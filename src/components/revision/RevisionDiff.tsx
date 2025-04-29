
import React, { useState, useEffect } from 'react';
import { compareDocumentVersions, getVersionById } from '@/utils/storage/documentRevisions';
import { Button } from "@/components/ui/button";
import { VersionDiff } from '@/utils/storage/documentVersioning';
import { Card } from '../ui/card';
import { Diff, EyeOff, Eye } from 'lucide-react';

interface RevisionDiffProps {
  documentId: string;
  fromRevisionId: string;
  toRevisionId: string;
}

export function RevisionDiff({ documentId, fromRevisionId, toRevisionId }: RevisionDiffProps) {
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function loadDiff() {
      try {
        setLoading(true);
        setError(null);
        
        const diffResult = compareDocumentVersions(documentId, fromRevisionId, toRevisionId);
        setDiff(diffResult);
      } catch (err) {
        console.error('Error comparing revisions:', err);
        setError('Failed to compare revisions. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadDiff();
  }, [documentId, fromRevisionId, toRevisionId]);

  if (loading) {
    return <div className="p-4 text-center">Loading comparison...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!diff) {
    return <div className="p-4 text-center">No differences found or revisions could not be compared.</div>;
  }

  const { addedNodes, removedNodes, changedNodes } = diff;
  const hasChanges = addedNodes.length > 0 || removedNodes.length > 0 || changedNodes.length > 0;

  if (!hasChanges) {
    return <div className="p-4 text-center">No differences found between these revisions.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <Diff className="w-5 h-5 mr-2" />
          Revision Differences
        </h3>
        <Button
          variant="outline" 
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 
            <><EyeOff className="w-4 h-4 mr-1" /> Hide Details</> : 
            <><Eye className="w-4 h-4 mr-1" /> Show Details</>
          }
        </Button>
      </div>
      
      <div className="p-2 rounded-md bg-muted/50 text-sm">
        <div className="mb-2">
          <span className="font-medium">{addedNodes.length}</span> additions, <span className="font-medium">{removedNodes.length}</span> deletions, <span className="font-medium">{changedNodes.length}</span> changes
        </div>
        
        {showDetails && (
          <div className="space-y-4">
            {addedNodes.length > 0 && (
              <Card className="p-2 border-green-200 bg-green-50">
                <h4 className="font-medium text-green-700 mb-1">Added Text:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {addedNodes.map((node, index) => (
                    <li key={`added-${index}`} className="text-green-800">
                      "{node.text}"
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {removedNodes.length > 0 && (
              <Card className="p-2 border-red-200 bg-red-50">
                <h4 className="font-medium text-red-700 mb-1">Removed Text:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {removedNodes.map((node, index) => (
                    <li key={`removed-${index}`} className="text-red-800">
                      "{node.text}"
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            
            {changedNodes.length > 0 && (
              <Card className="p-2 border-amber-200 bg-amber-50">
                <h4 className="font-medium text-amber-700 mb-1">Changed Formatting:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {changedNodes.map((change, index) => (
                    <li key={`changed-${index}`} className="text-amber-800">
                      "{change.before.text}" - formatting changed
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
