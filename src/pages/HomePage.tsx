import React from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import HeroSection from '@/components/home/HeroSection';
import ScenariosSection from '@/components/home/ScenariosSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import EducatorsSection from '@/components/home/EducatorsSection';
const HomePage = () => {
  return (
    <>
      {/* Animated Background */}
      <AnimatedBackground />
      
      <div className="relative container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <HeroSection />
        <ScenariosSection />
        <FeaturesSection />
        <EducatorsSection />
      </div>
    </>
  );
};
export default HomePage;