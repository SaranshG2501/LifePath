/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  orderBy,
  onSnapshot,
  DocumentData,
  Timestamp,
  FieldValue
} from 'firebase/firestore';
import { Metrics } from '@/types/game';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
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
const auth = getAuth(app);
const db = getFirestore(app);

// Define types
export interface ClassroomStudent {
  id: string;
  name: string;
  joinedAt: Timestamp | Date;
}

export interface Classroom {
  id?: string;
  name: string;
  description?: string;
  teacherId: string;
  students: ClassroomStudent[];
  activeScenario?: string | null;
  currentScene?: string | null;
  createdAt: any;
  classCode: string;
  isActive: boolean;
}

export interface UserProfileData {
  displayName?: string;
  email?: string;
  role?: string;
  xp?: number;
  level?: number;
  completedScenarios?: string[];
  badges?: string[];
  history?: ScenarioHistory[];
  metrics?: Metrics;
  classrooms?: string[];
  createdAt?: Date | Timestamp;
}

// New type for scenario history
export interface ScenarioHistory {
  scenarioId: string;
  scenarioTitle?: string;
  startedAt: Timestamp | Date;
  completedAt?: Timestamp | Date;
  choices: ScenarioChoice[];
  finalMetrics?: Metrics;
}

export interface ScenarioChoice {
  sceneId: string;
  choiceId: string;
  choiceText?: string;
  timestamp: Timestamp | Date;
  metricChanges?: Record<string, number>;
}

// Auth functions
export const createUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const loginUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Firestore functions
export const createUserProfile = async (uid: string, userData: UserProfileData) => {
  // Initialize metrics at 0
  const initialMetrics: Metrics = {
    health: 0,
    money: 0,
    happiness: 0,
    knowledge: 0,
    relationships: 0
  };
  
  const defaultData: UserProfileData = {
    xp: 0,
    level: 1,
    completedScenarios: [],
    badges: [],
    history: [],
    metrics: initialMetrics,
    classrooms: [],
    createdAt: Timestamp.now()
  };
  
  // Merge the default data with provided user data
  const mergedData = {
    ...defaultData,
    ...userData
  };
  
  return setDoc(doc(db, 'users', uid), mergedData);
};

export const getUserProfile = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const updateUserProfile = async (uid: string, data: Record<string, any>) => {
  return updateDoc(doc(db, 'users', uid), data);
};

// Scenario History functions
export const saveScenarioHistory = async (
  userId: string, 
  scenarioId: string, 
  scenarioTitle: string, 
  choices: ScenarioChoice[], 
  finalMetrics: Metrics
) => {
  try {
    // Get user's current profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const history = userData.history || [];
    
    // Create new history entry
    const historyEntry: ScenarioHistory = {
      scenarioId,
      scenarioTitle,
      startedAt: choices.length > 0 ? choices[0].timestamp : Timestamp.now(),
      completedAt: Timestamp.now(),
      choices,
      finalMetrics
    };
    
    // Add to history array
    const updatedHistory = [...history, historyEntry];
    
    // Update completed scenarios
    const completedScenarios = userData.completedScenarios || [];
    if (!completedScenarios.includes(scenarioId)) {
      completedScenarios.push(scenarioId);
    }
    
    // Update user profile
    await updateDoc(doc(db, 'users', userId), {
      history: updatedHistory,
      completedScenarios,
      metrics: finalMetrics,
      xp: (userData.xp || 0) + 50 // Award XP for completion
    });
    
    return historyEntry;
  } catch (error) {
    console.error('Error saving scenario history:', error);
    throw error;
  }
};

// Classroom functions
export const createClassroom = async (teacherId: string, name: string, description?: string) => {
  try {
    const classroomData: Classroom = {
      id: '', // This will be replaced by Firestore's ID
      name,
      description: description || "",
      teacherId,
      students: [],
      activeScenario: null,
      currentScene: null,
      createdAt: Timestamp.now(),
      classCode: generateClassCode(),
      isActive: true
    };
    
    const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
    
    // Update teacher's profile to include the new classroom
    const teacherRef = doc(db, 'users', teacherId);
    const teacherDoc = await getDoc(teacherRef);
    
    if (teacherDoc.exists()) {
      const userData = teacherDoc.data();
      const teacherClassrooms = userData.classrooms || [];
      
      await updateDoc(teacherRef, {
        classrooms: [...teacherClassrooms, docRef.id]
      });
    }
    
    return { id: docRef.id, ...classroomData };
  } catch (error) {
    console.error("Error creating classroom:", error);
    throw error;
  }
};

export const getClassroom = async (classroomId: string) => {
  const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
  if (classroomDoc.exists()) {
    return { id: classroomDoc.id, ...classroomDoc.data() } as Classroom;
  }
  return null;
};

export const joinClassroom = async (classroomId: string, studentId: string, studentName: string) => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomDoc = await getDoc(classroomRef);
    
    if (!classroomDoc.exists()) {
      throw new Error("Classroom not found");
    }
    
    const classroom = classroomDoc.data() as Classroom;
    const studentList = classroom.students || [];
    
    // Check if student is already in the classroom
    if (!studentList.some((s) => s.id === studentId)) {
      const newStudent: ClassroomStudent = {
        id: studentId,
        name: studentName,
        joinedAt: Timestamp.now()
      };
      
      // Add student to classroom
      await updateDoc(classroomRef, {
        students: [...studentList, newStudent]
      });
    }
    
    // Also update user's classrooms list
    const userRef = doc(db, 'users', studentId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userClassrooms = userData.classrooms || [];
      
      if (!userClassrooms.includes(classroomId)) {
        await updateDoc(userRef, {
          classrooms: [...userClassrooms, classroomId]
        });
      }
    }
    
    // Fetch the updated classroom data
    const updatedClassroomDoc = await getDoc(classroomRef);
    return { id: updatedClassroomDoc.id, ...updatedClassroomDoc.data() } as Classroom;
  } catch (error) {
    console.error("Error joining classroom:", error);
    throw error;
  }
};

export const getClassroomByCode = async (classCode: string) => {
  try {
    const classroomsQuery = query(
      collection(db, 'classrooms'), 
      where('classCode', '==', classCode)
    );
    
    const snapshot = await getDocs(classroomsQuery);
    
    if (snapshot.empty) {
      return null;
    }
    
    const classroomDoc = snapshot.docs[0];
    return { id: classroomDoc.id, ...classroomDoc.data() } as Classroom;
  } catch (error) {
    console.error("Error getting classroom by code:", error);
    throw error;
  }
};

export const getClassrooms = async (teacherId?: string) => {
  try {
    let classroomsQuery;
    if (teacherId) {
      classroomsQuery = query(collection(db, 'classrooms'), where('teacherId', '==', teacherId));
    } else {
      classroomsQuery = collection(db, 'classrooms');
    }
    
    const snapshot = await getDocs(classroomsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Classroom[];
  } catch (error) {
    console.error("Error getting classrooms:", error);
    return [];
  }
};

export const getUserClassrooms = async (userId: string, role: string) => {
  try {
    // For teachers, get classrooms they created
    if (role === 'teacher') {
      return getClassrooms(userId);
    }
    
    // For students, get classrooms they've joined
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return [];
    }
    
    const userData = userDoc.data();
    const userClassrooms = userData.classrooms || [];
    
    // If user hasn't joined any classrooms yet
    if (userClassrooms.length === 0) {
      return [];
    }
    
    // Get details for each classroom the user is in
    const classroomPromises = userClassrooms.map(classroomId => getClassroom(classroomId));
    const classrooms = await Promise.all(classroomPromises);
    
    // Filter out any null results (in case a classroom was deleted)
    return classrooms.filter(Boolean) as Classroom[];
  } catch (error) {
    console.error("Error getting user classrooms:", error);
    return [];
  }
};

export const updateClassroom = async (classroomId: string, data: Partial<Classroom>) => {
  return updateDoc(doc(db, 'classrooms', classroomId), data as DocumentData);
};

// Classroom activity functions
export const startClassroomScenario = async (classroomId: string, scenarioId: string, initialScene: string) => {
  return updateDoc(doc(db, 'classrooms', classroomId), {
    activeScenario: scenarioId,
    currentScene: initialScene,
    startedAt: Timestamp.now(),
    votes: {},
    studentProgress: {}
  });
};

export const recordStudentVote = async (classroomId: string, studentId: string, choiceId: string) => {
  const voteRef = doc(db, 'classrooms', classroomId, 'votes', studentId);
  return setDoc(voteRef, { 
    choiceId, 
    timestamp: Timestamp.now() 
  });
};

export const getScenarioVotes = async (classroomId: string) => {
  const votesQuery = collection(db, 'classrooms', classroomId, 'votes');
  const snapshot = await getDocs(votesQuery);
  return snapshot.docs.map(doc => ({ studentId: doc.id, ...doc.data() }));
};

export const advanceClassroomScene = async (classroomId: string, nextSceneId: string) => {
  // Clear previous votes and set new scene
  const votesRef = collection(db, 'classrooms', classroomId, 'votes');
  const votesSnapshot = await getDocs(votesRef);
  
  // Delete previous votes
  const deletePromises = votesSnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  
  // Set new scene
  return updateDoc(doc(db, 'classrooms', classroomId), {
    currentScene: nextSceneId,
    lastUpdated: Timestamp.now()
  });
};

// Helper to generate a random class code
const generateClassCode = () => {
  const prefix = 'LIFE';
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${prefix}-${randomDigits}`;
};

// Real-time listeners
export const onClassroomUpdated = (classroomId: string, callback: (classroom: Classroom) => void) => {
  const unsubscribe = onSnapshot(doc(db, 'classrooms', classroomId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as Classroom);
    }
  });
  
  return unsubscribe;
};

export const onVotesUpdated = (classroomId: string, callback: (votes: any[]) => void) => {
  const votesRef = collection(db, 'classrooms', classroomId, 'votes');
  
  const unsubscribe = onSnapshot(votesRef, (snapshot) => {
    const votes = snapshot.docs.map(doc => ({ 
      studentId: doc.id, 
      ...doc.data() 
    }));
    callback(votes);
  });
  
  return unsubscribe;
};

export { auth, db, Timestamp };
