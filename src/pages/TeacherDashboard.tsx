import React from 'react';
import { useGameContext } from '@/context/GameContext';
import ScenarioCard from '@/components/ScenarioCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { School } from 'lucide-react';

const TeacherDashboard = () => {
  const { scenarios, startScenario, setGameMode } = useGameContext();
  const navigate = useNavigate();

  const handleStartScenario = (id: string) => {
    startScenario(id);
    navigate('/game');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
        <Button onClick={() => {
          setGameMode("classroom");
          navigate('/classroom');
        }} className="bg-blue-500 hover:bg-blue-600 text-white">
          <School className="h-4 w-4 mr-2" />
          Go to Classroom
        </Button>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-white">Available Scenarios</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onStart={handleStartScenario}
              onClick={() => handleStartScenario(scenario.id)}
            />
          ))}
        </div>

      <div className="mt-8">
        <p className="text-gray-500">
          This is the teacher dashboard where you can manage classrooms and start scenarios.
        </p>
      </div>
    </div>
  );
};

export default TeacherDashboard;
