import type { LessonContent, LessonVisual } from './lessonData'

export type ModelId = 'chatgpt' | 'claude' | 'gemini' | 'llama-local' | 'deepseek'
export type InstallMethod = 'gui' | 'cli'

export type InstallGuide = {
  available: boolean
  label: string
  sourceUrl: string
  command?: string
  steps: Array<{ title: string; body: string }>
}

export type ModelChoice = {
  id: ModelId
  name: string
  provider: string
  short: string
  bestFor: string[]
  caution: string
  tone: string
  gui: InstallGuide
  cli: InstallGuide
}

export const modelChoices: ModelChoice[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    short: 'A versatile all-rounder for writing, research, images, files, and coding.',
    bestFor: ['Everyday work', 'Mixed tasks', 'Coding'],
    caution: 'Cloud-based. Some advanced tools depend on your plan.',
    tone: '#17211b',
    gui: {
      available: true,
      label: 'ChatGPT desktop',
      sourceUrl: 'https://chatgpt.com/download/',
      steps: [
        { title: 'Use the official download page', body: 'Open chatgpt.com/download and choose the installer for Windows or macOS. Avoid download mirrors and unofficial installers.' },
        { title: 'Install the desktop app', body: 'Open the downloaded installer, follow the operating-system prompts, then launch ChatGPT from your applications list.' },
        { title: 'Sign in and choose your workspace', body: 'Continue with your ChatGPT account. Check the selected personal or organization workspace before sharing files.' },
      ],
    },
    cli: {
      available: true,
      label: 'Codex CLI',
      sourceUrl: 'https://help.openai.com/en/articles/11096431',
      command: 'npm install -g @openai/codex',
      steps: [
        { title: 'Install Node.js first', body: 'Install a current Node.js release and confirm that npm works in your terminal.' },
        { title: 'Install Codex CLI', body: 'Run npm install -g @openai/codex. On Windows, use the supported Windows setup or WSL when required.' },
        { title: 'Start and authenticate', body: 'Run codex inside a project folder, then follow the sign-in flow. Review its approval mode before allowing file changes or commands.' },
      ],
    },
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    short: 'Strong for careful writing, long documents, analysis, and agentic coding.',
    bestFor: ['Long documents', 'Writing quality', 'Coding'],
    caution: 'Cloud-based. Claude Code access and limits depend on account or billing.',
    tone: '#c66f45',
    gui: {
      available: true,
      label: 'Claude Desktop',
      sourceUrl: 'https://claude.ai/download',
      steps: [
        { title: 'Download from Claude', body: 'Open claude.ai/download and select the official Windows or macOS build for your computer.' },
        { title: 'Complete the installation', body: 'Open the downloaded file, follow the prompts, and launch Claude from the Start menu or Applications folder.' },
        { title: 'Sign in and review connectors', body: 'Sign in to Claude. Only enable desktop extensions or connectors that need access to your files and tools.' },
      ],
    },
    cli: {
      available: true,
      label: 'Claude Code',
      sourceUrl: 'https://docs.anthropic.com/en/docs/claude-code/getting-started',
      command: 'npm install -g @anthropic-ai/claude-code',
      steps: [
        { title: 'Check the requirements', body: 'Install Node.js 18 or newer. Windows users can use WSL or Git Bash according to Anthropic support.' },
        { title: 'Install Claude Code', body: 'Run npm install -g @anthropic-ai/claude-code without sudo.' },
        { title: 'Launch and sign in', body: 'Run claude in a project directory, choose the matching account option, and finish authentication in the browser.' },
      ],
    },
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    short: 'A strong fit for Google users, multimodal work, research, and large context.',
    bestFor: ['Google ecosystem', 'Multimodal tasks', 'Research'],
    caution: 'Availability and features vary by device, country, account, and plan.',
    tone: '#3974df',
    gui: {
      available: true,
      label: 'Gemini app',
      sourceUrl: 'https://gemini.google.com/app/download',
      steps: [
        { title: 'Choose the official Gemini app', body: 'Use gemini.google.com/app/download for the supported mobile or desktop option shown for your device.' },
        { title: 'Install or open Gemini', body: 'Complete the store or installer flow. The web app remains available when a native app is not offered for your platform.' },
        { title: 'Sign in with Google', body: 'Choose the correct Google account and review activity and connected-app settings before using personal data.' },
      ],
    },
    cli: {
      available: true,
      label: 'Gemini CLI',
      sourceUrl: 'https://github.com/google-gemini/gemini-cli',
      command: 'npm install -g @google/gemini-cli',
      steps: [
        { title: 'Install Node.js', body: 'Install a current Node.js version so the npm package manager is available.' },
        { title: 'Install Gemini CLI', body: 'Run npm install -g @google/gemini-cli. Use the stable latest release for normal study work.' },
        { title: 'Run Gemini and authenticate', body: 'Run gemini, select Sign in with Google, and finish the browser authorization flow.' },
      ],
    },
  },
  {
    id: 'llama-local',
    name: 'Llama Local',
    provider: 'Meta models with Ollama',
    short: 'A local-first route for privacy, experimentation, and offline-capable workflows.',
    bestFor: ['Local privacy', 'Offline use', 'Model control'],
    caution: 'Local models need disk space, memory, and suitable hardware. Results vary by model size.',
    tone: '#7b5ac8',
    gui: {
      available: true,
      label: 'Ollama app',
      sourceUrl: 'https://ollama.com/download',
      steps: [
        { title: 'Check your computer resources', body: 'Confirm you have enough storage and memory for the Llama model size you plan to use.' },
        { title: 'Install Ollama', body: 'Download the official Ollama app for your operating system from ollama.com/download and complete the installer.' },
        { title: 'Choose a Llama model', body: 'Open Ollama, find a supported Llama model, download it, and start with a smaller model if your computer is limited.' },
      ],
    },
    cli: {
      available: true,
      label: 'Ollama CLI',
      sourceUrl: 'https://ollama.com/download',
      command: 'ollama run llama4',
      steps: [
        { title: 'Install Ollama', body: 'Install Ollama from its official download page. Its command-line tool is included with the application.' },
        { title: 'Download and run Llama', body: 'Run ollama run llama4. Ollama downloads the model before starting the local chat.' },
        { title: 'Check local resource use', body: 'Watch storage and memory use. Stop the model when finished, and choose a smaller variant if performance is poor.' },
      ],
    },
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    short: 'A reasoning-focused cloud option known for capable coding and accessible pricing.',
    bestFor: ['Reasoning', 'Coding', 'Low-cost access'],
    caution: 'Review the service privacy terms before sharing sensitive information.',
    tone: '#387bc7',
    gui: {
      available: true,
      label: 'DeepSeek app',
      sourceUrl: 'https://www.deepseek.com/',
      steps: [
        { title: 'Start from the official website', body: 'Open deepseek.com and follow the official link for the web or mobile application.' },
        { title: 'Install the mobile app if needed', body: 'Use the app-store link supplied by DeepSeek. On desktop, use its official web interface.' },
        { title: 'Create an account carefully', body: 'Sign in, review data controls, and avoid sharing private or regulated information without approval.' },
      ],
    },
    cli: {
      available: false,
      label: 'Official general-purpose CLI unavailable',
      sourceUrl: 'https://api-docs.deepseek.com/',
      steps: [],
    },
  },
]

export const chooserQuestions = [
  {
    id: 'goal',
    title: 'What will you do most often?',
    options: [
      { label: 'Everyday mixed work', scores: { chatgpt: 4, claude: 2, gemini: 2 } },
      { label: 'Writing and long documents', scores: { claude: 5, chatgpt: 2 } },
      { label: 'Coding and technical work', scores: { claude: 4, chatgpt: 4, gemini: 3, deepseek: 3 } },
      { label: 'Private local experiments', scores: { 'llama-local': 6 } },
    ],
  },
  {
    id: 'ecosystem',
    title: 'Which setup already feels familiar?',
    options: [
      { label: 'Google products', scores: { gemini: 5 } },
      { label: 'ChatGPT or Microsoft tools', scores: { chatgpt: 4 } },
      { label: 'Developer terminals', scores: { claude: 3, chatgpt: 3, gemini: 3, 'llama-local': 2 } },
      { label: 'No preference', scores: { chatgpt: 2, claude: 2, gemini: 2, deepseek: 2 } },
    ],
  },
  {
    id: 'priority',
    title: 'What matters most?',
    options: [
      { label: 'Simple all-round experience', scores: { chatgpt: 5, gemini: 2 } },
      { label: 'Careful, polished answers', scores: { claude: 5 } },
      { label: 'Privacy and local control', scores: { 'llama-local': 7 } },
      { label: 'Accessible reasoning', scores: { deepseek: 5, gemini: 2 } },
    ],
  },
  {
    id: 'hardware',
    title: 'Can your computer run local models?',
    options: [
      { label: 'Yes, it has strong hardware', scores: { 'llama-local': 4 } },
      { label: 'Maybe, but keep setup light', scores: { chatgpt: 2, claude: 2, gemini: 2 } },
      { label: 'No, use cloud tools', scores: { chatgpt: 2, claude: 2, gemini: 2, deepseek: 2 } },
      { label: 'I am not sure', scores: { chatgpt: 3, gemini: 2 } },
    ],
  },
] as const

export function getModelChoice(id?: string | null) {
  return modelChoices.find((model) => model.id === id)
}

export function makeInstallLesson(base: LessonContent, model: ModelChoice, method: InstallMethod): LessonContent {
  const guide = model[method]
  const methodName = method === 'gui' ? 'desktop app' : 'command-line tool'
  const visuals: LessonVisual[] = method === 'gui' ? ['model', 'examples', 'judgment'] : ['tokens', 'prompts', 'judgment']

  if (!guide.available) return {
    ...base,
    title: `${model.name} has no official ${methodName}`,
    shortTitle: `No official ${method === 'gui' ? 'desktop app' : 'CLI'}`,
    description: `Learn why this setup checkpoint is skipped safely for ${model.name}.`,
    sourceUrl: guide.sourceUrl,
    slides: [
      { title: `No official ${methodName} is available`, body: `${model.provider} does not currently provide an official ${methodName} for ${model.name}. Avoid unofficial substitutes that request credentials or broad computer access.`, visual: 'judgment' },
      { title: 'Use a supported route instead', body: `Use ${model.name}'s official web, app, or API experience. The unavailable setup checkpoint grants its reward automatically so the learning path can continue.`, visual: 'growth' },
    ],
    quiz: { question: `What should you do when ${model.name} has no official ${methodName}?`, options: ['Use its supported official route', 'Install a random unofficial substitute', 'Share credentials with a download site', 'Disable computer security'], correctIndex: 0, explanation: 'Use a supported official route and avoid untrusted substitutes.' },
  }

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

export function recommendModel(answers: Record<string, number>) {
  const scores = Object.fromEntries(modelChoices.map((model) => [model.id, 0])) as Record<ModelId, number>

  for (const question of chooserQuestions) {
    const selected = answers[question.id]
    if (selected === undefined) continue
    const option = question.options[selected]
    for (const [modelId, score] of Object.entries(option.scores)) {
      scores[modelId as ModelId] += score ?? 0
    }
  }

  return modelChoices.reduce((best, model) => scores[model.id] > scores[best.id] ? model : best, modelChoices[0])
}
