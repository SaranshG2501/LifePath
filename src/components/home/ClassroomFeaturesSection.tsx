import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, MessageSquare, BarChart, Award, School, Play, LogIn } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import StudentClassroomView from '@/components/classroom/StudentClassroomView';

const ClassroomFeaturesSection = () => {
  const { userRole, setGameMode } = useGameContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleJoinClassroom = () => {
    if (!currentUser) {
      navigate('/auth');
      toast({
        title: "Login Required",
        description: "Please login to join a classroom.",
        variant: "destructive"
      });
      return;
    }

    const classroomSection = document.getElementById('classroom-section');
    if (classroomSection) {
      classroomSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Discussion Mode",
      description: "Teachers can lead discussions and collect anonymous votes on decisions.",
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400"
    },
    {
      icon: BarChart,
      title: "Assessment",
      description: "Track student progress and decision-making patterns across scenarios.",
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400"
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Students earn XP and badges based on their decision patterns.",
      gradient: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-400"
    }
  ];

  return (
    <section id="classroom-section" className="mb-12 sm:mb-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-lg shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <CardHeader className="relative pb-4 sm:pb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center text-white">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mr-3 shadow-lg">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-blue-300" />
              </div>
              Classroom Features
            </CardTitle>
            {!isMobile && (
              <Button 
                onClick={handleJoinClassroom} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transform hover:scale-105"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Join Classroom
              </Button>
            )}
          </div>
          
          {/* Always show the StudentClassroomView for students when logged in */}
          {currentUser && userRole === 'student' && (
            <div className="mb-8">
              <StudentClassroomView />
            </div>
          )}
        </CardHeader>

        <CardContent className="relative p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature) => (
              <Card 
                key={feature.title}
                className={`bg-gradient-to-br ${feature.gradient} border-white/20 backdrop-blur-sm hover:border-white/30 transition-all duration-300 hover:scale-105 group shadow-lg`}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <feature.icon className={`${feature.iconColor} h-6 w-6 sm:h-7 sm:w-7`} />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-white group-hover:text-blue-100 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {!userRole || userRole === 'guest' ? (
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105"
              >
                Sign Up to Access Classroom Features
              </Button>
            ) : userRole === 'teacher' ? (
              <Button 
                onClick={() => {
                  setGameMode("classroom");
                  navigate('/teacher');
                }} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105"
              >
                <School className="h-4 w-4 mr-2" />
                Create Your Classroom
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => setGameMode("classroom")} 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Join a Classroom
                </Button>
                {isMobile && (
                  <Button 
                    onClick={handleJoinClassroom} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-500/30 transition-all duration-300 text-sm w-full px-6 py-3 rounded-full transform hover:scale-105"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Join Classroom Now
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ClassroomFeaturesSection;