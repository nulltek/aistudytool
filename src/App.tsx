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
  Clock3,
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
  Mail,
  Menu,
  MessageSquareText,
  RotateCcw,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react'
import {
  completeLesson,
  ensureUserProfile,
  finishRedirectSignIn,
  saveChosenModel,
  signInWithGoogle,
  signOut,
  watchAuth,
  watchCompletions,
  watchProfile,
  type UserProfile,
} from './firebase'
import { getLesson, lessons, rewardTiers, sectionOneLessons, sectionTwoLessons, type LessonContent, type LessonVisual } from './lessonData'
import { chooserQuestions, getModelChoice, modelChoices, recommendModel, type InstallMethod, type ModelChoice, type ModelId } from './modelGuide'
import { progressFromXp, rankFamilies, rankFromLevel } from './progression'

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

  return { user, profile, completions, ready, error, setError }
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
  { label: 'Practice', icon: Target, path: '/' },
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
        <button className="nav-item"><Settings size={21} /><span>Settings</span></button>
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

function Checkpoint({ lesson, index, completed, unlocked, unavailable = false, detail }: { lesson: LessonContent; index: number; completed: boolean; unlocked: boolean; unavailable?: boolean; detail?: string }) {
  const Icon = lessonIcons[index]
  const state = unavailable ? 'skipped' : completed ? 'complete' : unlocked ? 'active' : 'locked'
  return (
    <div className={`checkpoint-row ${lessonSides[index]}`}>
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
  const progress = (completions.length / lessons.length) * 100
  const level = progressFromXp(profile.xp)
  const basicsDone = sectionOneLessons.every((lesson) => completions.includes(lesson.id))
  const chosenModel = getModelChoice(profile.chosenModel)

  useGSAP(() => {
    gsap.from('.course-hero', { y: 24, opacity: 0, duration: 0.75, ease: 'power3.out' })
    gsap.from('.checkpoint-row', { y: 35, opacity: 0, stagger: 0.12, duration: 0.65, ease: 'back.out(1.5)', scrollTrigger: { trigger: '.trail-wrap', start: 'top 80%' } })
    gsap.to('.checkpoint.active .checkpoint-ring', { y: -6, repeat: -1, yoyo: true, duration: 0.82, ease: 'sine.inOut' })
    gsap.to('.hero-art', { y: 45, opacity: 0.25, ease: 'none', scrollTrigger: { trigger: '.course-hero', start: 'top top+=80', end: 'bottom top', scrub: 1 } })
  }, { scope: root })

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
                <div className="progress-copy"><span>Course progress</span><strong>{completions.length} of {lessons.length} lessons</strong></div>
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

function makeInstallLesson(base: LessonContent, model: ModelChoice, method: InstallMethod): LessonContent {
  const guide = model[method]
  const methodName = method === 'gui' ? 'desktop app' : 'command-line tool'
  const visuals: LessonVisual[] = method === 'gui' ? ['model', 'examples', 'judgment'] : ['tokens', 'prompts', 'judgment']
  return {
    ...base,
    title: `Install ${model.name}'s ${methodName}`,
    shortTitle: `${method === 'gui' ? 'Desktop' : 'CLI'}: ${model.name}`,
    description: `A safe, guided setup for ${guide.label}.`,
    sourceUrl: guide.sourceUrl,
    slides: guide.steps.map((step, index) => ({ ...step, visual: visuals[index % visuals.length] })),
    quiz: {
      question: `Where should you get ${guide.label}?`,
      options: ['Its official website or documentation', 'A random download mirror', 'An email attachment from a stranger', 'A cracked software bundle'],
      correctIndex: 0,
      explanation: `Use the official ${model.provider} or tool website. This reduces the risk of fake or modified installers.`,
    },
  }
}

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
        {chooserQuestions.map((question, questionIndex) => (
          <article className="question-card" key={question.id}>
            <span className="question-number">0{questionIndex + 1}</span>
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

function LessonPage({ user, profile, lesson, completed }: { user: User; profile: UserProfile; lesson: LessonContent; completed: boolean }) {
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
            {step === 0 && lesson.sourceUrl && <a className="official-source" href={lesson.sourceUrl} target="_blank" rel="noreferrer"><ShieldCheck size={18} /> Open official setup source <ArrowRight size={17} /></a>}
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
            <button className="signout-button" onClick={() => signOut()}><LogOut size={18} /> Sign out</button>
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

export default function App() {
  const route = useRoute()
  const { user, profile, completions, ready, error, setError } = useLearner()

  if (!ready) return <LoadingScreen />
  if (!user) return <AuthScreen error={error} setError={setError} />
  if (!profile) return <LoadingScreen />

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
      return <LessonPage user={user} profile={profile} lesson={makeInstallLesson(lesson, model, lesson.installMethod)} completed={completions.includes(lesson.id)} />
    }
    if (lesson) return <LessonPage user={user} profile={profile} lesson={lesson} completed={completions.includes(lesson.id)} />
  }

  if (route === '/profile') return <ProfilePage user={user} profile={profile} completions={completions} route={route} />
  return <Dashboard user={user} profile={profile} completions={completions} route={route} />
}
