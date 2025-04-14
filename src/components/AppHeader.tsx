
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, Info, Home, Gamepad2, Sparkles, User, Users } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

const AppHeader: React.FC = () => {
  const {
    isGameActive,
    resetGame,
    gameMode,
    setGameMode
  } = useGameContext();
  
  const { userProfile } = useAuth();

  return (
    <header className="border-b border-white/10 bg-black/50 backdrop-blur-md shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 relative animate-float group">
          <div className="relative flex items-center justify-center">
            <div className="absolute -z-10 w-10 h-10 bg-primary/20 rounded-full group-hover:bg-primary/30 transition-all"></div>
            <Gamepad2 className="h-6 w-6 text-primary animate-pulse-slow absolute" />
          </div>
          <span className="font-bold text-xl text-white gradient-heading ml-8">LifePath</span>
          <Sparkles className="h-3 w-3 text-neon-yellow absolute -top-1 right-0 animate-pulse-slow" />
        </Link>
        
        <div className="flex items-center gap-2 md:gap-3">
          {!isGameActive && (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-xl text-white hover:bg-white/10">
                <Link to="/" className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Home</span>
                </Link>
              </Button>
              
              {gameMode === "classroom" ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGameMode("individual")}
                  className="rounded-xl text-white hover:bg-white/10"
                >
                  <Users className="h-4 w-4 text-primary" />
                  <span className="hidden md:inline">Classroom</span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGameMode("classroom")}
                  className="rounded-xl text-white hover:bg-white/10"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden md:inline">Individual</span>
                </Button>
              )}
              
              <Button variant="ghost" size="sm" asChild className="rounded-xl text-white hover:bg-white/10">
                <Link to="/about" className="flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  <span className="hidden md:inline">About</span>
                </Link>
              </Button>
              
              {userProfile ? (
                <Button variant="outline" size="sm" asChild className="rounded-xl border-primary/30 bg-black/30 text-white hover:bg-primary/20">
                  <Link to="/profile" className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Profile</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="rounded-xl border-primary/30 bg-black/30 text-white hover:bg-primary/20">
                  <Link to="/auth" className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Login</span>
                    <span className="inline md:hidden">Login</span>
                  </Link>
                </Button>
              )}
            </>
          )}
          
          {isGameActive && (
            <Button variant="outline" size="sm" onClick={resetGame} className="flex items-center gap-1.5 rounded-xl border-primary/30 bg-black/30 text-white hover:bg-primary/20">
              <LogOut className="h-4 w-4" />
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
