export type LessonVisual = 'intro' | 'examples' | 'patterns' | 'prompts' | 'judgment' | 'history' | 'winter' | 'growth' | 'model' | 'tokens'

export type LessonSlide = {
  title: string
  body: string
  visual: LessonVisual
}

export type Quiz = {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export type LessonContent = {
  id: string
  title: string
  shortTitle: string
  description: string
  duration: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xp: number
  gems: number
  color: 'lime' | 'orange' | 'violet'
  kind?: 'standard' | 'chooser' | 'install'
  installMethod?: 'gui' | 'cli'
  sourceUrl?: string
  slides: LessonSlide[]
  quiz: Quiz
}

export const rewardTiers = {
  Easy: { xp: 50, gems: 10 },
  Medium: { xp: 75, gems: 15 },
  Hard: { xp: 100, gems: 20 },
} as const

export const sectionOneLessons: LessonContent[] = [
  {
    id: 'what-is-ai',
    title: 'What is AI?',
    shortTitle: 'What is AI?',
    description: 'Discover what artificial intelligence can do, how it learns, and where human judgment still matters.',
    duration: '6 min',
    difficulty: 'Easy',
    xp: rewardTiers.Easy.xp,
    gems: rewardTiers.Easy.gems,
    color: 'lime',
    slides: [
      {
        title: 'AI helps computers do smart tasks',
        body: 'Artificial intelligence, or AI, is technology that allows computers to perform tasks that normally require human intelligence. These tasks can include understanding language, recognizing images, solving problems, generating ideas and making predictions.',
        visual: 'intro',
      },
      {
        title: 'It learns patterns from information',
        body: 'AI systems learn from large amounts of information. By identifying patterns in this information, they can produce answers, create content or assist users with different tasks. For example, AI can help write an email, explain a difficult topic, generate computer code or organize a daily schedule.',
        visual: 'examples',
      },
      {
        title: 'AI is powerful, but not human',
        body: 'AI does not think or understand the world exactly like a human. It generates results based on patterns, instructions and the information available to it. This means AI can sometimes make mistakes, misunderstand a request or provide incorrect information.',
        visual: 'patterns',
      },
      {
        title: 'Clear prompts shape better answers',
        body: 'The quality of an AI response often depends on the instructions it receives. These instructions are called prompts. Learning how to write clear and detailed prompts helps users get more useful, accurate and relevant results from AI.',
        visual: 'prompts',
      },
      {
        title: 'You stay in charge',
        body: 'AI is a tool, not a replacement for human judgment. Its answers should be reviewed, especially when dealing with important topics such as health, finance, law, education or personal information.',
        visual: 'judgment',
      },
    ],
    quiz: {
      question: 'Which statement best describes how AI works?',
      options: [
        'It thinks exactly like a human',
        'It finds patterns and follows instructions',
        'It always produces correct answers',
        'It replaces human judgment',
      ],
      correctIndex: 1,
      explanation: 'AI produces results from learned patterns, instructions, and available information. People still need to review important answers.',
    },
  },
  {
    id: 'ai-history',
    title: "AI's history",
    shortTitle: "AI's history",
    description: 'Follow the big ideas and breakthroughs that shaped modern artificial intelligence.',
    duration: '7 min',
    difficulty: 'Easy',
    xp: rewardTiers.Easy.xp,
    gems: rewardTiers.Easy.gems,
    color: 'orange',
    slides: [
      {
        title: 'The question came before the name',
        body: 'In 1950, mathematician Alan Turing asked whether machines could show intelligent behavior. His imitation game, now called the Turing Test, became an early way to discuss machine intelligence.',
        visual: 'history',
      },
      {
        title: 'Artificial intelligence gets a name',
        body: 'In 1956, researchers gathered at Dartmouth College for a summer workshop. The event helped establish artificial intelligence as a field of study and gave the field its lasting name.',
        visual: 'intro',
      },
      {
        title: 'Big hopes met hard limits',
        body: 'Early programs could solve narrow problems, but computers were slow and data was scarce. When progress failed to match expectations, funding dropped during periods known as AI winters.',
        visual: 'winter',
      },
      {
        title: 'More data changed everything',
        body: 'Faster computers, huge datasets, and better neural networks led to major advances in speech, vision, and translation. A deep-learning breakthrough in 2012 accelerated this progress.',
        visual: 'growth',
      },
      {
        title: 'Generative AI enters daily life',
        body: 'Modern systems can generate text, images, audio, video, and code. AI moved from research labs into tools used by students, creators, developers, and businesses around the world.',
        visual: 'examples',
      },
    ],
    quiz: {
      question: 'Why is the 1956 Dartmouth workshop important?',
      options: [
        'It invented the first smartphone',
        'It created the internet',
        'It helped establish AI as a named field',
        'It ended all AI research',
      ],
      correctIndex: 2,
      explanation: 'The Dartmouth workshop brought early researchers together and helped establish artificial intelligence as a recognized field.',
    },
  },
  {
    id: 'llms-and-models',
    title: 'What are LLMs and models?',
    shortTitle: 'LLMs and models',
    description: 'Learn what models are and how large language models generate useful responses.',
    duration: '9 min',
    difficulty: 'Medium',
    xp: rewardTiers.Medium.xp,
    gems: rewardTiers.Medium.gems,
    color: 'violet',
    slides: [
      {
        title: 'A model is a learned pattern system',
        body: 'An AI model is a system trained to recognize patterns in data. Different models specialize in different jobs, such as understanding images, predicting numbers, generating music, or working with language.',
        visual: 'model',
      },
      {
        title: 'Training adjusts many connections',
        body: 'During training, a model processes examples and adjusts internal numerical connections. These learned values help it produce useful results when it receives new information later.',
        visual: 'growth',
      },
      {
        title: 'LLMs specialize in language',
        body: 'A large language model, or LLM, is trained on very large collections of text. It learns relationships between words, ideas, writing styles, and many kinds of language tasks.',
        visual: 'prompts',
      },
      {
        title: 'Text becomes tokens',
        body: 'LLMs break text into small pieces called tokens. They generate a response by repeatedly predicting which token is likely to come next based on the prompt and the text already produced.',
        visual: 'tokens',
      },
      {
        title: 'Fluent does not always mean factual',
        body: 'An LLM can produce confident, natural language without checking every fact. Its output should be verified when accuracy matters, and private information should only be shared with trusted systems.',
        visual: 'judgment',
      },
    ],
    quiz: {
      question: 'How does an LLM generate a response?',
      options: [
        'By reading a hidden answer key',
        'By copying one complete web page',
        'By predicting likely next tokens',
        'By thinking exactly like a person',
      ],
      correctIndex: 2,
      explanation: 'An LLM builds text token by token, predicting likely continuations from learned language patterns and the current prompt.',
    },
  },
]

export const sectionTwoLessons: LessonContent[] = [
  {
    id: 'popular-llms',
    title: 'Meet the main AI models',
    shortTitle: 'Popular AI models',
    description: 'Compare five widely used AI choices and learn why the best model depends on the job.',
    duration: '8 min',
    difficulty: 'Medium',
    xp: rewardTiers.Medium.xp,
    gems: rewardTiers.Medium.gems,
    color: 'violet',
    slides: [
      {
        title: 'ChatGPT is a flexible all-rounder',
        body: 'OpenAI’s ChatGPT is a broad assistant for writing, learning, research, images, and everyday problem-solving. Developers can also use Codex for command-line coding work.',
        visual: 'prompts',
      },
      {
        title: 'Claude is strong with careful, long-form work',
        body: 'Anthropic’s Claude is popular for thoughtful writing, document analysis, coding, and working through detailed instructions. Claude has desktop apps and a terminal coding tool called Claude Code.',
        visual: 'judgment',
      },
      {
        title: 'Gemini fits the Google world',
        body: 'Google’s Gemini connects naturally with Google products and handles text, images, research, and coding. Gemini is available on the web, on mobile, and through the open-source Gemini CLI.',
        visual: 'growth',
      },
      {
        title: 'Llama can run on your own computer',
        body: 'Meta’s Llama family is open-weight, which makes it a common choice for local and private experiments. Friendly tools such as Ollama can provide both an app and terminal commands for running compatible Llama models.',
        visual: 'model',
      },
      {
        title: 'DeepSeek focuses on capable reasoning',
        body: 'DeepSeek offers chat and reasoning models through its web app and API. It can be a strong value-focused option, but it does not currently provide an official dedicated command-line app.',
        visual: 'tokens',
      },
    ],
    quiz: {
      question: 'What is the best way to choose an AI model?',
      options: [
        'Always choose the newest name',
        'Match its strengths and tools to your needs',
        'Choose only by logo color',
        'Assume every model has identical features',
      ],
      correctIndex: 1,
      explanation: 'Different models fit different priorities. Your tasks, privacy needs, ecosystem, and preferred interface matter more than hype.',
    },
  },
  {
    id: 'choose-your-model',
    title: 'Choose your AI model',
    shortTitle: 'Model match',
    description: 'Answer four quick questions, get a recommendation, and make the final choice yourself.',
    duration: '4 min',
    difficulty: 'Easy',
    xp: rewardTiers.Easy.xp,
    gems: rewardTiers.Easy.gems,
    color: 'lime',
    kind: 'chooser',
    slides: [],
    quiz: { question: '', options: [], correctIndex: 0, explanation: '' },
  },
  {
    id: 'install-gui',
    title: 'Install the desktop app',
    shortTitle: 'Desktop setup',
    description: 'Install the graphical version of the AI model you chose from a trusted source.',
    duration: '7 min',
    difficulty: 'Medium',
    xp: rewardTiers.Medium.xp,
    gems: rewardTiers.Medium.gems,
    color: 'orange',
    kind: 'install',
    installMethod: 'gui',
    slides: [],
    quiz: { question: '', options: [], correctIndex: 0, explanation: '' },
  },
  {
    id: 'install-cli',
    title: 'Install the command-line tool',
    shortTitle: 'CLI setup',
    description: 'Set up the official terminal workflow for the AI model you chose.',
    duration: '9 min',
    difficulty: 'Medium',
    xp: rewardTiers.Medium.xp,
    gems: rewardTiers.Medium.gems,
    color: 'violet',
    kind: 'install',
    installMethod: 'cli',
    slides: [],
    quiz: { question: '', options: [], correctIndex: 0, explanation: '' },
  },
]

export const promptLessons: LessonContent[] = [
  {
    id: 'use-ai-well', title: 'Use AI as a thinking partner', shortTitle: 'Use AI well',
    description: 'Learn a simple loop for asking, reviewing, and improving AI output.', duration: '6 min', difficulty: 'Easy',
    xp: rewardTiers.Easy.xp, gems: rewardTiers.Easy.gems, color: 'lime',
    slides: [
      { title: 'Start with a clear task', body: 'Tell the AI what you want to accomplish, who the result is for, and what a useful answer should contain. One clear goal beats a pile of unrelated requests.', visual: 'prompts' },
      { title: 'Treat the first answer as a draft', body: 'Read the response, find what is useful, and notice what is missing. Ask follow-up questions instead of expecting perfect output immediately.', visual: 'examples' },
      { title: 'Keep human judgment in the loop', body: 'Check important facts, protect private information, and make the final decision yourself. AI can support your thinking, but it cannot own the consequences.', visual: 'judgment' },
    ],
    quiz: { question: 'What is the strongest way to work with AI?', options: ['Accept the first answer every time', 'Use an ask, review, improve loop', 'Share all private data', 'Avoid follow-up questions'], correctIndex: 1, explanation: 'Good AI work is iterative: ask clearly, review critically, and refine.' },
  },
  {
    id: 'prompt-anatomy', title: 'Build a clean prompt', shortTitle: 'Prompt anatomy',
    description: 'Combine a task, context, constraints, and output format.', duration: '7 min', difficulty: 'Medium',
    xp: rewardTiers.Medium.xp, gems: rewardTiers.Medium.gems, color: 'violet',
    slides: [
      { title: 'Name the task first', body: 'Open with a direct action: summarize, compare, explain, draft, classify, or plan. This gives the model a clear job.', visual: 'prompts' },
      { title: 'Add only useful context', body: 'Include the audience, background, source material, and goal that change the answer. Leave out details that do not help the task.', visual: 'patterns' },
      { title: 'Define the shape of success', body: 'Set boundaries such as length, tone, must-have points, exclusions, and the exact output format you want.', visual: 'model' },
    ],
    quiz: { question: 'Which prompt has the cleanest structure?', options: ['Tell me stuff', 'Write something good', 'Explain photosynthesis to a 12-year-old in five bullets with one example', 'You know what I mean'], correctIndex: 2, explanation: 'It gives a task, audience, length, format, and example requirement.' },
  },
  {
    id: 'context-constraints', title: 'Give context and constraints', shortTitle: 'Context and limits',
    description: 'Guide the answer without burying the model in noise.', duration: '7 min', difficulty: 'Medium',
    xp: rewardTiers.Medium.xp, gems: rewardTiers.Medium.gems, color: 'orange',
    slides: [
      { title: 'Context answers why and for whom', body: 'Useful context tells the AI what happened before, what you already know, who will use the result, and why the task matters.', visual: 'examples' },
      { title: 'Constraints create focus', body: 'Specify limits that matter: time, budget, tools, tone, reading level, word count, source boundaries, or things the answer must avoid.', visual: 'patterns' },
      { title: 'Separate source from instruction', body: 'Label pasted material clearly and tell the model how to use it. This makes long prompts easier to read and reduces confusion.', visual: 'tokens' },
    ],
    quiz: { question: 'What belongs in a useful constraint?', options: ['A real limit that changes the answer', 'Every detail you can remember', 'Private passwords', 'Unrelated background'], correctIndex: 0, explanation: 'A useful constraint narrows the answer toward the real goal.' },
  },
  {
    id: 'examples-iteration', title: 'Improve prompts with examples', shortTitle: 'Examples and iteration',
    description: 'Show the style you want and refine weak results.', duration: '8 min', difficulty: 'Medium',
    xp: rewardTiers.Medium.xp, gems: rewardTiers.Medium.gems, color: 'lime',
    slides: [
      { title: 'Examples make taste visible', body: 'When style or structure matters, provide a short good example. Explain which qualities the AI should copy rather than asking it to copy every word.', visual: 'examples' },
      { title: 'Give precise feedback', body: 'Replace “make it better” with feedback such as “shorten the opening, add one concrete example, and remove jargon.”', visual: 'prompts' },
      { title: 'Change one major thing at a time', body: 'Focused revisions make it easier to see what improved. Save strong prompts as reusable templates for repeated work.', visual: 'growth' },
    ],
    quiz: { question: 'Which feedback is most useful?', options: ['Bad', 'Try again', 'Make it cooler', 'Cut the intro in half and add one practical example'], correctIndex: 3, explanation: 'Specific feedback tells the model exactly what should change.' },
  },
  {
    id: 'verify-ai-output', title: 'Verify and refine AI output', shortTitle: 'Verify the answer',
    description: 'Check facts, expose uncertainty, and protect sensitive information.', duration: '8 min', difficulty: 'Medium',
    xp: rewardTiers.Medium.xp, gems: rewardTiers.Medium.gems, color: 'violet',
    slides: [
      { title: 'Fluent is not the same as true', body: 'AI can sound confident while being wrong. Verify names, numbers, quotes, links, dates, and claims that affect real decisions.', visual: 'judgment' },
      { title: 'Ask the model to show uncertainty', body: 'Request assumptions, missing information, counterarguments, and facts that need checking. Then verify them using trustworthy sources.', visual: 'patterns' },
      { title: 'Protect people and private data', body: 'Remove passwords, personal records, confidential business material, and regulated data unless an approved tool and policy allow it.', visual: 'judgment' },
    ],
    quiz: { question: 'What should you do before using an important AI claim?', options: ['Trust its confident tone', 'Post it immediately', 'Verify it with trustworthy evidence', 'Ask for a longer answer'], correctIndex: 2, explanation: 'Important claims need independent verification, even when the writing sounds confident.' },
  },
]

export type FocusTrack = 'coding' | 'research' | 'automation'

type TrackLessonSeed = { title: string; goal: string }
type TrackSectionSeed = { id: string; title: string; description: string; lessons: TrackLessonSeed[] }
export type TrackSection = { id: string; title: string; description: string; lessons: LessonContent[] }

const trackSeeds: Record<FocusTrack, TrackSectionSeed[]> = {
  coding: [
    { id: 'coding-foundations', title: 'Coding foundations', description: 'Learn where AI helps in software work and where careful review matters.', lessons: [
      { title: 'What AI can do in code', goal: 'Use AI for explanations, drafts, refactors, tests, and reviews while keeping the developer responsible.' },
      { title: 'Give the right code context', goal: 'Share the goal, language, framework, relevant files, constraints, and exact failing behavior.' },
      { title: 'Ask for a plan before code', goal: 'Request a short implementation plan so hidden assumptions appear before code changes begin.' },
      { title: 'Review generated code', goal: 'Check correctness, readability, dependencies, security, and whether the code actually matches the request.' },
    ]},
    { id: 'coding-features', title: 'Build features with AI', description: 'Turn product requirements into small, reviewable implementation steps.', lessons: [
      { title: 'Break a feature into tasks', goal: 'Convert a large feature into small pieces with clear inputs, outputs, and acceptance criteria.' },
      { title: 'Generate focused components', goal: 'Ask for one component or function at a time and specify its interface and edge cases.' },
      { title: 'Work with APIs safely', goal: 'Describe request and response shapes, authentication boundaries, failure states, and rate limits.' },
      { title: 'Keep changes inside scope', goal: 'Tell the AI which files may change and require an explanation for every extra edit.' },
    ]},
    { id: 'coding-debug', title: 'Debug and test', description: 'Use evidence, tests, and small experiments to find reliable fixes.', lessons: [
      { title: 'Write a reproducible bug report', goal: 'Provide steps, expected behavior, actual behavior, environment, and the smallest useful error output.' },
      { title: 'Read errors with AI', goal: 'Ask the AI to interpret an error without assuming the first explanation is the root cause.' },
      { title: 'Generate meaningful tests', goal: 'Cover normal behavior, boundaries, failure paths, and regressions rather than chasing test count.' },
      { title: 'Validate the smallest fix', goal: 'Change one cause at a time, rerun focused tests, and confirm the original behavior is restored.' },
    ]},
    { id: 'coding-ship', title: 'Ship code safely', description: 'Prepare AI-assisted work for humans, repositories, and production.', lessons: [
      { title: 'Create clean commits', goal: 'Group related changes, write clear commit messages, and avoid mixing generated cleanup with feature work.' },
      { title: 'Run a security review', goal: 'Check secrets, permissions, input validation, dependencies, and unsafe command or data handling.' },
      { title: 'Document the change', goal: 'Explain setup, decisions, interfaces, limitations, and future maintenance needs.' },
      { title: 'Build a deployment checklist', goal: 'Confirm tests, configuration, migrations, monitoring, rollback, and ownership before release.' },
    ]},
  ],
  research: [
    { id: 'research-foundations', title: 'Research foundations', description: 'Turn a broad topic into an answerable, evidence-driven question.', lessons: [
      { title: 'Frame the research question', goal: 'Define the decision, population, time range, geography, and meaning of key terms.' },
      { title: 'Build a search plan', goal: 'Create keyword groups, synonyms, exclusions, and a sequence for broad then focused searching.' },
      { title: 'Know your source types', goal: 'Distinguish primary evidence, reviews, reporting, commentary, and promotional material.' },
      { title: 'Set scope and stopping rules', goal: 'Decide how much evidence is enough and record what the research will not cover.' },
    ]},
    { id: 'research-sources', title: 'Analyze sources', description: 'Judge evidence quality before using it in an answer.', lessons: [
      { title: 'Check source credibility', goal: 'Inspect authorship, expertise, methods, publication, date, incentives, and corrections.' },
      { title: 'Compare independent evidence', goal: 'Look for agreement and disagreement across sources that do not all copy the same origin.' },
      { title: 'Capture citations as you work', goal: 'Save author, title, date, URL, page, and the exact claim each source supports.' },
      { title: 'Spot bias and missing voices', goal: 'Ask whose interests shape the evidence and which affected perspectives are absent.' },
    ]},
    { id: 'research-synthesis', title: 'Synthesize findings', description: 'Move from a pile of notes to a clear map of the evidence.', lessons: [
      { title: 'Create structured notes', goal: 'Separate source facts, direct quotations, interpretations, and open questions.' },
      { title: 'Find themes across sources', goal: 'Group repeated findings without hiding important differences in definitions or methods.' },
      { title: 'Handle contradictions', goal: 'Explain why sources disagree and weigh evidence quality instead of forcing false certainty.' },
      { title: 'Write an evidence summary', goal: 'State what is known, what remains uncertain, and how strong the support is.' },
    ]},
    { id: 'research-output', title: 'Publish trustworthy research', description: 'Turn verified evidence into a useful and transparent deliverable.', lessons: [
      { title: 'Outline around the answer', goal: 'Lead with the main finding, then organize evidence, caveats, and implications.' },
      { title: 'Draft without losing sources', goal: 'Keep citations attached to claims and clearly mark inference or interpretation.' },
      { title: 'Run a fact-check pass', goal: 'Verify every material name, number, date, quote, and causal claim against its source.' },
      { title: 'Present findings clearly', goal: 'Match depth and format to the audience while keeping limitations visible.' },
    ]},
  ],
  automation: [
    { id: 'automation-foundations', title: 'Automation foundations', description: 'Find repeatable work that is safe and worthwhile to automate.', lessons: [
      { title: 'Find good automation candidates', goal: 'Choose frequent, rules-based tasks with stable inputs and a measurable result.' },
      { title: 'Map the current workflow', goal: 'Record every human step, tool, handoff, exception, and decision before changing it.' },
      { title: 'Understand triggers and actions', goal: 'Define exactly what starts the workflow and what each automated step changes.' },
      { title: 'Choose the right tool', goal: 'Match no-code, scripts, APIs, and AI agents to complexity, control, and maintenance needs.' },
    ]},
    { id: 'automation-build', title: 'Build a workflow', description: 'Design clear inputs, rules, integrations, and failure behavior.', lessons: [
      { title: 'Define clean inputs', goal: 'Validate required fields, formats, allowed values, and the source of every input.' },
      { title: 'Write explicit workflow rules', goal: 'Turn vague decisions into conditions, branches, defaults, and clear outputs.' },
      { title: 'Connect tools carefully', goal: 'Use the smallest permissions and document what data crosses each integration boundary.' },
      { title: 'Design the error path', goal: 'Decide what retries, pauses, alerts, and human handoffs happen when a step fails.' },
    ]},
    { id: 'automation-reliability', title: 'Make automation reliable', description: 'Test real edge cases and make failures visible.', lessons: [
      { title: 'Test with safe sample data', goal: 'Use representative normal, missing, malformed, duplicate, and boundary inputs.' },
      { title: 'Add retries without loops', goal: 'Retry temporary failures with limits and delays while preventing duplicate actions.' },
      { title: 'Log useful events', goal: 'Record when, why, and where a workflow changed state without leaking sensitive data.' },
      { title: 'Keep a human review point', goal: 'Require approval for ambiguous, sensitive, costly, or irreversible actions.' },
    ]},
    { id: 'automation-scale', title: 'Scale automation safely', description: 'Protect access, monitor outcomes, and make ownership clear.', lessons: [
      { title: 'Protect secrets and permissions', goal: 'Store credentials safely, rotate them, and grant each connection only what it needs.' },
      { title: 'Monitor business outcomes', goal: 'Track success, failure, time saved, quality, and harmful side effects.' },
      { title: 'Plan for change', goal: 'Expect APIs, forms, policies, and models to change and define who repairs the workflow.' },
      { title: 'Document and hand off', goal: 'Explain the purpose, owner, dependencies, alerts, recovery steps, and shutdown process.' },
    ]},
  ],
}

const trackColors: LessonContent['color'][] = ['lime', 'orange', 'violet', 'lime']
const trackVisuals: LessonVisual[] = ['prompts', 'patterns', 'growth']

function createTrackLesson(track: FocusTrack, sectionId: string, lesson: TrackLessonSeed, index: number): LessonContent {
  const id = `${sectionId}-${index + 1}`
  return {
    id, title: lesson.title, shortTitle: lesson.title, description: lesson.goal, duration: '7 min', difficulty: 'Medium',
    xp: rewardTiers.Medium.xp, gems: rewardTiers.Medium.gems, color: trackColors[index],
    slides: [
      { title: lesson.title, body: lesson.goal, visual: trackVisuals[index % trackVisuals.length] },
      { title: 'Turn the idea into a clear AI task', body: `For ${track} work, describe the desired result, provide only relevant context, name constraints, and ask for an output you can inspect step by step.`, visual: 'prompts' },
      { title: 'Review before you rely on it', body: 'Check the result against the real goal, test important assumptions, and keep a human decision point wherever mistakes could cause harm.', visual: 'judgment' },
    ],
    quiz: { question: `What makes “${lesson.title}” safer and more useful?`, options: ['A vague one-line request', 'Clear context plus human review', 'Skipping checks to save time', 'Sharing every private detail'], correctIndex: 1, explanation: 'Clear context guides the work, while human review catches mistakes and unsafe assumptions.' },
  }
}

export const trackSections: Record<FocusTrack, TrackSection[]> = Object.fromEntries(
  (Object.keys(trackSeeds) as FocusTrack[]).map((track) => [track, trackSeeds[track].map((section) => ({
    id: section.id, title: section.title, description: section.description,
    lessons: section.lessons.map((lesson, index) => createTrackLesson(track, section.id, lesson, index)),
  }))]),
) as Record<FocusTrack, TrackSection[]>

export const trackLessons = Object.values(trackSections).flatMap((sections) => sections.flatMap((section) => section.lessons))
export const coreLessons = [...sectionOneLessons, ...sectionTwoLessons, ...promptLessons]
export const lessons: LessonContent[] = [...coreLessons, ...trackLessons]

export function getLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id)
}
