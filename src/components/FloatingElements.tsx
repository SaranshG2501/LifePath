import React from 'react';

interface FloatingElementsProps {
  count?: number;
  variant?: 'default' | 'dense' | 'sparse';
}

const FloatingElements: React.FC<FloatingElementsProps> = ({ count = 20, variant = 'default' }) => {
  const shapes = ['circle', 'square', 'triangle', 'star', 'diamond'];
  const colors = [
    'from-primary/20 to-primary/5',
    'from-secondary/20 to-secondary/5',
    'from-accent/20 to-accent/5',
    'from-neon-green/20 to-neon-green/5',
    'from-neon-yellow/20 to-neon-yellow/5',
  ];

  const getRandomPosition = () => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
  });

  const getRandomSize = () => {
    const sizes = variant === 'dense' ? [20, 30, 40] : variant === 'sparse' ? [40, 60, 80] : [30, 40, 50, 60];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getRandomAnimation = () => {
    const animations = [
      'animate-float',
      'animate-pulse-slow',
      'animate-wiggle',
      'animate-hover-bounce',
    ];
    return animations[Math.floor(Math.random() * animations.length)];
  };

  const getRandomDelay = () => `${Math.random() * 5}s`;

  const renderShape = (shape: string, size: number, gradient: string, index: number) => {
    const baseClasses = `absolute bg-gradient-to-br ${gradient} blur-xl opacity-40 pointer-events-none`;
    const animation = getRandomAnimation();
    const delay = getRandomDelay();

    switch (shape) {
      case 'circle':
        return (
          <div
            key={index}
            className={`${baseClasses} rounded-full ${animation}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              ...getRandomPosition(),
              animationDelay: delay,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        );
      case 'square':
        return (
          <div
            key={index}
            className={`${baseClasses} rotate-45 ${animation}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              ...getRandomPosition(),
              animationDelay: delay,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        );
      case 'triangle':
        return (
          <div
            key={index}
            className={`${baseClasses} ${animation}`}
            style={{
              width: 0,
              height: 0,
              borderLeft: `${size / 2}px solid transparent`,
              borderRight: `${size / 2}px solid transparent`,
              borderBottom: `${size}px solid currentColor`,
              ...getRandomPosition(),
              animationDelay: delay,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        );
      case 'star':
        return (
          <div
            key={index}
            className={`${baseClasses} ${animation}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              ...getRandomPosition(),
              animationDelay: delay,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        );
      case 'diamond':
        return (
          <div
            key={index}
            className={`${baseClasses} rotate-45 ${animation}`}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              ...getRandomPosition(),
              animationDelay: delay,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: count }).map((_, index) => {
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = getRandomSize();
        return renderShape(shape, size, color, index);
      })}
    </div>
  );
};

export default FloatingElements;
