import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Target, Shield } from 'lucide-react';

const EducatorsSection = () => {
  const benefits = [
    {
      icon: Target,
      title: "Skill Development",
      description: "Critical thinking and decision-making skills"
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description: "Experiment with choices without real consequences"
    },
    {
      icon: Users,
      title: "Classroom Ready",
      description: "Built for collaborative learning experiences"
    }
  ];

  return (
    <section className="animate-zoom-in" style={{ animationDelay: "1.2s" }}>
      <Card className="group bg-gradient-to-br from-muted/60 to-background/60 border-primary/20 backdrop-blur-lg shadow-2xl overflow-hidden hover:shadow-primary/30 transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 animate-gradient-shift"></div>
        
        <CardContent className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center text-center lg:text-left">
            <div className="lg:w-2/3 space-y-6">
              <div className="space-y-4 animate-text-reveal">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  For Parents & Educators
                </h2>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                  LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-8">
                {benefits.map((benefit, index) => (
                  <div 
                    key={benefit.title} 
                    className="text-center space-y-3 animate-card-reveal hover:animate-tilt transition-all duration-300 group"
                    style={{ animationDelay: `${0.2 * (index + 1) + 1.4}s` }}
                  >
                    <div className="p-3 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto shadow-lg group-hover:animate-pulse-glow transition-all duration-300">
                      <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary group-hover:animate-wiggle" />
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base group-hover:text-primary transition-colors">{benefit.title}</h3>
                    <p className="text-white/70 text-xs sm:text-sm group-hover:text-white/90 transition-colors">{benefit.description}</p>
                  </div>
                ))}
              </div>
              
              <Button 
                className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white shadow-lg hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105 animate-bounce-in" 
                style={{ animationDelay: '2s' }}
                asChild
              >
                <a href="/about">Learn More About LifePath</a>
              </Button>
            </div>
            
            <div className="lg:w-1/3 flex justify-center animate-float">
              <div className="relative group">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full shadow-2xl backdrop-blur-sm border border-primary/20 group-hover:animate-pulse-glow transition-all duration-300">
                  <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 text-primary group-hover:animate-wiggle" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full animate-bounce">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default EducatorsSection;