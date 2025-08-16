
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Radio, Users, Clock, Loader2, Wifi, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { 
  onNotificationsUpdated,
  SessionNotification,
  joinLiveSession,
  onClassroomUpdated,
  getActiveSession,
  Timestamp
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
              scenarioTitle: activeSession.scenarioTitle,
              classroomId: classroomId,
              studentId: currentUser.uid,
              createdAt: Timestamp.now(),
              read: false
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

  const handleAcceptSession = async () => {
    if (!notification || !currentUser || !userProfile) return;

    setIsJoining(true);
    try {
      // Student accepting live session
      
      // Set game context first
      setClassroomId(notification.classroomId);
      setGameMode("classroom");
      
      // Join the live session
      const sessionData = await joinLiveSession(notification.sessionId, currentUser.uid, userProfile.displayName || 'Student');
      
      // Start the scenario with the correct scenario ID
      if (sessionData?.scenarioId) {
        startScenario(sessionData.scenarioId);
      }
      
      toast({
        title: "🎯 Joined Live Session!",
        description: `Successfully connected to "${notification.scenarioTitle}"`,
      });
      
      // Clear notification and navigate
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

  const handleDeclineSession = () => {
    if (notification) {
      setDismissedSessions(prev => new Set(prev).add(notification.sessionId));
      setNotification(null);
      toast({
        title: "Session Declined",
        description: "You can still join from your classroom if you change your mind.",
      });
    }
  };

  if (!notification) return null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-green-500/30 text-white max-w-md backdrop-blur-lg" hideCloseButton>
        <DialogHeader>
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute h-6 w-6 rounded-full bg-green-400 animate-ping"></div>
              <div className="relative h-6 w-6 rounded-full bg-green-400 flex items-center justify-center">
                <Radio className="h-3 w-3 text-slate-900" />
              </div>
            </div>
          </div>
          
          <DialogTitle className="text-2xl text-center text-white flex items-center justify-center gap-3 mb-2">
            <Wifi className="h-6 w-6 text-green-400" />
            Live Session Started!
          </DialogTitle>
          
          <DialogDescription className="text-center text-white/90 space-y-4">
            <div className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl p-5 space-y-3 border border-slate-600/30">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <Users className="h-5 w-5 text-blue-400" />
                </div>
                <span className="font-semibold text-lg">{notification.teacherName}</span>
              </div>
              
              <div className="text-white/80 text-base">
                has started a live session
              </div>
              
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2 text-sm font-medium">
                <Wifi className="h-4 w-4 mr-2" />
                {notification.scenarioTitle}
              </Badge>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-white/70 bg-slate-800/40 rounded-lg p-3">
              <Clock className="h-4 w-4" />
              Join now to participate with your class!
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={handleDeclineSession}
            className="border-red-500/40 bg-red-900/30 text-red-300 hover:bg-red-800/40 hover:border-red-400/60 transition-all duration-200 flex-1"
            disabled={isJoining}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button 
            onClick={handleAcceptSession}
            className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/20 transition-all duration-200 flex-1"
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept & Join
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSessionNotification;
