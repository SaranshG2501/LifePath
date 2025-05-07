import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import SceneDisplay from '@/components/SceneDisplay';
import MetricsDisplay from '@/components/MetricsDisplay';
import ResultsSummary from '@/components/ResultsSummary';
import EnhancedClassroomVoting from '@/components/EnhancedClassroomVoting';
import MirrorMoment from '@/components/MirrorMoment';
import ClassroomJoinLink from '@/components/classroom/ClassroomJoinLink';
import StudentClassroomView from '@/components/classroom/StudentClassroomView';
import TeacherClassroomManager from '@/components/classroom/TeacherClassroomManager';
import { onClassroomUpdated } from '@/lib/firebase';
import { ArrowLeft, LayoutDashboard, UsersRound } from 'lucide-react';

const GamePage: React.FC = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { 
    gameState, 
    resetGame, 
    makeChoice,
    startScenario,
    isGameActive,
    showMirrorMoment,
    setShowMirrorMoment,
    gameMode,
    userRole,
    classroomId,
    setClassroomId
  } = useGameContext();
  
  // Effect to fetch scenario if in classroom mode
  useEffect(() => {
    // Initialize classroom scenario if necessary
    if (gameMode === 'classroom' && classroomId) {
      // Listen for classroom updates
      const unsubscribe = onClassroomUpdated(classroomId, (classroom) => {
        // If a new scenario gets activated, load it
        if (classroom?.activeScenario && !isGameActive && isFirstLoad) {
          startScenario(classroom.activeScenario);
          setIsFirstLoad(false);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [gameMode, classroomId, isGameActive, isFirstLoad, startScenario]);
  
  const handleReturnHome = () => {
    resetGame();
    if (userProfile?.role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/profile');
    }
  };
  
  const handlePlayAgain = () => {
    // Reset and restart the same scenario if one was active
    if (gameState.currentScenario) {
      const scenarioId = gameState.currentScenario.id;
      resetGame();
      startScenario(scenarioId);
    } else {
      // Otherwise just go to profile
      navigate('/profile');
    }
  };

  // Handle classroom mode
  if (gameMode === 'classroom') {
    // Show teacher view
    if (userRole === 'teacher') {
      return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex justify-between">
            <Button variant="outline" onClick={() => navigate('/teacher')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <ClassroomJoinLink />
          </div>
          
          <TeacherClassroomManager />
          
          {gameState.currentScene && !gameState.currentScene.isEnding && (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <Card className="bg-black/40 backdrop-blur-md border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Current Scene</CardTitle>
                  <CardDescription>Students are viewing this scene</CardDescription>
                </CardHeader>
                <CardContent>
                  <SceneDisplay scene={gameState.currentScene} onChoiceSelected={makeChoice} />
                </CardContent>
              </Card>
              
              {gameState.currentScene.choices && (
                <EnhancedClassroomVoting 
                  sceneId={gameState.currentScene.id}
                  choices={gameState.currentScene.choices}
                />
              )}
            </div>
          )}
          
          {gameState.currentScene && gameState.currentScene.isEnding && (
            <div className="mt-8">
              <ResultsSummary 
                finalScene={gameState.currentScene} 
                metrics={gameState.metrics}
                choices={gameState.choices}
                scenarioTitle={gameState.currentScenario?.title || ''}
                isClassroom={true}
                onPlayAgain={handlePlayAgain}
                onReturnHome={handleReturnHome}
              />
            </div>
          )}
        </div>
      );
    }
    
    // Student view
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate('/profile')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
        
        <StudentClassroomView />
        
        {gameState.currentScene && (
          <div className="mt-8">
            <SceneDisplay scene={gameState.currentScene} onChoiceSelected={makeChoice} />
            
            {gameState.currentScene.choices && !gameState.currentScene.isEnding && (
              <div className="mt-8">
                <EnhancedClassroomVoting
                  sceneId={gameState.currentScene.id}
                  choices={gameState.currentScene.choices}
                />
              </div>
            )}
            
            {gameState.currentScene.isEnding && (
              <div className="mt-8">
                <ResultsSummary 
                  finalScene={gameState.currentScene} 
                  metrics={gameState.metrics}
                  choices={gameState.choices}
                  scenarioTitle={gameState.currentScenario?.title || ''}
                  isClassroom={true}
                  onPlayAgain={handlePlayAgain}
                  onReturnHome={handleReturnHome}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Individual mode - normal game flow
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {!isGameActive && (
        <div className="flex flex-col items-center justify-center py-12">
          <Card className="w-full max-w-lg bg-black/40 backdrop-blur-md border-white/10">
            <CardHeader>
              <CardTitle className="text-center text-white">No Active Scenario</CardTitle>
              <CardDescription className="text-center text-white/70">
                Please select a scenario from your profile to start
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/profile')}>
                Go to Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
      
      {isGameActive && gameState.currentScene && !gameState.currentScene.isEnding && (
        <div className="space-y-8">
          <div className="lg:flex gap-6 space-y-6 lg:space-y-0">
            <div className="lg:flex-1">
              <SceneDisplay scene={gameState.currentScene} onChoiceSelected={makeChoice} />
            </div>
            
            <div className="lg:w-64">
              <MetricsDisplay metrics={gameState.metrics} />
            </div>
          </div>
          
          {showMirrorMoment && (
            <MirrorMoment onClose={() => setShowMirrorMoment(false)} />
          )}
        </div>
      )}
      
      {isGameActive && gameState.currentScene && gameState.currentScene.isEnding && (
        <ResultsSummary 
          finalScene={gameState.currentScene} 
          metrics={gameState.metrics}
          choices={gameState.choices}
          scenarioTitle={gameState.currentScenario?.title || ''}
          onPlayAgain={handlePlayAgain}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
};

export default GamePage;
