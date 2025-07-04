
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, DollarSign, Smile, Brain, Users as UsersIcon, Clock, Wifi, HelpCircle } from 'lucide-react';
import { Scene } from '@/types/game';
import { LiveSession } from '@/lib/firebase';

interface SceneDisplayProps {
  scene: Scene;
  onChoiceMade: (choiceId: string) => void;
  isLiveSession?: boolean;
  liveSession?: LiveSession | null;
  disabled?: boolean;
}

const SceneDisplay: React.FC<SceneDisplayProps> = ({ 
  scene, 
  onChoiceMade, 
  isLiveSession = false,
  liveSession = null,
  disabled = false
}) => {
  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'health': return <Heart className="h-4 w-4" />;
      case 'money': return <DollarSign className="h-4 w-4" />;
      case 'happiness': return <Smile className="h-4 w-4" />;
      case 'knowledge': return <Brain className="h-4 w-4" />;
      case 'relationships': return <UsersIcon className="h-4 w-4" />;
      default: return null;
    }
  };

  const getMetricColor = (value: number) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-white/70';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/40 border-primary/20 backdrop-blur-lg shadow-xl animate-fade-in">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isLiveSession && (
            <Badge className="bg-green-500/20 text-green-300 border-0">
              <Wifi className="h-3 w-3 mr-1" />
              Live Session
            </Badge>
          )}
          {scene.isEnding && (
            <Badge className="bg-purple-500/20 text-purple-300 border-0">
              <Clock className="h-3 w-3 mr-1" />
              Final Scene
            </Badge>
          )}
        </div>
        <CardTitle className="text-2xl text-white mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          {scene.title}
        </CardTitle>
        
        {/* Question/Scenario Description - Smaller text for individual mode */}
        <CardDescription className={`text-white/90 leading-relaxed bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20 ${
          isLiveSession 
            ? 'text-xl font-bold p-6' // Large text for live sessions
            : 'text-base font-medium' // Smaller text for individual mode
        }`}>
          <div className={`text-primary mb-2 ${isLiveSession ? 'text-2xl' : 'text-lg'}`}>
            {isLiveSession ? 'Scenario Question:' : 'Question:'}
          </div>
          <div className={isLiveSession ? 'text-xl font-bold' : 'text-base font-medium'}>
            {scene.description}
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-white font-semibold text-lg mb-2">What will you choose?</h3>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
          
          {scene.choices.map((choice, index) => (
            <div key={choice.id} className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-between py-6 px-6 text-left border-white/10 bg-black/30 hover:bg-white/10 text-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed relative"
                onClick={() => onChoiceMade(choice.id)}
                disabled={disabled}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center border border-primary/40">
                    <span className="text-sm font-bold text-primary">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <span className="text-base leading-relaxed flex-1">{choice.text}</span>
                </div>
                
                {choice.metricChanges && Object.keys(choice.metricChanges).length > 0 && (
                  <div className="flex gap-2 ml-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    {Object.entries(choice.metricChanges).map(([metric, value]) => (
                      <div key={metric} className={`flex items-center gap-1 ${getMetricColor(value)}`}>
                        {getMetricIcon(metric)}
                        <span className="text-sm font-mono">
                          {value > 0 ? '+' : ''}{value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Button>
            </div>
          ))}
        </div>
        
        {isLiveSession && liveSession && (
          <div className="mt-6 p-4 bg-black/20 rounded-lg border border-blue-500/20">
            <div className="flex items-center justify-between text-sm text-white/70 mb-2">
              <span className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-green-400" />
                Live Session: {liveSession.scenarioTitle}
              </span>
              <span>Participants: {liveSession.participants.length}</span>
            </div>
            {disabled && (
              <div className="mt-2 text-xs text-yellow-400 bg-yellow-400/10 p-2 rounded">
                ✓ Your choice has been recorded. Waiting for other students to vote...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SceneDisplay;
