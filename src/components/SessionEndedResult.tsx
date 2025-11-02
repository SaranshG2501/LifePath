import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Home, Info } from 'lucide-react';
import { GameState } from '@/types/game';
import MetricsDisplay from './MetricsDisplay';
import { useIsMobile } from '@/hooks/use-mobile';

interface SessionEndedResultProps {
  gameState: GameState;
  onReturnHome: () => void;
  message?: string;
}

const SessionEndedResult: React.FC<SessionEndedResultProps> = ({
  gameState,
  onReturnHome,
  message = "The teacher has ended this live session."
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="w-full max-w-3xl mx-auto animate-scale-in">
      <Card className="shadow-lg border-orange-500/30 glassmorphic-card">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-orange-500/30 to-red-500/30 backdrop-blur-md border border-orange-500/50 animate-pulse">
              <AlertCircle className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl gradient-heading flex items-center justify-center gap-2">
            <Info className="h-5 w-5 text-orange-400" />
            Session Ended by Teacher
          </CardTitle>
          <CardDescription className="text-base mt-2 text-white/90">
            {message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 p-5 rounded-lg border border-orange-500/30 animate-slide-up">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-xl mb-2 text-white">
                Session Summary
              </h3>
              <p className="text-white/90 text-base">
                Your teacher ended the live session for <strong>"{gameState.currentScenario?.title || 'this scenario'}"</strong>.
              </p>
              <div className="bg-black/30 rounded-md p-3 mt-3">
                <p className="text-white/80 text-sm">
                  Your progress has been saved. You can return to the home page and wait for your teacher to start the next live session!
                </p>
              </div>
            </div>
          </div>
          
          {gameState.metrics && (
            <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-medium text-lg mb-3 text-white text-center">
                Your Progress Until Session End
              </h3>
              <MetricsDisplay metrics={gameState.metrics} compact={isMobile} />
            </div>
          )}

          <div className="bg-black/30 backdrop-blur-sm p-4 rounded-md border border-blue-500/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-white mb-1">What Happens Next?</h4>
                <p className="text-white/80 text-sm">
                  Your teacher may start a new session soon. Stay tuned for notifications when the next live session begins!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center animate-slide-up pt-4" style={{ animationDelay: '0.3s' }}>
          <Button 
            onClick={onReturnHome} 
            className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <Home size={16} />
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SessionEndedResult;
