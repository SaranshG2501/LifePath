
import React from 'react';
import { Users, BarChart3, Clock } from 'lucide-react';

interface SessionStatsProps {
  participantCount: number;
  responseRate: number;
  totalVotes: number;
}

const SessionStats: React.FC<SessionStatsProps> = ({
  participantCount,
  responseRate,
  totalVotes
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-black/20 rounded-lg p-2 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Users className="h-3 w-3 text-blue-400" />
        </div>
        <div className="text-sm font-bold text-white">{participantCount}</div>
        <div className="text-xs text-white/70">Participants</div>
      </div>
      
      <div className="bg-black/20 rounded-lg p-2 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <BarChart3 className="h-3 w-3 text-green-400" />
        </div>
        <div className="text-sm font-bold text-white">{Math.round(responseRate)}%</div>
        <div className="text-xs text-white/70">Response Rate</div>
      </div>
      
      <div className="bg-black/20 rounded-lg p-2 text-center">
        <div className="flex items-center justify-center gap-1 mb-1">
          <Clock className="h-3 w-3 text-orange-400" />
        </div>
        <div className="text-sm font-bold text-white">{totalVotes}</div>
        <div className="text-xs text-white/70">Votes Cast</div>
      </div>
    </div>
  );
};

export default SessionStats;
