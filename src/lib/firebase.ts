
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
  getDocs
} from 'firebase/firestore';

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
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
  return setDoc(doc(db, 'users', uid), {
    ...userData,
    xp: 0,
    level: 1,
    completedScenarios: [],
    badges: [],
    history: [],
    createdAt: new Date()
  });
};

export const getUserProfile = async (uid: string) => {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

export const updateUserProfile = async (uid: string, data: any) => {
  return updateDoc(doc(db, 'users', uid), data);
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
    where('students', 'array-contains', studentId)
  );
  
  const snapshot = await getDocs(classroomsQuery);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export { auth, db };
