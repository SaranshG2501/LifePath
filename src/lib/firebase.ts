/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser ,
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
  runTransaction,
  increment,
  writeBatch
} from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { Metrics } from '@/types/game';

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
  members?: string[];
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
  mirrorMomentsEnabled?: boolean;
}

export interface SessionParticipant {
  sessionId: string;
  studentId: string;
  studentName: string;
  joinedAt: Timestamp;
  isActive: boolean;
  currentChoice?: string;
  lastActivity?: Timestamp;
  currentSceneId?: string;
  isTyping?: boolean;
  typingStartedAt?: Timestamp;
}

export interface SessionNotification {
  id?: string;
  type: 'live_session_started' | 'session_ended';
  sessionId: string;
  classroomId: string;
  teacherName: string;
  scenarioTitle: string;
  studentId: string;
  message?: string;
  createdAt: Timestamp;
  read: boolean;
}

// Enhanced session creation with atomic operations and better error handling
export const createLiveSession = async (
  classroomId: string, 
  scenarioId: string, 
  teacherId: string, 
  teacherName: string,
  scenarioTitle: string,
  mirrorMomentsEnabled: boolean = false
): Promise<string> => {
  try {
    // Create the session document with proper initial scene
    const sessionData = {
      classroomId,
      scenarioId,
      teacherId,
      teacherName,
      scenarioTitle,
      status: 'active' as const,
      currentSceneId: 'start', // Initialize with start scene
      currentSceneIndex: 0,
      participants: [],
      currentChoices: {},
      votes: {},
      mirrorMomentsEnabled,
      startedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    };
    
    const sessionRef = await addDoc(collection(db, 'sessions'), sessionData);
    
    // Update classroom with active session
    const classroomRef = doc(db, 'classrooms', classroomId);
    await updateDoc(classroomRef, {
      activeSessionId: sessionRef.id,
      activeScenario: scenarioTitle,
      lastActivity: Timestamp.now()
    });
    
    // Get classroom data to send notifications
    const classroomSnap = await getDoc(classroomRef);
    if (classroomSnap.exists()) {
      const classroomData = classroomSnap.data() as Classroom;
      
      // Send notifications to students
      if (classroomData.students && classroomData.students.length > 0) {
        const notificationPromises = classroomData.students.map(async (student) => {
          try {
            const notificationData: SessionNotification = {
              type: 'live_session_started',
              sessionId: sessionRef.id,
              teacherName,
              scenarioTitle,
              classroomId,
              studentId: student.id,
              createdAt: Timestamp.now(),
              read: false
            };
            
            await addDoc(collection(db, 'notifications'), notificationData);
          } catch (error) {
            console.error(`Error sending notification to student ${student.id}:`, error);
          }
        });
        
        await Promise.all(notificationPromises);
      }
    }
    
    return sessionRef.id;
    
  } catch (error) {
    console.error("Error creating live session:", error);
    throw error;
  }
};

// Get teacher's active sessions
export const getTeacherActiveSessions = async (teacherId: string): Promise<LiveSession[]> => {
  try {
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('teacherId', '==', teacherId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LiveSession));
  } catch (error) {
    console.error("Error getting teacher active sessions:", error);
    throw error;
  }
};

// Enhanced session ending with atomic cleanup
export const endLiveSession = async (sessionId: string, classroomId: string, resultPayload?: any) => {
  try {
    
    // Get session and classroom data first to notify students
    const sessionDoc = await getDoc(doc(db, 'sessions', sessionId));
    const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
    
    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }
    
    const sessionData = sessionDoc.data() as LiveSession;
    const classroomData = classroomDoc.exists() ? classroomDoc.data() : null;
    
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
      const classroomRef = doc(db, 'classrooms', classroomId);
      
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
      
      // Clear active session from classroom (atomic)
      transaction.update(classroomRef, {
        activeSessionId: null,
        activeScenario: null,
        currentScene: null,
        lastActivity: Timestamp.now()
      });
    });
    
    // Send session ended notifications to all students
    if (classroomData && classroomData.students && classroomData.students.length > 0) {
      try {
        const endSessionNotifications = classroomData.students.map(async (student: any) => {
          try {
            const notificationData = {
              studentId: student.id,
              classroomId: classroomId,
              sessionId: sessionId,
              type: 'session_ended',
              teacherName: sessionData.teacherName || 'Teacher',
              scenarioTitle: sessionData.scenarioTitle || 'Scenario',
              message: `The live session "${sessionData.scenarioTitle}" has been ended by the teacher.`,
              read: false,
              createdAt: Timestamp.now()
            };
            
            await addDoc(collection(db, 'notifications'), notificationData);
          } catch (error) {
            console.error(`Error sending session ended notification to student ${student.id}:`, error);
          }
        });
        
        await Promise.all(endSessionNotifications);
      } catch (error) {
        console.error("Error sending session ended notifications:", error);
      }
    }
    
    // Clean up participants and old notifications (outside transaction)
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
    
    // Clean up old session start notifications only (keep session ended notifications)
    const oldNotificationsQuery = query(
      collection(db, 'notifications'),
      where('sessionId', '==', sessionId),
      where('type', '==', 'live_session_started')
    );
    const oldNotificationsSnapshot = await getDocs(oldNotificationsQuery);
    cleanupPromises.push(
      ...oldNotificationsSnapshot.docs.map(doc => deleteDoc(doc.ref))
    );
    
    await Promise.all(cleanupPromises);
  } catch (error) {
    console.error("Error ending live session:", error);
    throw error;
  }
};

// Enhanced scene advancement with atomic operations
export const advanceLiveSession = async (sessionId: string, nextSceneId: string, nextSceneIndex?: number) => {
  try {
    
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await transaction.get(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error("Session not found");
      }
      
      const sessionData = sessionDoc.data() as LiveSession;
      if (sessionData.status !== 'active') {
        throw new Error("Session is not active");
      }
      
      const updateData: any = {
        currentSceneId: nextSceneId,
        currentChoices: {}, // Reset choices for new scene
        lastUpdated: Timestamp.now()
      };
      
      if (nextSceneIndex !== undefined) {
        updateData.currentSceneIndex = nextSceneIndex;
      }
      
      transaction.update(sessionRef, updateData);
    });
  } catch (error) {
    console.error("Error advancing live session:", error);
    throw error;
  }
};

// Enhanced join session with validation
export const joinLiveSession = async (sessionId: string, studentId: string, studentName: string) => {
  try {
    
    const result = await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
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
      // Notification may not exist or may have different ID format
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
    
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
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
  } catch (error) {
    console.error("Error submitting live choice:", error);
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
    
    const sessionDoc = await getDoc(doc(db, 'sessions', classroomData.activeSessionId));
    if (!sessionDoc.exists()) {
      // Clean up stale reference
      await updateDoc(doc(db, 'classrooms', classroomId), {
        activeSessionId: null,
        activeScenario: null,
        currentScene: null
      });
      return null;
    }
    
    const sessionData = sessionDoc.data() as LiveSession;
    if (sessionData.status !== 'active') {
      // Clean up ended session reference
      await updateDoc(doc(db, 'classrooms', classroomId), {
        activeSessionId: null,
        activeScenario: null,
        currentScene: null
      });
      return null;
    }
    
    return { id: sessionDoc.id, ...sessionData } as LiveSession;
  } catch (error) {
    console.error("Error getting active session:", error);
    return null;
  }
};

// Cleanup orphaned sessions utility function
export const cleanupOrphanedSessions = async () => {
  try {
    // Get all active sessions
    const sessionsQuery = query(
      collection(db, 'sessions'),
      where('status', '==', 'active')
    );
    const sessionsSnapshot = await getDocs(sessionsQuery);
    
    const cleanupPromises = sessionsSnapshot.docs.map(async (sessionDoc) => {
      const sessionData = sessionDoc.data() as LiveSession;
      
      // Check if classroom still references this session
      const classroomDoc = await getDoc(doc(db, 'classrooms', sessionData.classroomId));
      
      if (!classroomDoc.exists() || 
          classroomDoc.data().activeSessionId !== sessionDoc.id) {
        
        // End the orphaned session
        await updateDoc(sessionDoc.ref, {
          status: 'ended',
          endedAt: Timestamp.now(),
          lastUpdated: Timestamp.now()
        });
      }
    });
    
    await Promise.all(cleanupPromises);
  } catch (error) {
    console.error("Error during orphaned session cleanup:", error);
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

// Process cleanup notifications for removed students
export const processCleanupNotifications = async (studentId: string) => {
  try {
    console.log(`[CLEANUP] Processing cleanup notifications for student: ${studentId}`);
    
    // Get all unread cleanup notifications for this student
    const q = query(
      collection(db, 'notifications'),
      where('studentId', '==', studentId),
      where('type', '==', 'classroom_removal'),
      where('actionRequired', '==', 'cleanup_profile'),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`[CLEANUP] No cleanup notifications found for student ${studentId}`);
      return;
    }
    
    console.log(`[CLEANUP] Found ${snapshot.docs.length} cleanup notifications`);
    
    // Get the student's current profile
    const userRef = doc(db, 'users', studentId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.warn(`[CLEANUP] Student profile not found: ${studentId}`);
      return;
    }
    
    const userData = userDoc.data();
    const userClassrooms = userData.classrooms || [];
    
    // Process each notification
    const batch = writeBatch(db);
    const classroomsToRemove = new Set<string>();
    
    snapshot.docs.forEach(notificationDoc => {
      const notificationData = notificationDoc.data();
      const classroomId = notificationData.classroomId;
      
      if (classroomId && userClassrooms.includes(classroomId)) {
        classroomsToRemove.add(classroomId);
      }
      
      // Mark notification as read
      batch.update(notificationDoc.ref, { read: true });
    });
    
    // Update student's classrooms array if needed
    if (classroomsToRemove.size > 0) {
      console.log(`[CLEANUP] Removing ${classroomsToRemove.size} classrooms from student profile`);
      const updatedClassrooms = userClassrooms.filter((id: string) => !classroomsToRemove.has(id));
      
      batch.update(userRef, {
        classrooms: updatedClassrooms
      });
    }
    
    await batch.commit();
    console.log(`[CLEANUP] Cleanup completed for student ${studentId}`);
    
  } catch (error) {
    console.error(`[CLEANUP] Error processing cleanup notifications:`, error);
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
export const convertTimestampToDate = ( timestamp: Timestamp | Date): Date => {
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

export const loginUser  = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser  = async () => {
  return signOut(auth);
};

export const getCurrentUser  = () => {
  return auth.currentUser ;
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
        console.log("User  already has this badge:", badgeId);
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
      throw new Error("User  not found");
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
    
    // Create classroom data with both students and members arrays for compatibility
    const classroomData = {
      name,
      description: description || "",
      teacherId,
      teacherName,
      students: [],
      members: [], // New atomic array for member IDs
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
      // Assert that doc.data() is an object to allow spreading
      return { id: doc.id, ...(doc.data() as object) } as Classroom;
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

// NEW: Delete classroom function with full cleanup
export const deleteClassroom = async (classroomId: string, teacherId: string): Promise<void> => {
  console.log("Starting classroom deletion:", classroomId);
  
  try {
    // Verify the user is the teacher
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomSnap = await getDoc(classroomRef);
    
    if (!classroomSnap.exists()) {
      throw new Error('Classroom not found');
    }
    
    const classroomData = classroomSnap.data() as Classroom;
    if (classroomData.teacherId !== teacherId) {
      throw new Error('Unauthorized: Only the teacher can delete this classroom');
    }
    
    console.log("Classroom data:", classroomData);
    
    // Start batch delete
    const batch = writeBatch(db);
    
    // Delete the classroom document
    batch.delete(classroomRef);
    
    // Delete class code mapping
    if (classroomData.classCode) {
      const classCodeRef = doc(db, 'classCodes', classroomData.classCode);
      batch.delete(classCodeRef);
    }
    
    // Delete any active sessions
    if (classroomData.activeSessionId) {
      const sessionRef = doc(db, 'sessions', classroomData.activeSessionId);
      batch.delete(sessionRef);
    }
    
    // Execute the batch
    await batch.commit();
    console.log("Batch delete completed");
    
    // Clean up student profiles (this needs to be done separately due to batch limitations)
    if (classroomData.students && classroomData.students.length > 0) {
      console.log("Cleaning up student profiles:", classroomData.students.length);
      
      const studentUpdatePromises = classroomData.students.map(async (student) => {
        try {
          const studentRef = doc(db, 'users', student.id);
          const studentSnap = await getDoc(studentRef);
          
          if (studentSnap.exists()) {
            const studentData = studentSnap.data();
            const currentClassrooms = studentData.classrooms || [];
            const updatedClassrooms = currentClassrooms.filter((id: string) => id !== classroomId);
            
            await updateDoc(studentRef, {
              classrooms: updatedClassrooms
            });
            console.log(`Updated student ${student.id} classrooms`);
          }
        } catch (error) {
          console.error(`Error updating student ${student.id}:`, error);
        }
      });
      
      await Promise.all(studentUpdatePromises);
    }
    
    // Clean up notifications
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('classroomId', '==', classroomId)
      );
      const notificationsSnap = await getDocs(notificationsQuery);
      
      const notificationDeletePromises = notificationsSnap.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(notificationDeletePromises);
      console.log("Cleaned up notifications");
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
    
    console.log("Classroom deletion completed successfully");
    
  } catch (error) {
    console.error("Error in deleteClassroom:", error);
    throw error;
  }
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

// Enhanced student removal with better error handling
export const removeStudentFromClassroom = async (classroomId: string, studentId: string) => {
  try {
    console.log(`[REMOVE_STUDENT] Starting removal: student=${studentId}, classroom=${classroomId}`);
    
    const result = await runTransaction(db, async (transaction) => {
      // READ PHASE - Only read classroom document (not user document to avoid permission issues)
      const classroomRef = doc(db, 'classrooms', classroomId);
      
      console.log(`[REMOVE_STUDENT] Reading classroom document...`);
      const classroomDoc = await transaction.get(classroomRef);
      
      if (!classroomDoc.exists()) {
        console.error(`[REMOVE_STUDENT] Classroom ${classroomId} not found`);
        throw new Error(`Classroom not found: ${classroomId}`);
      }
      
      const classroomData = classroomDoc.data() as Classroom;
      console.log(`[REMOVE_STUDENT] Current classroom data:`, {
        studentsCount: classroomData.students?.length || 0,
        membersCount: classroomData.members?.length || 0,
        teacherId: classroomData.teacherId
      });
      
      // Check if student is actually in the classroom
      const isStudentInClass = classroomData.students?.some(student => student.id === studentId);
      const isMemberInClass = classroomData.members?.includes(studentId);
      
      if (!isStudentInClass && !isMemberInClass) {
        console.warn(`[REMOVE_STUDENT] Student ${studentId} not found in classroom ${classroomId}`);
        throw new Error(`Student not found in classroom`);
      }
      
      console.log(`[REMOVE_STUDENT] Student found in classroom - isStudent: ${isStudentInClass}, isMember: ${isMemberInClass}`);
      
      let sessionRef = null;
      let sessionDoc = null;
      
      // Check for active session
      if (classroomData.activeSessionId) {
        console.log(`[REMOVE_STUDENT] Checking active session: ${classroomData.activeSessionId}`);
        sessionRef = doc(db, 'sessions', classroomData.activeSessionId);
        sessionDoc = await transaction.get(sessionRef);
      }
      
      // WRITE PHASE - All writes happen after reads
      console.log(`[REMOVE_STUDENT] Starting write operations...`);
      
      // Remove student from classroom arrays
      const updatedStudents = classroomData.students?.filter(student => student.id !== studentId) || [];
      const updatedMembers = classroomData.members?.filter(id => id !== studentId) || [];
      
      console.log(`[REMOVE_STUDENT] Updating classroom - students: ${classroomData.students?.length} -> ${updatedStudents.length}, members: ${classroomData.members?.length} -> ${updatedMembers.length}`);
      
      transaction.update(classroomRef, {
        students: updatedStudents,
        members: updatedMembers,
        lastUpdated: Timestamp.now()
      });
      
      // Remove from active session if exists
      if (sessionRef && sessionDoc && sessionDoc.exists()) {
        console.log(`[REMOVE_STUDENT] Removing from active session...`);
        const sessionData = sessionDoc.data() as LiveSession;
        const updatedParticipants = sessionData.participants.filter(id => id !== studentId);
        
        transaction.update(sessionRef, {
          participants: updatedParticipants,
          lastUpdated: Timestamp.now()
        });
      }
      
      console.log(`[REMOVE_STUDENT] Transaction completed successfully`);
      return true;
    });
    
    // Clean up participant records outside of transaction
    try {
      console.log(`[REMOVE_STUDENT] Cleaning up participant records...`);
      const participantQuery = query(
        collection(db, 'sessionParticipants'),
        where('studentId', '==', studentId)
      );
      const participantSnapshot = await getDocs(participantQuery);
      
      if (!participantSnapshot.empty) {
        const batch = writeBatch(db);
        participantSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isActive: false });
        });
        await batch.commit();
        console.log(`[REMOVE_STUDENT] Cleaned up ${participantSnapshot.docs.length} participant records`);
      }
    } catch (cleanupError) {
      console.warn(`[REMOVE_STUDENT] Cleanup warning (non-critical):`, cleanupError);
    }

    // Create a notification for the student to clean up their profile when they next log in
    try {
      console.log(`[REMOVE_STUDENT] Creating cleanup notification for student...`);
      const notificationRef = doc(collection(db, 'notifications'));
      await setDoc(notificationRef, {
        studentId: studentId,
        classroomId: classroomId,
        type: 'classroom_removal',
        title: 'Classroom Access Removed',
        message: `You have been removed from a classroom.`,
        timestamp: Timestamp.now(),
        read: false,
        actionRequired: 'cleanup_profile'
      });
      console.log(`[REMOVE_STUDENT] Cleanup notification created`);
    } catch (notificationError) {
      console.warn(`[REMOVE_STUDENT] Failed to create notification (non-critical):`, notificationError);
    }
    
    console.log(`[REMOVE_STUDENT] Student removal completed successfully`);
    return true;
  } catch (error) {
    console.error(`[REMOVE_STUDENT] Error removing student:`, error);
    
    // Enhanced error messages
    if (error instanceof Error) {
      if (error.message.includes('permission')) {
        throw new Error(`Permission denied: You may not have the rights to remove this student. Please check if you're the classroom teacher.`);
      } else if (error.message.includes('not found')) {
        throw new Error(`Student or classroom not found. They may have already been removed.`);
      } else {
        throw new Error(`Failed to remove student: ${error.message}`);
      }
    }
    throw error;
  }
};

// Student leave classroom function (self-removal)
export const leaveClassroom = async (classroomId: string, studentId: string) => {
  try {
    console.log(`Student ${studentId} leaving classroom ${classroomId}`);
    
    await runTransaction(db, async (transaction) => {
      // READ PHASE
      const classroomRef = doc(db, 'classrooms', classroomId);
      const userRef = doc(db, 'users', studentId);
      
      const classroomDoc = await transaction.get(classroomRef);
      const userDoc = await transaction.get(userRef);
      
      if (!classroomDoc.exists()) {
        throw new Error("Classroom not found");
      }
      
      const classroomData = classroomDoc.data() as Classroom;
      let sessionRef = null;
      let sessionDoc = null;
      
      // Check for active session
      if (classroomData.activeSessionId) {
        sessionRef = doc(db, 'sessions', classroomData.activeSessionId);
        sessionDoc = await transaction.get(sessionRef);
      }
      
      // WRITE PHASE
      // Remove student from classroom
      const updatedStudents = classroomData.students?.filter(student => student.id !== studentId) || [];
      const updatedMembers = classroomData.members?.filter(id => id !== studentId) || [];
      
      transaction.update(classroomRef, {
        students: updatedStudents,
        members: updatedMembers
      });
      
      // Remove from active session if exists
      if (sessionRef && sessionDoc && sessionDoc.exists()) {
        const sessionData = sessionDoc.data() as LiveSession;
        const updatedParticipants = sessionData.participants.filter(id => id !== studentId);
        
        transaction.update(sessionRef, {
          participants: updatedParticipants,
          lastUpdated: Timestamp.now()
        });
      }
      
      // Update student's profile
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userClassrooms = userData.classrooms || [];
        const updatedClassrooms = userClassrooms.filter((id: string) => id !== classroomId);
        
        transaction.update(userRef, {
          classrooms: updatedClassrooms
        });
      }
    });
    
    console.log("Student successfully left classroom");
    return true;
  } catch (error) {
    console.error("Error leaving classroom:", error);
    throw error;
  }
};

// Message interface
export interface ClassroomMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: 'teacher' | 'student';
  timestamp: Timestamp;
  classroomId: string;
}

// Send message to classroom
export const sendClassroomMessage = async (
  classroomId: string, 
  senderId: string, 
  senderName: string, 
  senderRole: 'teacher' | 'student', 
  messageText: string
): Promise<ClassroomMessage> => {
  try {
    console.log(`Sending message to classroom ${classroomId}`);
    
    const messageData: ClassroomMessage = {
      text: messageText,
      senderId,
      senderName,
      senderRole,
      timestamp: Timestamp.now(),
      classroomId
    };
    
    // Add message to messages collection
    const messagesCollection = collection(db, 'classroomMessages');
    const messageDoc = await addDoc(messagesCollection, messageData);
    
    return { ...messageData, id: messageDoc.id };
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Get classroom messages
export const getClassroomMessages = async (classroomId: string): Promise<ClassroomMessage[]> => {
  try {
    const messagesQuery = query(
      collection(db, 'classroomMessages'),
      where('classroomId', '==', classroomId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(messagesQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClassroomMessage));
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

// Real-time listener for classroom messages
export const onClassroomMessagesUpdated = (
  classroomId: string, 
  callback: (messages: ClassroomMessage[]) => void
): (() => void) => {
  try {
    const messagesQuery = query(
      collection(db, 'classroomMessages'),
      where('classroomId', '==', classroomId),
      orderBy('timestamp', 'desc')
    );
    
    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClassroomMessage));
      callback(messages);
    });
  } catch (error) {
    console.error("Error setting up messages listener:", error);
    return () => {};
  }
}

// Fixed atomic join classroom with proper validation
export const joinClassroom = async (classroomId: string, studentId: string, studentName: string) => {
  try {
    console.log(`Student ${studentId} attempting to join classroom ${classroomId}`);
    
    const result = await runTransaction(db, async (transaction) => {
      // READ PHASE
      const classroomRef = doc(db, 'classrooms', classroomId);
      const userRef = doc(db, 'users', studentId);
      
      const classroomDoc = await transaction.get(classroomRef);
      const userDoc = await transaction.get(userRef);
      
      if (!classroomDoc.exists()) {
        throw new Error("Classroom not found");
      }
      
      if (!userDoc.exists()) {
        throw new Error("User  not found");
      }
      
      const classroomData = classroomDoc.data() as Classroom;
      const userData = userDoc.data();
      
      const currentStudents = classroomData.students || [];
      const currentMembers = classroomData.members || [];
      const userClassrooms = userData.classrooms || [];
      
      // Check if already a member
      const existingStudentIndex = currentStudents.findIndex(s => s.id === studentId);
      const isMemberAlready = currentMembers.includes(studentId);
      const isInUserClassrooms = userClassrooms.includes(classroomId);
      
      // WRITE PHASE
      let needsClassroomUpdate = false;
      const updatedStudents = [...currentStudents];
      const updatedMembers = [...currentMembers];
      
      if (existingStudentIndex === -1) {
        // Add to students array
        const newStudent: ClassroomStudent = {
          id: studentId,
          name: studentName,
          joinedAt: Timestamp.now()
        };
        updatedStudents.push(newStudent);
        needsClassroomUpdate = true;
      }
      
      if (!isMemberAlready) {
        // Add to members array
        updatedMembers.push(studentId);
        needsClassroomUpdate = true;
      }
      
      if (needsClassroomUpdate) {
        transaction.update(classroomRef, { 
          students: updatedStudents,
          members: updatedMembers
        });
      }
      
      // Update user's classrooms
      if (!isInUserClassrooms) {
        const updatedUserClassrooms = [...userClassrooms, classroomId];
        transaction.update(userRef, { 
          classrooms: updatedUserClassrooms 
        });
      }
      
      return classroomData;
    });
    
    // Return the updated classroom data
    const updatedClassroom = await getClassroom(classroomId);
    return updatedClassroom;
    
  } catch (error) {
    console.error("Error joining classroom:", error);
    throw error;
  }
};

// Enhanced join by code with better error handling
export const joinClassroomByCode = async (classCode: string, studentId: string, studentName: string) => {
  try {
    console.log(`Student ${studentId} attempting to join by code: ${classCode}`);
    
    // First find the classroom by code
    const classroom = await getClassroomByCode(classCode);
    if (!classroom || !classroom.id) {
      throw new Error("Invalid classroom code");
    }
    
    // Join the classroom using the found ID
    return await joinClassroom(classroom.id, studentId, studentName);
    
  } catch (error) {
    console.error("Error joining classroom by code:", error);
    throw error;
  }
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
  return onSnapshot(doc(db, 'sessions', sessionId), (doc) => {
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

// Update student presence/activity
export const updateStudentPresence = async (
  sessionId: string, 
  studentId: string, 
  updates: {
    currentSceneId?: string;
    isTyping?: boolean;
  }
) => {
  try {
    const participantRef = doc(db, 'sessionParticipants', `${sessionId}_${studentId}`);
    const updateData: any = {
      lastActivity: Timestamp.now(),
      ...updates
    };
    
    // If isTyping is being set to true, record when typing started
    if (updates.isTyping === true) {
      updateData.typingStartedAt = Timestamp.now();
    } else if (updates.isTyping === false) {
      updateData.typingStartedAt = null;
    }
    
    await updateDoc(participantRef, updateData);
  } catch (error) {
    console.error("Error updating student presence:", error);
  }
};

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
 
  return signInWithPopup(auth, provider);
};

export { auth, db, Timestamp, analytics };
