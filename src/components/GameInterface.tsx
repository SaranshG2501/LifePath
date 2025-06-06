
import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, DollarSign, Smile, Brain, Users } from 'lucide-react';

const GameInterface = () => {
  const { gameState, makeChoice, playAgain } = useGameContext();

  if (!gameState.currentScenario || !gameState.currentScene) {
    return null;
  }

  const { currentScene, metrics, isEnded } = gameState;

  if (isEnded) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="bg-black/30 border-primary/20">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              Scenario Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-white/80 text-lg mb-6">
                You've successfully completed this scenario. Here are your final metrics:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-red-500/20 rounded-lg p-4">
                  <Heart className="h-6 w-6 text-red-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{metrics.health}</div>
                  <div className="text-white/60 text-sm">Health</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-4">
                  <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{metrics.money}</div>
                  <div className="text-white/60 text-sm">Money</div>
                </div>
                <div className="bg-yellow-500/20 rounded-lg p-4">
                  <Smile className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{metrics.happiness}</div>
                  <div className="text-white/60 text-sm">Happiness</div>
                </div>
                <div className="bg-blue-500/20 rounded-lg p-4">
                  <Brain className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{metrics.knowledge}</div>
                  <div className="text-white/60 text-sm">Knowledge</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg p-4">
                  <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-bold">{metrics.relationships}</div>
                  <div className="text-white/60 text-sm">Relationships</div>
                </div>
              </div>
              
              <Button 
                onClick={playAgain}
                className="bg-primary hover:bg-primary/90"
              >
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Metrics Display */}
      <Card className="bg-black/30 border-primary/20">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Heart className="h-4 w-4 text-red-400" />
                <span className="text-white text-sm">Health</span>
              </div>
              <Progress value={metrics.health} className="h-2" />
              <span className="text-white/70 text-xs">{metrics.health}/100</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">Money</span>
              </div>
              <Progress value={metrics.money} className="h-2" />
              <span className="text-white/70 text-xs">{metrics.money}/100</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Smile className="h-4 w-4 text-yellow-400" />
                <span className="text-white text-sm">Happiness</span>
              </div>
              <Progress value={metrics.happiness} className="h-2" />
              <span className="text-white/70 text-xs">{metrics.happiness}/100</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-blue-400" />
                <span className="text-white text-sm">Knowledge</span>
              </div>
              <Progress value={metrics.knowledge} className="h-2" />
              <span className="text-white/70 text-xs">{metrics.knowledge}/100</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm">Relationships</span>
              </div>
              <Progress value={metrics.relationships} className="h-2" />
              <span className="text-white/70 text-xs">{metrics.relationships}/100</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scene Display */}
      <Card className="bg-black/30 border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">{currentScene.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentScene.description && (
            <p className="text-white/80">{currentScene.description}</p>
          )}
          
          <div className="space-y-3">
            {currentScene.choices.map((choice) => (
              <Button
                key={choice.id}
                variant="outline"
                className="w-full text-left justify-start border-white/20 text-white hover:bg-white/10 h-auto p-4"
                onClick={() => makeChoice(choice.id)}
              >
                <div>
                  <div className="font-medium">{choice.text}</div>
                  {choice.tooltip && (
                    <div className="text-sm text-white/60 mt-1">{choice.tooltip}</div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameInterface;
