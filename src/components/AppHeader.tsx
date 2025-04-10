
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Map, LogOut, User, Info, Home } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';

const AppHeader: React.FC = () => {
  const { isGameActive, resetGame } = useGameContext();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 relative animate-float">
          <div className="absolute -z-10 w-10 h-10 bg-primary/10 rounded-full"></div>
          <Map className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl gradient-heading">LifePath</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {!isGameActive && (
            <>
              <Button variant="ghost" size="sm" asChild className="rounded-xl">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="rounded-xl">
                <Link to="/about">
                  <Info className="h-4 w-4" />
                  <span>About</span>
                </Link>
              </Button>
            </>
          )}
          
          {isGameActive && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetGame}
              className="flex items-center gap-1 rounded-xl border-primary/20 hover:bg-primary/5"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit Scenario</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
