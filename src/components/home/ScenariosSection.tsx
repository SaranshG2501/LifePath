import React from 'react';
import { Sparkles } from 'lucide-react';
import ScenarioCard from '@/components/ScenarioCard';
import { useGameContext } from '@/context/GameContext';
import { useNavigate } from 'react-router-dom';

const ScenariosSection = () => {
  const { scenarios, startScenario } = useGameContext();
  const navigate = useNavigate();

  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  return (
    <section className="mb-12 sm:mb-16 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 flex items-center justify-center text-white px-4">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-blue-300 mr-3" />
          Choose Your Scenario
        </h2>
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4">
          Explore different life paths and make decisions that shape your future
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {scenarios.map((scenario, index) => (
          <div 
            key={scenario.id} 
            className="animate-fade-in transform hover:scale-105 transition-all duration-300" 
            style={{ animationDelay: `${0.1 * (index + 1)}s` }}
          >
            <ScenarioCard scenario={scenario} onStart={handleStartScenario} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ScenariosSection;