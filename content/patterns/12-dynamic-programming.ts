import { Pattern } from "../types"

export const dynamicProgramming: Pattern = {
  id: "dynamic-programming",
  order: 12,
  patternName: "Dynamic Programming",

  philosophy: {
    text: "Study the past if you would define the future.",
    source: "Confucius, Analects",
    connection:
      "Dynamic programming solves the future by learning from the past. Each subproblem is solved once and remembered — never repeated. The answer to the whole is built from the answers to its parts. You don't recompute what you already know; you trust the record and build on it. The table is memory; the recurrence is wisdom.",
  },

  template: {
    description:
      "Identify the subproblem, write the recurrence, then choose top-down (memoization via lru_cache) or bottom-up (tabulation). For 1D problems, often only the last one or two values are needed — optimize space accordingly.",
    snippet: `# Top-down (memoization)
from functools import lru_cache

@lru_cache(maxsize=None)
def dp(i):
    if i <= 1: return base_case
    return combine(dp(i-1), dp(i-2))

# Bottom-up (tabulation)
dp = [0] * (n + 1)
dp[0] = base_case_0
dp[1] = base_case_1
for i in range(2, n + 1):
    dp[i] = combine(dp[i-1], dp[i-2])

# 2D DP
dp = [[0] * (cols+1) for _ in range(rows+1)]
for i in range(1, rows+1):
    for j in range(1, cols+1):
        dp[i][j] = combine(dp[i-1][j], dp[i][j-1])`,
  },

  pythonTools: [
    {
      name: "@lru_cache(maxsize=None) — memoize recursive solution instantly",
      snippet: `from functools import lru_cache\n\n@lru_cache(maxsize=None)\ndef dp(i, j):\n    # base cases first\n    # then recurrence`,
    },
    {
      name: "Space optimization: keep only last two values",
      snippet: `prev2, prev1 = base_case_0, base_case_1\nfor i in range(2, n+1):\n    curr = prev1 + prev2\n    prev2, prev1 = prev1, curr`,
    },
    {
      name: "Think: 'what decisions do I make at each step?'",
      snippet: `# At each position i, ask:
# 1. What choices do I have?
# 2. What subproblem does each choice reduce to?
# 3. What's the base case that has no further choices?`,
    },
  ],

  problems: [
    {
      id: "climbing-stairs",
      title: "Climbing Stairs / Counting Bits",
      difficulty: "easy",
      prompt:
        "Climbing Stairs: You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. In how many distinct ways can you reach the top? Counting Bits: Given an integer n, return an array ans of length n+1 where ans[i] is the number of 1s in the binary representation of i.",
      patternKeywords: ["Fibonacci", "recurrence", "base case", "bit manipulation"],
      solution: `# Climbing Stairs
def climbStairs(n):
    if n <= 2:
        return n
    prev2, prev1 = 1, 2
    for i in range(3, n+1):
        curr = prev1 + prev2
        prev2, prev1 = prev1, curr
    return prev1

# Counting Bits
def countBits(n):
    dp = [0] * (n + 1)
    for i in range(1, n+1):
        dp[i] = dp[i >> 1] + (i & 1)
    return dp`,
      solutionExplanation: [
        "For climbing stairs, the decision at each step is: did I arrive from one step below, or two steps below? The number of ways to reach step i is the sum of ways to reach i-1 and i-2 — classic Fibonacci.",
        "I don't need the full array. I only ever look back two steps, so I track just prev1 and prev2 and slide them forward. This is O(1) space.",
        "For counting bits, I notice that right-shifting i by 1 gives i//2 — which I've already computed. The bit I dropped with the shift is i & 1. So dp[i] = dp[i>>1] + (i&1). Each answer is built from a previously computed answer.",
      ],
      testCase: {
        input: `n = 5 (climbing stairs); n = 5 (counting bits)`,
        expected: "8 (climbing); [0,1,1,2,1,2] (counting bits)",
        trace: [
          "Climbing stairs n=5:",
          "i=3: curr = 2+1 = 3",
          "i=4: curr = 3+2 = 5",
          "i=5: curr = 5+3 = 8",
          "return 8",
          "Counting bits n=5:",
          "dp[0]=0",
          "dp[1] = dp[0] + (1&1) = 0+1 = 1",
          "dp[2] = dp[1] + (2&1) = 1+0 = 1",
          "dp[3] = dp[1] + (3&1) = 1+1 = 2",
          "dp[4] = dp[2] + (4&1) = 1+0 = 1",
          "dp[5] = dp[2] + (5&1) = 1+1 = 2",
          "return [0,1,1,2,1,2]",
        ],
        traceExplanations: [
          "We initialized prev2=1 (ways to reach step 1) and prev1=2 (ways to reach step 2).",
          "Step 3: you can arrive from step 2 (2 ways) or step 1 (1 way). Total: 3.",
          "Step 4: from step 3 (3 ways) or step 2 (2 ways). Total: 5.",
          "Step 5: from step 4 (5 ways) or step 3 (3 ways). Total: 8.",
          "Space-optimized: we never stored more than two values at once.",
          "Counting bits: dp[0]=0 is the base case — zero has no set bits.",
          "1 in binary is '1'. Right shift gives 0 (dp[0]=0), plus the dropped bit (1). Total: 1.",
          "2 in binary is '10'. Right shift gives 1 (dp[1]=1), dropped bit is 0. Total: 1.",
          "3 in binary is '11'. Right shift gives 1 (dp[1]=1), dropped bit is 1. Total: 2.",
          "4 in binary is '100'. Right shift gives 2 (dp[2]=1), dropped bit is 0. Total: 1.",
          "5 in binary is '101'. Right shift gives 2 (dp[2]=1), dropped bit is 1. Total: 2.",
          "Every answer reused a previously computed answer — no redundant work.",
        ],
      },
      blanks: [
        { line: `curr = prev1 ___ prev2`, answer: "+" },
        { line: `prev2, prev1 = ___, ___`, answer: "prev1, curr" },
        { line: `dp[i] = dp[i ___ 1] + (i ___ 1)`, answer: ">>, &" },
      ],
    },

    {
      id: "unique-paths",
      title: "Unique Paths",
      difficulty: "medium",
      prompt:
        "A robot is on an m x n grid at the top-left corner. It can only move right or down. How many unique paths are there to reach the bottom-right corner?",
      patternKeywords: ["2D DP", "grid", "paths", "combinatorics"],
      solution: `def uniquePaths(m, n):
    dp = [[1] * n for _ in range(m)]
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    return dp[m-1][n-1]`,
      solutionExplanation: [
        "I initialize the entire first row and first column to 1. There's exactly one way to reach any cell in the first row (go right the whole way) and any cell in the first column (go down the whole way).",
        "For any interior cell, the robot arrived either from above (dp[i-1][j]) or from the left (dp[i][j-1]). The total paths to this cell is the sum of those two — because every path to this cell must have come from one of those two neighbors.",
        "I fill the table row by row. Each cell depends only on cells already computed. The answer is in the bottom-right corner.",
      ],
      testCase: {
        input: `m = 3, n = 3`,
        expected: "6",
        trace: [
          "Initialize: dp = [[1,1,1],[1,0,0],[1,0,0]]",
          "i=1,j=1: dp[1][1] = dp[0][1] + dp[1][0] = 1+1 = 2",
          "i=1,j=2: dp[1][2] = dp[0][2] + dp[1][1] = 1+2 = 3",
          "i=2,j=1: dp[2][1] = dp[1][1] + dp[2][0] = 2+1 = 3",
          "i=2,j=2: dp[2][2] = dp[1][2] + dp[2][1] = 3+3 = 6",
          "return dp[2][2] = 6",
        ],
        traceExplanations: [
          "First row and column are all 1 — only one way to travel along a single axis.",
          "Cell (1,1) can be reached from (0,1) or (1,0). Two paths converge here.",
          "Cell (1,2) can be reached from (0,2) (1 path) or (1,1) (2 paths). Total: 3.",
          "Cell (2,1) can be reached from (1,1) (2 paths) or (2,0) (1 path). Total: 3.",
          "Bottom-right: 3 paths from above + 3 paths from left = 6 total.",
          "Every unique path in the grid is accounted for by the recurrence.",
        ],
      },
      blanks: [
        { line: `dp = [[___] * n for _ in range(m)]`, answer: "1" },
        { line: `dp[i][j] = dp[___][j] + dp[i][___]`, answer: "i-1, j-1" },
        { line: `return dp[___][___]`, answer: "m-1, n-1" },
      ],
    },

    {
      id: "longest-increasing-subsequence",
      title: "Longest Increasing Subsequence",
      difficulty: "medium",
      prompt:
        "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
      patternKeywords: ["subsequence", "LIS", "optimization", "nested loop DP"],
      solution: `def lengthOfLIS(nums):
    n = len(nums)
    dp = [1] * n
    for i in range(1, n):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)`,
      solutionExplanation: [
        "dp[i] represents the length of the longest increasing subsequence ending at index i. Every element alone is a subsequence of length 1, so I initialize all values to 1.",
        "For each i, I look back at every j before it. If nums[j] < nums[i], then nums[i] can legally extend the subsequence ending at j. The new length would be dp[j] + 1.",
        "I take the max across all valid j. This ensures dp[i] holds the best possible LIS ending at i — no matter which previous element I extended from.",
        "The final answer is the maximum value anywhere in dp, because the best overall LIS might end at any index.",
      ],
      testCase: {
        input: `nums = [10,9,2,5,3,7,101,18]`,
        expected: "4",
        trace: [
          "dp = [1,1,1,1,1,1,1,1]",
          "i=1 (9): no j with nums[j]<9 valid → dp[1]=1",
          "i=2 (2): no j with nums[j]<2 → dp[2]=1",
          "i=3 (5): j=2 (2<5) → dp[3]=dp[2]+1=2",
          "i=4 (3): j=2 (2<3) → dp[4]=dp[2]+1=2",
          "i=5 (7): j=2 (2<7)→3, j=3 (5<7)→3, j=4 (3<7)→3 → dp[5]=3",
          "i=6 (101): all previous valid → best is dp[5]+1=4 → dp[6]=4",
          "i=7 (18): j=5 (7<18)→4, j=2,3,4 all give ≤4 → dp[7]=4",
          "max(dp) = 4 → return 4",
        ],
        traceExplanations: [
          "Every element starts as a length-1 subsequence — itself alone.",
          "9 has no smaller element before it in the array.",
          "2 is the smallest element seen so far.",
          "5 can follow 2, extending that subsequence to length 2.",
          "3 can also follow 2, giving another length-2 subsequence.",
          "7 can follow 2, 5, or 3 — all give length 3. The recurrence picks the best.",
          "101 can follow everything. The best predecessor is 7 (length 3), giving length 4.",
          "18 can't follow 101, but can follow 7, giving length 4.",
          "The best LIS ending anywhere is 4 — the sequence [2,3,7,18] or [2,5,7,18].",
        ],
      },
      blanks: [
        { line: `dp = [___] * n`, answer: "1" },
        { line: `if nums[j] ___ nums[i]:`, answer: "<" },
        { line: `dp[i] = max(dp[i], dp[j] ___ 1)`, answer: "+" },
        { line: `return ___(dp)`, answer: "max" },
      ],
    },

    {
      id: "word-break",
      title: "Word Break",
      difficulty: "medium",
      prompt:
        "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
      patternKeywords: ["string DP", "segmentation", "substring check", "boolean DP"],
      solution: `def wordBreak(s, wordDict):
    word_set = set(wordDict)
    n = len(s)
    dp = [False] * (n + 1)
    dp[0] = True

    for i in range(1, n+1):
        for j in range(i):
            if dp[j] and s[j:i] in word_set:
                dp[i] = True
                break

    return dp[n]`,
      solutionExplanation: [
        "dp[i] means the first i characters of s can be validly segmented. dp[0] = True is the base case — an empty string is trivially segmented.",
        "For each position i, I scan all split points j before it. If the prefix up to j is already valid (dp[j] is True) and the substring s[j:i] is in the dictionary, then the prefix up to i is also valid.",
        "I convert wordDict to a set first because dictionary lookup should be O(1). Checking membership in a list would be O(k) per lookup.",
        "The break is an optimization: once I've found one valid split for position i, I don't need to check the others. dp[i] is True regardless.",
        "The final answer is dp[n] — whether the entire string can be segmented.",
      ],
      testCase: {
        input: `s = "leetcode", wordDict = ["leet","code"]`,
        expected: "True",
        trace: [
          `dp = [T, F, F, F, F, F, F, F, F]  (length 9, index 0..8)`,
          "i=1: j=0, s[0:1]='l' not in dict",
          "i=2: j=0, s[0:2]='le' not in dict",
          "i=3: j=0, s[0:3]='lee' not in dict",
          "i=4: j=0, dp[0]=T and s[0:4]='leet' in dict → dp[4]=True",
          "i=5..7: no valid j found",
          "i=8: j=4, dp[4]=T and s[4:8]='code' in dict → dp[8]=True",
          "return dp[8] = True",
        ],
        traceExplanations: [
          "dp[0]=True is the anchor. Without it, nothing can ever be marked True.",
          "Single characters aren't in the dictionary.",
          "Two-character prefix isn't in the dictionary.",
          "Three-character prefix isn't in the dictionary.",
          "i=4: the substring 'leet' (indices 0-3) is in the dictionary, and dp[0] is True. The first 4 characters are valid.",
          "Positions 5, 6, 7 have no valid split — 'leetc', 'leetco', 'leetcod' aren't in the dict, and neither are 'c', 'co', 'cod' alone.",
          "i=8: we check j=4. dp[4] is True and s[4:8]='code' is in the dictionary. The full string is valid.",
          "dp[8] = True confirms the entire string can be segmented.",
        ],
      },
      blanks: [
        { line: `dp = [___] * (n + 1)`, answer: "False" },
        { line: `dp[___] = True`, answer: "0" },
        { line: `if dp[j] and s[j:i] in ___:`, answer: "word_set" },
        { line: `dp[i] = ___`, answer: "True" },
        { line: `return dp[___]`, answer: "n" },
      ],
    },

    {
      id: "decode-ways",
      title: "Decode Ways",
      difficulty: "medium",
      prompt:
        "A message containing letters A-Z can be encoded as '1' to '26'. Given a string s of digits, return the number of ways to decode it. '0' cannot map to any letter, and leading zeros in a two-digit number are invalid.",
      patternKeywords: ["string DP", "decoding", "two choices", "validity check"],
      solution: `def numDecodings(s):
    n = len(s)
    dp = [0] * (n + 1)
    dp[0] = 1
    dp[1] = 1 if s[0] != '0' else 0

    for i in range(2, n+1):
        one = s[i-1]
        two = s[i-2:i]
        if one != '0':
            dp[i] += dp[i-1]
        if '10' <= two <= '26':
            dp[i] += dp[i-2]

    return dp[n]`,
      solutionExplanation: [
        "dp[i] is the number of ways to decode the first i characters. dp[0] = 1 is the empty-string base case — there's one way to decode nothing.",
        "dp[1] depends on whether the first character is '0'. A '0' can't be decoded as a single digit, so dp[1] = 0 in that case.",
        "At each position i, I have two choices: decode s[i-1] as a single digit, or decode s[i-2:i] as a two-digit number.",
        "Single digit is valid only if it isn't '0'. If valid, I add dp[i-1] — all the ways I could have decoded up to the previous position.",
        "Two digits are valid only if they form a number from 10 to 26. If valid, I add dp[i-2] — all the ways up to two positions back.",
        "These two contributions can stack. If both choices are valid at position i, the total ways doubles appropriately.",
      ],
      testCase: {
        input: `s = "226"`,
        expected: "3",
        trace: [
          "dp[0] = 1  (empty base case)",
          "dp[1] = 1  (s[0]='2', not '0')",
          "i=2: one='2', two='22'",
          "  one='2' != '0' → dp[2] += dp[1] = 1",
          "  '10'<='22'<='26' → dp[2] += dp[0] = 1",
          "  dp[2] = 2",
          "i=3: one='6', two='26'",
          "  one='6' != '0' → dp[3] += dp[2] = 2",
          "  '10'<='26'<='26' → dp[3] += dp[1] = 1",
          "  dp[3] = 3",
          "return dp[3] = 3",
        ],
        traceExplanations: [
          "dp[0]=1 is the anchor — it represents the successful decoding of the empty prefix.",
          "First character '2' is valid as a single digit. One way to decode it.",
          "At i=2 we examine the second character '2' alone and the pair '22'.",
          "Decoding '2' as a single digit: valid. We inherit dp[1]=1 way.",
          "Decoding '22' as a two-digit number: 22 is in [10,26]. Valid. We inherit dp[0]=1 way.",
          "Two ways to decode the first two characters: '2|2' or '22'.",
          "At i=3 we examine '6' alone and '26' as a pair.",
          "Decoding '6' as a single digit: valid. We inherit dp[2]=2 ways.",
          "Decoding '26' as a two-digit number: 26 is in [10,26]. Valid. We inherit dp[1]=1 way.",
          "Three total ways: '2|2|6', '22|6', '2|26'.",
        ],
      },
      blanks: [
        { line: `dp[0] = ___`, answer: "1" },
        { line: `dp[1] = 1 if s[0] != ___ else 0`, answer: "'0'" },
        { line: `if one != ___:`, answer: "'0'" },
        { line: `dp[i] += dp[___]`, answer: "i-1" },
        { line: `if ___ <= two <= ___:`, answer: "'10', '26'" },
        { line: `dp[i] += dp[___]`, answer: "i-2" },
      ],
    },
  ],
}
