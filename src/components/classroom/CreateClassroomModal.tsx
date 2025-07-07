
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateClassroom: (name: string, description: string) => Promise<void>;
}

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({
  isOpen,
  onClose,
  onCreateClassroom
}) => {
  const [classNameInput, setClassNameInput] = useState('');
  const [classDescriptionInput, setClassDescriptionInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!classNameInput.trim()) return;

    setIsCreating(true);
    try {
      await onCreateClassroom(classNameInput, classDescriptionInput);
      setClassNameInput('');
      setClassDescriptionInput('');
      onClose();
    } catch (error) {
      console.error('Error in modal:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Classroom</DialogTitle>
          <DialogDescription>
            Enter details for your new classroom
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-white">
              Classroom Name
            </label>
            <Input
              id="name"
              value={classNameInput}
              onChange={(e) => setClassNameInput(e.target.value)}
              placeholder="My Awesome Classroom"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-white">
              Description (Optional)
            </label>
            <Input
              id="description"
              value={classDescriptionInput}
              onChange={(e) => setClassDescriptionInput(e.target.value)}
              placeholder="What will students learn in this classroom?"
              className="bg-black/20 border-white/10 text-white"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleCreate}
            disabled={!classNameInput.trim() || isCreating}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isCreating ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Classroom"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassroomModal;
