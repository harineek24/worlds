import { Pattern } from "../types"

export const bfs: Pattern = {
  id: "bfs",
  order: 9,
  patternName: "Breadth-First Search",

  philosophy: {
    text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
    source: "Mother Teresa",
    connection:
      "BFS radiates outward from a source, touching every neighbor before going deeper. It explores in waves — level by level — ensuring the shortest path is always found first. Like kindness that spreads one ring at a time, BFS guarantees that no closer node is ever skipped.",
  },

  template: {
    description:
      "Use a queue for standard BFS. Mark nodes visited before enqueuing to avoid duplicates. For level-order traversal, snapshot the queue length at the start of each level to know when one wave ends and the next begins.",
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
      name: "collections.deque",
      snippet: "from collections import deque\nqueue = deque([start])  # O(1) popleft vs list's O(n)",
    },
    {
      name: "visited = set()",
      snippet: "visited = {start}  # never revisit; add before enqueue, not after dequeue",
    },
    {
      name: "Level-order snapshot",
      snippet: "level_size = len(queue)  # freeze current level count before processing",
    },
  ],

  problems: [
    {
      id: "level-order-sum",
      title: "Binary Tree Level Order Traversal",
      difficulty: "medium",
      prompt:
        "Given the root of a binary tree, return an array of arrays where each inner array contains the values of nodes at that depth, left to right.",
      patternKeywords: ["bfs", "level-order", "tree", "queue"],
      solution: `from collections import deque

def level_order(root):
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
        "I'm seeding the queue with just the root — that's level 0. If the tree is empty I return early because there's nothing to process.",
        "`from collections import deque` + `queue = deque([root])` — I use deque instead of a plain list because `list.pop(0)` is O(n): Python has to shift every remaining element left. `deque.popleft()` is O(1) because a deque is a doubly-linked structure with a direct pointer to the front. For a tree with thousands of nodes, that difference compounds every level.",
        "I'm snapshotting `len(queue)` at the top of each `while` iteration. That count tells me exactly how many nodes belong to the current level before I start enqueuing the next one. Without the snapshot, as I push children during the loop, `len(queue)` would grow — I'd drift into processing next-level nodes as if they were part of the current wave.",
        "Inside the inner loop I pop a node, record its value, then push its children. The children land in the queue after the current level's nodes, so the snapshot keeps the levels cleanly separated.",
        "I append the completed `level` list to `result` after the inner loop finishes — that's when the entire wave has been processed.",
      ],
      testCase: {
        input: "root = [3, 9, 20, null, null, 15, 7]",
        expected: "[[3], [9, 20], [15, 7]]",
        trace: [
          "queue = [3], result = []",
          "level_size = 1 → pop 3, level = [3], enqueue 9 and 20",
          "result = [[3]], queue = [9, 20]",
          "level_size = 2 → pop 9, level = [9]; pop 20, level = [9, 20], enqueue 15 and 7",
          "result = [[3], [9, 20]], queue = [15, 7]",
          "level_size = 2 → pop 15, pop 7, level = [15, 7]",
          "result = [[3], [9, 20], [15, 7]], queue empty → done",
        ],
        traceExplanations: [
          "We start with only the root in the queue — it is the entire first level.",
          "Snapshot says 1 node on this level. We drain exactly that many, recording values and enqueuing children.",
          "Level 0 is sealed. The queue now holds exactly the level-1 nodes that were enqueued as children.",
          "Snapshot says 2 nodes. We drain both and push their children (15, 7) which belong to level 2.",
          "Level 1 is sealed. The queue holds the two leaf nodes.",
          "Snapshot says 2 nodes. We drain both — they have no children, nothing new is enqueued.",
          "Queue is empty so the while-loop exits. Each wave is captured as its own subarray.",
        ],
      },
      blanks: [
        {
          line: "        level_size = ___",
          answer: "level_size = len(queue)",
        },
        {
          line: "        for _ in range(___):",
          answer: "for _ in range(level_size):",
        },
        {
          line: "            level.append(___)",
          answer: "level.append(node.val)",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm snapshotting `len(queue)` at the top of each `while` iteration. That count tells me exactly how many nodes belong to the current level before I start enqueuing the next one. Without the snapshot, as I push children during the loop, `len(queue)` would grow — I'd drift into processing next-level nodes as if they were part of the current ___.",
          answer: "wave",
        },
        {
          line: "`from collections import deque` + `queue = deque([root])` — I use deque instead of a plain list because `list.pop(0)` is O(n): Python has to shift every remaining element left. `deque.popleft()` is ___ because a deque is a doubly-linked structure with a direct pointer to the front. For a tree with thousands of nodes, that difference compounds every level.",
          answer: "O(1)",
        },
        {
          line: "I append the completed `level` list to `result` after the ___ loop finishes — that's when the entire wave has been processed.",
          answer: "inner",
        },
      ],
    },
    {
      id: "rightmost-node",
      title: "Find Rightmost Node at Each Level",
      difficulty: "medium",
      prompt:
        "Given the root of a binary tree, return a list of the values of the rightmost node at each level (right side view).",
      patternKeywords: ["bfs", "level-order", "tree", "rightmost"],
      solution: `from collections import deque

def right_side_view(root):
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
        "I'm doing standard level-order BFS — snapshot the level size, drain exactly that many nodes, enqueue their children.",
        "`level_size = len(queue)` snapshot — I freeze the count before the inner loop because the queue grows as I enqueue children. If I checked `len(queue)` inside the loop instead of snapshotting, I'd process next-level nodes inside the current level's iteration, breaking level separation entirely.",
        "I'm using the loop index `i` to detect the last node in each level: when `i == level_size - 1`, that's the rightmost node processed, so I record it.",
        "By appending only the last node of each level, I naturally get the right side view without any extra bookkeeping.",
      ],
      testCase: {
        input: "root = [1, 2, 3, null, 5, null, 4]",
        expected: "[1, 3, 4]",
        trace: [
          "queue = [1]",
          "level_size = 1 → i=0, last node: record 1",
          "enqueue 2, 3; queue = [2, 3]",
          "level_size = 2 → i=0 pop 2 (not last); i=1 pop 3 (last): record 3",
          "enqueue 5 (from 2), 4 (from 3); queue = [5, 4]",
          "level_size = 2 → i=0 pop 5; i=1 pop 4 (last): record 4",
          "result = [1, 3, 4]",
        ],
        traceExplanations: [
          "Root is the sole node on level 0.",
          "level_size is 1, so i=0 is also the last index — root is recorded.",
          "Root's children are enqueued for level 1.",
          "Level has 2 nodes. Only the last one (index 1, value 3) is the rightmost.",
          "Node 2 had child 5; node 3 had child 4. Both are pushed for level 2.",
          "Again 2 nodes. Node 4 is at index 1, the last — it is recorded.",
          "Queue is empty. Result holds the rightmost value from each wave.",
        ],
      },
      blanks: [
        {
          line: "            if i == ___:",
          answer: "if i == level_size - 1:",
        },
        {
          line: "                result.append(___)",
          answer: "result.append(node.val)",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm using the loop index `i` to detect the last node in each level: when `i == level_size - 1`, that's the ___ node processed, so I record it.",
          answer: "rightmost",
        },
        {
          line: "`level_size = len(queue)` snapshot — I freeze the count before the inner loop because the queue grows as I enqueue children. If I checked `len(queue)` inside the loop instead of snapshotting, I'd process next-level nodes inside the current level's iteration, breaking level ___ entirely.",
          answer: "separation",
        },
      ],
    },
    {
      id: "rotting-oranges",
      title: "Rotting Oranges",
      difficulty: "medium",
      prompt:
        "You are given an m×n grid. Each cell is 0 (empty), 1 (fresh orange), or 2 (rotten orange). Every minute, any fresh orange adjacent (4-directionally) to a rotten orange becomes rotten. Return the minimum number of minutes until no fresh orange remains, or -1 if it is impossible.",
      patternKeywords: ["bfs", "multi-source", "grid", "shortest-path"],
      solution: `from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh = 0

    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    if fresh == 0:
        return 0

    minutes = 0
    directions = [(1,0),(-1,0),(0,1),(0,-1)]

    while queue and fresh > 0:
        minutes += 1
        level_size = len(queue)

        for _ in range(level_size):
            r, c = queue.popleft()

            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2
                    fresh -= 1
                    queue.append((nr, nc))

    return minutes if fresh == 0 else -1`,
      solutionExplanation: [
        "I'm seeding the queue with ALL rotten oranges at once — that's the multi-source trick. Every rotten orange is a simultaneous starting point, so BFS spreads from all of them in parallel rather than one at a time.",
        "`from collections import deque` with `queue.popleft()` — each BFS step processes a cell at the front of the queue. A list would make every `pop(0)` O(n), which for a large grid means O(rows×cols) shifts per dequeue. Deque keeps every operation O(1).",
        "I'm counting fresh oranges upfront. This lets me detect impossibility: if fresh > 0 after BFS, some oranges were isolated.",
        "Each BFS level represents one minute. I snapshot the queue length (`level_size = len(queue)`) to process exactly the oranges that turned rotten in the previous minute, then spread to their fresh neighbors. The snapshot is necessary because enqueuing newly-rotten cells during the loop would otherwise bleed them into the current minute's processing.",
        "When a fresh neighbor is infected, I mutate the grid to 2 to mark it visited and decrement `fresh`. Using the grid itself as the visited set avoids a separate data structure — checking `grid[nr][nc] == 1` is both the freshness test and the not-yet-visited check in a single condition.",
        "I return `minutes` if fresh hit zero, otherwise -1 — those oranges were unreachable.",
      ],
      testCase: {
        input: "grid = [[2,1,1],[1,1,0],[0,1,1]]",
        expected: "4",
        trace: [
          "queue = [(0,0)], fresh = 6, minutes = 0",
          "minute 1: spread from (0,0) → infect (0,1),(1,0); fresh = 4",
          "minute 2: spread from (0,1),(1,0) → infect (0,2),(1,1); fresh = 2",
          "minute 3: spread from (0,2),(1,1) → infect (2,1); fresh = 1",
          "minute 4: spread from (2,1) → infect (2,2); fresh = 0",
          "fresh == 0 → return 4",
        ],
        traceExplanations: [
          "Only one rotten orange initially. It is the sole BFS source.",
          "First wave: (0,0) can reach (0,1) and (1,0). Both are fresh so they become rotten and join the queue.",
          "Second wave processes both newly rotten cells. Each spreads to its fresh neighbors.",
          "Third wave: newly rotten cells infect the remaining reachable fresh orange.",
          "Fourth wave clears the last fresh orange.",
          "Since fresh is now 0, the answer is the number of BFS levels (minutes) elapsed.",
        ],
      },
      blanks: [
        {
          line: "            if grid[r][c] == 2:",
          answer: "if grid[r][c] == 2:\n                queue.append((r, c))",
        },
        {
          line: "                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == ___:",
          answer: "grid[nr][nc] == 1",
        },
        {
          line: "    return ___ if fresh == 0 else -1",
          answer: "return minutes if fresh == 0 else -1",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm seeding the queue with ALL rotten oranges at once — that's the ___ trick. Every rotten orange is a simultaneous starting point, so BFS spreads from all of them in parallel rather than one at a time.",
          answer: "multi-source",
        },
        {
          line: "When a fresh neighbor is infected, I mutate the grid to 2 to mark it visited and decrement `fresh`. Using the grid itself as the ___ set avoids a separate data structure — checking `grid[nr][nc] == 1` is both the freshness test and the not-yet-visited check in a single condition.",
          answer: "visited",
        },
        {
          line: "Each BFS level represents one minute. I snapshot the queue length (`level_size = len(queue)`) to process exactly the oranges that turned rotten in the previous minute, then spread to their fresh neighbors. The snapshot is necessary because enqueuing newly-rotten cells during the loop would otherwise bleed them into the current minute's ___.",
          answer: "processing",
        },
      ],
    },
    {
      id: "01-matrix",
      title: "01 Matrix",
      difficulty: "medium",
      prompt:
        "Given an m×n binary matrix of 0s and 1s, return a matrix of the same size where each cell contains the distance to the nearest 0.",
      patternKeywords: ["bfs", "multi-source", "grid", "distance"],
      solution: `from collections import deque

def update_matrix(mat):
    rows, cols = len(mat), len(mat[0])
    dist = [[float('inf')] * cols for _ in range(rows)]
    queue = deque()

    for r in range(rows):
        for c in range(cols):
            if mat[r][c] == 0:
                dist[r][c] = 0
                queue.append((r, c))

    directions = [(1,0),(-1,0),(0,1),(0,-1)]

    while queue:
        r, c = queue.popleft()

        for dr, dc in directions:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                if dist[nr][nc] > dist[r][c] + 1:
                    dist[nr][nc] = dist[r][c] + 1
                    queue.append((nr, nc))

    return dist`,
      solutionExplanation: [
        "I'm initializing all distances to infinity, then setting every 0-cell to distance 0 and loading them all into the queue. This is multi-source BFS — every zero is a simultaneous origin.",
        "`from collections import deque` — the queue here holds grid coordinates. With a list, every `pop(0)` would shift all remaining coordinates left (O(n)). With deque, `popleft()` is O(1). For an m×n grid with many cells this makes the difference between O((m×n)²) and O(m×n) total dequeue cost.",
        "BFS guarantees that the first time we reach a cell, it's via the shortest path. So when I see `dist[nr][nc] > dist[r][c] + 1`, I know I've found a shorter route and I relax the distance.",
        "The relaxation condition `dist[nr][nc] > dist[r][c] + 1` doubles as the visited check — if a cell already has a distance ≤ current + 1, we don't re-enqueue it. This replaces a separate `visited` set entirely.",
        "The result matrix `dist` fills in naturally as BFS waves ripple outward from all zeros simultaneously.",
      ],
      testCase: {
        input: "mat = [[0,0,0],[0,1,0],[1,1,1]]",
        expected: "[[0,0,0],[0,1,0],[1,2,1]]",
        trace: [
          "queue = [(0,0),(0,1),(0,2),(1,0),(1,2)], all zeros at dist 0",
          "Process (0,0): neighbors (0,1) dist 0 already, (1,0) dist 0 already — no updates",
          "Process (1,0): neighbor (2,0) is 1-cell, dist[2][0] = 1, enqueue (2,0)",
          "Process (1,2): neighbor (2,2) is 1-cell, dist[2][2] = 1, enqueue (2,2)",
          "Process (2,0): neighbor (2,1) dist inf > 2, dist[2][1] = 2, enqueue (2,1)",
          "Process (2,2): neighbor (2,1) dist 2, not less than 2 — no update",
          "Final dist[2][1] = 2",
        ],
        traceExplanations: [
          "All zero-cells are sources with distance 0 — they are all in the queue from the start.",
          "Zero-cells adjacent to other zero-cells produce no updates since distances are already optimal.",
          "The first 1-cell (2,0) gets reached from its nearest zero (1,0) — distance 1.",
          "Similarly (2,2) is reached from (1,2) at distance 1.",
          "(2,1) is surrounded by 1-cells. Its nearest zero is 2 steps away. It gets relaxed to 2.",
          "When (2,2) tries to update (2,1), the existing distance 2 is already optimal.",
          "BFS from all zeros simultaneously ensures every cell gets the shortest possible distance.",
        ],
      },
      blanks: [
        {
          line: "            if mat[r][c] == 0:",
          answer: "if mat[r][c] == 0:\n                dist[r][c] = 0\n                queue.append((r, c))",
        },
        {
          line: "                if dist[nr][nc] > ___:",
          answer: "if dist[nr][nc] > dist[r][c] + 1:",
        },
        {
          line: "                    dist[nr][nc] = ___",
          answer: "dist[nr][nc] = dist[r][c] + 1",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm initializing all distances to infinity, then setting every 0-cell to distance 0 and loading them all into the queue. This is ___ BFS — every zero is a simultaneous origin.",
          answer: "multi-source",
        },
        {
          line: "BFS guarantees that the first time we reach a cell, it's via the shortest path. So when I see `dist[nr][nc] > dist[r][c] + 1`, I know I've found a shorter route and I ___ the distance.",
          answer: "relax",
        },
        {
          line: "The relaxation condition `dist[nr][nc] > dist[r][c] + 1` doubles as the ___ check — if a cell already has a distance ≤ current + 1, we don't re-enqueue it. This replaces a separate `visited` set entirely.",
          answer: "visited",
        },
      ],
    },
    {
      id: "minimum-knight-moves",
      title: "Minimum Knight Moves",
      difficulty: "medium",
      prompt:
        "A knight starts at (0, 0) on an infinite chessboard. Return the minimum number of moves to reach (x, y).",
      patternKeywords: ["bfs", "grid", "shortest-path", "2d"],
      solution: `from collections import deque

def min_knight_moves(x: int, y: int) -> int:
    # Exploit symmetry: work in first quadrant
    x, y = abs(x), abs(y)

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
        "I'm using `abs(x), abs(y)` to fold the problem into the first quadrant. By symmetry, the minimum moves to (x, y) equals the minimum to (|x|, |y|), which cuts the search space dramatically.",
        "`from collections import deque` + `queue = deque([(0, 0, 0)])` — each element is a tuple of (row, col, moves). Using a list and `pop(0)` would be O(n) per step; on an infinite board with many reachable positions, that makes BFS quadratic. Deque keeps `popleft()` O(1).",
        "I seed BFS from (0,0) with 0 moves. Each node carries its move count so I don't need a separate distance map.",
        "`visited = {(0, 0)}` — I use a set literal, not a list, because `(nr, nc) not in visited` needs to be O(1). A list check would be O(n) per neighbor per node. On a large chessboard with many visited positions this becomes a major bottleneck. Set membership testing uses hashing and is O(1) on average.",
        "The 8 knight-move deltas are all combinations of (±1, ±2) and (±2, ±1). BFS guarantees the first time we reach the target, it's with the fewest moves.",
        "I allow coordinates down to -2 to handle edge cases near the origin — a knight sometimes needs to step slightly negative before reaching a small positive target.",
        "I add to `visited` before enqueuing, not after dequeuing — this prevents duplicate entries in the queue. If I added after dequeuing, the same cell could be enqueued multiple times before it's ever processed.",
      ],
      testCase: {
        input: "x = 2, y = 1",
        expected: "1",
        trace: [
          "queue = [(0,0,0)], visited = {(0,0)}",
          "Pop (0,0,0). Not target. Enqueue all valid knight moves from origin.",
          "(2,1) is a valid neighbor, enqueue (2,1,1)",
          "Pop (2,1,1). r==x and c==y → return 1",
        ],
        traceExplanations: [
          "We start at the origin with 0 moves.",
          "From (0,0) a knight can reach 8 squares; we enqueue all that pass the bounds check.",
          "(2,1) is one of the 8 legal knight destinations and matches our target.",
          "BFS pops nodes in order of increasing move count, so the first time we hit the target it is the minimum.",
        ],
      },
      blanks: [
        {
          line: "    x, y = ___, ___",
          answer: "x, y = abs(x), abs(y)",
        },
        {
          line: "        if r == x and c == y:",
          answer: "if r == x and c == y:\n            return moves",
        },
        {
          line: "            if (nr, nc) not in visited and nr >= ___ and nc >= ___:",
          answer: "if (nr, nc) not in visited and nr >= -2 and nc >= -2:",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm using `abs(x), abs(y)` to fold the problem into the first quadrant. By symmetry, the minimum moves to (x, y) equals the minimum to (|x|, |y|), which cuts the ___ space dramatically.",
          answer: "search",
        },
        {
          line: "I add to `visited` before enqueuing, not after dequeuing — this prevents duplicate entries in the queue. If I added after dequeuing, the same cell could be ___ multiple times before it's ever processed.",
          answer: "enqueued",
        },
        {
          line: "`visited = {(0, 0)}` — I use a set literal, not a list, because `(nr, nc) not in visited` needs to be O(1). A list check would be ___ per neighbor per node. On a large chessboard with many visited positions this becomes a major bottleneck. Set membership testing uses hashing and is O(1) on average.",
          answer: "O(n)",
        },
      ],
    },
  ],
}
