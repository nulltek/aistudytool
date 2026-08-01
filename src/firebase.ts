import { initializeApp } from 'firebase/app'
import {
  GoogleAuthProvider,
  getAuth,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import { lessons, type FocusTrack, type LessonContent } from './lessonData'
import type { ModelId } from './modelGuide'
import { levelFromXp } from './progression'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export type UserProfile = {
  displayName: string
  email: string
  photoURL: string
  xp: number
  gems: number
  level: number
  rank: string
  completedCount: number
  chosenModel?: ModelId
  focusTrack?: FocusTrack
  preferences?: UserPreferences
  deactivated?: boolean
}

export type ThemePreference = 'light' | 'dark' | 'system'

export type UserPreferences = {
  theme: ThemePreference
  soundEnabled: boolean
  reducedMotion: boolean
  emailReminders: boolean
}

export const defaultPreferences: UserPreferences = {
  theme: 'light',
  soundEnabled: true,
  reducedMotion: false,
  emailReminders: false,
}

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider)
  } catch (error) {
    const code = (error as { code?: string }).code
    if (
      code === 'auth/popup-blocked'
      || code === 'auth/cancelled-popup-request'
      || code === 'auth/network-request-failed'
    ) {
      await signInWithRedirect(auth, googleProvider)
      return null
    }
    throw error
  }
}

export function finishRedirectSignIn() {
  return getRedirectResult(auth)
}

export function signOut() {
  return firebaseSignOut(auth)
}

export async function ensureUserProfile(user: User) {
  const userRef = doc(db, 'users', user.uid)
  const snapshot = await getDoc(userRef)
  if (snapshot.exists()) return
  await setDoc(userRef, {
    displayName: user.displayName ?? 'AI Learner',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    xp: 0,
    gems: 0,
    level: 1,
    rank: 'Bronze I',
    completedCount: 0,
    preferences: defaultPreferences,
    deactivated: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function saveChosenModel(user: User, chosenModel: ModelId) {
  await setDoc(doc(db, 'users', user.uid), {
    chosenModel,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function saveFocusTrack(user: User, focusTrack: FocusTrack) {
  await setDoc(doc(db, 'users', user.uid), {
    focusTrack,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function saveUserPreferences(user: User, preferences: UserPreferences) {
  await setDoc(doc(db, 'users', user.uid), {
    preferences,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function deactivateProfile(user: User) {
  await setDoc(doc(db, 'users', user.uid), {
    deactivated: true,
    deactivatedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })
  await firebaseSignOut(auth)
}

export async function reactivateProfile(user: User) {
  await setDoc(doc(db, 'users', user.uid), {
    deactivated: false,
    deactivatedAt: null,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export function watchAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback)
}

export function watchProfile(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe {
  return onSnapshot(doc(db, 'users', uid), (snapshot) => {
    callback(snapshot.exists() ? snapshot.data() as UserProfile : null)
  })
}

export function watchCompletions(uid: string, callback: (ids: string[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, 'completedLessons'), (snapshot) => {
    callback(snapshot.docs.map((item) => item.id))
  })
}

export async function completeLesson(user: User, lesson: LessonContent) {
  const completionRef = doc(db, 'users', user.uid, 'completedLessons', lesson.id)
  const completionSnapshot = await getDocs(collection(db, 'users', user.uid, 'completedLessons'))
  const completedIds = new Set(completionSnapshot.docs.map((item) => item.id))
  const oldXp = lessons.filter((item) => completedIds.has(item.id)).reduce((sum, item) => sum + item.xp, 0)
  const oldLevel = levelFromXp(oldXp)

  return runTransaction(db, async (transaction) => {
    const savedCompletion = await transaction.get(completionRef)

    if (savedCompletion.exists()) {
      return { alreadyCompleted: true, oldLevel, newLevel: oldLevel }
    }

    transaction.set(completionRef, {
      lessonId: lesson.id,
      xp: lesson.xp,
      gems: lesson.gems,
      quizScore: 1,
      completedAt: serverTimestamp(),
    })

    return { alreadyCompleted: false, oldLevel, newLevel: levelFromXp(oldXp + lesson.xp) }
  })
}
