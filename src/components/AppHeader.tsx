
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, Info, Home, Gamepad2, Sparkles, User, Users, School } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';

const AppHeader: React.FC = () => {
  const gameContext = useGameContext();
  const { userProfile } = useAuth();
  
  // Handle case where GameContext might not be ready
  if (!gameContext) {
    return (
    <header className="border-b border-white/10 bg-indigo-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-300" />
            </div>
            <span className="font-bold text-lg sm:text-xl text-white ml-1">LifePath</span>
          </Link>
        </div>
      </header>
    );
  }
  
  const {
    isGameActive,
    resetGame,
    userRole
  } = gameContext;

  return (
    <header className="border-b border-white/10 bg-indigo-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <Gamepad2 className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-300" />
          </div>
          <span className="font-bold text-lg sm:text-xl text-white ml-1">LifePath</span>
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {!isGameActive && (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-xl text-white hover:bg-white/10">
                <Link to="/" className="flex items-center gap-1.5">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Home</span>
                </Link>
              </Button>
              
              <Button variant="ghost" size="sm" asChild className="rounded-xl text-white hover:bg-white/10">
                <Link to="/about" className="flex items-center gap-1.5">
                  <Info className="h-4 w-4" />
                  <span className="hidden md:inline">About</span>
                </Link>
              </Button>
              
              {userProfile ? (
                <Button variant="outline" size="sm" asChild className="rounded-xl border-indigo-500/30 bg-indigo-900/50 text-white hover:bg-indigo-800/50">
                  <Link to="/profile" className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Profile</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" asChild className="rounded-xl border-indigo-500/30 bg-indigo-900/50 text-white hover:bg-indigo-800/50">
                  <Link to="/auth" className="flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    <span className="inline">Login</span>
                  </Link>
                </Button>
              )}
            </>
          )}
          
          {isGameActive && (
            <Button variant="outline" size="sm" onClick={resetGame} className="flex items-center gap-1.5 rounded-xl border-indigo-500/30 bg-indigo-900/50 text-white hover:bg-indigo-800/50">
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
