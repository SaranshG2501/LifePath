
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2 } from 'lucide-react';
import { SessionParticipant } from '@/lib/firebase';

interface ParticipantsListProps {
  participants: SessionParticipant[];
  showResults: boolean;
  getParticipantChoice: (participantId: string) => string | undefined;
}

const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  showResults,
  getParticipantChoice
}) => {
  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium text-white">Active Participants:</h4>
      <div className="grid grid-cols-1 gap-1 max-h-24 overflow-y-auto scrollbar-hide">
        {participants.length > 0 ? participants.map((participant) => {
          const hasVoted = getParticipantChoice(participant.studentId);
          return (
            <div key={participant.studentId} className="flex items-center gap-2 bg-black/20 rounded p-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="bg-purple-500/20 text-white text-xs">
                  {participant.studentName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-white/80 text-xs truncate flex-1">{participant.studentName}</span>
              {showResults && hasVoted && (
                <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                  Choice {hasVoted}
                </Badge>
              )}
              {hasVoted ? (
                <CheckCircle className="h-3 w-3 text-green-400" />
              ) : (
                <Loader2 className="h-3 w-3 text-orange-400 animate-spin" />
              )}
            </div>
          );
        }) : (
          <div className="text-white/60 text-xs text-center py-1">
            Waiting for students to join...
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;
