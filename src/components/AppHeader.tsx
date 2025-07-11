
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { LogOut, Info, Home, Gamepad2, Sparkles, User, Users, School } from 'lucide-react';
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
    <header className="border-b border-white/10 bg-indigo-900/50 backdrop-blur-md shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-indigo-300" />
          </div>
          <span className="font-bold text-xl text-white ml-1">LifePath</span>
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
              
              {userRole === "teacher" && (
                <Button variant="ghost" size="sm" asChild className="rounded-xl text-white hover:bg-white/10">
                  <Link to="/teacher" className="flex items-center gap-1.5">
                    <School className="h-4 w-4" />
                    <span className="hidden md:inline">Teacher Dashboard</span>
                    <span className="inline md:hidden">Dashboard</span>
                  </Link>
                </Button>
              )}
              
              {gameMode === "classroom" ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setGameMode("individual")}
                  className="rounded-xl text-white hover:bg-white/10"
                >
                  <Users className="h-4 w-4 text-indigo-300" />
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
