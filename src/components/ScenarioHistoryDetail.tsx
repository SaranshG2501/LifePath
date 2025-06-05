
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, Calendar, Trophy } from 'lucide-react';
import { ScenarioHistory } from '@/lib/firebase';
import MetricsDisplay from './MetricsDisplay';
import { Metrics } from '@/types/game';

interface ScenarioHistoryDetailProps {
  history: ScenarioHistory;
  open: boolean;
  onClose: () => void;
}

const ScenarioHistoryDetail: React.FC<ScenarioHistoryDetailProps> = ({
  history,
  open,
  onClose
}) => {
  // Format dates
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firebase Timestamp
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString() + ' at ' + 
               new Date(timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Handle Date objects
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString() + ' at ' + 
               timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      return 'Unknown';
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Unknown';
    }
  };

  // Convert firebase metrics to component metrics format
  const convertToMetrics = (firebaseMetrics: any): Metrics => {
    if (!firebaseMetrics) {
      return { health: 50, money: 50, happiness: 50, knowledge: 50, relationships: 50 };
    }
    
    // If already in correct format
    if (firebaseMetrics.health !== undefined) {
      return firebaseMetrics;
    }
    
    // Convert from environmental/social/economic format
    return {
      health: Math.round((firebaseMetrics.environmental || 0) / 2),
      money: firebaseMetrics.economic || 50,
      happiness: Math.round((firebaseMetrics.social || 0) / 2),
      knowledge: Math.round((firebaseMetrics.environmental || 0) / 2),
      relationships: Math.round((firebaseMetrics.social || 0) / 2)
    };
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl bg-black/90 border border-white/10">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-neon-yellow" />
              {history.scenarioTitle || 'Scenario Results'}
            </DialogTitle>
            <Button 
              variant="ghost" 
              className="rounded-full w-8 h-8 p-0" 
              onClick={onClose}
            >
              <X className="h-4 w-4 text-white/70" />
            </Button>
          </div>
          <DialogDescription className="text-white/80 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Completed on {formatDate(history.completedAt)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 my-2">
          {/* Final Metrics */}
          {history.finalMetrics && (
            <div>
              <h3 className="font-medium mb-2 text-white">Your Final Stats</h3>
              <MetricsDisplay metrics={convertToMetrics(history.finalMetrics)} />
            </div>
          )}
          
          {/* Journey Choices */}
          <div>
            <h3 className="font-medium mb-2 text-white">Your Journey</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {history.choices.map((choice, index) => (
                <div 
                  key={index} 
                  className="bg-black/30 backdrop-blur-sm p-3 rounded-md border border-white/10 hover:bg-black/40 transition-all duration-200"
                >
                  <div className="font-medium text-white">{`Scene ${index + 1}`}</div>
                  <div className="text-sm text-white/70 flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{choice.choiceText || 'Choice made'}</div>
                      <div className="text-xs text-white/50 mt-1">
                        {formatDate(choice.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  {choice.metricChanges && Object.entries(choice.metricChanges).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {Object.entries(choice.metricChanges).map(([key, value]) => {
                        if (!value) return null;
                        
                        let color = "";
                        switch(key) {
                          case "health": color = value > 0 ? "bg-neon-red/20 text-neon-red" : "bg-red-900/20 text-red-300"; break;
                          case "money": color = value > 0 ? "bg-neon-green/20 text-neon-green" : "bg-green-900/20 text-green-300"; break;
                          case "happiness": color = value > 0 ? "bg-neon-yellow/20 text-neon-yellow" : "bg-yellow-900/20 text-yellow-300"; break;
                          case "knowledge": color = value > 0 ? "bg-neon-blue/20 text-neon-blue" : "bg-blue-900/20 text-blue-300"; break;
                          case "relationships": color = value > 0 ? "bg-neon-purple/20 text-neon-purple" : "bg-purple-900/20 text-purple-300"; break;
                          default: color = value > 0 ? "bg-white/20 text-white" : "bg-white/10 text-white/70";
                        }
                        
                        return (
                          <Badge key={key} variant="outline" className={`${color} border-none text-xs`}>
                            {key}: {value > 0 ? `+${value}` : value}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-secondary"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioHistoryDetail;
