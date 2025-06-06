
import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ScenarioCard from '@/components/ScenarioCard';
import GameInterface from '@/components/GameInterface';
import NotificationModal from '@/components/modals/NotificationModal';
import { ArrowLeft, Home, Users, User, Play, Radio } from 'lucide-react';
import { scenarios } from '@/data/scenarios';

const GamePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const {
    gameState,
    startScenario,
    resetGame,
    gameMode,
    setGameMode,
    userRole,
    canPlayScenarios,
    isModeLocked,
    classroomId,
    loadScenario,
    joinClassroomSession
  } = useGameContext();

  const [showNotification, setShowNotification] = useState(false);
  const [notificationData, setNotificationData] = useState({
    teacherName: '',
    scenarioTitle: '',
    sessionId: ''
  });
  const [isJoining, setIsJoining] = useState(false);

  // Handle URL parameters for auto-starting scenarios
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const scenarioId = urlParams.get('scenario');
    
    if (scenarioId && !gameState.currentScenario) {
      console.log("Auto-starting scenario from URL:", scenarioId);
      startScenario(scenarioId);
    }
  }, [location.search, gameState.currentScenario, startScenario]);

  // Listen for live session notifications
  useEffect(() => {
    if (!currentUser || userRole !== 'student' || !classroomId) return;

    // This would be implemented with your Firebase listener
    // For now, we'll simulate receiving a notification
    const handleSessionNotification = (data: any) => {
      setNotificationData({
        teacherName: data.teacherName,
        scenarioTitle: data.scenarioTitle,
        sessionId: data.sessionId
      });
      setShowNotification(true);
    };

    // Add your Firebase listener here
    // const unsubscribe = onClassroomUpdated(classroomId, handleSessionNotification);
    // return () => unsubscribe();
  }, [currentUser, userRole, classroomId]);

  const handleJoinSession = async () => {
    try {
      setIsJoining(true);
      await joinClassroomSession(notificationData.sessionId);
      setShowNotification(false);
      toast({
        title: "Joined Session",
        description: "You have successfully joined the live session!",
      });
    } catch (error) {
      console.error("Error joining session:", error);
      toast({
        title: "Error",
        description: "Failed to join the session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleDismissNotification = () => {
    setShowNotification(false);
    toast({
      title: "Notification Dismissed",
      description: "You can join the session later from your classroom page.",
    });
  };

  const handleReturnHome = () => {
    console.log("Returning to home and resetting game state");
    resetGame();
    navigate('/');
  };

  const handleExitScenario = () => {
    console.log("Exiting scenario and resetting game state");
    resetGame();
  };

  const handleModeSwitch = (mode: 'individual' | 'classroom') => {
    if (isModeLocked) {
      toast({
        title: "Mode Locked",
        description: "Cannot switch modes during a live session.",
        variant: "destructive",
      });
      return;
    }
    
    setGameMode(mode);
    toast({
      title: "Mode Changed",
      description: `Switched to ${mode} mode.`,
    });
  };

  const handleScenarioClick = (scenarioId: string) => {
    console.log("Starting scenario:", scenarioId);
    
    if (!canPlayScenarios) {
      toast({
        title: "Access Restricted",
        description: "Please sign in or wait for the current session to end.",
        variant: "destructive",
      });
      return;
    }
    
    startScenario(scenarioId);
  };

  // Show game interface if a scenario is active
  if (gameState.currentScenario && gameState.currentScene) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={handleExitScenario}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit Scenario
            </Button>
            
            <div className="flex items-center gap-4">
              <Badge className={`${gameMode === 'individual' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'} border-0`}>
                {gameMode === 'individual' ? (
                  <>
                    <User className="mr-1 h-3 w-3" />
                    Individual
                  </>
                ) : (
                  <>
                    <Users className="mr-1 h-3 w-3" />
                    Classroom
                  </>
                )}
              </Badge>
              
              <Button
                variant="outline"
                onClick={handleReturnHome}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          </div>
          
          <GameInterface />
        </div>

        <NotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          onJoin={handleJoinSession}
          onDismiss={handleDismissNotification}
          teacherName={notificationData.teacherName}
          scenarioTitle={notificationData.scenarioTitle}
          isJoining={isJoining}
        />
      </div>
    );
  }

  // Show scenario selection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Choose Your Path</h1>
            <p className="text-white/70">Select a scenario to begin your journey</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Mode Toggle - only show if not locked */}
            {!isModeLocked && (
              <div className="flex bg-black/30 rounded-lg p-1 border border-white/10">
                <Button
                  variant={gameMode === 'individual' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeSwitch('individual')}
                  className={gameMode === 'individual' ? 'bg-blue-500 text-white' : 'text-white hover:bg-white/10'}
                >
                  <User className="mr-2 h-4 w-4" />
                  Individual
                </Button>
                <Button
                  variant={gameMode === 'classroom' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleModeSwitch('classroom')}
                  className={gameMode === 'classroom' ? 'bg-green-500 text-white' : 'text-white hover:bg-white/10'}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Classroom
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={handleReturnHome}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </div>
        </div>

        {/* Access Status */}
        {!canPlayScenarios && (
          <Card className="mb-6 bg-red-500/10 border-red-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-300">
                <Radio className="h-5 w-5" />
                <span className="font-medium">Access Restricted</span>
              </div>
              <p className="text-red-200/80 mt-1 text-sm">
                {userRole === 'guest' 
                  ? 'Please sign in to play scenarios'
                  : 'Wait for the current classroom session to end or switch to individual mode'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => handleScenarioClick(scenario.id)}
              disabled={!canPlayScenarios}
            />
          ))}
        </div>

        <NotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          onJoin={handleJoinSession}
          onDismiss={handleDismissNotification}
          teacherName={notificationData.teacherName}
          scenarioTitle={notificationData.scenarioTitle}
          isJoining={isJoining}
        />
      </div>
    </div>
  );
};

export default GamePage;
