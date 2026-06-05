export interface Blank {
  line: string
  answer: string
}

export interface TestCase {
  input: string
  expected: string
  trace: string[]
  traceExplanations: string[] // interviewer-voice explanation of each trace step
}

export interface Problem {
  id: string
  title: string
  difficulty: "easy" | "medium" | "hard"
  prompt: string
  patternKeywords: string[] // shown on right side of problem row
  solution: string // full code
  solutionExplanation: string[] // line-by-line, interviewer voice, matches solution lines
  testCase: TestCase
  blanks: Blank[] // for challenge page
}

export interface PythonTool {
  name: string
  snippet: string
}

export interface Pattern {
  id: string
  order: number
  patternName: string
  philosophy: {
    text: string
    source: string
    connection: string
  }
  template: {
    description: string
    snippet: string
  }
  pythonTools: PythonTool[]
  problems: Problem[]
}
