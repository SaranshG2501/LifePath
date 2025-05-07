/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  onSnapshot,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7yz9uNDKfCNwx0qPEgJ8EOBJHVp1R_o8",
  authDomain: "lifepath-3ff8f.firebaseapp.com",
  projectId: "lifepath-3ff8f",
  storageBucket: "lifepath-3ff8f.firebasestorage.app",
  messagingSenderId: "185300197020",
  appId: "1:185300197020:web:d3c7701675bc4972fbd759",
  measurementId: "G-N5CCD171WX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics; // Declare the variable
try {
  analytics = getAnalytics(app); // Assign the value inside the try block
} catch (error) {
  console.log("Analytics failed to initialize:", error);
}

// Export the analytics variable after the try-catch block
export { analytics };

// Types
export interface ClassroomStudent {
  id: string;
  name: string;
  joinedAt: Timestamp;
}

export interface Classroom {
  id: string;
  name: string;
  teacherId: string;
  teacherName: string;
  students: ClassroomStudent[];
  activeScenario?: string | null;
  currentScene?: string | null;
  createdAt: Timestamp;
  classCode: string;
  isActive: boolean;
  messages?: {
    text: string;
    sender: string;
    sentAt: Timestamp;
  }[];
}

export interface ScenarioHistory {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  completedAt: Timestamp;
  choices: Array<{
    sceneId: string;
    choiceId: string;
    choiceText?: string;
    timestamp: Date;
    metricChanges?: Record<string, number>;
  }>;
  finalMetrics: Record<string, number>;
  classroomId?: string;
}

// Auth functions
export const loginUser = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

export const createUser = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// User profile functions
export const createUserProfile = async (uid: string, data: any) => {
  try {
    await setDoc(doc(db, 'users', uid), {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: uid, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Badge functions
export const awardBadge = async (userId: string, badgeId: string, title: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      const existingBadges = userData.badges || [];
      
      if (!existingBadges.some((badge: any) => badge.id === badgeId)) {
        await updateDoc(userRef, {
          badges: arrayUnion({
            id: badgeId,
            title: title,
            awardedAt: Timestamp.now()
          })
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error awarding badge:', error);
    return false;
  }
};

// Classroom functions
export const createClassroom = async (teacherId: string, name: string, teacherName: string, description?: string) => {
  try {
    // Generate a unique 6-digit code
    const classCode = `LIFE-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const classroomData = {
      name,
      description: description || '',
      teacherId,
      teacherName: teacherName || 'Teacher',
      students: [],
      createdAt: Timestamp.now(),
      classCode,
      isActive: true,
      activeScenario: null,
      currentScene: null,
      messages: []
    };
    
    // Add to classrooms collection
    const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
    
    // Create a class code reference for easy lookup
    await setDoc(doc(db, 'classCodes', classCode), {
      classroomId: docRef.id
    });
    
    // Add the classroom to teacher's profile
    const teacherRef = doc(db, 'users', teacherId);
    await updateDoc(teacherRef, {
      classrooms: arrayUnion(docRef.id)
    });
    
    // Return the created classroom with its ID
    return {
      id: docRef.id,
      ...classroomData
    };
  } catch (error) {
    console.error('Error creating classroom:', error);
    throw error;
  }
};

export const getClassroomByCode = async (code: string) => {
  try {
    // First get the classroom ID from the code
    const codeRef = doc(db, 'classCodes', code);
    const codeSnap = await getDoc(codeRef);
    
    if (!codeSnap.exists()) {
      return null;
    }
    
    const { classroomId } = codeSnap.data();
    
    // Then get the actual classroom
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomSnap = await getDoc(classroomRef);
    
    if (!classroomSnap.exists()) {
      return null;
    }
    
    return {
      id: classroomId,
      ...classroomSnap.data()
    };
  } catch (error) {
    console.error('Error getting classroom by code:', error);
    throw error;
  }
};

export const getUserClassrooms = async (userId: string, role: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userSnap.data();
    const userClassrooms = userData.classrooms || [];
    
    if (userClassrooms.length === 0) {
      return [];
    }
    
    // Get all classrooms where the user is a member or teacher
    const classrooms = [];
    for (const classroomId of userClassrooms) {
      const classroomRef = doc(db, 'classrooms', classroomId);
      const classroomSnap = await getDoc(classroomRef);
      
      if (classroomSnap.exists()) {
        // Check if user is teacher or student
        const classroomData = classroomSnap.data();
        
        if ((role === 'teacher' && classroomData.teacherId === userId) || 
            (role === 'student' && classroomData.students && classroomData.students.some((s: any) => s.id === userId))) {
          classrooms.push({
            id: classroomId,
            ...classroomData
          });
        }
      }
    }
    
    return classrooms;
  } catch (error) {
    console.error('Error getting user classrooms:', error);
    throw error;
  }
};

// The joinClassroom function with fixed export error
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
    const userClassrooms = userData.classrooms || [];
    
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
    const classroomStudents = classroomData.students || [];
    
    // Check if student is already in this classroom
    const existingStudent = classroomStudents.find(s => s.id === studentId);
    if (!existingStudent) {
      // Add student to classroom
      const newStudent: ClassroomStudent = {
        id: studentId,
        name: studentName,
        joinedAt: Timestamp.now()
      };
      
      // Create a new array with the new student
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

export const startClassroomScenario = async (classroomId: string, scenarioId: string, initialSceneId: string) => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    await updateDoc(classroomRef, {
      activeScenario: scenarioId,
      currentScene: initialSceneId
    });
    
    return true;
  } catch (error) {
    console.error('Error starting classroom scenario:', error);
    return false;
  }
};

export const addClassroomMessage = async (classroomId: string, message: { text: string; sentAt: Date; sender: string }) => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    await updateDoc(classroomRef, {
      messages: arrayUnion({
        ...message,
        sentAt: Timestamp.fromDate(message.sentAt)
      })
    });
    
    return true;
  } catch (error) {
    console.error('Error adding classroom message:', error);
    return false;
  }
};

export const recordStudentVote = async (classroomId: string, studentId: string, choiceId: string) => {
  try {
    const voteData = {
      studentId,
      choiceId,
      timestamp: Timestamp.now()
    };
    
    await addDoc(collection(db, 'classrooms', classroomId, 'votes'), voteData);
    return true;
  } catch (error) {
    console.error('Error recording vote:', error);
    return false;
  }
};

export const getScenarioVotes = async (classroomId: string) => {
  try {
    const votesQuery = query(
      collection(db, 'classrooms', classroomId, 'votes'),
      orderBy('timestamp', 'desc')
    );
    
    const votesSnapshot = await getDocs(votesQuery);
    const votes = votesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return votes;
  } catch (error) {
    console.error('Error getting votes:', error);
    return [];
  }
};

export const onVotesUpdated = (classroomId: string, callback: (votes: any[]) => void) => {
  const votesQuery = query(
    collection(db, 'classrooms', classroomId, 'votes'),
    orderBy('timestamp', 'desc')
  );
  
  return onSnapshot(votesQuery, (snapshot) => {
    const votes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    callback(votes);
  }, (error) => {
    console.error('Error in votes listener:', error);
  });
};

export const onClassroomUpdated = (classroomId: string, callback: (classroom: any) => void) => {
  const classroomRef = doc(db, 'classrooms', classroomId);
  
  return onSnapshot(classroomRef, (snapshot) => {
    if (snapshot.exists()) {
      const classroom = {
        id: snapshot.id,
        ...snapshot.data()
      };
      
      callback(classroom);
    }
  }, (error) => {
    console.error('Error in classroom listener:', error);
  });
};

export const getStudentProgress = async (classroomId: string) => {
  try {
    // In a real app, this would fetch student progress from a specific collection
    // For now, we'll return a mock implementation
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomSnap = await getDoc(classroomRef);
    
    if (!classroomSnap.exists()) {
      return [];
    }
    
    const classroom = classroomSnap.data();
    const students = classroom.students || [];
    
    // Create mock progress data
    return students.map((student: ClassroomStudent) => ({
      studentId: student.id,
      name: student.name,
      progress: Math.floor(Math.random() * 100), // Random progress for now
      completed: Math.random() > 0.5
    }));
  } catch (error) {
    console.error('Error getting student progress:', error);
    return [];
  }
};

export const saveScenarioHistory = async (
  userId: string,
  scenarioId: string,
  scenarioTitle: string,
  choices: any[],
  finalMetrics: any,
  classroomId?: string
) => {
  try {
    const historyData = {
      userId,
      scenarioId,
      scenarioTitle,
      completedAt: Timestamp.now(),
      choices,
      finalMetrics,
      classroomId
    };
    
    // Add to history collection
    const historyRef = await addDoc(collection(db, 'history'), historyData);
    
    // Update user document with this history
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      completedScenarios: arrayUnion(scenarioId),
      history: arrayUnion({
        id: historyRef.id,
        scenarioId,
        scenarioTitle,
        completedAt: Timestamp.now(),
        finalMetrics
      }),
      // Update user metrics based on final metrics
      metrics: finalMetrics
    });
    
    return historyRef.id;
  } catch (error) {
    console.error('Error saving scenario history:', error);
    throw error;
  }
};

