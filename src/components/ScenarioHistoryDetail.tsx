
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, Trophy, TrendingUp, Users, BookOpen } from 'lucide-react';
import { ScenarioHistory } from '@/lib/firebase';
import { convertTimestampToDate } from '@/lib/firebase';

interface ScenarioHistoryDetailProps {
  history: ScenarioHistory | null;
  open: boolean;
  onClose: () => void;
}

const ScenarioHistoryDetail: React.FC<ScenarioHistoryDetailProps> = ({
  history,
  open,
  onClose,
}) => {
  if (!history) return null;

  const completedDate = history.completedAt ? convertTimestampToDate(history.completedAt) : new Date();
  const totalChoices = history.choices?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900/95 to-slate-800/95 border-slate-700/50 backdrop-blur-sm">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {history.scenarioTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-black/30 border-slate-600/30">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="text-white font-medium">
                    {completedDate.toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-slate-600/30">
              <CardContent className="p-4 flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm text-slate-400">Choices Made</p>
                  <p className="text-white font-medium">{totalChoices}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border-slate-600/30">
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Final Score</p>
                  <p className="text-white font-medium">
                    {Object.values(history.finalMetrics || {}).reduce((a, b) => a + b, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Metrics */}
          {history.finalMetrics && (
            <Card className="bg-black/30 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Final Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(history.finalMetrics).map(([key, value]) => {
                    let color = '';
                    let icon = '';
                    switch(key) {
                      case 'health':
                        color = 'text-red-400 bg-red-500/20';
                        icon = '❤️';
                        break;
                      case 'money':
                        color = 'text-green-400 bg-green-500/20';
                        icon = '💰';
                        break;
                      case 'happiness':
                        color = 'text-yellow-400 bg-yellow-500/20';
                        icon = '😊';
                        break;
                      case 'knowledge':
                        color = 'text-blue-400 bg-blue-500/20';
                        icon = '📚';
                        break;
                      case 'relationships':
                        color = 'text-purple-400 bg-purple-500/20';
                        icon = '👥';
                        break;
                      default:
                        color = 'text-gray-400 bg-gray-500/20';
                        icon = '⭐';
                    }
                    
                    return (
                      <div key={key} className={`p-3 rounded-lg ${color}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{icon}</span>
                          <span className="text-sm font-medium capitalize">{key}</span>
                        </div>
                        <div className="text-2xl font-bold">{value}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Choice History */}
          {history.choices && history.choices.length > 0 && (
            <Card className="bg-black/30 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Your Journey ({history.choices.length} choices)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.choices.map((choice, index) => (
                  <div key={index} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-primary/20 text-primary border-0">
                        Choice {index + 1}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {choice.timestamp ? convertTimestampToDate(choice.timestamp).toLocaleString() : 'Unknown time'}
                      </span>
                    </div>
                    
                    <p className="text-white mb-3">{choice.choiceText}</p>
                    
                    {choice.metricChanges && Object.keys(choice.metricChanges).length > 0 && (
                      <div>
                        <p className="text-sm text-slate-400 mb-2">Impact:</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(choice.metricChanges).map(([key, value]) => {
                            if (!value) return null;
                            
                            let color = '';
                            let icon = '';
                            switch(key) {
                              case 'health':
                                color = value > 0 ? 'text-red-300 bg-red-500/20' : 'text-red-500 bg-red-500/10';
                                icon = '❤️';
                                break;
                              case 'money':
                                color = value > 0 ? 'text-green-300 bg-green-500/20' : 'text-green-500 bg-green-500/10';
                                icon = '💰';
                                break;
                              case 'happiness':
                                color = value > 0 ? 'text-yellow-300 bg-yellow-500/20' : 'text-yellow-500 bg-yellow-500/10';
                                icon = '😊';
                                break;
                              case 'knowledge':
                                color = value > 0 ? 'text-blue-300 bg-blue-500/20' : 'text-blue-500 bg-blue-500/10';
                                icon = '📚';
                                break;
                              case 'relationships':
                                color = value > 0 ? 'text-purple-300 bg-purple-500/20' : 'text-purple-500 bg-purple-500/10';
                                icon = '👥';
                                break;
                              default:
                                color = value > 0 ? 'text-gray-300 bg-gray-500/20' : 'text-gray-500 bg-gray-500/10';
                                icon = '⭐';
                            }
                            
                            return (
                              <span key={key} className={`text-xs px-2 py-1 rounded-full ${color} flex items-center gap-1`}>
                                <span>{icon}</span>
                                <span className="capitalize">{key}</span>
                                <span>{value > 0 ? '+' : ''}{value}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioHistoryDetail;
