
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Clock, Calendar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { ScenarioHistory } from '@/lib/firebase';

export interface ScenarioHistoryDetailProps {
  history: ScenarioHistory;
}

const ScenarioHistoryDetail: React.FC<ScenarioHistoryDetailProps> = ({ history }) => {
  const [expanded, setExpanded] = useState(false);

  // Format timestamp to readable date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return 'Unknown date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown date';
    }
  };
  
  // Get metric change indicators
  const getMetricChangeIcon = (value: number | undefined) => {
    if (!value) return null;
    if (value > 0) return <span className="text-green-400">+{value}</span>;
    if (value < 0) return <span className="text-red-400">{value}</span>;
    return <span className="text-gray-400">0</span>;
  };

  // Get colored badge for metric value
  const getMetricBadge = (name: string, value: number) => {
    let color = "bg-gray-500/30 text-gray-300";
    
    if (value > 80) color = "bg-green-500/30 text-green-300";
    else if (value > 60) color = "bg-blue-500/30 text-blue-300";
    else if (value > 40) color = "bg-yellow-500/30 text-yellow-300";
    else if (value > 20) color = "bg-orange-500/30 text-orange-300";
    else color = "bg-red-500/30 text-red-300";
    
    return (
      <Badge className={`${color} border-0 font-normal text-xs`}>
        {name}: {value}
      </Badge>
    );
  };
  
  return (
    <Card className="bg-black/30 border-white/10">
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-white font-medium">{history.scenarioTitle}</h4>
            <div className="flex items-center gap-2 text-white/60 mt-1 text-sm">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(history.completedAt)}</span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setExpanded(!expanded)}
            className="text-white hover:bg-white/10"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {history.finalMetrics && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(history.finalMetrics).map(([key, value]) => (
              <React.Fragment key={key}>
                {getMetricBadge(key, Number(value))}
              </React.Fragment>
            ))}
          </div>
        )}
        
        {expanded && (
          <>
            <Separator className="my-3 bg-white/10" />
            <div className="space-y-3">
              <div className="text-sm text-white font-medium">Choices Made</div>
              
              {history.choices && history.choices.length > 0 ? (
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {history.choices.map((choice, index) => (
                    <div key={index} className="bg-black/20 rounded p-2 text-sm">
                      <div className="text-white">{choice.choiceText || 'Made a choice'}</div>
                      
                      {choice.metricChanges && (
                        <div className="flex flex-wrap gap-x-3 mt-1 text-xs text-white/70">
                          {Object.entries(choice.metricChanges).map(([key, change]) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="capitalize">{key}:</span>
                              {getMetricChangeIcon(Number(change))}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {choice.timestamp && (
                        <div className="text-xs text-white/50 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {choice.timestamp instanceof Date ? 
                            choice.timestamp.toLocaleTimeString() : 
                            'Unknown time'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-white/60 text-sm">No detailed choice history available</div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioHistoryDetail;
