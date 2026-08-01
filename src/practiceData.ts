import { makeAdaptiveUsageLesson } from './adaptiveUsage'
import {
  adaptiveUsageLessons,
  promptLessons,
  sectionOneLessons,
  sectionTwoLessons,
  trackSections,
  type FocusTrack,
  type LessonContent,
  type LessonSlide,
} from './lessonData'
import { makeInstallLesson, type ModelChoice } from './modelGuide'

export const QUESTION_BANK_SIZE = 100
export const PRACTICE_SESSION_SIZE = 5

export type PracticeQuestion = {
  id: string
  conceptKey: string
  category: 'Lesson check' | 'Definition' | 'Goal connection' | 'Relationship' | 'Application' | 'Diagnosis' | 'Synthesis'
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

type SlideConcept = {
  key: string
  lesson: LessonContent
  slide: LessonSlide
}

type ConceptPair = [SlideConcept, SlideConcept]
type ConceptTriple = [SlideConcept, SlideConcept, SlideConcept]

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
  const compact = value.replace(/\s+/g, ' ').trim()
  if (compact.length <= limit) return compact
  return `${compact.slice(0, limit).trimEnd()}...`
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => shortened(value)).filter(Boolean))]
}

function makeOptions(correct: string, distractorPool: string[], seed: string) {
  const normalizedCorrect = shortened(correct)
  const distractors = deterministicShuffle(
    uniqueValues(distractorPool).filter((item) => item !== normalizedCorrect),
    `${seed}-distractors`,
  ).slice(0, 3)
  while (distractors.length < 3) {
    const fallback = genericDistractors.find((item) => item !== normalizedCorrect && !distractors.includes(item))
    if (!fallback) break
    distractors.push(fallback)
  }
  const options = deterministicShuffle([normalizedCorrect, ...distractors], `${seed}-options`)
  return { options, correctIndex: options.indexOf(normalizedCorrect) }
}

function createPairs<T>(items: T[]): Array<[T, T]> {
  const pairs: Array<[T, T]> = []
  for (let first = 0; first < items.length; first += 1) {
    for (let second = first + 1; second < items.length; second += 1) pairs.push([items[first], items[second]])
  }
  return pairs
}

function createTriples<T>(items: T[]): Array<[T, T, T]> {
  const triples: Array<[T, T, T]> = []
  for (let first = 0; first < items.length; first += 1) {
    for (let second = first + 1; second < items.length; second += 1) {
      for (let third = second + 1; third < items.length; third += 1) triples.push([items[first], items[second], items[third]])
    }
  }
  return triples
}

function conceptLabel(concept: SlideConcept) {
  if (concept.slide.title.trim().toLowerCase() === concept.lesson.title.trim().toLowerCase()) return `"${concept.slide.title}"`
  return `"${concept.slide.title}" from "${concept.lesson.title}"`
}

function lessonSet(concepts: SlideConcept[]) {
  return uniqueValues(concepts.map((concept) => concept.lesson.title)).join(' + ')
}

function titleSet(concepts: SlideConcept[]) {
  return concepts.map((concept) => `${concept.slide.title} (${concept.lesson.title})`).join(' + ')
}

function explanationSet(concepts: SlideConcept[]) {
  return concepts.map((concept) => `${concept.slide.title} (${concept.lesson.title}): ${shortened(concept.slide.body, 62)}`).join(' | ')
}

function lessonMapping(concepts: SlideConcept[]) {
  return concepts.map((concept) => `${concept.slide.title} -> ${concept.lesson.title}`).join(' | ')
}

function applicationPlan(concepts: SlideConcept[]) {
  return concepts.map((concept) => `${concept.slide.title}: ${shortened(concept.slide.body, 62)}`).join(' Then: ')
}

function addCandidate(target: PracticeQuestion[], question: PracticeQuestion) {
  if (target.some((item) => item.conceptKey === question.conceptKey || item.prompt === question.prompt)) return
  target.push(question)
}

function pairQuestion(sectionId: string, pair: ConceptPair, pools: {
  explanations: string[]
  lessonSets: string[]
  plans: string[]
  titleSets: string[]
  mappings: string[]
  bodies: string[]
}): PracticeQuestion {
  const [first, second] = pair
  const pairKey = [first.key, second.key].sort().join('|')
  const mode = hashString(pairKey) % 6
  const base = {
    id: `${sectionId}-pair-${hashString(pairKey)}`,
    conceptKey: `pair:${pairKey}:mode:${mode}`,
    lessonId: first.lesson.id,
  }

  if (mode === 0) {
    const correct = explanationSet(pair)
    const { options, correctIndex } = makeOptions(correct, pools.explanations, base.id)
    return { ...base, category: 'Relationship', prompt: `Which explanation correctly connects ${conceptLabel(first)} with ${conceptLabel(second)}?`, options, correctIndex, explanation: 'The correct option preserves the meaning of both course concepts.' }
  }
  if (mode === 1) {
    const correct = lessonSet(pair)
    const { options, correctIndex } = makeOptions(correct, pools.lessonSets, base.id)
    return { ...base, category: 'Relationship', prompt: `A review task needs both ${conceptLabel(first)} and ${conceptLabel(second)}. Which lesson set covers the task?`, options, correctIndex, explanation: `These ideas come from ${correct}.` }
  }
  if (mode === 2) {
    const correct = applicationPlan(pair)
    const { options, correctIndex } = makeOptions(correct, pools.plans, base.id)
    return { ...base, category: 'Application', prompt: `Which plan applies both ${conceptLabel(first)} and ${conceptLabel(second)} without dropping either idea?`, options, correctIndex, explanation: 'The selected plan applies both ideas instead of replacing one with an unrelated shortcut.' }
  }
  if (mode === 3) {
    const correct = titleSet(pair)
    const { options, correctIndex } = makeOptions(correct, pools.titleSets, base.id)
    return { ...base, category: 'Synthesis', prompt: `Which two-topic set accurately represents ${conceptLabel(first)} and ${conceptLabel(second)} when their course notes are considered together?`, options, correctIndex, explanation: `The two matching topics are ${correct}.` }
  }
  if (mode === 4) {
    const correct = `${conceptLabel(second)}: ${second.slide.body}`
    const { options, correctIndex } = makeOptions(correct, pools.bodies, base.id)
    return { ...base, category: 'Diagnosis', prompt: `A learner already applies ${conceptLabel(first)} but ignores ${conceptLabel(second)}. What important piece is missing?`, options, correctIndex, explanation: shortened(second.slide.body, 240) }
  }

  const correct = lessonMapping(pair)
  const { options, correctIndex } = makeOptions(correct, pools.mappings, base.id)
  return { ...base, category: 'Relationship', prompt: `Which mapping assigns ${conceptLabel(first)} and ${conceptLabel(second)} to the correct lesson context?`, options, correctIndex, explanation: 'Each topic must remain connected to the lesson that teaches it.' }
}

function directedGapQuestion(sectionId: string, known: SlideConcept, missing: SlideConcept, labeledBodies: string[]): PracticeQuestion {
  const conceptKey = `directed-gap:${known.key}->${missing.key}`
  const id = `${sectionId}-gap-${hashString(conceptKey)}`
  const correct = `${conceptLabel(missing)}: ${missing.slide.body}`
  const { options, correctIndex } = makeOptions(correct, labeledBodies, id)
  return {
    id,
    conceptKey,
    category: 'Diagnosis',
    lessonId: missing.lesson.id,
    prompt: `A learner handles ${conceptLabel(known)} correctly, but the task also requires ${conceptLabel(missing)}. Which addition closes that specific gap?`,
    options,
    correctIndex,
    explanation: shortened(missing.slide.body, 240),
  }
}

function tripleQuestion(sectionId: string, triple: ConceptTriple, pools: {
  explanations: string[]
  lessonSets: string[]
  plans: string[]
  titleSets: string[]
  mappings: string[]
}): PracticeQuestion {
  const tripleKey = triple.map((concept) => concept.key).sort().join('|')
  const mode = hashString(tripleKey) % 5
  const base = {
    id: `${sectionId}-triple-${hashString(tripleKey)}`,
    conceptKey: `triple:${tripleKey}:mode:${mode}`,
    lessonId: triple[0].lesson.id,
  }

  if (mode === 0) {
    const correct = titleSet(triple)
    const { options, correctIndex } = makeOptions(correct, pools.titleSets, base.id)
    return { ...base, category: 'Synthesis', prompt: `Which three-topic set correctly combines ${conceptLabel(triple[0])}, ${conceptLabel(triple[1])}, and ${conceptLabel(triple[2])}?`, options, correctIndex, explanation: `The matching topics are ${correct}.` }
  }
  if (mode === 1) {
    const correct = applicationPlan(triple)
    const { options, correctIndex } = makeOptions(correct, pools.plans, base.id)
    return { ...base, category: 'Application', prompt: `Which plan uses all three course ideas: ${conceptLabel(triple[0])}, ${conceptLabel(triple[1])}, and ${conceptLabel(triple[2])}?`, options, correctIndex, explanation: 'The correct plan keeps all three ideas and their practical meaning.' }
  }
  if (mode === 2) {
    const correct = lessonSet(triple)
    const { options, correctIndex } = makeOptions(correct, pools.lessonSets, base.id)
    return { ...base, category: 'Relationship', prompt: `A learner wants to review ${conceptLabel(triple[0])}, ${conceptLabel(triple[1])}, and ${conceptLabel(triple[2])}. Which lesson set is required?`, options, correctIndex, explanation: `The required lesson set is ${correct}.` }
  }
  if (mode === 3) {
    const correct = lessonMapping(triple)
    const { options, correctIndex } = makeOptions(correct, pools.mappings, base.id)
    return { ...base, category: 'Relationship', prompt: `Which mapping places ${conceptLabel(triple[0])}, ${conceptLabel(triple[1])}, and ${conceptLabel(triple[2])} under their correct lesson titles?`, options, correctIndex, explanation: 'The correct mapping preserves every topic-to-lesson relationship.' }
  }

  const correct = explanationSet(triple)
  const { options, correctIndex } = makeOptions(correct, pools.explanations, base.id)
  return { ...base, category: 'Synthesis', prompt: `Which summary accurately combines ${conceptLabel(triple[0])}, ${conceptLabel(triple[1])}, and ${conceptLabel(triple[2])}?`, options, correctIndex, explanation: 'The correct summary includes the meaning of all three ideas.' }
}

function tripleGapQuestion(sectionId: string, triple: ConceptTriple, missingIndex: number, labeledBodies: string[]): PracticeQuestion {
  const missing = triple[missingIndex]
  const present = triple.filter((_, index) => index !== missingIndex)
  const tripleKey = triple.map((concept) => concept.key).sort().join('|')
  const conceptKey = `triple-gap:${tripleKey}:missing:${missing.key}`
  const id = `${sectionId}-triple-gap-${hashString(conceptKey)}`
  const correct = `${conceptLabel(missing)}: ${missing.slide.body}`
  const { options, correctIndex } = makeOptions(correct, labeledBodies, id)
  return {
    id,
    conceptKey,
    category: 'Diagnosis',
    lessonId: missing.lesson.id,
    prompt: `A plan already includes ${conceptLabel(present[0])} and ${conceptLabel(present[1])}. It must also cover ${conceptLabel(missing)}. What should be added?`,
    options,
    correctIndex,
    explanation: shortened(missing.slide.body, 240),
  }
}

export function buildQuestionBank(section: PracticeSection): PracticeQuestion[] {
  const lessons = section.lessons.filter((lesson) => lesson.slides.length > 0 || lesson.quiz.question)
  const seenSlideIdeas = new Set<string>()
  const slides: SlideConcept[] = lessons.flatMap((lesson) => lesson.slides.map((slide, index) => ({
    key: `${lesson.id}:slide:${index}`,
    lesson,
    slide,
  }))).filter((concept) => {
    const signature = `${concept.slide.title}|${concept.slide.body}`.replace(/\s+/g, ' ').trim().toLowerCase()
    if (seenSlideIdeas.has(signature)) return false
    seenSlideIdeas.add(signature)
    return true
  })
  const allBodies = slides.map((concept) => concept.slide.body)
  const labeledBodies = slides.map((concept) => `${conceptLabel(concept)}: ${concept.slide.body}`)
  const allDescriptions = lessons.map((lesson) => lesson.description)
  const quizQuestions: PracticeQuestion[] = []
  const definitionQuestions: PracticeQuestion[] = []
  const goalQuestions: PracticeQuestion[] = []
  const seenQuizIdeas = new Set<string>()

  for (const lesson of lessons) {
    if (lesson.quiz.question && lesson.quiz.options.length >= 2) {
      const original = lesson.quiz.options[lesson.quiz.correctIndex]
      const semanticSignature = `${original}|${lesson.quiz.explanation}|${[...lesson.quiz.options].sort().join('|')}`.replace(/\s+/g, ' ').trim().toLowerCase()
      if (!seenQuizIdeas.has(semanticSignature)) {
        seenQuizIdeas.add(semanticSignature)
        const shuffled = deterministicShuffle(lesson.quiz.options, `${section.id}-${lesson.id}-quiz`)
        addCandidate(quizQuestions, {
          id: `${section.id}-${lesson.id}-quiz`,
          conceptKey: `quiz:${hashString(semanticSignature)}`,
          category: 'Lesson check',
          lessonId: lesson.id,
          prompt: lesson.quiz.question,
          options: shuffled,
          correctIndex: shuffled.indexOf(original),
          explanation: lesson.quiz.explanation,
        })
      }
    }

    const goalConcept = slides.find((concept) => concept.lesson.id === lesson.id)
    if (goalConcept) {
      const id = `${section.id}-${lesson.id}-goal`
      const { options, correctIndex } = makeOptions(lesson.description, allDescriptions, id)
      addCandidate(goalQuestions, {
        id,
        conceptKey: `goal:${goalConcept.key}`,
        category: 'Goal connection',
        lessonId: lesson.id,
        prompt: `A learner is applying ${conceptLabel(goalConcept)}. Which broader lesson goal does that work support?`,
        options,
        correctIndex,
        explanation: lesson.description,
      })
    }
  }

  for (const concept of slides) {
    const id = `${section.id}-${concept.key}-definition`
    const { options, correctIndex } = makeOptions(concept.slide.body, allBodies, id)
    addCandidate(definitionQuestions, {
      id,
      conceptKey: `definition:${concept.key}`,
      category: 'Definition',
      lessonId: concept.lesson.id,
      prompt: `What does ${conceptLabel(concept)} mean in this course?`,
      options,
      correctIndex,
      explanation: shortened(concept.slide.body, 240),
    })
  }

  const pairs = createPairs(slides)
  const pairPools = {
    explanations: pairs.map((pair) => explanationSet(pair)),
    lessonSets: pairs.map((pair) => lessonSet(pair)),
    plans: pairs.map((pair) => applicationPlan(pair)),
    titleSets: pairs.map((pair) => titleSet(pair)),
    mappings: pairs.map((pair) => lessonMapping(pair)),
    bodies: labeledBodies,
  }
  const pairQuestions = deterministicShuffle(
    pairs.flatMap((pair) => [
      pairQuestion(section.id, pair, pairPools),
      directedGapQuestion(section.id, pair[0], pair[1], labeledBodies),
      directedGapQuestion(section.id, pair[1], pair[0], labeledBodies),
    ]),
    `${section.id}-relationship-order`,
  )

  const essential = deterministicShuffle(
    [...quizQuestions, ...definitionQuestions, ...goalQuestions],
    `${section.id}-essential-order`,
  )
  const pairTarget = Math.min(pairQuestions.length, Math.max(30, 80 - essential.length))
  const selected: PracticeQuestion[] = [...essential, ...pairQuestions.slice(0, pairTarget)]

  if (selected.length < QUESTION_BANK_SIZE && slides.length >= 3) {
    const triples = createTriples(slides)
    const triplePools = {
      explanations: triples.map((triple) => explanationSet(triple)),
      lessonSets: triples.map((triple) => lessonSet(triple)),
      plans: triples.map((triple) => applicationPlan(triple)),
      titleSets: triples.map((triple) => titleSet(triple)),
      mappings: triples.map((triple) => lessonMapping(triple)),
    }
    const tripleQuestions = deterministicShuffle(
      triples.flatMap((triple) => [
        tripleQuestion(section.id, triple, triplePools),
        tripleGapQuestion(section.id, triple, 0, labeledBodies),
        tripleGapQuestion(section.id, triple, 1, labeledBodies),
        tripleGapQuestion(section.id, triple, 2, labeledBodies),
      ]),
      `${section.id}-synthesis-order`,
    )
    selected.push(...tripleQuestions.slice(0, QUESTION_BANK_SIZE - selected.length))
  }

  return selected.slice(0, QUESTION_BANK_SIZE)
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
