import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  duration = 2000,
  suffix = '',
  prefix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasAnimated(true);
          const startTime = Date.now();
          const startCount = 0;

          const updateCount = () => {
            const elapsedTime = Date.now() - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentCount = Math.floor(startCount + (target - startCount) * easeOutQuart);
            
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              setCount(target);
            }
          };

          requestAnimationFrame(updateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`counter-${target}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [target, duration, hasAnimated]);

  return (
    <span 
      id={`counter-${target}`}
      className={`inline-block font-bold text-primary animate-text-reveal ${className}`}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedCounter;