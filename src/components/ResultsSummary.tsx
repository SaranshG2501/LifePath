
import React from 'react';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MetricsDisplay from './MetricsDisplay';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home, Trophy } from 'lucide-react';

interface ResultsSummaryProps {
  gameState: GameState;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  gameState,
  onPlayAgain,
  onReturnHome,
}) => {
  // Calculate total metric changes
  const totalChanges = gameState.history.reduce(
    (acc, entry) => {
      Object.entries(entry.metricChanges).forEach(([key, value]) => {
        if (value) {
          acc[key as keyof typeof acc] = (acc[key as keyof typeof acc] || 0) + value;
        }
      });
      return acc;
    },
    {} as Record<string, number>
  );

  // Get ending message based on metrics
  const getEndingMessage = () => {
    const { metrics } = gameState;
    
    if (metrics.money > 80) {
      return "You've become quite the financial wizard! Your money management skills are impressive.";
    } else if (metrics.relationships > 80) {
      return "You've built strong relationships that will support you throughout life!";
    } else if (metrics.knowledge > 80) {
      return "Your dedication to learning has made you exceptionally knowledgeable!";
    } else if (metrics.happiness > 80) {
      return "You've prioritized your happiness and it shows! You're thriving emotionally.";
    } else if (metrics.health > 80) {
      return "Your health-conscious decisions have paid off with excellent well-being!";
    } else if (Object.values(metrics).every(val => val > 60)) {
      return "You've achieved a great balance in life across all areas!";
    } else if (Object.values(metrics).some(val => val < 30)) {
      return "You've faced some challenges, but every struggle is a learning opportunity.";
    }
    
    return "You've completed your journey with a unique set of experiences and outcomes!";
  };

  if (!gameState.currentScenario || !gameState.currentScene) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="shadow-lg border-primary/20 glassmorphic-card">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="p-4 rounded-full bg-primary/30 backdrop-blur-md border border-primary/50 animate-glow">
              <Trophy className="h-8 w-8 text-primary animate-float" />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-heading">Your Journey Results</CardTitle>
          <CardDescription className="text-base text-white/80">
            Here's how your choices shaped your path through "{gameState.currentScenario.title}"
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
            <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-white">
              <CheckCircle2 className="text-primary" />
              Journey Outcome
            </h3>
            <p className="text-base text-white/90">{getEndingMessage()}</p>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-3 text-white">Final Stats</h3>
            <MetricsDisplay metrics={gameState.metrics} />
          </div>
          
          <Separator className="bg-white/20" />
          
          <div>
            <h3 className="font-medium text-lg mb-3 text-white">Your Journey</h3>
            <div className="space-y-2">
              {gameState.history.map((entry, index) => {
                const scene = gameState.currentScenario?.scenes.find(s => s.id === entry.sceneId);
                const choice = scene?.choices.find(c => c.id === entry.choiceId);
                
                return (
                  <div key={index} className="bg-white/10 backdrop-blur-sm p-3 rounded-md border border-white/20">
                    <div className="font-medium text-white">{scene?.title}</div>
                    <div className="text-sm text-white/70">
                      Choice: {choice?.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onPlayAgain} className="w-full sm:w-auto bg-primary hover:bg-primary/80">
            Play Again
          </Button>
          <Button 
            variant="outline" 
            onClick={onReturnHome} 
            className="w-full sm:w-auto flex items-center gap-2 border-white/20 text-white hover:bg-white/10"
          >
            <Home size={16} />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResultsSummary;
