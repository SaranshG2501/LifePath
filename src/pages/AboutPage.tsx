import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, BrainCircuit, School, Target, Users, Star, Heart, Zap, Sparkles, Gamepad2 } from 'lucide-react';
const AboutPage = () => {
  const navigate = useNavigate();
  return <div className="container mx-auto px-4 py-6 md:py-8 animate-fade-in">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 rounded-xl text-white border border-white/10 hover:bg-white/10">
        <ArrowLeft size={16} />
        Back to Home
      </Button>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center gradient-heading flex justify-center items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse-slow" />
          About LifePath
          <Sparkles className="h-6 w-6 text-primary animate-pulse-slow" style={{
          animationDelay: '0.5s'
        }} />
        </h1>
        
        <Card className="teen-card p-6 mb-8 md:mb-10 animate-scale-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
              <Gamepad2 className="text-primary" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">What is LifePath?</h2>
          </div>
          <p className="mb-4 text-base md:text-lg text-white/90">
            LifePath is an interactive decision simulator designed to help young people ages 10-18 develop crucial decision-making skills through realistic scenarios. By experiencing the consequences of different choices in a safe environment, users learn valuable life skills that traditional education often doesn't cover.
          </p>
          <p className="text-base md:text-lg text-white/90">
            Each scenario presents real-world situations where your choices affect multiple aspects of life: from finances and relationships to health and knowledge. The goal isn't to "win," but to understand how different decisions lead to different outcomes.
          </p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
          <Card className="teen-card p-6 hover-lift animate-scale-in" style={{
          animationDelay: '0.1s'
        }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
                <BrainCircuit className="text-primary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white">Key Features</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Zap className="text-neon-yellow flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Interactive storylines with meaningful choices</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-neon-yellow flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Dynamic metrics that respond to your decisions</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-neon-yellow flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Realistic scenarios based on common life situations</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-neon-yellow flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">End-of-scenario summaries with insights</span>
              </li>
              <li className="flex items-start gap-3">
                <Zap className="text-neon-yellow flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Age-appropriate content for various developmental stages</span>
              </li>
            </ul>
          </Card>
          
          <Card className="teen-card p-6 hover-lift animate-scale-in" style={{
          animationDelay: '0.2s'
        }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full">
                <School className="text-secondary" />
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white">Educational Value</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Star className="text-neon-purple flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Financial literacy through practical budget scenarios</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-neon-purple flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Social skills development via relationship choices</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-neon-purple flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Critical thinking about long-term consequences</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-neon-purple flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Ethical decision-making in complex situations</span>
              </li>
              <li className="flex items-start gap-3">
                <Star className="text-neon-purple flex-shrink-0 mt-1" size={18} />
                <span className="text-white/90">Preparation for real-world challenges</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card className="teen-card p-6 mb-8 md:mb-10 animate-scale-in" style={{
        animationDelay: '0.3s'
      }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full">
              <Users className="text-primary" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">For Parents and Educators</h2>
          </div>
          <p className="mb-4 text-white/90">
            LifePath can be a valuable tool in both home and classroom settings. The scenarios provide natural opportunities to discuss important life topics with young people and reinforce critical thinking skills.
          </p>
          <p className="text-white/90">
            Educators can use LifePath as a starting point for discussions about personal finance, ethics, social dynamics, and more. The game's outcomes can spark meaningful conversations about values, priorities, and life skills.
          </p>
        </Card>

        <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-white/20 p-6 backdrop-blur-sm animate-scale-in" style={{
        animationDelay: '0.4s'
      }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-full">
              <Heart className="text-neon-pink" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">My Mission</h2>
          </div>
          <p className="mb-4 text-white/90">Hi, I’m Saransh Gupta from VIT Bhopal University, and I’m building LifePath — a web-based interactive simulator that helps teenagers build real-life decision-making skills through immersive storytelling. In today’s rapidly evolving digital world, there’s a serious lack of engaging tools that actually prepare kids for life. LifePath fills that gap by transforming critical topics like money, ethics, relationships, and pressure into fun, story-based experiences. My mission is to craft a meaningful platform where students don’t just play — they grow, reflect, and prepare for the real world, one decision at a time.</p>
          
        </Card>
      </div>
    </div>;
};
export default AboutPage;