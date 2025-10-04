
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Play } from 'lucide-react';

interface LiveSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  onDecline: () => void;
  teacherName: string;
  scenarioTitle: string;
  participantCount: number;
}

const LiveSessionModal: React.FC<LiveSessionModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  onDecline,
  teacherName,
  scenarioTitle,
  participantCount
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border border-blue-500/20 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Play className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-white text-lg">Live Scenario Started!</DialogTitle>
              <DialogDescription className="text-white/70">
                Join your classmates in this interactive experience
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-black/40 rounded-lg p-4 border border-white/10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-white">{scenarioTitle}</h3>
                <p className="text-sm text-white/70">Started by {teacherName}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-0">
                <div className="flex items-center gap-1">
                  <div className="relative">
                    <div className="absolute h-2 w-2 rounded-full bg-green-400 animate-ping"></div>
                    <div className="relative h-2 w-2 rounded-full bg-green-400"></div>
                  </div>
                  Live
                </div>
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {participantCount} joined
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Just started
              </div>
            </div>
          </div>
          
          <div className="text-sm text-white/60 text-center">
            You'll be synchronized with other students and can see live voting results.
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Decline
          </Button>
          <Button 
            onClick={onJoin}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Join Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LiveSessionModal;
