
import React from 'react';
import { useGameContext } from '@/context/GameContext';
import ScenarioCard from '@/components/ScenarioCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Info, Map, TrendingUp, Brain, Users, 
  Camera, Lightbulb, Sparkles, School, 
  User, BarChart, MessageSquare, Award,
  BookOpen
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';

const HomePage = () => {
  const { scenarios, startScenario, userRole, gameMode, setGameMode } = useGameContext();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex justify-center items-center p-3 bg-primary/10 rounded-full mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-white">
            LifePath
          </h1>
          
          <p className="text-xl md:text-2xl mb-2 font-medium text-white/90">Decision Simulator</p>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto">
            Navigate realistic scenarios and shape your future through thoughtful choices
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {!userRole || userRole === 'guest' ? (
              <Button 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 hover:border-primary transition-all"
              >
                <User size={16} className="text-white" />
                Sign Up / Login
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 hover:border-primary transition-all"
              >
                <User size={16} className="text-white" />
                My Profile
              </Button>
            )}
            
            <Button 
              onClick={() => navigate('/about')}
              variant="outline"
              className="flex items-center gap-2 border-white/20 bg-black/20 text-white hover:bg-black/40"
            >
              <Info size={16} className="text-primary" />
              Learn More
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-3">
            {gameMode === "classroom" ? (
              <Badge className="py-1.5 px-3 bg-primary/20 text-white border-0 rounded-full flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" />
                Classroom Mode
              </Badge>
            ) : (
              <Badge className="py-1.5 px-3 bg-black/20 text-white/80 border-white/10 rounded-full flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Individual Mode
              </Badge>
            )}
            
            {userRole && (
              <Badge className="py-1.5 px-3 bg-black/20 text-white/80 border-white/10 rounded-full flex items-center gap-1.5">
                {userRole === 'teacher' ? (
                  <>
                    <School className="h-4 w-4 text-primary" />
                    Teacher
                  </>
                ) : userRole === 'student' ? (
                  <>
                    <BookOpen className="h-4 w-4 text-primary" />
                    Student
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4" />
                    Guest
                  </>
                )}
              </Badge>
            )}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center flex items-center justify-center text-white">
          <Sparkles className="h-6 w-6 text-primary mr-2" />
          Choose Your Scenario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="animate-fade-in">
              <ScenarioCard
                scenario={scenario}
                onStart={handleStartScenario}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-black/30 border border-white/10 backdrop-blur-md rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
          <Sparkles className="h-5 w-5 text-primary mr-2" />
          Why LifePath Is Different
        </h2>
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-6`}>
          <div className="bg-black/40 border border-white/10 p-5 rounded-lg hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Brain className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Decision Skills</h3>
            <p className="text-white/70">Weigh options and understand consequences in realistic situations.</p>
          </div>
          <div className="bg-black/40 border border-white/10 p-5 rounded-lg hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Track Progress</h3>
            <p className="text-white/70">See how choices affect different aspects of your virtual life over time.</p>
          </div>
          <div className="bg-black/40 border border-white/10 p-5 rounded-lg hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Lightbulb className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Life Skills</h3>
            <p className="text-white/70">Gain practical knowledge about budgeting, relationships, and education.</p>
          </div>
        </div>
      </section>

      <section className="bg-black/30 border border-white/10 backdrop-blur-md rounded-xl p-8 mb-16">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-white">
          <Users className="h-5 w-5 text-primary mr-2" />
          Classroom Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/40 rounded-lg p-5 border border-white/10 hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MessageSquare className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Discussion Mode</h3>
            <p className="text-white/70">Teachers can lead discussions and collect anonymous votes on decisions.</p>
          </div>
          <div className="bg-black/40 rounded-lg p-5 border border-white/10 hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BarChart className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Assessment</h3>
            <p className="text-white/70">Track student progress and decision-making patterns across scenarios.</p>
          </div>
          <div className="bg-black/40 rounded-lg p-5 border border-white/10 hover:border-primary/30 transition-all">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Award className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Gamification</h3>
            <p className="text-white/70">Students earn XP and badges based on their decision patterns.</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          {!userRole || userRole === 'guest' ? (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 hover:border-primary transition-all"
            >
              Sign Up to Access Classroom Features
            </Button>
          ) : userRole === 'teacher' ? (
            <Button 
              onClick={() => setGameMode("classroom")}
              className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 hover:border-primary transition-all"
            >
              Create Your Classroom
            </Button>
          ) : (
            <Button 
              onClick={() => setGameMode("classroom")}
              className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 hover:border-primary transition-all"
            >
              Join a Classroom
            </Button>
          )}
        </div>
      </section>

      <section className="bg-black/30 border border-white/10 backdrop-blur-md rounded-xl p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold mb-4 text-white">For Parents & Educators</h2>
            <p className="text-white/70 mb-6">
              LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
            </p>
            <Button className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 hover:border-primary transition-all" asChild>
              <a href="/about">Learn More</a>
            </Button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="bg-black/40 p-6 rounded-lg shadow-lg border border-white/10 backdrop-blur-md max-w-md">
              <div className="bg-primary/10 p-3 rounded-lg mb-3 flex justify-center">
                <Camera className="text-primary" />
              </div>
              <p className="font-medium text-center text-white">"LifePath has helped our students understand real-world consequences in a way textbooks never could."</p>
              <p className="text-sm text-white/50 text-center mt-3">- Ms. Johnson, High School Teacher</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
