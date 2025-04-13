
import React from 'react';
import { useGameContext } from '@/context/GameContext';
import ScenarioCard from '@/components/ScenarioCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Info, Map, TrendingUp, Brain, Users, 
  Camera, Lightbulb, Sparkles, Gamepad2, 
  School, User, BarChart, MessageSquare, Award,
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
    <div className="container mx-auto px-4 py-6 md:py-8">
      <section className="text-center mb-10 md:mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex justify-center items-center p-3 bg-primary/20 rounded-full mb-4 animate-float relative">
            <Gamepad2 className="h-7 w-7 md:h-8 md:w-8 text-primary animate-pulse-slow" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 gradient-heading relative">
            <span className="relative inline-block text-white">
              LifePath
              <span className="absolute -top-1 -right-4">
                <Sparkles className="h-4 w-4 text-neon-yellow animate-pulse-slow" />
              </span>
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-2 font-semibold text-white">Real-Life Decision Simulator</p>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto">
            Navigate through realistic scenarios and see how your choices shape your future.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              onClick={() => navigate('/about')}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-primary/30 bg-black/20 text-white hover:bg-primary/20 backdrop-blur-sm"
            >
              <Info size={16} className="text-primary" />
              Learn More
            </Button>
            
            {!userRole || userRole === 'guest' ? (
              <Button 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl"
              >
                <User size={16} className="text-white" />
                Sign Up / Login
              </Button>
            ) : (
              <Button 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white rounded-xl"
              >
                <User size={16} className="text-white" />
                My Profile
              </Button>
            )}
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
              <Badge className="py-1.5 px-3 bg-secondary/20 text-white border-0 rounded-full flex items-center gap-1.5">
                {userRole === 'teacher' ? (
                  <>
                    <School className="h-4 w-4 text-secondary" />
                    Teacher
                  </>
                ) : userRole === 'student' ? (
                  <>
                    <BookOpen className="h-4 w-4 text-secondary" />
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

      <section className="mb-12 md:mb-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center gradient-heading flex items-center justify-center text-white">
          <Sparkles className="h-6 w-6 text-primary mr-2 animate-pulse-slow" />
          Choose Your Scenario
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {scenarios.map((scenario, index) => (
            <div key={scenario.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <ScenarioCard
                scenario={scenario}
                onStart={handleStartScenario}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="glassmorphic-card p-6 md:p-8 mb-10 md:mb-12 animate-fade-in">
        <h2 className="text-xl md:text-2xl font-bold mb-6 gradient-heading flex items-center text-white">
          <Sparkles className="h-5 w-5 text-primary mr-2 animate-pulse-slow" />
          Why LifePath is Different
        </h2>
        <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-3'} gap-4 md:gap-6`}>
          <div className="teen-card p-5 hover-lift">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Brain className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Build Decision Skills</h3>
            <p className="text-muted-foreground">Learn to weigh options and understand consequences in real-world situations.</p>
          </div>
          <div className="teen-card p-5 hover-lift" style={{ animationDelay: '0.1s' }}>
            <div className="p-3 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Track Your Progress</h3>
            <p className="text-muted-foreground">See how your choices affect different aspects of your virtual life over time.</p>
          </div>
          <div className="teen-card p-5 hover-lift" style={{ animationDelay: '0.2s' }}>
            <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Lightbulb className="text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Learn Life Skills</h3>
            <p className="text-muted-foreground">Gain practical knowledge about budgeting, relationships, and more.</p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm animate-fade-in mb-10 md:mb-12">
        <h2 className="text-xl md:text-2xl font-bold mb-6 gradient-heading flex items-center text-white">
          <Users className="h-5 w-5 text-primary mr-2 animate-pulse-slow" />
          New! Classroom Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black/30 rounded-xl p-5 border border-white/10 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MessageSquare className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Live Discussion Mode</h3>
            <p className="text-muted-foreground">Teachers can lead discussions by showing scenarios to the class and collecting anonymous votes on decisions.</p>
          </div>
          <div className="bg-black/30 rounded-xl p-5 border border-white/10 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BarChart className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Assessment Dashboard</h3>
            <p className="text-muted-foreground">Teachers get insights into students' decision-making patterns and can track progress across scenarios.</p>
          </div>
          <div className="bg-black/30 rounded-xl p-5 border border-white/10 hover:border-primary/30 transition-colors">
            <div className="p-3 bg-primary/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Award className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2 text-white">Gamification Elements</h3>
            <p className="text-muted-foreground">Students earn XP and badges like "Empath" or "Strategist" based on their decision patterns.</p>
          </div>
        </div>
        <div className="mt-6 text-center">
          {!userRole || userRole === 'guest' ? (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
            >
              Sign Up to Access Classroom Features
            </Button>
          ) : userRole === 'teacher' ? (
            <Button 
              onClick={() => setGameMode("classroom")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
            >
              Create Your Classroom
            </Button>
          ) : (
            <Button 
              onClick={() => setGameMode("classroom")}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white"
            >
              Join a Classroom
            </Button>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 md:p-8 border border-white/10 backdrop-blur-sm animate-fade-in">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center">
          <div className="md:w-1/2 order-2 md:order-1">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">For Parents & Educators</h2>
            <p className="text-muted-foreground mb-5 md:mb-6">
              LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
            </p>
            <Button className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20" asChild>
              <a href="/about">Learn More</a>
            </Button>
          </div>
          <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
            <div className="bg-black/30 p-4 rounded-2xl shadow-lg rotate-3 max-w-xs border border-white/10 backdrop-blur-md animate-hover-bounce">
              <div className="bg-secondary/20 p-3 rounded-xl mb-3 flex justify-center">
                <Camera className="text-secondary" />
              </div>
              <p className="font-medium text-center text-white">"LifePath has helped our students understand real-world consequences in a way textbooks never could."</p>
              <p className="text-sm text-muted-foreground text-center mt-2">- Ms. Johnson, High School Teacher</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
