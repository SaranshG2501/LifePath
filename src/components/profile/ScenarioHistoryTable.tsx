
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock, ArrowUp, ArrowDown } from 'lucide-react';

import { ScenarioHistory, convertTimestampToDate, Timestamp } from '@/lib/firebase';

interface ScenarioHistoryTableProps {
  history: ScenarioHistory[];
}

const ScenarioHistoryTable: React.FC<ScenarioHistoryTableProps> = ({ history }) => {
  const formatDate = (dateValue: Date | Timestamp) => {
    const date = dateValue instanceof Date ? dateValue : convertTimestampToDate(dateValue);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getMetricChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="h-3 w-3 text-green-400" />;
    if (change < 0) return <ArrowDown className="h-3 w-3 text-red-400" />;
    return null;
  };

  const formatMetricName = (metric: string) => {
    return metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  if (history.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
          <p className="text-slate-400 text-center">
            Complete some scenarios to see your history here. Your choices, decisions, and metric changes will be tracked automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-blue-400" />
          Scenario History
          <Badge className="bg-blue-500/20 text-blue-300 border-0">
            {history.length} completed
          </Badge>
        </CardTitle>
        <CardDescription className="text-slate-400">
          Your completed scenarios with all choices and their impact on your metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50 hover:bg-slate-700/30">
                <TableHead className="text-slate-300">Scenario</TableHead>
                <TableHead className="text-slate-300">Completed</TableHead>
                <TableHead className="text-slate-300">All Choices & Decisions</TableHead>
                <TableHead className="text-slate-300">Final Metrics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={index} className="border-slate-700/50 hover:bg-slate-700/20">
                  <TableCell>
                    <div className="space-y-2">
                      <div className="text-white font-medium text-lg">{entry.scenarioTitle}</div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                          {entry.choices.length} decisions made
                        </Badge>
                        <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
                          ID: {entry.scenarioId}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Calendar className="h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{formatDate(entry.completedAt)}</span>
                        <span className="text-xs text-slate-500">
                          {Math.ceil((Date.now() - (entry.completedAt instanceof Date ? entry.completedAt : convertTimestampToDate(entry.completedAt)).getTime()) / (1000 * 60 * 60 * 24))} days ago
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-3 max-w-md">
                      {entry.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                          <div className="text-slate-300 text-sm font-medium mb-1">
                            Decision #{choiceIndex + 1}: {choice.sceneId}
                          </div>
                          <div className="text-slate-400 text-sm mb-3 italic">
                            "{choice.choiceText}"
                          </div>
                          
                          {Object.keys(choice.metricChanges).length > 0 ? (
                            <div className="space-y-1">
                              <div className="text-xs text-slate-500 mb-1">Impact:</div>
                              <div className="flex gap-2 flex-wrap">
                                {Object.entries(choice.metricChanges).map(([metric, change]) => (
                                  <Badge 
                                    key={metric} 
                                    className={`text-xs border-0 flex items-center gap-1 ${
                                      change > 0 
                                        ? 'bg-green-500/20 text-green-300' 
                                        : change < 0 
                                          ? 'bg-red-500/20 text-red-300'
                                          : 'bg-slate-500/20 text-slate-300'
                                    }`}
                                  >
                                    {getMetricChangeIcon(change)}
                                    {formatMetricName(metric)}: {change > 0 ? '+' : ''}{change}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-500">No metric changes</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={`flex items-center gap-1 ${getMetricColor(entry.finalMetrics.health)}`}>
                        <span className="text-slate-400">Health:</span>
                        <span className="font-medium">{entry.finalMetrics.health}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getMetricColor(entry.finalMetrics.money)}`}>
                        <span className="text-slate-400">Money:</span>
                        <span className="font-medium">{entry.finalMetrics.money}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getMetricColor(entry.finalMetrics.happiness)}`}>
                        <span className="text-slate-400">Happiness:</span>
                        <span className="font-medium">{entry.finalMetrics.happiness}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getMetricColor(entry.finalMetrics.knowledge)}`}>
                        <span className="text-slate-400">Knowledge:</span>
                        <span className="font-medium">{entry.finalMetrics.knowledge}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${getMetricColor(entry.finalMetrics.relationships)} col-span-2`}>
                        <span className="text-slate-400">Relationships:</span>
                        <span className="font-medium">{entry.finalMetrics.relationships}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioHistoryTable;
