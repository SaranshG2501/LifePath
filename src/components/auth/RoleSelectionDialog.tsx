
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { School, User, BookOpen, X } from 'lucide-react';
import { UserRole } from '@/types/game';

interface RoleSelectionDialogProps {
  open: boolean;
  onSelectRole: (role: UserRole) => void;
  onClose: () => void;
}

const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
  open,
  onSelectRole,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border border-white/10 backdrop-blur-md max-w-md mx-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="pb-2">
          <DialogTitle className="text-white text-xl text-center">Select Your Role</DialogTitle>
          <DialogDescription className="text-white/70 text-center">
            Choose your role to personalize your LifePath experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <div
            className="bg-black/30 border border-white/10 rounded-lg p-5 flex flex-col items-center cursor-pointer hover:border-blue-300/50 hover:bg-black/40 transition-all"
            onClick={() => onSelectRole('student')}
            aria-label="Select Student Role"
            role="button"
            tabIndex={0}
          >
            <div className="p-3 bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mb-3">
              <BookOpen className="text-blue-300 h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-white">Student</h3>
            <p className="text-white/70 text-center mt-2 text-sm">
              Join classrooms and participate in interactive scenarios
            </p>
          </div>
          
          <div
            className="bg-black/30 border border-white/10 rounded-lg p-5 flex flex-col items-center cursor-pointer hover:border-blue-300/50 hover:bg-black/40 transition-all"
            onClick={() => onSelectRole('teacher')}
            aria-label="Select Teacher Role"
            role="button"
            tabIndex={0}
          >
            <div className="p-3 bg-blue-500/20 rounded-full w-16 h-16 flex items-center justify-center mb-3">
              <School className="text-blue-300 h-8 w-8" />
            </div>
            <h3 className="font-bold text-lg text-white">Teacher</h3>
            <p className="text-white/70 text-center mt-2 text-sm">
              Create classrooms and assign scenarios to students
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => onSelectRole('guest')}
            className="border-white/20 text-white hover:bg-black/30 w-full sm:w-auto"
          >
            <User className="mr-2 h-4 w-4" />
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionDialog;
