
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Map, LogOut } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';

const AppHeader: React.FC = () => {
  const { isGameActive, resetGame } = useGameContext();

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <Map className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">LifePath</span>
        </Link>
        
        {isGameActive && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={resetGame}
            className="flex items-center gap-1"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Scenario</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
