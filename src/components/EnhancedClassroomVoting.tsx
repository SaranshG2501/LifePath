
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, Users, LineChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { recordStudentVote, getScenarioVotes, onVotesUpdated } from '@/lib/firebase';

interface EnhancedClassroomVotingProps {
  sceneId: string;
  choices: {
    id: string;
    text: string;
  }[];
  onContinue: () => void;
}

const EnhancedClassroomVoting: React.FC<EnhancedClassroomVotingProps> = ({
  sceneId,
  choices,
  onContinue
}) => {
  const { classroomId, revealVotes, setRevealVotes, userRole } = useGameContext();
  const { userProfile, currentUser } = useAuth();
  const { toast } = useToast();
  
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votes, setVotes] = useState<any[]>([]);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [percentages, setPercentages] = useState<Record<string, number>>({});
  const [hasVoted, setHasVoted] = useState(false);
  
  // Listen for votes in real-time
  useEffect(() => {
    if (!classroomId) return;
    
    const unsubscribe = onVotesUpdated(classroomId, (updatedVotes) => {
      setVotes(updatedVotes);
      
      // Calculate vote counts and percentages
      const counts: Record<string, number> = {};
      choices.forEach(choice => {
        counts[choice.id] = updatedVotes.filter(vote => vote.choiceId === choice.id).length;
      });
      
      setVoteCounts(counts);
      
      const totalVotes = Object.values(counts).reduce((sum, count) => sum + count, 0);
      const votePercentages: Record<string, number> = {};
      
      choices.forEach(choice => {
        votePercentages[choice.id] = totalVotes > 0 ? (counts[choice.id] / totalVotes) * 100 : 0;
      });
      
      setPercentages(votePercentages);
      
      // Check if current user has already voted
      if (currentUser) {
        setHasVoted(updatedVotes.some(vote => vote.studentId === currentUser.uid));
      }
    });
    
    return () => unsubscribe();
  }, [classroomId, choices, currentUser]);
  
  // Fetch initial votes when component loads
  useEffect(() => {
    const fetchInitialVotes = async () => {
      if (!classroomId) return;
      
      try {
        const fetchedVotes = await getScenarioVotes(classroomId);
        setVotes(fetchedVotes);
      } catch (error) {
        console.error('Error fetching votes:', error);
      }
    };
    
    fetchInitialVotes();
  }, [classroomId]);
  
  const handleVote = async (choiceId: string) => {
    if (!currentUser || !classroomId || isSubmitting || hasVoted) return;
    
    try {
      setIsSubmitting(true);
      setSelectedChoice(choiceId);
      
      await recordStudentVote(classroomId, currentUser.uid, choiceId);
      
      toast({
        title: "Vote submitted",
        description: "Your vote has been recorded.",
      });
      
      setHasVoted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your vote.",
        variant: "destructive",
      });
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const totalVotes = votes.length;
  const studentsWhoVoted = new Set(votes.map(vote => vote.studentId)).size;
  
  return (
    <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-white/10 backdrop-blur-md overflow-hidden shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-300" />
          Classroom Voting
        </CardTitle>
        <CardDescription className="text-white/70">
          {userRole === 'teacher' 
            ? 'Wait for students to vote on what happens next'
            : hasVoted 
              ? 'Waiting for other students to vote...' 
              : 'Choose what happens next in the story'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/70">
            <Users className="h-4 w-4 inline mr-1" /> 
            {studentsWhoVoted} student{studentsWhoVoted !== 1 ? 's' : ''} voted
          </span>
          
          {userRole === 'teacher' && (
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-indigo-300 hover:text-indigo-200 hover:bg-indigo-900/40"
              onClick={() => setRevealVotes(!revealVotes)}
            >
              {revealVotes ? 'Hide Results' : 'Show Results'}
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          {choices.map((choice) => (
            <div key={choice.id} className="relative">
              <Button
                variant="outline"
                className={`w-full text-left justify-between p-4 h-auto border ${
                  hasVoted && selectedChoice === choice.id 
                    ? 'border-green-400 bg-green-900/20' 
                    : 'border-white/10 bg-black/40 hover:bg-white/10'
                }`}
                onClick={() => !hasVoted && handleVote(choice.id)}
                disabled={isSubmitting || hasVoted}
              >
                <span className="mr-2">{choice.text}</span>
                {hasVoted && selectedChoice === choice.id && (
                  <Check className="h-5 w-5 text-green-400" />
                )}
              </Button>
              
              {(revealVotes || userRole === 'teacher') && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>{voteCounts[choice.id] || 0} votes</span>
                    <span>{Math.round(percentages[choice.id] || 0)}%</span>
                  </div>
                  <Progress 
                    value={percentages[choice.id] || 0} 
                    className="h-1 mt-1" 
                    indicatorClassName={`bg-gradient-to-r from-indigo-500 to-purple-500`} 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        
        {userRole === 'teacher' && (
          <div className="mt-6 flex justify-center">
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={onContinue}
            >
              Continue with Most Popular Choice
            </Button>
          </div>
        )}
        
        {hasVoted && userRole === 'student' && (
          <div className="bg-black/30 rounded-lg p-3 text-center">
            <LineChart className="h-5 w-5 mx-auto mb-2 text-indigo-300" />
            <p className="text-white/70">
              Waiting for teacher to continue the story...
            </p>
          </div>
        )}
        
        {isSubmitting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedClassroomVoting;
