import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Info, Users, School, Sparkles, Zap } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
const HeroSection = () => {
  const {
    userRole,
    gameMode
  } = useGameContext();
  const {
    currentUser
  } = useAuth();
  const navigate = useNavigate();
  return <section className="relative text-center mb-12 sm:mb-16 animate-fade-in">
      <div className="max-w-4xl mx-auto relative">
        {/* Animated Background Elements */}
        <div className="absolute -top-10 left-1/4 w-6 h-6 text-primary/30 animate-float">
          <Sparkles className="w-full h-full" />
        </div>
        <div className="absolute top-0 right-1/4 w-4 h-4 text-accent/40 animate-bounce-in" style={{
        animationDelay: '0.5s'
      }}>
          <Zap className="w-full h-full" />
        </div>
        <div className="absolute -top-5 left-1/3 w-2 h-2 bg-secondary/40 rounded-full animate-pulse-glow" style={{
        animationDelay: '1s'
      }} />

        {/* Hero Icon with Enhanced Animation */}
        <div className="inline-flex justify-center items-center p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mb-6 sm:mb-8 shadow-2xl shadow-primary/20 backdrop-blur-sm border border-primary/30 \n">
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:animate-icon-bounce" />
        </div>
        
        {/* Animated Title with Typewriter Effect */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white">
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-shift">
            LifePath
          </span>
        </h1>
        
        {/* Animated Subtitle */}
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/90 animate-text-reveal" style={{
          animationDelay: '0.3s'
        }}>
            Real Life Based Decision Simulator
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4 animate-text-reveal" style={{
          animationDelay: '0.6s'
        }}>
            Navigate realistic scenarios and shape your future through thoughtful choices
          </p>
        </div>
        
        {/* Animated Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 px-4 animate-fade-in-up" style={{
        animationDelay: '0.9s'
      }}>
          {!userRole || userRole === 'guest' ? <Button onClick={() => navigate('/auth')} className="group flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transform hover:scale-105 ">
              <User size={16} className="sm:w-5 sm:h-5 text-white group-hover:animate-wiggle" />
              Sign Up / Login
            </Button> : <Button onClick={() => navigate('/profile')} className="group flex items-center gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transform hover:scale-105 ">
              <User size={16} className="sm:w-5 sm:h-5 text-white group-hover:animate-wiggle" />
              My Profile
            </Button>}
          
          <Button onClick={() => navigate('/about')} variant="outline" className="group flex items-center gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 hover:animate-tilt">
            <Info size={16} className="sm:w-5 sm:h-5 text-primary group-hover:animate-bounce" />
            Learn More
          </Button>
        </div>
        
        {/* Animated Status Badges */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 px-4 animate-bounce-in" style={{
        animationDelay: '1.2s'
      }}>
          <Badge className="py-2 px-4 bg-gradient-to-r from-muted/60 to-background/60 text-white border border-white/20 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm hover:animate-tilt transition-all duration-300">
            {gameMode === "classroom" ? <>
                <Users className="h-4 w-4 text-primary animate-pulse" />
                Classroom Mode
              </> : <>
                <User className="h-4 w-4 animate-pulse" />
                Individual Mode
              </>}
          </Badge>
          
          {userRole && <Badge className="py-2 px-4 bg-gradient-to-r from-muted/60 to-background/60 text-white border border-white/20 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm hover:animate-tilt transition-all duration-300">
              {userRole === 'teacher' ? <>
                  <School className="h-4 w-4 text-primary animate-pulse" />
                  Teacher
                </> : userRole === 'student' ? <>
                  <BookOpen className="h-4 w-4 text-primary animate-pulse" />
                  Student
                </> : <>
                  <User className="h-4 w-4 animate-pulse" />
                  Guest
                </>}
            </Badge>}
        </div>
      </div>
    </section>;
};
export default HeroSection;