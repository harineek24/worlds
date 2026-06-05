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
        "The key reframe: instead of searching an array, I'm searching the answer space. The question becomes: what is the minimum speed k where I can finish in h hours?",
        "The search space is 1 to max(piles). Speed 1 is the slowest possible. Speed max(piles) guarantees finishing every pile in one hour — so that's the upper bound.",
        "The feasibility check: given speed k, how many hours does it take? For each pile, I need ceil(pile / k) hours. If the total is <= h, k is fast enough.",
        "I want the *minimum* feasible k, so when hours <= h (feasible), I keep mid as a candidate and try smaller — right = mid. When infeasible, I discard everything up to and including mid — left = mid + 1.",
        "I use left < right (not <=) because I'm searching for a boundary, not a specific value. When left == right, they've converged on the minimum feasible speed.",
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
        "The core insight: even in a rotated array, at least one of the two halves around mid is always sorted. I use this to determine which half to search.",
        "I check if the left half [left..mid] is sorted by comparing nums[left] <= nums[mid]. If true, the left half has no rotation — it's a clean ascending sequence.",
        "If the left half is sorted and target falls within its range [nums[left], nums[mid]), I go left. Otherwise target must be in the right half — go right.",
        "If the left half is not sorted, the right half [mid..right] must be sorted (the rotation pivot is in the left half). I apply the same logic: if target falls within the right half's range, go right; otherwise go left.",
        "The tradeoff: I'm doing two comparisons per iteration instead of one. But it's still O(log n) because I halve the search space each time.",
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
        "This is a 'minimize the maximum' problem — a classic signal for binary search on the answer space. The answer (the minimized largest subarray sum) must lie between max(nums) (every number in its own subarray isn't possible here, but the largest single element is the floor) and sum(nums) (putting everything in one subarray).",
        "The feasibility check: given a maximum allowed subarray sum of mid, can I split nums into at most k subarrays? I greedily build subarrays: keep adding elements until adding the next element would exceed mid, then start a new subarray. Count how many subarrays I needed.",
        "If the greedy count is <= k, then mid is feasible as the max sum — I can achieve a split within k parts. I try smaller: right = mid.",
        "If the count exceeds k, mid is too small a limit — I'm forced to create too many subarrays. I raise the limit: left = mid + 1.",
        "The greedy is correct because starting a new subarray as late as possible (greedily filling each one) minimizes the number of subarrays needed for a given limit. If even the greedy approach needs more than k splits, no arrangement can do it.",
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
        "I binary search on the *value* space, not the index space. The answer must be between matrix[0][0] (minimum) and matrix[n-1][n-1] (maximum).",
        "The feasibility question: how many elements in the matrix are <= mid? If that count is >= k, then the kth smallest is <= mid, so I try smaller. If count < k, the kth smallest is > mid, so I try larger.",
        "The count step exploits the sorted-rows-and-columns property. I start at the bottom-left corner. If matrix[row][col] <= mid, then every element above in that column is also <= mid (column is sorted ascending downward) — that's row+1 elements. I move right to the next column. If matrix[row][col] > mid, I move up.",
        "This counting walk is O(n) — it traverses at most 2n steps (n columns right, n rows up). Combined with O(log(max-min)) binary search iterations, total complexity is O(n log(max-min)).",
        "The invariant: when left == right, it's guaranteed to be a value that actually exists in the matrix. This is because we always set right = mid (not mid-1), and the convergence point is the smallest value whose count is >= k.",
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
        "Classic 'minimize the capacity' problem — binary search on the answer. The minimum capacity must be at least max(weights) (every package must fit), and at most sum(weights) (ship everything in one day).",
        "The feasibility check: given ship capacity mid, how many days do I need? I greedily load packages in order. If adding the next package would exceed capacity, I start a new day. Count how many days I need.",
        "The greedy loading is optimal: filling each day as much as possible minimizes the number of days needed. If even this greedy approach needs more than the allowed days, no other loading order can do better (order is fixed anyway — we must ship in sequence).",
        "If needed <= days (feasible), I try smaller capacity: right = mid. If needed > days, the capacity is too tight: left = mid + 1.",
        "This is structurally identical to Koko Eating Bananas — both are 'minimum feasible value' problems with a greedy feasibility check. Recognizing the pattern is the skill; the implementation follows mechanically.",
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
