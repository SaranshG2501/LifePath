import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-primary/20 rounded-full animate-particle`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 border-2 border-primary/20 rotate-45 animate-rotate-glow" />
      <div className="absolute top-1/3 right-20 w-16 h-16 bg-gradient-to-r from-secondary/10 to-accent/10 rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 left-1/4 w-12 h-12 border border-accent/30 animate-wiggle" />
      <div className="absolute bottom-20 right-10 w-8 h-8 bg-neon-pink/20 rotate-12 animate-tilt" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-xl animate-float" />
      <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-gradient-to-r from-accent/5 to-primary/5 rounded-full blur-xl animate-pulse-slow" />
    </div>
  );
};

export default AnimatedBackground;