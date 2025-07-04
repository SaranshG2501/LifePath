
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, BarChart, ArrowRight, Clock, CheckCircle, Wifi, HelpCircle } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { Scene, Choice } from '@/types/game';
import { recordStudentVote, getScenarioVotes, onVotesUpdated, getActiveSession, onLiveSessionUpdated, submitLiveChoice, advanceLiveSession } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';

interface EnhancedClassroomVotingProps {
  scene: Scene;
}

const EnhancedClassroomVoting: React.FC<EnhancedClassroomVotingProps> = ({ scene }) => {
  const { 
    classroomId,
    revealVotes, 
    setRevealVotes, 
    userRole,
    makeChoice,
    setCurrentScene,
    gameState
  } = useGameContext();
  
  const { currentUser } = useAuth();
  const [votes, setVotes] = useState<any[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveSession, setLiveSession] = useState<any>(null);
  
  // Check for active live session
  useEffect(() => {
    const checkLiveSession = async () => {
      if (!classroomId) return;
      
      try {
        const activeSession = await getActiveSession(classroomId);
        if (activeSession) {
          setLiveSession(activeSession);
          console.log("Found active live session:", activeSession);
        }
      } catch (error) {
        console.error("Error checking live session:", error);
      }
    };
    
    checkLiveSession();
  }, [classroomId]);
  
  // Set up real-time listeners for live session updates
  useEffect(() => {
    if (!classroomId) return;
    
    let unsubscribeLiveSession: (() => void) | undefined;
    
    if (liveSession?.id) {
      // Use live session real-time updates
      unsubscribeLiveSession = onLiveSessionUpdated(liveSession.id, (updatedSession) => {
        setLiveSession(updatedSession);
        
        // Sync scene changes from teacher to students
        if (userRole === 'student' && updatedSession.currentSceneId && 
            updatedSession.currentSceneId !== scene.id) {
          console.log("Syncing to teacher's scene:", updatedSession.currentSceneId);
          setCurrentScene(updatedSession.currentSceneId);
        }
        
        // Convert live session choices to votes format
        const liveVotes = Object.entries(updatedSession.currentChoices || {}).map(([studentId, choiceId]) => ({
          studentId,
          choiceId,
          timestamp: new Date()
        }));
        setVotes(liveVotes);
        
        // Check if current user has voted
        if (currentUser && updatedSession.currentChoices?.[currentUser.uid]) {
          setHasVoted(true);
          setSelectedChoice(updatedSession.currentChoices[currentUser.uid]);
        }
      });
    }
    
    return () => {
      if (unsubscribeLiveSession) unsubscribeLiveSession();
    };
  }, [classroomId, currentUser, liveSession?.id, userRole, scene.id, setCurrentScene]);

  const totalVotes = votes.length;
  
  const getVoteCount = (choiceId: string) => {
    return votes.filter(vote => vote.choiceId === choiceId).length;
  };
  
  const getVotePercentage = (choiceId: string) => {
    if (!totalVotes) return 0;
    return Math.round((getVoteCount(choiceId) / totalVotes) * 100);
  };

  const handleChoiceClick = async (choiceId: string) => {
    if (userRole === 'student' && !hasVoted) {
      setSelectedChoice(choiceId);
      setIsSubmitting(true);
      
      try {
        if (currentUser && classroomId) {
          if (liveSession?.id) {
            console.log("Submitting vote to live session:", choiceId);
            await submitLiveChoice(liveSession.id, currentUser.uid, choiceId);
          }
          setHasVoted(true);
        }
      } catch (error) {
        console.error('Error recording vote:', error);
        setSelectedChoice(null);
      } finally {
        setIsSubmitting(false);
      }
    } else if (userRole === 'teacher') {
      if (!revealVotes) {
        setRevealVotes(true);
      } else {
        // Teacher advancing to next scene
        if (liveSession?.id) {
          const choice = scene.choices.find(c => c.id === choiceId);
          if (choice && choice.nextSceneId) {
            try {
              await advanceLiveSession(liveSession.id, choice.nextSceneId);
            } catch (error) {
              console.error("Error advancing live session:", error);
            }
          }
        }
        makeChoice(choiceId);
      }
    }
  };

  const handleContinue = () => {
    // Get the choice with the most votes
    if (totalVotes > 0) {
      const voteCounts: Record<string, number> = {};
      votes.forEach(vote => {
        voteCounts[vote.choiceId] = (voteCounts[vote.choiceId] || 0) + 1;
      });
      
      const topChoiceId = Object.entries(voteCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0][0];
      
      makeChoice(topChoiceId);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 border-primary/20 backdrop-blur-lg shadow-xl animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl text-white">Classroom Decision</CardTitle>
          {liveSession && (
            <Badge className="bg-green-500/20 text-green-300 border-0">
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </div>
        
        {/* Always show the scenario question/description in classroom mode */}
        <div className="text-center mb-4">
          <div className="text-lg text-white/90 leading-relaxed bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
            <div className="font-bold text-primary mb-3 text-xl flex items-center justify-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Scenario Question:
            </div>
            <div className="text-lg font-medium">{scene.description}</div>
          </div>
        </div>
        
        <CardDescription className="text-center text-white/80">
          {userRole === 'teacher' 
            ? 'Review class votes and advance the scenario' 
            : hasVoted 
              ? 'Waiting for teacher to continue' 
              : 'Cast your vote on what should happen next'}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="bg-black/20 rounded-lg p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-primary" />
            <span className="text-white font-medium">Votes: {totalVotes}</span>
            {liveSession && (
              <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                Scene: {liveSession.currentSceneId}
              </Badge>
            )}
          </div>
          
          {userRole === 'teacher' && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setRevealVotes(!revealVotes)}
              className="border-white/20 bg-black/40 text-white hover:bg-white/10"
            >
              {revealVotes ? 'Hide Results' : 'Show Results'}
            </Button>
          )}
        </div>
        
        <div className="space-y-4">
          {scene.choices.map((choice) => (
            <div key={choice.id} className="space-y-2">
              <Button
                variant="outline"
                className={`w-full justify-between py-6 px-4 text-left border ${
                  hasVoted && selectedChoice === choice.id
                    ? 'border-primary/70 bg-primary/20'
                    : revealVotes && getVotePercentage(choice.id) > 0
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-white/10 bg-black/30'
                } hover:bg-white/10 text-white relative overflow-hidden ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => !isSubmitting && handleChoiceClick(choice.id)}
                disabled={isSubmitting || (userRole === 'student' && hasVoted)}
              >
                <span className="text-base">{choice.text}</span>
                
                {(revealVotes || (hasVoted && selectedChoice === choice.id)) && (
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-white/80">{getVoteCount(choice.id)} votes</span>
                    <span className="font-mono font-bold">{getVotePercentage(choice.id)}%</span>
                  </div>
                )}
                
                {hasVoted && selectedChoice === choice.id && !revealVotes && (
                  <Badge className="absolute top-2 right-2 bg-primary/60 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Your vote
                  </Badge>
                )}
              </Button>
              
              {revealVotes && (
                <Progress 
                  value={getVotePercentage(choice.id)} 
                  className="h-2 bg-white/20" 
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-center pt-4">
        {userRole === 'teacher' && revealVotes && (
          <div className="text-center">
            <p className="text-white/80 text-sm mb-3">
              Click on a choice above to advance the scenario
            </p>
          </div>
        )}
        
        {userRole === 'student' && (
          <div className="text-white/80 text-center flex items-center gap-2">
            {hasVoted ? (
              <>
                <Clock className="h-5 w-5 inline-block" />
                Waiting for teacher to continue...
              </>
            ) : (
              <>
                <Users className="h-5 w-5 inline-block" />
                Choose what happens next
              </>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedClassroomVoting;
