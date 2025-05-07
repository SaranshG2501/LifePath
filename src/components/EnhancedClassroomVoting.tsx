
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Check, Clock, Users, Vote } from 'lucide-react';
import { Scene } from '@/types/game';

interface EnhancedClassroomVotingProps {
  sceneId: string;
  choices: Array<{
    id: string;
    text: string;
  }>;
  onVoteSubmitted?: () => void;
}

const EnhancedClassroomVoting: React.FC<EnhancedClassroomVotingProps> = ({
  sceneId,
  choices,
  onVoteSubmitted
}) => {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteCount, setVoteCount] = useState<Record<string, number>>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(true);
  
  const { 
    submitVote, 
    classroomVotes, 
    revealVotes, 
    setRevealVotes, 
    userRole, 
    gameMode,
    classroomId 
  } = useGameContext();
  
  const { userProfile } = useAuth();
  
  const isTeacher = userRole === 'teacher';
  
  // Effect for handling timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isTimerActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTeacher) {
      // Automatically reveal votes when timer expires for teachers
      setRevealVotes(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [timeLeft, isTimerActive, isTeacher, setRevealVotes]);
  
  // Process votes whenever classroomVotes changes
  useEffect(() => {
    if (!classroomVotes || classroomVotes.length === 0) return;
    
    // Count votes for each choice
    const voteCounts: Record<string, number> = {};
    let total = 0;
    
    classroomVotes.forEach(vote => {
      if (vote.choiceId) {
        if (!voteCounts[vote.choiceId]) {
          voteCounts[vote.choiceId] = 0;
        }
        voteCounts[vote.choiceId]++;
        total++;
      }
    });
    
    setVoteCount(voteCounts);
    setTotalVotes(total);
    
    // Check if current user has voted
    if (userProfile) {
      const userVoted = classroomVotes.some(vote => vote.studentId === userProfile.id);
      setHasVoted(userVoted);
      
      if (userVoted) {
        const userVote = classroomVotes.find(vote => vote.studentId === userProfile.id);
        if (userVote) {
          setSelectedChoice(userVote.choiceId);
        }
      }
    }
  }, [classroomVotes, userProfile]);
  
  const handleVote = async () => {
    if (!selectedChoice || !submitVote) return;
    
    await submitVote(selectedChoice);
    setHasVoted(true);
    
    if (onVoteSubmitted) {
      onVoteSubmitted();
    }
  };
  
  const handleChoiceSelect = (choiceId: string) => {
    if (!hasVoted) {
      setSelectedChoice(choiceId);
    }
  };
  
  const toggleReveal = () => {
    if (isTeacher) {
      setRevealVotes(!revealVotes);
    }
  };
  
  const getVotePercentage = (choiceId: string) => {
    if (totalVotes === 0) return 0;
    return Math.round((voteCount[choiceId] || 0) / totalVotes * 100);
  };

  if (gameMode !== 'classroom' || !classroomId) {
    return null;
  }
  
  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/10 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-center text-white flex items-center justify-center gap-2">
          <Vote className="h-5 w-5" />
          Class Decision Time
        </CardTitle>
        <CardDescription className="text-center text-white/70">
          {isTeacher 
            ? "Monitor student votes and reveal the results when ready" 
            : hasVoted 
              ? "Waiting for other students and teacher to reveal results" 
              : "Select an option and submit your vote"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-0">
        {/* Timer & Vote Count */}
        <div className="flex justify-between items-center text-sm text-white/80 px-1">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>
              {timeLeft > 0 
                ? `${timeLeft}s remaining` 
                : "Time's up!"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{totalVotes} votes</span>
          </div>
        </div>
        
        {/* Progress bar for time */}
        <Progress 
          value={Math.max(0, (timeLeft / 30) * 100)} 
          className="h-1 bg-white/10" 
        />
        
        <Separator className="bg-white/10 my-2" />
        
        {/* Choice options */}
        <div className="space-y-2">
          {choices.map((choice) => {
            const votePercent = getVotePercentage(choice.id);
            const isSelected = selectedChoice === choice.id;
            
            return (
              <div 
                key={choice.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-primary/30 border border-primary/70' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
                onClick={() => handleChoiceSelect(choice.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-white font-medium flex items-center gap-2">
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                    {choice.text}
                  </div>
                  
                  {/* Show vote counts if revealed or teacher */}
                  {(revealVotes || isTeacher) && (
                    <span className="text-white/70 text-sm">
                      {voteCount[choice.id] || 0} votes
                    </span>
                  )}
                </div>
                
                {/* Show progress bars if revealed or teacher */}
                {(revealVotes || isTeacher) && (
                  <Progress 
                    value={votePercent} 
                    className="h-2 bg-white/10" 
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {isTeacher ? (
          <Button
            onClick={toggleReveal}
            className={revealVotes ? "bg-amber-500 hover:bg-amber-600" : ""}
            variant={revealVotes ? "default" : "secondary"}
          >
            {revealVotes ? "Hide Results" : "Reveal Results"}
          </Button>
        ) : (
          <Button
            onClick={handleVote}
            disabled={!selectedChoice || hasVoted}
            className="flex gap-2"
          >
            {hasVoted ? (
              <>
                <Check className="h-4 w-4" />
                Vote Submitted
              </>
            ) : (
              <>
                Submit Vote
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EnhancedClassroomVoting;
