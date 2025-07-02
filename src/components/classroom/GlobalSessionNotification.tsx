
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Users, Clock, Loader2, Wifi, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { 
  onNotificationsUpdated,
  SessionNotification,
  joinLiveSession,
  onClassroomUpdated,
  getActiveSession
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const GlobalSessionNotification: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const { setClassroomId, setGameMode, startScenario, classroomId } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [notification, setNotification] = useState<SessionNotification | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [dismissedSessions, setDismissedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || userProfile?.role !== 'student' || !classroomId) return;

    // Listen for classroom updates for immediate notification
    const unsubscribeClassroom = onClassroomUpdated(classroomId, async (classroom) => {
      if (classroom.activeSessionId && !dismissedSessions.has(classroom.activeSessionId)) {
        try {
          const activeSession = await getActiveSession(classroomId);
          if (activeSession && activeSession.status === 'active') {
            setNotification({
              id: activeSession.id!,
              type: 'live_session_started',
              sessionId: activeSession.id!,
              teacherName: activeSession.teacherName,
              scenarioTitle: activeSession.scenarioTitle
            });
          }
        } catch (error) {
          console.error("Error fetching active session:", error);
        }
      }
    });

    // Also listen for traditional notifications as backup
    const unsubscribeNotifications = onNotificationsUpdated(currentUser.uid, (notifications) => {
      const liveSessionNotification = notifications.find(n => 
        n.type === 'live_session_started' && 
        !dismissedSessions.has(n.sessionId)
      );
      
      if (liveSessionNotification) {
        setNotification(liveSessionNotification);
      }
    });

    return () => {
      unsubscribeClassroom();
      unsubscribeNotifications();
    };
  }, [currentUser, userProfile, classroomId, dismissedSessions]);

  const handleJoinSession = async () => {
    if (!notification || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      setClassroomId(classroomId!);
      setGameMode("classroom");
      
      await joinLiveSession(notification.sessionId, currentUser.uid, userProfile.displayName || 'Student');
      startScenario(notification.sessionId);
      
      toast({
        title: "🎯 Joined Live Session!",
        description: `Successfully connected to "${notification.scenarioTitle}"`,
      });
      
      setNotification(null);
      navigate('/game');
    } catch (error) {
      console.error("Error joining live session:", error);
      toast({
        title: "Connection Failed",
        description: "Unable to join the live session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDismiss = () => {
    if (notification) {
      setDismissedSessions(prev => new Set(prev).add(notification.sessionId));
      setNotification(null);
    }
  };

  const handleViewClassroom = () => {
    setNotification(null);
    navigate('/student');
  };

  if (!notification) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="bg-black/95 border border-green-500/20 text-white max-w-md" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute h-4 w-4 rounded-full bg-green-400 animate-ping"></div>
                <div className="relative h-4 w-4 rounded-full bg-green-400"></div>
              </div>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <Radio className="h-5 w-5 text-green-400" />
                Live Session Started!
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <DialogDescription className="text-center text-white/80 space-y-3">
            <div className="bg-black/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4 text-blue-400" />
                <span className="font-medium">{notification.teacherName}</span>
              </div>
              
              <div className="text-sm text-white/70">
                has started a live session
              </div>
              
              <Badge className="bg-green-500/20 text-green-300 border-0 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {notification.scenarioTitle}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Clock className="h-4 w-4" />
              Join now to participate with your class
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            onClick={handleViewClassroom}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={isJoining}
          >
            View in Classroom
          </Button>
          <Button 
            onClick={handleJoinSession}
            className="bg-green-500 hover:bg-green-600 text-white"
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
                Join Now
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSessionNotification;
