
// Only the function with the error needs to be updated
export const joinClassroom = async (classroomId: string, studentId: string, studentName: string) => {
  try {
    console.log(`Student ${studentId} attempting to join classroom ${classroomId}`);
    
    // Step 1: Get the classroom document
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomSnap = await getDoc(classroomRef);
    
    if (!classroomSnap.exists()) {
      throw new Error("Classroom not found");
    }
    
    // Step 2: Get and update the user document first
    const userRef = doc(db, 'users', studentId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }
    
    // Get current data
    const userData = userSnap.data();
    let userClassrooms = userData.classrooms || [];
    
    // Check if user already has this classroom
    if (!userClassrooms.includes(classroomId)) {
      // Create a new array instead of using spread to avoid type error
      const updatedClassrooms = [...userClassrooms];
      updatedClassrooms.push(classroomId);
      
      // Update user document
      await updateDoc(userRef, { classrooms: updatedClassrooms });
      console.log(`Added classroom ${classroomId} to user ${studentId}'s profile`);
      
      // Award badge for joining first classroom if this is their first one
      if (updatedClassrooms.length === 1) {
        await awardBadge(studentId, "classroom-joined", "Joined First Classroom");
      }
    }
    
    // Step 3: Now update the classroom document
    const classroomData = classroomSnap.data() as Classroom;
    let classroomStudents = classroomData.students || [];
    
    // Check if student is already in this classroom
    const existingStudent = classroomStudents.find(s => s.id === studentId);
    if (!existingStudent) {
      // Add student to classroom
      const newStudent: ClassroomStudent = {
        id: studentId,
        name: studentName,
        joinedAt: Timestamp.now()
      };
      
      const updatedStudents = [...classroomStudents, newStudent];
      // Update classroom document
      await updateDoc(classroomRef, { students: updatedStudents });
      console.log(`Added student ${studentId} to classroom ${classroomId}`);
    }
    
    // Step 4: Get and return the updated classroom data
    const updatedClassroomSnap = await getDoc(classroomRef);
    if (updatedClassroomSnap.exists()) {
      return { 
        id: classroomId, 
        ...updatedClassroomSnap.data() 
      } as Classroom;
    } else {
      throw new Error("Failed to retrieve updated classroom data");
    }
    
  } catch (error) {
    console.error("Error joining classroom:", error);
    throw error;
  }
};
