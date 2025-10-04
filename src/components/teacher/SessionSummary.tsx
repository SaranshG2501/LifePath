import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSessionSummary, SessionSummaryData } from '@/lib/classroomFirebase';
import { Scenario } from '@/types/game';
import { Users, TrendingUp, Target, BarChart3 } from 'lucide-react';

interface SessionSummaryProps {
  sessionId: string;
  session: any;
  scenario: Scenario | undefined;
}

export const SessionSummary = ({ sessionId, session, scenario }: SessionSummaryProps) => {
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [sessionId]);

  const loadSummary = async () => {
    try {
      const data = await getSessionSummary(sessionId);
      setSummary(data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading summary...</div>;
  }

  if (!summary) {
    return <div className="text-center py-8">No data available</div>;
  }

  const getMostCommonChoice = (sceneId: string) => {
    const sceneVotes = summary.votesByScene[sceneId] || [];
    const voteCounts: Record<string, number> = {};
    
    sceneVotes.forEach(vote => {
      voteCounts[vote.choiceId] = (voteCounts[vote.choiceId] || 0) + 1;
    });

    const mostCommon = Object.entries(voteCounts).sort(([, a], [, b]) => b - a)[0];
    return mostCommon ? { choiceId: mostCommon[0], count: mostCommon[1] } : null;
  };

  const getChoiceText = (sceneId: string, choiceId: string) => {
    if (!scenario) return choiceId;
    const scene = scenario.scenes.find(s => s.id === sceneId);
    const choice = scene?.choices?.find(c => c.id === choiceId);
    return choice?.text || choiceId;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Session Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{summary.totalParticipants}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Users className="h-4 w-4" />
                Participants
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{summary.totalVotes}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Target className="h-4 w-4" />
                Total Votes
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {summary.totalParticipants > 0 
                  ? Math.round((summary.totalVotes / summary.totalParticipants / Object.keys(summary.votesByScene).length) * 100)
                  : 0}%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4" />
                Engagement
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Object.keys(summary.votesByScene).length}
              </div>
              <div className="text-sm text-muted-foreground">Scenes Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Student Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {summary.participantVoteCounts.map(({ username, voteCount }) => (
              <div key={username} className="flex justify-between items-center p-2 border rounded">
                <span className="font-medium">{username}</span>
                <Badge variant="secondary">{voteCount} votes</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Choices by Scene</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(summary.votesByScene).map((sceneId, index) => {
              const mostCommon = getMostCommonChoice(sceneId);
              if (!mostCommon) return null;

              return (
                <div key={sceneId} className="border rounded-lg p-4">
                  <div className="font-medium mb-2">Scene {index + 1}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Most Popular Choice ({mostCommon.count} votes):
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    {getChoiceText(sceneId, mostCommon.choiceId)}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {summary.votesByScene[sceneId].length} total votes in this scene
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Individual Responses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(summary.votesByScene).map(([sceneId, votes], sceneIndex) => (
              <div key={sceneId} className="border-b pb-3 last:border-b-0">
                <div className="font-medium mb-2">Scene {sceneIndex + 1}</div>
                <div className="space-y-1">
                  {votes.map((vote) => (
                    <div key={vote.id} className="text-sm flex justify-between">
                      <span className="text-muted-foreground">{vote.username}:</span>
                      <span className="font-medium">{getChoiceText(sceneId, vote.choiceId)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
