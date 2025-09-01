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
    <section className="mb-12 sm:mb-16 animate-slide-in-left" style={{ animationDelay: "0.3s" }}>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 flex items-center justify-center text-white px-4 animate-text-reveal">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-3 animate-rotate-glow" />
          Choose Your Scenario
        </h2>
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4 animate-text-reveal" style={{ animationDelay: '0.2s' }}>
          Explore different life paths and make decisions that shape your future
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
        {scenarios.map((scenario, index) => (
          <div 
            key={scenario.id} 
            className="animate-card-reveal transform hover:scale-105 hover:animate-tilt transition-all duration-300 group" 
            style={{ animationDelay: `${0.1 * (index + 1) + 0.5}s` }}
          >
            <div className="relative overflow-hidden rounded-xl">
              <ScenarioCard scenario={scenario} onStart={handleStartScenario} />
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ScenariosSection;