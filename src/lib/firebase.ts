/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
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
  arrayUnion,
  arrayRemove,
  FieldValue,
  runTransaction
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { Metrics } from '@/types/game';

// Your web app's Firebase configuration
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

// Initialize Analytics with error handling
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics failed to initialize:", error);
}

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
  teacherName?: string;
  students: ClassroomStudent[];
  activeScenario?: string | null;
  currentScene?: string | null;
  createdAt: any;
  classCode: string;
  isActive: boolean;
  activeSessionId?: string | null;
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

// Enhanced Live Session with scene tracking and proper lifecycle
export interface LiveSession {
  id?: string;
  classroomId: string;
  teacherId: string;
  teacherName?: string;
  scenarioId: string;
  scenarioTitle: string;
  currentSceneId: string;
  currentSceneIndex?: number;
  status: 'active' | 'ended';
  startedAt: Timestamp;
  endedAt?: Timestamp;
  participants: string[];
  currentChoices?: Record<string, string>;
  resultPayload?: {
    choices: Record<string, any>;
    metrics: Record<string, any>;
    summary: string;
  };
  lastUpdated?: Timestamp;
}

export interface SessionParticipant {
  sessionId: string;
  studentId: string;
  studentName: string;
  joinedAt: Timestamp;
  isActive: boolean;
  currentChoice?: string;
  lastActivity?: Timestamp;
}

export interface SessionNotification {
  id?: string;
  type: 'live_session_started';
  sessionId: string;
  classroomId: string;
  teacherName: string;
  scenarioTitle: string;
  studentId: string;
  createdAt: Timestamp;
  read: boolean;
}

// Enhanced session creation with better atomic transaction
export const createLiveSession = async (
  classroomId: string,
  teacherId: string,
  scenarioId: string,
  scenarioTitle: string,
  initialSceneId: string = "start"
) => {
  try {
    console.log("Creating live session for classroom:", classroomId);
    
    const result = await runTransaction(db, async (transaction) => {
      const classroomRef = doc(db, 'classrooms', classroomId);
      const classroomDoc = await transaction.get(classroomRef);
      
      if (!classroomDoc.exists()) {
        throw new Error("Classroom not found");
      }
      
      const classroomData = classroomDoc.data() as Classroom;
      
      // Check if there's already an active session
      if (classroomData.activeSessionId) {
        const existingSessionRef = doc(db, 'liveSessions', classroomData.activeSessionId);
        const existingSessionDoc = await transaction.get(existingSessionRef);
        
        if (existingSessionDoc.exists()) {
          const existingSession = existingSessionDoc.data() as LiveSession;
          if (existingSession.status === 'active') {
            throw new Error("Cannot start new session: another session is already active. End the current session first.");
          }
        }
      }
      
      // Get teacher info
      const teacherRef = doc(db, 'users', teacherId);
      const teacherDoc = await transaction.get(teacherRef);
      const teacherName = teacherDoc.exists() ? teacherDoc.data().displayName || 'Teacher' : 'Teacher';

      // Create new session
      const sessionRef = doc(collection(db, 'liveSessions'));
      const sessionData: LiveSession = {
        classroomId,
        teacherId,
        teacherName,
        scenarioId,
        scenarioTitle,
        currentSceneId: initialSceneId,
        currentSceneIndex: 0,
        status: 'active',
        startedAt: Timestamp.now(),
        participants: [],
        currentChoices: {},
        lastUpdated: Timestamp.now()
      };
      
      transaction.set(sessionRef, sessionData);
      
      // Update classroom with new active session
      transaction.update(classroomRef, {
        activeSessionId: sessionRef.id,
        activeScenario: scenarioId,
        currentScene: initialSceneId,
        lastActivity: Timestamp.now()
      });
      
      return { sessionId: sessionRef.id, sessionData };
    });
    
    // Create notifications for students (outside transaction for performance)
    const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
    if (classroomDoc.exists()) {
      const classroomData = classroomDoc.data() as Classroom;
      const students = classroomData.students || [];
      
      if (students.length > 0) {
        const teacherDoc = await getDoc(doc(db, 'users', teacherId));
        const teacherName = teacherDoc.exists() ? teacherDoc.data().displayName || 'Teacher' : 'Teacher';
        
        const notificationPromises = students.map(student => {
          const notificationData: SessionNotification = {
            type: 'live_session_started',
            sessionId: result.sessionId,
            classroomId,
            teacherName,
            scenarioTitle,
            studentId: student.id,
            createdAt: Timestamp.now(),
            read: false
          };
          
          return setDoc(doc(db, 'notifications', `${result.sessionId}_${student.id}`), notificationData);
        });
        
        await Promise.all(notificationPromises);
        console.log("Notifications created for", students.length, "students");
      }
    }

    return { id: result.sessionId, ...result.sessionData };
  } catch (error) {
    console.error("Error creating live session:", error);
    throw error;
  }
};

// Enhanced session ending with result payload
export const endLiveSession = async (sessionId: string, classroomId: string, resultPayload?: any) => {
  try {
    console.log("Ending live session:", sessionId);
    
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'liveSessions', sessionId);
      const classroomRef = doc(db, 'classrooms', classroomId);
      
      const sessionDoc = await transaction.get(sessionRef);
      if (!sessionDoc.exists()) {
        throw new Error("Session not found");
      }
      
      // End the session with result payload
      const updateData: any = {
        status: 'ended',
        endedAt: Timestamp.now(),
        lastUpdated: Timestamp.now()
      };
      
      if (resultPayload) {
        updateData.resultPayload = resultPayload;
      }
      
      transaction.update(sessionRef, updateData);
      
      // Clear active session from classroom
      transaction.update(classroomRef, {
        activeSessionId: null,
        activeScenario: null,
        currentScene: null,
        lastActivity: Timestamp.now()
      });
    });
    
    // Clean up participants and notifications (outside transaction)
    const participantsQuery = query(
      collection(db, 'sessionParticipants'),
      where('sessionId', '==', sessionId)
    );
    const participantsSnapshot = await getDocs(participantsQuery);
    
    const cleanupPromises = [
      ...participantsSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isActive: false })
      )
    ];
    
    // Clean up notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('sessionId', '==', sessionId)
    );
    const notificationsSnapshot = await getDocs(notificationsQuery);
    cleanupPromises.push(
      ...notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    );
    
    await Promise.all(cleanupPromises);
    console.log("Session cleanup completed");
  } catch (error) {
    console.error("Error ending live session:", error);
    throw error;
  }
};

// Enhanced join session with validation
export const joinLiveSession = async (sessionId: string, studentId: string, studentName: string) => {
  try {
    console.log("Student attempting to join session:", sessionId);
    
    const result = await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'liveSessions', sessionId);
      const sessionDoc = await transaction.get(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error("Session not found");
      }

      const sessionData = sessionDoc.data() as LiveSession;
      
      if (sessionData.status !== 'active') {
        throw new Error("Session is not active");
      }
      
      // Add student to participants if not already present
      if (!sessionData.participants.includes(studentId)) {
        transaction.update(sessionRef, {
          participants: arrayUnion(studentId),
          lastUpdated: Timestamp.now()
        });
      }
      
      return sessionData;
    });

    // Create participant record
    const participantData: SessionParticipant = {
      sessionId,
      studentId,
      studentName,
      joinedAt: Timestamp.now(),
      isActive: true,
      lastActivity: Timestamp.now()
    };

    await setDoc(doc(db, 'sessionParticipants', `${sessionId}_${studentId}`), participantData);

    // Mark notification as read
    try {
      await updateDoc(doc(db, 'notifications', `${sessionId}_${studentId}`), {
        read: true
      });
    } catch (error) {
      console.log("No notification to update:", error);
    }

    return { id: sessionId, ...result };
  } catch (error) {
    console.error("Error joining live session:", error);
    throw error;
  }
};

// Enhanced choice submission with vote tracking
export const submitLiveChoice = async (sessionId: string, studentId: string, choiceId: string, questionId?: string) => {
  try {
    console.log("Submitting choice for session:", sessionId, "choice:", choiceId);
    
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'liveSessions', sessionId);
      const sessionDoc = await transaction.get(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error("Session not found");
      }

      const sessionData = sessionDoc.data() as LiveSession;
      if (sessionData.status !== 'active') {
        throw new Error("Session is not active");
      }

      // Update session choices
      const currentChoices = sessionData.currentChoices || {};
      currentChoices[studentId] = choiceId;

      transaction.update(sessionRef, {
        currentChoices,
        lastUpdated: Timestamp.now()
      });

      // Update participant record
      const participantRef = doc(db, 'sessionParticipants', `${sessionId}_${studentId}`);
      transaction.update(participantRef, {
        currentChoice: choiceId,
        lastActivity: Timestamp.now()
      });
    });

    console.log("Choice submitted successfully");
  } catch (error) {
    console.error("Error submitting live choice:", error);
    throw error;
  }
};

// Advance session to next scene with scene index tracking
export const advanceLiveSession = async (sessionId: string, nextSceneId: string, nextSceneIndex?: number) => {
  try {
    const updateData: any = {
      currentSceneId: nextSceneId,
      currentChoices: {}, // Reset choices for new scene
      lastUpdated: Timestamp.now()
    };
    
    if (nextSceneIndex !== undefined) {
      updateData.currentSceneIndex = nextSceneIndex;
    }
    
    await updateDoc(doc(db, 'liveSessions', sessionId), updateData);
  } catch (error) {
    console.error("Error advancing live session:", error);
    throw error;
  }
};

// Get active session for classroom
export const getActiveSession = async (classroomId: string) => {
  try {
    const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
    if (!classroomDoc.exists()) {
      return null;
    }
    
    const classroomData = classroomDoc.data() as Classroom;
    if (!classroomData.activeSessionId) {
      return null;
    }
    
    const sessionDoc = await getDoc(doc(db, 'liveSessions', classroomData.activeSessionId));
    if (!sessionDoc.exists()) {
      return null;
    }
    
    const sessionData = sessionDoc.data() as LiveSession;
    if (sessionData.status !== 'active') {
      return null;
    }
    
    return { id: sessionDoc.id, ...sessionData } as LiveSession;
  } catch (error) {
    console.error("Error getting active session:", error);
    return null;
  }
};

// Get student notifications
export const getStudentNotifications = async (studentId: string) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('studentId', '==', studentId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting notifications:", error);
    return [];
  }
};

// Listen to notifications with real-time updates
export const onNotificationsUpdated = (studentId: string, callback: (notifications: SessionNotification[]) => void) => {
  const q = query(
    collection(db, 'notifications'),
    where('studentId', '==', studentId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SessionNotification[];
    callback(notifications);
  });
};

// Helper function to convert Timestamp to Date
export const convertTimestampToDate = (timestamp: Timestamp | Date): Date => {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  // It's a Firestore Timestamp
  return (timestamp as any).toDate();
};

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
    createdAt: Timestamp.now(),
    ...userData
  };
  
  return setDoc(doc(db, 'users', uid), defaultData);
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

// Award a badge to a user
export const awardBadge = async (userId: string, badgeId: string, badgeTitle: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userBadges = userData.badges || [];
      
      // Check if user already has this badge
      if (userBadges.some((badge: any) => badge.id === badgeId)) {
        console.log("User already has this badge:", badgeId);
        return false;
      }
      
      // Add new badge with timestamp
      const newBadge = {
        id: badgeId,
        title: badgeTitle,
        awardedAt: Timestamp.now()
      };
      
      await updateDoc(userRef, {
        badges: [...userBadges, newBadge],
        xp: (userData.xp || 0) + 25 // Award XP for getting a badge
      });
      
      console.log("Badge awarded:", badgeId);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error awarding badge:", error);
    return false;
  }
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
    // Get teacher info
    const teacherDoc = await getDoc(doc(db, 'users', teacherId));
    const teacherName = teacherDoc.exists() ? teacherDoc.data().displayName || 'Teacher' : 'Teacher';

    // Generate a unique class code
    const classCode = generateClassCode();
    
    // Create classroom data
    const classroomData = {
      name,
      description: description || "",
      teacherId,
      teacherName,
      students: [],
      activeScenario: null,
      currentScene: null,
      createdAt: Timestamp.now(),
      classCode,
      isActive: true,
      activeSessionId: null
    };
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
    
    // Update teacher's profile to include the new classroom
    const teacherRef = doc(db, 'users', teacherId);
    
    if (teacherDoc.exists()) {
      const userData = teacherDoc.data();
      const teacherClassrooms = userData.classrooms || [];
      
      await updateDoc(teacherRef, {
        classrooms: [...teacherClassrooms, docRef.id]
      });
    }
    
    // Return the classroom object with the generated id
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

// Remove student from classroom with live session cleanup
export const removeStudentFromClassroom = async (classroomId: string, studentId: string) => {
  try {
    console.log(`Removing student ${studentId} from classroom ${classroomId}`);
    
    await runTransaction(db, async (transaction) => {
      const classroomRef = doc(db, 'classrooms', classroomId);
      const classroomDoc = await transaction.get(classroomRef);
      
      if (!classroomDoc.exists()) {
        throw new Error("Classroom not found");
      }
      
      const classroomData = classroomDoc.data() as Classroom;
      const updatedStudents = classroomData.students.filter(student => student.id !== studentId);
      
      // Update classroom
      transaction.update(classroomRef, {
        students: updatedStudents
      });
      
      // If there's an active session, remove student from it too
      if (classroomData.activeSessionId) {
        const sessionRef = doc(db, 'liveSessions', classroomData.activeSessionId);
        const sessionDoc = await transaction.get(sessionRef);
        
        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data() as LiveSession;
          const updatedParticipants = sessionData.participants.filter(id => id !== studentId);
          
          transaction.update(sessionRef, {
            participants: updatedParticipants
          });
        }
      }
    });
    
    // Remove classroom from student's profile
    const userRef = doc(db, 'users', studentId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const userClassrooms = userData.classrooms || [];
      const updatedClassrooms = userClassrooms.filter((id: string) => id !== classroomId);
      
      await updateDoc(userRef, {
        classrooms: updatedClassrooms
      });
      console.log("Removed classroom from student's profile");
    }
    
    return true;
  } catch (error) {
    console.error("Error removing student from classroom:", error);
    throw error;
  }
};

// Join classroom function with better multiple classroom support - FIXED VERSION
export const joinClassroom = async (classroomId: string, studentId: string, studentName: string) => {
  try {
    console.log(`Student ${studentId} attempting to join classroom ${classroomId}`);
    
    // Step 1: Get the classroom document
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomDoc = await getDoc(classroomRef);
    
    if (!classroomDoc.exists()) {
      console.error("Classroom not found");
      throw new Error("Classroom not found");
    }
    
    // Step 2: Get current classroom data
    const classroomData = classroomDoc.data() as Classroom;
    const currentStudents = classroomData.students || [];
    
    // Step 3: Check if student is already in the classroom
    const existingStudentIndex = currentStudents.findIndex(s => s.id === studentId);
    
    if (existingStudentIndex === -1) {
      // Student is not in the classroom yet, add them
      const newStudent = {
        id: studentId,
        name: studentName,
        joinedAt: Timestamp.now()
      };
      
      // Create a new students array with the new student
      const updatedStudents = [...currentStudents, newStudent];
      
      // Update the classroom document with the new students array
      await updateDoc(classroomRef, { students: updatedStudents });
      console.log(`Added student ${studentId} to classroom ${classroomId}`);
    } else {
      console.log(`Student ${studentId} is already in classroom ${classroomId}`);
    }
    
    // Step 4: Update the student's profile to include this classroom
    const userRef = doc(db, 'users', studentId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error(`User ${studentId} not found`);
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    const userClassrooms = userData.classrooms || [];
    
    // Only add classroom ID if it's not already in the user's classrooms
    if (!userClassrooms.includes(classroomId)) {
      const updatedClassrooms = [...userClassrooms, classroomId];
      await updateDoc(userRef, { classrooms: updatedClassrooms });
      console.log(`Added classroom ${classroomId} to user ${studentId}'s profile`);
    }
    
    // Step 5: Get the updated classroom data and return it
    const updatedClassroomDoc = await getDoc(classroomRef);
    return {
      id: classroomId,
      ...updatedClassroomDoc.data()
    } as Classroom;
    
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

export const getClassrooms = async (teacherId?: string): Promise<Classroom[]> => {
  try {
    let classroomsQuery;
    if (teacherId) {
      classroomsQuery = query(collection(db, 'classrooms'), where('teacherId', '==', teacherId));
    } else {
      classroomsQuery = collection(db, 'classrooms');
    }
    
    const snapshot = await getDocs(classroomsQuery);
    return snapshot.docs.map(doc => {
      return { id: doc.id, ...doc.data() } as Classroom;
    });
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
    const classroomPromises = userClassrooms.map((classroomId: string) => getClassroom(classroomId));
    const classrooms = await Promise.all(classroomPromises);
    
    // Filter out any null results (in case a classroom was deleted)
    return classrooms.filter(Boolean) as Classroom[];
  } catch (error) {
    console.error("Error getting user classrooms:", error);
    return [];
  }
};

export const updateClassroom = async (classroomId: string, data: Partial<Classroom>) => {
  const updateData = { ...data };
  if ('id' in updateData) {
    delete (updateData as any).id; // Remove id property if present
  }
  return updateDoc(doc(db, 'classrooms', classroomId), updateData);
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

export const onLiveSessionUpdated = (sessionId: string, callback: (session: LiveSession) => void) => {
  return onSnapshot(doc(db, 'liveSessions', sessionId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as LiveSession);
    }
  });
};

export const onSessionParticipantsUpdated = (sessionId: string, callback: (participants: SessionParticipant[]) => void) => {
  const q = query(
    collection(db, 'sessionParticipants'),
    where('sessionId', '==', sessionId),
    where('isActive', '==', true)
  );
  
  return onSnapshot(q, (snapshot) => {
    const participants = snapshot.docs.map(doc => doc.data() as SessionParticipant);
    callback(participants);
  });
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export { auth, db, Timestamp, analytics };
