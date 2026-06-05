import { twoPointers } from "./patterns/01-two-pointers"
import { Pattern } from "./types"

// Sidebar order follows hellointerview.com/learn/code curriculum
// To add a new pattern: create content/patterns/XX-name.ts, import it here, add to array
export const patterns: Pattern[] = [
  twoPointers,
  // 02-sliding-window
  // 03-binary-search
  // 04-stack
  // 05-linked-list
  // 06-trees
  // 07-tries
  // 08-heap
  // 09-backtracking
  // 10-graphs
  // 11-dynamic-programming-1d
  // 12-dynamic-programming-2d
  // 13-greedy
  // 14-intervals
  // 15-math-geometry
  // 16-bit-manipulation
]

export function getPattern(id: string): Pattern | undefined {
  return patterns.find((p) => p.id === id)
}

export function getFirstProblemId(pattern: Pattern): string {
  return pattern.problems[0].id
}
