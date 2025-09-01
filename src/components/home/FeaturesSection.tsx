import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Decision Skills",
      description: "Weigh options and understand consequences in realistic situations.",
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
      delay: "0.1s"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "See how choices affect different aspects of your virtual life over time.",
      gradient: "from-purple-500/20 to-pink-500/20",
      iconColor: "text-purple-400",
      delay: "0.2s"
    },
    {
      icon: Lightbulb,
      title: "Life Skills",
      description: "Gain practical knowledge about budgeting, relationships, and education.",
      gradient: "from-amber-500/20 to-orange-500/20",
      iconColor: "text-amber-400",
      delay: "0.3s"
    }
  ];

  return (
    <section className="mb-12 sm:mb-16 animate-slide-in-right" style={{ animationDelay: "0.5s" }}>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 flex items-center justify-center text-white px-4 animate-text-reveal">
          <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary mr-3 animate-rotate-glow" />
          Why LifePath Is Different
        </h2>
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto px-4 animate-text-reveal" style={{ animationDelay: '0.2s' }}>
          Experience learning through immersive decision-making scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {features.map((feature, index) => (
          <Card 
            key={feature.title}
            className={`group bg-gradient-to-br ${feature.gradient} border-white/20 backdrop-blur-lg shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:border-white/30 animate-card-reveal hover:animate-tilt`}
            style={{ animationDelay: `${0.1 * (index + 1) + 0.7}s` }}
          >
            <CardContent className="p-6 sm:p-8 text-center">
              <div className={`p-4 bg-gradient-to-br ${feature.gradient} rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:animate-pulse-glow`}>
                <feature.icon className={`h-8 w-8 sm:h-10 sm:w-10 ${feature.iconColor} group-hover:animate-wiggle`} />
              </div>
              <h3 className="font-bold text-xl sm:text-2xl mb-4 text-white group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed group-hover:text-white/90 transition-colors">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;