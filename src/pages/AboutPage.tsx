
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, BrainCircuit, School, Target, Users, Star, Heart, Zap } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 rounded-xl"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center gradient-heading">About LifePath</h1>
        
        <Card className="teen-card mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Target className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold">What is LifePath?</h2>
          </div>
          <p className="mb-4 text-lg">
            LifePath is an interactive decision simulator designed to help young people ages 10-18 develop crucial decision-making skills through realistic scenarios. By experiencing the consequences of different choices in a safe environment, users learn valuable life skills that traditional education often doesn't cover.
          </p>
          <p className="text-lg">
            Each scenario presents real-world situations where your choices affect multiple aspects of life: from finances and relationships to health and knowledge. The goal isn't to "win," but to understand how different decisions lead to different outcomes.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <Card className="teen-card hover-lift">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <BrainCircuit className="text-primary" />
              </div>
              <h2 className="text-xl font-bold">Key Features</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Zap className="text-accent flex-shrink-0 mt-1" size={18} />
                <span>Interactive storylines with meaningful choices</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-accent flex-shrink-0 mt-1" size={18} />
                <span>Dynamic metrics that respond to your decisions</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-accent flex-shrink-0 mt-1" size={18} />
                <span>Realistic scenarios based on common life situations</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-accent flex-shrink-0 mt-1" size={18} />
                <span>End-of-scenario summaries with insights</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-accent flex-shrink-0 mt-1" size={18} />
                <span>Age-appropriate content for various developmental stages</span>
              </li>
            </ul>
          </Card>
          
          <Card className="teen-card hover-lift">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <School className="text-secondary" />
              </div>
              <h2 className="text-xl font-bold">Educational Value</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Star className="text-secondary flex-shrink-0 mt-1" size={18} />
                <span>Financial literacy through practical budget scenarios</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-secondary flex-shrink-0 mt-1" size={18} />
                <span>Social skills development via relationship choices</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-secondary flex-shrink-0 mt-1" size={18} />
                <span>Critical thinking about long-term consequences</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-secondary flex-shrink-0 mt-1" size={18} />
                <span>Ethical decision-making in complex situations</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-secondary flex-shrink-0 mt-1" size={18} />
                <span>Preparation for real-world challenges</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="teen-card mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Users className="text-primary" />
            </div>
            <h2 className="text-xl font-bold">For Parents and Educators</h2>
          </div>
          <p className="mb-4">
            LifePath can be a valuable tool in both home and classroom settings. The scenarios provide natural opportunities to discuss important life topics with young people and reinforce critical thinking skills.
          </p>
          <p>
            Educators can use LifePath as a starting point for discussions about personal finance, ethics, social dynamics, and more. The game's outcomes can spark meaningful conversations about values, priorities, and life skills.
          </p>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-white/30">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/30 backdrop-blur-sm rounded-full">
              <Heart className="text-accent" />
            </div>
            <h2 className="text-xl font-bold">Our Mission</h2>
          </div>
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
