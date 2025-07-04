import React from 'react';
import { GameState } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MetricsDisplay from './MetricsDisplay';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home, Trophy, Sparkles, Repeat, Star, Flame, ChevronRight, Award, TrendingUp, Brain, Heart } from 'lucide-react';
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
  
  console.log("ResultsSummary gameState:", gameState);
  console.log("ResultsSummary history:", gameState.history);
  
  // Calculate total metric changes
  const totalChanges = gameState.history.reduce(
    (acc, entry) => {
      if (entry.metricChanges) {
        Object.entries(entry.metricChanges).forEach(([key, value]) => {
          if (value) {
            acc[key as keyof typeof acc] = (acc[key as keyof typeof acc] || 0) + value;
          }
        });
      }
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

  // Get achievement badges based on metrics and choices
  const getAchievements = () => {
    const { metrics } = gameState;
    const achievements = [];

    if (metrics.money > 75) {
      achievements.push({ 
        title: 'Financial Wizard', 
        description: 'Masterful management of your finances',
        icon: <Award className="h-5 w-5 text-neon-yellow" />
      });
    }
    
    if (metrics.health > 75) {
      achievements.push({
        title: 'Health Champion',
        description: 'Prioritized your physical wellbeing',
        icon: <Heart className="h-5 w-5 text-neon-red" />
      });
    }
    
    if (metrics.knowledge > 75) {
      achievements.push({
        title: 'Knowledge Seeker',
        description: 'Pursued learning at every opportunity',
        icon: <Brain className="h-5 w-5 text-neon-blue" />
      });
    }
    
    if (metrics.relationships > 75) {
      achievements.push({
        title: 'Social Butterfly',
        description: 'Built meaningful connections with others',
        icon: <Heart className="h-5 w-5 text-neon-purple" />
      });
    }

    if (metrics.happiness > 75) {
      achievements.push({
        title: 'Joy Master',
        description: 'Found happiness along your journey',
        icon: <Star className="h-5 w-5 text-neon-yellow" />
      });
    }
    
    if (Object.values(metrics).every(val => val > 60)) {
      achievements.push({
        title: 'Balanced Achiever',
        description: 'Maintained balance in all areas of life',
        icon: <TrendingUp className="h-5 w-5 text-neon-green" />
      });
    }
    
    return achievements;
  };

  // Generate personalized tips based on game stats
  const getPersonalizedTips = () => {
    const { metrics } = gameState;
    const tips = [];
    
    // Find lowest metric to provide a focused tip
    const lowestMetric = Object.entries(metrics).reduce(
      (lowest, [key, value]) => value < lowest.value ? { key, value } : lowest,
      { key: '', value: 100 }
    );
    
    switch(lowestMetric.key) {
      case 'money':
        tips.push("Consider creating a simple budget to track your income and expenses.");
        break;
      case 'health':
        tips.push("Small daily habits like taking short walks can greatly improve your overall health.");
        break;
      case 'knowledge':
        tips.push("Setting aside just 15 minutes a day for learning can lead to major knowledge gains.");
        break;
      case 'relationships':
        tips.push("Quality connections often matter more than the quantity of relationships.");
        break;
      case 'happiness':
        tips.push("Taking time for activities you enjoy is essential for your emotional wellbeing.");
        break;
      default:
        tips.push("Reflecting on your decisions helps build better decision-making skills.");
    }
    
    // Add a general tip
    tips.push("The choices that seem small today can have significant impacts on your future self.");
    
    return tips;
  };

  // Evaluate decision-making style
  const getDecisionStyle = () => {
    const { history } = gameState;
    
    if (history.length === 0) {
      return "Start making some decisions to see your unique decision-making style emerge!";
    }
    
    // Analyze based on metric changes
    const riskyChoices = history.filter(entry => {
      if (!entry.metricChanges) return false;
      return Object.values(entry.metricChanges).some(change => change < -10);
    }).length;
    
    const cautiousChoices = history.filter(entry => {
      if (!entry.metricChanges) return false;
      return Object.values(entry.metricChanges).every(change => change >= 0);
    }).length;
    
    if (riskyChoices > cautiousChoices) {
      return "You tend to make bold, sometimes risky decisions. While this can lead to exciting opportunities, consider balancing with some caution.";
    } else if (cautiousChoices > riskyChoices) {
      return "You prefer safe, reliable choices. This stability is valuable, but occasionally taking calculated risks might open new doors.";
    } else {
      return "You balance risk and caution well in your decisions, adapting to situations thoughtfully.";
    }
  };

  // Get the actual choices made with scene context
  const getChoiceHistory = () => {
    console.log("Getting choice history from gameState.history:", gameState.history);
    
    if (!gameState.history || gameState.history.length === 0) {
      return [];
    }

    return gameState.history.map((entry, index) => {
      // Find the scene and choice from the current scenario
      const scene = gameState.currentScenario?.scenes.find(s => s.id === entry.sceneId);
      const choice = scene?.choices.find(c => c.id === entry.choiceId);
      
      console.log(`Choice ${index + 1}:`, {
        sceneId: entry.sceneId,
        choiceId: entry.choiceId,
        scene: scene?.title,
        choiceText: choice?.text,
        sceneDescription: scene?.description,
        metricChanges: entry.metricChanges
      });
      
      return {
        sceneTitle: scene?.title || `Scene ${index + 1}`,
        sceneDescription: scene?.description || '',
        choiceText: choice?.text || `Choice ${index + 1}`,
        metricChanges: entry.metricChanges || {},
        index: index + 1
      };
    });
  };

  if (!gameState.currentScenario || !gameState.currentScene) {
    return null;
  }

  const achievements = getAchievements();
  const personaltips = getPersonalizedTips();
  const choiceHistory = getChoiceHistory();

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
          
          {achievements.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <h3 className="font-medium text-lg mb-3 text-white flex items-center gap-2">
                <Award className="h-5 w-5 text-neon-yellow" />
                Achievements Unlocked
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className="bg-black/30 backdrop-blur-sm p-3 rounded-md border border-neon-yellow/30 hover:border-neon-yellow/60 transition-all flex items-start gap-2"
                  >
                    <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-2 rounded-full">
                      {achievement.icon}
                    </div>
                    <div>
                      <div className="font-medium text-white">{achievement.title}</div>
                      <div className="text-xs text-white/70">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="font-medium text-lg mb-3 text-white flex items-center gap-2">
              <Brain className="h-5 w-5 text-neon-blue" />
              Decision Style
            </h3>
            <div className="bg-black/30 backdrop-blur-sm p-4 rounded-md border border-white/10">
              <p className="text-white/90">{getDecisionStyle()}</p>
            </div>
          </div>
          
          <div className="animate-slide-up" style={{ animationDelay: '0.25s' }}>
            <h3 className="font-medium text-lg mb-3 text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-neon-green" />
              Tips For Your Journey
            </h3>
            <div className="space-y-3">
              {personaltips.map((tip, index) => (
                <div 
                  key={index}
                  className="bg-black/30 backdrop-blur-sm p-3 rounded-md border border-neon-green/20 flex items-start gap-2"
                >
                  <ChevronRight className="h-4 w-4 text-neon-green mt-0.5 flex-shrink-0" />
                  <p className="text-white/90 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </div>
          
          <Separator className="bg-white/20" />
          
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-medium text-lg mb-3 text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Your Choices & Decisions
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {choiceHistory.length > 0 ? (
                choiceHistory.map((choice, index) => {
                  const animationDelay = `${0.3 + index * 0.1}s`;
                  
                  return (
                    <div 
                      key={index} 
                      className="bg-black/30 backdrop-blur-sm p-5 rounded-lg border border-white/10 animate-slide-up hover:bg-black/40 transition-all duration-200"
                      style={{ animationDelay }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border-2 border-primary/40">
                          <span className="text-sm font-bold text-white">{choice.index}</span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="font-semibold text-white text-lg mb-1">{choice.sceneTitle}</div>
                            {choice.sceneDescription && (
                              <div className="text-sm text-white/70 mb-3 leading-relaxed">
                                {choice.sceneDescription}
                              </div>
                            )}
                          </div>
                          
                          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-md border border-primary/20">
                            <div className="text-xs text-primary font-medium mb-1">YOUR CHOICE:</div>
                            <div className="text-white font-medium leading-relaxed">{choice.choiceText}</div>
                          </div>
                          
                          {Object.keys(choice.metricChanges).length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              <div className="text-xs text-white/60 mr-2">Impact:</div>
                              {Object.entries(choice.metricChanges).map(([metric, change]) => (
                                <span 
                                  key={metric}
                                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                                    change > 0 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  }`}
                                >
                                  {metric.charAt(0).toUpperCase() + metric.slice(1)}: {change > 0 ? '+' : ''}{change}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-white/60">
                  <p className="font-medium">No choices recorded for this session</p>
                  <p className="text-sm mt-1">Your future games will show detailed choice history!</p>
                </div>
              )}
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
