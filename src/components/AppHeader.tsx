
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, Info, Home, Gamepad2, Sparkles, User, Users, School, Zap } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

const AppHeader: React.FC = () => {
  const {
    isGameActive,
    resetGame,
    gameMode,
    setGameMode,
    userRole
  } = useGameContext();
  
  const { userProfile } = useAuth();

  return (
    <header className="border-b-2 border-neon-purple/30 bg-gradient-to-r from-slate-900/95 via-purple-900/90 to-indigo-900/95 backdrop-blur-xl shadow-2xl shadow-neon-purple/20 sticky top-0 z-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23A566FF%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-5"></div>
      
      <div className="container mx-auto px-4 py-4 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center gap-3 group hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center p-3 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-xl border-2 border-neon-purple/40">
              <Gamepad2 className="h-7 w-7 text-neon-blue animate-bounce" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
              LifePath
            </span>
            <span className="text-xs text-neon-purple font-bold tracking-wider">
              LEVEL UP YOUR LIFE ⚡
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-3">
          {!isGameActive && (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="rounded-xl text-white hover:bg-gradient-to-r hover:from-neon-blue/20 hover:to-neon-purple/20 hover:text-neon-blue border-2 border-transparent hover:border-neon-blue/30 transition-all duration-300 px-4 py-3 font-semibold hover:scale-105"
              >
                <Link to="/" className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  <span className="hidden md:inline">Home</span>
                </Link>
              </Button>
              
              {userRole === "teacher" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild 
                  className="rounded-xl text-white hover:bg-gradient-to-r hover:from-neon-green/20 hover:to-neon-blue/20 hover:text-neon-green border-2 border-transparent hover:border-neon-green/30 transition-all duration-300 px-4 py-3 font-semibold hover:scale-105"
                >
                  <Link to="/teacher" className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    <span className="hidden md:inline">Teacher Hub</span>
                    <span className="inline md:hidden">Hub</span>
                  </Link>
                </Button>
              )}
              
              {gameMode === "classroom" ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGameMode("individual")}
                  className="rounded-xl text-white hover:bg-gradient-to-r hover:from-neon-purple/20 hover:to-neon-pink/20 hover:text-neon-purple border-2 border-transparent hover:border-neon-purple/30 transition-all duration-300 px-4 py-3 font-semibold hover:scale-105"
                >
                  <Users className="h-5 w-5 text-neon-purple" />
                  <span className="hidden md:inline">Squad Mode</span>
                  <Sparkles className="h-4 w-4 ml-1 animate-pulse" />
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGameMode("classroom")}
                  className="rounded-xl text-white hover:bg-gradient-to-r hover:from-neon-blue/20 hover:to-neon-purple/20 hover:text-neon-blue border-2 border-transparent hover:border-neon-blue/30 transition-all duration-300 px-4 py-3 font-semibold hover:scale-105"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">Solo Mode</span>
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                asChild 
                className="rounded-xl text-white hover:bg-gradient-to-r hover:from-neon-yellow/20 hover:to-neon-pink/20 hover:text-neon-yellow border-2 border-transparent hover:border-neon-yellow/30 transition-all duration-300 px-4 py-3 font-semibold hover:scale-105"
              >
                <Link to="/about" className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span className="hidden md:inline">About</span>
                </Link>
              </Button>
              
              {userProfile ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="rounded-xl border-2 border-neon-purple/40 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 text-neon-purple hover:bg-gradient-to-r hover:from-neon-purple/30 hover:to-neon-pink/30 hover:border-neon-purple/60 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-neon-purple/30"
                >
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">Profile</span>
                    <Zap className="h-4 w-4 animate-pulse" />
                  </Link>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild 
                  className="rounded-xl border-2 border-neon-blue/40 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-neon-blue hover:bg-gradient-to-r hover:from-neon-blue/30 hover:to-neon-purple/30 hover:border-neon-blue/60 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-neon-blue/30"
                >
                  <Link to="/auth" className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="inline">Login</span>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  </Link>
                </Button>
              )}
            </>
          )}
          
          {isGameActive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetGame} 
              className="flex items-center gap-2 rounded-xl border-2 border-red-400/60 bg-gradient-to-r from-red-900/40 to-red-800/40 text-red-300 hover:bg-gradient-to-r hover:from-red-800/60 hover:to-red-700/60 hover:border-red-300/80 transition-all duration-300 px-6 py-3 font-bold hover:scale-105 shadow-lg hover:shadow-red-500/30"
            >
              <LogOut className="h-5 w-5" />
              <span className="hidden md:inline">Exit Scenario</span>
              <span className="inline md:hidden">Exit</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
