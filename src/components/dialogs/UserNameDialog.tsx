
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UserNameDialogProps {
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  onSave: () => void;
}

const UserNameDialog: React.FC<UserNameDialogProps> = ({
  showDialog,
  setShowDialog,
  userName,
  setUserName,
  onSave
}) => {
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Your Name</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="userName">Your Name</Label>
          <Input
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
          />
          <p className="text-sm text-gray-500 mt-2">
            This name will be visible to others when collaborating on documents.
          </p>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={onSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserNameDialog;
