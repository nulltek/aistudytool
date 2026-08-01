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
  id: 'what-is-ai' | 'ai-history' | 'llms-and-models'
  title: string
  shortTitle: string
  description: string
  duration: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  xp: number
  gems: number
  color: 'lime' | 'orange' | 'violet'
  slides: LessonSlide[]
  quiz: Quiz
}

export const rewardTiers = {
  Easy: { xp: 50, gems: 10 },
  Medium: { xp: 75, gems: 15 },
  Hard: { xp: 100, gems: 20 },
} as const

export const lessons: LessonContent[] = [
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

export function getLesson(id: string) {
  return lessons.find((lesson) => lesson.id === id)
}
