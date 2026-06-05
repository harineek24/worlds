import { Pattern } from "../types"

export const greedy: Pattern = {
  id: "greedy",
  order: 13,
  patternName: "Greedy",

  philosophy: {
    text: "Take care of each moment and you will take care of all time.",
    source: "Buddha",
    connection:
      "Greedy makes the locally optimal choice at each step, trusting that these choices compose into a global optimum. It doesn't agonize over the future — it acts on what's best right now. Each moment handled well is enough.",
  },

  template: {
    description:
      "At each step, make the choice that looks best right now. No backtracking, no lookahead. Works when local optima compose into a global optimum — provable by exchange argument or greedy stays ahead.",
    snippet: `# Greedy skeleton
result = initial_state
for item in sorted_or_ordered_input:
    if <greedy condition>:
        result = update(result, item)
return result`,
  },

  pythonTools: [
    {
      name: "Sort by custom key",
      snippet: `# Sort by second element descending, then first ascending
items.sort(key=lambda x: (-x[1], x[0]))

# Sort intervals by end time
intervals.sort(key=lambda x: x[1])`,
    },
    {
      name: "Track running state variable",
      snippet: `# Running max / min / sum
running_max = float('-inf')
for x in arr:
    running_max = max(running_max, x)
    # use running_max here`,
    },
  ],

  problems: [
    {
      id: "buy-sell-stock",
      title: "Best Time to Buy and Sell Stock",
      difficulty: "easy",
      prompt:
        "Given an array `prices` where `prices[i]` is the price of a stock on day `i`, return the maximum profit you can achieve from a single buy-sell transaction. If no profit is possible, return 0.",
      patternKeywords: ["greedy", "running minimum", "single pass"],
      solution: `def maxProfit(prices):
    min_price = float('inf')
    max_profit = 0
    for price in prices:
        min_price = min(min_price, price)
        max_profit = max(max_profit, price - min_price)
    return max_profit`,
      solutionExplanation: [
        "I'm tracking the minimum price seen so far because the best buy day is always the cheapest day before the current day — I don't need to look back once I've recorded it.",
        "I'm computing `price - min_price` at every step because the best sell day is always today if it beats our current best. The greedy insight is: if I could buy at the lowest point before today, what's today's profit? Take the max across all days.",
        "I return `max_profit` which accumulates the best answer seen. No nested loops needed — one pass is sufficient because buy must precede sell and we never need to revisit.",
      ],
      testCase: {
        input: "prices = [7, 1, 5, 3, 6, 4]",
        expected: "5",
        trace: [
          "price=7: min_price=7, profit=0",
          "price=1: min_price=1, profit=0",
          "price=5: min_price=1, profit=4",
          "price=3: min_price=1, profit=4",
          "price=6: min_price=1, profit=5",
          "price=4: min_price=1, profit=5",
        ],
        traceExplanations: [
          "7 is the first price so it's trivially the minimum. Profit is 0 — can't sell same day.",
          "1 is cheaper than 7, so we update min_price. Still no positive profit yet.",
          "Selling at 5 after buying at 1 gives 4. New best profit.",
          "Selling at 3 gives only 2. We keep profit=4 — greedy keeps the best.",
          "Selling at 6 after buying at 1 gives 5. New best profit.",
          "Selling at 4 gives 3. Profit stays at 5 — our answer.",
        ],
      },
      blanks: [
        {
          line: "min_price = min(min_price, price)",
          answer: "Update the running minimum to track the cheapest buy day seen so far.",
        },
        {
          line: "max_profit = max(max_profit, price - min_price)",
          answer: "Greedily check if selling today beats our best profit, using the cheapest historical buy.",
        },
      ],
    },
    {
      id: "gas-station",
      title: "Gas Station",
      difficulty: "medium",
      prompt:
        "There are `n` gas stations in a circle. `gas[i]` is the fuel at station `i`, `cost[i]` is the fuel to travel from `i` to `i+1`. Return the starting station index if you can complete the circuit, or -1 if impossible. The solution is guaranteed unique if it exists.",
      patternKeywords: ["greedy", "running sum", "reset start"],
      solution: `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    tank, start = 0, 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            tank = 0
            start = i + 1
    return start`,
      solutionExplanation: [
        "I first check if total gas >= total cost. If not, no solution exists — there's not enough fuel globally. This is the key feasibility check.",
        "I'm tracking a running `tank` balance. When `tank` goes negative at station `i`, I know any starting point from `start` through `i` will also fail — they'd inherit the same deficit. So I reset `start` to `i+1`.",
        "Since we already confirmed total gas >= total cost, a valid start must exist. By the time we finish the loop, `start` is the only candidate that could work — all earlier candidates were eliminated greedily.",
      ],
      testCase: {
        input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
        expected: "3",
        trace: [
          "i=0: tank=1-3=-2 < 0 → reset, start=1",
          "i=1: tank=2-4=-2 < 0 → reset, start=2",
          "i=2: tank=3-5=-2 < 0 → reset, start=3",
          "i=3: tank=4-1=3 ≥ 0 → keep",
          "i=4: tank=3+5-2=6 ≥ 0 → keep",
          "return start=3",
        ],
        traceExplanations: [
          "Starting at 0: we immediately go negative. Station 0 is not viable.",
          "Starting at 1: still negative. Station 1 eliminated.",
          "Starting at 2: still negative. Station 2 eliminated.",
          "Starting at 3: we gain net +3 fuel. This could work — keep going.",
          "Station 4 adds net +3. Tank stays positive through the end.",
          "We confirmed total gas >= total cost up front, so station 3 must complete the circuit.",
        ],
      },
      blanks: [
        {
          line: "if sum(gas) < sum(cost): return -1",
          answer: "Global feasibility check — if total fuel is insufficient, no starting point can work.",
        },
        {
          line: "if tank < 0: tank = 0; start = i + 1",
          answer: "Greedy reset: any start from current `start` to `i` fails here, so the next viable start is i+1.",
        },
      ],
    },
    {
      id: "jump-game",
      title: "Jump Game",
      difficulty: "medium",
      prompt:
        "Given an integer array `nums` where `nums[i]` is the maximum jump length from index `i`, return `true` if you can reach the last index starting from index 0.",
      patternKeywords: ["greedy", "max reachable", "single pass"],
      solution: `def canJump(nums):
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
    return True`,
      solutionExplanation: [
        "I'm tracking `max_reach` — the furthest index reachable given all jumps made so far. This is the greedy state: I don't need to track which exact path got me here, only how far I can reach.",
        "At each index `i`, if `i > max_reach`, it means I can never land on index `i` — I'm stuck. Return False immediately.",
        "Otherwise, I greedily extend `max_reach` to `max(max_reach, i + jump)`. If we make it through the whole array without getting stuck, return True.",
      ],
      testCase: {
        input: "nums = [2, 3, 1, 1, 4]",
        expected: "true",
        trace: [
          "i=0, jump=2: max_reach=max(0,2)=2",
          "i=1, jump=3: max_reach=max(2,4)=4",
          "i=2, jump=1: max_reach=max(4,3)=4",
          "i=3, jump=1: max_reach=max(4,4)=4",
          "i=4, jump=4: max_reach=max(4,8)=8",
          "return True",
        ],
        traceExplanations: [
          "From index 0 with jump 2, we can reach up to index 2.",
          "From index 1 with jump 3, we can reach index 4 — extends our horizon.",
          "Index 2 is within reach (2 <= 4). Jump only reaches 3, doesn't extend max_reach.",
          "Index 3 is within reach. Jump reaches 4, ties max_reach.",
          "Index 4 is the last index and is within reach. We can extend even further, confirming we're not stuck.",
          "Never hit the `i > max_reach` condition, so we return True.",
        ],
      },
      blanks: [
        {
          line: "if i > max_reach: return False",
          answer: "If we can't even reach the current index, we're permanently stuck — no path forward exists.",
        },
        {
          line: "max_reach = max(max_reach, i + jump)",
          answer: "Greedily extend our reachable frontier using the jump available at the current index.",
        },
      ],
    },
    {
      id: "jump-game-ii",
      title: "Jump Game II",
      difficulty: "medium",
      prompt:
        "Given `nums` where `nums[i]` is the max jump from index `i`, return the minimum number of jumps to reach the last index. It is guaranteed you can always reach the last index.",
      patternKeywords: ["greedy", "BFS levels", "window end", "furthest reach"],
      solution: `def jump(nums):
    jumps = 0
    current_end = 0
    farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == current_end:
            jumps += 1
            current_end = farthest
    return jumps`,
      solutionExplanation: [
        "I'm modeling this like BFS levels. Each 'level' is the set of indices reachable in exactly `jumps` jumps. `current_end` marks where the current level ends.",
        "At every index `i`, I greedily track the farthest index reachable from anywhere in the current level. This tells me what the next level's boundary will be.",
        "When `i` reaches `current_end`, I've exhausted the current level. I must take one more jump, and the next level's boundary is `farthest`. I increment `jumps` and advance `current_end`.",
        "I stop at `len(nums) - 1` because once we reach the last index we don't need another jump. The loop handles the last level implicitly.",
      ],
      testCase: {
        input: "nums = [2, 3, 1, 1, 4]",
        expected: "2",
        trace: [
          "i=0: farthest=max(0,2)=2, i==current_end(0) → jumps=1, current_end=2",
          "i=1: farthest=max(2,4)=4",
          "i=2: farthest=max(4,3)=4, i==current_end(2) → jumps=2, current_end=4",
          "i=3: farthest=max(4,4)=4 (loop ends before i=4)",
          "return 2",
        ],
        traceExplanations: [
          "At index 0 (level 0 end), we must jump. From level 0 we can reach up to index 2. Level 1 spans [1,2].",
          "At index 1 we can reach index 4 — this extends our next-level horizon.",
          "At index 2 (level 1 end), we must jump again. Farthest reachable from level 1 is 4. Level 2 spans [3,4].",
          "Index 4 is the target — we've already counted the jump to get here.",
          "Two jumps total: 0→1 (or 0→2), then from level 1 to index 4.",
        ],
      },
      blanks: [
        {
          line: "farthest = max(farthest, i + nums[i])",
          answer: "Track the farthest index reachable from any position in the current BFS level.",
        },
        {
          line: "if i == current_end: jumps += 1; current_end = farthest",
          answer: "When we exhaust the current level, commit to a jump and advance the level boundary to the farthest we can reach.",
        },
      ],
    },
    {
      id: "partition-labels",
      title: "Partition Labels",
      difficulty: "medium",
      prompt:
        "Given a string `s`, partition it into as many parts as possible so that each letter appears in at most one part. Return a list of the sizes of these parts.",
      patternKeywords: ["greedy", "last occurrence", "extend boundary"],
      solution: `def partitionLabels(s):
    last = {c: i for i, c in enumerate(s)}
    result = []
    start = boundary = 0
    for i, c in enumerate(s):
        boundary = max(boundary, last[c])
        if i == boundary:
            result.append(i - start + 1)
            start = i + 1
    return result`,
      solutionExplanation: [
        "I first build a `last` map recording the final occurrence index of each character. This is the key precomputation — it tells me the minimum extent of any partition that includes a given character.",
        "I walk through the string maintaining a `boundary` — the furthest index the current partition must extend to, given all characters seen so far. I greedily extend it whenever I encounter a character whose last occurrence is further out.",
        "When `i == boundary`, every character seen in `[start, i]` has its last occurrence at or before `i`. This is a clean split point. I record the partition size and advance `start`.",
      ],
      testCase: {
        input: 's = "ababcbacadefegdehijhklij"',
        expected: "[9, 7, 8]",
        trace: [
          "last: a→8, b→5, c→7, d→14, e→15, f→11, g→13, h→19, i→22, j→23, k→20, l→21",
          "i=0 c=a: boundary=max(0,8)=8",
          "i=1 c=b: boundary=max(8,5)=8",
          "i=5 c=b: boundary=max(8,5)=8",
          "i=8 c=a: boundary=max(8,8)=8, i==boundary → partition size=9, start=9",
          "i=9 c=d: boundary=max(9,14)=14 … i=15 e: boundary=15, i==boundary → size=7, start=16",
          "i=16..23: boundary extends to 23, i==23 → size=8",
        ],
        traceExplanations: [
          "Precompute the last index of every character. This drives all boundary decisions.",
          "Seeing 'a' at index 0 forces the partition to extend at least to index 8 (last 'a').",
          "Seeing 'b' at index 1: its last occurrence (5) is before current boundary (8). No change.",
          "Seeing 'b' again at 5: still doesn't push boundary beyond 8.",
          "At index 8 we've covered all characters in this partition. Clean split — size is 8-0+1=9.",
          "Second partition: 'd' and 'e' push boundary to 15. Split at 15, size=7.",
          "Third partition covers the rest of the string, size=8.",
        ],
      },
      blanks: [
        {
          line: "last = {c: i for i, c in enumerate(s)}",
          answer: "Precompute the last occurrence of every character — this defines the minimum boundary for any partition containing that character.",
        },
        {
          line: "boundary = max(boundary, last[c])",
          answer: "Greedily extend the partition boundary whenever the current character's last occurrence is further than our current endpoint.",
        },
        {
          line: "if i == boundary: result.append(i - start + 1); start = i + 1",
          answer: "When current index equals boundary, every character in this partition is fully contained — make the split.",
        },
      ],
    },
  ],
}
