import { twoPointers } from "./patterns/01-two-pointers"
import { slidingWindow } from "./patterns/02-sliding-window"
import { intervals } from "./patterns/03-intervals"
import { stack } from "./patterns/04-stack"
import { linkedList } from "./patterns/05-linked-list"
import { heap } from "./patterns/07-heap"
import { bfs } from "./patterns/09-bfs"
import { graphs } from "./patterns/11-graphs"
import { greedy } from "./patterns/13-greedy"
import { Pattern } from "./types"

// Sidebar order follows hellointerview.com/learn/code curriculum
// To add a new pattern: create content/patterns/XX-name.ts, import it here, add to array
export const patterns: Pattern[] = [
  twoPointers,
  slidingWindow,
  intervals,
  stack,
  linkedList,
  // 06-binary-search (coming)
  heap,
  // 08-dfs (coming)
  bfs,
  // 10-backtracking (coming)
  graphs,
  // 12-dynamic-programming (coming)
  greedy,
  // 14-trie (coming)
  // 15-prefix-sum (coming)
  // 16-matrices (coming)
]

export function getPattern(id: string): Pattern | undefined {
  return patterns.find((p) => p.id === id)
}

export function getFirstProblemId(pattern: Pattern): string {
  return pattern.problems[0].id
}
