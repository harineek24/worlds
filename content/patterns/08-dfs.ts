import { Pattern } from "../types"

export const dfs: Pattern = {
  id: "dfs",
  order: 8,
  patternName: "Depth-First Search (DFS)",

  philosophy: {
    text: "Not all those who wander are lost.",
    source: "J.R.R. Tolkien",
    connection:
      "DFS commits fully to one path before exploring another. It trusts the path it's on — going deep, resolving completely, then returning. The call stack is its memory of where it's been. Every recursive call is not a detour; it's the work. Wandering down a subtree isn't confusion — it's exactly the plan.",
  },

  template: {
    description:
      "DFS explores one branch completely before backtracking. On trees, trust the return value from children and combine at each node. On graphs, carry a visited set to avoid cycles. The shape of the recursion mirrors the shape of the structure.",
    snippet: `# DFS on tree — recursive
def dfs(node):
    if not node:
        return base_case

    left = dfs(node.left)
    right = dfs(node.right)

    return combine(left, right, node.val)

# DFS on graph — with visited set
def dfs(node, visited):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited)`,
  },

  pythonTools: [
    {
      name: "Recursive DFS: trust the return value from children",
      snippet: `left = dfs(node.left)   # fully resolved subtree answer
right = dfs(node.right)  # fully resolved subtree answer
return combine(left, right, node.val)`,
    },
    {
      name: "if not node: return — base case first, always",
      snippet: `def dfs(node):
    if not node:        # base case before any logic
        return 0        # choose: 0, False, None, [], etc.
    # ... recursive case`,
    },
    {
      name: "Pass values DOWN via parameters, return values UP via return",
      snippet: `# Passing state down (e.g. bounds, running sum)
def dfs(node, lo, hi):
    dfs(node.left, lo, node.val)
    dfs(node.right, node.val, hi)

# Returning state up (e.g. depth, count)
def dfs(node):
    return 1 + max(dfs(node.left), dfs(node.right))`,
    },
  ],

  problems: [
    {
      id: "max-depth-binary-tree",
      title: "Maximum Depth of Binary Tree",
      difficulty: "easy",
      prompt:
        "Given the root of a binary tree, return its maximum depth. A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.",
      patternKeywords: ["depth", "height", "tree", "recursion", "bottom-up"],
      solution: `def maxDepth(root):
    if not root:
        return 0
    left = maxDepth(root.left)
    right = maxDepth(root.right)
    return 1 + max(left, right)`,
      solutionExplanation: [
        "Base case: None represents the empty tree, which has depth 0. This is returned up to the parent as a clean signal that there's nothing below.",
        "I recurse into both subtrees first. I'm asking each child: what is the deepest path beneath you? The call returns only after fully resolving the entire subtree — I don't need to track state myself.",
        "At each node, I take the longer of the two child depths and add 1 for the current node. The tradeoff: O(n) time visiting every node, O(h) space on the call stack where h is the height — O(log n) for balanced, O(n) worst case for skewed.",
      ],
      testCase: {
        input: "root = [3,9,20,null,null,15,7]",
        expected: "3",
        trace: [
          "dfs(3)",
          "  dfs(9)",
          "    dfs(None) → 0",
          "    dfs(None) → 0",
          "  ← return 1 + max(0,0) = 1",
          "  dfs(20)",
          "    dfs(15)",
          "      dfs(None) → 0",
          "      dfs(None) → 0",
          "    ← return 1 + max(0,0) = 1",
          "    dfs(7)",
          "      dfs(None) → 0",
          "      dfs(None) → 0",
          "    ← return 1 + max(0,0) = 1",
          "  ← return 1 + max(1,1) = 2",
          "← return 1 + max(1,2) = 3",
        ],
        traceExplanations: [
          "We enter node 3 at the root — depth 1 in the tree.",
          "We go left first, entering node 9.",
          "Node 9 has no left child — base case returns 0.",
          "Node 9 has no right child — base case returns 0.",
          "Node 9 combines its children's depths: 1 + max(0,0) = 1. This answer travels UP to node 3.",
          "We now explore node 3's right subtree, entering node 20.",
          "Node 20 has a left child 15 — we recurse into it.",
          "Node 15 has no left child.",
          "Node 15 has no right child.",
          "Node 15 returns depth 1 up to node 20.",
          "Node 20 has a right child 7 — we recurse into it.",
          "Node 7 has no left child.",
          "Node 7 has no right child.",
          "Node 7 returns depth 1 up to node 20.",
          "Node 20 combines: 1 + max(1,1) = 2. Returned up to root (node 3).",
          "Root combines: 1 + max(1, 2) = 3. The right subtree was deeper, so it determines the answer.",
        ],
      },
      blanks: [
        { line: `if not root:`, answer: "root" },
        { line: `    return ___`, answer: "0" },
        { line: `left = maxDepth(root.___)`, answer: "left" },
        { line: `right = maxDepth(root.___)`, answer: "right" },
        { line: `return 1 + ___(left, right)`, answer: "max" },
      ],
    },

    {
      id: "path-sum",
      title: "Path Sum",
      difficulty: "easy",
      prompt:
        "Given the root of a binary tree and an integer targetSum, return true if the tree has a root-to-leaf path such that adding up all the values along the path equals targetSum.",
      patternKeywords: ["path", "leaf", "target", "top-down", "pass down"],
      solution: `def hasPathSum(root, targetSum):
    if not root:
        return False
    if not root.left and not root.right:
        return root.val == targetSum
    remaining = targetSum - root.val
    return hasPathSum(root.left, remaining) or hasPathSum(root.right, remaining)`,
      solutionExplanation: [
        "Base case 1: empty node (None). A None node is not a leaf — it means the path ended without a real leaf. Return False.",
        "Base case 2: leaf node (no children). This is the only place a valid path can terminate. I check if the remaining sum equals this node's value — the path used up exactly targetSum.",
        "Recursive case: subtract the current node's value from the target and pass the remainder DOWN to both children. I'm asking: can either subtree complete a path that accounts for the remaining sum? The 'or' short-circuits — if the left subtree succeeds, we don't explore right.",
      ],
      testCase: {
        input: "root = [5,4,8,11,null,13,4,7,2], targetSum = 22",
        expected: "true",
        trace: [
          "dfs(5, 22)",
          "  remaining = 22 - 5 = 17",
          "  dfs(4, 17)",
          "    remaining = 17 - 4 = 13",
          "    dfs(11, 13)",
          "      remaining = 13 - 11 = 2",
          "      dfs(7, 2)",
          "        leaf: 7 == 2? → False",
          "      dfs(2, 2)",
          "        leaf: 2 == 2? → True  ✓",
          "      ← return False or True = True",
          "    ← return True",
          "  ← return True  (left subtree succeeded, right skipped)",
          "← return True",
        ],
        traceExplanations: [
          "We start at root 5 with the full target 22.",
          "We've consumed 5 — 17 remains. Pass 17 down.",
          "Enter node 4 (left child of 5).",
          "Consumed 4 — 13 remains.",
          "Enter node 11.",
          "Consumed 11 — 2 remains.",
          "Enter node 7 (left child of 11).",
          "Node 7 is a leaf. Does 7 equal the remaining 2? No — this path doesn't work.",
          "Enter node 2 (right child of 11).",
          "Node 2 is a leaf. Does 2 equal the remaining 2? Yes — path 5→4→11→2 sums to 22.",
          "Node 11 returns True because its right subtree succeeded. Left failure is irrelevant once right succeeds.",
          "Node 4 got True from its left child. No need to check right (node null).",
          "Short-circuit: the 'or' at node 5 sees True from the left, so right subtree (rooted at 8) is never visited.",
          "True propagates all the way to the caller.",
        ],
      },
      blanks: [
        { line: `if not root.left and not root.___:`, answer: "right" },
        { line: `    return root.val == ___`, answer: "targetSum" },
        { line: `remaining = targetSum - ___`, answer: "root.val" },
        {
          line: `return hasPathSum(root.left, ___) or hasPathSum(root.right, ___)`,
          answer: "remaining",
        },
      ],
    },

    {
      id: "validate-bst",
      title: "Validate Binary Search Tree",
      difficulty: "medium",
      prompt:
        "Given the root of a binary tree, determine if it is a valid binary search tree (BST). A valid BST has: the left subtree of a node containing only nodes with keys strictly less than the node's key, the right subtree containing only nodes with keys strictly greater, and both subtrees also being valid BSTs.",
      patternKeywords: ["BST", "bounds", "constraints", "top-down", "pass down"],
      solution: `def isValidBST(root):
    def dfs(node, lo, hi):
        if not node:
            return True
        if not (lo < node.val < hi):
            return False
        return dfs(node.left, lo, node.val) and dfs(node.right, node.val, hi)
    return dfs(root, float('-inf'), float('inf'))`,
      solutionExplanation: [
        "I pass valid bounds (lo, hi) DOWN to each node. Every node must satisfy lo < node.val < hi. These bounds tighten as we go deeper — a node's value becomes a constraint for its subtree.",
        "The critical insight: checking only parent-child relationships isn't enough. A classic trap is a node in a left subtree that's smaller than its immediate parent but larger than an ancestor — this violates BST globally. Passing bounds catches that.",
        "When going left, the current node's value becomes the new upper bound. When going right, it becomes the new lower bound. This is the invariant that propagates 'everything in my left subtree must be less than me' all the way down. Time: O(n), Space: O(h).",
      ],
      testCase: {
        input: "root = [5,1,4,null,null,3,6]",
        expected: "false",
        trace: [
          "dfs(5, -inf, +inf)",
          "  -inf < 5 < +inf → valid",
          "  dfs(1, -inf, 5)",
          "    -inf < 1 < 5 → valid",
          "    dfs(None, -inf, 1) → True",
          "    dfs(None, 1, 5)   → True",
          "  ← return True",
          "  dfs(4, 5, +inf)",
          "    5 < 4 < +inf? → 4 > 5 is False → INVALID",
          "  ← return False",
          "← return True and False = False",
        ],
        traceExplanations: [
          "Root 5 starts with unconstrained bounds. It passes.",
          "Node 1 inherits upper bound 5 from its parent. 1 < 5 ✓.",
          "Node 1's children are None — they trivially return True.",
          "Left subtree of root is valid.",
          "Node 4 is in root's RIGHT subtree, so it inherits lower bound 5.",
          "4 must be > 5 (lower bound) but 4 < 5 — constraint violated. Even though 4 < parent 5 locally looks like a valid left child relationship elsewhere, as a right child of 5 it must exceed 5.",
          "The False from node 4 propagates: root's right subtree failed, so the whole tree is not a valid BST.",
        ],
      },
      blanks: [
        { line: `def dfs(node, lo, ___):`, answer: "hi" },
        { line: `    if not (___ < node.val < hi):`, answer: "lo" },
        {
          line: `    return dfs(node.left, lo, ___) and dfs(node.right, ___, hi)`,
          answer: "node.val",
        },
        {
          line: `return dfs(root, float('___'), float('inf'))`,
          answer: "-inf",
        },
      ],
    },

    {
      id: "diameter-binary-tree",
      title: "Diameter of a Binary Tree",
      difficulty: "easy",
      prompt:
        "Given the root of a binary tree, return the length of the diameter of the tree. The diameter is the length of the longest path between any two nodes. This path may or may not pass through the root. The length of a path is the number of edges between nodes.",
      patternKeywords: ["diameter", "depth", "global max", "bottom-up", "nonlocal"],
      solution: `def diameterOfBinaryTree(root):
    diameter = [0]

    def dfs(node):
        if not node:
            return 0
        left = dfs(node.left)
        right = dfs(node.right)
        diameter[0] = max(diameter[0], left + right)
        return 1 + max(left, right)

    dfs(root)
    return diameter[0]`,
      solutionExplanation: [
        "Each node can be the 'elbow' — the highest point of the longest path passing through it. At that node, the longest path length is left_depth + right_depth (number of edges down to the deepest leaf on each side).",
        "I track a global maximum across all nodes because the longest diameter might pass through any node, not necessarily the root. I use a list [0] as a mutable container so the inner function can update it without a nonlocal declaration.",
        "The return value is the depth of the current subtree (for use by the parent), while the side effect updates the global diameter candidate. These are two separate concerns handled in one pass. Time: O(n) — every node visited once.",
      ],
      testCase: {
        input: "root = [1,2,3,4,5]",
        expected: "3",
        trace: [
          "dfs(1)",
          "  dfs(2)",
          "    dfs(4)",
          "      dfs(None) → 0",
          "      dfs(None) → 0",
          "      diameter = max(0, 0+0) = 0",
          "    ← return 1",
          "    dfs(5)",
          "      dfs(None) → 0",
          "      dfs(None) → 0",
          "      diameter = max(0, 0+0) = 0",
          "    ← return 1",
          "    diameter = max(0, 1+1) = 2   ← path 4→2→5",
          "  ← return 1 + max(1,1) = 2",
          "  dfs(3)",
          "    dfs(None) → 0",
          "    dfs(None) → 0",
          "    diameter = max(2, 0+0) = 2",
          "  ← return 1",
          "  diameter = max(2, 2+1) = 3     ← path 4→2→1→3",
          "← return 1 + max(2,1) = 3",
          "return diameter[0] = 3",
        ],
        traceExplanations: [
          "We recurse all the way to the leaves before doing any diameter computation — this is bottom-up.",
          "Node 4 is a leaf. Both children return 0. The path through node 4 has length 0+0=0. Not an improvement.",
          "Node 4 returns depth 1 to its parent (node 2).",
          "Node 5 is also a leaf. Same result: depth 1 returned to node 2.",
          "At node 2: left_depth=1 (from node 4), right_depth=1 (from node 5). Path through node 2 has 1+1=2 edges (path: 4→2→5). This is a new maximum.",
          "Node 2 returns depth 2 to root (it's the deeper child direction).",
          "Node 3 is a leaf, returns depth 1 to root.",
          "At root (node 1): left_depth=2 (from node 2), right_depth=1 (from node 3). Path through root: 2+1=3 edges (path: 4→2→1→3). New maximum.",
          "The diameter is 3, passing through the root in this case — but the algorithm would find it even if it didn't.",
        ],
      },
      blanks: [
        { line: `diameter[0] = max(diameter[0], left + ___)`, answer: "right" },
        { line: `return 1 + ___(left, right)`, answer: "max" },
        { line: `diameter = ___`, answer: "[0]" },
        { line: `return diameter[___]`, answer: "0" },
      ],
    },

    {
      id: "path-sum-ii",
      title: "Path Sum II",
      difficulty: "medium",
      prompt:
        "Given the root of a binary tree and an integer targetSum, return all root-to-leaf paths where the sum of the node values equals targetSum. Each path should be returned as a list of node values.",
      patternKeywords: ["backtracking", "all paths", "collect", "path", "leaf"],
      solution: `def pathSum(root, targetSum):
    result = []

    def dfs(node, remaining, path):
        if not node:
            return
        path.append(node.val)
        if not node.left and not node.right and remaining == node.val:
            result.append(list(path))
        dfs(node.left, remaining - node.val, path)
        dfs(node.right, remaining - node.val, path)
        path.pop()

    dfs(root, targetSum, [])
    return result`,
      solutionExplanation: [
        "I carry a mutable path list down the recursion. At each node I append before recursing and pop after — this is the backtracking contract. The path always reflects exactly the nodes on the current root-to-here route.",
        "I only collect a path at a leaf node where remaining equals the current node's value. Collecting at non-leaf nodes would capture partial paths. I use list(path) to snapshot the current path — without the copy, every collected path would end up pointing to the same mutated list.",
        "After both recursive calls return, path.pop() undoes the append from this level. The function leaves the path exactly as it found it. This is the core backtracking pattern: add → recurse → remove. Time: O(n²) in the worst case because copying a path of length O(n) for each of O(n) leaves.",
      ],
      testCase: {
        input: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22",
        expected: "[[5,4,11,2],[5,8,4,5]]",
        trace: [
          "dfs(5, 22, [])",
          "  path=[5]",
          "  dfs(4, 17, [5])",
          "    path=[5,4]",
          "    dfs(11, 13, [5,4])",
          "      path=[5,4,11]",
          "      dfs(7, 2, [5,4,11])",
          "        path=[5,4,11,7]",
          "        leaf: remaining=2, node.val=7 → 2≠7, skip",
          "        path.pop() → [5,4,11]",
          "      dfs(2, 2, [5,4,11])",
          "        path=[5,4,11,2]",
          "        leaf: remaining=2, node.val=2 → 2==2 ✓  collect [5,4,11,2]",
          "        path.pop() → [5,4,11]",
          "      path.pop() → [5,4]",
          "    path.pop() → [5]",
          "  dfs(8, 14, [5])",
          "    path=[5,8]",
          "    dfs(13, 6, [5,8])",
          "      path=[5,8,13]",
          "      leaf: remaining=6, node.val=13 → 6≠13, skip",
          "      path.pop() → [5,8]",
          "    dfs(4, 6, [5,8])",
          "      path=[5,8,4]",
          "      dfs(None, 2, [5,8,4]) → return",
          "      dfs(1, 2, [5,8,4])",
          "        path=[5,8,4,1]",
          "        leaf: remaining=2, node.val=1 → 2≠1, skip",
          "        path.pop() → [5,8,4]",
          "      path.pop() → [5,8]",
          "    path.pop() → [5]",
          "  path.pop() → []",
          "return [[5,4,11,2]]",
        ],
        traceExplanations: [
          "Enter root 5. Append 5 to path. path=[5].",
          "Recurse left to node 4 with remaining 17.",
          "Append 4. path=[5,4].",
          "Recurse left to node 11 with remaining 13.",
          "Append 11. path=[5,4,11].",
          "Recurse left to node 7 with remaining 2.",
          "Append 7. path=[5,4,11,7]. Node 7 is a leaf.",
          "Leaf check fails: 7 ≠ remaining 2. This path doesn't sum to target.",
          "Backtrack: pop 7. path=[5,4,11]. Node 7's branch is fully explored.",
          "Recurse right to node 2 with remaining 2.",
          "Append 2. path=[5,4,11,2]. Node 2 is a leaf.",
          "Leaf check: 2 == remaining 2. Snapshot and collect [5,4,11,2]. ✓",
          "Backtrack: pop 2. path=[5,4,11]. Node 2's branch fully explored.",
          "Backtrack through node 11 (pop), node 4 (pop). Right subtree of 4 is None.",
          "Now explore root's right subtree: node 8 with remaining 14.",
          "Nodes 13 and 4 are explored. Node 13 is a leaf but 13 ≠ remaining 6. Node 4 has one child (1) — None and 1. Node 1 is a leaf but 1 ≠ remaining 2.",
          "All branches exhausted. Backtrack all the way. Final result has only one valid path.",
        ],
      },
      blanks: [
        { line: `path.___(node.val)`, answer: "append" },
        {
          line: `if not node.left and not node.right and remaining == ___:`,
          answer: "node.val",
        },
        { line: `    result.append(___(path))`, answer: "list" },
        {
          line: `dfs(node.left, remaining - ___, path)`,
          answer: "node.val",
        },
        { line: `path.___()`, answer: "pop" },
      ],
    },
  ],
}
