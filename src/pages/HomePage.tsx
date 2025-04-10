
import React from 'react';
import { useGameContext } from '@/context/GameContext';
import ScenarioCard from '@/components/ScenarioCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Info, Map, TrendingUp, Brain, Users, Camera, Lightbulb } from 'lucide-react';

const HomePage = () => {
  const { scenarios, startScenario } = useGameContext();
  const navigate = useNavigate();

  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-16">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block p-3 bg-primary/10 rounded-full mb-4 animate-bounce-light">
            <Map className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-5xl font-bold mb-6 gradient-heading">LifePath</h1>
          <p className="text-2xl mb-2 font-semibold">Real-Life Decision Simulator</p>
          <p className="text-xl text-muted-foreground mb-8">
            Navigate through realistic scenarios and see how your choices shape your future.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              onClick={() => navigate('/about')}
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-primary/20 hover:bg-primary/5"
            >
              <Info size={16} />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center gradient-heading">Choose Your Scenario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onStart={handleStartScenario}
            />
          ))}
        </div>
      </section>

      <section className="glass-card mb-12">
        <h2 className="text-2xl font-bold mb-6 gradient-heading">Why LifePath is Different</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="teen-card hover-lift">
            <div className="p-3 bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Brain className="text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Build Decision Skills</h3>
            <p className="text-muted-foreground">Learn to weigh options and understand consequences in real-world situations.</p>
          </div>
          <div className="teen-card hover-lift">
            <div className="p-3 bg-secondary/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="text-secondary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Track Your Progress</h3>
            <p className="text-muted-foreground">See how your choices affect different aspects of your virtual life over time.</p>
          </div>
          <div className="teen-card hover-lift">
            <div className="p-3 bg-accent/10 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Lightbulb className="text-accent" />
            </div>
            <h3 className="font-bold text-lg mb-2">Learn Life Skills</h3>
            <p className="text-muted-foreground">Gain practical knowledge about budgeting, relationships, and more.</p>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-white/30">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2 order-2 md:order-1">
            <h2 className="text-2xl font-bold mb-4">For Parents & Educators</h2>
            <p className="text-muted-foreground mb-6">
              LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
            </p>
            <Button className="rounded-xl" asChild>
              <a href="/about">Learn More about Educational Benefits</a>
            </Button>
          </div>
          <div className="md:w-1/2 order-1 md:order-2 flex justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-lg rotate-3 max-w-xs">
              <div className="bg-secondary/10 p-2 rounded-xl mb-3">
                <Camera className="text-secondary mx-auto" />
              </div>
              <p className="font-medium text-center">"LifePath has helped our students understand real-world consequences in a way textbooks never could."</p>
              <p className="text-sm text-muted-foreground text-center mt-2">- Ms. Johnson, High School Teacher</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
