import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getClassroomByCode, joinClassroom } from '@/lib/classroomFirebase';

const JoinClassroom = () => {
  const { currentUser, userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!currentUser || !userProfile || !code.trim()) return;

    setLoading(true);
    try {
      const session = await getClassroomByCode(code);
      
      if (!session) {
        toast({
          title: 'Invalid Code',
          description: 'No classroom found with that code',
          variant: 'destructive',
        });
        return;
      }

      if (session.status === 'ended') {
        toast({
          title: 'Session Ended',
          description: 'This classroom session has ended',
          variant: 'destructive',
        });
        return;
      }

      await joinClassroom(
        session.id,
        currentUser.uid,
        userProfile.username || currentUser.email || 'Student'
      );

      toast({
        title: 'Joined!',
        description: `Welcome to ${session.name}`,
      });

      navigate(`/classroom/${session.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to join classroom',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-3xl">Join Classroom</CardTitle>
          <CardDescription>Enter the 6-character code from your teacher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter code (e.g., ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-wider"
            />
            <Button
              onClick={handleJoin}
              disabled={loading || code.length !== 6}
              className="w-full"
              size="lg"
            >
              Join Classroom
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinClassroom;
