import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { ClassroomSession, ClassroomParticipant, ClassroomVote } from '@/types/game';

// Generate unique 6-character code
export const generateClassroomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new classroom session
export const createClassroomSession = async (
  teacherId: string,
  teacherName: string,
  sessionName: string
): Promise<ClassroomSession> => {
  const code = generateClassroomCode();
  const sessionRef = doc(collection(db, 'classrooms'));
  
  const session: ClassroomSession = {
    id: sessionRef.id,
    code,
    name: sessionName,
    teacherId,
    teacherName,
    scenarioId: null,
    currentSceneId: null,
    status: 'waiting',
    createdAt: serverTimestamp(),
    participants: []
  };

  await setDoc(sessionRef, session);
  return { ...session, createdAt: Timestamp.now() };
};

// Get classroom session by ID
export const getClassroomSession = async (sessionId: string): Promise<ClassroomSession | null> => {
  const sessionDoc = await getDoc(doc(db, 'classrooms', sessionId));
  if (!sessionDoc.exists()) return null;
  return { id: sessionDoc.id, ...sessionDoc.data() } as ClassroomSession;
};

// Get classroom session by code
export const getClassroomByCode = async (code: string): Promise<ClassroomSession | null> => {
  const q = query(collection(db, 'classrooms'), where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as ClassroomSession;
};

// Get teacher's classrooms
export const getTeacherClassrooms = async (teacherId: string): Promise<ClassroomSession[]> => {
  const q = query(collection(db, 'classrooms'), where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ClassroomSession[];
};

// Join classroom as student
export const joinClassroom = async (
  sessionId: string,
  userId: string,
  username: string
): Promise<void> => {
  const participantRef = doc(collection(db, 'classrooms', sessionId, 'participants'), userId);
  
  const participant: ClassroomParticipant = {
    id: userId,
    userId,
    username,
    joinedAt: serverTimestamp(),
    isActive: true
  };

  await setDoc(participantRef, participant);
  
  // Update session participants list
  const sessionRef = doc(db, 'classrooms', sessionId);
  const sessionDoc = await getDoc(sessionRef);
  const currentParticipants = sessionDoc.data()?.participants || [];
  
  if (!currentParticipants.includes(userId)) {
    await updateDoc(sessionRef, {
      participants: [...currentParticipants, userId]
    });
  }
};

// Get classroom participants
export const getClassroomParticipants = async (sessionId: string): Promise<ClassroomParticipant[]> => {
  const participantsRef = collection(db, 'classrooms', sessionId, 'participants');
  const snapshot = await getDocs(participantsRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ClassroomParticipant[];
};

// Start scenario in classroom
export const startClassroomScenario = async (
  sessionId: string,
  scenarioId: string,
  initialSceneId: string
): Promise<void> => {
  const sessionRef = doc(db, 'classrooms', sessionId);
  await updateDoc(sessionRef, {
    scenarioId,
    currentSceneId: initialSceneId,
    status: 'active'
  });
};

// Move to next scene
export const advanceClassroomScene = async (
  sessionId: string,
  nextSceneId: string
): Promise<void> => {
  const sessionRef = doc(db, 'classrooms', sessionId);
  await updateDoc(sessionRef, {
    currentSceneId: nextSceneId
  });
};

// Pause/Resume classroom
export const updateClassroomStatus = async (
  sessionId: string,
  status: 'waiting' | 'active' | 'paused' | 'ended'
): Promise<void> => {
  const sessionRef = doc(db, 'classrooms', sessionId);
  await updateDoc(sessionRef, { status });
};

// Submit student vote
export const submitClassroomVote = async (
  sessionId: string,
  sceneId: string,
  choiceId: string,
  userId: string,
  username: string
): Promise<void> => {
  const voteRef = doc(collection(db, 'classrooms', sessionId, 'votes'));
  
  const vote: ClassroomVote = {
    id: voteRef.id,
    sessionId,
    sceneId,
    choiceId,
    userId,
    username,
    timestamp: serverTimestamp()
  };

  await setDoc(voteRef, vote);
};

// Get votes for current scene
export const getSceneVotes = async (
  sessionId: string,
  sceneId: string
): Promise<ClassroomVote[]> => {
  const votesRef = collection(db, 'classrooms', sessionId, 'votes');
  const q = query(votesRef, where('sceneId', '==', sceneId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ClassroomVote[];
};

// Remove student from classroom
export const removeStudentFromClassroom = async (
  sessionId: string,
  userId: string
): Promise<void> => {
  await deleteDoc(doc(db, 'classrooms', sessionId, 'participants', userId));
  
  const sessionRef = doc(db, 'classrooms', sessionId);
  const sessionDoc = await getDoc(sessionRef);
  const currentParticipants = sessionDoc.data()?.participants || [];
  
  await updateDoc(sessionRef, {
    participants: currentParticipants.filter((id: string) => id !== userId)
  });
};

// End classroom session
export const endClassroomSession = async (sessionId: string): Promise<void> => {
  await updateClassroomStatus(sessionId, 'ended');
};

// Delete classroom session
export const deleteClassroomSession = async (sessionId: string): Promise<void> => {
  await deleteDoc(doc(db, 'classrooms', sessionId));
};

// Real-time listeners
export const onClassroomSessionUpdate = (
  sessionId: string,
  callback: (session: ClassroomSession | null) => void
): (() => void) => {
  return onSnapshot(doc(db, 'classrooms', sessionId), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as ClassroomSession);
    } else {
      callback(null);
    }
  });
};

export const onClassroomParticipantsUpdate = (
  sessionId: string,
  callback: (participants: ClassroomParticipant[]) => void
): (() => void) => {
  return onSnapshot(collection(db, 'classrooms', sessionId, 'participants'), (snapshot) => {
    const participants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ClassroomParticipant[];
    callback(participants);
  });
};

export const onClassroomVotesUpdate = (
  sessionId: string,
  sceneId: string,
  callback: (votes: ClassroomVote[]) => void
): (() => void) => {
  const votesRef = collection(db, 'classrooms', sessionId, 'votes');
  const q = query(votesRef, where('sceneId', '==', sceneId));
  
  return onSnapshot(q, (snapshot) => {
    const votes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ClassroomVote[];
    callback(votes);
  });
};

// Get all votes for a session (for summary)
export const getAllSessionVotes = async (sessionId: string): Promise<ClassroomVote[]> => {
  const votesRef = collection(db, 'classrooms', sessionId, 'votes');
  const snapshot = await getDocs(votesRef);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ClassroomVote[];
};

// Session summary data type
export interface SessionSummaryData {
  totalParticipants: number;
  totalVotes: number;
  participantVoteCounts: { username: string; voteCount: number }[];
  votesByScene: Record<string, ClassroomVote[]>;
}

// Get session summary
export const getSessionSummary = async (sessionId: string): Promise<SessionSummaryData> => {
  const [participants, votes] = await Promise.all([
    getClassroomParticipants(sessionId),
    getAllSessionVotes(sessionId)
  ]);

  // Count votes per participant
  const voteCounts: Record<string, number> = {};
  votes.forEach(vote => {
    voteCounts[vote.username] = (voteCounts[vote.username] || 0) + 1;
  });

  const participantVoteCounts = participants.map(p => ({
    username: p.username,
    voteCount: voteCounts[p.username] || 0
  })).sort((a, b) => b.voteCount - a.voteCount);

  // Group votes by scene
  const votesByScene: Record<string, ClassroomVote[]> = {};
  votes.forEach(vote => {
    if (!votesByScene[vote.sceneId]) {
      votesByScene[vote.sceneId] = [];
    }
    votesByScene[vote.sceneId].push(vote);
  });

  return {
    totalParticipants: participants.length,
    totalVotes: votes.length,
    participantVoteCounts,
    votesByScene
  };
};
