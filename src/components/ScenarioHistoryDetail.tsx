
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
            {history.scenarioTitle || 'Completed Scenario'}
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
                    {history.finalMetrics ? Object.values(history.finalMetrics).reduce((a, b) => a + b, 0) : 'N/A'}
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
                        <div className="text-2xl font-bold">{value || 0}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Choice History with Full Details */}
          {history.choices && history.choices.length > 0 ? (
            <Card className="bg-black/30 border-slate-600/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Your Complete Journey ({history.choices.length} decisions)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {history.choices.map((choice, index) => {
                  console.log(`Rendering choice ${index + 1}:`, choice);
                  
                  // Use the actual choice properties as they exist in the data
                  const choiceText = choice?.choiceText || choice?.text || `Decision ${index + 1}`;
                  const sceneTitle = choice?.sceneId || `Scene ${index + 1}`;
                  const sceneDescription = choice?.sceneDescription || choice?.description;
                  
                  // Handle timestamp safely
                  let timestamp: Date;
                  try {
                    if (choice?.timestamp) {
                      timestamp = convertTimestampToDate(choice.timestamp);
                    } else {
                      timestamp = new Date();
                    }
                  } catch (error) {
                    console.warn('Invalid timestamp for choice:', choice?.timestamp);
                    timestamp = new Date();
                  }
                  
                  // Handle metric changes safely
                  const metricChanges = choice?.metricChanges || choice?.effects || {};
                  
                  return (
                    <div key={index} className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
                      <div className="flex items-start justify-between mb-4">
                        <Badge className="bg-primary/20 text-primary border-0 px-3 py-1">
                          Decision {index + 1}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Scene/Question context */}
                      <div className="mb-4">
                        <h4 className="text-white font-semibold text-lg mb-2">{sceneTitle}</h4>
                        {sceneDescription && (
                          <p className="text-slate-300 text-sm mb-3 bg-slate-700/30 p-3 rounded">
                            {sceneDescription}
                          </p>
                        )}
                      </div>
                      
                      {/* The actual choice made */}
                      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-primary/20 mb-4">
                        <p className="text-xs text-primary font-medium mb-2">YOUR CHOICE:</p>
                        <p className="text-white font-medium text-base leading-relaxed">
                          {choiceText}
                        </p>
                      </div>
                      
                      {/* Impact/Consequences */}
                      {metricChanges && Object.keys(metricChanges).length > 0 && (
                        <div>
                          <p className="text-sm text-slate-400 mb-3 font-medium">Impact on your life:</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(metricChanges).map(([key, value]) => {
                              if (!value || value === 0) return null;
                              
                              let color = '';
                              let icon = '';
                              const numValue = typeof value === 'number' ? value : parseInt(String(value)) || 0;
                              
                              switch(key) {
                                case 'health':
                                  color = numValue > 0 ? 'text-red-300 bg-red-500/20 border-red-500/30' : 'text-red-500 bg-red-500/10 border-red-500/20';
                                  icon = '❤️';
                                  break;
                                case 'money':
                                  color = numValue > 0 ? 'text-green-300 bg-green-500/20 border-green-500/30' : 'text-green-500 bg-green-500/10 border-green-500/20';
                                  icon = '💰';
                                  break;
                                case 'happiness':
                                  color = numValue > 0 ? 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30' : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
                                  icon = '😊';
                                  break;
                                case 'knowledge':
                                  color = numValue > 0 ? 'text-blue-300 bg-blue-500/20 border-blue-500/30' : 'text-blue-500 bg-blue-500/10 border-blue-500/20';
                                  icon = '📚';
                                  break;
                                case 'relationships':
                                  color = numValue > 0 ? 'text-purple-300 bg-purple-500/20 border-purple-500/30' : 'text-purple-500 bg-purple-500/10 border-purple-500/20';
                                  icon = '👥';
                                  break;
                                default:
                                  color = numValue > 0 ? 'text-gray-300 bg-gray-500/20 border-gray-500/30' : 'text-gray-500 bg-gray-500/10 border-gray-500/20';
                                  icon = '⭐';
                              }
                              
                              return (
                                <span key={key} className={`text-sm px-3 py-2 rounded-full ${color} border flex items-center gap-2`}>
                                  <span>{icon}</span>
                                  <span className="capitalize font-medium">{key}</span>
                                  <span className="font-bold">{numValue > 0 ? '+' : ''}{numValue}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-black/30 border-slate-600/30">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No detailed choice history available for this scenario.</p>
                <p className="text-slate-500 text-sm mt-2">This might be an older completed scenario.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScenarioHistoryDetail;
