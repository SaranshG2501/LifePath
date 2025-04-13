
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, BarChart, ArrowRight } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { Scene, Choice } from '@/types/game';

interface ClassroomVotingProps {
  scene: Scene;
}

const ClassroomVoting: React.FC<ClassroomVotingProps> = ({ scene }) => {
  const { 
    classroomVotes, 
    revealVotes, 
    setRevealVotes, 
    userRole, 
    makeChoice,
    submitVote
  } = useGameContext();

  const totalVotes = Object.values(classroomVotes).reduce((sum, count) => sum + count, 0);
  
  const getVotePercentage = (choiceId: string) => {
    if (!totalVotes) return 0;
    return Math.round((classroomVotes[choiceId] || 0) / totalVotes * 100);
  };

  const handleChoiceClick = (choiceId: string) => {
    if (userRole === 'student' && !revealVotes) {
      submitVote(choiceId);
    } else if (userRole === 'teacher') {
      if (!revealVotes) {
        setRevealVotes(true);
      } else {
        makeChoice(choiceId);
      }
    }
  };

  const handleContinue = () => {
    // Get the choice with the most votes
    if (totalVotes > 0) {
      const topChoiceId = Object.entries(classroomVotes)
        .sort(([, a], [, b]) => b - a)[0][0];
      makeChoice(topChoiceId);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 border-primary/20 backdrop-blur-lg shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl text-white">Classroom Decision</CardTitle>
        </div>
        <CardDescription className="text-center text-white/80">
          {userRole === 'teacher' 
            ? 'Review class votes and facilitate discussion' 
            : 'Cast your vote and see how the class decided'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scene.choices.map((choice) => (
            <div key={choice.id} className="space-y-2">
              <Button
                variant="outline"
                className={`w-full justify-between py-6 px-4 text-left border ${
                  revealVotes && getVotePercentage(choice.id) > 0
                    ? 'border-primary/50 bg-primary/10'
                    : 'border-white/10 bg-black/30'
                } hover:bg-white/10 text-white`}
                onClick={() => handleChoiceClick(choice.id)}
              >
                <span className="text-base">{choice.text}</span>
                {revealVotes && (
                  <span className="font-mono font-bold">{getVotePercentage(choice.id)}%</span>
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
          <Button 
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
            onClick={handleContinue}
          >
            Continue with majority vote
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {userRole === 'student' && revealVotes && (
          <div className="text-white/80 text-center">
            <BarChart className="h-5 w-5 inline-block mr-2" />
            Waiting for teacher to continue...
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ClassroomVoting;
