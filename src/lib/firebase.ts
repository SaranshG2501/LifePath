/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC7yz9uNDKfCNwx0qPEgJ8EOBJHVp1R_o8",
  authDomain: "lifepath-3ff8f.firebaseapp.com",
  projectId: "lifepath-3ff8f",
  storageBucket: "lifepath-3ff8f.firebasestorage.app",
  messagingSenderId: "185300197020",
  appId: "1:185300197020:web:d3c7701675bc4972fbd759",
  measurementId: "G-N5CCD171WX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  classrooms: string[];
  role: 'student' | 'teacher';
  createdAt: Timestamp;
  lastLogin: Timestamp;
  completedScenarios?: string[];
  xp?: number;
  level?: number;
  badges?: string[];
  history?: ScenarioHistory[];
}

export interface Classroom {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  createdAt: Timestamp;
  students: StudentMember[];
  members?: string[];
  activeSessionId?: string;
}

export interface StudentMember {
  id: string;
  name: string;
  email: string;
  joinedAt: Timestamp;
}

export interface ScenarioChoice {
  sceneId: string;
  choiceId: string;
  choiceText: string;
  timestamp: Timestamp;
  metricChanges?: {
    environmental: number;
    social: number;
    economic: number;
  };
}

export interface ScenarioHistory {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  choices: ScenarioChoice[];
  metrics: {
    environmental: number;
    social: number;
    economic: number;
  };
  finalMetrics?: {
    environmental: number;
    social: number;
    economic: number;
  };
  completedAt: Timestamp;
}

export interface LiveSession {
  id?: string;
  classroomId: string;
  teacherId: string;
  teacherName: string;
  scenarioId: string;
  scenarioTitle: string;
  currentSceneId: string;
  currentSceneIndex: number;
  status: 'active' | 'ended';
  participants: SessionParticipant[];
  votes: Record<string, string>;
  currentChoices?: Record<string, string>;
  createdAt: Timestamp;
  startedAt?: Timestamp;
  endedAt?: Timestamp;
  resultPayload?: any;
}

export interface SessionParticipant {
  userId: string;
  userName: string;
  studentId?: string;
  studentName?: string;
  joinedAt: Timestamp;
}

export interface SessionNotification {
  id: string;
  userId: string;
  type: 'live_session_started';
  sessionId: string;
  teacherName: string;
  scenarioTitle: string;
  classroomName: string;
  createdAt: Timestamp;
  read: boolean;
}

// Auth functions
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    await createUserDocument(result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

// User management
const createUserDocument = async (user: User) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const createdAt = serverTimestamp() as Timestamp;
    try {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        classrooms: [],
        role: 'student',
        createdAt,
        lastLogin: createdAt,
        completedScenarios: [],
        xp: 0,
        level: 1,
        badges: [],
        history: []
      });
    } catch (error) {
      console.error("Error creating user document", error);
      throw error;
    }
  } else {
    // Update last login
    await updateDoc(userRef, {
      lastLogin: serverTimestamp() as Timestamp
    });
  }
};

// Alias for compatibility
export const createUserProfileDocument = createUserDocument;

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    
    if (!snapshot.exists()) {
      return null;
    }

    return {
      uid: snapshot.id,
      email: snapshot.data().email,
      displayName: snapshot.data().displayName,
      photoURL: snapshot.data().photoURL,
      classrooms: snapshot.data().classrooms || [],
      role: snapshot.data().role || 'student',
      createdAt: snapshot.data().createdAt,
      lastLogin: snapshot.data().lastLogin,
      completedScenarios: snapshot.data().completedScenarios || [],
      xp: snapshot.data().xp || 0,
      level: snapshot.data().level || 1,
      badges: snapshot.data().badges || [],
      history: snapshot.data().history || []
    };
  } catch (error) {
    console.error("Error getting user profile", error);
    return null;
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates);
  } catch (error) {
    console.error("Error updating user profile", error);
    throw error;
  }
};

// Classroom functions
export const createClassroom = async (name: string, teacherId: string, teacherName: string): Promise<string> => {
  try {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const classroomRef = await addDoc(collection(db, 'classrooms'), {
      name,
      code,
      teacherId,
      teacherName,
      createdAt: serverTimestamp() as Timestamp,
      students: [],
      members: []
    });

    // Add classroom to teacher's profile
    const teacherRef = doc(db, 'users', teacherId);
    await updateDoc(teacherRef, {
      classrooms: arrayUnion(classroomRef.id)
    });

    return classroomRef.id;
  } catch (error) {
    console.error("Error creating classroom", error);
    throw error;
  }
};

export const joinClassroom = async (code: string, studentId: string, studentName: string, studentEmail: string): Promise<string> => {
  try {
    // Find classroom by code
    const classroomsRef = collection(db, 'classrooms');
    const q = query(classroomsRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Classroom not found');
    }

    const classroomDoc = querySnapshot.docs[0];
    const classroomRef = doc(db, 'classrooms', classroomDoc.id);
    
    // Add student to classroom
    const studentMember: StudentMember = {
      id: studentId,
      name: studentName,
      email: studentEmail,
      joinedAt: serverTimestamp() as Timestamp
    };

    await updateDoc(classroomRef, {
      students: arrayUnion(studentMember),
      members: arrayUnion(studentId)
    });

    // Add classroom to student's profile
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      classrooms: arrayUnion(classroomDoc.id)
    });

    return classroomDoc.id;
  } catch (error) {
    console.error("Error joining classroom", error);
    throw error;
  }
};

// Alias for compatibility
export const joinClassroomByCode = joinClassroom;

export const getClassroomByCode = async (code: string): Promise<Classroom | null> => {
  try {
    const classroomsRef = collection(db, 'classrooms');
    const q = query(classroomsRef, where('code', '==', code));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const classroomDoc = querySnapshot.docs[0];
    return {
      id: classroomDoc.id,
      ...classroomDoc.data()
    } as Classroom;
  } catch (error) {
    console.error("Error getting classroom by code", error);
    return null;
  }
};

export const getUserClassrooms = async (userId: string): Promise<Classroom[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return [];
    
    const classroomIds = userSnap.data().classrooms || [];
    const classrooms: Classroom[] = [];
    
    for (const id of classroomIds) {
      const classroomRef = doc(db, 'classrooms', id);
      const classroomSnap = await getDoc(classroomRef);
      if (classroomSnap.exists()) {
        classrooms.push({
          id: classroomSnap.id,
          ...classroomSnap.data()
        } as Classroom);
      }
    }
    
    return classrooms;
  } catch (error) {
    console.error("Error getting user classrooms", error);
    return [];
  }
};

export const removeStudentFromClassroom = async (classroomId: string, studentId: string) => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomSnap = await getDoc(classroomRef);
    
    if (!classroomSnap.exists()) {
      throw new Error('Classroom not found');
    }
    
    const classroomData = classroomSnap.data() as Classroom;
    const updatedStudents = classroomData.students.filter(student => student.id !== studentId);
    const updatedMembers = (classroomData.members || []).filter(id => id !== studentId);
    
    await updateDoc(classroomRef, {
      students: updatedStudents,
      members: updatedMembers
    });

    // Remove classroom from student's profile
    const studentRef = doc(db, 'users', studentId);
    await updateDoc(studentRef, {
      classrooms: arrayRemove(classroomId)
    });
    
  } catch (error) {
    console.error("Error removing student from classroom", error);
    throw error;
  }
};

// Live session functions
export const createLiveSession = async (
  classroomId: string, 
  teacherId: string, 
  teacherName: string, 
  scenarioId: string, 
  scenarioTitle: string, 
  initialSceneId: string
): Promise<LiveSession> => {
  try {
    const sessionData = {
      classroomId,
      teacherId,
      teacherName,
      scenarioId,
      scenarioTitle,
      currentSceneId: initialSceneId,
      currentSceneIndex: 0,
      status: 'active' as const,
      participants: [],
      votes: {},
      currentChoices: {},
      createdAt: serverTimestamp() as Timestamp,
      startedAt: serverTimestamp() as Timestamp
    };

    const sessionRef = await addDoc(collection(db, 'liveSessions'), sessionData);
    
    // Update classroom with active session
    const classroomRef = doc(db, 'classrooms', classroomId);
    await updateDoc(classroomRef, {
      activeSessionId: sessionRef.id
    });

    return {
      id: sessionRef.id,
      ...sessionData
    };
  } catch (error) {
    console.error("Error creating live session", error);
    throw error;
  }
};

export const joinLiveSession = async (sessionId: string, userId: string, userName: string): Promise<LiveSession> => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const sessionSnap = await getDoc(sessionRef);
    
    if (!sessionSnap.exists()) {
      throw new Error('Session not found');
    }

    const sessionData = sessionSnap.data() as LiveSession;
    
    if (sessionData.status !== 'active') {
      throw new Error('Session is not active');
    }

    // Check if user is already a participant
    const existingParticipant = sessionData.participants.find(p => p.userId === userId);
    
    if (!existingParticipant) {
      const newParticipant: SessionParticipant = {
        userId,
        userName,
        studentId: userId,
        studentName: userName,
        joinedAt: serverTimestamp() as Timestamp
      };

      await updateDoc(sessionRef, {
        participants: arrayUnion(newParticipant)
      });
    }

    return {
      id: sessionId,
      ...sessionData
    };
  } catch (error) {
    console.error("Error joining live session", error);
    throw error;
  }
};

export const submitStudentVote = async (sessionId: string, userId: string, choiceId: string) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
      [`votes.${userId}`]: choiceId,
      [`currentChoices.${userId}`]: choiceId
    });
  } catch (error) {
    console.error("Error submitting vote", error);
    throw error;
  }
};

export const advanceLiveSession = async (sessionId: string, nextSceneId: string, nextSceneIndex?: number) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const updates: any = {
      currentSceneId: nextSceneId,
      votes: {},
      currentChoices: {}
    };
    
    if (nextSceneIndex !== undefined) {
      updates.currentSceneIndex = nextSceneIndex;
    }
    
    await updateDoc(sessionRef, updates);
  } catch (error) {
    console.error("Error advancing live session", error);
    throw error;
  }
};

export const endLiveSession = async (sessionId: string, resultPayload?: any) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    const updates: any = {
      status: 'ended',
      endedAt: serverTimestamp() as Timestamp
    };
    
    if (resultPayload) {
      updates.resultPayload = resultPayload;
    }
    
    await updateDoc(sessionRef, updates);

    // Remove active session from classroom
    const sessionSnap = await getDoc(sessionRef);
    if (sessionSnap.exists()) {
      const sessionData = sessionSnap.data();
      const classroomRef = doc(db, 'classrooms', sessionData.classroomId);
      await updateDoc(classroomRef, {
        activeSessionId: null
      });
    }
  } catch (error) {
    console.error("Error ending live session", error);
    throw error;
  }
};

export const getActiveSession = async (classroomId: string): Promise<LiveSession | null> => {
  try {
    const sessionsRef = collection(db, 'liveSessions');
    const q = query(
      sessionsRef, 
      where('classroomId', '==', classroomId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const sessionDoc = querySnapshot.docs[0];
    return {
      id: sessionDoc.id,
      ...sessionDoc.data()
    } as LiveSession;
  } catch (error) {
    console.error("Error getting active session", error);
    return null;
  }
};

// Real-time listeners
export const onLiveSessionUpdated = (sessionId: string, callback: (session: LiveSession) => void) => {
  const sessionRef = doc(db, 'liveSessions', sessionId);
  return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      } as LiveSession);
    }
  });
};

export const onClassroomUpdated = (classroomId: string, callback: (classroom: Classroom) => void) => {
  const classroomRef = doc(db, 'classrooms', classroomId);
  return onSnapshot(classroomRef, (doc) => {
    if (doc.exists()) {
      callback({
        id: doc.id,
        ...doc.data()
      } as Classroom);
    }
  });
};

export const onNotificationsUpdated = (userId: string, callback: (notifications: SessionNotification[]) => void) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    where('read', '==', false),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const notifications: SessionNotification[] = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data()
      } as SessionNotification);
    });
    callback(notifications);
  });
};

export const onSessionParticipantsUpdated = (sessionId: string, callback: (participants: SessionParticipant[]) => void) => {
  const sessionRef = doc(db, 'liveSessions', sessionId);
  return onSnapshot(sessionRef, (doc) => {
    if (doc.exists()) {
      const sessionData = doc.data() as LiveSession;
      callback(sessionData.participants || []);
    }
  });
};

// Scenario and voting functions
export const saveScenarioHistory = async (
  userId: string,
  scenarioId: string,
  scenarioTitle: string,
  choices: ScenarioChoice[],
  metrics: { environmental: number; social: number; economic: number }
) => {
  try {
    const historyRef = collection(db, 'scenarioHistory');
    await addDoc(historyRef, {
      userId,
      scenarioId,
      scenarioTitle,
      choices,
      metrics,
      finalMetrics: metrics,
      completedAt: serverTimestamp() as Timestamp
    });
  } catch (error) {
    console.error("Error saving scenario history", error);
    throw error;
  }
};

export const recordStudentVote = async (classroomId: string, studentId: string, choiceId: string) => {
  try {
    const voteRef = collection(db, 'classroomVotes');
    await addDoc(voteRef, {
      classroomId,
      studentId,
      choiceId,
      timestamp: serverTimestamp() as Timestamp
    });
  } catch (error) {
    console.error("Error recording vote", error);
    throw error;
  }
};

export const getScenarioVotes = async (classroomId: string) => {
  try {
    const votesRef = collection(db, 'classroomVotes');
    const q = query(votesRef, where('classroomId', '==', classroomId));
    const querySnapshot = await getDocs(q);
    
    const votes: any[] = [];
    querySnapshot.forEach((doc) => {
      votes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return votes;
  } catch (error) {
    console.error("Error getting votes", error);
    return [];
  }
};

export const onVotesUpdated = (classroomId: string, callback: (votes: any[]) => void) => {
  const votesRef = collection(db, 'classroomVotes');
  const q = query(votesRef, where('classroomId', '==', classroomId));
  
  return onSnapshot(q, (querySnapshot) => {
    const votes: any[] = [];
    querySnapshot.forEach((doc) => {
      votes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(votes);
  });
};

export const submitLiveChoice = async (sessionId: string, userId: string, choiceId: string) => {
  try {
    const sessionRef = doc(db, 'liveSessions', sessionId);
    await updateDoc(sessionRef, {
      [`currentChoices.${userId}`]: choiceId
    });
  } catch (error) {
    console.error("Error submitting live choice", error);
    throw error;
  }
};

// Mock scenario functions for compatibility
export const getScenario = async (scenarioId: string) => {
  // This would normally fetch from a scenarios collection
  // For now, return null to maintain compatibility
  return null;
};

export const getScenarios = async () => {
  // This would normally fetch all scenarios
  // For now, return empty array to maintain compatibility
  return [];
};

// Utility functions
export const convertTimestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Type aliases for compatibility
export type ClassroomStudent = StudentMember;
