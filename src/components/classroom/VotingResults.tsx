
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface VotingResultsProps {
  choiceStats: Record<string, number>;
  participantCount: number;
  showResults: boolean;
}

const VotingResults: React.FC<VotingResultsProps> = ({
  choiceStats,
  participantCount,
  showResults
}) => {
  if (!showResults || Object.keys(choiceStats).length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-white">Current Voting Results:</h4>
      {Object.entries(choiceStats).map(([choiceId, count]) => (
        <div key={choiceId} className="flex justify-between items-center bg-black/20 rounded p-1">
          <span className="text-white/80 text-xs">Choice {choiceId}</span>
          <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs">
            {count} votes ({participantCount > 0 ? Math.round((count / participantCount) * 100) : 0}%)
          </Badge>
        </div>
      ))}
    </div>
  );
};

export default VotingResults;
