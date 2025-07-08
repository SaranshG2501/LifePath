
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock } from 'lucide-react';

interface HistoryEntry {
  scenarioId: string;
  scenarioTitle: string;
  completedAt: Date;
  choices: {
    sceneTitle: string;
    choiceText: string;
    metricChanges: Record<string, number>;
  }[];
  finalMetrics: {
    health: number;
    money: number;
    happiness: number;
    knowledge: number;
    relationships: number;
  };
}

interface ScenarioHistoryTableProps {
  history: HistoryEntry[];
}

const ScenarioHistoryTable: React.FC<ScenarioHistoryTableProps> = ({ history }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMetricColor = (value: number) => {
    if (value >= 80) return 'text-green-400';
    if (value >= 60) return 'text-yellow-400';
    if (value >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (history.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-16 w-16 text-slate-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
          <p className="text-slate-400 text-center">
            Complete some scenarios to see your history here.
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
        </CardTitle>
        <CardDescription className="text-slate-400">
          Your completed scenarios and the choices you made
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50 hover:bg-slate-700/30">
                <TableHead className="text-slate-300">Scenario</TableHead>
                <TableHead className="text-slate-300">Completed</TableHead>
                <TableHead className="text-slate-300">Choices Made</TableHead>
                <TableHead className="text-slate-300">Final Metrics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((entry, index) => (
                <TableRow key={index} className="border-slate-700/50 hover:bg-slate-700/20">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-white font-medium">{entry.scenarioTitle}</div>
                      <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                        {entry.choices.length} choices
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-slate-300 text-sm">
                      <Calendar className="h-4 w-4" />
                      {formatDate(entry.completedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 max-w-xs">
                      {entry.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                          <div className="text-slate-300 text-sm font-medium mb-1">
                            {choice.sceneTitle}
                          </div>
                          <div className="text-slate-400 text-sm mb-2">
                            "{choice.choiceText}"
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {Object.entries(choice.metricChanges).map(([metric, change]) => (
                              <Badge 
                                key={metric} 
                                className={`text-xs border-0 ${
                                  change > 0 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : change < 0 
                                      ? 'bg-red-500/20 text-red-300'
                                      : 'bg-slate-500/20 text-slate-300'
                                }`}
                              >
                                {metric}: {change > 0 ? '+' : ''}{change}
                              </Badge>
                            ))}
                          </div>
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
