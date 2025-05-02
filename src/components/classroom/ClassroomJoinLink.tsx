
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { School, Users, LogIn } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createClassroom, getClassroomByCode, joinClassroom } from '@/lib/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const ClassroomJoinLink: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, userProfile } = useAuth();
  const { userRole, classroomId, setClassroomId, setGameMode } = useGameContext();
  
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // For teachers, create classroom and navigate to teacher dashboard
  const handleTeacherAction = () => {
    if (classroomId) {
      navigate('/teacher');
    } else {
      setIsCreateModalOpen(true);
    }
  };
  
  const handleStudentAction = () => {
    if (classroomId) {
      navigate('/profile');
    } else {
      setIsJoinModalOpen(true);
    }
  };

  const handleCreateClassroom = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to create a classroom",
        variant: "destructive",
      });
      return;
    }

    if (!className.trim()) {
      toast({
        title: "Class Name Required",
        description: "Please enter a name for your classroom",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const newClassroom = await createClassroom(
        currentUser.uid,
        className,
        classDescription
      );
      
      setClassroomId(newClassroom.id);
      setGameMode("classroom");
      
      toast({
        title: "Classroom Created",
        description: `Your classroom '${className}' has been created successfully.`,
      });
      
      setIsCreateModalOpen(false);
      setClassName('');
      setClassDescription('');
      navigate('/teacher');
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        title: "Error",
        description: "Failed to create classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to join a classroom",
        variant: "destructive",
      });
      return;
    }

    if (!classCode.trim()) {
      toast({
        title: "Class Code Required",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Validate class code
      const classroom = await getClassroomByCode(classCode);
      
      if (!classroom) {
        toast({
          title: "Invalid Code",
          description: "The class code you entered does not exist",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Join classroom
      await joinClassroom(
        classroom.id, 
        currentUser.uid, 
        userProfile?.displayName || 'Student'
      );
      
      setClassroomId(classroom.id);
      setGameMode("classroom");
      
      toast({
        title: "Joined Classroom",
        description: `You have joined ${classroom.name}!`,
      });
      
      setIsJoinModalOpen(false);
      setClassCode('');
      navigate('/profile');
    } catch (error) {
      console.error('Error joining classroom:', error);
      toast({
        title: "Error",
        description: "Failed to join classroom. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (userRole === 'teacher') {
    return (
      <>
        <Button 
          className="bg-primary hover:bg-primary/90 w-full" 
          onClick={handleTeacherAction}
        >
          <School className="mr-2 h-5 w-5" />
          {classroomId ? 'Go to Teacher Dashboard' : 'Create a Classroom'}
        </Button>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="bg-black/95 border border-primary/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Create a Classroom</DialogTitle>
              <DialogDescription className="text-white/70">
                Fill out the form below to create your virtual classroom.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Classroom Name</label>
                <Input
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g., Introduction to Psychology"
                  className="bg-black/40 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-white/70">Description (Optional)</label>
                <Input
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  placeholder="Brief description of your class"
                  className="bg-black/40 border-white/20 text-white"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateClassroom}
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>Create Classroom</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <>
      <Button 
        className="bg-primary hover:bg-primary/90 w-full" 
        onClick={handleStudentAction}
      >
        <Users className="mr-2 h-5 w-5" />
        {classroomId ? 'View Your Classroom' : 'Join a Classroom'}
      </Button>
      
      <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
        <DialogContent className="bg-black/95 border border-primary/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Join a Classroom</DialogTitle>
            <DialogDescription className="text-white/70">
              Enter the class code provided by your teacher.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Class Code</label>
              <Input
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                placeholder="e.g., LIFE-1234"
                className="bg-black/40 border-white/20 text-white"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsJoinModalOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleJoinClassroom}
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Join
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClassroomJoinLink;
