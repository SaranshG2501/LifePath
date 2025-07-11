
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Users, Clock, Loader2, Wifi } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  onDismiss: () => void;
  teacherName: string;
  scenarioTitle: string;
  classroomName?: string;
  isJoining?: boolean;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  onDismiss,
  teacherName,
  scenarioTitle,
  classroomName,
  isJoining = false
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-green-500/20 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute h-4 w-4 rounded-full bg-green-400 animate-ping"></div>
              <div className="relative h-4 w-4 rounded-full bg-green-400"></div>
            </div>
          </div>
          
          <DialogTitle className="text-center text-xl text-white flex items-center justify-center gap-2">
            <Radio className="h-5 w-5 text-green-400" />
            {isJoining ? 'Joining Session...' : 'Live Session Started!'}
          </DialogTitle>
          
          <DialogDescription className="text-center text-white/80 space-y-3">
            <div className="bg-black/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="font-medium">{teacherName}</span>
              </div>
              
              <div className="text-sm text-white/70">
                {isJoining ? 'is connecting you to the session' : 'has started a live session'}
              </div>
              
              <Badge className="bg-green-500/20 text-green-300 border-0 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {scenarioTitle}
              </Badge>
              
              {classroomName && (
                <div className="text-xs text-white/60">
                  in {classroomName}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Clock className="h-4 w-4" />
              {isJoining 
                ? "Setting up your session..." 
                : "Join now to participate with your class"}
            </div>

            {isJoining && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-green-300 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading scenario and syncing with teacher...</span>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            onClick={onDismiss}
            className="border-white/20 text-white hover:bg-white/10 flex-1"
            disabled={isJoining}
          >
            {isJoining ? 'Connecting...' : 'Maybe Later'}
          </Button>
          <Button 
            onClick={onJoin}
            className="bg-green-500 hover:bg-green-600 text-white flex-1"
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Wifi className="h-4 w-4 mr-2" />
                Join Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;
