import { Pattern } from "../types"

export const graphs: Pattern = {
  id: "graphs",
  order: 11,
  patternName: "Graphs",

  philosophy: {
    text: "No man is an island, entire of itself; every man is a piece of the continent.",
    source: "John Donne, Meditation XVII",
    connection:
      "Graphs model relationships — nothing exists in isolation. A node without its edges is just a label. To understand a node, you must understand its connections. Traversal is the act of following those connections to find structure — components, paths, cycles, order. The insight lives in the relationships, not the nodes themselves.",
  },

  template: {
    description:
      "Build an adjacency list, then traverse with DFS or BFS. For directed acyclic graphs, Kahn's algorithm produces topological order by repeatedly removing nodes with no remaining dependencies.",
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
      snippet: `visited = set()\nvisited.add(node)       # mark\nif node not in visited: # check`,
    },
    {
      name: "In-degree array for topological sort",
      snippet: `in_degree = {node: 0 for node in graph}\nfor node in graph:\n    for neighbor in graph[node]:\n        in_degree[neighbor] += 1`,
    },
    {
      name: "Dijkstra: heapq with (distance, node) tuples",
      snippet: `import heapq\ndist = {node: float('inf') for node in graph}\ndist[src] = 0\nheap = [(0, src)]\nwhile heap:\n    d, node = heapq.heappop(heap)\n    if d > dist[node]: continue\n    for neighbor, weight in graph[node]:\n        nd = d + weight\n        if nd < dist[neighbor]:\n            dist[neighbor] = nd\n            heapq.heappush(heap, (nd, neighbor))`,
    },
  ],

  problems: [
    {
      id: "course-schedule",
      title: "Course Schedule",
      difficulty: "medium",
      prompt:
        "There are numCourses courses labeled 0 to numCourses-1. You are given an array prerequisites where prerequisites[i] = [a, b] means you must take course b before course a. Return true if you can finish all courses, false if a cycle makes it impossible.",
      patternKeywords: ["cycle detection", "directed graph", "prerequisites", "topological sort"],
      solution: `from collections import defaultdict, deque

def canFinish(numCourses, prerequisites):
    graph = defaultdict(list)
    in_degree = {i: 0 for i in range(numCourses)}
    for a, b in prerequisites:
        graph[b].append(a)
        in_degree[a] += 1

    queue = deque([n for n in in_degree if in_degree[n] == 0])
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
        "I'm building a directed graph where an edge b → a means 'b must come before a'. I use `defaultdict(list)` for the adjacency list — accessing a missing key in a plain dict raises KeyError, but defaultdict auto-initializes missing keys with an empty list, so `graph[b].append(a)` just works without a guard.",
        "I track each node's in-degree using a dict comprehension: `{i: 0 for i in range(numCourses)}`. This is more readable and Pythonic than initializing an empty dict and filling it in a loop — the entire structure is created in one expression.",
        "I seed the queue with `deque([n for n in in_degree if in_degree[n] == 0])`. The list comprehension filters all zero-in-degree nodes in one line; wrapping it in deque gives O(1) popleft instead of O(n) for a plain list. These are courses safe to take immediately.",
        "Each time I process a node, I increment a counter. When I finish a course, I reduce the in-degree of every course that depended on it. If any drop to zero, they're now unblocked and join the queue.",
        "If the counter equals numCourses at the end, every course was reachable — no cycle. If it's less, some courses were locked in a cycle and could never be scheduled. The count is the cycle detector.",
      ],
      testCase: {
        input: `numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]`,
        expected: "True",
        trace: [
          "graph: 0→[1,2], 1→[3], 2→[3]",
          "in_degree: {0:0, 1:1, 2:1, 3:2}",
          "queue: [0]   completed=0",
          "pop 0 → completed=1 → reduce 1,2 → in_degree: {1:0, 2:0, 3:2}",
          "queue: [1, 2]",
          "pop 1 → completed=2 → reduce 3 → in_degree: {3:1}",
          "pop 2 → completed=3 → reduce 3 → in_degree: {3:0}",
          "queue: [3]",
          "pop 3 → completed=4",
          "completed(4) == numCourses(4) → return True",
        ],
        traceExplanations: [
          "The directed edges encode dependency direction: take 0 before 1, take 0 before 2, etc.",
          "In-degree counts how many courses block each node. Course 0 has no blockers — it can start immediately.",
          "We only queue nodes that are unblocked. Course 0 is the only one with in_degree 0.",
          "Taking course 0 unblocks courses 1 and 2. We decrement their in-degrees, and both hit 0.",
          "Both 1 and 2 are now unblocked and enter the queue.",
          "Taking course 1 reduces course 3's in-degree from 2 to 1. Not yet unblocked.",
          "Taking course 2 reduces course 3's in-degree from 1 to 0. Now unblocked.",
          "Course 3 is finally ready — all its prerequisites are done.",
          "All 4 courses completed. If a cycle existed, some nodes would never reach in-degree 0 and would never be processed.",
          "The count check is the cycle detector: a cycle traps nodes permanently above in-degree 0.",
        ],
      },
      blanks: [
        { line: `in_degree = {i: ___ for i in range(numCourses)}`, answer: "0" },
        { line: `queue = deque([n for n in in_degree if in_degree[n] == ___])`, answer: "0" },
        { line: `in_degree[neighbor] ___ 1`, answer: "-=" },
        { line: `if in_degree[neighbor] == ___:`, answer: "0" },
        { line: `return completed == ___`, answer: "numCourses" },
      ],
      explanationBlanks: [
        { line: "I seed the queue with `deque([n for n in in_degree if in_degree[n] == 0])`. The list comprehension filters all zero-in-degree nodes in one line; wrapping it in deque gives O(1) popleft instead of O(n) for a plain list. These are courses safe to take ___.", answer: "immediately" },
        { line: "Each time I process a node, I increment a counter. When I finish a course, I reduce the in-degree of every course that depended on it. If any drop to zero, they're now ___ and join the queue.", answer: "unblocked" },
        { line: "If the counter equals numCourses at the end, every course was reachable — no cycle. If it's less, some courses were locked in a cycle and could never be scheduled. The count is the ___ detector.", answer: "cycle" },
      ],
    },

    {
      id: "course-schedule-ii",
      title: "Course Schedule II",
      difficulty: "medium",
      prompt:
        "Same as Course Schedule, but return the ordering in which courses should be taken. If it is impossible to finish all courses (due to a cycle), return an empty array.",
      patternKeywords: ["topological order", "cycle detection", "directed graph", "prerequisites"],
      solution: `from collections import defaultdict, deque

def findOrder(numCourses, prerequisites):
    graph = defaultdict(list)
    in_degree = {i: 0 for i in range(numCourses)}
    for a, b in prerequisites:
        graph[b].append(a)
        in_degree[a] += 1

    queue = deque([n for n in in_degree if in_degree[n] == 0])
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
        "The setup is identical to Course Schedule — `defaultdict(list)` for the adjacency list (auto-initializes missing keys, no KeyError), and a dict comprehension `{i: 0 for i in range(numCourses)}` for in-degrees (one expression, no loop needed).",
        "The queue is seeded with `deque([n for n in in_degree if in_degree[n] == 0])`: the list comprehension builds the zero-in-degree frontier, and deque wraps it for O(1) popleft. The only difference from Course Schedule is what I do as I process nodes — instead of incrementing a counter, I append each node to an `order` list. Kahn's algorithm naturally produces a valid topological order because a node is appended only after all its prerequisites have been processed.",
        "The cycle check is the same: if the order list is shorter than numCourses, some nodes were permanently stuck above in-degree 0 (trapped in a cycle) and never entered the queue. I return an empty list in that case.",
      ],
      testCase: {
        input: `numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]`,
        expected: "[0, 1, 2, 3] or [0, 2, 1, 3]",
        trace: [
          "in_degree: {0:0, 1:1, 2:1, 3:2}",
          "queue: [0]",
          "pop 0 → order=[0], unblock 1 and 2",
          "queue: [1, 2]",
          "pop 1 → order=[0,1], in_degree[3]=1",
          "pop 2 → order=[0,1,2], in_degree[3]=0 → enqueue 3",
          "pop 3 → order=[0,1,2,3]",
          "len(order)==4 == numCourses → return [0,1,2,3]",
        ],
        traceExplanations: [
          "Course 0 is the only one with no prerequisites — it must go first.",
          "0 is the only valid starting point.",
          "Taking 0 makes both 1 and 2 available. Either could go next — both are valid.",
          "Both 1 and 2 are ready. Queue ordering determines which goes first.",
          "Taking 1 makes partial progress toward unblocking 3.",
          "Taking 2 fully unblocks 3. In-degree 0 means all prerequisites are satisfied.",
          "3 can now be taken. Every course has been scheduled.",
          "Order length matches numCourses — no cycle — return the valid ordering.",
        ],
      },
      blanks: [
        { line: `order = ___`, answer: "[]" },
        { line: `order.___(node)`, answer: "append" },
        { line: `in_degree[neighbor] ___ 1`, answer: "-=" },
        { line: `return order if len(order) == ___ else []`, answer: "numCourses" },
      ],
      explanationBlanks: [
        { line: "The queue is seeded with `deque([n for n in in_degree if in_degree[n] == 0])`: the list comprehension builds the zero-in-degree frontier, and deque wraps it for O(1) popleft. The only difference from Course Schedule is what I do as I process nodes — instead of incrementing a counter, I append each node to an `order` list. Kahn's algorithm naturally produces a valid ___ order because a node is appended only after all its prerequisites have been processed.", answer: "topological" },
        { line: "The cycle check is the same: if the order list is shorter than numCourses, some nodes were permanently stuck above in-degree 0 (trapped in a ___) and never entered the queue. I return an empty list in that case.", answer: "cycle" },
      ],
    },

    {
      id: "number-of-islands",
      title: "Number of Islands",
      difficulty: "medium",
      prompt:
        "Given an m x n 2D binary grid of '1's (land) and '0's (water), return the number of islands. An island is surrounded by water and formed by connecting adjacent land cells horizontally or vertically.",
      patternKeywords: ["connected components", "flood fill", "DFS", "grid traversal"],
      solution: `def numIslands(grid):
    if not grid:
        return 0
    rows, cols = len(grid), len(grid[0])
    count = 0

    def dfs(r, c):
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        grid[r][c] = '0'
        dfs(r+1, c)
        dfs(r-1, c)
        dfs(r, c+1)
        dfs(r, c-1)

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1
                dfs(r, c)

    return count`,
      solutionExplanation: [
        "I scan every cell in the grid. Whenever I find an unvisited land cell ('1'), I've discovered a new island — I increment the count and immediately DFS from that cell to flood-fill the entire island.",
        "The DFS visits every connected land cell and marks it '0' in-place. This in-place mutation serves as the visited set — no extra data structure needed. A plain dict or set would require O(m×n) extra space; mutating the grid is O(1).",
        "The base case for DFS checks bounds and cell value in a single compound condition. This naturally stops the flood fill at water and at the grid boundary — the recursion simply returns without doing anything.",
        "After DFS returns, the entire island has been erased from the grid, so the outer scan continues cleanly to the next undiscovered island. Three separate flood fills means three islands.",
      ],
      testCase: {
        input: `grid = [
  ["1","1","0","0","0"],
  ["1","1","0","0","0"],
  ["0","0","1","0","0"],
  ["0","0","0","1","1"]
]`,
        expected: "3",
        trace: [
          "r=0,c=0: '1' found → count=1, DFS floods island 1",
          "DFS marks (0,0),(0,1),(1,0),(1,1) → all become '0'",
          "scan continues... (0,1) is now '0', skipped",
          "r=2,c=2: '1' found → count=2, DFS floods island 2",
          "DFS marks (2,2) → becomes '0'",
          "r=3,c=3: '1' found → count=3, DFS floods island 3",
          "DFS marks (3,3),(3,4) → both become '0'",
          "scan complete → return 3",
        ],
        traceExplanations: [
          "First unvisited '1' triggers a new island. We immediately explore all of it before moving on.",
          "Flood fill propagates in all four directions. All four connected cells are part of the same island and get marked so we don't count them again.",
          "Because DFS already marked those cells, the scan skips them cleanly. No need for a separate visited set.",
          "The isolated '1' at (2,2) has no '1' neighbors — it's its own island.",
          "A single-cell island is still an island. DFS marks it and terminates immediately.",
          "Two connected cells in the bottom-right form the third island.",
          "DFS explores right from (3,3) and finds (3,4). Both are part of the same island.",
          "Every cell has been visited. Three distinct flood fills = three islands.",
        ],
      },
      blanks: [
        { line: `if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != ___:`, answer: "'1'" },
        { line: `grid[r][c] = ___`, answer: "'0'" },
        { line: `if grid[r][c] == ___:`, answer: "'1'" },
        { line: `count ___ 1`, answer: "+=" },
      ],
      explanationBlanks: [
        { line: "The DFS visits every connected land cell and marks it '0' in-place. This in-place mutation serves as the ___ set — no extra data structure needed. A plain dict or set would require O(m×n) extra space; mutating the grid is O(1).", answer: "visited" },
        { line: "After DFS returns, the entire island has been erased from the grid, so the outer scan continues cleanly to the next undiscovered island. Three separate ___ means three islands.", answer: "flood fills" },
      ],
    },

    {
      id: "pacific-atlantic",
      title: "Pacific Atlantic Water Flow",
      difficulty: "medium",
      prompt:
        "Given an m x n matrix of heights, water can flow to adjacent cells with equal or lower height. The Pacific ocean borders the top and left edges; the Atlantic borders the bottom and right edges. Return all cells from which water can flow to both oceans.",
      patternKeywords: ["multi-source BFS", "reverse flow", "reachability", "grid traversal"],
      solution: `from collections import deque

def pacificAtlantic(heights):
    rows, cols = len(heights), len(heights[0])
    pac, atl = set(), set()

    def bfs(starts, visited):
        queue = deque(starts)
        visited.update(starts)
        while queue:
            r, c = queue.popleft()
            for dr, dc in [(1,0),(-1,0),(0,1),(0,-1)]:
                nr, nc = r+dr, c+dc
                if 0<=nr<rows and 0<=nc<cols and (nr,nc) not in visited and heights[nr][nc] >= heights[r][c]:
                    visited.add((nr,nc))
                    queue.append((nr,nc))

    bfs([(r,0) for r in range(rows)] + [(0,c) for c in range(cols)], pac)
    bfs([(r,cols-1) for r in range(rows)] + [(rows-1,c) for c in range(cols)], atl)

    return [[r,c] for r in range(rows) for c in range(cols) if (r,c) in pac and (r,c) in atl]`,
      solutionExplanation: [
        "The trick is to reverse the problem. Instead of simulating water flowing down from every cell (which would be O(m×n) BFS each), I flow upward from each ocean's border — asking 'which cells can reach this ocean?' by only stepping to neighbors that are equal or higher height.",
        "I run multi-source BFS from all Pacific-border cells simultaneously. `visited.update(starts)` marks all seed cells in one call before the loop begins. Every cell BFS can reach while going uphill (heights[nr][nc] >= heights[r][c]) corresponds to a cell from which water would flow downhill to the Pacific.",
        "I do the same BFS from all Atlantic-border cells. The BFS function is shared — `pac` and `atl` are passed as the `visited` set argument, so the same logic fills both reachable sets.",
        "The final answer is a list comprehension over all cells: `[[r,c] for r in range(rows) for c in range(cols) if (r,c) in pac and (r,c) in atl]`. Using sets for pac and atl makes each membership check O(1) — if these were lists, the intersection would be O(m×n) per cell.",
      ],
      testCase: {
        input: `heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]`,
        expected: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        trace: [
          "Pacific starts: top row (0,0)-(0,4) and left col (0,0)-(4,0)",
          "BFS from Pacific: flows uphill, marks all Pacific-reachable cells",
          "Atlantic starts: bottom row (4,0)-(4,4) and right col (0,4)-(4,4)",
          "BFS from Atlantic: flows uphill, marks all Atlantic-reachable cells",
          "Intersection: cells in both pac and atl sets",
          "Result: [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
        ],
        traceExplanations: [
          "Every cell on the Pacific border can trivially reach the Pacific. They seed the BFS.",
          "The BFS condition heights[nr][nc] >= heights[r][c] simulates reverse gravity — we move to cells at least as tall, representing water that could flow down to where we came from.",
          "Every cell on the Atlantic border seeds the second BFS.",
          "Same reverse-flow logic. We find all cells from which gravity would carry water to the Atlantic.",
          "Only cells that appear in both reachable sets can drain to both oceans.",
          "These are the cells where any rain that falls will eventually reach both the Pacific and Atlantic.",
        ],
      },
      blanks: [
        { line: `pac, atl = ___, ___`, answer: "set(), set()" },
        { line: `if ... and heights[nr][nc] ___ heights[r][c]:`, answer: ">=" },
        { line: `bfs([...top row + left col...], ___)`, answer: "pac" },
        { line: `bfs([...bottom row + right col...], ___)`, answer: "atl" },
        { line: `if (r,c) in pac ___ (r,c) in atl`, answer: "and" },
      ],
      explanationBlanks: [
        { line: "The trick is to ___ the problem. Instead of simulating water flowing down from every cell (which would be O(m×n) BFS each), I flow upward from each ocean's border — asking 'which cells can reach this ocean?' by only stepping to neighbors that are equal or higher height.", answer: "reverse" },
        { line: "I run multi-source BFS from all Pacific-border cells simultaneously. `visited.update(starts)` marks all seed cells in one call before the loop begins. Every cell BFS can reach while going uphill (heights[nr][nc] >= heights[r][c]) corresponds to a cell from which water would flow downhill to the ___.", answer: "Pacific" },
        { line: "The final answer is a list comprehension over all cells: `[[r,c] for r in range(rows) for c in range(cols) if (r,c) in pac and (r,c) in atl]`. Using sets for pac and atl makes each membership check O(1) — if these were lists, the ___ would be O(m×n) per cell.", answer: "intersection" },
      ],
    },

    {
      id: "network-delay-time",
      title: "Network Delay Time",
      difficulty: "medium",
      prompt:
        "You are given a network of n nodes labeled 1 to n, a list of travel times as directed edges times[i] = (u, v, w), and a source node k. Return the minimum time for all nodes to receive the signal, or -1 if impossible.",
      patternKeywords: ["shortest path", "Dijkstra", "weighted graph", "minimum distance"],
      solution: `import heapq
from collections import defaultdict

def networkDelayTime(times, n, k):
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
            nd = d + weight
            if nd < dist[neighbor]:
                dist[neighbor] = nd
                heapq.heappush(heap, (nd, neighbor))

    max_dist = max(dist.values())
    return max_dist if max_dist < float('inf') else -1`,
      solutionExplanation: [
        "I build a weighted directed adjacency list using `defaultdict(list)`. Each node maps to a list of (neighbor, weight) pairs. defaultdict means I can call `graph[u].append(...)` for any u without first checking if u exists as a key.",
        "I initialize all distances to infinity except the source, which is 0. The heap starts with just `(0, k)`. I push tuples of `(distance, node)` — Python's heapq compares tuples lexicographically, so putting distance first means the heap orders entries by distance automatically. Without this convention I'd need a custom comparator.",
        "Dijkstra's works by always processing the node with the smallest known distance first. The min-heap guarantees this in O(log n) per pop. When I pop a node, I have its final shortest distance.",
        "The stale-entry check `if d > dist[node]: continue` is needed because Python's heapq has no decrease-key operation. When a shorter path is found, I push a new entry rather than updating the old one. The stale entry is skipped here — cheaper than removing it from the heap.",
        "For each neighbor, I compute the candidate distance `nd = d + weight`. If it's better than the recorded distance, I update `dist[neighbor]` and push `(nd, neighbor)` to the heap.",
        "The answer is the maximum value in `dist` — the last node to receive the signal determines total delay. If any node is still infinity, it was unreachable, so I return -1.",
      ],
      testCase: {
        input: `times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2`,
        expected: "2",
        trace: [
          "graph: 2→[(1,1),(3,1)], 3→[(4,1)]",
          "dist: {1:inf, 2:0, 3:inf, 4:inf}",
          "heap: [(0,2)]",
          "pop (0,2): process neighbors 1 and 3",
          "dist[1]=1, push (1,1); dist[3]=1, push (1,3)",
          "pop (1,1): no outgoing edges",
          "pop (1,3): process neighbor 4",
          "dist[4]=2, push (2,4)",
          "pop (2,4): no outgoing edges",
          "dist = {1:1, 2:0, 3:1, 4:2} → max=2 → return 2",
        ],
        traceExplanations: [
          "Directed graph: edges only go the stated direction. Node 2 can reach 1 and 3.",
          "All nodes start unreachable except the source node 2.",
          "Source node enters the heap with distance 0.",
          "Node 2 is processed first — it has the smallest distance (0).",
          "Both neighbors are reachable in 1 step. Their distances are updated and they enter the heap.",
          "Node 1 is processed. It has no outgoing edges, so nothing new is discovered.",
          "Node 3 is processed. It can reach node 4.",
          "Node 4 is reachable in 2 steps from the source (2→3→4).",
          "Node 4 is processed — no further edges.",
          "All nodes reachable. The max distance is 2 — signal reaches every node within 2 time units.",
        ],
      },
      blanks: [
        { line: `dist = {i: ___ for i in range(1, n+1)}`, answer: "float('inf')" },
        { line: `dist[k] = ___`, answer: "0" },
        { line: `if d ___ dist[node]: continue`, answer: ">" },
        { line: `nd = d ___ weight`, answer: "+" },
        { line: `if nd ___ dist[neighbor]:`, answer: "<" },
        { line: `return max_dist if max_dist < float('inf') else ___`, answer: "-1" },
      ],
      explanationBlanks: [
        { line: "I initialize all distances to infinity except the source, which is 0. The heap starts with just `(0, k)`. I push tuples of `(distance, node)` — Python's heapq compares tuples ___, so putting distance first means the heap orders entries by distance automatically. Without this convention I'd need a custom comparator.", answer: "lexicographically" },
        { line: "The stale-entry check `if d > dist[node]: continue` is needed because Python's heapq has no ___ operation. When a shorter path is found, I push a new entry rather than updating the old one. The stale entry is skipped here — cheaper than removing it from the heap.", answer: "decrease-key" },
        { line: "The answer is the maximum value in `dist` — the last node to receive the signal determines total delay. If any node is still infinity, it was ___, so I return -1.", answer: "unreachable" },
      ],
    },
  ],
}
