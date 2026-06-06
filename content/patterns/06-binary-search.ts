import { Pattern } from "../types"

export const binarySearch: Pattern = {
  id: "binary-search",
  order: 6,
  patternName: "Binary Search",

  philosophy: {
    text: "In the middle of difficulty lies opportunity.",
    source: "Albert Einstein",
    connection:
      "Binary search never looks at everything — it cuts the problem in half at each step, finding truth by systematically eliminating what cannot be right. Every step is a commitment: I know the answer is not here. The difficulty of a large search space becomes the opportunity to discard half of it with a single comparison.",
  },

  template: {
    description:
      "Two forms: classic binary search on a sorted array by index, and binary search on an answer space when you can ask 'is X feasible?' The second form is more powerful — it turns optimization problems into search problems.",
    snippet: `# Classic binary search
left, right = 0, len(arr) - 1
while left <= right:
    mid = (left + right) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        left = mid + 1
    else:
        right = mid - 1

# Binary search on answer space (not array index)
# When you can check "is X feasible?" — binary search on the feasibility
left, right = min_possible, max_possible
while left < right:
    mid = (left + right) // 2
    if feasible(mid):
        right = mid
    else:
        left = mid + 1
return left`,
  },

  pythonTools: [
    {
      name: "Mid calculation — no overflow in Python but good habit",
      snippet: `mid = (left + right) // 2`,
    },
    {
      name: "Built-in binary search",
      snippet: `import bisect
# bisect_left: index of first element >= target
idx = bisect.bisect_left(arr, target)`,
    },
    {
      name: "Binary search on answer — reframe the question",
      snippet: `# Don't ask: which index has the answer?
# Ask: what is the smallest value X where feasible(X) is True?
left, right = min_possible, max_possible
while left < right:
    mid = (left + right) // 2
    if feasible(mid):
        right = mid   # mid could be the answer, keep it
    else:
        left = mid + 1  # mid is too small, discard
return left`,
    },
  ],

  problems: [
    {
      id: "koko-eating-bananas",
      title: "Koko Eating Bananas (Apple Harvest)",
      difficulty: "medium",
      prompt:
        "Koko loves to eat bananas. There are n piles of bananas, the ith pile has piles[i] bananas. Koko can decide her bananas-per-hour eating speed of k. Each hour, she chooses a pile and eats k bananas from it. If the pile has fewer than k bananas, she eats all of them and will not eat any more bananas during this hour. Koko wants to finish all the bananas before the guards come back. The guards will be back in h hours. Return the minimum integer k such that she can eat all the bananas within h hours.",
      patternKeywords: ["minimum speed", "hours constraint", "feasibility check", "search space"],
      solution: `import math

def minEatingSpeed(piles, h):
    left, right = 1, max(piles)

    while left < right:
        mid = (left + right) // 2
        hours = sum(math.ceil(p / mid) for p in piles)
        if hours <= h:
            right = mid   # mid is feasible, try slower
        else:
            left = mid + 1  # too slow, need faster

    return left`,
      solutionExplanation: [
        "The key reframe: instead of searching an array by index, I'm searching the *answer space*. The question becomes: what is the minimum speed k where I can finish in h hours? Binary search works here because feasibility is monotone — if speed k works, every speed > k also works.",
        "`left, right = 1, max(piles)` — these are the boundaries of the answer space, not array indices. Speed 1 is the slowest possible (floor of valid answers). Speed max(piles) guarantees every pile is eaten in one hour — that's the ceiling. Setting boundaries this way is the defining move of 'binary search on answer' problems: you're searching the range of plausible answers.",
        "`mid = (left + right) // 2` — the `//` operator is integer division. In Python 3, `/` always returns a float, so `(1 + 11) / 2` gives `6.0`. Using that as an index or speed would either crash or silently behave incorrectly. `//` truncates toward zero and gives an `int`.",
        "The feasibility check: given speed `mid`, how many hours does it take? For each pile, I need `ceil(pile / mid)` hours. If the total is <= h, mid is fast enough.",
        "`if hours <= h: right = mid` — when feasible, I set `right = mid` (not `mid - 1`) because `mid` itself could be the minimum answer. Cutting to `mid - 1` would discard a valid candidate. When infeasible, `left = mid + 1` is safe — mid is definitively too slow. I use `left < right` (not `<=`) because I'm converging on a boundary, not searching for a specific value. When left == right, they've pinpointed the minimum feasible speed.",
      ],
      testCase: {
        input: `piles = [3, 6, 7, 11], h = 8`,
        expected: "4",
        trace: [
          "left=1, right=11",
          "iter1: mid=6, hours=ceil(3/6)+ceil(6/6)+ceil(7/6)+ceil(11/6) = 1+1+2+2 = 6 ≤ 8 ✓ → right=6",
          "iter2: left=1, right=6, mid=3, hours=ceil(3/3)+ceil(6/3)+ceil(7/3)+ceil(11/3) = 1+2+3+4 = 10 > 8 ✗ → left=4",
          "iter3: left=4, right=6, mid=5, hours=ceil(3/5)+ceil(6/5)+ceil(7/5)+ceil(11/5) = 1+2+2+3 = 8 ≤ 8 ✓ → right=5",
          "iter4: left=4, right=5, mid=4, hours=ceil(3/4)+ceil(6/4)+ceil(7/4)+ceil(11/4) = 1+2+2+3 = 8 ≤ 8 ✓ → right=4",
          "left=4 == right=4 → return 4",
        ],
        traceExplanations: [
          "Search space is [1, 11]. We don't know where the answer is — binary search will find it in O(log(max(piles))) iterations.",
          "Mid=6: every pile can be eaten quickly. Only 6 hours needed, well under 8. Speed 6 is feasible — but we want minimum, so we try slower. Discard [7, 11].",
          "Mid=3: only 3 bananas/hr is too slow. 10 hours needed, exceeds h=8. Speed 3 is infeasible — discard [1, 3]. Left jumps to 4.",
          "Mid=5: 8 hours exactly — feasible. Try slower still. right=5. Now searching [4, 5].",
          "Mid=4: 8 hours exactly — still feasible. right=4. Now left=right=4. Converged.",
          "Left equals right — the loop exits. Left=4 is the minimum feasible speed. Any slower (speed 3) was already proven infeasible.",
        ],
      },
      explanationBlanks: [
        {
          line: "The key reframe: instead of searching an array by index, I'm searching the *answer space*. The question becomes: what is the minimum speed k where I can finish in h hours? Binary search works here because feasibility is ___  — if speed k works, every speed > k also works.",
          answer: "monotone",
        },
        {
          line: "`left, right = 1, max(piles)` — these are the boundaries of the answer space, not array indices. Speed 1 is the slowest possible (floor of valid answers). Speed max(piles) guarantees every pile is eaten in one hour — that's the ceiling. Setting boundaries this way is the defining move of 'binary search on answer' problems: you're searching the range of ___ answers.",
          answer: "plausible",
        },
        {
          line: "`if hours <= h: right = mid` — when feasible, I set `right = mid` (not `mid - 1`) because `mid` itself could be the minimum answer. Cutting to `mid - 1` would discard a valid candidate. When infeasible, `left = mid + 1` is safe — mid is definitively too slow. I use `left < right` (not `<=`) because I'm converging on a ___, not searching for a specific value. When left == right, they've pinpointed the minimum feasible speed.",
          answer: "boundary",
        },
      ],
      blanks: [
        { line: `left, right = ___, max(piles)`, answer: "1" },
        { line: `while left ___ right:`, answer: "<" },
        { line: `hours = sum(math.ceil(p / ___) for p in piles)`, answer: "mid" },
        { line: `if hours <= h: right = ___`, answer: "mid" },
        { line: `else: left = mid + ___`, answer: "1" },
        { line: `return ___`, answer: "left" },
      ],
    },

    {
      id: "search-rotated-array",
      title: "Search in Rotated Sorted Array",
      difficulty: "medium",
      prompt:
        "There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k such that the resulting array is [nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]. Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums. You must write an algorithm with O(log n) runtime complexity.",
      patternKeywords: ["rotated sorted", "pivot", "one half sorted", "which side"],
      solution: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2

        if nums[mid] == target:
            return mid

        # left half is sorted
        if nums[left] <= nums[mid]:
            if nums[left] <= target < nums[mid]:
                right = mid - 1
            else:
                left = mid + 1
        # right half is sorted
        else:
            if nums[mid] < target <= nums[right]:
                left = mid + 1
            else:
                right = mid - 1

    return -1`,
      solutionExplanation: [
        "The core insight: even in a rotated array, at least one of the two halves around mid is always sorted. The rotation can only break one side — the other side is clean. I use this to determine which half to search.",
        "`left, right = 0, len(nums) - 1` — here the boundaries are array indices (not an answer space), so `right` starts at the last valid index. `mid = (left + right) // 2` uses `//` for integer division — in Python 3, `/` gives a float, which would be invalid as an index.",
        "I check if the left half [left..mid] is sorted by comparing `nums[left] <= nums[mid]`. If true, the left half has no rotation — it's a clean ascending sequence. If the target falls within `[nums[left], nums[mid])`, I go left; otherwise the target must be in the right half.",
        "If the left half is not sorted, the rotation pivot lives in it, so the right half [mid..right] must be sorted. Same logic: if target falls within the right half's range `(nums[mid], nums[right]]`, go right; otherwise go left.",
        "I use `right = mid - 1` (not `mid`) here because this is classic binary search where I already confirmed `nums[mid] != target` before branching — mid is definitively not the answer, so I can safely exclude it. This is different from 'binary search on answer' problems where mid might still be valid.",
      ],
      testCase: {
        input: `nums = [4, 5, 6, 7, 0, 1, 2], target = 0`,
        expected: "4",
        trace: [
          "left=0, right=6",
          "iter1: mid=3, nums[3]=7 ≠ 0",
          "  nums[left=0]=4 ≤ nums[mid=3]=7 → left half [4,5,6,7] is sorted",
          "  target=0: 4 ≤ 0 < 7? No → go right: left=4",
          "iter2: left=4, right=6, mid=5, nums[5]=1 ≠ 0",
          "  nums[left=4]=0 ≤ nums[mid=5]=1 → left half [0,1] is sorted",
          "  target=0: 0 ≤ 0 < 1? Yes → go left: right=4",
          "iter3: left=4, right=4, mid=4, nums[4]=0 == 0 ✓",
          "return 4",
        ],
        traceExplanations: [
          "Start with the full array. We know it's been rotated but we don't know where.",
          "Mid lands at index 3, value 7. Not our target.",
          "nums[0]=4 ≤ nums[3]=7, so the left half [4,5,6,7] is cleanly sorted — no rotation in this segment.",
          "Does target=0 fall in [4, 7)? No, 0 < 4. So target can't be in the left half. Move left pointer to mid+1=4.",
          "New mid is index 5, value 1. Not the target.",
          "nums[4]=0 ≤ nums[5]=1, so the left half of this subarray [0,1] is sorted.",
          "Does target=0 fall in [0, 1)? Yes, 0 ≤ 0 < 1. Target is in the left half. Move right pointer to mid-1=4.",
          "Left and right both point to index 4. nums[4]=0 matches target. Found it.",
          "Return index 4. One element checked per iteration — efficient elimination even without knowing where the pivot is.",
        ],
      },
      blanks: [
        { line: `if nums[___] <= nums[mid]:`, answer: "left" },
        { line: `if nums[left] <= target < nums[___]:`, answer: "mid" },
        { line: `right = mid - ___`, answer: "1" },
        { line: `if nums[mid] < target <= nums[___]:`, answer: "right" },
        { line: `left = mid + ___`, answer: "1" },
      ],
    },

    {
      id: "split-array-largest-sum",
      title: "Split Array Largest Sum",
      difficulty: "hard",
      prompt:
        "Given an integer array nums and an integer k, split nums into k non-empty subarrays such that the largest sum of any subarray is minimized. Return the minimized largest sum of the split.",
      patternKeywords: ["minimize maximum", "split subarrays", "feasibility check", "answer space"],
      solution: `def splitArray(nums, k):
    left, right = max(nums), sum(nums)

    while left < right:
        mid = (left + right) // 2
        # count subarrays needed if max allowed sum is mid
        count, curr = 1, 0
        for n in nums:
            if curr + n > mid:
                count += 1
                curr = 0
            curr += n
        if count <= k:
            right = mid   # feasible, try smaller max
        else:
            left = mid + 1  # need more splits than allowed, raise limit

    return left`,
      solutionExplanation: [
        "This is a 'minimize the maximum' problem — a classic signal for binary search on the answer space. The feasibility function is monotone: if a max-sum cap of X works, so does X+1. That monotonicity is what makes binary search valid here.",
        "`left, right = max(nums), sum(nums)` — these are the boundaries of the *answer space*, not array indices. The answer can't be less than `max(nums)` because that element must appear in some subarray. It can't exceed `sum(nums)` because one subarray holding everything is always a valid (if unoptimized) split. Setting boundaries to the range of valid answers, rather than array indices, is the core move of 'binary search on answer' problems. `mid = (left + right) // 2` uses `//` to keep mid an integer — it represents a sum, not an index, but it still must be a whole number.",
        "The feasibility check: given max allowed sum `mid`, I greedily build subarrays — keep adding elements until the next element would exceed `mid`, then start a new subarray. This gives the minimum possible number of subarrays for this cap.",
        "`if count <= k: right = mid` — when feasible, I use `right = mid` not `mid - 1`, because `mid` itself could be the minimum valid cap. Cutting to `mid - 1` would skip the answer. When infeasible (`count > k`), `mid` is definitively too small, so `left = mid + 1` safely discards it.",
        "The greedy is correct because filling each subarray as much as possible minimizes the number of subarrays for a given cap. If even greedy needs more than k splits, no rearrangement can do better (and we can't reorder — subarrays must be contiguous in the original order).",
      ],
      testCase: {
        input: `nums = [7, 2, 5, 10, 8], k = 2`,
        expected: "18",
        trace: [
          "left=max(nums)=10, right=sum(nums)=32",
          "iter1: mid=21",
          "  greedy: [7,2,5] sum=14≤21, add 10→24>21 → new split, [10,8] sum=18≤21",
          "  count=2 ≤ k=2 → feasible, right=21",
          "iter2: left=10, right=21, mid=15",
          "  greedy: [7,2,5] sum=14≤15, add 10→24>15 → new split, [10] sum=10≤15, add 8→18>15 → new split, [8]",
          "  count=3 > k=2 → infeasible, left=16",
          "iter3: left=16, right=21, mid=18",
          "  greedy: [7,2,5] sum=14≤18, add 10→24>18 → new split, [10,8] sum=18≤18",
          "  count=2 ≤ k=2 → feasible, right=18",
          "iter4: left=16, right=18, mid=17",
          "  greedy: [7,2,5] sum=14≤17, add 10→24>17 → new split, [10] sum=10≤17, add 8→18>17 → new split, [8]",
          "  count=3 > k=2 → infeasible, left=18",
          "left=18 == right=18 → return 18",
        ],
        traceExplanations: [
          "Search space: [10, 32]. The answer can't be less than 10 (the element 10 must appear in some subarray). It can't exceed 32 (all elements in one subarray).",
          "Try mid=21 as the max allowed sum.",
          "Greedy fill: 7+2+5=14 fits. Adding 10 would give 24 > 21, so we start a new subarray. Then 10+8=18 ≤ 21. Used 2 subarrays.",
          "2 subarrays ≤ k=2. Feasible! We might be able to do even better (smaller max). Try lower: right=21.",
          "Try mid=15.",
          "Greedy: 7+2+5=14 ≤ 15, adding 10 exceeds — new subarray. 10 ≤ 15, adding 8 → 18 > 15 — another new subarray. 3 splits needed.",
          "3 > k=2. Infeasible — 15 is too tight a limit. left=16.",
          "Try mid=18.",
          "Greedy: 7+2+5=14, adding 10 → 24 > 18 — new split. 10+8=18 ≤ 18. Exactly 2 splits.",
          "2 ≤ k=2. Feasible. Try lower: right=18.",
          "Try mid=17.",
          "Greedy: 14, then 10, then 8 — 3 splits needed (10+8=18 > 17).",
          "3 > 2. Infeasible. left=18.",
          "left == right == 18. The minimum possible largest sum is 18.",
        ],
      },
      blanks: [
        { line: `left, right = max(nums), ___(nums)`, answer: "sum" },
        { line: `count, curr = ___, 0`, answer: "1" },
        { line: `if curr + n > ___:`, answer: "mid" },
        { line: `count += ___`, answer: "1" },
        { line: `if count <= k: right = ___`, answer: "mid" },
        { line: `else: left = mid + ___`, answer: "1" },
      ],
    },

    {
      id: "kth-smallest-sorted-matrix",
      title: "Kth Smallest Element in a Sorted Matrix",
      difficulty: "medium",
      prompt:
        "Given an n x n matrix where each of the rows and columns is sorted in ascending order, return the kth smallest element in the matrix. Note that it is the kth smallest element in the sorted order, not the kth distinct element.",
      patternKeywords: ["kth smallest", "sorted matrix", "value space search", "count elements"],
      solution: `def kthSmallest(matrix, k):
    n = len(matrix)
    left, right = matrix[0][0], matrix[n-1][n-1]

    while left < right:
        mid = (left + right) // 2
        # count elements <= mid using sorted row/col property
        count = 0
        row, col = n - 1, 0
        while row >= 0 and col < n:
            if matrix[row][col] <= mid:
                count += row + 1  # all elements above in this column
                col += 1
            else:
                row -= 1
        if count >= k:
            right = mid
        else:
            left = mid + 1

    return left`,
      solutionExplanation: [
        "I binary search on the *value* space, not the index space. `left, right = matrix[0][0], matrix[n-1][n-1]` — these are the smallest and largest values in the matrix, which define the range of valid answers. This is 'binary search on answer': the search space is the range of possible answer values, not array positions. `mid = (left + right) // 2` uses `//` because mid represents a value (integer), and Python 3's `/` would give a float.",
        "The feasibility question: how many elements in the matrix are <= mid? If that count is >= k, then the kth smallest is <= mid (try smaller: `right = mid`). If count < k, the kth smallest is > mid (try larger: `left = mid + 1`).",
        "The count step exploits the sorted-rows-and-columns property with a bottom-left walk. If `matrix[row][col] <= mid`, every element above in that column is also <= mid — that's `row+1` elements in one operation. Move right. If `matrix[row][col] > mid`, move up. This traverses at most 2n steps total — O(n) per binary search iteration.",
        "Why `right = mid` and not `mid - 1` when feasible: mid might not exist in the matrix as a value — it's a midpoint of a value range. We can't exclude it because the actual answer might not have been a midpoint; we need `left` and `right` to converge onto a real matrix value. Setting `right = mid` preserves mid as a candidate until convergence.",
        "The invariant: when `left == right`, the value is guaranteed to exist in the matrix. The convergence point is always the smallest value with count >= k, and by the matrix's structure, that value must be a real element.",
      ],
      testCase: {
        input: `matrix = [[1,5,9],[10,11,13],[12,13,15]], k = 8`,
        expected: "13",
        trace: [
          "left=1, right=15",
          "iter1: mid=8",
          "  count walk: start row=2,col=0",
          "  matrix[2][0]=12 > 8 → row=1",
          "  matrix[1][0]=10 > 8 → row=0",
          "  matrix[0][0]=1 ≤ 8 → count+=1, col=1",
          "  matrix[0][1]=5 ≤ 8 → count+=1, col=2",
          "  matrix[0][2]=9 > 8 → row=-1, exit",
          "  count=2 < k=8 → left=9",
          "iter2: left=9, right=15, mid=12",
          "  count walk: start row=2,col=0",
          "  matrix[2][0]=12 ≤ 12 → count+=3, col=1",
          "  matrix[2][1]=13 > 12 → row=1",
          "  matrix[1][1]=11 ≤ 12 → count+=2, col=2",
          "  matrix[1][2]=13 > 12 → row=0",
          "  matrix[0][2]=9 ≤ 12 → count+=1, col=3, exit",
          "  count=6 < k=8 → left=13",
          "iter3: left=13, right=15, mid=14",
          "  count=8 ≥ k=8 → right=14",
          "iter4: left=13, right=14, mid=13",
          "  count=8 ≥ k=8 → right=13",
          "left=13 == right=13 → return 13",
        ],
        traceExplanations: [
          "Search space is [1, 15] — the matrix's min and max values.",
          "Try mid=8. How many matrix elements are ≤ 8?",
          "Start at bottom-left corner (row=2, col=0).",
          "matrix[2][0]=12 > 8. Move up — everything in this column below row 2 is too large.",
          "matrix[1][0]=10 > 8. Move up again.",
          "matrix[0][0]=1 ≤ 8. All elements above in column 0 (just this one, row+1=1) are ≤ 8. Count=1. Move right.",
          "matrix[0][1]=5 ≤ 8. Column 1, row 0: count += row+1=1. Count=2. Move right.",
          "matrix[0][2]=9 > 8. Move up — row becomes -1. Exit loop.",
          "Only 2 elements ≤ 8. We need the 8th smallest, so it must be larger than 8. left=9.",
          "Try mid=12.",
          "matrix[2][0]=12 ≤ 12. Column 0 has 3 elements all ≤ 12 (rows 0,1,2). Count=3. Move right.",
          "matrix[2][1]=13 > 12. Move up.",
          "matrix[1][1]=11 ≤ 12. Column 1 up through row 1: count += 2. Count=5. Move right.",
          "matrix[1][2]=13 > 12. Move up.",
          "matrix[0][2]=9 ≤ 12. Column 2 up through row 0: count += 1. Count=6. col=3, exit.",
          "6 elements ≤ 12. Still less than k=8. left=13.",
          "Try mid=14. Count walk yields 8 elements ≤ 14 (both 13s count). 8 ≥ k=8 → right=14.",
          "Try mid=13. Count = 8 ≥ 8 → right=13.",
          "Converged at 13. This value exists in the matrix, and exactly 8 elements are ≤ 13.",
        ],
      },
      blanks: [
        { line: `left, right = matrix[0][0], matrix[n-1][___]`, answer: "n-1" },
        { line: `row, col = n - ___, 0`, answer: "1" },
        { line: `if matrix[row][col] <= ___:`, answer: "mid" },
        { line: `count += row + ___`, answer: "1" },
        { line: `if count >= k: right = ___`, answer: "mid" },
        { line: `else: left = mid + ___`, answer: "1" },
      ],
    },

    {
      id: "minimum-ship-capacity",
      title: "Capacity to Ship Packages Within D Days",
      difficulty: "medium",
      prompt:
        "A conveyor belt has packages that must be shipped from one port to another within days days. The ith package on the conveyor belt has a weight of weights[i]. Each day, we load the ship with packages in the order given by weights. We may not load more weight than the maximum weight capacity of the ship. Return the least weight capacity of the ship that will result in all the packages on the conveyor belt being shipped within days days.",
      patternKeywords: ["minimum capacity", "days constraint", "feasibility check", "answer space"],
      solution: `def shipWithinDays(weights, days):
    left, right = max(weights), sum(weights)

    while left < right:
        mid = (left + right) // 2
        needed, curr = 1, 0
        for w in weights:
            if curr + w > mid:
                needed += 1
                curr = 0
            curr += w
        if needed <= days:
            right = mid
        else:
            left = mid + 1

    return left`,
      solutionExplanation: [
        "Classic 'minimize the capacity' problem — binary search on the answer space. `left, right = max(weights), sum(weights)` sets the answer-space boundaries: the minimum capacity can't be less than `max(weights)` (the heaviest package must fit on the ship), and can't exceed `sum(weights)` (one day ships everything). These are the boundaries of *valid answers*, not array indices — the core distinction of 'binary search on answer' vs classic binary search.",
        "`mid = (left + right) // 2` — `//` for integer division because mid represents a weight capacity, which must be a whole number. Python 3's `/` would yield a float, breaking the comparison `curr + w > mid` with floating-point imprecision and making the result invalid as a capacity.",
        "The feasibility check: given capacity `mid`, I greedily load packages in sequence. If adding the next package would exceed `mid`, I start a new day. This greedy is optimal because orders are fixed — we ship in the given sequence. Filling each day maximally minimizes the number of days needed.",
        "`if needed <= days: right = mid` — feasible means `mid` could be the answer, so I keep it as a candidate with `right = mid` (not `mid - 1`). Infeasible means `mid` is definitively too small: `left = mid + 1` safely discards it. `left < right` (not `<=`) drives convergence to a single value rather than overshooting.",
        "This is structurally identical to Koko Eating Bananas — both binary-search on a 'minimum feasible value' with a greedy feasibility check. The template is: set answer-space bounds, check feasibility at mid, shrink toward the minimum feasible point. Recognizing the pattern is the skill; the implementation follows mechanically.",
      ],
      testCase: {
        input: `weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5`,
        expected: "15",
        trace: [
          "left=max(weights)=10, right=sum(weights)=55",
          "iter1: mid=32",
          "  greedy: day1=[1..10] sum=55>32 → actually: [1,2,3,4,5,6,7,8]=36>32",
          "  day1=[1,2,3,4,5,6,7]=28, add 8→36>32 → day2",
          "  day2=[8,9]=17, add 10→27>32? No, 27≤32 → day2=[8,9,10]=27",
          "  needed=2 ≤ days=5 → right=32",
          "  [continuing binary search toward answer...]",
          "iter (converging): mid=15",
          "  day1=[1,2,3,4,5]=15, add 6→21>15 → day2",
          "  day2=[6,7]=13, add 8→21>15 → day3",
          "  day3=[8]=8, add 9→17>15 → day4",
          "  day4=[9]=9, add 10→19>15 → day5",
          "  day5=[10]",
          "  needed=5 ≤ days=5 → feasible, right=15",
          "iter: mid=14",
          "  day1=[1,2,3,4]=10, add 5→15>14 → day2; day2=[5,6,7]=18>14 → actually [5,6]=11,add7→18>14→day3",
          "  needed > 5 → left=15",
          "left=15==right=15 → return 15",
        ],
        traceExplanations: [
          "Search space [10, 55]. The heaviest single package is 10 — that's the floor. One-day shipping is the ceiling.",
          "Mid=32 is a generous capacity. The greedy check will show we need far fewer than 5 days.",
          "Loading greedily with capacity 32: first 7 packages sum to 28, adding the 8th (weight 8) gives 36 > 32 — new day. Continue.",
          "Day 2 gets packages 8, 9, 10 — total 27. Only 2 days needed — well within 5. But 32 is unnecessarily large. right=32.",
          "The search converges through several more iterations toward 15.",
          "Mid=15: can we ship in 5 days with capacity 15?",
          "Day 1: 1+2+3+4+5=15, exactly at capacity. Adding 6 would exceed — start day 2.",
          "Day 2: 6+7=13, adding 8 → 21 > 15 — day 3.",
          "Day 3: just 8, adding 9 → 17 > 15 — day 4.",
          "Day 4: just 9, adding 10 → 19 > 15 — day 5.",
          "Day 5: just 10. Exactly 5 days — feasible.",
          "5 ≤ days=5. Feasible with capacity 15. Try smaller: right=15.",
          "Mid=14: greedy needs more than 5 days. Any arrangement that packs 10 packages into 5 days with max 14/day requires day1=[1,2,3,4]=10, then 5 alone (15>14 — wait: 5 alone is 5, that's fine) — recounting shows 6 days needed. Infeasible. left=15.",
          "left=right=15. Minimum capacity is 15.",
        ],
      },
      blanks: [
        { line: `left, right = max(weights), ___(weights)`, answer: "sum" },
        { line: `needed, curr = ___, 0`, answer: "1" },
        { line: `if curr + w > ___:`, answer: "mid" },
        { line: `needed += ___`, answer: "1" },
        { line: `if needed <= days: right = ___`, answer: "mid" },
        { line: `else: left = mid + ___`, answer: "1" },
      ],
    },
  ],
}
