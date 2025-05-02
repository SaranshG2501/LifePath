
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { School, Users } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';

const ClassroomJoinLink: React.FC = () => {
  const navigate = useNavigate();
  const { userRole, classroomId } = useGameContext();
  
  // For teachers, navigate to teacher dashboard
  // For students, show an appropriate button based on classroom join status
  
  if (userRole === 'teacher') {
    return (
      <Button 
        className="bg-primary hover:bg-primary/90 w-full" 
        onClick={() => navigate('/teacher')}
      >
        <School className="mr-2 h-5 w-5" />
        Go to Teacher Dashboard
      </Button>
    );
  }
  
  return (
    <Button 
      className="bg-primary hover:bg-primary/90 w-full" 
      onClick={() => navigate('/profile')}
    >
      <Users className="mr-2 h-5 w-5" />
      {classroomId ? 'View Your Classroom' : 'Join a Classroom'}
    </Button>
  );
};

export default ClassroomJoinLink;
