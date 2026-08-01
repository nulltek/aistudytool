import { makeAdaptiveUsageLesson } from './adaptiveUsage'
import {
  adaptiveUsageLessons,
  promptLessons,
  sectionOneLessons,
  sectionTwoLessons,
  trackSections,
  type FocusTrack,
  type LessonContent,
} from './lessonData'
import { makeInstallLesson, type ModelChoice } from './modelGuide'

export const QUESTION_BANK_SIZE = 100
export const PRACTICE_SESSION_SIZE = 5

export type PracticeQuestion = {
  id: string
  lessonId: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type PracticeSection = {
  id: string
  title: string
  description: string
  lessons: LessonContent[]
}

const explanationLeads = [
  'Which explanation best matches',
  'Choose the most accurate description of',
  'Which statement correctly explains',
  'Pick the clearest meaning of',
  'Which answer belongs with',
  'Find the correct explanation for',
  'Which description should you remember for',
  'Select the reliable summary of',
  'Which statement would pass a careful review of',
  'What does the course teach about',
]

const topicLeads = [
  'Which topic title best fits this explanation',
  'What idea is this passage teaching',
  'Which course concept matches this description',
  'Choose the heading that belongs above this explanation',
  'Which topic would help you find this idea again',
  'What is the clearest label for this course note',
  'Which concept is being described here',
  'Where does this explanation belong',
  'Which heading accurately summarizes this passage',
  'What should this study card be called',
]

const lessonLeads = [
  'Which lesson should you revisit for',
  'Where in this section would you review',
  'Which lesson owns the topic',
  'Choose the lesson connected to',
  'Which checkpoint teaches',
  'Where does this idea appear',
  'Which lesson title matches',
  'What lesson would help with',
  'Which course checkpoint covers',
  'Where should a learner look for',
]

const genericDistractors = [
  'Trust every confident answer without checking it.',
  'Give every tool unlimited access before testing it.',
  'Share passwords and private keys as prompt context.',
  'Use vague instructions and skip human review.',
]

function hashString(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function deterministicShuffle<T>(items: T[], seedText: string) {
  const result = [...items]
  let state = hashString(seedText) || 1
  for (let index = result.length - 1; index > 0; index -= 1) {
    state ^= state << 13
    state ^= state >>> 17
    state ^= state << 5
    const target = (state >>> 0) % (index + 1)
    ;[result[index], result[target]] = [result[target], result[index]]
  }
  return result
}

function shortened(value: string, limit = 178) {
  if (value.length <= limit) return value
  return `${value.slice(0, limit).trimEnd()}...`
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => shortened(value)).filter(Boolean))]
}

function makeOptions(correct: string, distractorPool: string[], seed: string) {
  const distractors = deterministicShuffle(
    uniqueValues(distractorPool).filter((item) => item !== shortened(correct)),
    `${seed}-distractors`,
  ).slice(0, 3)
  while (distractors.length < 3) {
    const fallback = genericDistractors.find((item) => item !== shortened(correct) && !distractors.includes(item))
    if (!fallback) break
    distractors.push(fallback)
  }
  const options = deterministicShuffle([shortened(correct), ...distractors], `${seed}-options`)
  return { options, correctIndex: options.indexOf(shortened(correct)) }
}

export function buildQuestionBank(section: PracticeSection): PracticeQuestion[] {
  const lessons = section.lessons.filter((lesson) => lesson.slides.length > 0 || lesson.quiz.question)
  const slides = lessons.flatMap((lesson) => lesson.slides.map((slide) => ({ lesson, slide })))
  const allBodies = slides.map(({ slide }) => slide.body)
  const allTitles = slides.map(({ slide }) => slide.title)
  const allLessonTitles = lessons.map((lesson) => lesson.title)
  const candidates: PracticeQuestion[] = []

  for (const lesson of lessons) {
    if (!lesson.quiz.question || lesson.quiz.options.length < 2) continue
    const original = lesson.quiz.options[lesson.quiz.correctIndex]
    const shuffled = deterministicShuffle(lesson.quiz.options, `${section.id}-${lesson.id}-quiz`)
    candidates.push({
      id: `${section.id}-${lesson.id}-quiz`,
      lessonId: lesson.id,
      prompt: `${lesson.quiz.question} Review it through "${lesson.title}."`,
      options: shuffled,
      correctIndex: shuffled.indexOf(original),
      explanation: lesson.quiz.explanation,
    })
  }

  for (const { lesson, slide } of slides) {
    for (let variant = 0; variant < 20; variant += 1) {
      const lead = explanationLeads[variant % explanationLeads.length]
      const ending = variant < 10 ? '?' : ' after a careful review?'
      const id = `${section.id}-${lesson.id}-${hashString(slide.title)}-meaning-${variant}`
      const { options, correctIndex } = makeOptions(slide.body, allBodies, id)
      candidates.push({ id, lessonId: lesson.id, prompt: `${lead} "${slide.title}" in "${lesson.title}"${ending}`, options, correctIndex, explanation: shortened(slide.body, 240) })
    }

    for (let variant = 0; variant < 20; variant += 1) {
      const lead = topicLeads[variant % topicLeads.length]
      const ending = variant < 10 ? '?' : ' in this section?'
      const id = `${section.id}-${lesson.id}-${hashString(slide.title)}-topic-${variant}`
      const { options, correctIndex } = makeOptions(slide.title, allTitles, id)
      candidates.push({ id, lessonId: lesson.id, prompt: `${lead} from "${lesson.title}": "${shortened(slide.body, 155)}"${ending}`, options, correctIndex, explanation: `The matching topic is "${slide.title}."` })
    }

    if (uniqueValues(allLessonTitles).length >= 2) {
      for (let variant = 0; variant < 10; variant += 1) {
        const lead = lessonLeads[variant % lessonLeads.length]
        const id = `${section.id}-${lesson.id}-${hashString(slide.title)}-lesson-${variant}`
        const { options, correctIndex } = makeOptions(lesson.title, allLessonTitles, id)
        candidates.push({ id, lessonId: lesson.id, prompt: `${lead} "${slide.title}" when its learning goal is "${shortened(lesson.description, 105)}"?`, options, correctIndex, explanation: `This topic belongs to "${lesson.title}."` })
      }
    }
  }

  if (candidates.length === 0) return []
  const ordered = deterministicShuffle(candidates, `${section.id}-question-bank`)
  const bank: PracticeQuestion[] = []
  for (let index = 0; index < QUESTION_BANK_SIZE; index += 1) {
    const source = ordered[index % ordered.length]
    bank.push({ ...source, id: `${source.id}-bank-${index}` })
  }
  return bank
}

export function getPracticeSections(focusTrack: FocusTrack | undefined, model: ModelChoice | undefined): PracticeSection[] {
  const toolkitLessons = sectionTwoLessons.map((lesson) => lesson.kind === 'install' && lesson.installMethod && model
    ? makeInstallLesson(lesson, model, lesson.installMethod)
    : lesson)
  const adaptiveLessons = adaptiveUsageLessons.map((lesson) => model ? makeAdaptiveUsageLesson(lesson, model) : lesson)
  const sections: PracticeSection[] = [
    { id: 'ai-basics', title: 'AI basics', description: 'AI concepts, history, language models, and human judgment.', lessons: sectionOneLessons },
    { id: 'ai-toolkit', title: 'Choose your AI toolkit', description: 'Popular models, choosing a fit, and safe installation routes.', lessons: toolkitLessons },
    { id: 'ai-usage', title: 'Use AI with intention', description: 'Prompting, skills, project guides, extensions, and safe review.', lessons: [...promptLessons, ...adaptiveLessons] },
  ]

  if (focusTrack) {
    sections.push(...trackSections[focusTrack].map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      lessons: section.lessons,
    })))
  }

  return sections
}

function secureRandomIndex(max: number) {
  if (max <= 1) return 0
  const limit = Math.floor(0x100000000 / max) * max
  const values = new Uint32Array(1)
  do window.crypto.getRandomValues(values)
  while (values[0] >= limit)
  return values[0] % max
}

export function pickPracticeSession(bank: PracticeQuestion[], count = PRACTICE_SESSION_SIZE) {
  const pool = [...bank]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const target = secureRandomIndex(index + 1)
    ;[pool[index], pool[target]] = [pool[target], pool[index]]
  }
  return pool.slice(0, count)
}
