
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useGameContext } from '@/context/GameContext';
import { Home, BarChart, Award, Star, TrendingUp, Trophy, Heart, DollarSign, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ResultsSummaryProps {
  onReset: () => void;
}

const ResultsSummary: React.FC<ResultsSummaryProps> = ({ onReset }) => {
  const navigate = useNavigate();
  const { gameState, sceneHistory } = useGameContext();
  const [showAchievement, setShowAchievement] = useState(false);
  
  // Check if we have a scenario and choices
  if (!gameState.currentScenario || !gameState.choices.length) {
    return (
      <Card className="w-full max-w-3xl mx-auto bg-black/30 backdrop-blur-md border-primary/20">
        <CardHeader>
          <CardTitle className="text-white">No Scenario Data</CardTitle>
          <CardDescription className="text-white/70">
            No scenario has been completed yet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate('/')} className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  // Get the first choice and final metrics
  const firstChoice = gameState.choices[0];
  const finalMetrics = gameState.metrics;
  const { currentScenario } = gameState;
  
  // Calculate total changes for each metric from the beginning
  const metricChanges = {
    health: finalMetrics.health - 50,
    money: finalMetrics.money - 50,
    happiness: finalMetrics.happiness - 50,
    knowledge: finalMetrics.knowledge - 50,
    relationships: finalMetrics.relationships - 50,
  };

  // Get icon for each metric
  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'health':
        return <Heart className="h-5 w-5 text-red-400" />;
      case 'money':
        return <DollarSign className="h-5 w-5 text-green-400" />;
      case 'happiness':
        return <Star className="h-5 w-5 text-yellow-400" />;
      case 'knowledge':
        return <Award className="h-5 w-5 text-blue-400" />;
      case 'relationships':
        return <User className="h-5 w-5 text-purple-400" />;
      default:
        return <BarChart className="h-5 w-5 text-gray-400" />;
    }
  };

  // Get change direction indicator
  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-400">+{change}</span>;
    if (change < 0) return <span className="text-red-400">{change}</span>;
    return <span className="text-gray-400">0</span>;
  };

  // Check for achievements
  const perfectScore = Object.values(finalMetrics).every(value => value >= 80);
  const balancedScore = Object.values(finalMetrics).every(value => value >= 40 && value <= 60);
  const hasAchievement = perfectScore || balancedScore;

  // Show achievement notification after a delay
  useEffect(() => {
    if (hasAchievement) {
      const timer = setTimeout(() => {
        setShowAchievement(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [hasAchievement]);

  return (
    <Card className="w-full max-w-3xl mx-auto bg-gradient-to-b from-black/40 to-indigo-950/30 backdrop-blur-md border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-white">{currentScenario.title}</CardTitle>
            <CardDescription className="text-white/70 mt-1">
              Scenario Summary & Results
            </CardDescription>
          </div>
          
          {hasAchievement && showAchievement && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white border-0 animate-pulse">
              <Trophy className="mr-1 h-4 w-4" />
              Achievement Unlocked!
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Final Stats
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(finalMetrics).map(([metric, value]) => (
              <div key={metric} className="bg-black/30 rounded-lg p-4 flex flex-col items-center">
                <div className="rounded-full bg-black/40 p-3 mb-2">
                  {getMetricIcon(metric)}
                </div>
                
                <div className="font-bold text-xl text-white">
                  {value}
                </div>
                
                <div className="text-sm text-white/70 capitalize">
                  {metric}
                </div>
                
                <div className={`text-sm mt-1 flex items-center gap-1 ${
                  metricChanges[metric as keyof typeof metricChanges] > 0 
                    ? 'text-green-400' 
                    : metricChanges[metric as keyof typeof metricChanges] < 0 
                      ? 'text-red-400' 
                      : 'text-gray-400'
                }`}>
                  {metricChanges[metric as keyof typeof metricChanges] > 0 && '+'}{metricChanges[metric as keyof typeof metricChanges]}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="bg-white/10" />
        
        <div>
          <h3 className="text-xl font-semibold text-white mb-3">Key Choices</h3>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {gameState.choices.map((choice, index) => {
              const scene = currentScenario.scenes.find(s => s.id === choice.sceneId);
              const choiceObj = scene?.choices.find(c => c.id === choice.choiceId);
              
              return (
                <div key={index} className="bg-black/30 rounded-lg p-4">
                  <div className="font-medium text-white">
                    {scene?.title || `Scene ${index + 1}`}
                  </div>
                  
                  <div className="text-primary mt-1">
                    {choice.text || choiceObj?.text || 'Made a choice'}
                  </div>
                  
                  {choice.metricChanges && Object.keys(choice.metricChanges).length > 0 && (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                      {Object.entries(choice.metricChanges).map(([metric, change]) => (
                        <div key={metric} className="flex items-center gap-2">
                          {getMetricIcon(metric)}
                          <span className="text-white/80 capitalize">{metric}:</span>
                          {getChangeIndicator(change as number)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {hasAchievement && (
          <>
            <Separator className="bg-white/10" />
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                Achievements
              </h3>
              
              <div className="bg-gradient-to-r from-amber-950/30 to-yellow-900/30 rounded-lg p-4 border border-yellow-500/20">
                {perfectScore && (
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-2">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Perfect Score</div>
                      <div className="text-white/70">You achieved excellent stats in all categories!</div>
                    </div>
                  </div>
                )}
                
                {balancedScore && (
                  <div className="flex items-center gap-3 mt-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-2">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Balanced Approach</div>
                      <div className="text-white/70">You maintained a balanced life across all categories!</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3 border-t border-white/10 pt-4 bg-black/20">
        <Button 
          variant="outline" 
          className="bg-transparent border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
          onClick={onReset}
        >
          Play Another Scenario
        </Button>
        
        <Button 
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          onClick={() => navigate('/profile')}
        >
          <BarChart className="mr-2 h-4 w-4" />
          View My Progress
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultsSummary;
