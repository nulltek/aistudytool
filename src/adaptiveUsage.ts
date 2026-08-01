import type { LessonContent, LessonSlide, LessonVisual } from './lessonData'
import type { ModelChoice, ModelId } from './modelGuide'

type CapabilityGuide = {
  product: string
  nativeSkills: boolean
  skillName: string
  skillHome: string
  skillMeaning: string
  skillBuild: string
  skillUse: string
  skillReview: string
  skillSource: string
  nativeInstructions: boolean
  instructionFile: string
  instructionMeaning: string
  instructionWrite: string
  instructionScope: string
  instructionCheck: string
  instructionSource: string
  nativeExtensions: boolean
  extensionName: string
  extensionMeaning: string
  extensionConnect: string
  extensionUse: string
  extensionReview: string
  extensionSource: string
}

const guides: Record<ModelId, CapabilityGuide> = {
  chatgpt: {
    product: 'Codex',
    nativeSkills: true,
    skillName: 'Agent Skills',
    skillHome: '.agents/skills/<skill-name>/SKILL.md',
    skillMeaning: 'Codex can discover a skill from its name and description, then load the full SKILL.md instructions only when the task matches.',
    skillBuild: 'Create one folder per skill. Add a SKILL.md with YAML frontmatter for name and description, followed by focused steps. Add scripts, references, or assets only when the workflow needs them.',
    skillUse: 'Ask Codex for a task that matches the skill description, or name the skill directly. A narrow description helps Codex choose it at the right time.',
    skillReview: 'Read the entire SKILL.md and inspect any bundled scripts before use. Check commands, network access, file targets, and whether the requested permissions match the job.',
    skillSource: 'https://developers.openai.com/codex/skills',
    nativeInstructions: true,
    instructionFile: 'AGENTS.md',
    instructionMeaning: 'Codex reads AGENTS.md before work. Use it for repository layout, build commands, tests, style rules, and boundaries that should apply across tasks.',
    instructionWrite: 'Put direct, testable rules in the repository root: where code lives, which command checks it, what must not change, and what completion means.',
    instructionScope: 'Codex combines instruction files from the repository root toward the current folder. A nearer AGENTS.md wins on conflicts, and AGENTS.override.md can replace guidance at its level.',
    instructionCheck: 'Start Codex in the target folder and ask it to summarize the active instructions before it edits anything.',
    instructionSource: 'https://developers.openai.com/codex/guides/agents-md',
    nativeExtensions: true,
    extensionName: 'plugins and MCP servers',
    extensionMeaning: 'Codex can gain reusable skills and connected tools through plugins. MCP servers expose tools and context from outside systems.',
    extensionConnect: 'Choose one trusted plugin or MCP server, inspect its documentation, then configure only the credentials and capabilities needed for one clear job.',
    extensionUse: 'Restart or reload Codex when the integration requires it. Test with a read-only request first and confirm the tool result before allowing writes.',
    extensionReview: 'Treat a plugin or MCP server like installed software. Review its publisher, source, permissions, data destinations, and any command it may run.',
    extensionSource: 'https://developers.openai.com/codex/mcp',
  },
  claude: {
    product: 'Claude Code',
    nativeSkills: true,
    skillName: 'Agent Skills',
    skillHome: '.claude/skills/<skill-name>/SKILL.md',
    skillMeaning: 'Claude Code can discover Agent Skills from their descriptions and load their SKILL.md instructions when a matching task appears.',
    skillBuild: 'Create a folder in .claude/skills and add SKILL.md. Give it a clear name, a precise description, and a small workflow. Plugin skills use the same SKILL.md shape inside a skills folder.',
    skillUse: 'Describe the intended task or invoke the skill directly. Keep each skill focused so Claude can select it without confusing it with nearby workflows.',
    skillReview: 'Inspect SKILL.md plus every referenced script and file. Skills can guide tool use, so verify commands, file access, network behavior, and expected output.',
    skillSource: 'https://code.claude.com/docs/en/plugins',
    nativeInstructions: true,
    instructionFile: 'CLAUDE.md',
    instructionMeaning: 'Claude Code uses CLAUDE.md for persistent project guidance. It does not natively use AGENTS.md as its main project-memory filename.',
    instructionWrite: 'Write short rules for commands, architecture, style, tests, and safety. If a team already maintains AGENTS.md, CLAUDE.md can import it with @AGENTS.md.',
    instructionScope: 'Place CLAUDE.md at the project root for shared rules and use more specific files where needed. Imported files let one source of truth feed the Claude guide.',
    instructionCheck: 'Ask Claude Code what project memory it loaded and verify the expected CLAUDE.md or imported AGENTS.md rules appear.',
    instructionSource: 'https://code.claude.com/docs/en/memory',
    nativeExtensions: true,
    extensionName: 'Claude Code plugins and MCP servers',
    extensionMeaning: 'A Claude Code plugin can package skills, agents, commands, hooks, MCP servers, and language-server configuration.',
    extensionConnect: 'Install one plugin from a trusted marketplace or configure one known MCP server. Read its manifest and keep its initial access narrow.',
    extensionUse: 'Test a harmless read action first. Confirm which plugin component or MCP tool Claude plans to call before approving a state-changing action.',
    extensionReview: 'Plugins may run hooks or connect services. Inspect the source, commands, MCP endpoints, secrets, and permissions before enabling them.',
    extensionSource: 'https://code.claude.com/docs/en/plugins-reference',
  },
  gemini: {
    product: 'Gemini CLI',
    nativeSkills: true,
    skillName: 'Agent Skills',
    skillHome: '.gemini/skills/<skill-name>/SKILL.md or .agents/skills/<skill-name>/SKILL.md',
    skillMeaning: 'Gemini CLI discovers skills from workspace or user skill folders, then activates the detailed SKILL.md guidance when a task matches.',
    skillBuild: 'Create a skill folder in .gemini/skills or .agents/skills. Add SKILL.md with a name, description, and focused instructions. Keep optional resources beside it.',
    skillUse: 'Ask for a matching task and let Gemini activate the skill, or use the skill-management commands to inspect what is available.',
    skillReview: 'Read the skill instructions and every included resource. Check shell commands, dependencies, file scope, and network behavior before activation.',
    skillSource: 'https://geminicli.com/docs/cli/creating-skills/',
    nativeInstructions: true,
    instructionFile: 'GEMINI.md',
    instructionMeaning: 'Gemini CLI reads GEMINI.md as hierarchical instructional context for the project and surrounding folders.',
    instructionWrite: 'Record the project purpose, important folders, commands, conventions, and validation steps in direct language. Keep task-specific detail close to the code it affects.',
    instructionScope: 'Gemini can load global and project context, including more specific files in subdirectories. Organize rules so broad guidance stays high and local exceptions stay near their files.',
    instructionCheck: 'Use Gemini CLI memory commands or ask it to summarize loaded context, then confirm the expected GEMINI.md rules are present.',
    instructionSource: 'https://geminicli.com/docs/cli/gemini-md/',
    nativeExtensions: true,
    extensionName: 'Gemini CLI extensions',
    extensionMeaning: 'A Gemini CLI extension can bundle prompts, skills, custom commands, MCP servers, settings, and a GEMINI.md context file.',
    extensionConnect: 'Install a trusted extension repository with gemini extensions install <repo-url>, then restart Gemini CLI so the new components load.',
    extensionUse: 'Inspect the loaded extension and begin with a read-only task. Confirm any MCP server or command does exactly what the extension claims.',
    extensionReview: 'An extension is third-party code. Review its repository, manifest, MCP configuration, commands, secrets, and requested access before installing.',
    extensionSource: 'https://geminicli.com/docs/extensions/',
  },
  'llama-local': {
    product: 'Ollama with Llama',
    nativeSkills: false,
    skillName: 'reusable prompt workflows',
    skillHome: 'Your app or wrapper project; Ollama has no native Agent Skills folder',
    skillMeaning: 'Ollama runs models and exposes an API, but it does not load Agent Skills by itself. Reusable workflows belong in your client app, prompt templates, or an agent wrapper that supports skills.',
    skillBuild: 'Store a focused prompt template and any helper code in your own project. If your wrapper supports SKILL.md, follow that wrapper convention rather than assuming Ollama reads it.',
    skillUse: 'Your client must select the workflow and send its instructions to the Llama model. Ollama only sees the messages and tools included in the request.',
    skillReview: 'Audit the wrapper, prompt, helper code, and tools as one unit. Local execution protects some data, but unsafe commands can still damage local files.',
    skillSource: 'https://docs.ollama.com/api/introduction',
    nativeInstructions: false,
    instructionFile: 'Modelfile with SYSTEM',
    instructionMeaning: 'Ollama does not natively scan AGENTS.md. A Modelfile SYSTEM instruction can define persistent behavior for a custom local model.',
    instructionWrite: 'Create a Modelfile with FROM and SYSTEM instructions, keep the rules concise, then build it with ollama create my-assistant -f Modelfile.',
    instructionScope: 'A Modelfile applies to the model you create, not automatically to repository folders. A coding wrapper must read AGENTS.md itself and include those rules in the request.',
    instructionCheck: 'Run ollama show --modelfile my-assistant and test a small prompt that should clearly follow one SYSTEM rule.',
    instructionSource: 'https://docs.ollama.com/modelfile',
    nativeExtensions: false,
    extensionName: 'API tools and integrations',
    extensionMeaning: 'Ollama has no extension marketplace. Its chat API supports tool calling, while your application defines and executes each tool.',
    extensionConnect: 'Define one narrow function schema in your client, send it with the chat request, and execute it only after validating the model arguments.',
    extensionUse: 'Start with a read-only local tool. Log the requested call, validate inputs, run the function in your application, then return the result to the model.',
    extensionReview: 'Use allowlists, strict input validation, timeouts, and least privilege. A local model must never receive unlimited command or filesystem access.',
    extensionSource: 'https://docs.ollama.com/capabilities/tool-calling',
  },
  deepseek: {
    product: 'DeepSeek API',
    nativeSkills: false,
    skillName: 'reusable client-side workflows',
    skillHome: 'Your application repository; DeepSeek has no native Agent Skills folder',
    skillMeaning: 'DeepSeek models receive messages through the app or API. They do not discover SKILL.md folders by themselves, so your client must load any reusable workflow.',
    skillBuild: 'Create a versioned prompt template or workflow module in your application. Give it a narrow purpose, clear inputs, safe outputs, and tests.',
    skillUse: 'Have the client select the workflow, add it to the system or user messages, then send the request to DeepSeek. The model only knows context that the client provides.',
    skillReview: 'Inspect the template, code, API destinations, logging, and secret handling. Never place an API key or private user data inside a reusable prompt file.',
    skillSource: 'https://api-docs.deepseek.com/',
    nativeInstructions: false,
    instructionFile: 'a client-loaded project guide',
    instructionMeaning: 'DeepSeek does not natively scan AGENTS.md. An agent client can read AGENTS.md or another project guide and add the relevant rules to the model context.',
    instructionWrite: 'Keep project rules in version control, then make the client load only the instructions needed for the current task. Separate policy from user-provided content.',
    instructionScope: 'Scope and precedence are responsibilities of your client or agent framework. Define which root and nested files win, and keep the behavior deterministic.',
    instructionCheck: 'Log which guide files were loaded without logging secrets, then ask the model to summarize the active constraints before a test task.',
    instructionSource: 'https://api-docs.deepseek.com/',
    nativeExtensions: false,
    extensionName: 'API tool calls',
    extensionMeaning: 'DeepSeek supports tool calls through its API, but your application must define each function and execute the requested operation.',
    extensionConnect: 'Describe one function in the tools request field, validate returned arguments, run the function in your code, and send the result back for the final answer.',
    extensionUse: 'Test with a harmless function and deterministic inputs. Treat the model output as a request, not permission to execute automatically.',
    extensionReview: 'Allowlist functions, validate every argument, protect credentials, require approval for writes, and record failures without leaking sensitive data.',
    extensionSource: 'https://api-docs.deepseek.com/guides/tool_calls',
  },
}

function slides(items: Array<[string, string, LessonVisual]>): LessonSlide[] {
  return items.map(([title, body, visual]) => ({ title, body, visual }))
}

function skillLesson(base: LessonContent, guide: CapabilityGuide): LessonContent {
  if (base.id === 'skills-understand') return {
    ...base,
    title: `${guide.skillName} in ${guide.product}`,
    shortTitle: `${guide.product} skills`,
    sourceUrl: guide.skillSource,
    slides: slides([
      [guide.nativeSkills ? `${guide.product} supports ${guide.skillName}` : `${guide.product} needs a client-side equivalent`, guide.skillMeaning, 'model'],
      ['Know where the workflow lives', guide.skillHome, 'patterns'],
      ['Activation is part of the design', guide.skillUse, 'prompts'],
    ]),
    quiz: {
      question: `How does ${guide.product} get reusable specialist instructions?`,
      options: guide.nativeSkills
        ? [`From ${guide.skillName} stored in its supported skill folders`, 'By guessing hidden project rules', 'From any random file on the computer', 'Only by changing the model weights']
        : ['The client or agent wrapper must load and send them', 'Ollama or DeepSeek scans every SKILL.md automatically', 'The model reads the whole disk', 'They appear without configuration'],
      correctIndex: 0,
      explanation: guide.nativeSkills ? `${guide.product} has a supported skill-loading convention.` : `${guide.product} needs the surrounding application or wrapper to supply reusable workflow instructions.`,
    },
  }
  if (base.id === 'skills-create') return {
    ...base,
    title: `Create a ${guide.product} workflow`,
    shortTitle: `Build for ${guide.product}`,
    sourceUrl: guide.skillSource,
    slides: slides([
      ['Start with one repeated job', 'Choose a task with a clear trigger, input, process, and checkable result. One focused workflow is easier to select and safer to maintain.', 'intro'],
      [guide.nativeSkills ? 'Build the skill in the supported shape' : 'Build the workflow in your client', guide.skillBuild, 'prompts'],
      ['Test the activation path', guide.skillUse, 'growth'],
    ]),
    quiz: { question: 'What makes a reusable AI workflow easier to trust?', options: ['One focused purpose with clear inputs and checks', 'A vague description that fits everything', 'Hidden scripts nobody reviews', 'Unlimited access by default'], correctIndex: 0, explanation: 'Narrow purpose, explicit inputs, and a checkable result make a workflow easier to select, test, and review.' },
  }
  return {
    ...base,
    title: `Review ${guide.product} workflows`,
    shortTitle: `Review for ${guide.product}`,
    sourceUrl: guide.skillSource,
    slides: slides([
      ['Instructions can cause real actions', `${guide.skillName} may guide the AI toward files, tools, or commands. Treat every imported workflow as code you are considering running.`, 'judgment'],
      ['Inspect the whole bundle', guide.skillReview, 'patterns'],
      ['Test with the smallest safe task', 'Use sample data, prefer read-only access, watch the tool plan, and confirm the result before allowing broader permissions.', 'growth'],
    ]),
    quiz: { question: `What should you do before trusting a ${guide.product} workflow?`, options: ['Inspect its instructions, resources, commands, and access', 'Approve every request immediately', 'Assume local means harmless', 'Ignore referenced scripts'], correctIndex: 0, explanation: 'A workflow is only as safe as its instructions, bundled resources, commands, and permissions.' },
  }
}

function instructionLesson(base: LessonContent, guide: CapabilityGuide): LessonContent {
  if (base.id === 'instructions-understand') return {
    ...base,
    title: `${guide.product}'s project guide`,
    shortTitle: guide.instructionFile,
    sourceUrl: guide.instructionSource,
    slides: slides([
      [guide.nativeInstructions ? `${guide.product} reads ${guide.instructionFile}` : `${guide.product} needs ${guide.instructionFile} supplied`, guide.instructionMeaning, 'history'],
      ['Use it for durable context', 'Project guidance should explain the repository, normal commands, validation steps, style, and safety boundaries that apply to many tasks.', 'patterns'],
      ['Do not bury the task', 'Keep the guide stable and compact. Put one-off requests in the current prompt so permanent rules stay easy to understand.', 'tokens'],
    ]),
    quiz: { question: `Which project guide is correct for ${guide.product}?`, options: [guide.instructionFile, 'A file chosen at random', 'Every text file on the computer', 'No context is ever needed'], correctIndex: 0, explanation: `${guide.instructionFile} is the right convention or client-managed equivalent for this setup.` },
  }
  if (base.id === 'instructions-write') return {
    ...base,
    title: `Write ${guide.instructionFile} well`,
    shortTitle: `Write ${guide.instructionFile}`,
    sourceUrl: guide.instructionSource,
    slides: slides([
      ['Lead with facts the AI can act on', guide.instructionWrite, 'prompts'],
      ['Turn preferences into checks', 'Replace vague rules like make it good with observable rules: run this test, keep this interface, use this formatter, and do not edit that folder.', 'judgment'],
      ['Keep secrets out', 'Never put passwords, tokens, private keys, or personal data in a committed project guide. Reference secure setup steps instead.', 'tokens'],
    ]),
    quiz: { question: 'Which project rule is most useful?', options: ['Run npm test and fix failures before completion', 'Make it amazing', 'Read my mind', 'Use any secret you find'], correctIndex: 0, explanation: 'A command plus a clear success condition is specific and testable.' },
  }
  return {
    ...base,
    title: `Scope rules in ${guide.product}`,
    shortTitle: `${guide.product} scope`,
    sourceUrl: guide.instructionSource,
    slides: slides([
      ['Know where rules apply', guide.instructionScope, 'patterns'],
      ['Resolve conflicts deliberately', 'Keep broad rules at the project level and narrow exceptions close to the affected work. Document precedence instead of relying on guessing.', 'model'],
      ['Verify before the real task', guide.instructionCheck, 'judgment'],
    ]),
    quiz: { question: 'How should project instruction conflicts be handled?', options: ['Use a documented, deterministic precedence rule', 'Let the model pick randomly', 'Duplicate every rule everywhere', 'Ignore local constraints'], correctIndex: 0, explanation: 'Predictable scope and precedence make agent behavior easier to understand and review.' },
  }
}

function extensionLesson(base: LessonContent, guide: CapabilityGuide): LessonContent {
  if (base.id === 'extensions-understand') return {
    ...base,
    title: `${guide.extensionName} in ${guide.product}`,
    shortTitle: `${guide.product} tools`,
    sourceUrl: guide.extensionSource,
    slides: slides([
      [guide.nativeExtensions ? `${guide.product} has a native extension path` : `${guide.product} uses app-managed integrations`, guide.extensionMeaning, 'growth'],
      ['An integration crosses a boundary', 'The model may gain access to outside data or actions. The surrounding app still controls credentials, permissions, execution, and returned results.', 'patterns'],
      ['Start narrow', 'Connect one tool for one purpose. Prefer read-only access until the behavior, output, and failure path are understood.', 'judgment'],
    ]),
    quiz: { question: `What is the integration path for ${guide.product}?`, options: [guide.extensionName, 'Unlimited operating-system access', 'A secret ability with no setup', 'Random browser downloads'], correctIndex: 0, explanation: `${guide.product} uses ${guide.extensionName} for this kind of connected capability.` },
  }
  if (base.id === 'extensions-connect') return {
    ...base,
    title: `Connect a tool to ${guide.product}`,
    shortTitle: `Connect to ${guide.product}`,
    sourceUrl: guide.extensionSource,
    slides: slides([
      ['Pick one useful connection', 'Choose a trusted integration that removes a real repeated step. Write down the data it reads, the actions it can take, and who owns it.', 'intro'],
      ['Follow the real setup path', guide.extensionConnect, 'model'],
      ['Prove it with a safe test', guide.extensionUse, 'growth'],
    ]),
    quiz: { question: 'What is the safest first integration test?', options: ['A harmless, read-only task with known output', 'Deleting production data', 'Granting every permission', 'Sending real secrets through a sample prompt'], correctIndex: 0, explanation: 'A small read-only test proves the connection while limiting damage from mistakes.' },
  }
  return {
    ...base,
    title: `Secure ${guide.product} extensions`,
    shortTitle: `${guide.product} safety`,
    sourceUrl: guide.extensionSource,
    slides: slides([
      ['More reach means more responsibility', `${guide.extensionName} can connect model output to real data and actions. Every new permission expands what a mistake or malicious instruction could affect.`, 'judgment'],
      ['Audit before enabling', guide.extensionReview, 'patterns'],
      ['Keep a human approval boundary', 'Require confirmation for messages, purchases, deletion, publishing, permission changes, or any other costly or irreversible action.', 'judgment'],
    ]),
    quiz: { question: 'Which action needs a human approval boundary?', options: ['Deleting or publishing real data', 'Reading a public help page', 'Formatting sample text', 'Explaining a harmless concept'], correctIndex: 0, explanation: 'Costly, external, sensitive, and irreversible actions should stay behind explicit approval.' },
  }
}

export function makeAdaptiveUsageLesson(base: LessonContent, model: ModelChoice): LessonContent {
  const guide = guides[model.id]
  if (base.id.startsWith('skills-')) return skillLesson(base, guide)
  if (base.id.startsWith('instructions-')) return instructionLesson(base, guide)
  return extensionLesson(base, guide)
}
