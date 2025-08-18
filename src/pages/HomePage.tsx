import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import ScenarioCard from '@/components/ScenarioCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Info, Map, TrendingUp, Brain, Users, Camera, Lightbulb, Sparkles, School, User, BarChart, MessageSquare, Award, BookOpen, LogIn, Play } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import StudentClassroomView from '@/components/classroom/StudentClassroomView';
import GlobalSessionNotification from '@/components/classroom/GlobalSessionNotification';
const HomePage = () => {
  const {
    scenarios,
    startScenario,
    userRole,
    gameMode,
    setGameMode,
    classroomId
  } = useGameContext();
  const {
    currentUser
  } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const {
    toast
  } = useToast();
  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };
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

    // Scroll to StudentClassroomView section
    const classroomSection = document.getElementById('classroom-section');
    if (classroomSection) {
      classroomSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <>
      {/* Global Session Notification for Students */}
      {currentUser && userRole === 'student' && <GlobalSessionNotification />}
      
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <section className="text-center mb-12 sm:mb-16 animate-fade-in">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex justify-center items-center p-2 sm:p-3 bg-blue-500/10 rounded-full mb-4 sm:mb-6 shadow-lg shadow-blue-500/20">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 text-white">
              <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">LifePath</span>
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl mb-2 font-medium text-white/90">Real Life Based Decision Simulator</p>
            <p className="text-base sm:text-lg text-white/70 mb-6 sm:mb-8 max-w-xl mx-auto px-2">
              Navigate realistic scenarios and shape your future through thoughtful choices
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-2">
              {!userRole || userRole === 'guest' ? <Button onClick={() => navigate('/auth')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base px-3 sm:px-4">
                  <User size={14} className="sm:w-4 sm:h-4 text-white" />
                  Sign Up / Login
                </Button> : <Button onClick={() => navigate('/profile')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base px-3 sm:px-4">
                  <User size={14} className="sm:w-4 sm:h-4 text-white" />
                  My Profile
                </Button>}
              
              <Button onClick={() => navigate('/about')} variant="outline" className="flex items-center gap-2 border-white/20 bg-black/20 text-white hover:bg-black/40 text-sm sm:text-base px-3 sm:px-4">
                <Info size={14} className="sm:w-4 sm:h-4 text-blue-300" />
                Learn More
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 px-2">
              {gameMode === "classroom" ? <Badge className="py-1.5 px-3 bg-blue-500/20 text-white border-0 rounded-full flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-300" />
                  Classroom Mode
                </Badge> : <Badge className="py-1.5 px-3 bg-black/20 text-white/80 border-white/10 rounded-full flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  Individual Mode
                </Badge>}
              
              {userRole && <Badge className="py-1.5 px-3 bg-black/20 text-white/80 border-white/10 rounded-full flex items-center gap-1.5">
                  {userRole === 'teacher' ? <>
                      <School className="h-4 w-4 text-blue-300" />
                      Teacher
                    </> : userRole === 'student' ? <>
                      <BookOpen className="h-4 w-4 text-blue-300" />
                      Student
                    </> : <>
                      <User className="h-4 w-4" />
                      Guest
                    </>}
                </Badge>}
            </div>
          </div>
        </section>

        <section className="mb-12 sm:mb-16 animate-fade-in" style={{
        animationDelay: "0.3s"
      }}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 text-center flex items-center justify-center text-white px-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-blue-300 mr-2" />
            Choose Your Scenario
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {scenarios.map((scenario, index) => <div key={scenario.id} className="animate-fade-in" style={{
            animationDelay: `${0.1 * (index + 1)}s`
          }}>
                <ScenarioCard scenario={scenario} onStart={handleStartScenario} />
              </div>)}
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 lg:p-8 mb-12 sm:mb-16 animate-fade-in" style={{
        animationDelay: "0.5s"
      }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center text-white">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 mr-2" />
            Why LifePath Is Different
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-black/40 border border-white/10 p-5 rounded-lg hover:border-blue-300/30 transition-all hover:shadow-md">
              <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="text-blue-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Decision Skills</h3>
              <p className="text-white/70">Weigh options and understand consequences in realistic situations.</p>
            </div>
            <div className="bg-black/40 border border-white/10 p-5 rounded-lg hover:border-blue-300/30 transition-all hover:shadow-md">
              <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="text-blue-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Track Progress</h3>
              <p className="text-white/70">See how choices affect different aspects of your virtual life over time.</p>
            </div>
            <div className="bg-black/40 border border-white/10 p-5 rounded-lg hover:border-blue-300/30 transition-all hover:shadow-md">
              <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Lightbulb className="text-blue-300" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">Life Skills</h3>
              <p className="text-white/70">Gain practical knowledge about budgeting, relationships, and education.</p>
            </div>
          </div>
        </section>

        <section id="classroom-section" className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 lg:p-8 mb-12 sm:mb-16 animate-fade-in" style={{
        animationDelay: "0.6s"
      }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center text-white">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300 mr-2" />
              Classroom Features
            </h2>
            {!isMobile && (
              <Button onClick={handleJoinClassroom} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base">
                <LogIn className="mr-2 h-4 w-4" />
                Join Classroom
              </Button>
            )}
          </div>
          
          {/* Always show the StudentClassroomView for students when logged in */}
          {currentUser && userRole === 'student' && <div className="mb-8">
              <StudentClassroomView />
            </div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
            <div className="bg-black/40 rounded-lg p-4 sm:p-5 border border-white/10 hover:border-blue-300/30 transition-all">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                <MessageSquare className="text-blue-300 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Discussion Mode</h3>
              <p className="text-white/70 text-sm sm:text-base">Teachers can lead discussions and collect anonymous votes on decisions.</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 sm:p-5 border border-white/10 hover:border-blue-300/30 transition-all">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                <BarChart className="text-blue-300 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Assessment</h3>
              <p className="text-white/70 text-sm sm:text-base">Track student progress and decision-making patterns across scenarios.</p>
            </div>
            <div className="bg-black/40 rounded-lg p-4 sm:p-5 border border-white/10 hover:border-blue-300/30 transition-all sm:col-span-2 lg:col-span-1">
              <div className="p-2 sm:p-3 bg-blue-500/10 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mb-3 sm:mb-4">
                <Award className="text-blue-300 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2 text-white">Gamification</h3>
              <p className="text-white/70 text-sm sm:text-base">Students earn XP and badges based on their decision patterns.</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 text-center flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {!userRole || userRole === 'guest' ? (
              <Button onClick={() => navigate('/auth')} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base w-full sm:w-auto">
                Sign Up to Access Classroom Features
              </Button>
            ) : userRole === 'teacher' ? (
              <Button onClick={() => {
                setGameMode("classroom");
                navigate('/teacher');
              }} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base w-full sm:w-auto">
                <School className="h-4 w-4 mr-2" />
                Create Your Classroom
              </Button>
            ) : (
              <>
                <Button onClick={() => setGameMode("classroom")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base w-full sm:w-auto">
                  <Play className="h-4 w-4 mr-2" />
                  Join a Classroom
                </Button>
                {isMobile && (
                  <Button onClick={handleJoinClassroom} className="bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/20 transition-all text-sm w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Join Classroom Now
                  </Button>
                )}
              </>
            )}
          </div>
        </section>

        <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 lg:p-8 animate-fade-in" style={{
        animationDelay: "0.7s"
      }}>
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-center text-center lg:text-left">
            <div className="lg:w-2/3">
              <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">For Parents & Educators</h2>
              <p className="text-white/70 mb-4 sm:mb-6 font-normal text-sm sm:text-base">
                LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
              </p>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all text-sm sm:text-base w-full sm:w-auto" asChild>
                <a href="/about">Learn More</a>
              </Button>
            </div>
            <div className="lg:w-1/3 flex justify-center">
              <div className="p-4 bg-blue-500/10 rounded-full">
                <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-blue-300" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>;
};
export default HomePage;