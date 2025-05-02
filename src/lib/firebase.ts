
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
  DocumentData
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
export const createUserProfile = async (uid: string, userData: Record<string, any>) => {
  // Initialize metrics at 0
  const initialMetrics: Metrics = {
    health: 0,
    money: 0,
    happiness: 0,
    knowledge: 0,
    relationships: 0
  };
  
  const defaultData = {
    xp: 0,
    level: 1,
    completedScenarios: [],
    badges: [],
    history: [],
    metrics: initialMetrics,
    createdAt: new Date()
  };
  
  // Fix: Use object spread with explicit typing
  return setDoc(doc(db, 'users', uid), {
    ...defaultData,
    ...userData
  } as DocumentData);
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

// Classroom functions
export const createClassroom = async (teacherId: string, name: string, description?: string) => {
  const classroomData = {
    name,
    description: description || "",
    teacherId,
    students: [],
    activeScenario: null,
    currentScene: null,
    createdAt: serverTimestamp(),
    classCode: generateClassCode(),
    isActive: true
  };
  
  const docRef = await addDoc(collection(db, 'classrooms'), classroomData);
  return { id: docRef.id, ...classroomData };
};

export const getClassroom = async (classroomId: string) => {
  const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
  if (classroomDoc.exists()) {
    return { id: classroomDoc.id, ...classroomDoc.data() };
  }
  return null;
};

export const joinClassroom = async (classroomId: string, studentId: string, studentName: string) => {
  const classroomRef = doc(db, 'classrooms', classroomId);
  const classroomDoc = await getDoc(classroomRef);
  
  if (!classroomDoc.exists()) {
    throw new Error("Classroom not found");
  }
  
  const classroom = classroomDoc.data();
  const studentList = classroom.students || [];
  
  // Check if student is already in the classroom
  if (!studentList.some((s: any) => s.id === studentId)) {
    await updateDoc(classroomRef, {
      students: [...studentList, { id: studentId, name: studentName, joinedAt: new Date() }]
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
  
  return { id: classroomDoc.id, ...classroomDoc.data() };
};

export const getClassroomByCode = async (classCode: string) => {
  const classroomsQuery = query(
    collection(db, 'classrooms'), 
    where('classCode', '==', classCode)
  );
  
  const snapshot = await getDocs(classroomsQuery);
  
  if (snapshot.empty) {
    return null;
  }
  
  const classroomDoc = snapshot.docs[0];
  return { id: classroomDoc.id, ...classroomDoc.data() };
};

export const getClassrooms = async (teacherId?: string) => {
  let classroomsQuery;
  if (teacherId) {
    classroomsQuery = query(collection(db, 'classrooms'), where('teacherId', '==', teacherId));
  } else {
    classroomsQuery = collection(db, 'classrooms');
  }
  
  const snapshot = await getDocs(classroomsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getStudentClassrooms = async (studentId: string) => {
  const classroomsQuery = query(
    collection(db, 'classrooms'), 
    where('students', 'array-contains', { id: studentId })
  );
  
  const snapshot = await getDocs(classroomsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateClassroom = async (classroomId: string, data: Record<string, any>) => {
  return updateDoc(doc(db, 'classrooms', classroomId), data);
};

// Classroom activity functions
export const startClassroomScenario = async (classroomId: string, scenarioId: string, initialScene: string) => {
  return updateDoc(doc(db, 'classrooms', classroomId), {
    activeScenario: scenarioId,
    currentScene: initialScene,
    startedAt: serverTimestamp(),
    votes: {},
    studentProgress: {}
  });
};

export const recordStudentVote = async (classroomId: string, studentId: string, choiceId: string) => {
  const voteRef = doc(db, 'classrooms', classroomId, 'votes', studentId);
  return setDoc(voteRef, { 
    choiceId, 
    timestamp: serverTimestamp() 
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
    lastUpdated: serverTimestamp()
  });
};

// Helper to generate a random class code
const generateClassCode = () => {
  const prefix = 'LIFE';
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
  return `${prefix}-${randomDigits}`;
};

// Real-time listeners
export const onClassroomUpdated = (classroomId: string, callback: (classroom: any) => void) => {
  const unsubscribe = onSnapshot(doc(db, 'classrooms', classroomId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
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

export { auth, db };
