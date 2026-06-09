import { Pattern } from "../types"

export const backtracking: Pattern = {
  id: "backtracking",
  order: 10,
  patternName: "Backtracking",

  philosophy: {
    text: "It does not matter how slowly you go as long as you do not stop.",
    source: "Confucius",
    connection:
      "Backtracking explores every possibility with discipline — it goes as far as it can, and when a path fails, it returns exactly one step and tries the next option. No path is abandoned until it's proven dead. Progress is never lost — only redirected.",
  },

  template: {
    description:
      "At each step: choose, explore, unchoose. The unchoose step is the backtrack — it restores state so the next branch starts clean. Always copy the path before appending to results, never append a reference.",
    snippet: `def backtrack(start, current_path):
    if <base case — valid solution>:
        result.append(current_path[:])  # copy, not reference
        return

    for choice in choices_from(start):
        if <valid choice>:
            current_path.append(choice)  # choose
            backtrack(next_start, current_path)  # explore
            current_path.pop()           # unchoose (backtrack)`,
  },

  pythonTools: [
    {
      name: "path[:] or path.copy()",
      snippet: "result.append(path[:])  # always copy before appending — list is mutable",
    },
    {
      name: "current_path.pop()",
      snippet: "current_path.pop()  # the backtrack step — undo the last choice",
    },
    {
      name: "Skip duplicates after sorting",
      snippet: "nums.sort()\n# inside loop:\nif i > start and nums[i] == nums[i-1]:\n    continue",
    },
  ],

  problems: [
    {
      id: "subsets",
      title: "Subsets",
      difficulty: "medium",
      prompt:
        "Given an integer array of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.",
      patternKeywords: ["backtracking", "subsets", "recursion", "combinations"],
      solution: `def subsets(nums):
    result = []

    def backtrack(start, path):
        result.append(path[:])  # every path is a valid subset

        for i in range(start, len(nums)):
            path.append(nums[i])
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result`,
      solutionExplanation: [
        "I'm appending a copy of `path` at the very start of every recursive call — before the loop. This records every prefix as a valid subset, including the empty set.",
        "`result.append(path[:])` — I copy the path rather than appending `path` directly. Lists are passed by reference in Python, not by value. If I did `result.append(path)`, every entry in `result` would point to the same list object, which gets mutated by later appends and pops. By the time the function returns, every entry would show the same final (empty) state. `path[:]` creates a new list with the current contents, capturing a snapshot at this moment in the recursion.",
        "I'm starting each inner loop at `start` (not 0) so I only look forward in the array. This ensures I never repeat elements or generate duplicate subsets.",
        "`current_path.pop()` — I pop rather than reassign because `path` is a shared mutable list threaded through the recursion. `pop()` removes the last element in-place, exactly reversing the `append()` we did before recursing. If I instead wrote `path = path[:-1]`, I'd create a new local list and the outer call would still hold the old reference — the backtrack would silently fail.",
      ],
      testCase: {
        input: "nums = [1, 2, 3]",
        expected: "[[], [1], [1,2], [1,2,3], [1,3], [2], [2,3], [3]]",
        trace: [
          "backtrack(0, []) → append []",
          "  choose 1: backtrack(1, [1]) → append [1]",
          "    choose 2: backtrack(2, [1,2]) → append [1,2]",
          "      choose 3: backtrack(3, [1,2,3]) → append [1,2,3]; return",
          "    pop 3 → path=[1,2]; pop 2 → path=[1]",
          "    choose 3: backtrack(3, [1,3]) → append [1,3]; return",
          "  pop 3 → path=[1]; pop 1 → path=[]",
          "  choose 2: backtrack(2, [2]) → append [2]; ...",
          "  choose 3: backtrack(3, [3]) → append [3]",
        ],
        traceExplanations: [
          "The empty list is appended immediately — the empty set is a valid subset.",
          "We pick 1 as the first element. Every subset starting with 1 will be explored in this branch.",
          "From [1] we pick 2. Every subset starting with 1,2 will be explored.",
          "From [1,2] we pick 3. No more choices, we record [1,2,3] and return.",
          "We pop back up — undoing 3, then 2 — to explore the [1,3] branch.",
          "From [1] we pick 3 directly (skipping 2 since we go forward only). Record [1,3].",
          "We pop back to [] and move to the next top-level choice.",
          "Starting fresh from index 1, we explore all subsets beginning with 2.",
          "Starting fresh from index 2, we explore all subsets beginning with 3.",
        ],
      },
      blanks: [
        {
          line: "        result.append(___)",
          answer: "result.append(path[:])",
        },
        {
          line: "        for i in range(___, len(nums)):",
          answer: "for i in range(start, len(nums)):",
        },
        {
          line: "            backtrack(___ + 1, path)",
          answer: "backtrack(i + 1, path)",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm appending a copy of `path` at the very start of every recursive call — before the loop. This records every ___ as a valid subset, including the empty set.",
          answer: "prefix",
        },
        {
          line: "`result.append(path[:])` — I copy the path rather than appending `path` directly. Lists are passed by reference in Python, not by value. If I did `result.append(path)`, every entry in `result` would point to the same list object, which gets mutated by later appends and pops. By the time the function returns, every entry would show the same final (empty) state. `path[:]` creates a new list with the current contents, capturing a ___ at this moment in the recursion.",
          answer: "snapshot",
        },
        {
          line: "I'm starting each inner loop at `start` (not 0) so I only look ___ in the array. This ensures I never repeat elements or generate duplicate subsets.",
          answer: "forward",
        },
        {
          line: "`current_path.pop()` — I pop rather than reassign because `path` is a shared mutable list threaded through the recursion. `pop()` removes the last element in-place, exactly reversing the `append()` we did before recursing. If I instead wrote `path = path[:-1]`, I'd create a new local list and the outer call would still hold the old reference — the ___ would silently fail.",
          answer: "backtrack",
        },
      ],
    },
    {
      id: "generate-parentheses",
      title: "Generate Parentheses",
      difficulty: "medium",
      prompt:
        "Given n pairs of parentheses, write a function to generate all combinations of well-formed parentheses.",
      patternKeywords: ["backtracking", "string-building", "pruning", "recursion"],
      solution: `def generate_parenthesis(n):
    result = []

    def backtrack(path, open_count, close_count):
        if len(path) == 2 * n:
            result.append("".join(path))
            return

        if open_count < n:
            path.append("(")
            backtrack(path, open_count + 1, close_count)
            path.pop()

        if close_count < open_count:
            path.append(")")
            backtrack(path, open_count, close_count + 1)
            path.pop()

    backtrack([], 0, 0)
    return result`,
      solutionExplanation: [
        "I'm tracking `open_count` and `close_count` rather than the string itself. These two numbers encode all the validity constraints I need.",
        "I add `(` only when `open_count < n` — there are still open parens left to place. This prunes the search tree at the source: invalid prefixes are never explored.",
        "I add `)` only when `close_count < open_count` — there's an unmatched open paren waiting. This single condition guarantees every prefix is valid, so any complete string is automatically well-formed.",
        "`path.pop()` after each recursive call — `path` is a shared mutable list. The pop undoes exactly the `append()` from two lines above, restoring the list to its pre-branch state so the next branch starts clean. Reassigning `path` would create a new local binding and leave the caller's list unchanged, silently breaking the backtrack.",
        "When the path reaches length `2 * n`, every paren is placed and the string is valid — I join the list into a string and record it. I use a list-of-characters `path` rather than string concatenation because strings are immutable in Python: `path + '('` would allocate a new string every time, making each level O(n). List append is O(1); the join happens once at the leaf.",
      ],
      testCase: {
        input: "n = 3",
        expected: '["((()))","(()())","(())()","()(())","()()()"]',
        trace: [
          "backtrack([], 0, 0): open<3 → add (, state: open=1,close=0",
          "  backtrack([(], 1, 0): open<3 → add (, state: open=2,close=0",
          "    backtrack([((], 2, 0): open<3 → add (, state: open=3,close=0",
          "      backtrack([((( ], 3, 0): close<open → add ), state: open=3,close=1",
          "        ... eventually produces ((()))",
          "    backtrack([((], 2, 0): close<open → add ), then continue...",
          "      ... produces (()()) and (())()",
          "  backtrack([(], 1, 0): close<open → add ), open=1,close=1",
          "    ... produces ()(()) and ()()()",
        ],
        traceExplanations: [
          "We always start with `(` since we must open before closing.",
          "We continue adding `(` as long as we haven't used all n opens.",
          "When we've placed all 3 opens, only `)` can be added.",
          "We add closes one at a time, each time satisfying close < open.",
          "The first fully-formed string is `((()))` — all opens then all closes.",
          "After backtracking, we explore placing a `)` earlier to interleave.",
          "Placing `)` at different points produces the interleaved valid combinations.",
          "Starting a `)` at the second position creates the `()...` family.",
          "The `()` prefix then recurses to produce the remaining valid pairs.",
        ],
      },
      blanks: [
        {
          line: "        if open_count < ___:",
          answer: "if open_count < n:",
        },
        {
          line: "        if close_count < ___:",
          answer: "if close_count < open_count:",
        },
        {
          line: "        if len(path) == ___:",
          answer: "if len(path) == 2 * n:",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm tracking `open_count` and `close_count` rather than the string itself. These two numbers encode all the ___ constraints I need.",
          answer: "validity",
        },
        {
          line: "I add `(` only when `open_count < n` — there are still open parens left to place. This ___ the search tree at the source: invalid prefixes are never explored.",
          answer: "prunes",
        },
        {
          line: "I add `)` only when `close_count < open_count` — there's an unmatched open paren waiting. This single condition guarantees every prefix is valid, so any complete string is automatically ___.",
          answer: "well-formed",
        },
        {
          line: "`path.pop()` after each recursive call — `path` is a shared mutable list. The pop undoes exactly the `append()` from two lines above, restoring the list to its pre-branch state so the next branch starts ___. Reassigning `path` would create a new local binding and leave the caller's list unchanged, silently breaking the backtrack.",
          answer: "clean",
        },
        {
          line: "When the path reaches length `2 * n`, every paren is placed and the string is valid — I join the list into a string and record it. I use a list-of-characters `path` rather than string concatenation because strings are immutable in Python: `path + '('` would allocate a new string every time, making each level ___. List append is O(1); the join happens once at the leaf.",
          answer: "O(n)",
        },
      ],
    },
    {
      id: "combination-sum",
      title: "Combination Sum",
      difficulty: "medium",
      prompt:
        "Given an array of distinct integers `candidates` and a target integer `target`, return all unique combinations of candidates where the chosen numbers sum to target. The same number may be chosen from candidates an unlimited number of times.",
      patternKeywords: ["backtracking", "combinations", "sum", "reuse"],
      solution: `def combination_sum(candidates, target):
    result = []

    def backtrack(start, path, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        if remaining < 0:
            return

        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i, path, remaining - candidates[i])  # i, not i+1 — reuse allowed
            path.pop()

    backtrack(0, [], target)
    return result`,
      solutionExplanation: [
        "I'm passing `remaining` down the recursion rather than summing the path each time. When remaining hits 0, the path sums to the target — I record it. When remaining goes negative, this branch can never work and I prune immediately.",
        "The key to allowing reuse is passing `i` (not `i + 1`) to the recursive call. This means the same candidate can be picked again at the next level.",
        "I still loop `from start` to avoid going backwards — this prevents duplicate combinations like [2,3] and [3,2] from both appearing.",
        "`result.append(path[:])` at the base case — I must copy here for the same reason as always: `path` is a shared mutable list. Appending the reference means every stored result will reflect the final (empty) state of `path` after all backtracks complete. `path[:]` snapshots the current contents.",
        "`path.pop()` is the backtrack — it reverses the `path.append(candidates[i])` from before the recursive call, restoring the list so the next candidate in the loop starts from the same prefix.",
      ],
      testCase: {
        input: "candidates = [2, 3, 6, 7], target = 7",
        expected: "[[2,2,3],[7]]",
        trace: [
          "backtrack(0, [], 7)",
          "  choose 2: backtrack(0, [2], 5)",
          "    choose 2: backtrack(0, [2,2], 3)",
          "      choose 2: backtrack(0, [2,2,2], 1)",
          "        choose 2: remaining = -1 → prune",
          "        choose 3: remaining = -2 → prune",
          "      pop 2 → [2,2]; choose 3: backtrack(1, [2,2,3], 0) → record [2,2,3]",
          "  ...",
          "  choose 7: backtrack(3, [7], 0) → record [7]",
        ],
        traceExplanations: [
          "We start with full target remaining.",
          "We try 2 first. Remaining drops to 5.",
          "We can reuse 2. Remaining drops to 3.",
          "We can reuse 2 again. Remaining drops to 1.",
          "From 1 remaining, neither 2 nor 3 fits — both branches are pruned immediately.",
          "Back at [2,2] with 3 remaining, picking 3 hits 0 exactly — a valid combination is found.",
          "Other branches with 2 and 3 as starters are explored similarly.",
          "Trying 7 directly from the root hits 0 in one step — another valid combination.",
        ],
      },
      blanks: [
        {
          line: "        if remaining == ___:",
          answer: "if remaining == 0:",
        },
        {
          line: "            backtrack(___, path, remaining - candidates[i])  # reuse allowed",
          answer: "backtrack(i, path, remaining - candidates[i])",
        },
        {
          line: "        if remaining < ___:",
          answer: "if remaining < 0:",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm passing `remaining` down the recursion rather than summing the path each time. When remaining hits 0, the path sums to the target — I record it. When remaining goes negative, this branch can never work and I ___ immediately.",
          answer: "prune",
        },
        {
          line: "The key to allowing reuse is passing `i` (not `i + 1`) to the recursive call. This means the same ___ can be picked again at the next level.",
          answer: "candidate",
        },
        {
          line: "I still loop `from start` to avoid going ___ — this prevents duplicate combinations like [2,3] and [3,2] from both appearing.",
          answer: "backwards",
        },
        {
          line: "`result.append(path[:])` at the base case — I must copy here for the same reason as always: `path` is a shared mutable list. Appending the reference means every stored result will reflect the final (___ ) state of `path` after all backtracks complete. `path[:]` snapshots the current contents.",
          answer: "empty",
        },
        {
          line: "`path.pop()` is the backtrack — it reverses the `path.append(candidates[i])` from before the recursive call, restoring the list so the next candidate in the loop starts from the same ___.",
          answer: "prefix",
        },
      ],
    },
    {
      id: "word-search",
      title: "Word Search",
      difficulty: "medium",
      prompt:
        "Given an m×n grid of characters and a string word, return true if word exists in the grid. The word can be constructed from letters of sequentially adjacent cells (horizontally or vertically). The same cell may not be used more than once.",
      patternKeywords: ["backtracking", "dfs", "grid", "visited"],
      solution: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, index):
        if index == len(word):
            return True
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return False
        if board[r][c] != word[index]:
            return False

        temp = board[r][c]
        board[r][c] = "#"  # mark visited

        found = (dfs(r+1, c, index+1) or
                 dfs(r-1, c, index+1) or
                 dfs(r, c+1, index+1) or
                 dfs(r, c-1, index+1))

        board[r][c] = temp  # unmark (backtrack)
        return found

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):
                return True

    return False`,
      solutionExplanation: [
        "I'm trying to start the DFS from every cell in the grid. The first cell that matches `word[0]` and leads to a full match returns True immediately.",
        "At each DFS step I check three things in order: did we match the full word (base case), are we out of bounds, does the current cell match the expected character. Ordering these checks avoids index errors — the bounds check must come before the character check, otherwise `board[r][c]` would index out of range.",
        "I'm using the board itself as the visited marker — I temporarily overwrite the cell with `#` before recursing. This is O(1) extra memory. The alternative would be a separate `visited = set()` whose `in` check is O(1) on average, but the in-place marker avoids allocating and updating that set at every DFS frame.",
        "`board[r][c] = temp` after recursion — this is the backtrack step. I restore the cell so that DFS paths starting from other cells (or other branches of this DFS) can still use it. Without this restore, marking a cell as `#` would permanently block it from all future paths.",
      ],
      testCase: {
        input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"',
        expected: "true",
        trace: [
          "Start dfs(0,0,0): board[0][0]='A' == word[0]='A' ✓",
          "  Mark (0,0)='#', explore neighbors",
          "  dfs(0,1,1): board[0][1]='B' == word[1]='B' ✓",
          "    Mark (0,1)='#', explore neighbors",
          "    dfs(0,2,2): board[0][2]='C' == word[2]='C' ✓",
          "      Mark (0,2)='#', explore neighbors",
          "      dfs(1,2,3): board[1][2]='C' == word[3]='C' ✓",
          "        dfs(2,2,4): board[2][2]='E' == word[4]='E' ✓",
          "          dfs(2,1,5): board[2][1]='D' == word[5]='D' ✓",
          "            index == len(word) → return True",
        ],
        traceExplanations: [
          "We find the first character 'A' at (0,0) and start the DFS.",
          "We mark (0,0) so we cannot revisit it in this path.",
          "'B' at (0,1) matches word[1] — we continue the match.",
          "Mark (0,1) and continue exploring.",
          "'C' at (0,2) matches word[2].",
          "Mark (0,2) and explore downward.",
          "The second 'C' at (1,2) matches word[3].",
          "'E' at (2,2) matches word[4].",
          "'D' at (2,1) matches word[5], the final character.",
          "index equals the word length — the entire word is found.",
        ],
      },
      blanks: [
        {
          line: "        temp = board[r][c]",
          answer: "temp = board[r][c]\n        board[r][c] = \"#\"  # mark visited",
        },
        {
          line: "        board[r][c] = ___  # unmark (backtrack)",
          answer: "board[r][c] = temp",
        },
        {
          line: "        if index == len(word):",
          answer: "if index == len(word):\n            return True",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm trying to start the DFS from every cell in the grid. The first cell that matches `word[0]` and leads to a full match returns ___ immediately.",
          answer: "True",
        },
        {
          line: "At each DFS step I check three things in order: did we match the full word (base case), are we out of bounds, does the current cell match the expected character. Ordering these checks avoids index errors — the ___ check must come before the character check, otherwise `board[r][c]` would index out of range.",
          answer: "bounds",
        },
        {
          line: "I'm using the board itself as the visited marker — I temporarily overwrite the cell with `#` before recursing. This is O(1) extra memory. The alternative would be a separate `visited = set()` whose `in` check is O(1) on average, but the in-place marker avoids allocating and updating that set at every ___ frame.",
          answer: "DFS",
        },
        {
          line: "`board[r][c] = temp` after recursion — this is the ___ step. I restore the cell so that DFS paths starting from other cells (or other branches of this DFS) can still use it. Without this restore, marking a cell as `#` would permanently block it from all future paths.",
          answer: "backtrack",
        },
      ],
    },
    {
      id: "palindrome-partitioning",
      title: "Palindrome Partitioning",
      difficulty: "medium",
      prompt:
        "Given a string s, partition s such that every substring of the partition is a palindrome. Return all possible palindrome partitioning of s.",
      patternKeywords: ["backtracking", "palindrome", "string", "partitioning"],
      solution: `def partition(s):
    result = []

    def is_palindrome(sub):
        return sub == sub[::-1]

    def backtrack(start, path):
        if start == len(s):
            result.append(path[:])
            return

        for end in range(start + 1, len(s) + 1):
            substring = s[start:end]
            if is_palindrome(substring):
                path.append(substring)
                backtrack(end, path)
                path.pop()

    backtrack(0, [])
    return result`,
      solutionExplanation: [
        "I'm treating `start` as the left boundary of the next part to cut. At each level of recursion, I try every possible right boundary `end` from `start+1` to the end of the string.",
        "I only recurse into a substring if it's a palindrome. This is the pruning step — non-palindrome prefixes are skipped entirely, not explored.",
        "When `start` reaches `len(s)`, we've partitioned the entire string and every part in `path` is a palindrome — so we record a copy.",
        "`result.append(path[:])` — `path` is a shared mutable list that gets modified throughout the recursion. Appending the reference would mean all recorded results point to the same object, which ends up empty after all backtracks. `path[:]` creates a new list with the current substrings, permanently capturing this partition.",
        "`path.pop()` is the backtrack — it removes the substring we just appended, so the next `end` value (a longer cut from the same `start`) begins from the same prefix. This is the undo of the `path.append(substring)` two lines above.",
      ],
      testCase: {
        input: 's = "aab"',
        expected: '[["a","a","b"],["aa","b"]]',
        trace: [
          "backtrack(0, [])",
          "  end=1: s[0:1]='a' is palindrome → path=['a'], backtrack(1, ['a'])",
          "    end=2: s[1:2]='a' is palindrome → path=['a','a'], backtrack(2, ['a','a'])",
          "      end=3: s[2:3]='b' is palindrome → path=['a','a','b'], backtrack(3)",
          "        start==len(s) → record ['a','a','b']",
          "      pop 'b' → path=['a','a']",
          "    end=3: s[1:3]='ab' not palindrome → skip",
          "    start=1 exhausted, pop 'a' → path=['a']",
          "  pop 'a' → path=[]",
          "  end=2: s[0:2]='aa' is palindrome → path=['aa'], backtrack(2, ['aa'])",
          "    end=3: s[2:3]='b' → record ['aa','b']",
          "  end=3: s[0:3]='aab' not palindrome → skip",
        ],
        traceExplanations: [
          "We start at position 0 with an empty path.",
          "Taking just 'a' is a valid palindrome. We recurse with start=1.",
          "From position 1, taking 'a' is valid. We recurse with start=2.",
          "From position 2, taking 'b' is valid. We recurse with start=3.",
          "start equals string length — the whole string is consumed. We record this partition.",
          "We pop 'b' to try longer cuts from position 2, but 'b' is the only option.",
          "'ab' is not a palindrome, so this cut is pruned without recursing.",
          "All options from position 1 are exhausted. We pop 'a' to try a longer first cut.",
          "We return to the top level with an empty path.",
          "Taking 'aa' as the first part is a valid palindrome. We recurse with start=2.",
          "From position 2, 'b' completes the partition — we record ['aa','b'].",
        ],
      },
      blanks: [
        {
          line: "        if start == ___:",
          answer: "if start == len(s):",
        },
        {
          line: "        for end in range(start + 1, ___ + 1):",
          answer: "for end in range(start + 1, len(s) + 1):",
        },
        {
          line: "            if is_palindrome(___):",
          answer: "if is_palindrome(substring):",
        },
        {
          line: "                backtrack(___, path)",
          answer: "backtrack(end, path)",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm treating `start` as the left boundary of the next part to cut. At each level of recursion, I try every possible right ___ `end` from `start+1` to the end of the string.",
          answer: "boundary",
        },
        {
          line: "I only recurse into a substring if it's a palindrome. This is the ___ step — non-palindrome prefixes are skipped entirely, not explored.",
          answer: "pruning",
        },
        {
          line: "When `start` reaches `len(s)`, we've partitioned the entire string and every part in `path` is a palindrome — so we record a ___.",
          answer: "copy",
        },
        {
          line: "`result.append(path[:])` — `path` is a shared mutable list that gets modified throughout the recursion. Appending the reference would mean all recorded results point to the same object, which ends up ___ after all backtracks. `path[:]` creates a new list with the current substrings, permanently capturing this partition.",
          answer: "empty",
        },
        {
          line: "`path.pop()` is the backtrack — it removes the substring we just appended, so the next `end` value (a longer cut from the same `start`) begins from the same ___. This is the undo of the `path.append(substring)` two lines above.",
          answer: "prefix",
        },
      ],
    },
  ],
}
