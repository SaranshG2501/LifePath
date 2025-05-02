
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, School, Users, BookOpen, BarChart3 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGameContext } from '@/context/GameContext';
import { getClassrooms, getUserClassrooms } from '@/lib/firebase';
import ScenarioCard from '@/components/ScenarioCard';
import TeacherClassroomManager from '@/components/classroom/TeacherClassroomManager';
import { scenarios } from '@/data/scenarios';

const TeacherDashboard = () => {
  const { userProfile, currentUser } = useAuth();
  const { setUserRole } = useGameContext();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("classrooms");
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<any>(null);
  
  // Fetch teacher's classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!currentUser) {
        navigate('/auth');
        return;
      }
      
      try {
        setLoading(true);
        const fetchedClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
        setClassrooms(fetchedClassrooms);
        
        // If classrooms exist, select the first one by default
        if (fetchedClassrooms.length > 0) {
          setSelectedClassroom(fetchedClassrooms[0]);
        }
        
        // Ensure the role is set to teacher
        setUserRole('teacher');
      } catch (error) {
        console.error('Error fetching classrooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchClassrooms();
  }, [currentUser, navigate, setUserRole]);
  
  const handleRefresh = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const fetchedClassrooms = await getUserClassrooms(currentUser.uid, 'teacher');
      setClassrooms(fetchedClassrooms);
      
      // Update selected classroom with refreshed data
      if (selectedClassroom) {
        const updatedSelectedClassroom = fetchedClassrooms.find(c => c.id === selectedClassroom.id);
        setSelectedClassroom(updatedSelectedClassroom || fetchedClassrooms[0]);
      }
    } catch (error) {
      console.error('Error refreshing classrooms:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <School className="h-8 w-8 text-primary" />
          Teacher Dashboard
        </h1>
        <p className="text-white/70 mt-2">
          Manage your classrooms and track student progress
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-black/30 border-primary/20">
            <CardHeader>
              <CardTitle className="text-white">Teacher Profile</CardTitle>
              <CardDescription className="text-white/70">
                {userProfile?.displayName || 'Teacher'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-4 flex flex-col items-center">
                    <Users className="h-6 w-6 text-primary mb-1" />
                    <div className="text-2xl font-bold text-white">
                      {classrooms.reduce((total, classroom) => total + (classroom.students?.length || 0), 0)}
                    </div>
                    <div className="text-xs text-white/70">Students</div>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-4 flex flex-col items-center">
                    <School className="h-6 w-6 text-primary mb-1" />
                    <div className="text-2xl font-bold text-white">
                      {classrooms.length}
                    </div>
                    <div className="text-xs text-white/70">Classrooms</div>
                  </div>
                </div>
                
                <Button 
                  variant="default" 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => navigate('/game')}
                >
                  Start New Scenario
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/30 border-primary/20">
            <CardHeader>
              <CardTitle className="text-white">My Classrooms</CardTitle>
              <CardDescription className="text-white/70">
                Manage your virtual classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : classrooms.length > 0 ? (
                <div className="space-y-3">
                  {classrooms.map((classroom) => (
                    <Button 
                      key={classroom.id} 
                      variant="outline" 
                      className={`w-full justify-between border-white/20 bg-black/20 hover:bg-white/10 ${
                        selectedClassroom?.id === classroom.id ? 'border-primary text-primary' : 'text-white'
                      }`}
                      onClick={() => setSelectedClassroom(classroom)}
                    >
                      <span>{classroom.name}</span>
                      <span className="text-xs opacity-70">
                        {classroom.students?.length || 0} students
                      </span>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-white/70 mb-3">No classrooms created yet</p>
                  <Button 
                    onClick={() => {}}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create Classroom
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="bg-black/30 border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white">
                  {selectedClassroom ? selectedClassroom.name : "Classroom Management"}
                </CardTitle>
                <Button 
                  variant="outline" 
                  className="border-white/20 bg-black/20 text-white hover:bg-white/10"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? 
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> 
                    : "Refresh"
                  }
                </Button>
              </div>
              <CardDescription className="text-white/70">
                {selectedClassroom 
                  ? `Manage ${selectedClassroom.students?.length || 0} students` 
                  : "Create and manage your classrooms"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {selectedClassroom ? (
                <TeacherClassroomManager 
                  classroom={selectedClassroom}
                  onRefresh={handleRefresh}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <School className="h-16 w-16 text-white/20 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No Classroom Selected</h3>
                  <p className="text-white/70 text-center max-w-md mb-4">
                    Create a new classroom to start engaging with your students through interactive scenarios.
                  </p>
                  <Button 
                    className="bg-primary hover:bg-primary/90"
                  >
                    Create New Classroom
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6">Available Scenarios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.slice(0, 6).map((scenario) => (
            <ScenarioCard 
              key={scenario.id}
              scenario={scenario}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
