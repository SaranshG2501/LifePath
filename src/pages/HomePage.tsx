
import React from 'react';
import { useGameContext } from '@/context/GameContext';
import ScenarioCard from '@/components/ScenarioCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Info, Map } from 'lucide-react';

const HomePage = () => {
  const { scenarios, startScenario } = useGameContext();
  const navigate = useNavigate();

  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-12">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">LifePath: Real-Life Decision Simulator</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Navigate through realistic scenarios and see how your choices shape your future. Build decision-making skills in a fun, safe environment.
          </p>
          <Button 
            onClick={() => navigate('/about')}
            variant="outline"
            className="flex items-center gap-2 mx-auto"
          >
            <Info size={16} />
            Learn More
          </Button>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Choose Your Scenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onStart={handleStartScenario}
            />
          ))}
        </div>
      </section>

      <section className="bg-muted/30 rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold mb-3">For Parents & Educators</h2>
        <p className="text-muted-foreground mb-4">
          LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-primary mb-2">Life Skills</h3>
            <p>Practical scenarios that teach budgeting, time management, and social skills.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-primary mb-2">Critical Thinking</h3>
            <p>Encourages analyzing situations and considering the long-term impact of decisions.</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold text-primary mb-2">Safe Learning</h3>
            <p>Experience consequences without real-world risk, building decision confidence.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
