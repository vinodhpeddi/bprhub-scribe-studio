
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Revision } from '@/utils/commentTypes';
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from 'date-fns';
import { Pencil, Save, Eye, RotateCcw, ArrowLeft, Clock, Book, BookOpen, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface RevisionHistoryProps {
  revisions: Revision[];
  currentRevision: Revision | null;
  isViewingRevision: boolean;
  onSaveRevision: (label?: string, description?: string) => void;
  onViewRevision: (revisionId: string) => void;
  onRestoreRevision: (revisionId: string) => void;
  onExitRevisionView: () => void;
  onUpdateRevision: (revisionId: string, label: string, description?: string) => void;
  onSetAutoSave: (intervalMinutes: number | null) => void;
  autoSaveInterval: number | null;
  documentTitle: string;
}

export function RevisionHistory({
  revisions,
  currentRevision,
  isViewingRevision,
  onSaveRevision,
  onViewRevision,
  onRestoreRevision,
  onExitRevisionView,
  onUpdateRevision,
  onSetAutoSave,
  autoSaveInterval,
  documentTitle
}: RevisionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRevisionLabel, setNewRevisionLabel] = useState('');
  const [newRevisionDescription, setNewRevisionDescription] = useState('');
  const [editingRevision, setEditingRevision] = useState<Revision | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isAutoSaveDialogOpen, setIsAutoSaveDialogOpen] = useState(false);
  const [selectedAutoSaveInterval, setSelectedAutoSaveInterval] = useState<string>(
    autoSaveInterval === null ? 'off' : autoSaveInterval.toString()
  );

  // Sort revisions by timestamp (newest first)
  const sortedRevisions = [...revisions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSaveNewRevision = () => {
    onSaveRevision(newRevisionLabel || undefined, newRevisionDescription || undefined);
    setNewRevisionLabel('');
    setNewRevisionDescription('');
  };

  const handleStartEditRevision = (revision: Revision) => {
    setEditingRevision(revision);
    setEditLabel(revision.label || '');
    setEditDescription(revision.description || '');
  };

  const handleSaveEditRevision = () => {
    if (editingRevision) {
      onUpdateRevision(editingRevision.id, editLabel, editDescription);
      setEditingRevision(null);
    }
  };

  const handleSaveAutoSaveSettings = () => {
    const interval = selectedAutoSaveInterval === 'off' ? null : parseInt(selectedAutoSaveInterval);
    onSetAutoSave(interval);
    setIsAutoSaveDialogOpen(false);
  };

  const getAutoSaveLabel = () => {
    if (autoSaveInterval === null) return 'Off';
    if (autoSaveInterval === 1) return 'Every minute';
    return `Every ${autoSaveInterval} minutes`;
  };

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(true)}
        className="flex items-center"
        size="sm"
      >
        <History className="h-4 w-4 mr-2" />
        <span>Revision History</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Revision History - {documentTitle}
            </DialogTitle>
          </DialogHeader>

          {isViewingRevision && (
            <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-amber-600" />
                  <div>
                    <h3 className="font-medium text-amber-800">
                      Viewing Revision
                    </h3>
                    <p className="text-sm text-amber-700">
                      {currentRevision?.label || formatDistanceToNow(new Date(currentRevision?.timestamp || ''), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onExitRevisionView}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Exit Preview
                  </Button>
                  {currentRevision && (
                    <Button 
                      size="sm"
                      onClick={() => onRestoreRevision(currentRevision.id)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Restore This Version
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex md:flex-row flex-col gap-4 h-full">
            <div className="md:w-3/4 space-y-6 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Document Versions</h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsAutoSaveDialogOpen(true)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Auto-save: {getAutoSaveLabel()}
                  </Button>
                  <Button size="sm" onClick={handleSaveNewRevision}>
                    <Save className="h-4 w-4 mr-1" />
                    Save Current Version
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] pr-4 -mr-4">
                <div className="space-y-4">
                  {sortedRevisions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No revisions yet. Save a version to start tracking changes.
                    </div>
                  ) : (
                    sortedRevisions.map((revision) => (
                      <div 
                        key={revision.id} 
                        className={cn(
                          "border rounded-lg p-4 transition-all",
                          currentRevision?.id === revision.id 
                            ? "border-primary bg-primary/5" 
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              {revision.label || formatDistanceToNow(new Date(revision.timestamp), { addSuffix: true })}
                              {revision.isAuto && (
                                <Badge className="ml-2 bg-gray-500">Auto</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1 inline" />
                              {new Date(revision.timestamp).toLocaleString()}
                              <span className="mx-2">•</span>
                              {revision.authorName}
                            </div>
                            {revision.description && (
                              <p className="mt-2 text-sm text-gray-700">{revision.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {editingRevision?.id !== revision.id && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => handleStartEditRevision(revision)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => onViewRevision(revision.id)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => onRestoreRevision(revision.id)}
                                >
                                  <RotateCcw className="h-4 w-4 mr-1" />
                                  Restore
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {editingRevision?.id === revision.id && (
                          <div className="mt-4 space-y-3">
                            <div>
                              <Label htmlFor="edit-label">Label</Label>
                              <Input 
                                id="edit-label"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                                placeholder="Version label"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">Description (optional)</Label>
                              <Textarea 
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Add a description..."
                                rows={2}
                              />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                onClick={() => setEditingRevision(null)}
                              >
                                Cancel
                              </Button>
                              <Button onClick={handleSaveEditRevision}>
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
            
            <div className="md:w-1/4 space-y-4">
              <h3 className="text-lg font-medium">New Version</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-label">Version Label</Label>
                  <Input 
                    id="new-label"
                    value={newRevisionLabel}
                    onChange={(e) => setNewRevisionLabel(e.target.value)}
                    placeholder="e.g. First draft"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">Description (optional)</Label>
                  <Textarea 
                    id="new-description"
                    value={newRevisionDescription}
                    onChange={(e) => setNewRevisionDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSaveNewRevision}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Current Version
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto-save settings dialog */}
      <Dialog open={isAutoSaveDialogOpen} onOpenChange={setIsAutoSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auto-save Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label className="mb-3 block">Auto-save interval</Label>
            <RadioGroup 
              value={selectedAutoSaveInterval} 
              onValueChange={setSelectedAutoSaveInterval}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="off" id="off" />
                <Label htmlFor="off">Off</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id="1min" />
                <Label htmlFor="1min">Every minute</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5" id="5min" />
                <Label htmlFor="5min">Every 5 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10" id="10min" />
                <Label htmlFor="10min">Every 10 minutes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="30" id="30min" />
                <Label htmlFor="30min">Every 30 minutes</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveAutoSaveSettings}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
