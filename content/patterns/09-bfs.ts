import { Pattern } from "../types"

export const bfs: Pattern = {
  id: "bfs",
  order: 9,
  patternName: "Breadth-First Search",

  philosophy: {
    text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    source: "Mother Teresa",
    connection:
      "BFS radiates outward from a source, touching every neighbor before going deeper. It explores in waves — level by level — ensuring the shortest path is always found first. Like kindness that spreads in all directions equally, BFS gives every neighbor the same attention before moving further away.",
  },

  template: {
    description:
      "Queue-based exploration that processes nodes level by level. Guarantees shortest path in unweighted graphs. Use a visited set to avoid revisiting. Snapshot queue length at the start of each level for level-order processing.",
    snippet: `from collections import deque

queue = deque([start])
visited = {start}

while queue:
    node = queue.popleft()

    for neighbor in get_neighbors(node):
        if neighbor not in visited:
            visited.add(neighbor)
            queue.append(neighbor)

# Level-order BFS (process level by level)
while queue:
    level_size = len(queue)
    for _ in range(level_size):
        node = queue.popleft()
        # process node
        for neighbor in get_neighbors(node):
            queue.append(neighbor)
    # end of one level`,
  },

  pythonTools: [
    {
      name: "collections.deque — O(1) popleft vs list's O(n)",
      snippet: `from collections import deque
queue = deque([start])
node = queue.popleft()  # O(1) — not queue.pop(0) which is O(n)`,
    },
    {
      name: "visited = set() — never revisit",
      snippet: `visited = {start}
if neighbor not in visited:
    visited.add(neighbor)
    queue.append(neighbor)`,
    },
    {
      name: "Level-order: snapshot len(queue) at start of each level",
      snippet: `level = 0
while queue:
    level_size = len(queue)  # freeze size — new nodes added this iteration belong to next level
    for _ in range(level_size):
        node = queue.popleft()
        # process
    level += 1`,
    },
  ],

  problems: [
    {
      id: "level-order-sum",
      title: "Binary Tree Level Order Traversal",
      difficulty: "medium",
      prompt:
        "Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level) as a list of lists.",
      patternKeywords: ["level by level", "layer", "breadth", "row by row"],
      solution: `from collections import deque

def levelOrder(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        level = []
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        result.append(level)
    return result`,
      solutionExplanation: [
        "I handle the empty tree edge case immediately — nothing to traverse.",
        "I seed the queue with the root. The queue is always the 'frontier' — the set of nodes we're about to process.",
        "At the start of each iteration, I snapshot the queue's length. This is the exact count of nodes on the current level. Any nodes added during this iteration belong to the next level — snapshotting before the inner loop is what separates levels cleanly.",
        "I process exactly level_size nodes, collecting their values into a level list. For each node I also enqueue its children — they'll be processed in the next outer iteration.",
        "Once the inner loop finishes, every node on this level has been visited and its children queued. I append the completed level list to the result.",
        "When the queue empties, every level has been processed. Return the accumulated result.",
      ],
      testCase: {
        input: `root = [3, 9, 20, null, null, 15, 7]`,
        expected: "[[3], [9, 20], [15, 7]]",
        trace: [
          "queue=[3]  level_size=1",
          "  pop 3 → level=[3]  enqueue 9, 20",
          "  result=[[3]]  queue=[9, 20]",
          "queue=[9, 20]  level_size=2",
          "  pop 9 → level=[9]   no children",
          "  pop 20 → level=[9, 20]  enqueue 15, 7",
          "  result=[[3], [9, 20]]  queue=[15, 7]",
          "queue=[15, 7]  level_size=2",
          "  pop 15 → level=[15]  no children",
          "  pop 7  → level=[15, 7]  no children",
          "  result=[[3], [9, 20], [15, 7]]  queue=[]",
          "queue empty → return [[3], [9, 20], [15, 7]]",
        ],
        traceExplanations: [
          "Only the root is in the queue. level_size=1 means we'll process exactly one node this round.",
          "Pop the root, record its value. Enqueue both children — they join the queue but won't be processed until the next outer loop.",
          "Level 0 complete. result now has one entry. Queue holds the two level-1 nodes.",
          "Two nodes on this level. level_size=2 freezes the count before we start adding level-2 children.",
          "Pop 9 — it's a leaf, nothing to enqueue.",
          "Pop 20 — has two children. Enqueue 15 and 7. They go to the back of the queue.",
          "Level 1 complete. Queue now holds exactly the level-2 nodes.",
          "Two nodes on level 2. level_size=2 again.",
          "Pop 15 — leaf node.",
          "Pop 7 — leaf node. Queue is now empty.",
          "Level 2 complete. No more nodes remain.",
          "Queue is empty — BFS is done. Return all three levels.",
        ],
      },
      blanks: [
        { line: `level_size = len(___)`, answer: "queue" },
        { line: `for _ in range(___):`, answer: "level_size" },
        { line: `node = queue.___()`, answer: "popleft" },
        { line: `level.___(node.val)`, answer: "append" },
        { line: `result.___(level)`, answer: "append" },
      ],
    },

    {
      id: "rightmost-node",
      title: "Find Rightmost Node at Each Level",
      difficulty: "medium",
      prompt:
        "Given the root of a binary tree, imagine yourself standing on the right side of it. Return the values of the nodes you can see ordered from top to bottom. (LeetCode: Binary Tree Right Side View)",
      patternKeywords: ["right side", "last node per level", "visible from right", "level order"],
      solution: `from collections import deque

def rightSideView(root):
    if not root:
        return []
    result = []
    queue = deque([root])
    while queue:
        level_size = len(queue)
        for i in range(level_size):
            node = queue.popleft()
            if i == level_size - 1:
                result.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
    return result`,
      solutionExplanation: [
        "I run standard level-order BFS — the level_size snapshot is what allows me to know exactly when I'm at the last node of a level.",
        "I track the loop index i. When i == level_size - 1, I'm processing the last node of the current level — that's the rightmost visible node. I record it.",
        "I still enqueue all children regardless. The visibility logic only applies to which node's value I record — the traversal itself is complete BFS.",
        "The result collects one value per level — the last node processed in that level's inner loop, which is always the rightmost node.",
      ],
      testCase: {
        input: `root = [1, 2, 3, null, 5, null, 4]`,
        expected: "[1, 3, 4]",
        trace: [
          "queue=[1]  level_size=1",
          "  i=0  pop 1  i==level_size-1 → record 1  enqueue 2, 3",
          "queue=[2, 3]  level_size=2",
          "  i=0  pop 2  not last → skip  enqueue 5",
          "  i=1  pop 3  i==level_size-1 → record 3  no children",
          "queue=[5, 4]  level_size=2",
          "  i=0  pop 5  not last → skip  no children",
          "  i=1  pop 4  i==level_size-1 → record 4  no children",
          "return [1, 3, 4]",
        ],
        traceExplanations: [
          "Level 0 has one node. level_size=1, so the first (and only) node is also the last.",
          "i=0 equals level_size-1=0. Root is both the first and last — it's visible. Enqueue its children for level 1.",
          "Level 1 has two nodes. The rightmost one (3) will be the last processed.",
          "i=0: node 2 is not the last. We still process it fully (enqueue children) but don't record it — it's hidden behind node 3.",
          "i=1: node 3 is the last on this level — record it. No children to enqueue.",
          "Level 2 has nodes 5 and 4. Note: 4 is the right child of 3, so it's to the right of 5.",
          "i=0: node 5 is not last — skip recording.",
          "i=1: node 4 is last — record it. It's the rightmost visible node at this depth.",
          "One value per level, always the rightmost. Done.",
        ],
      },
      blanks: [
        { line: `level_size = len(___)`, answer: "queue" },
        { line: `for i in range(___):`, answer: "level_size" },
        { line: `if i == level_size - ___:`, answer: "1" },
        { line: `result.append(node.___)`, answer: "val" },
      ],
    },

    {
      id: "rotting-oranges",
      title: "Rotting Oranges",
      difficulty: "medium",
      prompt:
        "You are given an m x n grid where each cell can have one of three values: 0 (empty), 1 (fresh orange), or 2 (rotten orange). Every minute, any fresh orange that is 4-directionally adjacent to a rotten orange becomes rotten. Return the minimum number of minutes that must elapse until no cell has a fresh orange. If it is impossible, return -1.",
      patternKeywords: ["multi-source BFS", "simultaneous spread", "grid", "minimum time"],
      solution: `from collections import deque

def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    directions = [(0,1),(0,-1),(1,0),(-1,0)]

    while queue and fresh > 0:
        minutes += 1
        for _ in range(len(queue)):
            r, c = queue.popleft()
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))

    return minutes if fresh == 0 else -1`,
      solutionExplanation: [
        "I scan the entire grid upfront to seed the queue with ALL rotten oranges and count all fresh ones. This multi-source initialization is the key insight — all rotten oranges rot their neighbors simultaneously, not one at a time.",
        "I use level-order BFS. Each outer loop iteration is one minute. Within each minute, I process exactly the oranges that were rotten at the start of that minute.",
        "For each rotten orange, I check all 4 neighbors. If a neighbor is fresh, it becomes rotten: I mark it in the grid (so it's not double-counted), decrement fresh, and enqueue it for the next minute.",
        "The loop stops when there are no more rotten oranges to spread from, or when all fresh oranges are gone. If fresh > 0 at the end, some orange was unreachable — return -1. Otherwise return the minute count.",
      ],
      testCase: {
        input: `grid = [[2,1,1],[1,1,0],[0,1,1]]`,
        expected: "4",
        trace: [
          "init: queue=[(0,0)]  fresh=6  minutes=0",
          "minute 1: process (0,0) → rot (0,1) and (1,0)  fresh=4  queue=[(0,1),(1,0)]",
          "minute 2: process (0,1) → rot (0,2),(1,1)  process (1,0) → (1,1) already rotten  fresh=2  queue=[(0,2),(1,1)]",
          "minute 3: process (0,2) → no fresh neighbors  process (1,1) → rot (2,1)  fresh=1  queue=[(2,1)]",
          "minute 4: process (2,1) → rot (2,2)  fresh=0  queue=[(2,2)]",
          "fresh==0 → return 4",
        ],
        traceExplanations: [
          "One rotten orange at (0,0). Six fresh oranges total. BFS starts from a single source here, but the pattern extends naturally to multiple sources.",
          "Minute 1: the single rotten orange spreads to its two fresh neighbors. Both become rotten and join the queue for minute 2.",
          "Minute 2: both newly rotten oranges spread. (0,1) reaches (0,2) and (1,1). (1,0) tries (1,1) but it was already just marked rotten — the grid check prevents double-counting.",
          "Minute 3: (0,2) is a corner with no more fresh neighbors. (1,1) spreads down to (2,1). One fresh orange remains at (2,2).",
          "Minute 4: (2,1) reaches (2,2) — last fresh orange gone. fresh hits 0.",
          "All oranges rotted in 4 minutes. fresh==0 so we return minutes, not -1.",
        ],
      },
      blanks: [
        { line: `if grid[r][c] == ___:  queue.append((r, c))`, answer: "2" },
        { line: `elif grid[r][c] == ___:  fresh += 1`, answer: "1" },
        { line: `while queue and fresh ___ 0:`, answer: ">" },
        { line: `for _ in range(len(___)):`, answer: "queue" },
        { line: `if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == ___:`, answer: "1" },
        { line: `return minutes if fresh ___ 0 else -1`, answer: "==" },
      ],
    },

    {
      id: "01-matrix",
      title: "01 Matrix",
      difficulty: "medium",
      prompt:
        "Given an m x n binary matrix mat, return the distance of the nearest 0 for each cell. The distance between two adjacent cells is 1.",
      patternKeywords: ["multi-source BFS", "distance from nearest 0", "grid distance", "simultaneous expansion"],
      solution: `from collections import deque

def updateMatrix(mat):
    rows, cols = len(mat), len(mat[0])
    queue = deque()
    dist = [[float('inf')] * cols for _ in range(rows)]

    for r in range(rows):
        for c in range(cols):
            if mat[r][c] == 0:
                dist[r][c] = 0
                queue.append((r, c))

    directions = [(0,1),(0,-1),(1,0),(-1,0)]
    while queue:
        r, c = queue.popleft()
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if dist[r][c] + 1 < dist[nr][nc]:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))

    return dist`,
      solutionExplanation: [
        "I initialize a distance matrix filled with infinity and seed the BFS queue with ALL zeros simultaneously. This is the multi-source BFS insight: instead of running BFS from each cell to find the nearest 0, I run BFS outward from all 0s at once. The first time BFS reaches a cell, it's guaranteed to be from the nearest 0.",
        "I process the queue with standard BFS. For each cell, I check its 4 neighbors. If I can reach the neighbor through the current cell with a shorter distance than what's recorded, I update and enqueue the neighbor.",
        "Because BFS expands in order of distance, each cell is settled the first time it's reached — but I use the relaxation condition (dist[r][c]+1 < dist[nr][nc]) to handle the general case cleanly. Cells already settled at their minimum distance won't be re-enqueued because the condition won't be true.",
        "When the queue empties, every reachable cell has its exact distance to the nearest 0. Return the distance matrix.",
      ],
      testCase: {
        input: `mat = [[0,0,0],[0,1,0],[1,1,1]]`,
        expected: "[[0,0,0],[0,1,0],[1,2,1]]",
        trace: [
          "init: queue=[(0,0),(0,1),(0,2),(1,0),(1,2)]  all 0-cells with dist=0",
          "process (0,0): neighbor (1,0) dist=0+1=1 < inf → dist[1][0]=1  enqueue (1,0)  [already 0, skip]",
          "process (0,1): neighbors already 0 or just updated",
          "process (0,2): neighbor (1,2) dist=1 < inf → dist[1][2]=1  enqueue",
          "process (1,0): neighbor (2,0) dist=2 < inf → dist[2][0]=1? wait — (1,0) is a 0-cell, dist=0 → (2,0)=1",
          "process (1,2): neighbor (2,2) dist=0+1=1 → dist[2][2]=1",
          "process (1,1) when reached: dist=1  neighbor (2,1) dist=1+1=2 → dist[2][1]=2",
          "return [[0,0,0],[0,1,0],[1,2,1]]",
        ],
        traceExplanations: [
          "All five 0-cells start at distance 0 simultaneously. This is the power of multi-source BFS — every 0 is a source, and they all expand at the same rate.",
          "The top-left 0 spreads to its neighbor (1,0). But (1,0) is already a 0-cell — its distance stays 0. (0,0)'s right neighbor (0,1) is also 0.",
          "The center-top 0 is surrounded by other 0s — no infinity cells nearby to update yet.",
          "(0,2) reaches (1,2) which is a 0-cell — no update needed. But conceptually all 0-cells are settled.",
          "(1,0) is a 0-cell with dist=0. Its bottom neighbor (2,0) is a 1-cell at infinity — gets distance 1.",
          "(1,2) is a 0-cell. Its bottom neighbor (2,2) gets distance 1.",
          "When (1,1) is dequeued, it has dist=1. It updates (2,1) to distance 2 — this cell is furthest from any 0.",
          "The result matrix reflects true minimum distances from each cell to the nearest 0.",
        ],
      },
      blanks: [
        { line: `dist = [[float('inf')] * cols for _ in range(___)]`, answer: "rows" },
        { line: `if mat[r][c] == ___:`, answer: "0" },
        { line: `dist[r][c] = ___`, answer: "0" },
        { line: `if dist[r][c] + 1 ___ dist[nr][nc]:`, answer: "<" },
        { line: `dist[nr][nc] = dist[r][c] + ___`, answer: "1" },
      ],
    },

    {
      id: "minimum-knight-moves",
      title: "Minimum Knight Moves",
      difficulty: "medium",
      prompt:
        "In an infinite chessboard with coordinates from -infinity to +infinity, you have a knight at square [0, 0]. A knight has 8 possible moves. Return the minimum number of moves to reach the square [x, y].",
      patternKeywords: ["BFS on grid", "minimum moves", "shortest path", "8 directions"],
      solution: `from collections import deque

def minKnightMoves(x: int, y: int) -> int:
    x, y = abs(x), abs(y)  # use symmetry

    queue = deque([(0, 0, 0)])  # (row, col, moves)
    visited = {(0, 0)}

    directions = [
        (2,1),(2,-1),(-2,1),(-2,-1),
        (1,2),(1,-2),(-1,2),(-1,-2)
    ]

    while queue:
        r, c, moves = queue.popleft()
        if r == x and c == y:
            return moves
        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if (nr, nc) not in visited and nr >= -2 and nc >= -2:
                visited.add((nr, nc))
                queue.append((nr, nc, moves + 1))

    return -1`,
      solutionExplanation: [
        "I exploit symmetry first: a knight's minimum move count from (0,0) to (x,y) is the same as to (-x,y), (x,-y), or (-x,-y). By taking absolute values I only search the first quadrant, cutting the search space by up to 4x.",
        "I use BFS because BFS guarantees the first time I reach the target is via the minimum number of moves. Dijkstra or DFS would be wrong here — only BFS finds shortest paths in unweighted graphs.",
        "Each state is a (row, col, moves) triple. I track visited cells to avoid cycles — without this the BFS would loop forever on an infinite board.",
        "The boundary constraint nr >= -2 and nc >= -2 is a pruning trick: since the target is in the first quadrant (after abs), the optimal path never needs to go further than 2 steps into negative territory. This bounds the search space on an otherwise infinite board.",
        "The first time the BFS reaches (x, y), the move count is minimal by BFS's guarantee. Return immediately.",
      ],
      testCase: {
        input: `x = 2, y = 1`,
        expected: "1",
        trace: [
          "abs(2,1) → target=(2,1)  queue=[(0,0,0)]  visited={(0,0)}",
          "pop (0,0,0): not target. Try all 8 moves.",
          "  (2,1) → in bounds, not visited → enqueue (2,1,1)  add to visited",
          "  (2,-1),(−2,1),(−2,-1),(1,2),(1,-2),(−1,2),(−1,-2) → enqueue valid ones",
          "pop (2,1,1): r==x and c==y → return 1",
        ],
        traceExplanations: [
          "Target is at (2,1). After taking absolute values, we're in the first quadrant. BFS starts at origin with 0 moves.",
          "Process the start position. It's not the target so we explore all 8 knight moves from here.",
          "One of the 8 moves lands directly on (2,1) — the target! It gets enqueued with moves=1.",
          "Other moves also get enqueued — they're all valid first moves — but BFS processes in FIFO order.",
          "(2,1,1) is at the front of the queue (first neighbor enqueued). It matches the target. Return 1 immediately.",
        ],
      },
      blanks: [
        { line: `x, y = ___(x), ___(y)`, answer: "abs, abs" },
        { line: `queue = deque([(0, 0, ___)])`, answer: "0" },
        { line: `visited = {(0, ___)}`, answer: "0" },
        { line: `if r == x and c ___ y:`, answer: "==" },
        { line: `if (nr, nc) not in visited and nr >= ___ and nc >= ___:`, answer: "-2, -2" },
        { line: `queue.append((nr, nc, moves + ___))`, answer: "1" },
      ],
    },
  ],
}
