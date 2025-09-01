import React from 'react';
import { useGameContext } from '@/context/GameContext';
import { useAuth } from '@/context/AuthContext';
import GlobalSessionNotification from '@/components/classroom/GlobalSessionNotification';
import HeroSection from '@/components/home/HeroSection';
import ScenariosSection from '@/components/home/ScenariosSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import ClassroomFeaturesSection from '@/components/home/ClassroomFeaturesSection';
import EducatorsSection from '@/components/home/EducatorsSection';
const HomePage = () => {
  const { userRole } = useGameContext();
  const { currentUser } = useAuth();
  return (
    <>
      {/* Global Session Notification for Students */}
      {currentUser && userRole === 'student' && <GlobalSessionNotification />}
      
      <div className="container mx-auto px-3 py-6 sm:px-4 sm:py-8 md:py-12">
        <HeroSection />
        <ScenariosSection />
        <FeaturesSection />
        <ClassroomFeaturesSection />
        <EducatorsSection />
      </div>
    </>
  );
};
export default HomePage;