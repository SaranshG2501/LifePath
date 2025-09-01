import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { BookOpen, User, Info, Users, School } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

const HeroSection = () => {
  const { userRole, gameMode } = useGameContext();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="text-center mb-12 sm:mb-16 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Hero Icon */}
        <div className="inline-flex justify-center items-center p-3 sm:p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-6 sm:mb-8 shadow-2xl shadow-blue-500/20 backdrop-blur-sm border border-blue-400/20">
          <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />
        </div>
        
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 text-white">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            LifePath
          </span>
        </h1>
        
        {/* Subtitle */}
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
          <p className="text-xl sm:text-2xl md:text-3xl font-medium text-white/90">
            Real Life Based Decision Simulator
          </p>
          <p className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto px-4">
            Navigate realistic scenarios and shape your future through thoughtful choices
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10 px-4">
          {!userRole || userRole === 'guest' ? (
            <Button 
              onClick={() => navigate('/auth')} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transform hover:scale-105"
            >
              <User size={16} className="sm:w-5 sm:h-5 text-white" />
              Sign Up / Login
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/profile')} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transform hover:scale-105"
            >
              <User size={16} className="sm:w-5 sm:h-5 text-white" />
              My Profile
            </Button>
          )}
          
          <Button 
            onClick={() => navigate('/about')} 
            variant="outline" 
            className="flex items-center gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            <Info size={16} className="sm:w-5 sm:h-5 text-blue-300" />
            Learn More
          </Button>
        </div>
        
        {/* Status Badges */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 px-4">
          <Badge className="py-2 px-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 text-white border border-white/20 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm">
            {gameMode === "classroom" ? (
              <>
                <Users className="h-4 w-4 text-blue-300" />
                Classroom Mode
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                Individual Mode
              </>
            )}
          </Badge>
          
          {userRole && (
            <Badge className="py-2 px-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 text-white border border-white/20 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-sm">
              {userRole === 'teacher' ? (
                <>
                  <School className="h-4 w-4 text-blue-300" />
                  Teacher
                </>
              ) : userRole === 'student' ? (
                <>
                  <BookOpen className="h-4 w-4 text-blue-300" />
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
  );
};

export default HeroSection;