
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Radio, Users, Clock, Loader2 } from 'lucide-react';
import { LiveSession } from '@/lib/firebase';

interface ActiveSessionCardProps {
  session: LiveSession;
  onEndSession: () => void;
  onViewSession: () => void;
  isEnding?: boolean;
}

const ActiveSessionCard: React.FC<ActiveSessionCardProps> = ({
  session,
  onEndSession,
  onViewSession,
  isEnding = false
}) => {
  return (
    <Card className="bg-green-500/10 border-green-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Radio className="h-5 w-5 animate-pulse" />
            Active Live Session
          </CardTitle>
          <Badge className="bg-green-500/20 text-green-300 border-0">
            <Users className="h-3 w-3 mr-1" />
            {session.participants.length} students
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-white font-medium">{session.scenarioTitle}</div>
          <div className="text-white/70 text-sm flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Started: {session.startedAt.toDate().toLocaleTimeString()}
          </div>
          <div className="text-white/70 text-sm">
            Session ID: {session.id}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={onViewSession}
            className="bg-blue-500 hover:bg-blue-600 flex-1"
          >
            View Session
          </Button>
          <Button
            onClick={onEndSession}
            disabled={isEnding}
            variant="destructive"
            className="flex-1"
          >
            {isEnding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ending...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                End Session
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSessionCard;
