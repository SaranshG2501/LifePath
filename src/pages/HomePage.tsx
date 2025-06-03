
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
  
  return <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-16 animate-fade-in">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex justify-center items-center p-3 bg-blue-500/10 rounded-full mb-6 shadow-lg shadow-blue-500/20">
            <BookOpen className="h-8 w-8 text-blue-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
            <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">LifePath</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-2 font-medium text-white/90">Decision Simulator</p>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Navigate realistic scenarios and shape your future through thoughtful choices
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {!userRole || userRole === 'guest' ? <Button onClick={() => navigate('/auth')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all">
                <User size={16} className="text-white" />
                Sign Up / Login
              </Button> : <Button onClick={() => navigate('/profile')} className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all">
                <User size={16} className="text-white" />
                My Profile
              </Button>}
            
            <Button onClick={() => navigate('/about')} variant="outline" className="flex items-center gap-2 border-white/20 bg-black/20 text-white hover:bg-black/40">
              <Info size={16} className="text-blue-300" />
              Learn More
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3">
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

      <section className="mb-16 animate-fade-in" style={{
      animationDelay: "0.3s"
    }}>
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center flex items-center justify-center text-white">
          <Sparkles className="h-6 w-6 text-blue-300 mr-2" />
          Choose Your Scenario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scenarios.map((scenario, index) => <div key={scenario.id} className="animate-fade-in" style={{
          animationDelay: `${0.1 * (index + 1)}s`
        }}>
              <ScenarioCard scenario={scenario} onStart={handleStartScenario} />
            </div>)}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-md rounded-xl p-8 mb-16 animate-fade-in" style={{
      animationDelay: "0.5s"
    }}>
        <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
          <Sparkles className="h-5 w-5 text-blue-300 mr-2" />
          Why LifePath Is Different
        </h2>
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-6`}>
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

      <section id="classroom-section" className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-md rounded-xl p-8 mb-16 animate-fade-in" style={{
      animationDelay: "0.6s"
    }}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center text-white">
            <Users className="h-5 w-5 text-blue-300 mr-2" />
            Classroom Features
          </h2>
          <Button onClick={handleJoinClassroom} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all">
            <LogIn className="mr-2 h-4 w-4" />
            Join Classroom
          </Button>
        </div>
        
        {/* Always show the StudentClassroomView for students when logged in */}
        {currentUser && userRole === 'student' && (
          <div className="mb-8">
            <StudentClassroomView />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-black/40 rounded-lg p-5 border border-white/10 hover:border-blue-300/30 transition-all">
            <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MessageSquare className="text-blue-300" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Discussion Mode</h3>
            <p className="text-white/70">Teachers can lead discussions and collect anonymous votes on decisions.</p>
          </div>
          <div className="bg-black/40 rounded-lg p-5 border border-white/10 hover:border-blue-300/30 transition-all">
            <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BarChart className="text-blue-300" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Assessment</h3>
            <p className="text-white/70">Track student progress and decision-making patterns across scenarios.</p>
          </div>
          <div className="bg-black/40 rounded-lg p-5 border border-white/10 hover:border-blue-300/30 transition-all">
            <div className="p-3 bg-blue-500/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Award className="text-blue-300" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Gamification</h3>
            <p className="text-white/70">Students earn XP and badges based on their decision patterns.</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          {!userRole || userRole === 'guest' ? <Button onClick={() => navigate('/auth')} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all">
              Sign Up to Access Classroom Features
            </Button> : userRole === 'teacher' ? <Button onClick={() => {
          setGameMode("classroom");
          navigate('/teacher');
        }} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all">
              <School className="h-4 w-4 mr-2" />
              Create Your Classroom
            </Button> : <Button onClick={() => setGameMode("classroom")} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all">
              <Play className="h-4 w-4 mr-2" />
              Join a Classroom
            </Button>}
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-white/10 backdrop-blur-md rounded-xl p-8 animate-fade-in" style={{
      animationDelay: "0.7s"
    }}>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4 text-white">For Parents & Educators</h2>
            <p className="text-white/70 mb-6 font-normal \n">
              LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/20 transition-all" asChild>
              <a href="/about">Learn More</a>
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            
          </div>
        </div>
      </section>
    </div>;
};

export default HomePage;
