import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
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
  serverTimestamp, 
  Timestamp, 
  orderBy, 
  limit,
  onSnapshot,
  runTransaction,
  deleteDoc
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

const signOutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

// Firestore data structures
export interface UserProfile {
  id: string;
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  classrooms: string[];
  role: 'student' | 'teacher';
  createdAt: Timestamp;
  lastLogin: Timestamp;
}

export interface Classroom {
  id?: string;
  name: string;
  description: string;
  classCode: string;
  teacherId: string;
  teacherName: string;
  members: string[];
  students: { id: string; name: string }[];
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  activeSessionId?: string | null;
}

export interface ClassCode {
  code: string;
  classroomId: string;
  createdAt: Timestamp;
}

export interface Scenario {
  id?: string;
  title: string;
  description: string;
  scenes: Scene[];
  createdAt: Timestamp;
}

export interface Scene {
  id?: string;
  title: string;
  content: string;
  choices: Choice[];
  isEnding: boolean;
}

export interface Choice {
  id: string;
  text: string;
  nextSceneId: string | null;
  impact: Impact;
}

export interface Impact {
  environmental: number;
  social: number;
  economic: number;
}

export interface LiveSession {
  id?: string;
  classroomId: string;
  teacherId: string;
  teacherName: string;
  scenarioId: string;
  scenarioTitle: string;
  currentSceneId: string;
  currentSceneIndex?: number;
  status: 'active' | 'ended';
  participants: SessionParticipant[];
  currentChoices: Record<string, string>;
  votes?: Record<string, string>; // Add votes property to interface
  createdAt: Timestamp;
  lastUpdated: Timestamp;
  resultPayload?: any;
}

export interface SessionParticipant {
  studentId: string;
  studentName: string;
  joinedAt: Timestamp;
  isActive: boolean;
}

export interface SessionNotification {
  id?: string;
  studentId: string;
  teacherName: string;
  scenarioTitle: string;
  sessionId: string;
  type: 'live_session_started';
  createdAt: Timestamp;
}

// Helper Functions
const generateClassCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

// Firestore functions
const createUserProfileDocument = async (user: User) => {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();
    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        email,
        photoURL,
        classrooms: [],
        role: 'student',
        createdAt,
        lastLogin: createdAt
      });
    } catch (error) {
      console.error("Error creating user document", error);
    }
  } else {
    // Update last login timestamp
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });
  }

  return getUserProfileDocument(user.uid);
};

const getUserProfileDocument = async (uid: string): Promise<UserProfile | undefined> => {
  if (!uid) return undefined;

  const userRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    return {
      id: snapshot.id,
      uid: snapshot.data().uid,
      displayName: snapshot.data().displayName || null,
      email: snapshot.data().email,
      photoURL: snapshot.data().photoURL || null,
      classrooms: snapshot.data().classrooms || [],
      role: snapshot.data().role || 'student',
      createdAt: snapshot.data().createdAt,
      lastLogin: snapshot.data().lastLogin
    };
  }

  return undefined;
};

const createClassroom = async (name: string, description: string, teacherId: string, teacherName: string): Promise<Classroom> => {
  try {
    const classCode = generateClassCode();
    const classroomData = {
      name,
      description,
      classCode,
      teacherId,
      teacherName,
      members: [teacherId],
      students: [],
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    const classroomRef = doc(collection(db, 'classrooms'));
    await setDoc(classroomRef, classroomData);

    // Also create a class code document
    const classCodeData: ClassCode = {
      code: classCode,
      classroomId: classroomRef.id,
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, 'classCodes', classCode), classCodeData);

    // Update the teacher's user document with the new classroom
    const teacherRef = doc(db, 'users', teacherId);
    const teacherDoc = await getDoc(teacherRef);
    if (teacherDoc.exists()) {
      const teacherData = teacherDoc.data() as UserProfile;
      const updatedClassrooms = [...teacherData.classrooms, classroomRef.id];
      await updateDoc(teacherRef, {
        classrooms: updatedClassrooms,
        lastUpdated: serverTimestamp()
      });
    }

    console.log("Classroom created successfully with ID:", classroomRef.id);
    
    return {
      id: classroomRef.id,
      ...classroomData,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    };
  } catch (error) {
    console.error("Error creating classroom", error);
    throw new Error("Failed to create classroom");
  }
};

const updateClassroom = async (classroomId: string, updates: Partial<Classroom>): Promise<void> => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    await updateDoc(classroomRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
    console.log("Classroom updated successfully:", classroomId);
  } catch (error) {
    console.error("Error updating classroom", error);
    throw new Error("Failed to update classroom");
  }
};

const getClassroom = async (classroomId: string): Promise<Classroom | undefined> => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomDoc = await getDoc(classroomRef);

    if (classroomDoc.exists()) {
      return {
        id: classroomDoc.id,
        ...classroomDoc.data() as Classroom,
        createdAt: classroomDoc.data().createdAt,
        lastUpdated: classroomDoc.data().lastUpdated
      };
    } else {
      console.log("Classroom not found");
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching classroom", error);
    throw new Error("Failed to fetch classroom");
  }
};

const joinClassroomByCode = async (classCode: string, userId: string, studentName: string): Promise<Classroom | undefined> => {
  try {
    const classCodeRef = doc(db, 'classCodes', classCode);
    const classCodeDoc = await getDoc(classCodeRef);

    if (!classCodeDoc.exists()) {
      throw new Error("Invalid class code");
    }

    const classroomId = classCodeDoc.data().classroomId;
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomDoc = await getDoc(classroomRef);

    if (!classroomDoc.exists()) {
      throw new Error("Classroom not found");
    }

    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      const classroomData = classroomDoc.data() as Classroom;

      if (classroomData.members.includes(userId)) {
        throw new Error("You are already a member of this classroom");
      }

      // Add student to classroom's members and students arrays
      transaction.update(classroomRef, {
        members: [...classroomData.members, userId],
        students: [...classroomData.students, { id: userId, name: studentName }],
        lastUpdated: serverTimestamp()
      });

      // Update user's classrooms array
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const updatedClassrooms = [...userData.classrooms, classroomId];
        transaction.update(userRef, {
          classrooms: updatedClassrooms,
          lastUpdated: serverTimestamp()
        });
      }
    });

    console.log("User", userId, "joined classroom", classroomId, "with code", classCode);
    return getClassroom(classroomId);
  } catch (error) {
    console.error("Error joining classroom", error);
    throw error;
  }
};

const leaveClassroom = async (classroomId: string, userId: string): Promise<void> => {
  try {
    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      const classroomRef = doc(db, 'classrooms', classroomId);
      const classroomDoc = await getDoc(classroomRef);

      if (!classroomDoc.exists()) {
        throw new Error("Classroom not found");
      }

      const classroomData = classroomDoc.data() as Classroom;

      if (!classroomData.members.includes(userId)) {
        throw new Error("You are not a member of this classroom");
      }

      // Remove student from classroom's members and students arrays
      transaction.update(classroomRef, {
        members: classroomData.members.filter(memberId => memberId !== userId),
        students: classroomData.students.filter(student => student.id !== userId),
        lastUpdated: serverTimestamp()
      });

      // Update user's classrooms array
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        const updatedClassrooms = userData.classrooms.filter(id => id !== classroomId);
        transaction.update(userRef, {
          classrooms: updatedClassrooms,
          lastUpdated: serverTimestamp()
        });
      }
    });

    console.log("User", userId, "left classroom", classroomId);
  } catch (error) {
    console.error("Error leaving classroom", error);
    throw new Error("Failed to leave classroom");
  }
};

const deleteClassroom = async (classroomId: string, teacherId: string): Promise<void> => {
  try {
    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      const classroomRef = doc(db, 'classrooms', classroomId);
      const classroomDoc = await getDoc(classroomRef);

      if (!classroomDoc.exists()) {
        throw new Error("Classroom not found");
      }

      const classroomData = classroomDoc.data() as Classroom;

      if (classroomData.teacherId !== teacherId) {
        throw new Error("You are not the teacher of this classroom");
      }

      // Delete the classroom document
      transaction.delete(classroomRef);

      // Remove classroom from all users' classrooms array
      const usersQuery = query(collection(db, 'users'), where('classrooms', 'array-contains', classroomId));
      const usersSnapshot = await getDocs(usersQuery);

      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data() as UserProfile;
        const updatedClassrooms = userData.classrooms.filter(id => id !== classroomId);
        transaction.update(userDoc.ref, {
          classrooms: updatedClassrooms,
          lastUpdated: serverTimestamp()
        });
      });

      // Delete the class code document
      const classCodesQuery = query(collection(db, 'classCodes'), where('classroomId', '==', classroomId));
      const classCodesSnapshot = await getDocs(classCodesQuery);
      
      classCodesSnapshot.forEach(classCodeDoc => {
        transaction.delete(classCodeDoc.ref);
      });
    });

    console.log("Classroom", classroomId, "deleted successfully");
  } catch (error) {
    console.error("Error deleting classroom", error);
    throw new Error("Failed to delete classroom");
  }
};

const getUserClassrooms = async (userId: string, role: 'student' | 'teacher'): Promise<Classroom[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log("User not found");
      return [];
    }

    const userData = userDoc.data() as UserProfile;
    const classroomIds = userData.classrooms || [];

    // Fetch classrooms in parallel
    const classrooms = await Promise.all(
      classroomIds.map(async (classroomId) => {
        const classroom = await getClassroom(classroomId);
        return classroom;
      })
    );

    // Filter out any undefined classrooms (in case they were deleted)
    return classrooms.filter((classroom): classroom is Classroom => classroom !== undefined);
  } catch (error) {
    console.error("Error fetching user classrooms", error);
    throw new Error("Failed to fetch user classrooms");
  }
};

const createScenario = async (title: string, description: string, scenes: Scene[]): Promise<Scenario> => {
  try {
    const scenarioData = {
      title,
      description,
      scenes,
      createdAt: serverTimestamp()
    };

    const scenarioRef = doc(collection(db, 'scenarios'));
    await setDoc(scenarioRef, scenarioData);

    console.log("Scenario created successfully with ID:", scenarioRef.id);
    
    return {
      id: scenarioRef.id,
      ...scenarioData,
      createdAt: Timestamp.now()
    };
  } catch (error) {
    console.error("Error creating scenario", error);
    throw new Error("Failed to create scenario");
  }
};

const getScenario = async (scenarioId: string): Promise<Scenario | undefined> => {
  try {
    const scenarioRef = doc(db, 'scenarios', scenarioId);
    const scenarioDoc = await getDoc(scenarioRef);

    if (scenarioDoc.exists()) {
      return {
        id: scenarioDoc.id,
        ...scenarioDoc.data() as Scenario,
        createdAt: scenarioDoc.data().createdAt
      };
    } else {
      console.log("Scenario not found");
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching scenario", error);
    throw new Error("Failed to fetch scenario");
  }
};

const getScenarios = async (): Promise<Scenario[]> => {
  try {
    const scenariosQuery = query(collection(db, 'scenarios'));
    const scenariosSnapshot = await getDocs(scenariosQuery);

    const scenarios: Scenario[] = [];
    scenariosSnapshot.forEach(doc => {
      scenarios.push({
        id: doc.id,
        ...doc.data() as Scenario,
        createdAt: doc.data().createdAt
      });
    });

    return scenarios;
  } catch (error) {
    console.error("Error fetching scenarios", error);
    throw new Error("Failed to fetch scenarios");
  }
};

export const createLiveSession = async (
  classroomId: string,
  teacherId: string,
  teacherName: string,
  scenarioId: string,
  scenarioTitle: string,
  initialSceneId: string
): Promise<LiveSession> => {
  try {
    // Create session document
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
      currentChoices: {},
      votes: {}, // Initialize votes
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    const sessionRef = doc(collection(db, 'sessions'));
    
    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      // Create the session
      transaction.set(sessionRef, sessionData);
      
      // Update classroom with active session
      const classroomRef = doc(db, 'classrooms', classroomId);
      transaction.update(classroomRef, {
        activeSessionId: sessionRef.id,
        lastUpdated: serverTimestamp()
      });
    });

    console.log("Live session created successfully:", sessionRef.id);
    
    return {
      id: sessionRef.id,
      ...sessionData,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now()
    };
  } catch (error) {
    console.error("Error creating live session:", error);
    throw new Error("Failed to create live session");
  }
};

export const getActiveSession = async (classroomId: string): Promise<LiveSession | undefined> => {
  try {
    const classroomRef = doc(db, 'classrooms', classroomId);
    const classroomDoc = await getDoc(classroomRef);

    if (!classroomDoc.exists()) {
      console.log("Classroom not found");
      return undefined;
    }

    const classroomData = classroomDoc.data() as Classroom;
    const activeSessionId = classroomData.activeSessionId;

    if (!activeSessionId) {
      console.log("No active session for this classroom");
      return undefined;
    }

    const sessionRef = doc(db, 'sessions', activeSessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (sessionDoc.exists()) {
      return {
        id: sessionDoc.id,
        ...sessionDoc.data() as LiveSession,
        createdAt: sessionDoc.data().createdAt,
        lastUpdated: sessionDoc.data().lastUpdated
      };
    } else {
      console.log("Active session not found");
      return undefined;
    }
  } catch (error) {
    console.error("Error fetching active session", error);
    return undefined;
  }
};

export const joinLiveSession = async (sessionId: string, studentId: string, studentName: string): Promise<LiveSession> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Session not found");
    }

    const sessionData = sessionDoc.data() as LiveSession;

    if (sessionData.status !== 'active') {
      throw new Error("Session is not active");
    }

    const participant: SessionParticipant = {
      studentId,
      studentName,
      joinedAt: serverTimestamp(),
      isActive: true
    };

    // Check if student is already in the session
    const existingParticipant = sessionData.participants.find(p => p.studentId === studentId);
    if (existingParticipant) {
      throw new Error("You are already in this session");
    }

    await updateDoc(sessionRef, {
      participants: [...sessionData.participants, participant],
      lastUpdated: serverTimestamp()
    });

    console.log("Student", studentId, "joined session", sessionId);
    return {
      id: sessionDoc.id,
      ...sessionData,
      createdAt: sessionData.createdAt,
      lastUpdated: Timestamp.now()
    };
  } catch (error) {
    console.error("Error joining live session", error);
    throw new Error("Failed to join live session");
  }
};

export const submitLiveChoice = async (sessionId: string, studentId: string, choiceId: string, currentSceneId: string | undefined): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    // Optimistically update the choice
    const updateData = {
      [`currentChoices.${studentId}`]: choiceId,
      lastUpdated: serverTimestamp()
    };
    
    await updateDoc(sessionRef, updateData);
    console.log(`Student ${studentId} submitted choice ${choiceId} for session ${sessionId}`);
  } catch (error) {
    console.error("Error submitting live choice", error);
    throw new Error("Failed to submit choice");
  }
};

export const advanceLiveSession = async (
  sessionId: string, 
  nextSceneId: string, 
  nextSceneIndex?: number
): Promise<void> => {
  try {
    const sessionRef = doc(db, 'sessions', sessionId);
    
    const updateData: any = {
      currentSceneId: nextSceneId,
      lastUpdated: serverTimestamp(),
      votes: {}, // Reset votes for new scene
      currentChoices: {} // Reset choices for new scene
    };
    
    if (nextSceneIndex !== undefined) {
      updateData.currentSceneIndex = nextSceneIndex;
    }
    
    await updateDoc(sessionRef, updateData);
    console.log("Live session advanced to scene:", nextSceneId);
  } catch (error) {
    console.error("Error advancing live session:", error);
    throw new Error("Failed to advance scene");
  }
};

export const endLiveSession = async (sessionId: string, classroomId: string, resultPayload: any): Promise<void> => {
  try {
    // Use transaction to ensure atomic updates
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error("Session not found");
      }

      // End the session and store results
      transaction.update(sessionRef, {
        status: 'ended',
        resultPayload: resultPayload,
        lastUpdated: serverTimestamp()
      });

      // Remove activeSessionId from classroom
      const classroomRef = doc(db, 'classrooms', classroomId);
      transaction.update(classroomRef, {
        activeSessionId: null,
        lastUpdated: serverTimestamp()
      });
    });

    console.log("Live session", sessionId, "ended successfully");
  } catch (error) {
    console.error("Error ending live session", error);
    throw new Error("Failed to end live session");
  }
};

export const createNotification = async (studentId: string, teacherName: string, scenarioTitle: string, sessionId: string, type: 'live_session_started'): Promise<void> => {
  try {
    const notificationData: SessionNotification = {
      studentId,
      teacherName,
      scenarioTitle,
      sessionId,
      type,
      createdAt: serverTimestamp()
    };

    const notificationRef = doc(collection(db, 'notifications'));
    await setDoc(notificationRef, notificationData);

    console.log("Notification created successfully for student:", studentId);
  } catch (error) {
    console.error("Error creating notification", error);
    throw new Error("Failed to create notification");
  }
};

// Firestore Listeners
export const onAuthStateChangedListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const onClassroomUpdated = (classroomId: string, callback: (classroom: Classroom) => void) => {
  const classroomRef = doc(db, 'classrooms', classroomId);

  return onSnapshot(classroomRef, (snapshot) => {
    if (snapshot.exists()) {
      const classroom = {
        id: snapshot.id,
        ...snapshot.data() as Classroom,
        createdAt: snapshot.data().createdAt,
        lastUpdated: snapshot.data().lastUpdated
      };
      callback(classroom);
    } else {
      console.log("Classroom not found");
    }
  });
};

export const onLiveSessionUpdated = (sessionId: string, callback: (session: LiveSession) => void) => {
  const sessionRef = doc(db, 'sessions', sessionId);

  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      const session = {
        id: snapshot.id,
        ...snapshot.data() as LiveSession,
        createdAt: snapshot.data().createdAt,
        lastUpdated: snapshot.data().lastUpdated
      };
      callback(session);
    } else {
      console.log("Live session not found");
    }
  });
};

export const onSessionParticipantsUpdated = (sessionId: string, callback: (participants: SessionParticipant[]) => void) => {
  const sessionRef = doc(db, 'sessions', sessionId);

  return onSnapshot(sessionRef, (snapshot) => {
    if (snapshot.exists()) {
      const sessionData = snapshot.data() as LiveSession;
      callback(sessionData.participants);
    } else {
      console.log("Live session not found");
      callback([]);
    }
  });
};

export const onNotificationsUpdated = (studentId: string, callback: (notifications: SessionNotification[]) => void) => {
  const notificationsQuery = query(
    collection(db, 'notifications'),
    where('studentId', '==', studentId),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    const notifications: SessionNotification[] = [];
    snapshot.forEach(doc => {
      notifications.push({
        id: doc.id,
        ...doc.data() as SessionNotification,
        createdAt: doc.data().createdAt
      });
    });
    callback(notifications);
  });
};

export { auth, db, signInWithGoogle, signOutFirebase };
