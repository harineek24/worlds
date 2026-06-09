import { Pattern } from "../types"

export const greedy: Pattern = {
  id: "greedy",
  order: 13,
  patternName: "Greedy",

  philosophy: {
    text: "Take care of each moment and you will take care of all time.",
    source: "Buddha",
    connection:
      "Greedy makes the locally optimal choice at each step, trusting that these choices compose into a global optimum. It doesn't agonize over the future — it acts on what's best right now. Tend to this moment, and the destination takes care of itself.",
  },

  template: {
    description:
      "At each step, commit to the best available local choice without reconsidering. Works when the problem has the greedy-choice property: local optima compose into a global optimum.",
    snippet: `best = initial_value
for item in items:
    # greedily update best based on current item
    best = max(best, <some function of item>)
    # or: if invariant breaks, reset greedily
    if <invariant violated>:
        <reset state, advance start>
return best`,
  },

  pythonTools: [
    {
      name: "Sort by custom key",
      snippet: `items.sort(key=lambda x: x[1])  # sort by second element, e.g. end time`,
    },
    {
      name: "Track running state variable",
      snippet: `running = 0
for x in arr:
    running += x
    if running < 0:
        running = 0  # reset greedily`,
    },
  ],

  problems: [
    {
      id: "buy-sell-stock",
      title: "Best Time to Buy and Sell Stock",
      difficulty: "easy",
      prompt:
        "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock. Return the maximum profit you can achieve. If you cannot achieve any profit, return 0.",
      patternKeywords: ["maximize profit", "single transaction", "best time", "buy low sell high"],
      solution: `min_price = float('inf')
max_profit = 0
for price in prices:
    min_price = min(min_price, price)
    max_profit = max(max_profit, price - min_price)
return max_profit`,
      solutionExplanation: [
        "I'm tracking the minimum price seen so far as I scan left to right. At every new price, I ask: if I had bought at the cheapest point so far and sold today, what's my profit? That's the greedy insight — I always want to buy as cheap as possible before the current day.",
        "I update max_profit at each step with price - min_price. I never need to look back because any optimal buy must be to the left of the sell, and I've already tracked the best buy to the left.",
        "This is O(n) time and O(1) space — one pass, two variables.",
        "Syntax — why float('inf'): I initialize min_price to float('inf') rather than a large number like 10**9. float('inf') is always larger than any real number, so the first price will always beat it and become the initial minimum. A hardcoded large number is fragile — if prices can exceed it, the logic breaks. inf is mathematically correct and requires no assumption about input magnitude.",
      ],
      explanationBlanks: [
        {
          line: "I'm tracking the ___ price seen so far as I scan left to right. At every new price, I ask: if I had bought at the cheapest point so far and sold today, what's my profit? That's the greedy insight — I always want to buy as cheap as possible before the current day.",
          answer: "minimum",
        },
        {
          line: "I update ___ at each step with price - min_price. I never need to look back because any optimal buy must be to the left of the sell, and I've already tracked the best buy to the left.",
          answer: "max_profit",
        },
        {
          line: "This is O(n) time and ___ space — one pass, two variables.",
          answer: "O(1)",
        },
        {
          line: "Syntax — why ___: I initialize min_price to float('inf') rather than a large number like 10**9. float('inf') is always larger than any real number, so the first price will always beat it and become the initial minimum. A hardcoded large number is fragile — if prices can exceed it, the logic breaks. inf is mathematically correct and requires no assumption about input magnitude.",
          answer: "float('inf')",
        },
      ],
      testCase: {
        input: "prices = [7, 1, 5, 3, 6, 4]",
        expected: "5",
        trace: [
          "price=7: min_price=7, max_profit=0",
          "price=1: min_price=1, max_profit=0",
          "price=5: min_price=1, max_profit=4",
          "price=3: min_price=1, max_profit=4",
          "price=6: min_price=1, max_profit=5",
          "price=4: min_price=1, max_profit=5",
        ],
        traceExplanations: [
          "7 is the first price, so it's our cheapest so far. Selling immediately yields 0 profit.",
          "1 is cheaper than 7, so we update min_price. We wouldn't sell here — profit would be 0.",
          "5 - 1 = 4. If we had bought at 1 and sell today, profit is 4. Update max_profit.",
          "3 - 1 = 2, which is less than current max_profit of 4. No update needed.",
          "6 - 1 = 5. New best profit found — buy at 1, sell at 6.",
          "4 - 1 = 3. Less than 5, so max_profit stays at 5. Final answer is 5.",
        ],
      },
      blanks: [
        {
          line: "min_price = ___",
          answer: "float('inf')",
        },
        {
          line: "min_price = ___(min_price, price)",
          answer: "min",
        },
        {
          line: "max_profit = ___(max_profit, price - min_price)",
          answer: "max",
        },
      ],
    },
    {
      id: "gas-station",
      title: "Gas Station",
      difficulty: "medium",
      prompt:
        "There are n gas stations along a circular route. You are given two integer arrays gas and cost where gas[i] is the amount of gas at station i and cost[i] is the cost to travel from station i to its next station. Return the starting station index if you can travel the circuit once in the clockwise direction, otherwise return -1.",
      patternKeywords: ["circular route", "starting point", "total gas", "feasibility"],
      solution: `total_tank = 0
curr_tank = 0
start = 0
for i in range(len(gas)):
    diff = gas[i] - cost[i]
    total_tank += diff
    curr_tank += diff
    if curr_tank < 0:
        start = i + 1
        curr_tank = 0
return start if total_tank >= 0 else -1`,
      solutionExplanation: [
        "First the feasibility check: if total gas across all stations is less than total cost, it's impossible to complete the circuit regardless of starting point. I track total_tank for this check at the end.",
        "If a solution exists, I find it greedily. I maintain curr_tank as I scan. If curr_tank goes negative after station i, then stations 0 through i are all invalid starting points — any path through them would drain the tank before reaching i+1. So I reset and try starting from i+1.",
        "The greedy guarantee: if total_tank >= 0, exactly one valid start exists. By process of elimination, the last candidate standing after all resets is the answer.",
        "Syntax — why range(len(gas)): I iterate by index rather than by value because I need the index i to update start = i + 1. Iterating over values with 'for diff in ...' would lose that. This is a general rule: when you need the position of the element, not just the element, use range(len(...)) or enumerate.",
      ],
      explanationBlanks: [
        {
          line: "First the ___ check: if total gas across all stations is less than total cost, it's impossible to complete the circuit regardless of starting point. I track total_tank for this check at the end.",
          answer: "feasibility",
        },
        {
          line: "If a solution exists, I find it greedily. I maintain curr_tank as I scan. If curr_tank goes negative after station i, then stations 0 through i are all invalid starting points — any path through them would ___ the tank before reaching i+1. So I reset and try starting from i+1.",
          answer: "drain",
        },
        {
          line: "The greedy guarantee: if total_tank >= 0, exactly ___ valid start exists. By process of elimination, the last candidate standing after all resets is the answer.",
          answer: "one",
        },
        {
          line: "Syntax — why range(len(gas)): I iterate by ___ rather than by value because I need the index i to update start = i + 1. Iterating over values with 'for diff in ...' would lose that. This is a general rule: when you need the position of the element, not just the element, use range(len(...)) or enumerate.",
          answer: "index",
        },
      ],
      testCase: {
        input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]",
        expected: "3",
        trace: [
          "i=0: diff=-2, total=-2, curr=-2 → reset start=1, curr=0",
          "i=1: diff=-2, total=-4, curr=-2 → reset start=2, curr=0",
          "i=2: diff=-2, total=-6, curr=-2 → reset start=3, curr=0",
          "i=3: diff=3, total=-3, curr=3",
          "i=4: diff=3, total=0, curr=6",
          "total_tank=0 >= 0 → return start=3",
        ],
        traceExplanations: [
          "Station 0 gives 1 gas but costs 3 to leave. We'd run out. Any journey starting here fails before reaching station 1, so station 0 is eliminated as a candidate.",
          "Same logic — starting at 1 also drains the tank. Station 1 is eliminated.",
          "Station 2 also can't sustain travel. All stations before 3 are greedy-eliminated.",
          "At station 3 we gain net +3. curr_tank is now positive — this is a viable starting candidate.",
          "Station 4 gives net +3 more. We complete the scan with curr_tank=6 > 0.",
          "total_tank=0 means total gas exactly equals total cost — a solution exists. The last valid start we settled on is index 3.",
        ],
      },
      blanks: [
        {
          line: "if curr_tank < 0:",
          answer: "if curr_tank < 0:",
        },
        {
          line: "    start = ___",
          answer: "i + 1",
        },
        {
          line: "return start if ___ >= 0 else -1",
          answer: "total_tank",
        },
      ],
    },
    {
      id: "jump-game",
      title: "Jump Game",
      difficulty: "medium",
      prompt:
        "You are given an integer array nums. You are initially positioned at the first index of the array. Each element in the array represents your maximum jump length at that position. Return true if you can reach the last index, or false otherwise.",
      patternKeywords: ["reach", "maximum jump", "reachable", "can you get there"],
      solution: `max_reach = 0
for i in range(len(nums)):
    if i > max_reach:
        return False
    max_reach = max(max_reach, i + nums[i])
return True`,
      solutionExplanation: [
        "I track max_reach: the furthest index reachable given all positions visited so far. The greedy idea is simple — at every position, I update the reachability frontier.",
        "If I ever encounter index i that is beyond max_reach, I'm stuck. I could not have gotten here legitimately. Return False immediately.",
        "If I finish the loop without getting stuck, every index was reachable, meaning the last index is reachable too. Return True.",
        "Syntax — why max(max_reach, i + nums[i]): I update max_reach with max() instead of a conditional assignment. Both are equivalent, but max() is more idiomatic for 'keep the best value seen so far'. It reads as the intent directly: 'max_reach is the maximum reachable index.'",
      ],
      explanationBlanks: [
        {
          line: "I track max_reach: the furthest index ___ given all positions visited so far. The greedy idea is simple — at every position, I update the reachability frontier.",
          answer: "reachable",
        },
        {
          line: "If I ever encounter index i that is beyond max_reach, I'm ___. I could not have gotten here legitimately. Return False immediately.",
          answer: "stuck",
        },
        {
          line: "If I finish the loop without getting stuck, every index was reachable, meaning the last index is reachable too. Return ___.",
          answer: "True",
        },
        {
          line: "Syntax — why max(max_reach, i + nums[i]): I update max_reach with ___ instead of a conditional assignment. Both are equivalent, but max() is more idiomatic for 'keep the best value seen so far'. It reads as the intent directly: 'max_reach is the maximum reachable index.'",
          answer: "max()",
        },
      ],
      testCase: {
        input: "nums = [2, 3, 1, 1, 4]",
        expected: "true",
        trace: [
          "i=0: 0<=0, max_reach=max(0,0+2)=2",
          "i=1: 1<=2, max_reach=max(2,1+3)=4",
          "i=2: 2<=4, max_reach=max(4,2+1)=4",
          "i=3: 3<=4, max_reach=max(4,3+1)=4",
          "i=4: 4<=4, max_reach=max(4,4+4)=8",
          "Loop completes → return True",
        ],
        traceExplanations: [
          "From index 0 with jump 2, we can reach up to index 2. max_reach is now 2.",
          "Index 1 is reachable (1 <= 2). From here with jump 3, we can reach up to index 4. max_reach extends to 4.",
          "Index 2 is reachable. Jump of 1 only gets us to index 3, less than current max_reach of 4. No change.",
          "Index 3 is reachable. Jump of 1 reaches index 4, which ties max_reach. No extension needed.",
          "Index 4 is reachable (4 <= 4). We're at the last index. Loop ends cleanly.",
          "We never hit a case where i > max_reach, so the whole array was traversable. Return True.",
        ],
      },
      blanks: [
        {
          line: "if i > ___:",
          answer: "max_reach",
        },
        {
          line: "    return ___",
          answer: "False",
        },
        {
          line: "max_reach = max(max_reach, ___ + ___[___])",
          answer: "i + nums[i]",
        },
      ],
    },
    {
      id: "jump-game-ii",
      title: "Jump Game II",
      difficulty: "medium",
      prompt:
        "You are given a 0-indexed array of integers nums of length n. You are initially positioned at nums[0]. Each element nums[i] represents the maximum length of a forward jump from index i. Return the minimum number of jumps to reach nums[n - 1].",
      patternKeywords: ["minimum jumps", "fewest steps", "reach last index", "BFS levels"],
      solution: `jumps = 0
curr_end = 0
farthest = 0
for i in range(len(nums) - 1):
    farthest = max(farthest, i + nums[i])
    if i == curr_end:
        jumps += 1
        curr_end = farthest
return jumps`,
      solutionExplanation: [
        "I think of this as BFS layers. Each jump is one level. curr_end marks where the current BFS level ends — the farthest index reached by the previous jump.",
        "As I scan each index in the current level, I track farthest: the furthest index reachable from anywhere in this level. That farthest becomes the end of the next level.",
        "When I reach i == curr_end, I've exhausted the current level. I must take a jump. I increment jumps and extend curr_end to farthest. I stop the loop before the last index because I don't need to jump away from it.",
        "Syntax — why range(len(nums) - 1): I stop one index short of the last element intentionally. If I processed the last index, I might spuriously increment jumps when i == curr_end there — but we've already reached the destination so no jump is needed. The loop range encodes this constraint explicitly rather than adding an if-check inside the loop.",
      ],
      explanationBlanks: [
        {
          line: "I think of this as BFS layers. Each ___ is one level. curr_end marks where the current BFS level ends — the farthest index reached by the previous jump.",
          answer: "jump",
        },
        {
          line: "As I scan each index in the current level, I track farthest: the furthest index reachable from anywhere in this level. That farthest becomes the ___ of the next level.",
          answer: "end",
        },
        {
          line: "When I reach i == curr_end, I've exhausted the current level. I must take a ___. I increment jumps and extend curr_end to farthest. I stop the loop before the last index because I don't need to jump away from it.",
          answer: "jump",
        },
        {
          line: "Syntax — why range(len(nums) - 1): I stop one index short of the last element intentionally. If I processed the last index, I might spuriously ___ jumps when i == curr_end there — but we've already reached the destination so no jump is needed. The loop range encodes this constraint explicitly rather than adding an if-check inside the loop.",
          answer: "increment",
        },
      ],
      testCase: {
        input: "nums = [2, 3, 1, 1, 4]",
        expected: "2",
        trace: [
          "i=0: farthest=max(0,0+2)=2. i==curr_end(0) → jumps=1, curr_end=2",
          "i=1: farthest=max(2,1+3)=4",
          "i=2: farthest=max(4,2+1)=4. i==curr_end(2) → jumps=2, curr_end=4",
          "i=3: farthest=max(4,3+1)=4",
          "Loop ends (stop before index 4). Return jumps=2",
        ],
        traceExplanations: [
          "Level 0 is just index 0. From it we can reach up to index 2. We've finished level 0 so we take jump 1 and advance curr_end to 2.",
          "Now in level 1 (indices 1–2). Index 1 can reach up to index 4. farthest updates to 4.",
          "Index 2 can reach up to index 3, less than farthest=4. We've hit the end of level 1 (i==curr_end==2). Take jump 2, curr_end becomes 4.",
          "Index 3 is the last index we process in the loop. It can reach index 4 but no farther. Loop exits.",
          "Two jumps were needed: jump 1 brought us to somewhere in [1,2], jump 2 reaches index 4.",
        ],
      },
      blanks: [
        {
          line: "farthest = max(farthest, ___ + ___[___])",
          answer: "i + nums[i]",
        },
        {
          line: "if i == ___:",
          answer: "curr_end",
        },
        {
          line: "    curr_end = ___",
          answer: "farthest",
        },
      ],
    },
    {
      id: "partition-labels",
      title: "Partition Labels",
      difficulty: "medium",
      prompt:
        "You are given a string s. We want to partition the string into as many parts as possible so that each letter appears in at most one part. Return a list of integers representing the size of these parts.",
      patternKeywords: ["partition", "each letter once", "non-overlapping", "last occurrence"],
      solution: `last = {c: i for i, c in enumerate(s)}
result = []
start = 0
end = 0
for i, c in enumerate(s):
    end = max(end, last[c])
    if i == end:
        result.append(end - start + 1)
        start = i + 1
return result`,
      solutionExplanation: [
        "First I build a map of each character's last occurrence. This tells me: if I include character c in a partition, that partition must extend at least to last[c] to keep all occurrences of c together.",
        "I scan left to right, greedily extending the current partition's boundary to max(end, last[c]) for each character. If any character in my current window appears later, the window must grow to include it.",
        "When i == end, no character in this window escapes beyond it. The partition is sealed. I record its size and start fresh from i+1.",
        "Syntax — why {c: i for i, c in enumerate(s)}: This dict comprehension builds the last-occurrence map in one line. Because enumerate produces (index, char) pairs in order, later indices overwrite earlier ones for repeated characters — so the final dict naturally stores the last occurrence of each character. No explicit 'if char not already stored' check needed; the overwrite behavior does it for free.",
      ],
      explanationBlanks: [
        {
          line: "First I build a map of each character's last ___. This tells me: if I include character c in a partition, that partition must extend at least to last[c] to keep all occurrences of c together.",
          answer: "occurrence",
        },
        {
          line: "I scan left to right, greedily extending the current partition's ___ to max(end, last[c]) for each character. If any character in my current window appears later, the window must grow to include it.",
          answer: "boundary",
        },
        {
          line: "When i == end, no character in this window escapes beyond it. The partition is ___. I record its size and start fresh from i+1.",
          answer: "sealed",
        },
        {
          line: "Syntax — why {c: i for i, c in enumerate(s)}: This dict comprehension builds the last-occurrence map in one line. Because enumerate produces (index, char) pairs in order, later indices ___ earlier ones for repeated characters — so the final dict naturally stores the last occurrence of each character. No explicit 'if char not already stored' check needed; the overwrite behavior does it for free.",
          answer: "overwrite",
        },
      ],
      testCase: {
        input: 's = "ababcbacadefegdehijhklij"',
        expected: "[9, 7, 8]",
        trace: [
          "last = {a:8, b:5, c:7, d:14, e:15, f:11, g:13, h:19, i:22, j:23, k:20, l:21}",
          "i=0 c=a: end=max(0,8)=8",
          "i=1 c=b: end=max(8,5)=8",
          "i=4 c=c: end=max(8,7)=8",
          "i=8 c=a: end=max(8,8)=8. i==end → append 8-0+1=9, start=9",
          "i=9..15: extend through d,e → end=15. i==15 → append 15-9+1=7, start=16",
          "i=16..23: extend through h,i,j,k,l → end=23. i==23 → append 23-16+1=8",
        ],
        traceExplanations: [
          "We precompute last occurrences so we know the minimum window each character forces us to include.",
          "The first character 'a' last appears at index 8, so our partition must reach at least index 8.",
          "'b' last appears at 5, which is already within the window ending at 8. No extension needed.",
          "'c' last appears at 7, still inside the window. Boundary stays at 8.",
          "We've reached index 8 which equals end. No character in this window appears beyond it. First partition is complete, size 9.",
          "Second partition: 'd' forces end to 14, 'e' extends it to 15. When i reaches 15, the partition closes at size 7.",
          "Third partition: characters h through l all have last occurrences within indices 16–23. Closes at size 8.",
        ],
      },
      blanks: [
        {
          line: "last = {c: i for i, c in enumerate(___))",
          answer: "s",
        },
        {
          line: "end = max(end, last[___])",
          answer: "c",
        },
        {
          line: "if i == ___:",
          answer: "end",
        },
      ],
    },
  ],
}
