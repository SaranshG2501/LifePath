import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { BookOpen, Eye, Users, Play } from 'lucide-react';

interface LiveSessionStartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (mirrorMomentsEnabled: boolean) => void;
  scenarioTitle: string;
  classroomName: string;
  isStarting: boolean;
}

const LiveSessionStartDialog: React.FC<LiveSessionStartDialogProps> = ({
  isOpen,
  onClose,
  onStart,
  scenarioTitle,
  classroomName,
  isStarting
}) => {
  const [mirrorMomentsEnabled, setMirrorMomentsEnabled] = useState(false);

  const handleStart = () => {
    onStart(mirrorMomentsEnabled);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/90 border border-green-500/20 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-full">
              <Play className="h-5 w-5 text-green-400" />
            </div>
            <DialogTitle className="text-white">Start Live Session</DialogTitle>
          </div>
          <DialogDescription className="text-white/70">
            Configure your live session settings for <strong>"{scenarioTitle}"</strong> in <strong>"{classroomName}"</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <h4 className="text-white font-medium">Scenario</h4>
            </div>
            <p className="text-white/80 text-sm">{scenarioTitle}</p>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Users className="h-5 w-5 text-purple-400" />
              <h4 className="text-white font-medium">Classroom</h4>
            </div>
            <p className="text-white/80 text-sm">{classroomName}</p>
          </div>

          <div className="bg-black/20 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-orange-400" />
                <div>
                  <Label htmlFor="mirror-moments" className="text-white font-medium">
                    Mirror Moments
                  </Label>
                  <p className="text-white/70 text-xs mt-1">
                    Enable reflection prompts during gameplay
                  </p>
                </div>
              </div>
              <Switch
                id="mirror-moments"
                checked={mirrorMomentsEnabled}
                onCheckedChange={setMirrorMomentsEnabled}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
            disabled={isStarting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStart}
            disabled={isStarting}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isStarting ? "Starting..." : "Start Live Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LiveSessionStartDialog;