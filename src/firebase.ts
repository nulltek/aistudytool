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
import { lessons, type LessonContent } from './lessonData'
import type { ModelId } from './modelGuide'
import { levelFromXp, rankFromLevel } from './progression'

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
  if (snapshot.exists()) {
    const completionSnapshot = await getDocs(collection(db, 'users', user.uid, 'completedLessons'))
    const completed = new Set(completionSnapshot.docs.map((item) => item.id))
    const earnedLessons = lessons.filter((lesson) => completed.has(lesson.id))
    const xp = earnedLessons.reduce((sum, lesson) => sum + lesson.xp, 0)
    const gems = earnedLessons.reduce((sum, lesson) => sum + lesson.gems, 0)
    const level = levelFromXp(xp)
    const rank = rankFromLevel(level).name
    const profile = snapshot.data() as UserProfile

    if (
      profile.xp !== xp
      || profile.gems !== gems
      || profile.level !== level
      || profile.rank !== rank
      || profile.completedCount !== earnedLessons.length
    ) {
      await setDoc(userRef, {
        xp,
        gems,
        level,
        rank,
        completedCount: earnedLessons.length,
        updatedAt: serverTimestamp(),
      }, { merge: true })
    }
    return
  }
  await setDoc(userRef, {
    displayName: user.displayName ?? 'AI Learner',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    xp: 0,
    gems: 0,
    level: 1,
    rank: 'Bronze I',
    completedCount: 0,
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
  const userRef = doc(db, 'users', user.uid)
  const completionRef = doc(db, 'users', user.uid, 'completedLessons', lesson.id)

  return runTransaction(db, async (transaction) => {
    const [profileSnapshot, completionSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(completionRef),
    ])

    if (completionSnapshot.exists()) {
      return { alreadyCompleted: true, oldLevel: profileSnapshot.data()?.level ?? 1, newLevel: profileSnapshot.data()?.level ?? 1 }
    }

    if (!profileSnapshot.exists()) throw new Error('Your learner profile is not ready yet.')

    const current = profileSnapshot.data() as UserProfile
    const xp = current.xp + lesson.xp
    const gems = current.gems + lesson.gems
    const newLevel = levelFromXp(xp)
    const rank = rankFromLevel(newLevel).name

    transaction.set(completionRef, {
      lessonId: lesson.id,
      xp: lesson.xp,
      gems: lesson.gems,
      quizScore: 1,
      completedAt: serverTimestamp(),
    })
    transaction.update(userRef, {
      xp,
      gems,
      level: newLevel,
      rank,
      completedCount: current.completedCount + 1,
      updatedAt: serverTimestamp(),
    })

    return { alreadyCompleted: false, oldLevel: current.level, newLevel }
  })
}
