
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, BrainCircuit, School, Target, Users } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About LifePath</h1>
        
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Target className="text-primary" />
            What is LifePath?
          </h2>
          <p className="mb-4">
            LifePath is an interactive decision simulator designed to help young people ages 10-18 develop crucial decision-making skills through realistic scenarios. By experiencing the consequences of different choices in a safe environment, users learn valuable life skills that traditional education often doesn't cover.
          </p>
          <p>
            Each scenario presents real-world situations where your choices affect multiple aspects of life: from finances and relationships to health and knowledge. The goal isn't to "win," but to understand how different decisions lead to different outcomes.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="text-primary" />
              Key Features
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Interactive storylines with meaningful choices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Dynamic metrics that respond to your decisions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Realistic scenarios based on common life situations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>End-of-scenario summaries with insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Age-appropriate content for various developmental stages</span>
              </li>
            </ul>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <School className="text-primary" />
              Educational Value
            </h2>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Financial literacy through practical budget scenarios</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Social skills development via relationship choices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Critical thinking about long-term consequences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Ethical decision-making in complex situations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Preparation for real-world challenges</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="text-primary" />
            For Parents and Educators
          </h2>
          <p className="mb-4">
            LifePath can be a valuable tool in both home and classroom settings. The scenarios provide natural opportunities to discuss important life topics with young people and reinforce critical thinking skills.
          </p>
          <p>
            Educators can use LifePath as a starting point for discussions about personal finance, ethics, social dynamics, and more. The game's outcomes can spark meaningful conversations about values, priorities, and life skills.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-primary" />
            Our Mission
          </h2>
          <p className="mb-4">
            We believe that decision-making is one of the most important life skills young people can develop. Our mission is to create an engaging, educational platform that helps users understand the complex nature of real-world choices and builds their confidence in making decisions.
          </p>
          <p>
            By providing a safe space to experiment with different life paths, we hope to empower the next generation to make thoughtful, informed choices in their own lives.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
