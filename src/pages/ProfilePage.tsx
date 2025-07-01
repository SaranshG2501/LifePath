
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { School, Users, User, Calendar, BookOpen, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserClassrooms, Classroom, convertTimestampToDate } from '@/lib/firebase';
import { ScenarioHistory } from '@/lib/firebase';
import ScenarioHistoryDetail from '@/components/ScenarioHistoryDetail';

const ProfilePage = () => {
  const { userProfile, currentUser } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [scenarioHistory, setScenarioHistory] = useState<ScenarioHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<ScenarioHistory | null>(null);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  useEffect(() => {
    if (currentUser && userProfile?.role === 'student') {
      fetchClassrooms();
    }
  }, [currentUser, userProfile]);

  const fetchClassrooms = async () => {
    if (!currentUser) return;
    
    try {
      setLoadingClassrooms(true);
      const userClassrooms = await getUserClassrooms(currentUser.uid, 'student');
      setClassrooms(userClassrooms);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoadingClassrooms(false);
    }
  };

  useEffect(() => {
    const loadScenarioHistory = async () => {
      if (!currentUser) return;
      try {
        setLoadingHistory(true);
        // Mock scenario history for now since getScenarioHistory doesn't exist
        const mockHistory: ScenarioHistory[] = [];
        setScenarioHistory(mockHistory);
      } catch (error) {
        console.error("Error fetching scenario history:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    if (currentUser) {
      loadScenarioHistory();
    }
  }, [currentUser]);

  const openHistoryDialog = (history: ScenarioHistory) => {
    setSelectedHistory(history);
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedHistory(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">My Profile</h1>
          <p className="text-white/70">View your profile information and settings</p>
        </div>

        {/* User Information */}
        {userProfile && (
          <Card className="bg-black/30 border-primary/20 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                User Information
              </CardTitle>
              <CardDescription className="text-white/70">
                Details about your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-6">
              <Avatar className="h-16 w-16 border border-white/20">
                <AvatarFallback className="bg-primary/20 text-white">
                  {userProfile.username?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-white font-medium text-lg">{userProfile.username}</div>
                <div className="text-white/70">{userProfile.email}</div>
                <Badge className="bg-blue-500/20 text-blue-300 border-0 mt-2">
                  {userProfile.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Classrooms Section */}
        {userProfile?.role === 'student' && (
          <Card className="bg-black/30 border-primary/20 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                My Classrooms ({classrooms.length})
              </CardTitle>
              <CardDescription className="text-white/70">
                Classrooms you've joined and are participating in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClassrooms ? (
                <div className="text-center py-8">
                  <div className="text-white/70">Loading your classrooms...</div>
                </div>
              ) : classrooms.length > 0 ? (
                <div className="space-y-4">
                  {classrooms.map((classroom) => (
                    <div key={classroom.id} className="bg-black/20 rounded-lg p-6 border border-white/10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold text-lg mb-2">{classroom.name}</h3>
                          {classroom.description && (
                            <p className="text-white/70 text-sm mb-3">{classroom.description}</p>
                          )}
                        </div>
                        <Badge className="bg-green-500/20 text-green-300 border-0">
                          Active
                        </Badge>
                      </div>
                      
                      {/* Classroom Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-white/70">Teacher</span>
                          </div>
                          <p className="text-white font-medium">
                            {classroom.teacherName || 'Unknown Teacher'}
                          </p>
                        </div>
                        
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-white/70">Students</span>
                          </div>
                          <p className="text-white font-medium">
                            {classroom.students?.length || 0} enrolled
                          </p>
                        </div>
                        
                        <div className="bg-black/30 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-sm text-white/70">Joined</span>
                          </div>
                          <p className="text-white font-medium">
                            {classroom.createdAt ? 
                              convertTimestampToDate(classroom.createdAt).toLocaleDateString() : 
                              'Recently'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-white/60">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            Class Code: {classroom.classCode || 'N/A'}
                          </span>
                          {classroom.activeScenario && (
                            <span className="flex items-center gap-1">
                              <Play className="h-4 w-4" />
                              Active Scenario
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-500/20 text-blue-300 border-0 text-xs">
                            Student
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <School className="h-12 w-12 text-white/30 mx-auto mb-2" />
                  <div className="text-white/70 mb-2">No classrooms joined yet</div>
                  <div className="text-white/50 text-sm">Ask your teacher for a class code to join your first classroom</div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Teacher Classrooms Section */}
        {userProfile?.role === 'teacher' && (
          <Card className="bg-black/30 border-primary/20 backdrop-blur-md mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                My Classrooms
              </CardTitle>
              <CardDescription className="text-white/70">
                Classrooms you've created and are managing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <School className="h-12 w-12 text-white/30 mx-auto mb-2" />
                <div className="text-white/70 mb-2">No classrooms created yet</div>
                <div className="text-white/50 text-sm">Create a classroom to start teaching!</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scenario History Section */}
        <Card className="bg-black/30 border-primary/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Scenario History
            </CardTitle>
            <CardDescription className="text-white/70">
              Review your past scenario choices and outcomes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="text-center py-8">
                <div className="text-white/70">Loading your scenario history...</div>
              </div>
            ) : scenarioHistory.length > 0 ? (
              <div className="space-y-4">
                {scenarioHistory.map((history, index) => (
                  <Card key={index} className="bg-black/20 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white font-medium">{history.scenarioTitle}</h3>
                        <p className="text-white/70 text-sm">
                          Completed on {history.completedAt ? convertTimestampToDate(history.completedAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openHistoryDialog(history)} 
                        className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                      >
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-2" />
                <div className="text-white/70 mb-2">No scenario history yet</div>
                <div className="text-white/50 text-sm">Complete a scenario to start building your history</div>
              </div>
            )}
          </CardContent>
        </Card>

        <ScenarioHistoryDetail
          history={selectedHistory}
          open={isHistoryDialogOpen}
          onClose={closeHistoryDialog}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
