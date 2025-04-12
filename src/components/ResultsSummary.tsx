
import React from 'react';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MetricsDisplay from './MetricsDisplay';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home, Trophy, Sparkles, Repeat, Star, Flame } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
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
    <div className="w-full max-w-4xl mx-auto animate-scale-in">
      <Card className="shadow-lg border-primary/20 glassmorphic-card">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 backdrop-blur-md border border-primary/50 animate-glow relative">
              <Trophy className="h-8 w-8 text-neon-yellow animate-float" />
              <Sparkles className="h-4 w-4 absolute top-0 right-0 text-neon-yellow animate-pulse" />
              <Sparkles className="h-4 w-4 absolute bottom-0 left-0 text-neon-yellow animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-heading flex items-center justify-center gap-2">
            <Star className="h-5 w-5 text-neon-yellow animate-pulse" />
            Your Journey Results
            <Star className="h-5 w-5 text-neon-yellow animate-pulse" style={{ animationDelay: '0.5s' }} />
          </CardTitle>
          <CardDescription className="text-base mt-1 text-white/90">
            Here's how your choices shaped your path through "{gameState.currentScenario.title}"
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/30 animate-slide-up relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm -z-10"></div>
            <h3 className="font-medium text-lg mb-2 flex items-center gap-2 text-white">
              <Flame className="text-neon-yellow" />
              Journey Outcome
            </h3>
            <p className="text-base text-white/90">{getEndingMessage()}</p>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="font-medium text-lg mb-3 text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Final Stats
            </h3>
            <MetricsDisplay metrics={gameState.metrics} compact={isMobile} />
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-medium text-lg mb-3 text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Your Journey
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {gameState.history.map((entry, index) => {
                const scene = gameState.currentScenario?.scenes.find(s => s.id === entry.sceneId);
                const choice = scene?.choices.find(c => c.id === entry.choiceId);
                const animationDelay = `${0.3 + index * 0.1}s`;
                
                return (
                  <div 
                    key={index} 
                    className="bg-black/30 backdrop-blur-sm p-3 rounded-md border border-white/10 animate-slide-up hover:bg-black/40 transition-all duration-200"
                    style={{ animationDelay }}
                  >
                    <div className="font-medium text-white">{scene?.title}</div>
                    <div className="text-sm text-white/70 flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      {choice?.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 animate-slide-up pt-4" style={{ animationDelay: '0.5s' }}>
          <Button 
            onClick={onPlayAgain} 
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
          >
            <Repeat className="h-4 w-4 mr-2" />
            Play Again
          </Button>
          <Button 
            variant="outline" 
            onClick={onReturnHome} 
            className="w-full sm:w-auto flex items-center gap-2 border-white/20 text-white hover:bg-white/10 bg-black/30"
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
