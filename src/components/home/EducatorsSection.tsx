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
    <section className="animate-fade-in" style={{ animationDelay: "0.7s" }}>
      <Card className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 border-slate-600/50 backdrop-blur-lg shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        
        <CardContent className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center text-center lg:text-left">
            <div className="lg:w-2/3 space-y-6">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  For Parents & Educators
                </h2>
                <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                  LifePath helps young people develop critical thinking and decision-making skills through realistic scenarios. Students can experiment with choices and see their consequences in a safe environment.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 my-8">
                {benefits.map((benefit) => (
                  <div key={benefit.title} className="text-center space-y-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mx-auto shadow-lg">
                      <benefit.icon className="h-6 w-6 sm:h-7 sm:w-7 text-blue-300" />
                    </div>
                    <h3 className="font-semibold text-white text-sm sm:text-base">{benefit.title}</h3>
                    <p className="text-white/70 text-xs sm:text-sm">{benefit.description}</p>
                  </div>
                ))}
              </div>
              
              <Button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-blue-500/30 transition-all duration-300 text-sm sm:text-base w-full sm:w-auto px-6 py-3 rounded-full transform hover:scale-105" 
                asChild
              >
                <a href="/about">Learn More About LifePath</a>
              </Button>
            </div>
            
            <div className="lg:w-1/3 flex justify-center">
              <div className="relative">
                <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full shadow-2xl backdrop-blur-sm border border-blue-400/20">
                  <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 text-blue-300" />
                </div>
                <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full">
                  <Users className="h-6 w-6 text-yellow-400" />
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