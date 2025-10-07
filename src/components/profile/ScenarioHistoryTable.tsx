
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, Clock, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

import { ScenarioHistory, convertTimestampToDate, Timestamp } from '@/lib/firebase';

interface ScenarioHistoryTableProps {
  history: ScenarioHistory[];
}

const ScenarioHistoryTable: React.FC<ScenarioHistoryTableProps> = ({ history }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

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
      <Card className="bg-gradient-to-br from-card/60 to-card/40 border-primary/30 backdrop-blur-xl shadow-2xl overflow-hidden relative animate-scale-in">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-shimmer"></div>
        <CardContent className="flex flex-col items-center justify-center py-16 relative">
          <div className="p-6 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-6 animate-float">
            <BookOpen className="h-16 w-16 text-primary animate-glow" />
          </div>
          <h3 className="text-2xl font-bold gradient-heading mb-3">No History Yet</h3>
          <p className="text-slate-300 text-center max-w-md text-lg">
            Complete some scenarios to see your history here. Your choices, decisions, and metric changes will be tracked automatically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card/60 to-card/40 border-primary/30 backdrop-blur-xl shadow-2xl overflow-hidden relative animate-scale-in">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-shimmer"></div>
      <CardHeader className="relative pb-3 sm:pb-4 p-4 sm:p-6">
        <CardTitle className="text-white flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-lg animate-glow">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <span className="break-words gradient-heading">Scenario History</span>
          <Badge className="ml-1 sm:ml-2 bg-gradient-to-r from-primary/30 to-secondary/30 text-primary border-primary/30 text-xs sm:text-sm animate-pulse-slow">
            {history.length} completed
          </Badge>
        </CardTitle>
        <CardDescription className="text-slate-300 text-sm sm:text-base">
          Your completed scenarios with all choices and their impact on your metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 relative">
        <div className="space-y-3 sm:space-y-4">
          {history.map((entry, index) => {
            const isOpen = openItems.has(index);
            return (
              <Collapsible
                key={index}
                open={isOpen}
                onOpenChange={() => toggleItem(index)}
              >
                <div 
                  className="group bg-gradient-to-r from-slate-800/60 to-slate-700/40 backdrop-blur-sm rounded-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-secondary/5 to-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative p-4 sm:p-6">
                    {/* Header with Toggle */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors break-words">
                          {entry.scenarioTitle}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30 text-xs">
                            {entry.choices.length} decisions
                          </Badge>
                          <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30 text-xs">
                            ID: {entry.scenarioId}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-300 text-xs sm:text-sm bg-slate-900/50 px-3 py-2 rounded-lg backdrop-blur-sm">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-primary shrink-0" />
                        <div className="flex flex-col">
                          <span className="break-words font-medium">{formatDate(entry.completedAt)}</span>
                          <span className="text-xs text-slate-500">
                            {Math.ceil((Date.now() - (entry.completedAt instanceof Date ? entry.completedAt : convertTimestampToDate(entry.completedAt)).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30 text-primary hover:bg-primary/20 hover:border-primary/50 transition-all duration-200 mb-3"
                      >
                        <span className="flex items-center gap-2">
                          {isOpen ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide Decisions & Metrics
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              Show Decisions & Metrics
                            </>
                          )}
                        </span>
                      </Button>
                    </CollapsibleTrigger>

                    {/* Collapsible Content */}
                    <CollapsibleContent className="space-y-4 pt-2">
                      {/* Choices */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="text-sm text-slate-400 font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-secondary" />
                          Your Journey
                        </div>
                        {entry.choices.map((choice, choiceIndex) => (
                          <div key={choiceIndex} className="bg-gradient-to-r from-slate-900/60 to-slate-800/40 rounded-lg p-3 sm:p-4 border border-slate-600/30 hover:border-secondary/40 transition-all duration-200 animate-fade-in">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-gradient-to-r from-primary/30 to-secondary/30 text-primary border-0 text-xs">
                                #{choiceIndex + 1}
                              </Badge>
                              <span className="text-slate-400 text-xs">
                                {choice.sceneId}
                              </span>
                            </div>
                            <div className="text-slate-300 text-xs sm:text-sm mb-3 italic break-words">
                              "{choice.choiceText}"
                            </div>
                            
                            {Object.keys(choice.metricChanges).length > 0 ? (
                              <div className="space-y-1">
                                <div className="text-xs text-slate-500 mb-2 font-medium">Impact:</div>
                                <div className="flex gap-1.5 flex-wrap">
                                  {Object.entries(choice.metricChanges).map(([metric, change]) => (
                                    <Badge 
                                      key={metric} 
                                      className={`text-xs border flex items-center gap-1 ${
                                        change > 0 
                                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30' 
                                          : change < 0 
                                            ? 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/30'
                                            : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                                      }`}
                                    >
                                      {getMetricChangeIcon(change)}
                                      <span className="hidden sm:inline font-medium">{formatMetricName(metric)}:</span>
                                      <span className="sm:hidden font-medium">{metric.slice(0,3)}:</span>
                                      <span className="font-bold">{change > 0 ? '+' : ''}{change}</span>
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-slate-500">No changes</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Final Metrics */}
                      <div className="pt-3 border-t border-slate-700/50">
                        <div className="text-sm text-slate-400 font-medium mb-3 flex items-center gap-2">
                          <ArrowUp className="h-4 w-4 text-accent" />
                          Final Metrics
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
                          <div className={`flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20`}>
                            <span className="text-xs text-slate-400">Health</span>
                            <span className={`font-bold text-base sm:text-lg ${getMetricColor(entry.finalMetrics.health)}`}>
                              {entry.finalMetrics.health}
                            </span>
                          </div>
                          <div className={`flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-600/10 border border-green-500/20`}>
                            <span className="text-xs text-slate-400">Money</span>
                            <span className={`font-bold text-base sm:text-lg ${getMetricColor(entry.finalMetrics.money)}`}>
                              {entry.finalMetrics.money}
                            </span>
                          </div>
                          <div className={`flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-600/10 border border-yellow-500/20`}>
                            <span className="text-xs text-slate-400">Happy</span>
                            <span className={`font-bold text-base sm:text-lg ${getMetricColor(entry.finalMetrics.happiness)}`}>
                              {entry.finalMetrics.happiness}
                            </span>
                          </div>
                          <div className={`flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-600/10 border border-blue-500/20`}>
                            <span className="text-xs text-slate-400">Know</span>
                            <span className={`font-bold text-base sm:text-lg ${getMetricColor(entry.finalMetrics.knowledge)}`}>
                              {entry.finalMetrics.knowledge}
                            </span>
                          </div>
                          <div className={`flex flex-col gap-1 p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-500/20 col-span-2 sm:col-span-1`}>
                            <span className="text-xs text-slate-400">Relations</span>
                            <span className={`font-bold text-base sm:text-lg ${getMetricColor(entry.finalMetrics.relationships)}`}>
                              {entry.finalMetrics.relationships}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioHistoryTable;
