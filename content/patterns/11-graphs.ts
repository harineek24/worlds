import { Pattern } from "../types"

export const graphs: Pattern = {
  id: "graphs",
  order: 11,
  patternName: "Graphs",

  philosophy: {
    text: "No man is an island, entire of itself; every man is a piece of the continent.",
    source: "John Donne, Devotions upon Emergent Occasions",
    connection:
      "Graphs model relationships — nothing exists in isolation. A node's meaning comes from its connections. Traversal is the act of following those connections to reveal hidden structure: cycles, reachability, ordering, shortest paths. When you understand a node's neighbors, you begin to understand the graph.",
  },

  template: {
    description:
      "Build an adjacency list, then traverse with DFS (recursive/stack) or BFS (queue). For directed graphs, track in-degrees for topological sort. For weighted graphs, use a min-heap for Dijkstra.",
    snippet: `# Build adjacency list
graph = defaultdict(list)
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)  # undirected

# DFS on graph
def dfs(node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited)

# Topological sort (Kahn's algorithm — BFS-based)
in_degree = {node: 0 for node in graph}
for node in graph:
    for neighbor in graph[node]:
        in_degree[neighbor] += 1

queue = deque([n for n in in_degree if in_degree[n] == 0])
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for neighbor in graph[node]:
        in_degree[neighbor] -= 1
        if in_degree[neighbor] == 0:
            queue.append(neighbor)`,
  },

  pythonTools: [
    {
      name: "defaultdict(list) for adjacency list",
      snippet: `from collections import defaultdict\ngraph = defaultdict(list)\nfor u, v in edges:\n    graph[u].append(v)`,
    },
    {
      name: "visited = set() — O(1) lookup",
      snippet: `visited = set()\nvisited.add(node)  # mark\nif node not in visited:  # check`,
    },
    {
      name: "In-degree array for topological sort",
      snippet: `in_degree = [0] * num_nodes\nfor u, v in edges:\n    in_degree[v] += 1\nqueue = deque([i for i in range(num_nodes) if in_degree[i] == 0])`,
    },
    {
      name: "Dijkstra: heapq with (distance, node) tuples",
      snippet: `import heapq\ndist = {node: float('inf') for node in graph}\ndist[src] = 0\nheap = [(0, src)]\nwhile heap:\n    d, node = heapq.heappop(heap)\n    if d > dist[node]: continue\n    for neighbor, weight in graph[node]:\n        if dist[node] + weight < dist[neighbor]:\n            dist[neighbor] = dist[node] + weight\n            heapq.heappush(heap, (dist[neighbor], neighbor))`,
    },
  ],

  problems: [
    {
      id: "course-schedule",
      title: "Course Schedule",
      difficulty: "medium",
      prompt:
        "There are numCourses courses labeled from 0 to numCourses-1. You are given an array prerequisites where prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all courses, otherwise return false.",
      patternKeywords: ["cycle detection", "directed graph", "prerequisites", "topological sort"],
      solution: `from collections import defaultdict, deque

graph = defaultdict(list)
in_degree = [0] * numCourses
for a, b in prerequisites:
    graph[b].append(a)
    in_degree[a] += 1

queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
completed = 0
while queue:
    node = queue.popleft()
    completed += 1
    for neighbor in graph[node]:
        in_degree[neighbor] -= 1
        if in_degree[neighbor] == 0:
            queue.append(neighbor)

return completed == numCourses`,
      solutionExplanation: [
        "I'm building a directed graph where an edge from b to a means 'b must come before a'. I also track in-degrees — how many prerequisites each course has.",
        "I seed the BFS queue with every course that has no prerequisites. These are the safe starting points — they can be taken immediately.",
        "I process each node by removing it from the graph: decrement the in-degree of all its neighbors. When a neighbor's in-degree hits zero, all its prerequisites are done — it becomes available and joins the queue.",
        "I count how many courses I complete. If I complete all numCourses, the graph was a DAG — no cycle. If I stop short, some courses are stuck in a cycle and can never have in-degree zero. The cycle made it impossible to finish.",
      ],
      testCase: {
        input: `numCourses = 4, prerequisites = [[1,0],[2,1],[3,2]]`,
        expected: "True",
        trace: [
          "graph: 0→[1], 1→[2], 2→[3]",
          "in_degree: [0, 1, 1, 1]",
          "queue: [0]  (only course 0 has no prerequisites)",
          "pop 0  completed=1  in_degree[1]-- → 0  queue=[1]",
          "pop 1  completed=2  in_degree[2]-- → 0  queue=[2]",
          "pop 2  completed=3  in_degree[3]-- → 0  queue=[3]",
          "pop 3  completed=4  no neighbors  queue=[]",
          "completed=4 == numCourses=4 → return True",
        ],
        traceExplanations: [
          "The graph is a simple chain: 0 must come before 1, 1 before 2, 2 before 3.",
          "Only course 0 has no prerequisites — in-degree 0. All others depend on exactly one course.",
          "Start BFS from course 0 — the only immediately available course.",
          "Completing course 0 unlocks course 1. Its in-degree drops to zero, so it joins the queue.",
          "Completing course 1 unlocks course 2. Each step in the chain unlocks the next.",
          "Completing course 2 unlocks course 3. The chain propagates perfectly.",
          "Completing course 3 — it has no dependents. Queue empties.",
          "All 4 courses completed. Linear chain has no cycle — every course was reachable.",
        ],
      },
      blanks: [
        { line: `for ___, b in prerequisites:`, answer: "a" },
        { line: `graph[b].append(___)`, answer: "a" },
        { line: `in_degree[___] += 1`, answer: "a" },
        { line: `queue = deque([i for i in range(numCourses) if in_degree[i] == ___])`, answer: "0" },
        { line: `in_degree[neighbor] ___ 1`, answer: "-=" },
        { line: `return completed == ___`, answer: "numCourses" },
      ],
    },

    {
      id: "course-schedule-ii",
      title: "Course Schedule II",
      difficulty: "medium",
      prompt:
        "There are numCourses courses labeled from 0 to numCourses-1. Given prerequisites where prerequisites[i] = [a, b] means b must come before a, return the ordering of courses you should take to finish all courses. If it is impossible to finish all courses, return an empty array.",
      patternKeywords: ["topological order", "cycle detection", "directed graph", "Kahn's algorithm"],
      solution: `from collections import defaultdict, deque

graph = defaultdict(list)
in_degree = [0] * numCourses
for a, b in prerequisites:
    graph[b].append(a)
    in_degree[a] += 1

queue = deque([i for i in range(numCourses) if in_degree[i] == 0])
order = []
while queue:
    node = queue.popleft()
    order.append(node)
    for neighbor in graph[node]:
        in_degree[neighbor] -= 1
        if in_degree[neighbor] == 0:
            queue.append(neighbor)

return order if len(order) == numCourses else []`,
      solutionExplanation: [
        "This is the same Kahn's algorithm as Course Schedule I, but now I record the order of processing instead of just counting. Every node I pop from the queue is appended to the result — that's the valid topological order.",
        "Nodes are popped in a valid order by construction: when a node enters the queue, all its prerequisites have already been processed and appended before it.",
        "At the end, I check the same cycle-detection condition: if the order contains all courses, a valid ordering exists. If it's shorter, there's a cycle and some courses are unreachable — return empty array.",
      ],
      testCase: {
        input: `numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]`,
        expected: "[0, 1, 2, 3] or [0, 2, 1, 3]",
        trace: [
          "graph: 0→[1,2], 1→[3], 2→[3]",
          "in_degree: [0, 1, 1, 2]",
          "queue: [0]",
          "pop 0  order=[0]  in_degree[1]--→0, in_degree[2]--→0  queue=[1,2]",
          "pop 1  order=[0,1]  in_degree[3]--→1  queue=[2]",
          "pop 2  order=[0,1,2]  in_degree[3]--→0  queue=[3]",
          "pop 3  order=[0,1,2,3]  no neighbors  queue=[]",
          "len(order)=4 == numCourses=4 → return [0,1,2,3]",
        ],
        traceExplanations: [
          "Course 0 has no prerequisites. Courses 1 and 2 both require course 0. Course 3 requires both 1 and 2.",
          "Course 3 has in-degree 2 — it has two prerequisites that must both complete first.",
          "Only course 0 is immediately available.",
          "Taking course 0 unlocks both course 1 and course 2. Both join the queue. Course 3 still blocked.",
          "Take course 1 — it reduces course 3's in-degree from 2 to 1. Course 3 is still blocked (needs course 2 too).",
          "Take course 2 — reduces course 3's in-degree to 0. Now all of course 3's prerequisites are done — it's available.",
          "Take course 3 last. The order respects all dependency constraints.",
          "All 4 courses appear in the order. Valid topological sort found.",
        ],
      },
      blanks: [
        { line: `order = ___`, answer: "[]" },
        { line: `order.___(node)`, answer: "append" },
        { line: `in_degree[neighbor] -= ___`, answer: "1" },
        { line: `if in_degree[neighbor] == ___:`, answer: "0" },
        { line: `return order if len(order) == ___ else []`, answer: "numCourses" },
      ],
    },

    {
      id: "number-of-islands",
      title: "Number of Islands",
      difficulty: "medium",
      prompt:
        "Given an m x n 2D binary grid of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
      patternKeywords: ["connected components", "flood fill", "DFS", "grid traversal"],
      solution: `def dfs(grid, r, c):
    if r < 0 or r >= len(grid) or c < 0 or c >= len(grid[0]):
        return
    if grid[r][c] != '1':
        return
    grid[r][c] = '0'  # mark visited
    dfs(grid, r+1, c)
    dfs(grid, r-1, c)
    dfs(grid, r, c+1)
    dfs(grid, r, c-1)

count = 0
for r in range(len(grid)):
    for c in range(len(grid[0])):
        if grid[r][c] == '1':
            dfs(grid, r, c)
            count += 1
return count`,
      solutionExplanation: [
        "I'm scanning the grid for any unvisited land cell. Each time I find one, I know I've discovered a new island — I increment the count and immediately flood-fill the entire island so I never count it again.",
        "The flood fill DFS marks every connected land cell as visited by changing it from '1' to '0'. This destroys the island in-place — no separate visited set needed, and the next scan step will skip these cells entirely.",
        "The base cases terminate the DFS: out-of-bounds means we've reached the edge of the map, and non-'1' means we've hit water or already-visited land. Either way, stop recursing in that direction.",
        "By the time we scan every cell, each island has been discovered exactly once — on the first land cell we encountered belonging to it. All subsequent cells of that island were already turned to '0'.",
      ],
      testCase: {
        input: `grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]`,
        expected: "3",
        trace: [
          "r=0,c=0  grid[0][0]='1' → DFS flood fill island 1  count=1",
          "  DFS marks (0,0),(0,1),(1,0),(1,1) → all become '0'",
          "r=0,c=1  grid[0][1]='0' now → skip",
          "r=2,c=2  grid[2][2]='1' → DFS flood fill island 2  count=2",
          "  DFS marks (2,2) → becomes '0' (isolated cell)",
          "r=3,c=3  grid[3][3]='1' → DFS flood fill island 3  count=3",
          "  DFS marks (3,3),(3,4) → both become '0'",
          "return 3",
        ],
        traceExplanations: [
          "First land cell found at (0,0). This is the entry point for island 1. We launch DFS from here.",
          "The DFS expands in all four directions, marking the entire connected component. The 2x2 block of land in the top-left is one island.",
          "When we continue the scan and reach (0,1), it's already been turned to '0' by the DFS. We skip it — this is how we avoid double-counting.",
          "The isolated land cell at (2,2) is untouched — a separate island. DFS from here finds no neighbors.",
          "Single-cell island: DFS terminates immediately after marking the one cell.",
          "The two connected cells at (3,3) and (3,4) form the third island.",
          "DFS marks both cells in island 3. Scan completes — three islands found.",
          "Three connected components of '1's, each discovered and consumed exactly once.",
        ],
      },
      blanks: [
        { line: `if grid[r][c] != ___:`, answer: "'1'" },
        { line: `grid[r][c] = ___  # mark visited`, answer: "'0'" },
        { line: `if grid[r][c] == ___:`, answer: "'1'" },
        { line: `dfs(grid, r, c)\n            count += ___`, answer: "1" },
      ],
    },

    {
      id: "pacific-atlantic",
      title: "Pacific Atlantic Water Flow",
      difficulty: "medium",
      prompt:
        "There is an m x n rectangular island that borders both the Pacific and Atlantic oceans. Given an m x n integer matrix heights, return a list of grid coordinates where rain water can flow to both the Pacific and Atlantic oceans. Water can flow from a cell to an adjacent cell if the adjacent cell's height is less than or equal to the current cell's height.",
      patternKeywords: ["multi-source BFS", "reachability", "reverse flow", "set intersection"],
      solution: `from collections import deque

rows, cols = len(heights), len(heights[0])

def bfs(starts):
    visited = set(starts)
    queue = deque(starts)
    while queue:
        r, c = queue.popleft()
        for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if (nr, nc) not in visited and heights[nr][nc] >= heights[r][c]:
                    visited.add((nr, nc))
                    queue.append((nr, nc))
    return visited

pacific_starts = [(r, 0) for r in range(rows)] + [(0, c) for c in range(cols)]
atlantic_starts = [(r, cols-1) for r in range(rows)] + [(rows-1, c) for c in range(cols)]

pacific = bfs(pacific_starts)
atlantic = bfs(atlantic_starts)

return [list(cell) for cell in pacific & atlantic]`,
      solutionExplanation: [
        "The key insight is to reverse the problem. Instead of asking 'can water flow out from this cell to the ocean?', I ask 'which cells can water flow into from the ocean?' Going backwards means I travel uphill — from ocean border cells inward, following cells of equal or greater height.",
        "I use multi-source BFS: seed the queue with all cells touching each ocean simultaneously, then expand inward. Any cell reachable from the Pacific border (going uphill) is a cell that can drain to the Pacific.",
        "The condition `heights[nr][nc] >= heights[r][c]` is the reversed inequality — in reverse flow, we move to cells that are at least as high, meaning water could have flowed down from there toward us.",
        "I run BFS twice — once for Pacific, once for Atlantic — and return the intersection. A cell in both sets can drain to both oceans, which is exactly what the problem asks.",
      ],
      testCase: {
        input: `heights = [\n  [1,2,2,3,5],\n  [3,2,3,4,4],\n  [2,4,5,3,1],\n  [6,7,1,4,5],\n  [5,1,1,2,4]\n]`,
        expected: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        trace: [
          "Pacific border: top row + left column",
          "Atlantic border: bottom row + right column",
          "BFS from Pacific expands inward following >= height rule",
          "BFS from Atlantic expands inward following >= height rule",
          "Pacific reachable: large set including top-left region and high-elevation cells",
          "Atlantic reachable: large set including bottom-right region and high-elevation cells",
          "Intersection: cells high enough to drain both ways",
          "return [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        ],
        traceExplanations: [
          "The Pacific touches the top and left edges — these are our starting points for reverse BFS.",
          "The Atlantic touches the bottom and right edges — these are our starting points for the second reverse BFS.",
          "Reverse BFS from Pacific: we can move to any neighboring cell with height >= current. This finds all cells that could eventually drain downhill to the Pacific.",
          "Same logic for Atlantic — find all cells that can drain to the bottom or right edge.",
          "High-elevation cells in the interior can drain to the Pacific because water flows downhill from them toward the top/left.",
          "Those same high cells can also drain to the Atlantic toward the bottom/right.",
          "The set intersection is cells reachable from both directions — the ridge and peaks of the island.",
          "Each cell in the result is a watershed point: high enough that gravity carries water to both coasts.",
        ],
      },
      blanks: [
        { line: `def bfs(___):`, answer: "starts" },
        { line: `visited = set(___)`, answer: "starts" },
        { line: `if (nr, nc) not in visited and heights[nr][nc] ___ heights[r][c]:`, answer: ">=" },
        { line: `pacific_starts = [(r, 0) for r in range(rows)] + [(0, c) for c in range(___)]`, answer: "cols" },
        { line: `atlantic_starts = [(r, cols-1) for r in range(rows)] + [(rows-1, c) for c in range(___)]`, answer: "cols" },
        { line: `return [list(cell) for cell in pacific ___ atlantic]`, answer: "&" },
      ],
    },

    {
      id: "network-delay-time",
      title: "Network Delay Time",
      difficulty: "medium",
      prompt:
        "You are given a network of n nodes labeled from 1 to n. You are given times, a list of travel times as directed edges times[i] = [ui, vi, wi] where ui is the source, vi is the target, and wi is the time. We will send a signal from node k. Return the minimum time it takes for all n nodes to receive the signal. If it is impossible for all n nodes to receive the signal, return -1.",
      patternKeywords: ["shortest path", "Dijkstra", "weighted graph", "min-heap"],
      solution: `import heapq
from collections import defaultdict

graph = defaultdict(list)
for u, v, w in times:
    graph[u].append((v, w))

dist = {i: float('inf') for i in range(1, n+1)}
dist[k] = 0
heap = [(0, k)]

while heap:
    d, node = heapq.heappop(heap)
    if d > dist[node]:
        continue
    for neighbor, weight in graph[node]:
        new_dist = dist[node] + weight
        if new_dist < dist[neighbor]:
            dist[neighbor] = new_dist
            heapq.heappush(heap, (new_dist, neighbor))

max_dist = max(dist.values())
return max_dist if max_dist < float('inf') else -1`,
      solutionExplanation: [
        "I'm running Dijkstra's algorithm from the source node k. Dijkstra finds the shortest path to every node by always expanding the currently closest unvisited node — the min-heap guarantees we always process the nearest node next.",
        "I initialize all distances to infinity except the source, which is 0. The heap starts with just (0, k) — cost zero to reach k from itself.",
        "The stale-entry check `if d > dist[node]: continue` is the lazy deletion pattern. I never remove old entries from the heap — I just skip them if we've already found a better path to that node. This keeps the heap simple.",
        "For each node I pop, I relax all its outgoing edges: if going through this node gives a shorter path to a neighbor, I update and push the new distance. The heap ensures we process shorter distances first — when a node is popped with its true shortest distance, all its relaxations are final.",
        "The answer is the maximum shortest distance across all nodes — the signal reaches the last node at this time. If any node is still infinity, it's unreachable — return -1.",
      ],
      testCase: {
        input: `times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2`,
        expected: "2",
        trace: [
          "graph: 2→[(1,1),(3,1)], 3→[(4,1)]",
          "dist: {1:inf, 2:0, 3:inf, 4:inf}  heap: [(0,2)]",
          "pop (0,2)  relax 2→1: dist[1]=1  relax 2→3: dist[3]=1  heap: [(1,1),(1,3)]",
          "pop (1,1)  node 1 has no outgoing edges  heap: [(1,3)]",
          "pop (1,3)  relax 3→4: dist[4]=1+1=2  heap: [(2,4)]",
          "pop (2,4)  node 4 has no outgoing edges  heap: []",
          "dist: {1:1, 2:0, 3:1, 4:2}",
          "max(dist.values()) = 2  no inf  return 2",
        ],
        traceExplanations: [
          "Node 2 is the source. It has two direct edges: to node 1 and node 3, both weight 1.",
          "Start with zero cost at source. All others are unreachable until we discover a path.",
          "Processing the source: we discover both neighbors at cost 1. Both are pushed to the heap.",
          "Node 1 reached at cost 1. It's a leaf — no outgoing edges, nothing to relax.",
          "Node 3 reached at cost 1. Its neighbor node 4 is reachable at cost 1+1=2.",
          "Node 4 reached at cost 2. Leaf node — no further edges to relax. Heap empty.",
          "All nodes reached. The distances represent the true shortest time from source 2.",
          "The slowest node to receive the signal is node 4 at time 2. This is our answer.",
        ],
      },
      blanks: [
        { line: `dist = {i: float('inf') for i in range(1, n+___)}`, answer: "1" },
        { line: `dist[___] = 0`, answer: "k" },
        { line: `heap = [(0, ___)]`, answer: "k" },
        { line: `if d ___ dist[node]: continue`, answer: ">" },
        { line: `new_dist = dist[node] + ___`, answer: "weight" },
        { line: `return max_dist if max_dist < float('___') else -1`, answer: "inf" },
      ],
    },
  ],
}
