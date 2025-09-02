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
  const {
    userRole,
    setGameMode
  } = useGameContext();
  const {
    currentUser
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
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
      classroomSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  const features = [{
    icon: MessageSquare,
    title: "Discussion Mode",
    description: "Teachers can lead discussions and collect anonymous votes on decisions.",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400"
  }, {
    icon: BarChart,
    title: "Assessment",
    description: "Track student progress and decision-making patterns across scenarios.",
    gradient: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-400"
  }, {
    icon: Award,
    title: "Gamification",
    description: "Students earn XP and badges based on their decision patterns.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400"
  }];
  return <section id="classroom-section" className="mb-12 sm:mb-16 animate-fade-in-up" style={{
    animationDelay: "0.9s"
  }}>
      <Card className="group bg-gradient-to-br from-muted/60 to-background/60 border-primary/20 backdrop-blur-lg shadow-2xl overflow-hidden hover:shadow-primary/30 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-gradient-shift"></div>
        
        <CardHeader className="relative pb-4 sm:pb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 animate-text-reveal">
            <CardTitle className="text-2xl sm:text-3xl font-bold flex items-center text-white">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mr-3 shadow-lg animate-pulse-glow group-hover:animate-wiggle">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              </div>
              Classroom Features
            </CardTitle>
            {!isMobile && <Button onClick={handleJoinClassroom} className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transform hover:scale-105 animate-bounce-in" style={{
            animationDelay: '0.3s'
          }}>
                <LogIn className="mr-2 h-4 w-4 group-hover:animate-wiggle" />
                Join Classroom
              </Button>}
          </div>
          
          {/* Always show the StudentClassroomView for students when logged in */}
          {currentUser && userRole === 'student' && <div className="mb-8 animate-slide-in-left" style={{
          animationDelay: '0.4s'
        }}>
              <StudentClassroomView />
            </div>}
        </CardHeader>

        <CardContent className="relative p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {features.map((feature, index) => <Card key={feature.title} className={`group bg-gradient-to-br ${feature.gradient} border-white/20 backdrop-blur-sm hover:border-white/30 transition-all duration-300 hover:scale-105 hover:animate-tilt shadow-lg animate-card-reveal`} style={{
            animationDelay: `${0.1 * (index + 1) + 1.1}s`
          }}>
                <CardContent className="p-5 sm:p-6">
                  <div className={`p-3 bg-gradient-to-br ${feature.gradient} rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:animate-pulse-glow`}>
                    <feature.icon className={`${feature.iconColor} h-6 w-6 sm:h-7 sm:w-7 group-hover:animate-wiggle`} />
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl mb-3 text-white group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>)}
          </div>

          <div className="text-center flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-bounce-in" style={{
          animationDelay: '1.4s'
        }}>
            {!userRole || userRole === 'guest' ? <Button onClick={() => navigate('/auth')} className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105">
                Sign Up to Access Classroom Features
              </Button> : userRole === 'teacher' ? <Button onClick={() => {
            setGameMode("classroom");
            navigate('/teacher');
          }} className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105 ">
                <School className="h-4 w-4 mr-2 group-hover:animate-wiggle" />
                Create Your Classroom
              </Button> : <>
                <Button onClick={() => setGameMode("classroom")} className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105 animate-pulse-glow">
                  <Play className="h-4 w-4 mr-2 group-hover:animate-wiggle" />
                  Join a Classroom
                </Button>
                {isMobile && <Button onClick={handleJoinClassroom} className="group bg-gradient-to-r from-accent to-secondary hover:from-accent/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-accent/30 transition-all duration-300 text-sm w-full px-6 py-3 rounded-full transform hover:scale-105 animate-pulse-glow">
                    <LogIn className="mr-2 h-4 w-4 group-hover:animate-wiggle" />
                    Join Classroom Now
                  </Button>}
              </>}
          </div>
        </CardContent>
      </Card>
    </section>;
};
export default ClassroomFeaturesSection;