import { Pattern } from "../types"

export const trie: Pattern = {
  id: "trie",
  order: 14,
  patternName: "Trie",

  philosophy: {
    text: "The art of writing is the art of discovering what you believe.",
    source: "Gustave Flaubert",
    connection:
      "A trie discovers structure in strings letter by letter. It doesn't store words — it stores paths. The meaning emerges from the journey through the tree, not from any single node. Each step forward narrows down what's possible, until belief is confirmed or denied.",
  },

  template: {
    description:
      "Use a nested dict where each key is a character and '#' marks end-of-word. Insert by walking and creating nodes; search by walking and checking existence.",
    snippet: `trie = {}

def insert(word):
    node = trie
    for c in word:
        node = node.setdefault(c, {})
    node['#'] = True

def search(word):
    node = trie
    for c in word:
        if c not in node:
            return False
        node = node[c]
    return '#' in node

def starts_with(prefix):
    node = trie
    for c in prefix:
        if c not in node:
            return False
        node = node[c]
    return True`,
  },

  pythonTools: [
    {
      name: "Nested dict for trie node",
      snippet: `trie = {}
node = trie
node = node.setdefault(c, {})  # create child if missing, then descend`,
    },
    {
      name: "'#' as end-of-word marker",
      snippet: `node['#'] = True   # mark end of word after inserting last char
'#' in node        # check if current node completes a word`,
    },
  ],

  problems: [
    {
      id: "implement-trie",
      title: "Implement Trie (Prefix Tree)",
      difficulty: "medium",
      prompt:
        "Implement the Trie class with insert(word), search(word), and startsWith(prefix) methods. search returns true if the word is in the trie, startsWith returns true if any word in the trie starts with the given prefix.",
      patternKeywords: ["prefix tree", "insert", "search", "startsWith", "autocomplete"],
      solution: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word: str) -> None:
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node['#'] = True

    def search(self, word: str) -> bool:
        node = self.root
        for c in word:
            if c not in node:
                return False
            node = node[c]
        return '#' in node

    def startsWith(self, prefix: str) -> bool:
        node = self.root
        for c in prefix:
            if c not in node:
                return False
            node = node[c]
        return True`,
      solutionExplanation: [
        "I'm using a nested dict as the trie. Each node is a dict whose keys are characters leading to child nodes. I start from self.root for every operation.",
        "For insert, I walk the word character by character, using setdefault to create a child node if it doesn't exist yet. After the last character I place a '#' key to mark this path as a complete word.",
        "For search, I walk the same path. If any character is missing, the word isn't in the trie. After the last character I check for '#' — without it, the word is only a prefix of something longer, not an exact match.",
        "startsWith is identical to search except I don't check for '#' at the end. Reaching the end of the prefix without a missing node is enough confirmation.",
        "Syntax — why dict instead of a TrieNode class: In Python interviews, a nested dict replaces an entire class definition. node.setdefault(c, {}) both creates and returns a child in one call — a TrieNode class would need a children dict anyway, plus __init__ boilerplate. The tradeoff is readability for complex operations (like deletion), but for insert/search/startsWith the dict approach is faster to write and equally correct.",
        "Syntax — why '#' as the end-of-word marker: Any sentinel key that cannot appear as a real character works. '#' is a common convention because it's not a letter, so it's visually distinct when you're staring at the trie structure during debugging. 'end', True, or 1 also work — the choice is convention, not correctness.",
      ],
      testCase: {
        input: 'insert("apple"), search("apple"), search("app"), startsWith("app")',
        expected: "true, false, true",
        trace: [
          'insert("apple"): root→{a:{}}, →{a:{p:{}}}, →{a:{p:{p:{}}}}, →{a:{p:{p:{l:{}}}}}, →{a:{p:{p:{l:{e:{}}}}}}, mark e node with #',
          'search("apple"): walk a→p→p→l→e, find # → return True',
          'search("app"): walk a→p→p, no # at p node → return False',
          'startsWith("app"): walk a→p→p, node exists → return True',
        ],
        traceExplanations: [
          "Each character of 'apple' either finds an existing child or creates one with setdefault. After 'e', we stamp '#' to say this path spells a complete word.",
          "Walking 'apple' follows an existing path all the way to the 'e' node, which has '#'. Exact match confirmed.",
          "Walking 'app' reaches the second 'p' node successfully, but there's no '#' there — 'app' was never inserted as a word, only as a prefix of 'apple'.",
          "startsWith doesn't require '#'. Reaching the end of 'app' without a missing node means at least one word starts with 'app'.",
        ],
      },
      blanks: [
        {
          line: "node = node.setdefault(___, {})",
          answer: "c",
        },
        {
          line: "node[___] = True",
          answer: "'#'",
        },
        {
          line: "return ___ in node",
          answer: "'#'",
        },
      ],
    },
    {
      id: "prefix-matching",
      title: "Word Search II / Prefix Matching",
      difficulty: "hard",
      prompt:
        "Given an m x n board of characters and a list of strings words, return all words on the board. Each word must be constructed from letters of sequentially adjacent cells (horizontally or vertically neighboring). The same letter cell may not be used more than once in a word.",
      patternKeywords: ["board", "word search", "DFS", "trie", "multiple words", "backtracking"],
      solution: `def findWords(board, words):
    trie = {}
    for word in words:
        node = trie
        for c in word:
            node = node.setdefault(c, {})
        node['#'] = word  # store word at end node

    rows, cols = len(board), len(board[0])
    result = set()

    def dfs(r, c, node):
        ch = board[r][c]
        if ch not in node:
            return
        next_node = node[ch]
        if '#' in next_node:
            result.add(next_node['#'])
        board[r][c] = '$'  # mark visited
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != '$':
                dfs(nr, nc, next_node)
        board[r][c] = ch  # restore

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, trie)

    return list(result)`,
      solutionExplanation: [
        "I build a trie from all target words upfront. This lets the DFS prune immediately — if the current character isn't in the trie node, there's no word starting with this prefix, and I stop.",
        "I store the completed word string at the '#' node rather than just True. That way when I find a match deep in the DFS, I can collect the word directly without reconstructing it.",
        "The DFS starts from every cell on the board. At each step I descend both the board and the trie simultaneously. I mark visited cells with '$' to avoid reuse, then restore them on backtrack.",
        "Using a set for results handles the edge case where the same word can be found via multiple paths — it's only added once.",
        "Syntax — why [(0,1),(0,-1),(1,0),(-1,0)] for directions: Encoding four directions as a list of tuples lets me iterate over them in a loop instead of writing four separate if-branches. It's data-driven: adding diagonal support later means appending four more tuples, not duplicating DFS logic. Each tuple is (row delta, col delta), unpacked cleanly with 'for dr, dc in ...'.",
        "Syntax — why board[r][c] = '$' for visited: I mark visited cells in-place on the board rather than maintaining a separate visited set. This saves O(m*n) space and avoids keeping two data structures in sync. '$' works as the sentinel because the board only contains letters. On backtrack, I restore board[r][c] = ch to undo the mark.",
      ],
      testCase: {
        input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]',
        expected: '["oath", "eat"]',
        trace: [
          "Build trie with paths for 'oath', 'pea', 'eat', 'rain'",
          "DFS from (0,1)=a: a→t→e path not in trie for 'ate', but (1,0)=e→(1,1)=t... wait, start (1,0)=e",
          "DFS from (1,0)=e: e→(0,0)=o? no. e→(1,1)=t? 'et' not a trie prefix. e→(2,0)=i? no.",
          "DFS from (1,3)=e: e→(0,3)=n? no. e→(1,2)=a: 'ea'→(0,2)=a? no. 'ea'→(2,2)=k? no. 'ea'→(1,1)=t: 'eat' → found '#'!",
          "DFS from (0,0)=o: o→(1,0)=e? 'oe' not in trie. o→(0,1)=a: 'oa'→(1,1)=t: 'oat'→(2,1)=h: 'oath' → found '#'!",
        ],
        traceExplanations: [
          "Pre-loading all words into the trie means the DFS can prune any path not matching a trie prefix — far fewer paths explored than checking each word separately.",
          "Many DFS branches die immediately because the first character isn't a trie root key.",
          "Even when we get 2–3 chars deep, the trie kills branches that can't lead to any word.",
          "Starting at 'e' at position (1,3), navigating right then down spells 'eat', confirmed by '#' in the trie node.",
          "Starting at 'o' at (0,0), moving to 'a' at (0,1), then 't' at (1,1), then 'h' at (2,1) spells 'oath'.",
        ],
      },
      blanks: [
        {
          line: "node['#'] = ___",
          answer: "word",
        },
        {
          line: "if ch not in node:",
          answer: "if ch not in node:",
        },
        {
          line: "board[r][c] = '___'  # mark visited",
          answer: "$",
        },
      ],
    },
    {
      id: "longest-word-dictionary",
      title: "Longest Word in Dictionary",
      difficulty: "medium",
      prompt:
        "Given an array of strings words representing an English dictionary, return the longest word in words that can be built one character at a time by other words in words. If there is more than one possible answer, return the longest word with the smallest lexicographical order. If there is no answer, return the empty string.",
      patternKeywords: ["build one character", "prefix exists", "dictionary", "longest word"],
      solution: `trie = {}
for word in sorted(words):
    node = trie
    for c in word:
        node = node.setdefault(c, {})
    node['#'] = word

result = ''
stack = [trie]
while stack:
    node = stack.pop()
    for c, child in node.items():
        if c == '#':
            continue
        if '#' in child:
            word = child['#']
            if len(word) > len(result):
                result = word
            stack.append(child)
return result`,
      solutionExplanation: [
        "I insert all words into the trie, storing the word string at the '#' node as before. I sort words first so that when two words of the same length exist, the lexicographically smaller one is stored.",
        "I do a DFS/BFS traversal of the trie, but I only follow edges into child nodes that have '#' — meaning only into nodes where a complete word ends. This is the key constraint: every prefix must itself be a word in the dictionary.",
        "If a node has '#', the word ending there was built one character at a time from valid prefixes. I track the longest such word encountered. Sorting ensures ties are broken lexicographically without extra comparison logic.",
        "Syntax — why sorted(words) before inserting: dict insertion order in Python 3.7+ is preserved, but that's not the reason to sort here. Sorting ensures that when we store child['#'] = word, lexicographically earlier words of the same length are stored first. Since we only update result when len(word) > len(result) (strictly greater), ties naturally favor the first one encountered — which is the lexicographically smaller one after sorting.",
        "Syntax — why a stack list for traversal: I use an explicit stack (list used as a stack with .append and .pop) for the DFS rather than recursion. For trie traversal the depth is bounded by word length (usually short), so recursion would also work. The list-based stack avoids Python's recursion limit concern and is a general habit worth practicing for graph problems.",
      ],
      testCase: {
        input: 'words = ["w","wo","wor","worl","world"]',
        expected: '"world"',
        trace: [
          "Sorted words: ['w','wo','wor','worl','world']",
          "Build trie: w→o→r→l→d, '#' at each level",
          "DFS: root→w(has #, word='w') → push w-node",
          "w-node→o(has #, word='wo', len>1) → push o-node",
          "o-node→r(has #, word='wor', len>2) → push r-node",
          "r-node→l(has #, word='worl', len>3) → push l-node",
          "l-node→d(has #, word='world', len>4) → result='world'",
        ],
        traceExplanations: [
          "Sorting first means when we encounter two words of equal length, the lexicographically smaller one wins because it was stored into the trie last (overwriting) — actually we store each word at its own node, so length comparison in the traversal handles this correctly.",
          "Every node along the path w→o→r→l→d has a '#', meaning every prefix ('w','wo','wor','worl') is itself a word in the dictionary.",
          "The DFS only descends into nodes with '#'. Since 'w' has '#', we can explore further into the 'o' subtree.",
          "Each subsequent node has '#', so we keep descending and updating result.",
          "We reach 'world' at depth 5. It's the longest word where every prefix is also a valid dictionary word.",
        ],
      },
      blanks: [
        {
          line: "if '#' in ___:",
          answer: "child",
        },
        {
          line: "if len(word) > len(___):",
          answer: "result",
        },
        {
          line: "stack.append(___)",
          answer: "child",
        },
      ],
    },
  ],
}
