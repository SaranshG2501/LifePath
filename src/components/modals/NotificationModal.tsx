
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Radio, Users } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => Promise<void>;
  onDismiss: () => void;
  teacherName: string;
  scenarioTitle: string;
  isJoining: boolean;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  onDismiss,
  teacherName,
  scenarioTitle,
  isJoining
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-green-500/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-300 flex items-center gap-2">
            <Radio className="h-5 w-5 animate-pulse" />
            Live Session Started!
          </DialogTitle>
          <DialogDescription className="text-white/80">
            {teacherName} has started a live session
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <h3 className="font-medium text-green-300 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              "{scenarioTitle}"
            </h3>
            <p className="text-white/70 text-sm">
              Join now to participate in this collaborative learning experience with your classmates.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={isJoining}
          >
            Maybe Later
          </Button>
          <Button 
            onClick={onJoin}
            disabled={isJoining}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Session'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
