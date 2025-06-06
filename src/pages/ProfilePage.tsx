
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { Trophy, Star, Target, Clock, BookOpen, Users, Award, TrendingUp, Calendar, Zap, LogOut } from 'lucide-react';
import { ScenarioHistory, getUserProfile, UserProfile as FirebaseUserProfile } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import StudentClassroomView from '@/components/classroom/StudentClassroomView';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, userProfile, signOut } = useAuth();
  const { userRole } = useGameContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
  const [refreshedProfile, setRefreshedProfile] = useState<FirebaseUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch the latest user profile data
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!currentUser) return;
      
      try {
        const latestProfile = await getUserProfile(currentUser.uid);
        setRefreshedProfile(latestProfile);
        
        if (latestProfile?.history) {
          setScenarioHistory(latestProfile.history);
        }
      } catch (error) {
        console.error('Error fetching latest profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProfile();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Use refreshed profile data if available, otherwise fall back to context profile
  const profile = refreshedProfile || userProfile;

  if (!currentUser || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="bg-black/30 border-primary/20 p-8">
          <CardContent className="text-center">
            <h2 className="text-white text-xl mb-4">Please sign in to view your profile</h2>
            <Button onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentLevel = profile.level || 1;
  const currentXP = profile.xp || 0;
  const xpForNextLevel = currentLevel * 500;
  const progressPercentage = ((currentXP % 500) / 500) * 100;
  const completedCount = profile.completedScenarios?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage 
                src={profile.photoURL || currentUser.photoURL || ''} 
                alt={profile.displayName} 
              />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {(profile.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.displayName || currentUser.email?.split('@')[0] || 'User'}
              </h1>
              <div className="flex items-center gap-4 mb-3">
                <Badge className="bg-primary/20 text-primary border-0">
                  Level {currentLevel}
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300 border-0 capitalize">
                  {profile.role}
                </Badge>
                <span className="text-white/70">{profile.email}</span>
              </div>
              
              {/* XP Progress */}
              <div className="w-64">
                <div className="flex justify-between text-sm text-white/70 mb-1">
                  <span>{currentXP % 500} / 500 XP</span>
                  <span>Next Level</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/30 border-white/10 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary/20">
              Progress
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/20">
              History
            </TabsTrigger>
            {userRole === 'student' && (
              <TabsTrigger value="classroom" className="data-[state=active]:bg-primary/20">
                Classroom
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-black/30 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{currentLevel}</div>
                  <p className="text-white/70 text-sm">{currentXP} total XP</p>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-400" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{completedCount}</div>
                  <p className="text-white/70 text-sm">Scenarios finished</p>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-blue-400" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{profile.badges?.length || 0}</div>
                  <p className="text-white/70 text-sm">Badges earned</p>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-400" />
                    Member Since
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-white">
                    {profile.createdAt ? new Date(profile.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                  </div>
                  <p className="text-white/70 text-sm">Join date</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-black/30 border-primary/20 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-white/70">Loading recent activity...</div>
                ) : scenarioHistory.length > 0 ? (
                  <div className="space-y-3">
                    {scenarioHistory.slice(0, 3).map((completion, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-medium">{completion.scenarioTitle}</h4>
                            <p className="text-white/60 text-sm">
                              Completed on {new Date(completion.completedAt.seconds * 1000).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-0">
                            +100 XP
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No scenarios completed yet</h4>
                    <p className="text-white/70 text-sm">Start playing scenarios to see your activity here!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <Card className="bg-black/30 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Learning Progress
                </CardTitle>
                <CardDescription className="text-white/70">
                  Track your learning journey and skill development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Level Progress */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Current Level</span>
                      <span className="text-white/70">Level {currentLevel}</span>
                    </div>
                    <Progress value={progressPercentage} className="h-3" />
                    <div className="flex justify-between text-sm text-white/60 mt-1">
                      <span>{currentXP % 500} / 500 XP</span>
                      <span>{500 - (currentXP % 500)} XP to next level</span>
                    </div>
                  </div>

                  {/* Skills Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-4 w-4 text-green-400" />
                        <span className="text-white font-medium">Decision Making</span>
                      </div>
                      <Progress value={Math.min((completedCount * 20), 100)} className="h-2" />
                      <p className="text-white/60 text-xs mt-1">
                        {Math.min(completedCount * 20, 100)}% mastery
                      </p>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <span className="text-white font-medium">Critical Thinking</span>
                      </div>
                      <Progress value={Math.min((completedCount * 15), 100)} className="h-2" />
                      <p className="text-white/60 text-xs mt-1">
                        {Math.min(completedCount * 15, 100)}% mastery
                      </p>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-purple-400" />
                        <span className="text-white font-medium">Collaboration</span>
                      </div>
                      <Progress value={Math.min((completedCount * 25), 100)} className="h-2" />
                      <p className="text-white/60 text-xs mt-1">
                        {Math.min(completedCount * 25, 100)}% mastery
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-black/30 border-primary/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Scenario History
                </CardTitle>
                <CardDescription className="text-white/70">
                  Complete record of your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-white/70 text-center py-8">Loading scenario history...</div>
                ) : scenarioHistory.length > 0 ? (
                  <div className="space-y-4">
                    {scenarioHistory.map((completion, index) => (
                      <div key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-white font-medium">{completion.scenarioTitle}</h4>
                            <p className="text-white/60 text-sm">
                              Completed on {new Date(completion.completedAt.seconds * 1000).toLocaleString()}
                            </p>
                          </div>
                          <Badge className="bg-primary/20 text-primary border-0">
                            +100 XP
                          </Badge>
                        </div>
                        
                        {completion.metrics && (
                          <div className="grid grid-cols-3 gap-3 mt-3">
                            <div className="text-center">
                              <div className="text-white font-medium">{completion.metrics.environmental}</div>
                              <div className="text-white/60 text-xs">Environmental</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-medium">{completion.metrics.social}</div>
                              <div className="text-white/60 text-xs">Social</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-medium">{completion.metrics.economic}</div>
                              <div className="text-white/60 text-xs">Economic</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h4 className="text-white font-medium mb-2">No completed scenarios</h4>
                    <p className="text-white/70 text-sm">Your completed scenarios will appear here as you progress through your learning journey.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Classroom Tab - Only for students */}
          {userRole === 'student' && (
            <TabsContent value="classroom">
              <StudentClassroomView />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;
