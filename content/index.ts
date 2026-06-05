import { twoPointers } from "./patterns/01-two-pointers"
import { slidingWindow } from "./patterns/02-sliding-window"
import { intervals } from "./patterns/03-intervals"
import { stack } from "./patterns/04-stack"
import { linkedList } from "./patterns/05-linked-list"
import { binarySearch } from "./patterns/06-binary-search"
import { heap } from "./patterns/07-heap"
import { dfs } from "./patterns/08-dfs"
import { bfs } from "./patterns/09-bfs"
import { backtracking } from "./patterns/10-backtracking"
import { graphs } from "./patterns/11-graphs"
import { dynamicProgramming } from "./patterns/12-dynamic-programming"
import { greedy } from "./patterns/13-greedy"
import { trie } from "./patterns/14-trie"
import { prefixSum } from "./patterns/15-prefix-sum"
import { matrices } from "./patterns/16-matrices"
import { Pattern } from "./types"

// Sidebar order follows hellointerview.com/learn/code curriculum
// To add a new pattern: create content/patterns/XX-name.ts, import it here, add to array
export const patterns: Pattern[] = [
  twoPointers,
  slidingWindow,
  intervals,
  stack,
  linkedList,
  binarySearch,
  heap,
  dfs,
  bfs,
  backtracking,
  graphs,
  dynamicProgramming,
  greedy,
  trie,
  prefixSum,
  matrices,
]

export function getPattern(id: string): Pattern | undefined {
  return patterns.find((p) => p.id === id)
}

export function getFirstProblemId(pattern: Pattern): string {
  return pattern.problems[0].id
}
