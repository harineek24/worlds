// localStorage for now — swap the two functions below for Supabase calls when ready

export type ProblemStatus = "unseen" | "studied" | "challenged" | "clean"

const KEY = "worlds_progress"

function load(): Record<string, ProblemStatus> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}")
  } catch {
    return {}
  }
}

export function getStatus(problemId: string): ProblemStatus {
  return load()[problemId] ?? "unseen"
}

export function setStatus(problemId: string, status: ProblemStatus) {
  const data = load()
  data[problemId] = status
  localStorage.setItem(KEY, JSON.stringify(data))
}
