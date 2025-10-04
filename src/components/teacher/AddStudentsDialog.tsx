import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AddStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onStudentsAdded: () => void;
}

interface StudentData {
  username: string;
  email: string;
  password: string;
}

export const AddStudentsDialog = ({ open, onOpenChange, sessionId, onStudentsAdded }: AddStudentsDialogProps) => {
  const { toast } = useToast();
  const { signup } = useAuth();
  const [students, setStudents] = useState<StudentData[]>([{ username: '', email: '', password: '' }]);
  const [loading, setLoading] = useState(false);

  const addStudentField = () => {
    setStudents([...students, { username: '', email: '', password: '' }]);
  };

  const removeStudentField = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const updateStudent = (index: number, field: keyof StudentData, value: string) => {
    const updated = [...students];
    updated[index][field] = value;
    setStudents(updated);
  };

  const handleCreateStudents = async () => {
    setLoading(true);
    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const student of students) {
        if (!student.username || !student.email || !student.password) {
          continue;
        }

        try {
          await signup(student.email, student.password, student.username, 'student');
          successCount++;
        } catch (error: any) {
          errors.push(`${student.email}: ${error.message}`);
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Students Created',
          description: `Successfully created ${successCount} student account(s)`,
        });
        setStudents([{ username: '', email: '', password: '' }]);
        onStudentsAdded();
        onOpenChange(false);
      }

      if (errors.length > 0) {
        toast({
          title: 'Some Errors Occurred',
          description: errors.join('\n'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Students</DialogTitle>
          <DialogDescription>
            Create new student accounts for your classroom
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {students.map((student, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Student {index + 1}</span>
                {students.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStudentField(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Username</Label>
                  <Input
                    placeholder="john_doe"
                    value={student.username}
                    onChange={(e) => updateStudent(index, 'username', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="student@example.com"
                    value={student.email}
                    onChange={(e) => updateStudent(index, 'email', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    value={student.password}
                    onChange={(e) => updateStudent(index, 'password', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addStudentField} className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Another Student
          </Button>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreateStudents} disabled={loading} className="flex-1">
              Create {students.filter(s => s.username && s.email && s.password).length} Student(s)
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
