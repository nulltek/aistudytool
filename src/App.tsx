import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { User } from 'firebase/auth'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bot,
  BrainCircuit,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Code2,
  Crown,
  Flame,
  Gem,
  History,
  Home,
  Image as ImageIcon,
  Layers3,
  Lightbulb,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  Moon,
  Mail,
  Menu,
  MessageSquareText,
  Monitor,
  PauseCircle,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Shuffle,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Target,
  Trophy,
  UserX,
  Volume2,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import {
  completeLesson,
  deactivateProfile,
  defaultPreferences,
  ensureUserProfile,
  finishRedirectSignIn,
  reactivateProfile,
  saveFocusTrack,
  saveChosenModel,
  saveUserPreferences,
  signInWithGoogle,
  signOut,
  watchAuth,
  watchCompletions,
  watchProfile,
  type UserProfile,
  type UserPreferences,
} from './firebase'
import { adaptiveUsageGroups, adaptiveUsageLessons, getLesson, lessons, promptLessons, rewardTiers, sectionOneLessons, sectionTwoLessons, trackSections, type FocusTrack, type LessonContent, type LessonVisual } from './lessonData'
import { chooserQuestions, getModelChoice, makeInstallLesson, modelChoices, recommendModel, type InstallMethod, type ModelChoice, type ModelId } from './modelGuide'
import { progressFromXp, rankFamilies, rankFromLevel } from './progression'
import { makeAdaptiveUsageLesson } from './adaptiveUsage'
import { buildQuestionBank, getPracticeSections, pickPracticeSession, PRACTICE_SESSION_SIZE, QUESTION_BANK_SIZE, type PracticeQuestion, type PracticeSection } from './practiceData'

gsap.registerPlugin(ScrollTrigger, useGSAP)

function goTo(path: string) {
  window.location.hash = path
}

function useRoute() {
  const getRoute = () => window.location.hash.replace(/^#/, '') || '/'
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    const onChange = () => setRoute(getRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

function useLearner() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [completions, setCompletions] = useState<string[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    finishRedirectSignIn().catch((reason) => setError(reason.message ?? 'Google sign-in could not finish.'))
    return watchAuth(async (nextUser) => {
      setUser(nextUser)
      setProfile(null)
      setCompletions([])
      if (!nextUser) {
        setReady(true)
        return
      }
      try {
        await ensureUserProfile(nextUser)
        setReady(true)
      } catch (reason) {
        setError((reason as Error).message)
        setReady(true)
      }
    })
  }, [])

  useEffect(() => {
    if (!user) return
    const stopProfile = watchProfile(user.uid, setProfile)
    const stopCompletions = watchCompletions(user.uid, setCompletions)
    return () => {
      stopProfile()
      stopCompletions()
    }
  }, [user])

  const derivedProfile = useMemo(() => {
    if (!profile) return null
    const completed = new Set(completions)
    const earned = lessons.filter((lesson) => completed.has(lesson.id))
    const xp = earned.reduce((sum, lesson) => sum + lesson.xp, 0)
    const gems = earned.reduce((sum, lesson) => sum + lesson.gems, 0)
    const level = progressFromXp(xp).level
    return { ...profile, xp, gems, level, rank: rankFromLevel(level).name, completedCount: earned.length }
  }, [profile, completions])

  return { user, profile: derivedProfile, completions, ready, error, setError }
}

function useAppliedPreferences(profile: UserProfile | null) {
  const preferences = profile?.preferences ?? defaultPreferences

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolvedTheme = preferences.theme === 'system' ? media.matches ? 'dark' : 'light' : preferences.theme
      document.documentElement.dataset.theme = resolvedTheme
      document.documentElement.dataset.reducedMotion = preferences.reducedMotion ? 'true' : 'false'
      gsap.globalTimeline.timeScale(preferences.reducedMotion ? 1000 : 1)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preferences.theme, preferences.reducedMotion])
}

function Brand() {
  return (
    <button className="brand brand-button" onClick={() => goTo('/')} aria-label="Model Trail home">
      <span className="brand-mark"><Sparkles size={20} strokeWidth={2.7} /></span>
      <span>modeltrail</span>
    </button>
  )
}

function AiMascot({ small = false }: { small?: boolean }) {
  return (
    <div className={`ai-mascot ${small ? 'small' : ''}`} aria-hidden="true">
      <span className="mascot-antenna"><i /></span>
      <span className="mascot-ear left" />
      <span className="mascot-ear right" />
      <div className="mascot-face">
        <span className="mascot-eye left" />
        <span className="mascot-eye right" />
        <span className="mascot-smile" />
        <span className="mascot-cheek left" />
        <span className="mascot-cheek right" />
      </div>
      <span className="mascot-shadow" />
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.53h3.24c1.9-1.75 2.98-4.33 2.98-7.39Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.38l-3.24-2.53c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.61A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.91A6.02 6.02 0 0 1 6.07 12c0-.66.11-1.31.32-1.91V7.48H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.52l3.35-2.61Z" />
      <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.48l3.35 2.61C7.18 7.72 9.39 5.95 12 5.95Z" />
    </svg>
  )
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <span className="brand-mark"><Sparkles size={22} /></span>
      <LoaderCircle className="loading-spinner" size={27} />
      <p>Preparing your trail</p>
    </main>
  )
}

function DeactivatedScreen({ user }: { user: User }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const restore = async () => {
    setBusy(true)
    setError('')
    try {
      await reactivateProfile(user)
    } catch (reason) {
      setError((reason as Error).message || 'Your profile could not be reactivated.')
      setBusy(false)
    }
  }

  return <main className="deactivated-page">
    <div className="deactivated-mark"><PauseCircle size={42} /></div>
    <p className="course-kicker">Profile paused</p>
    <h1>Your trail is safe and waiting.</h1>
    <p>Reactivate to restore access to lessons, practice, ranks, gems, and saved progress.</p>
    {error && <div className="auth-error" role="alert">{error}</div>}
    <div className="deactivated-actions">
      <button className="continue-button" onClick={restore} disabled={busy}>{busy ? <LoaderCircle className="loading-spinner" size={19} /> : 'Reactivate profile'} {!busy && <ArrowRight size={19} />}</button>
      <button className="secondary-action" onClick={() => signOut()}>Use another account</button>
    </div>
  </main>
}

function AuthScreen({ error, setError }: { error: string; setError: (value: string) => void }) {
  const [busy, setBusy] = useState(false)

  const handleGoogle = async () => {
    setBusy(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (reason) {
      setError((reason as Error).message || 'Google sign-in failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <nav className="auth-nav"><Brand /><span>Learn AI from the ground up</span></nav>
      <section className="auth-shell">
        <div className="auth-visual">
          <div className="auth-orbit one" />
          <div className="auth-orbit two" />
          <span className="auth-float history"><History size={19} /> AI history</span>
          <span className="auth-float models"><BrainCircuit size={19} /> Smart models</span>
          <span className="auth-float rewards"><Gem size={19} /> Earn rewards</span>
          <AiMascot />
        </div>
        <div className="auth-copy">
          <p className="course-kicker">Your AI learning trail</p>
          <h1>Small lessons.<br />Real AI confidence.</h1>
          <p>Follow a playful path from AI basics to choosing and running your own models. Save progress, earn gems, and grow through the ranks.</p>
          <button className="google-button" onClick={handleGoogle} disabled={busy}>
            {busy ? <LoaderCircle className="loading-spinner" size={20} /> : <GoogleMark />}
            Continue with Google
          </button>
          <span className="auth-note">New here? Your learner account is created automatically.</span>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <div className="auth-trust"><ShieldCheck size={17} /><span>Only your name, email, photo, and learning progress are stored.</span></div>
        </div>
      </section>
    </main>
  )
}

const navItems = [
  { label: 'Learn', icon: Home, path: '/' },
  { label: 'Practice', icon: Target, path: '/practice' },
  { label: 'Ranks', icon: Trophy, path: '/profile' },
  { label: 'Profile', icon: CircleUserRound, path: '/profile' },
]

function Sidebar({ user, profile, route }: { user: User; profile: UserProfile; route: string }) {
  return (
    <aside className="sidebar">
      <Brand />
      <nav className="side-nav" aria-label="Main navigation">
        {navItems.map(({ label, icon: Icon, path }, index) => (
          <button className={`nav-item ${(route === path && (path !== '/' || index === 0)) ? 'active' : ''}`} key={label} onClick={() => goTo(path)}>
            <Icon size={21} strokeWidth={2.5} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <button className={`nav-item ${route === '/settings' ? 'active' : ''}`} onClick={() => goTo('/settings')}><Settings size={21} /><span>Settings</span></button>
        <button className="profile-chip profile-chip-button" onClick={() => goTo('/profile')}>
          {user.photoURL ? <img className="avatar-photo" src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="avatar">{profile.displayName.slice(0, 2).toUpperCase()}</div>}
          <div><strong>{profile.displayName}</strong><span>Level {profile.level} · {profile.rank}</span></div>
          <ChevronRight size={17} />
        </button>
      </div>
    </aside>
  )
}

function Topbar({ profile }: { profile: UserProfile }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu"><Menu size={21} /></button>
      <div className="mobile-brand"><Brand /></div>
      <div className="top-stats">
        <div className="stat flame"><Flame size={19} fill="currentColor" /><strong>1</strong><span>day streak</span></div>
        <div className="stat"><Zap size={19} /><strong>{profile.xp}</strong><span>XP</span></div>
        <div className="stat gem-stat"><Gem size={19} /><strong>{profile.gems}</strong><span>gems</span></div>
        <button className="league" onClick={() => goTo('/profile')}><ShieldCheck size={18} /><span>{profile.rank}</span><ChevronRight size={15} /></button>
      </div>
    </header>
  )
}

function BottomNav({ route }: { route: string }) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {navItems.map(({ label, icon: Icon, path }, index) => (
        <button className={(route === path && (path !== '/' || index === 0)) ? 'active' : ''} key={label} onClick={() => goTo(path)}><Icon size={21} /><span>{label}</span></button>
      ))}
    </nav>
  )
}

const lessonIcons = [BrainCircuit, History, Bot, Layers3, Target, ImageIcon, Code2]
const lessonSides = ['center', 'right', 'left', 'center', 'left', 'right', 'center'] as const
const focusOptions = [
  { id: 'coding' as const, label: 'Coding', icon: Code2, copy: 'Build, debug, test, and ship software with AI.' },
  { id: 'research' as const, label: 'Research', icon: Search, copy: 'Find, evaluate, synthesize, and present evidence.' },
  { id: 'automation' as const, label: 'Automation', icon: Workflow, copy: 'Design reliable workflows with safe human review.' },
]

function Checkpoint({ lesson, index, completed, unlocked, unavailable = false, detail }: { lesson: LessonContent; index: number; completed: boolean; unlocked: boolean; unavailable?: boolean; detail?: string }) {
  const Icon = lessonIcons[index % lessonIcons.length]
  const state = unavailable ? 'skipped' : completed ? 'complete' : unlocked ? 'active' : 'locked'
  return (
    <div className={`checkpoint-row ${lessonSides[index % lessonSides.length]}`}>
      <button className={`checkpoint ${state} ${lesson.color}`} disabled={!unlocked || unavailable} onClick={() => goTo(`/lesson/${lesson.id}`)} aria-label={`${lesson.title}, ${state}`}>
        <span className="checkpoint-ring"><span className="checkpoint-face">{unavailable ? <Check size={27} /> : completed ? <Check size={29} strokeWidth={3.2} /> : unlocked ? <Icon size={27} /> : <LockKeyhole size={25} />}</span></span>
        {!completed && unlocked && !unavailable && <span className="start-flag">START</span>}
      </button>
      <div className={`lesson-label ${(unlocked && !completed) || unavailable ? 'show' : ''}`}>
        <span>{unavailable ? 'Unavailable · reward granted' : `${lesson.difficulty} · ${lesson.xp} XP · ${lesson.gems} gems`}</span><strong>{detail ?? lesson.shortTitle}</strong><small>{lesson.duration}</small>
      </div>
    </div>
  )
}

function Dashboard({ user, profile, completions, route }: { user: User; profile: UserProfile; completions: string[]; route: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [focusTrack, setFocusTrack] = useState<FocusTrack | null>(profile.focusTrack ?? null)
  const [savingTrack, setSavingTrack] = useState(false)
  const level = progressFromXp(profile.xp)
  const basicsDone = sectionOneLessons.every((lesson) => completions.includes(lesson.id))
  const modelSectionDone = sectionTwoLessons.every((lesson) => completions.includes(lesson.id))
  const promptsDone = promptLessons.every((lesson) => completions.includes(lesson.id))
  const usageDone = adaptiveUsageLessons.every((lesson) => completions.includes(lesson.id)) && promptsDone
  const chosenModel = getModelChoice(profile.chosenModel)
  const focusSections = focusTrack ? trackSections[focusTrack] : []
  const visibleLessons = [...sectionOneLessons, ...sectionTwoLessons, ...promptLessons, ...adaptiveUsageLessons, ...focusSections.flatMap((section) => section.lessons)]
  const visibleCompleted = visibleLessons.filter((lesson) => completions.includes(lesson.id)).length
  const progress = (visibleCompleted / visibleLessons.length) * 100

  useEffect(() => {
    if (profile.focusTrack) setFocusTrack(profile.focusTrack)
  }, [profile.focusTrack])

  const chooseFocusTrack = async (track: FocusTrack) => {
    setFocusTrack(track)
    setSavingTrack(true)
    try {
      await saveFocusTrack(user, track)
    } finally {
      setSavingTrack(false)
    }
  }

  useGSAP(() => {
    gsap.from('.course-hero', { y: 24, opacity: 0, duration: 0.75, ease: 'power3.out' })
    gsap.from('.checkpoint-row', { y: 35, opacity: 0, stagger: 0.12, duration: 0.65, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.trail-wrap', start: 'top 80%' } })
    gsap.to('.checkpoint.active .checkpoint-ring', { y: -6, repeat: -1, yoyo: true, duration: 0.82, ease: 'sine.inOut' })
    gsap.to('.hero-art', { y: 45, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.course-hero', start: 'top top+=80', end: 'bottom top', scrub: 1 } })
    gsap.utils.toArray<HTMLElement>('.adaptive-usage-group').forEach((group, index) => {
      gsap.from(group, { y: 55, rotate: index % 2 ? 1.2 : -1.2, opacity: .25, ease: 'none', scrollTrigger: { trigger: group, start: 'top 92%', end: 'top 62%', scrub: .7 } })
    })
    gsap.utils.toArray<HTMLElement>('.track-section-card').forEach((card) => {
      gsap.from(card, { y: 70, scale: .96, opacity: .25, ease: 'none', scrollTrigger: { trigger: card, start: 'top 92%', end: 'top 56%', scrub: .7 } })
    })
  }, { scope: root, dependencies: [focusTrack] })

  return (
    <div className="app" ref={root}>
      <Sidebar user={user} profile={profile} route={route} />
      <div className="workspace">
        <Topbar profile={profile} />
        <div className="content-grid">
          <main className="learning-main">
            <section className="course-hero">
              <div className="hero-copy">
                <p className="course-kicker">Begin your journey</p>
                <h1>Understand AI.<br />Start with the basics.</h1>
                <p>Meet artificial intelligence, explore where it came from, and learn how models like LLMs work.</p>
                <div className="hero-progress">
                <div className="progress-copy"><span>Your current path</span><strong>{visibleCompleted} of {visibleLessons.length} lessons</strong></div>
                  <div className="progress-track"><span style={{ width: `${Math.max(4, progress)}%` }} /></div>
                </div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <span className="hero-bubble question">What is AI?</span>
                <span className="hero-bubble answer"><Sparkles size={16} /> Let’s find out</span>
                <AiMascot />
                <div className="orbit one" /><div className="orbit two" />
              </div>
            </section>
            <section className="path-section" aria-label="AI basics lessons">
              <div className="path-heading"><div><p>Your learning path</p><h2>AI basics</h2></div><span className="section-count">3 lessons · 22 min</span></div>
              <div className="reward-tier-guide" aria-label="Lesson reward tiers">
                {Object.entries(rewardTiers).map(([difficulty, reward]) => <div key={difficulty}><span>{difficulty}</span><strong>{reward.xp} XP</strong><small>{reward.gems} gems</small></div>)}
              </div>
              <div className="trail-wrap">
                <svg className="trail-line" viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden="true"><path d="M200 62 C200 130 292 142 292 270 S108 374 108 500" /></svg>
                <div className="lesson-list">
                  {sectionOneLessons.map((lesson, index) => {
                    const completed = completions.includes(lesson.id)
                    const unlocked = index === 0 || completions.includes(sectionOneLessons[index - 1].id) || completed
                    return <Checkpoint key={lesson.id} lesson={lesson} index={index} completed={completed} unlocked={unlocked} />
                  })}
                </div>
              </div>
              <div className={`section-gate ${basicsDone ? 'open' : ''}`}><div className="gate-line" /><div className="gate-card"><span className="gate-icon">{basicsDone ? <Sparkles size={22} /> : <LockKeyhole size={22} />}</span><div><span>{basicsDone ? 'Section unlocked' : 'Complete AI basics'}</span><strong>Choose your AI toolkit</strong></div><div className="gate-progress">{sectionOneLessons.filter((lesson) => completions.includes(lesson.id)).length} / 3</div></div><div className="gate-line" /></div>
              <div className={`second-section ${basicsDone ? '' : 'section-locked'}`}>
                <div className="path-heading"><div><p>Section two</p><h2>Choose your AI toolkit</h2></div><span className="section-count">4 lessons · 28 min</span></div>
                <p className="section-intro">Meet the leading choices, find your best fit, then follow setup lessons shaped around your decision.</p>
                <div className="trail-wrap second-trail">
                  <svg className="trail-line" viewBox="0 0 400 760" preserveAspectRatio="none" aria-hidden="true"><path d="M200 62 C200 130 104 176 112 274 S298 376 288 480 S190 610 200 704" /></svg>
                  <div className="lesson-list">
                    {sectionTwoLessons.map((lesson, localIndex) => {
                      const index = localIndex + sectionOneLessons.length
                      const completed = completions.includes(lesson.id)
                      const previous = localIndex === 0 ? null : sectionTwoLessons[localIndex - 1]
                      const unlocked = basicsDone && (localIndex === 0 || !!previous && completions.includes(previous.id) || completed)
                      const method = lesson.installMethod
                      const unavailable = !!(method && chosenModel && !chosenModel[method].available && completed)
                      const detail = method && chosenModel ? `${method === 'gui' ? 'Desktop' : 'CLI'}: ${chosenModel.name}` : undefined
                      return <Checkpoint key={lesson.id} lesson={lesson} index={index} completed={completed} unlocked={unlocked} unavailable={unavailable} detail={detail} />
                    })}
                  </div>
                </div>
              </div>
              <div className={`section-gate ${modelSectionDone ? 'open' : ''}`}><div className="gate-line" /><div className="gate-card"><span className="gate-icon">{modelSectionDone ? <Sparkles size={22} /> : <LockKeyhole size={22} />}</span><div><span>{modelSectionDone ? 'Section unlocked' : 'Finish your model setup'}</span><strong>Use AI and write clean prompts</strong></div><div className="gate-progress">{sectionTwoLessons.filter((lesson) => completions.includes(lesson.id)).length} / 4</div></div><div className="gate-line" /></div>
              <div className={`prompt-section ${modelSectionDone ? '' : 'section-locked'}`}>
                <div className="path-heading"><div><p>Prompting skills</p><h2>Use AI with intention</h2></div><span className="section-count">5 lessons · 36 min</span></div>
                <p className="section-intro">Learn a practical ask, review, and refine loop. Then build prompts that give AI a clear job, useful context, and safe boundaries.</p>
                <div className="trail-wrap prompt-trail">
                  <svg className="trail-line" viewBox="0 0 400 940" preserveAspectRatio="none" aria-hidden="true"><path d="M200 62 C200 142 302 170 290 282 S100 390 112 502 S300 612 286 724 S180 850 200 890" /></svg>
                  <div className="lesson-list">
                    {promptLessons.map((lesson, localIndex) => {
                      const completed = completions.includes(lesson.id)
                      const previous = localIndex === 0 ? null : promptLessons[localIndex - 1]
                      const unlocked = modelSectionDone && (localIndex === 0 || !!previous && completions.includes(previous.id) || completed)
                      return <Checkpoint key={lesson.id} lesson={lesson} index={sectionOneLessons.length + sectionTwoLessons.length + localIndex} completed={completed} unlocked={unlocked} />
                    })}
                  </div>
                </div>

                <div className={`adaptive-usage-lab ${promptsDone ? 'ready' : 'section-locked'}`}>
                  <div className="adaptive-usage-intro">
                    <div><p>Chosen toolkit</p><h2>{chosenModel?.name ?? 'Your AI'} workspace skills</h2></div>
                    <span>9 adaptive lessons</span>
                    <p>These checkpoints use the real skill, project-instruction, and extension conventions for {chosenModel?.name ?? 'the AI you choose'}.</p>
                  </div>
                  <div className="adaptive-usage-stack">
                    {adaptiveUsageGroups.map((group, groupIndex) => {
                      const previousGroup = groupIndex === 0 ? null : adaptiveUsageGroups[groupIndex - 1]
                      const groupUnlocked = promptsDone && (groupIndex === 0 || !!previousGroup && previousGroup.lessons.every((lesson) => completions.includes(lesson.id)))
                      const groupCompleted = group.lessons.every((lesson) => completions.includes(lesson.id))
                      return <article className={`adaptive-usage-group ${groupUnlocked ? '' : 'section-locked'}`} key={group.id}>
                        <div className="adaptive-group-heading">
                          <div><p>{groupCompleted ? 'Trail complete' : groupUnlocked ? group.eyebrow : 'Finish the trail above'}</p><h3>{group.title}</h3><span>{group.description}</span></div>
                          <strong>{group.lessons.filter((lesson) => completions.includes(lesson.id)).length}/3</strong>
                        </div>
                        <div className="trail-wrap adaptive-trail">
                          <svg className="trail-line" viewBox="0 0 400 560" preserveAspectRatio="none" aria-hidden="true"><path d="M200 62 C200 130 292 142 292 270 S108 374 108 500" /></svg>
                          <div className="lesson-list">
                            {group.lessons.map((lesson, localIndex) => {
                              const completed = completions.includes(lesson.id)
                              const previous = localIndex === 0 ? null : group.lessons[localIndex - 1]
                              const unlocked = groupUnlocked && (localIndex === 0 || !!previous && completions.includes(previous.id) || completed)
                              const adaptiveLesson = chosenModel ? makeAdaptiveUsageLesson(lesson, chosenModel) : lesson
                              const iconIndex = sectionOneLessons.length + sectionTwoLessons.length + promptLessons.length + groupIndex * 3 + localIndex
                              return <Checkpoint key={lesson.id} lesson={adaptiveLesson} index={iconIndex} completed={completed} unlocked={unlocked} />
                            })}
                          </div>
                        </div>
                      </article>
                    })}
                  </div>
                </div>
              </div>

              <div className={`focus-choice ${usageDone ? 'ready' : 'locked'}`}>
                <div className="focus-choice-copy"><p className="course-kicker">Shape the trail around your goal</p><h2>What will you use AI for?</h2><p>Pick a direction to reveal four complete sections. You can switch paths whenever your goal changes.</p></div>
                <nav className="track-navbar" aria-label="Choose an AI learning focus">
                  {focusOptions.map(({ id, label, icon: Icon, copy }) => <button className={focusTrack === id ? 'active' : ''} key={id} disabled={!usageDone || savingTrack} onClick={() => chooseFocusTrack(id)}><Icon size={24} /><span><strong>{label}</strong><small>{copy}</small></span>{focusTrack === id && <Check size={20} />}</button>)}
                </nav>
                {!usageDone && <div className="focus-lock"><LockKeyhole size={18} /> Complete all fourteen AI usage lessons to choose a specialist path.</div>}
              </div>

              {usageDone && focusTrack && <div className="track-paths" key={focusTrack}>
                <div className="track-path-intro"><div><p>{focusOptions.find((option) => option.id === focusTrack)?.label} path</p><h2>Four chapters. One practical skill stack.</h2></div><div className="track-marquee"><div><span>Learn</span><i /><span>Practice</span><i /><span>Review</span><i /><span>Ship</span><i /><span>Learn</span><i /><span>Practice</span></div></div></div>
                {focusSections.map((section, sectionIndex) => {
                  const previousSection = sectionIndex === 0 ? null : focusSections[sectionIndex - 1]
                  const sectionUnlocked = sectionIndex === 0 || !!previousSection && previousSection.lessons.every((lesson) => completions.includes(lesson.id))
                  const sectionCompleted = section.lessons.every((lesson) => completions.includes(lesson.id))
                  return <article className={`track-section-card ${sectionUnlocked ? '' : 'section-locked'}`} key={section.id}>
                    <div className="track-card-heading"><div><p>{sectionCompleted ? 'Chapter complete' : sectionUnlocked ? 'Ready to learn' : 'Finish the chapter above'}</p><h3>{section.title}</h3><span>{section.description}</span></div><strong>{section.lessons.filter((lesson) => completions.includes(lesson.id)).length}/4</strong></div>
                    <div className="trail-wrap track-trail">
                      <svg className="trail-line" viewBox="0 0 400 760" preserveAspectRatio="none" aria-hidden="true"><path d="M200 62 C200 130 104 176 112 274 S298 376 288 480 S190 610 200 704" /></svg>
                      <div className="lesson-list">
                        {section.lessons.map((lesson, localIndex) => {
                          const completed = completions.includes(lesson.id)
                          const previous = localIndex === 0 ? null : section.lessons[localIndex - 1]
                          const unlocked = sectionUnlocked && (localIndex === 0 || !!previous && completions.includes(previous.id) || completed)
                          const iconIndex = 12 + sectionIndex * 4 + localIndex
                          return <Checkpoint key={lesson.id} lesson={lesson} index={iconIndex} completed={completed} unlocked={unlocked} />
                        })}
                      </div>
                    </div>
                  </article>
                })}
              </div>}
            </section>
          </main>
          <aside className="right-rail">
            <div className="daily-card">
              <div className="card-title"><div><p>Level {profile.level}</p><strong>{profile.rank}</strong></div><span>{level.current} / {level.needed} XP</span></div>
              <div className="daily-progress"><span style={{ width: `${Math.max(4, level.percent)}%` }} /></div>
              <p className="subtle">{level.needed - level.current} XP until your next level.</p>
            </div>
            <div className="tip-card">
              <div className="tip-visual"><AiMascot small /><Sparkles size={19} /></div>
              <p>Today’s field note</p><h3>AI finds patterns.</h3>
              <span>It can produce impressive results without thinking or understanding exactly like a person.</span>
              <button onClick={() => goTo(`/lesson/${sectionOneLessons[0].id}`)}>Start learning <ArrowRight size={16} /></button>
            </div>
            <div className="marquee" aria-label="Course topics"><div className="marquee-track"><span>Basics</span><i /><span>History</span><i /><span>Models</span><i /><span>Prompts</span><i /><span>Basics</span><i /><span>History</span></div></div>
          </aside>
        </div>
      </div>
      <BottomNav route={route} />
    </div>
  )
}

function LessonIllustration({ visual }: { visual: LessonVisual }) {
  if (visual === 'examples') return <div className="example-grid"><span><Mail /><b>Write</b></span><span><BookOpen /><b>Explain</b></span><span><Code2 /><b>Code</b></span><span><CalendarDays /><b>Organize</b></span></div>
  if (visual === 'patterns') return <div className="pattern-visual"><span className="pattern-card one">DATA</span><span className="pattern-card two">PATTERN</span><span className="pattern-card three">ANSWER</span><div className="pattern-alert"><AlertTriangle size={19} /> Check the result</div></div>
  if (visual === 'prompts') return <div className="prompt-visual"><span className="prompt-bubble user">Explain this simply and use an example.</span><span className="prompt-bubble ai"><Lightbulb size={18} /> Clear prompt, useful answer.</span><AiMascot small /></div>
  if (visual === 'judgment') return <div className="judgment-visual"><div className="shield-orbit"><ShieldCheck size={70} /></div><span className="orbit-label health">Health</span><span className="orbit-label finance">Finance</span><span className="orbit-label law">Law</span><span className="orbit-label privacy">Privacy</span></div>
  if (visual === 'history') return <div className="history-visual"><span className="history-year">1950</span><div className="turing-card"><BrainCircuit size={42} /><b>Can machines think?</b><small>Alan Turing</small></div><span className="history-line" /></div>
  if (visual === 'winter') return <div className="winter-visual"><div className="winter-chart"><i /><i /><i /><i /><i /></div><span>High hopes</span><ArrowRight size={22} /><strong>AI winter</strong></div>
  if (visual === 'growth') return <div className="growth-visual"><span className="growth-node a" /><span className="growth-node b" /><span className="growth-node c" /><span className="growth-node d" /><svg viewBox="0 0 300 260"><path d="M40 205 C88 186 86 124 139 147 S206 65 265 43" /></svg><strong>More data + faster computers</strong></div>
  if (visual === 'model') return <div className="model-visual"><span className="model-layer back"><ImageIcon /></span><span className="model-layer middle"><MessageSquareText /></span><span className="model-layer front"><BrainCircuit /></span><b>AI model</b></div>
  if (visual === 'tokens') return <div className="token-visual"><p><span>Large</span><span>language</span><span>models</span><span>predict</span><span>tokens</span></p><div className="next-token"><Sparkles size={19} /><b>next</b></div></div>
  return <div className="intro-visual"><span className="float-skill language"><MessageSquareText size={18} /> Language</span><span className="float-skill images"><ImageIcon size={18} /> Images</span><span className="float-skill ideas"><Sparkles size={18} /> Ideas</span><AiMascot /></div>
}

type RewardResult = { alreadyCompleted: boolean; oldLevel: number; newLevel: number }

function ModelChooserPage({ user, completed }: { user: User; completed: boolean }) {
  const root = useRef<HTMLElement>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [recommended, setRecommended] = useState<ModelChoice | null>(null)
  const [selected, setSelected] = useState<ModelId | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const answered = Object.keys(answers).length

  useGSAP(() => {
    gsap.from('.chooser-word', { yPercent: 110, opacity: 0, stagger: .07, duration: .75, ease: 'power3.out' })
    gsap.from('.question-card', { y: 35, opacity: 0, stagger: .1, duration: .65, ease: 'back.out(1.3)' })
  }, { scope: root })

  const revealMatch = () => {
    const match = recommendModel(answers)
    setRecommended(match)
    setSelected(match.id)
    requestAnimationFrame(() => document.querySelector('.model-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const confirmChoice = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const choice = getModelChoice(selected)!
      const chooserLesson = getLesson('choose-your-model')!
      await saveChosenModel(user, selected)
      await completeLesson(user, chooserLesson)
      for (const method of ['gui', 'cli'] as const) {
        if (!choice[method].available) await completeLesson(user, getLesson(`install-${method}`)!)
      }
      goTo('/')
    } catch (reason) {
      setError((reason as Error).message || 'Your choice could not be saved.')
      setSaving(false)
    }
  }

  return (
    <main className="chooser-page" ref={root}>
      <header className="lesson-route-top">
        <button className="lesson-exit" onClick={() => goTo('/')} aria-label="Quit lesson"><X size={22} /></button>
        <div className="lesson-route-progress"><span style={{ width: `${Math.max(5, (answered / chooserQuestions.length) * 100)}%` }} /></div>
        <div className="lesson-route-reward"><Target size={16} /> Personal match <Zap size={16} /> {getLesson('choose-your-model')!.xp} XP</div>
      </header>
      <section className="chooser-intro">
        <div className="chooser-heading"><p className="course-kicker">Model match</p><h1><span className="chooser-word">Your work.</span><span className="chooser-word">Your rules.</span><span className="chooser-word accent">Your AI.</span></h1><p>Four quick choices create a starting recommendation. You make the final call.</p></div>
        <div className="chooser-mascot"><span className="match-badge">{answered}/4 answered</span><AiMascot /></div>
      </section>
      <section className="question-board" aria-label="AI model matching questions">
        {chooserQuestions.map((question) => (
          <article className="question-card" key={question.id}>
            <h2>{question.title}</h2>
            <div className="question-options">
              {question.options.map((option, optionIndex) => <button className={answers[question.id] === optionIndex ? 'selected' : ''} onClick={() => setAnswers((current) => ({ ...current, [question.id]: optionIndex }))} key={option.label}><span>{String.fromCharCode(65 + optionIndex)}</span>{option.label}{answers[question.id] === optionIndex && <Check size={17} />}</button>)}
            </div>
          </article>
        ))}
      </section>
      {!recommended && <div className="match-action"><button className="continue-button" disabled={answered !== chooserQuestions.length} onClick={revealMatch}>Find my model <Sparkles size={19} /></button><small>Recommendation only. You can override it next.</small></div>}
      {recommended && <section className="model-result">
        <div className="result-copy"><p className="course-kicker">Your recommended starting point</p><h2>{recommended.name}</h2><p>{recommended.short}</p><div className="best-for">{recommended.bestFor.map((item) => <span key={item}>{item}</span>)}</div><small>{recommended.caution}</small></div>
        <div className="model-picker"><p>Want a different one? Choose any model.</p><div className="model-accordion">{modelChoices.map((model) => <button className={selected === model.id ? 'selected' : ''} style={{ '--model-tone': model.tone } as CSSProperties} onClick={() => setSelected(model.id)} key={model.id}><span>{model.provider}</span><strong>{model.name}</strong><small>{model.bestFor[0]}</small>{selected === model.id && <Check size={20} />}</button>)}</div></div>
        {error && <div className="auth-error" role="alert">{error}</div>}
        <button className="continue-button confirm-model" onClick={confirmChoice} disabled={saving}>{saving ? <LoaderCircle className="loading-spinner" size={19} /> : completed ? 'Keep this choice' : 'Choose this model'} {!saving && <ArrowRight size={19} />}</button>
      </section>}
    </main>
  )
}

function UnavailableLessonPage({ model, method }: { model: ModelChoice; method: InstallMethod }) {
  return <main className="unavailable-page"><button className="lesson-exit" onClick={() => goTo('/')}><X size={22} /></button><div className="unavailable-icon"><Check size={42} /></div><p className="course-kicker">Checkpoint skipped safely</p><h1>No official {method === 'gui' ? 'desktop app' : 'CLI'} for {model.name}.</h1><p>This checkpoint is greyed out and its XP and gems were granted automatically. You do not need to install an unofficial substitute.</p><button className="continue-button" onClick={() => goTo('/')}>Back to the trail <ArrowRight size={19} /></button></main>
}

function LessonPage({ user, lesson, completed }: { user: User; lesson: LessonContent; completed: boolean }) {
  const [step, setStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answerState, setAnswerState] = useState<'idle' | 'wrong' | 'correct'>('idle')
  const [claiming, setClaiming] = useState(false)
  const [reward, setReward] = useState<RewardResult | null>(null)
  const [error, setError] = useState('')
  const atQuiz = step === lesson.slides.length
  const totalSteps = lesson.slides.length + 1
  const slide = lesson.slides[Math.min(step, lesson.slides.length - 1)]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [step])

  const chooseAnswer = (index: number) => {
    if (answerState === 'correct') return
    setSelectedAnswer(index)
    setAnswerState(index === lesson.quiz.correctIndex ? 'correct' : 'wrong')
  }

  const claimReward = async () => {
    setClaiming(true)
    setError('')
    try {
      setReward(await completeLesson(user, lesson))
    } catch (reason) {
      setError((reason as Error).message || 'Rewards could not be saved. Please try again.')
    } finally {
      setClaiming(false)
    }
  }

  if (reward) {
    const leveledUp = reward.newLevel > reward.oldLevel
    return (
      <main className="reward-page">
        <div className="reward-burst"><i /><i /><i /><i /><i /><i /></div>
        <AiMascot />
        <p className="course-kicker">{reward.alreadyCompleted ? 'Practice complete' : 'Lesson complete'}</p>
        <h1>{leveledUp ? `Level ${reward.newLevel} unlocked.` : 'Trail progress saved.'}</h1>
        <p>{reward.alreadyCompleted ? 'You already earned this lesson’s rewards, but practice always makes the path easier.' : `You finished ${lesson.title} and passed the quiz.`}</p>
        {!reward.alreadyCompleted && <div className="reward-payout"><span><Zap size={23} /> +{lesson.xp} XP</span><span><Gem size={23} /> +{lesson.gems} gems</span></div>}
        {leveledUp && <div className="rank-unlock"><Crown size={25} /><div><span>New rank</span><strong>{rankFromLevel(reward.newLevel).name}</strong></div></div>}
        <button className="continue-button reward-home" onClick={() => goTo('/')}>Back to learning path <ArrowRight size={19} /></button>
      </main>
    )
  }

  return (
    <main className="lesson-page">
      <header className="lesson-route-top">
        <button className="lesson-exit" onClick={() => goTo('/')} aria-label="Quit lesson"><X size={22} /></button>
        <div className="lesson-route-progress" aria-label={`Lesson progress ${step + 1} of ${totalSteps}`}><span style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
        <div className="lesson-route-reward"><span className="difficulty-tier">{lesson.difficulty}</span><Zap size={16} /> {lesson.xp} XP <Gem size={16} /> {lesson.gems}</div>
      </header>

      {!atQuiz ? (
        <section className="lesson-sheet lesson-route-sheet" key={`${lesson.id}-${step}`}>
          <div className={`lesson-art-panel ${slide.visual}`}><LessonIllustration visual={slide.visual} /></div>
          <div className="lesson-reading">
            <div className="lesson-count">{step + 1} / {lesson.slides.length}</div>
            <h1>{slide.title}</h1><p>{slide.body}</p>
            {step === 0 && lesson.sourceUrl && <a className="official-source" href={lesson.sourceUrl} target="_blank" rel="noreferrer"><ShieldCheck size={18} /> Open official source <ArrowRight size={17} /></a>}
            <div className="lesson-actions">
              <button className="back-button" onClick={() => setStep((value) => value - 1)} disabled={step === 0} aria-label="Previous lesson card"><ArrowLeft size={19} /></button>
              <button className="continue-button" onClick={() => setStep((value) => value + 1)}>Continue <ArrowRight size={19} /></button>
            </div>
          </div>
        </section>
      ) : (
        <section className="lesson-sheet lesson-route-sheet quiz-sheet">
          <div className="lesson-art-panel quiz-art"><span className="quiz-float"><Award size={20} /> Final challenge</span><AiMascot /><div className="quiz-orbit"><span>A</span><span>B</span><span>C</span><span>D</span></div></div>
          <div className="lesson-reading quiz-reading">
            <div className="lesson-count">Quiz</div>
            <h1>{lesson.quiz.question}</h1>
            <div className="answer-grid">
              {lesson.quiz.options.map((option, index) => {
                const selected = selectedAnswer === index
                const stateClass = selected ? answerState : answerState === 'correct' && index === lesson.quiz.correctIndex ? 'correct' : ''
                return <button className={`answer-option ${stateClass}`} onClick={() => chooseAnswer(index)} key={option} disabled={answerState === 'correct'}><span>{String.fromCharCode(65 + index)}</span>{option}{stateClass === 'correct' && <Check size={19} />}</button>
              })}
            </div>
            {answerState === 'wrong' && <div className="quiz-feedback wrong"><RotateCcw size={18} /><span><strong>Not quite.</strong> Try another answer.</span></div>}
            {answerState === 'correct' && <div className="quiz-feedback correct"><Check size={18} /><span><strong>Correct.</strong> {lesson.quiz.explanation}</span></div>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            <div className="lesson-actions">
              <button className="back-button" onClick={() => { setStep(lesson.slides.length - 1); setAnswerState('idle'); setSelectedAnswer(null) }} aria-label="Previous lesson card"><ArrowLeft size={19} /></button>
              <button className="continue-button" onClick={claimReward} disabled={answerState !== 'correct' || claiming}>{claiming ? <LoaderCircle className="loading-spinner" size={19} /> : completed ? 'Finish practice' : `Claim ${lesson.xp} XP`} {!claiming && <ArrowRight size={19} />}</button>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}

function ProfilePage({ user, profile, completions, route }: { user: User; profile: UserProfile; completions: string[]; route: string }) {
  const root = useRef<HTMLDivElement>(null)
  const progress = progressFromXp(profile.xp)

  useGSAP(() => {
    gsap.from('.rank-family-card', {
      y: 45,
      scale: .92,
      opacity: .2,
      stagger: .08,
      duration: .7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.rank-ladder', start: 'top 86%' },
    })
    gsap.from('.rank-family-card .rank-medallion', {
      scale: .72,
      opacity: .35,
      stagger: .07,
      ease: 'none',
      scrollTrigger: { trigger: '.rank-ladder', start: 'top 90%', end: 'bottom 65%', scrub: .6 },
    })
  }, { scope: root })

  return (
    <div className="app" ref={root}>
      <Sidebar user={user} profile={profile} route={route} />
      <div className="workspace profile-workspace">
        <Topbar profile={profile} />
        <main className="profile-page">
          <section className="profile-hero">
            <div className="profile-identity">
              {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : <div className="profile-avatar-fallback">{profile.displayName.slice(0, 2).toUpperCase()}</div>}
              <div><p>Your learner profile</p><h1>{profile.displayName}</h1><span>{profile.rank} · Level {profile.level}</span></div>
            </div>
            <div className="profile-actions"><button className="secondary-action" onClick={() => goTo('/settings')}><Settings size={18} /> Settings</button><button className="signout-button" onClick={() => signOut()}><LogOut size={18} /> Sign out</button></div>
          </section>
          <section className="profile-stats">
            <div><Zap size={23} /><span>Total XP</span><strong>{profile.xp}</strong></div>
            <div><Gem size={23} /><span>Gems</span><strong>{profile.gems}</strong></div>
            <div><BookOpen size={23} /><span>Lessons</span><strong>{completions.length}</strong></div>
          </section>
          <section className="level-card">
            <div><p>Level {profile.level} progress</p><strong>{progress.current} / {progress.needed} XP</strong></div>
            <div className="level-track"><span style={{ width: `${progress.percent}%` }} /></div>
            <small>{progress.needed - progress.current} XP to level {profile.level + 1}</small>
          </section>
          <section className="rank-section">
            <div className="path-heading"><div><p>Your mineral league</p><h2>Forty ranks. One climb.</h2></div><span className="section-count">8 minerals · 5 divisions each</span></div>
            <div className="rank-ladder">
              {rankFamilies.map((family) => {
                const firstLevel = family.ranks[0].minLevel
                const lastLevel = family.ranks[family.ranks.length - 1].minLevel
                const active = family.ranks.some((rank) => rank.name === profile.rank)
                const unlocked = profile.level >= firstLevel
                return <article className={`rank-family-card ${unlocked ? 'unlocked' : ''} ${active ? 'active' : ''}`} key={family.name} style={{ '--rank-tone': family.tone } as CSSProperties}>
                  <span className="rank-medallion">{unlocked ? <Award size={27} /> : <LockKeyhole size={22} />}</span>
                  <div className="rank-family-copy"><small>Levels {firstLevel}–{lastLevel}</small><strong>{family.name}</strong></div>
                  {active && <span className="current-rank">Current</span>}
                  <div className="division-strip">
                    {family.ranks.map((rank) => <span className={`${profile.level >= rank.minLevel ? 'passed' : ''} ${profile.rank === rank.name ? 'current' : ''}`} key={rank.name} title={`${rank.name} · Level ${rank.minLevel}`}>{rank.division}</span>)}
                  </div>
                </article>
              })}
            </div>
          </section>
        </main>
      </div>
      <BottomNav route={route} />
    </div>
  )
}

function SettingToggle({ checked, label, copy, onChange }: { checked: boolean; label: string; copy: string; onChange: (checked: boolean) => void }) {
  return <button className={`setting-toggle ${checked ? 'on' : ''}`} role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
    <span><strong>{label}</strong><small>{copy}</small></span>
    <i><b /></i>
  </button>
}

function SettingsPage({ user, profile, route }: { user: User; profile: UserProfile; route: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [preferences, setPreferences] = useState<UserPreferences>(profile.preferences ?? defaultPreferences)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [confirmingDeactivation, setConfirmingDeactivation] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setPreferences(profile.preferences ?? defaultPreferences), [profile.preferences])

  const updatePreference = async (next: UserPreferences) => {
    setPreferences(next)
    setSaveState('saving')
    setError('')
    try {
      await saveUserPreferences(user, next)
      setSaveState('saved')
    } catch (reason) {
      setSaveState('error')
      setError((reason as Error).message || 'Settings could not be saved.')
    }
  }

  const deactivate = async () => {
    setDeactivating(true)
    setError('')
    try {
      await deactivateProfile(user)
    } catch (reason) {
      setError((reason as Error).message || 'Profile could not be deactivated.')
      setDeactivating(false)
    }
  }

  useGSAP(() => {
    gsap.from('.settings-hero-copy > *', { y: 26, opacity: 0, stagger: .09, duration: .65, ease: 'power3.out' })
    gsap.from('.settings-card', { y: 55, scale: .92, opacity: .2, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.settings-grid', start: 'top 88%', end: 'top 48%', scrub: .7 } })
  }, { scope: root })

  return <div className="app" ref={root}>
    <Sidebar user={user} profile={profile} route={route} />
    <div className="workspace settings-workspace">
      <Topbar profile={profile} />
      <main className="settings-page">
        <section className="settings-hero">
          <div className="settings-hero-copy"><p>Make the trail yours</p><h1>Comfort, focus, and account control.</h1><span>Preferences follow your learner profile across sessions.</span></div>
          <div className="settings-hero-art" aria-hidden="true"><SlidersHorizontal size={82} /><i /><i /><i /></div>
        </section>

        <div className="settings-status" aria-live="polite">{saveState === 'saving' ? 'Saving changes...' : saveState === 'saved' ? 'Changes saved' : saveState === 'error' ? 'Save failed' : 'Changes save automatically'}</div>
        <section className="settings-grid">
          <article className="settings-card appearance-card">
            <div className="settings-card-heading"><span><Sun size={22} /></span><div><h2>Appearance</h2><p>Choose how Model Trail looks.</p></div></div>
            <div className="theme-switch" aria-label="Theme preference">
              {([
                { id: 'light' as const, label: 'Light', icon: Sun },
                { id: 'dark' as const, label: 'Dark', icon: Moon },
                { id: 'system' as const, label: 'System', icon: Monitor },
              ]).map(({ id, label, icon: Icon }) => <button className={preferences.theme === id ? 'active' : ''} key={id} onClick={() => updatePreference({ ...preferences, theme: id })}><Icon size={19} /><span>{label}</span></button>)}
            </div>
          </article>

          <article className="settings-card experience-card">
            <div className="settings-card-heading"><span><Volume2 size={22} /></span><div><h2>Learning experience</h2><p>Control feedback and movement.</p></div></div>
            <div className="setting-toggle-list">
              <SettingToggle checked={preferences.soundEnabled} label="Sound effects" copy="Hear short practice feedback tones." onChange={(soundEnabled) => updatePreference({ ...preferences, soundEnabled })} />
              <SettingToggle checked={preferences.reducedMotion} label="Reduce motion" copy="Minimize decorative movement and transitions." onChange={(reducedMotion) => updatePreference({ ...preferences, reducedMotion })} />
            </div>
          </article>

          <article className="settings-card language-card">
            <div className="settings-card-heading"><span><BookOpen size={22} /></span><div><h2>Language</h2><p>Course and interface language.</p></div></div>
            <div className="language-value"><div><strong>English</strong><small>All lessons and practice questions</small></div><span>Current</span></div>
          </article>

          <article className="settings-card account-card">
            <div className="settings-card-heading"><span><ShieldCheck size={22} /></span><div><h2>Account and privacy</h2><p>Control access without losing your learning history.</p></div></div>
            <div className="account-summary"><div><span>Signed in as</span><strong>{profile.email}</strong></div><button className="secondary-action" onClick={() => signOut()}><LogOut size={17} /> Sign out</button></div>
            <div className="danger-zone">
              <div><UserX size={22} /><span><strong>Deactivate profile</strong><small>Pause access. XP, gems, ranks, choices, and lesson progress stay saved.</small></span></div>
              {!confirmingDeactivation ? <button onClick={() => setConfirmingDeactivation(true)}>Deactivate</button> : <div className="deactivate-confirm"><p>You will be signed out. You can reactivate after signing in again.</p><div><button className="secondary-action" onClick={() => setConfirmingDeactivation(false)}>Cancel</button><button className="danger-button" onClick={deactivate} disabled={deactivating}>{deactivating ? <LoaderCircle className="loading-spinner" size={17} /> : 'Deactivate now'}</button></div></div>}
            </div>
          </article>
        </section>
        {error && <div className="auth-error settings-error" role="alert">{error}</div>}
      </main>
    </div>
    <BottomNav route={route} />
  </div>
}

function playPracticeTone(enabled: boolean, correct: boolean) {
  if (!enabled) return
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = correct ? 620 : 220
    oscillator.type = correct ? 'sine' : 'triangle'
    gain.gain.setValueAtTime(.055, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + .16)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + .16)
  } catch {
    // Sound feedback is optional; practice continues when audio is unavailable.
  }
}

type PracticeSession = { title: string; bank: PracticeQuestion[]; questions: PracticeQuestion[] }

function PracticePage({ user, profile, completions, route }: { user: User; profile: UserProfile; completions: string[]; route: string }) {
  const root = useRef<HTMLDivElement>(null)
  const model = getModelChoice(profile.chosenModel)
  const sections = useMemo(() => getPracticeSections(profile.focusTrack, model), [profile.focusTrack, model])
  const completedSet = useMemo(() => new Set(completions), [completions])
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const preferences = profile.preferences ?? defaultPreferences

  const startWithBank = (title: string, bank: PracticeQuestion[]) => {
    const questions = pickPracticeSession(bank)
    if (!questions.length) return
    setSession({ title, bank, questions })
    setQuestionIndex(0)
    setSelectedAnswer(null)
    setScore(0)
    setFinished(false)
    window.scrollTo(0, 0)
  }

  const startSection = (section: PracticeSection) => {
    const completedLessons = section.lessons.filter((lesson) => completedSet.has(lesson.id))
    startWithBank(section.title, buildQuestionBank({ ...section, lessons: completedLessons }))
  }

  const startGeneral = () => {
    const bank = sections.flatMap((section) => {
      const completedLessons = section.lessons.filter((lesson) => completedSet.has(lesson.id))
      return buildQuestionBank({ ...section, id: `general-${section.id}`, lessons: completedLessons })
    })
    startWithBank('General revision', bank)
  }

  const choosePracticeAnswer = (index: number) => {
    if (!session || selectedAnswer !== null) return
    const correct = index === session.questions[questionIndex].correctIndex
    setSelectedAnswer(index)
    if (correct) setScore((value) => value + 1)
    playPracticeTone(preferences.soundEnabled, correct)
  }

  const nextQuestion = () => {
    if (!session) return
    if (questionIndex === session.questions.length - 1) {
      setFinished(true)
      return
    }
    setQuestionIndex((value) => value + 1)
    setSelectedAnswer(null)
  }

  useGSAP(() => {
    gsap.from('.practice-hero-copy > *', { y: 28, opacity: 0, stagger: .09, duration: .65, ease: 'power3.out' })
    gsap.from('.practice-section-card', { y: 60, scale: .82, opacity: .18, stagger: .09, ease: 'none', scrollTrigger: { trigger: '.practice-section-grid', start: 'top 91%', end: 'top 48%', scrub: .7 } })
  }, { scope: root, dependencies: [session, finished] })

  if (session && !finished) {
    const question = session.questions[questionIndex]
    const answered = selectedAnswer !== null
    const correct = answered && selectedAnswer === question.correctIndex
    return <main className="practice-session-page" ref={root}>
      <header className="practice-session-top">
        <button className="lesson-exit" onClick={() => setSession(null)} aria-label="Quit practice"><X size={22} /></button>
        <div className="practice-progress"><span style={{ width: `${((questionIndex + 1) / session.questions.length) * 100}%` }} /></div>
        <strong>{questionIndex + 1} of {session.questions.length}</strong>
      </header>
      <section className="practice-question-shell" key={question.id}>
        <div className="practice-question-art"><Shuffle size={72} /><span>{session.title}</span><i /><i /></div>
        <div className="practice-question-copy">
          <p>Choose the best answer</p>
          <h1>{question.prompt}</h1>
          <div className="practice-answer-grid">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const isCorrect = answered && index === question.correctIndex
              const state = isCorrect ? 'correct' : isSelected ? 'wrong' : ''
              return <button className={state} key={`${question.id}-${index}`} onClick={() => choosePracticeAnswer(index)} disabled={answered}><span>{String.fromCharCode(65 + index)}</span><b>{option}</b>{isCorrect && <Check size={20} />}</button>
            })}
          </div>
          {answered && <div className={`practice-feedback ${correct ? 'correct' : 'wrong'}`}><strong>{correct ? 'Correct.' : 'Review this one.'}</strong><span>{question.explanation}</span></div>}
          <button className="continue-button practice-next" onClick={nextQuestion} disabled={!answered}>{questionIndex === session.questions.length - 1 ? 'See results' : 'Next question'} <ArrowRight size={19} /></button>
        </div>
      </section>
    </main>
  }

  if (session && finished) return <main className="practice-result-page" ref={root}>
    <div className="practice-result-orbit"><Target size={68} /><i /><i /><i /></div>
    <p>{session.title} complete</p>
    <h1>{score} out of {PRACTICE_SESSION_SIZE}</h1>
    <span>{score === PRACTICE_SESSION_SIZE ? 'Strong recall. Your answers were all correct.' : 'Good practice. Review missed ideas and try a fresh random set.'}</span>
    <div className="practice-result-actions"><button className="continue-button" onClick={() => startWithBank(session.title, session.bank)}><RotateCcw size={18} /> Practice again</button><button className="secondary-action" onClick={() => setSession(null)}>Choose another section</button></div>
  </main>

  const totalCompleted = sections.reduce((sum, section) => sum + section.lessons.filter((lesson) => completedSet.has(lesson.id)).length, 0)

  return <div className="app" ref={root}>
    <Sidebar user={user} profile={profile} route={route} />
    <div className="workspace practice-workspace">
      <Topbar profile={profile} />
      <main className="practice-page">
        <section className="practice-hero">
          <div className="practice-hero-copy"><p>Recall makes knowledge stick</p><h1>Practice the path you have earned.</h1><span>Choose a section or mix every completed lesson into one five-question revision.</span></div>
          <div className="practice-hero-art" aria-hidden="true"><Target size={105} /><span>5</span><i /><i /></div>
        </section>

        <section className="general-revision-card">
          <div><Shuffle size={28} /><span><strong>General revision</strong><small>Random questions from every section and lesson you have completed.</small></span></div>
          <div className="general-revision-meta"><span>{totalCompleted} completed lessons</span><b>{PRACTICE_SESSION_SIZE} questions</b></div>
          <button onClick={startGeneral} disabled={totalCompleted === 0}><Play size={18} fill="currentColor" /> Start mixed practice</button>
        </section>

        <section className="practice-library">
          <div className="practice-library-heading"><div><p>Focused review</p><h2>Choose a section</h2></div><span>{QUESTION_BANK_SIZE} questions in every section bank</span></div>
          <div className="practice-section-grid">
            {sections.map((section) => {
              const completedLessons = section.lessons.filter((lesson) => completedSet.has(lesson.id)).length
              const available = completedLessons > 0
              return <article className={`practice-section-card ${available ? '' : 'locked'}`} key={section.id}>
                <div className="practice-card-number">{completedLessons}/{section.lessons.length}</div>
                <div><h3>{section.title}</h3><p>{section.description}</p></div>
                <div className="practice-card-footer"><span>{available ? `${QUESTION_BANK_SIZE} question bank` : 'Complete a lesson to unlock'}</span><button disabled={!available} onClick={() => startSection(section)} aria-label={`Practice ${section.title}`}>{available ? <Play size={18} fill="currentColor" /> : <LockKeyhole size={18} />}</button></div>
              </article>
            })}
          </div>
        </section>
      </main>
    </div>
    <BottomNav route={route} />
  </div>
}

export default function App() {
  const route = useRoute()
  const { user, profile, completions, ready, error, setError } = useLearner()
  useAppliedPreferences(profile)

  if (!ready) return <LoadingScreen />
  if (!user) return <AuthScreen error={error} setError={setError} />
  if (!profile) return <LoadingScreen />
  if (profile.deactivated) return <DeactivatedScreen user={user} />

  if (route.startsWith('/lesson/')) {
    const lesson = getLesson(route.replace('/lesson/', ''))
    if (lesson?.kind === 'chooser') return <ModelChooserPage user={user} completed={completions.includes(lesson.id)} />
    if (lesson?.kind === 'install' && lesson.installMethod) {
      const model = getModelChoice(profile.chosenModel)
      if (!model) {
        goTo('/lesson/choose-your-model')
        return <LoadingScreen />
      }
      if (!model[lesson.installMethod].available) return <UnavailableLessonPage model={model} method={lesson.installMethod} />
      return <LessonPage user={user} lesson={makeInstallLesson(lesson, model, lesson.installMethod)} completed={completions.includes(lesson.id)} />
    }
    if (lesson?.kind === 'adaptive-usage') {
      const model = getModelChoice(profile.chosenModel)
      if (!model) {
        goTo('/lesson/choose-your-model')
        return <LoadingScreen />
      }
      return <LessonPage user={user} lesson={makeAdaptiveUsageLesson(lesson, model)} completed={completions.includes(lesson.id)} />
    }
    if (lesson) return <LessonPage user={user} lesson={lesson} completed={completions.includes(lesson.id)} />
  }

  if (route === '/profile') return <ProfilePage user={user} profile={profile} completions={completions} route={route} />
  if (route === '/practice') return <PracticePage user={user} profile={profile} completions={completions} route={route} />
  if (route === '/settings') return <SettingsPage user={user} profile={profile} route={route} />
  return <Dashboard user={user} profile={profile} completions={completions} route={route} />
}
