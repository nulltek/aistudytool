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
  endAt,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAt,
  where,
  writeBatch,
  type Timestamp,
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
  username: string
  usernameLower: string
  friendCode: string
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

export type PublicProfile = {
  uid: string
  username: string
  usernameLower: string
  friendCode: string
  photoURL: string
  streak: number
  currentLessonId: string
  currentLessonTitle: string
  currentLessonProgress: string
  updatedAt?: Timestamp | null
}

export type FriendRequest = {
  id: string
  fromUid: string
  toUid: string
  status: 'pending' | 'accepted' | 'declined'
  seenAt?: Timestamp | null
  createdAt?: Timestamp | null
  sender?: PublicProfile
}

export type CompletionRecord = {
  lessonId: string
  completedAt?: Timestamp | null
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

const friendCodeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomToken(length: number, alphabet: string) {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join('')
}

export function normalizeUsername(value: string) {
  return value.trim().replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)
}

function suggestedUsername(user: User) {
  const base = normalizeUsername(user.displayName ?? 'AILearner') || 'AILearner'
  return `${base.slice(0, 15)}${randomToken(4, '23456789')}`
}

function makePublicProfile(uid: string, profile: Partial<UserProfile>): PublicProfile {
  return {
    uid,
    username: profile.username ?? profile.displayName ?? 'AI Learner',
    usernameLower: profile.usernameLower ?? (profile.username ?? profile.displayName ?? 'ai-learner').toLowerCase(),
    friendCode: profile.friendCode ?? '',
    photoURL: profile.photoURL ?? '',
    streak: 0,
    currentLessonId: '',
    currentLessonTitle: 'Starting the trail',
    currentLessonProgress: '0 lessons complete',
    updatedAt: null,
  }
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
  const saved = snapshot.exists() ? snapshot.data() as Partial<UserProfile> : null

  if (saved?.username && saved.friendCode) {
    const publicRef = doc(db, 'publicProfiles', user.uid)
    const publicSnapshot = await getDoc(publicRef)
    await setDoc(publicRef, publicSnapshot.exists() ? {
      username: saved.username,
      usernameLower: saved.usernameLower ?? saved.username.toLowerCase(),
      friendCode: saved.friendCode,
      photoURL: saved.photoURL ?? '',
      updatedAt: serverTimestamp(),
    } : {
      ...makePublicProfile(user.uid, saved),
      updatedAt: serverTimestamp(),
    }, { merge: true })
    return
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const username = suggestedUsername(user)
    const usernameLower = username.toLowerCase()
    const friendCode = randomToken(12, friendCodeAlphabet)

    try {
      await runTransaction(db, async (transaction) => {
        const freshUser = await transaction.get(userRef)
        const usernameRef = doc(db, 'usernames', usernameLower)
        const friendCodeRef = doc(db, 'friendCodes', friendCode)
        const usernameClaim = await transaction.get(usernameRef)
        const friendCodeClaim = await transaction.get(friendCodeRef)
        if (usernameClaim.exists() || friendCodeClaim.exists()) throw new Error('SOCIAL_ID_COLLISION')

        const baseProfile = freshUser.exists() ? freshUser.data() as Partial<UserProfile> : {
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
        }
        const nextProfile = { ...baseProfile, username, usernameLower, friendCode }

        transaction.set(userRef, {
          ...nextProfile,
          ...(freshUser.exists() ? {} : { createdAt: serverTimestamp() }),
          updatedAt: serverTimestamp(),
        }, { merge: freshUser.exists() })
        transaction.set(usernameRef, { uid: user.uid, createdAt: serverTimestamp() })
        transaction.set(friendCodeRef, { uid: user.uid, createdAt: serverTimestamp() })
        transaction.set(doc(db, 'publicProfiles', user.uid), {
          ...makePublicProfile(user.uid, nextProfile),
          updatedAt: serverTimestamp(),
        })
      })
      return
    } catch (error) {
      if ((error as Error).message !== 'SOCIAL_ID_COLLISION' || attempt === 7) throw error
    }
  }
}

export async function saveProfileIdentity(user: User, usernameValue: string, photoURL: string) {
  const username = normalizeUsername(usernameValue)
  if (username.length < 3) throw new Error('Username must have at least 3 letters, numbers, or underscores.')
  if (photoURL.length > 200_000) throw new Error('Cropped image is too large. Try a different image.')
  const usernameLower = username.toLowerCase()
  const userRef = doc(db, 'users', user.uid)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef)
    if (!snapshot.exists()) throw new Error('Learner profile was not found.')
    const current = snapshot.data() as UserProfile
    const newClaimRef = doc(db, 'usernames', usernameLower)
    const newClaim = await transaction.get(newClaimRef)
    if (newClaim.exists() && newClaim.data().uid !== user.uid) throw new Error('That username is already taken.')

    if (current.usernameLower && current.usernameLower !== usernameLower) {
      transaction.delete(doc(db, 'usernames', current.usernameLower))
    }
    if (!newClaim.exists()) transaction.set(newClaimRef, { uid: user.uid, createdAt: serverTimestamp() })
    transaction.set(userRef, { displayName: username, username, usernameLower, photoURL, updatedAt: serverTimestamp() }, { merge: true })
    transaction.set(doc(db, 'publicProfiles', user.uid), { username, usernameLower, photoURL, updatedAt: serverTimestamp() }, { merge: true })
  })
}

export async function syncPublicProgress(user: User, streak: number, currentLessonId: string, currentLessonTitle: string, currentLessonProgress: string) {
  await setDoc(doc(db, 'publicProfiles', user.uid), {
    streak,
    currentLessonId,
    currentLessonTitle,
    currentLessonProgress,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function searchPublicProfiles(user: User, searchValue: string) {
  const term = searchValue.trim()
  if (!term) return []
  const publicProfiles = collection(db, 'publicProfiles')
  const friendCode = term.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  const lookup = friendCode.length === 12
    ? query(publicProfiles, where('friendCode', '==', friendCode), limit(8))
    : query(publicProfiles, orderBy('usernameLower'), startAt(term.toLowerCase()), endAt(`${term.toLowerCase()}\uf8ff`), limit(8))
  const snapshot = await getDocs(lookup)
  return snapshot.docs.map((item) => item.data() as PublicProfile).filter((profile) => profile.uid !== user.uid)
}

export async function sendFriendRequest(user: User, toUid: string) {
  if (user.uid === toUid) throw new Error('You cannot add yourself.')
  const requestRef = doc(db, 'friendRequests', `${user.uid}_${toUid}`)
  const reverseRequestRef = doc(db, 'friendRequests', `${toUid}_${user.uid}`)
  const friendshipRef = doc(db, 'users', user.uid, 'friends', toUid)

  await runTransaction(db, async (transaction) => {
    const sender = await transaction.get(doc(db, 'publicProfiles', user.uid))
    const recipient = await transaction.get(doc(db, 'publicProfiles', toUid))
    const existing = await transaction.get(requestRef)
    const reverse = await transaction.get(reverseRequestRef)
    const friendship = await transaction.get(friendshipRef)
    if (!sender.exists() || !recipient.exists()) throw new Error('That learner is not available.')
    if (friendship.exists()) throw new Error('You are already friends.')
    if (reverse.exists() && reverse.data().status === 'pending') throw new Error('This learner already invited you. Open your requests to respond.')
    if (existing.exists()) throw new Error(existing.data().status === 'pending' ? 'Friend request already sent.' : 'A previous request with this learner has already been resolved.')
    transaction.set(requestRef, {
      fromUid: user.uid,
      toUid,
      status: 'pending',
      seenAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

export function watchIncomingFriendRequests(uid: string, callback: (requests: FriendRequest[]) => void): Unsubscribe {
  const incoming = query(collection(db, 'friendRequests'), where('toUid', '==', uid), where('status', '==', 'pending'))
  return onSnapshot(incoming, async (snapshot) => {
    const requests = await Promise.all(snapshot.docs.map(async (item) => {
      const data = item.data() as Omit<FriendRequest, 'id' | 'sender'>
      const sender = await getDoc(doc(db, 'publicProfiles', data.fromUid))
      return { ...data, id: item.id, sender: sender.exists() ? sender.data() as PublicProfile : undefined }
    }))
    callback(requests)
  })
}

export async function markFriendRequestsSeen(user: User, requests: FriendRequest[]) {
  const unseen = requests.filter((request) => !request.seenAt)
  if (!unseen.length) return
  const batch = writeBatch(db)
  unseen.forEach((request) => batch.update(doc(db, 'friendRequests', request.id), { seenAt: serverTimestamp(), updatedAt: serverTimestamp() }))
  await batch.commit()
}

export async function respondToFriendRequest(user: User, request: FriendRequest, response: 'accepted' | 'declined') {
  const requestRef = doc(db, 'friendRequests', request.id)
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(requestRef)
    if (!snapshot.exists() || snapshot.data().toUid !== user.uid || snapshot.data().status !== 'pending') throw new Error('This request is no longer available.')
    transaction.update(requestRef, { status: response, seenAt: serverTimestamp(), updatedAt: serverTimestamp() })
    if (response === 'accepted') {
      transaction.set(doc(db, 'users', request.fromUid, 'friends', request.toUid), { friendUid: request.toUid, requestId: request.id, since: serverTimestamp() })
      transaction.set(doc(db, 'users', request.toUid, 'friends', request.fromUid), { friendUid: request.fromUid, requestId: request.id, since: serverTimestamp() })
    }
  })
}

export function watchFriendProfiles(uid: string, callback: (friends: PublicProfile[]) => void): Unsubscribe {
  let profileStops: Unsubscribe[] = []
  const profiles = new Map<string, PublicProfile>()
  const stopFriends = onSnapshot(collection(db, 'users', uid, 'friends'), (snapshot) => {
    profileStops.forEach((stop) => stop())
    profileStops = []
    profiles.clear()
    if (snapshot.empty) callback([])
    snapshot.docs.forEach((friend) => {
      const friendUid = friend.data().friendUid as string
      profileStops.push(onSnapshot(doc(db, 'publicProfiles', friendUid), (profile) => {
        if (profile.exists()) profiles.set(friendUid, profile.data() as PublicProfile)
        else profiles.delete(friendUid)
        callback([...profiles.values()].sort((a, b) => a.username.localeCompare(b.username)))
      }))
    })
  })
  return () => {
    stopFriends()
    profileStops.forEach((stop) => stop())
  }
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

export function watchCompletions(uid: string, callback: (records: CompletionRecord[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'users', uid, 'completedLessons'), (snapshot) => {
    callback(snapshot.docs.map((item) => ({
      lessonId: item.id,
      completedAt: item.data().completedAt as Timestamp | null | undefined,
    })))
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
