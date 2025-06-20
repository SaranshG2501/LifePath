/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useGameContext } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ScenarioHistory, getClassroomByCode, getUserClassrooms } from '@/lib/firebase';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';
import { 
  User, School, Trophy, History, BarChart, 
  Users, LogOut, BookOpen, Gamepad2, Award, 
  BadgeCheck, BarChart2, Sparkles, Calendar
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userRole } = useGameContext();
  const { userProfile, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [xpProgress, setXpProgress] = useState(0);
  const [selectedHistory, setSelectedHistory] = useState<ScenarioHistory | null>(null);
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);

  // State for joining a classroom
  const [joinClassCode, setJoinClassCode] = useState('');
  const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Initialize decision metrics
  const [decisionMetrics, setDecisionMetrics] = useState({
    analytical: 67,
    emotional: 42,
    riskTaking: 58,
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !userProfile) {
      navigate('/auth');
    }
  }, [userProfile, isLoading, navigate]);

  useEffect(() => {
    if (userProfile) {
      // Calculate XP progress to next level
      const xpToNextLevel = 1000;
      const progress = ((userProfile.xp || 0) % xpToNextLevel) / xpToNextLevel * 100;
      setXpProgress(progress);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && userProfile.history) {
      // Update decision metrics based on user history
      const allChoices = userProfile.history.flatMap((h) => h.choices || []);
      if (allChoices.length > 0) {
        const analyticalChoices = allChoices.filter(
          (choice) => choice.metricChanges?.knowledge && choice.metricChanges.knowledge > 0
        ).length;

        const emotionalChoices = allChoices.filter(
          (choice) => choice.metricChanges?.happiness && choice.metricChanges.happiness > 0
        ).length;

        const riskyChoices = allChoices.filter(
          (choice) =>
            (choice.metricChanges?.money && choice.metricChanges.money < 0) ||
            (choice.metricChanges?.health && choice.metricChanges.health < 0)
        ).length;

        const totalChoices = allChoices.length;

        if (totalChoices > 0) {
          setDecisionMetrics({
            analytical: Math.round((analyticalChoices / totalChoices) * 100),
            emotional: Math.round((emotionalChoices / totalChoices) * 100),
            riskTaking: Math.round((riskyChoices / totalChoices) * 100),
          });
        }
      }
    }
  }, [userProfile?.history]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const openHistoryDetail = (history: ScenarioHistory) => {
    setSelectedHistory(history);
    setIsHistoryDetailOpen(true);
  };

  const handleJoinClassroom = async () => {
    setJoinError(null);
    setIsJoining(true);
    if (!joinClassCode.trim()) {
      setJoinError('Please enter a class code.');
      setIsJoining(false);
      return;
    }
    try {
      const classroom = await getClassroomByCode(joinClassCode.trim());
      if (!classroom) {
        setJoinError('Classroom not found. Please check the code and try again.');
        setIsJoining(false);
        return;
      }
      if (!userProfile) {
        setJoinError('User profile not loaded.');
        setIsJoining(false);
        return;
      }
      if (userProfile.classrooms && userProfile.classrooms.includes(classroom.id)) {
        setJoinError('You are already a member of this classroom.');
        setIsJoining(false);
        return;
      }
      await getUserClassrooms(userProfile.id, classroom.id);
      setIsJoinClassModalOpen(false);
      setJoinClassCode('');
    } catch (error) {
      console.error('Error joining classroom:', error);
      setJoinError('An error occurred while joining the classroom.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }
  
  if (!userProfile) {
    return null; // Redirecting handled in useEffect
  }

  const defaultProfile = {
    username: userProfile.username || 'User',
    email: userProfile.email || '',
    role: userProfile.role || userRole || 'student',
    xp: userProfile.xp || 0,
    level: userProfile.level || 1,
    completedScenarios: userProfile.completedScenarios || [],
    badges: userProfile.badges || [],
    classrooms: userProfile.classrooms || [],
    history: userProfile.history || [],
    id: userProfile.id || '',
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      }
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString();
      }
      return 'Unknown';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-black/30 border-primary/20 backdrop-blur-md">
          <CardHeader className="pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {defaultProfile.username.charAt(0).toUpperCase()}
                </span>
                <div className="absolute bottom-0 right-0 bg-black/50 rounded-full p-1">
                  {defaultProfile.role === 'teacher' ? (
                    <School className="h-5 w-5 text-primary animate-pulse-slow" />
                  ) : (
                    <User className="h-5 w-5 text-primary animate-pulse-slow" />
                  )}
                </div>
              </div>
            </div>
            <CardTitle className="text-center text-xl font-bold gradient-heading text-white">
              {defaultProfile.username}
            </CardTitle>
            <CardDescription className="text-center flex items-center justify-center gap-1 text-white/70">
              {defaultProfile.role === 'teacher' ? (
                <>
                  <School className="h-4 w-4" />
                  Teacher
                </>
              ) : (
                <>
                  <User className="h-4 w-4" />
                  Student
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-white/70">Level {defaultProfile.level}</span>
                  <span className="text-sm font-medium text-white/70">{defaultProfile.xp} XP</span>
                </div>
                <Progress value={xpProgress} className="h-2 bg-white/10" />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-white/50">{Math.round(xpProgress)}% to Level {defaultProfile.level + 1}</span>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-white">
                  <Trophy className="h-4 w-4 text-primary" />
                  Badges Earned
                </h3>
                <div className="flex flex-wrap gap-2">
                  {defaultProfile.badges && defaultProfile.badges.length > 0 ? (
                    defaultProfile.badges.map((badge: any, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-black/40 border-primary/30 text-white py-1"
                      >
                        {badge.name || badge}
                      </Badge>
                    ))
                  ) : (
                    <div className="text-white/50 text-sm">No badges earned yet</div>
                  )}
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="font-medium mb-2 flex items-center gap-1 text-white">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Completed Scenarios
                </h3>
                <div className="text-sm text-white/80">
                  {(defaultProfile.completedScenarios && defaultProfile.completedScenarios.length) || 0} scenarios completed
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-white/20 bg-black/20 text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>

      <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-black/20 border-white/10 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary/20">
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="classrooms" className="data-[state=active]:bg-primary/20">
                {userRole === 'teacher' ? 'My Classes' : 'My Classrooms'}
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-4">
              <Card className="bg-black/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold gradient-heading flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse-slow" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 rounded-lg p-4 flex flex-col">
                      <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                        <Award className="h-4 w-4 text-primary" />
                        Achievements
                      </h3>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80">Scenarios Completed</span>
                        <span className="font-mono text-white">
                          {(defaultProfile.completedScenarios && defaultProfile.completedScenarios.length) || 0}/10
                        </span>
                      </div>
                      <Progress 
                        value={(defaultProfile.completedScenarios && defaultProfile.completedScenarios.length * 10) || 0} 
                        className="h-2 mb-4 bg-white/10" 
                      />
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80">Badges Earned</span>
                        <span className="font-mono text-white">
                          {(defaultProfile.badges && defaultProfile.badges.length) || 0}/8
                        </span>
                      </div>
                      <Progress 
                        value={(defaultProfile.badges && defaultProfile.badges.length * 12.5) || 0} 
                        className="h-2 bg-white/10" 
                      />
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4 flex flex-col">
                      <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                        <BarChart className="h-4 w-4 text-primary" />
                        Decision Metrics
                      </h3>
                      <div className="space-y-3 flex-grow">
                        <div>
                          <div className="flex justify-between mb-1 text-white/80">
                            <span>Analytical Decisions</span>
                            <span className="font-mono">{decisionMetrics.analytical}%</span>
                          </div>
                          <Progress value={decisionMetrics.analytical} className="h-2 bg-white/10" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-white/80">
                            <span>Emotional Decisions</span>
                            <span className="font-mono">{decisionMetrics.emotional}%</span>
                          </div>
                          <Progress value={decisionMetrics.emotional} className="h-2 bg-white/10" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1 text-white/80">
                            <span>Risk Taking</span>
                            <span className="font-mono">{decisionMetrics.riskTaking}%</span>
                          </div>
                          <Progress value={decisionMetrics.riskTaking} className="h-2 bg-white/10" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                      <Gamepad2 className="h-4 w-4 text-primary" />
                      Recent Activity
                    </h3>
                    <div className="bg-black/20 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 gap-2 p-3 border-b border-white/10">
                        <div className="font-medium text-white/80">Scenario</div>
                        <div className="font-medium text-white/80">Date</div>
                        <div className="font-medium text-white/80 text-right">Actions</div>
                      </div>
                      {defaultProfile.history && defaultProfile.history.length > 0 ? (
                        defaultProfile.history.slice(0, 3).map((item: any, index: number) => (
                          <div 
                            key={index} 
                            className="grid grid-cols-3 gap-2 p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                          >
                            <div className="text-white">{item.scenarioTitle || item.scenarioId?.replace(/-/g, ' ') || 'Unknown Scenario'}</div>
                            <div className="text-white/70">{formatDate(item.completedAt)}</div>
                            <div className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={() => openHistoryDetail(item)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-white/50 text-center">No activity recorded yet</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="classrooms" className="mt-4">
              <Card className="bg-black/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold gradient-heading flex items-center gap-2 text-white">
                    <Users className="h-5 w-5 text-primary animate-pulse-slow" />
                    {userRole === 'teacher' ? 'My Classes' : 'My Classrooms'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {defaultProfile.classrooms && defaultProfile.classrooms.length > 0 ? (
                      defaultProfile.classrooms.map((classroom: any, index: number) => (
                        <div 
                          key={index} 
                          className="bg-black/30 rounded-lg p-4 border border-white/10 hover:border-primary/30 transition-colors cursor-pointer"
                        >
                          <h3 className="font-medium mb-2 text-white">{classroom.name || `Classroom ${index + 1}`}</h3>
                          {userRole === 'teacher' ? (
                            <div className="text-sm text-white/70 flex items-center gap-1">
                              <Users className="h - 4 w-4" />
                              {classroom.students || 0} students
                            </div>
                          ) : (
                            <div className="text-sm text-white/70 flex items-center gap-1">
                              <School className="h-4 w-4" />
                              Teacher: {classroom.teacher || 'Unknown'}
                            </div>
                          )}
                          
                          <div className="mt-3 flex justify-end">
                            <Button variant="outline" size="sm" className="border-white/20 bg-black/20 text-white hover:bg-white/10">
                              {userRole === 'teacher' ? 'Manage Class' : 'View Activities'}
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 bg-black/20 rounded-lg p-4 text-white/60 text-center">
                        No classrooms found
                      </div>
                    )}
                    
                    <div 
                      onClick={() => setIsJoinClassModalOpen(userRole !== 'teacher')} 
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') setIsJoinClassModalOpen(userRole !== 'teacher'); }}
                      className="bg-black/10 rounded-lg border border-dashed border-white/20 p-4 flex flex-col items-center justify-center text-center hover:bg-black/20 transition-colors cursor-pointer select-none"
                    >
                      <div className="rounded-full bg-white/5 p-3 mb-2">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-white">
                        {userRole === 'teacher' ? 'Create New Class using Teacher Dashboard' : 'Join a Classroom'}
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        {userRole === 'teacher' 
                          ? 'Set up a new classroom for your students' 
                          : 'Enter a class code to join'}
                      </p>
                    </div>
                  </div>
                  
                  {isJoinClassModalOpen && (
                    <div 
                      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50" 
                      onClick={() => setIsJoinClassModalOpen(false)}
                    >
                      <div 
                        className="bg-gray-900 border border-white/20 rounded-lg p-6 w-80"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="joinClassroomTitle"
                      >
                        <h2 id="joinClassroomTitle" className="text-xl font-bold mb-4 text-white">
                          Join a Classroom
                        </h2>
                        <input
                          type="text"
                          placeholder="Enter class code"
                          value={joinClassCode}
                          onChange={e => setJoinClassCode(e.target.value)}
                          className="w-full rounded-md border border-white/30 bg-black/50 px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary mb-3"
                          autoFocus
                        />
                        {joinError && <p className="text-red-500 mb-3">{joinError}</p>}
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setIsJoinClassModalOpen(false)}
                            disabled={isJoining}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleJoinClassroom} 
                            disabled={isJoining || !joinClassCode.trim()}
                          >
                            {isJoining ? 'Joining...' : 'Join'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="history" className="mt-4">
              <Card className="bg-black/20 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold gradient-heading flex items-center gap-2 text-white">
                    <History className="h-5 w-5 text-primary animate-pulse-slow" />
                    Your History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/20 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 p-3 border-b border-white/10">
                      <div className="font-medium text-white/80">Scenario</div>
                      <div className="font-medium text-white/80">Date</div>
                      <div className="font-medium text-white/80 text-right">Actions</div>
                    </div>
                    {defaultProfile.history && defaultProfile.history.length > 0 ? (
                      defaultProfile.history.map((item: any, index: number) => (
                        <div 
                          key={index} 
                          className="grid grid-cols-3 gap-2 p-3 border-b border-white/5 last:border-0 hover:bg-white/5"
                        >
                          <div className="text-white capitalize">
                            {item.scenarioTitle || item.scenarioId?.replace(/-/g, ' ') || 'Unknown'}
                          </div>
                          <div className="text-white/70 flex items-center gap-1">
                            <Calendar className="h-4 w-4 opacity-70" />
                            {formatDate(item.completedAt)}
                          </div>
                          <div className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary hover:bg-primary/10 hover:text-primary"
                              onClick={() => openHistoryDetail(item)}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-white/50 text-center">No history available</div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-medium mb-3 flex items-center gap-1 text-white">
                      <BarChart2 className="h-4 w-4 text-primary" />
                      Decision Analytics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">Analytical Decisions</h4>
                          <Badge 
                            className={
                              (decisionMetrics.analytical > 50 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300') + ' border-0'
                            }
                          >
                            {decisionMetrics.analytical > 50 ? '+' : '-'}
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">{decisionMetrics.analytical}%</div>
                        <div className="text-xs text-white/60 mt-1">Logic-based problem solving</div>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">Emotional Choices</h4>
                          <Badge 
                            className={
                              (decisionMetrics.emotional > 50 ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300') + ' border-0'
                            }
                          >
                            {decisionMetrics.emotional > 50 ? '+' : '-'}
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">{decisionMetrics.emotional}%</div>
                        <div className="text-xs text-white/60 mt-1">Empathy-driven decisions</div>
                      </div>
                      
                      <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white">Risk Taking</h4>
                          <Badge 
                            className={
                              (decisionMetrics.riskTaking < 40 ? 'bg-blue-500/20 text-blue-300' : decisionMetrics.riskTaking > 70 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300') + ' border-0'
                            }
                          >
                            {decisionMetrics.riskTaking < 40 ? 'Low' : decisionMetrics.riskTaking > 70 ? 'High' : 'Balanced'}
                          </Badge>
                        </div>
                        <div className="text-3xl font-bold text-white">{decisionMetrics.riskTaking}%</div>
                        <div className="text-xs text-white/60 mt-1">Willingness to take chances</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {selectedHistory && (
        <ScenarioHistoryDetail
          history={selectedHistory}
          open={isHistoryDetailOpen}
          onClose={() => setIsHistoryDetailOpen(false)}
        />
      )}
    </div>
  );
};

export default ProfilePage;