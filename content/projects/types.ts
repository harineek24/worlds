export interface Blank {
  line: string // sentence with one key term replaced by ___
  answer: string
}

export interface TechnicalQA {
  question: string
  answer: string
}

export interface Project {
  id: string
  order: number
  name: string
  tagline: string // one-line description shown in sidebar/header
  repoUrl?: string
  techStack: string[]
  highLevelSummary: Blank[] // 2-4 complete sentences — the elevator pitch, spoken aloud
  workflowSummary: Blank[] // 5-10 complete sentences — detailed walkthrough with tech stack woven in, spoken aloud
  technicalQuestions: TechnicalQA[] // questions an interviewer might ask based on the summaries above, with model answers
}
