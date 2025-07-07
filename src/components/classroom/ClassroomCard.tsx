
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, Calendar, School, Trash2, AlertTriangle } from 'lucide-react';
import { Classroom, convertTimestampToDate } from '@/lib/firebase';

interface ClassroomCardProps {
  classroom: Classroom;
  onSelect: (classroom: Classroom) => void;
  onDelete: (classroomId: string, classroomName: string) => void;
  isDeleting: boolean;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
  classroom,
  onSelect,
  onDelete,
  isDeleting
}) => {
  return (
    <Card className="bg-black/20 border-white/10 hover:bg-black/30 transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg">{classroom.name}</CardTitle>
            <CardDescription className="text-white/70 mt-1">
              {classroom.description || "No description"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-2">
            {classroom.activeSessionId && (
              <Badge className="bg-green-500/20 text-green-300 border-0 text-xs">
                Live
              </Badge>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1 h-8 w-8"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border border-red-500/20">
                <AlertDialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-500/20 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <AlertDialogTitle className="text-white">Delete Classroom</AlertDialogTitle>
                  </div>
                  <AlertDialogDescription className="text-white/70">
                    Are you sure you want to permanently delete <strong>"{classroom.name}"</strong>?
                    <br /><br />
                    This action will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Remove all {classroom.students?.length || 0} students from the classroom</li>
                      <li>Delete all session data and history</li>
                      <li>Remove the classroom from students' profiles</li>
                      <li>Cannot be undone</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-transparent border border-white/10 text-white hover:bg-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(classroom.id!, classroom.name)}
                    className="bg-red-500 hover:bg-red-600 text-white"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Users className="h-4 w-4" />
              <span>{classroom.students?.length || 0} Students</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="h-4 w-4" />
              <span>{convertTimestampToDate(classroom.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="text-xs text-white/60 bg-black/30 rounded px-2 py-1 font-mono">
            Code: {classroom.classCode}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onSelect(classroom)}
              className="flex-1 border-white/20 bg-black/20 text-white hover:bg-white/10"
            >
              <School className="h-4 w-4 mr-1" />
              Manage
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClassroomCard;
