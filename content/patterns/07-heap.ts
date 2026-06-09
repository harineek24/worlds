import { Pattern } from "../types"

export const heap: Pattern = {
  id: "heap",
  order: 7,
  patternName: "Heap (Priority Queue)",

  philosophy: {
    text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
    source: "Stephen Covey",
    connection:
      "The heap doesn't store things randomly — it always knows what matters most. Every insertion and removal preserves that structural order. Priority is baked in, not looked up. The moment you add something to a heap, the heap has already decided where it belongs relative to everything else.",
  },

  template: {
    description:
      "A heap answers one question in O(log n): what is the current min (or max)? Use it when you need to repeatedly extract the most important element, or when you're tracking the top-k of something as data streams in.",
    snippet: `import heapq

# Min heap (Python default)
heap = []
heapq.heappush(heap, val)
top = heap[0]         # peek
heapq.heappop(heap)   # remove min

# Max heap — negate values
heapq.heappush(heap, -val)
top = -heap[0]

# Heapify existing list
heapq.heapify(arr)  # O(n)

# K largest elements
heapq.nlargest(k, arr)  # O(n log k)`,
  },

  pythonTools: [
    {
      name: "heapq is min-heap by default — negate for max-heap",
      snippet: `heapq.heappush(heap, -val)   # push negated
top = -heap[0]               # un-negate to read`,
    },
    {
      name: "heapq.heappush with priority tuples",
      snippet: `heapq.heappush(heap, (priority, item))
priority, item = heapq.heappop(heap)`,
    },
    {
      name: "Keep heap size at k — sliding window of top-k",
      snippet: `heapq.heappush(heap, val)
if len(heap) > k:
    heapq.heappop(heap)  # evict the current minimum`,
    },
  ],

  problems: [
    {
      id: "kth-largest-element",
      title: "Kth Largest Element in an Array",
      difficulty: "medium",
      prompt:
        "Given an integer array nums and an integer k, return the kth largest element in the array. Note that it is the kth largest element in sorted order, not the kth distinct element. Can you solve it without sorting?",
      patternKeywords: ["kth largest", "top k", "stream", "rank"],
      solution: `import heapq

def findKthLargest(nums, k):
    heap = []
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)
    return heap[0]`,
      solutionExplanation: [
        "I maintain a min-heap of exactly k elements. The invariant is: at all times, the heap holds the k largest elements seen so far. `import heapq` is used rather than sorting because the heap maintains order incrementally — each push/pop is O(log k). Sorting the whole list after every insertion would be O(n log n) per step.",
        "For each new number I push it onto the heap. If the heap now has k+1 elements, one of them is too small to be in the top-k — and because it's a min-heap, the smallest is at the root. I pop it immediately. `heapq.heappush` and `heapq.heappop` are chosen over maintaining a sorted list because they preserve the heap invariant in O(log k) instead of O(k) for an insertion into a sorted list.",
        "After processing every number, the heap holds exactly the k largest elements. I read the answer with `heap[0]` — peeking, not popping. `heap[0]` gives the root in O(1) without removing it; `heappop` would destroy the heap structure and is unnecessary here. The root is the smallest of the k largest elements, which is the kth largest overall. Tradeoff vs. sorting: O(n log k) time instead of O(n log n), and O(k) space instead of O(n).",
      ],
      testCase: {
        input: "nums = [3, 2, 1, 5, 6, 4], k = 2",
        expected: "5",
        trace: [
          "push 3  → heap=[3]          len=1 ≤ 2, no eviction",
          "push 2  → heap=[2,3]        len=2 ≤ 2, no eviction",
          "push 1  → heap=[1,2,3]      len=3 > 2 → pop min(1) → heap=[2,3]",
          "push 5  → heap=[2,3,5]      len=3 > 2 → pop min(2) → heap=[3,5]",
          "push 6  → heap=[3,5,6]      len=3 > 2 → pop min(3) → heap=[5,6]",
          "push 4  → heap=[4,5,6]      len=3 > 2 → pop min(4) → heap=[5,6]",
          "heap[0] = 5  →  return 5",
        ],
        traceExplanations: [
          "Heap is under capacity — keep everything so far.",
          "Still under capacity — both elements are candidates for top-2.",
          "Overflow: 1 is the smallest of {1,2,3}, so it's clearly not in the top-2. Evicting it keeps the invariant.",
          "5 beats 2 for a top-2 spot. 2 is the weakest link — it gets evicted.",
          "6 pushes 3 out. The heap now holds the two largest seen so far: {5, 6}.",
          "4 enters but is weaker than both 5 and 6 — it gets immediately evicted. The top-2 is stable.",
          "heap[0] is the min of the top-2 set, which is the 2nd largest element overall.",
        ],
      },
      explanationBlanks: [
        {
          line: "I maintain a min-heap of exactly k elements. The invariant is: at all times, the heap holds the k largest elements seen so far. `import heapq` is used rather than sorting because the heap maintains order incrementally — each push/pop is O(log k). Sorting the whole list after every insertion would be O(n log n) per step.",
          answer: "k largest",
        },
        {
          line: "For each new number I push it onto the heap. If the heap now has k+1 elements, one of them is too small to be in the top-k — and because it's a min-heap, the smallest is at the root. I pop it immediately. `heapq.heappush` and `heapq.heappop` are chosen over maintaining a sorted list because they preserve the heap invariant in O(log k) instead of O(k) for an insertion into a sorted list.",
          answer: "min-heap",
        },
        {
          line: "After processing every number, the heap holds exactly the k largest elements. I read the answer with `heap[0]` — peeking, not popping. `heap[0]` gives the root in O(1) without removing it; `heappop` would destroy the heap structure and is unnecessary here. The root is the smallest of the k largest elements, which is the kth largest overall. Tradeoff vs. sorting: O(n log k) time instead of O(n log n), and O(k) space instead of O(n).",
          answer: "peeking, not popping",
        },
      ],
      blanks: [
        { line: `heapq.heappush(___, num)`, answer: "heap" },
        { line: `if len(heap) > ___:`, answer: "k" },
        { line: `heapq.heappop(___)`, answer: "heap" },
        { line: `return ___[0]`, answer: "heap" },
      ],
    },

    {
      id: "k-closest-points",
      title: "K Closest Points to Origin",
      difficulty: "medium",
      prompt:
        "Given an array of points where points[i] = [xi, yi], and an integer k, return the k closest points to the origin (0, 0). The distance is the Euclidean distance. You may return the answer in any order.",
      patternKeywords: ["k closest", "distance", "top k", "priority"],
      solution: `import heapq

def kClosest(points, k):
    heap = []
    for x, y in points:
        dist = x * x + y * y
        heapq.heappush(heap, (-dist, x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in heap]`,
      solutionExplanation: [
        "I want to keep the k smallest distances, but Python's `heapq` is a min-heap only — it always surfaces the smallest element. If I store distances as-is, `heappop` would evict the closest points, which is backwards for this problem.",
        "The fix: `heapq.heappush(heap, -dist, x, y)` — negate the distance before pushing. Python's `heapq` has no max-heap mode and no `key=` parameter, so negating values is the idiomatic way to turn a min-heap into a max-heap without writing a custom class. The root is now the farthest point among the k candidates.",
        "When the heap exceeds size k, I pop the root — the farthest point in the current set (most negative negated value = largest actual distance). This maintains the invariant: heap always holds the k closest points seen so far. I skip `sqrt()` because comparing x²+y² is equivalent to comparing Euclidean distances and avoids floating-point overhead. I read the result with `heap[0]` peeking implicitly via list comprehension — no destructive pop needed at the end.",
      ],
      testCase: {
        input: "points = [[1,3],[-2,2],[5,8],[0,1]], k = 2",
        expected: "[[-2,2],[0,1]]",
        trace: [
          "push [1,3]   dist=10  heap=[(-10,1,3)]         len=1 ≤ 2",
          "push [-2,2]  dist=8   heap=[(-10,1,3),(-8,-2,2)] len=2 ≤ 2",
          "push [5,8]   dist=89  heap=[...,(-89,5,8)]     len=3 > 2 → pop max-dist(-89,[5,8]) → heap=[(-10,1,3),(-8,-2,2)]",
          "push [0,1]   dist=1   heap=[...,(-1,0,1)]      len=3 > 2 → pop max-dist(-10,[1,3]) → heap=[(-8,-2,2),(-1,0,1)]",
          "result: [[-2,2],[0,1]]",
        ],
        traceExplanations: [
          "Only one point so far — it's trivially the closest.",
          "Two points, still under capacity. Both are current candidates.",
          "[5,8] has distance 89 — the largest so far. It immediately becomes the root (most negative = most distant). It's evicted right away since it can't be in the top-2 closest.",
          "[0,1] has distance 1 — very close. After pushing, [1,3] (dist=10) is now the farthest in the heap and gets evicted. The two closest points remain.",
          "Negation trick worked: we kept the two smallest distances without a sort.",
        ],
      },
      explanationBlanks: [
        {
          line: "I want to keep the k smallest distances, but Python's `heapq` is a min-heap only — it always surfaces the smallest element. If I store distances as-is, `heappop` would evict the closest points, which is backwards for this problem.",
          answer: "closest points",
        },
        {
          line: "The fix: `heapq.heappush(heap, -dist, x, y)` — negate the distance before pushing. Python's `heapq` has no max-heap mode and no `key=` parameter, so negating values is the idiomatic way to turn a min-heap into a max-heap without writing a custom class. The root is now the farthest point among the k candidates.",
          answer: "farthest point",
        },
        {
          line: "When the heap exceeds size k, I pop the root — the farthest point in the current set (most negative negated value = largest actual distance). This maintains the invariant: heap always holds the k closest points seen so far. I skip `sqrt()` because comparing x²+y² is equivalent to comparing Euclidean distances and avoids floating-point overhead. I read the result with `heap[0]` peeking implicitly via list comprehension — no destructive pop needed at the end.",
          answer: "k closest points seen so far",
        },
      ],
      blanks: [
        { line: `dist = x * x + ___`, answer: "y * y" },
        { line: `heapq.heappush(heap, (___, x, y))`, answer: "-dist" },
        { line: `if len(heap) > ___:`, answer: "k" },
        { line: `return [[x, y] for ___, x, y in heap]`, answer: "_" },
      ],
    },

    {
      id: "find-k-closest-elements",
      title: "Find K Closest Elements",
      difficulty: "medium",
      prompt:
        "Given a sorted integer array arr, two integers k and x, return the k closest integers to x in the array. The result should also be sorted in ascending order. If there is a tie, prefer the smaller elements.",
      patternKeywords: ["k closest", "sorted array", "binary search", "window"],
      solution: `import bisect

def findClosestElements(arr, k, x):
    lo, hi = 0, len(arr) - k
    while lo < hi:
        mid = (lo + hi) // 2
        if x - arr[mid] > arr[mid + k] - x:
            lo = mid + 1
        else:
            hi = mid
    return arr[lo:lo + k]`,
      solutionExplanation: [
        "I'm binary-searching for the left boundary of the best window of k elements. The search space is indices 0 through len(arr)-k — those are all valid starting positions for a window of width k. This problem uses `bisect` (binary search) rather than `heapq` because the array is already sorted — we can exploit that structure directly instead of building a heap.",
        "At each mid, I compare two distances: how far x is from the left edge of the window (arr[mid]) vs. how far x is from the element just beyond the right edge (arr[mid+k]). This tells me whether the window should slide right or stay. The `//` integer division for `mid` is deliberate — it avoids floating-point and matches Python's floor semantics.",
        "If x - arr[mid] > arr[mid+k] - x, the right neighbor is closer to x than the left edge, so sliding the window right will improve it — set lo = mid+1. Otherwise, hi = mid. The strict `>` (not `>=`) handles ties: equal distances default to hi = mid, which keeps the left (smaller) elements — matching the problem's tiebreak rule. Tradeoff vs. a heap: O(log(n-k) + k) here vs. O(n log k) with a heap. Binary search wins when n is large and k is small.",
      ],
      testCase: {
        input: "arr = [1,2,3,4,5], k = 4, x = 3",
        expected: "[1,2,3,4]",
        trace: [
          "search space: lo=0, hi=5-4=1",
          "mid=0  x-arr[0]=3-1=2,  arr[0+4]-x=5-3=2  →  2 > 2? No → hi=0",
          "lo == hi == 0 → return arr[0:4] = [1,2,3,4]",
        ],
        traceExplanations: [
          "hi = len(arr) - k because a window starting at index hi would be the last valid k-element window.",
          "Tie: left distance equals right distance. Per the problem, we prefer smaller elements, so we keep the window where it is (hi = mid). This is encoded in the strict > check — equality defaults to hi=mid (keep left).",
          "Binary search converged. The left boundary is 0, so the answer window is indices 0–3.",
        ],
      },
      explanationBlanks: [
        {
          line: "I'm binary-searching for the left boundary of the best window of k elements. The search space is indices 0 through len(arr)-k — those are all valid starting positions for a window of width k. This problem uses `bisect` (binary search) rather than `heapq` because the array is already sorted — we can exploit that structure directly instead of building a heap.",
          answer: "left boundary",
        },
        {
          line: "At each mid, I compare two distances: how far x is from the left edge of the window (arr[mid]) vs. how far x is from the element just beyond the right edge (arr[mid+k]). This tells me whether the window should slide right or stay. The `//` integer division for `mid` is deliberate — it avoids floating-point and matches Python's floor semantics.",
          answer: "floor semantics",
        },
        {
          line: "If x - arr[mid] > arr[mid+k] - x, the right neighbor is closer to x than the left edge, so sliding the window right will improve it — set lo = mid+1. Otherwise, hi = mid. The strict `>` (not `>=`) handles ties: equal distances default to hi = mid, which keeps the left (smaller) elements — matching the problem's tiebreak rule. Tradeoff vs. a heap: O(log(n-k) + k) here vs. O(n log k) with a heap. Binary search wins when n is large and k is small.",
          answer: "tiebreak rule",
        },
      ],
      blanks: [
        { line: `lo, hi = 0, len(arr) - ___`, answer: "k" },
        { line: `if x - arr[mid] ___ arr[mid + k] - x:`, answer: ">" },
        { line: `lo = mid + ___`, answer: "1" },
        { line: `return arr[lo:lo + ___]`, answer: "k" },
      ],
    },

    {
      id: "merge-k-sorted-lists",
      title: "Merge K Sorted Lists",
      difficulty: "hard",
      prompt:
        "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
      patternKeywords: ["merge", "k lists", "sorted", "min heap", "linked list"],
      solution: `import heapq

def mergeKLists(lists):
    heap = []
    for i, node in enumerate(lists):
        if node:
            heapq.heappush(heap, (node.val, i, node))

    dummy = ListNode(0)
    curr = dummy

    while heap:
        val, i, node = heapq.heappop(heap)
        curr.next = node
        curr = curr.next
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))

    return dummy.next`,
      solutionExplanation: [
        "I seed the heap with the head of each list — one representative per list. `import heapq` is used here because we're repeatedly extracting the global minimum across k live cursors — exactly what a heap is built for. A naive scan across all k list heads each iteration would be O(nk); the heap reduces that to O(n log k). The heap tuple is (value, list_index, node). I include list_index as a tiebreaker because Python will try to compare nodes if values are equal, and ListNode isn't comparable — the tuple comparison short-circuits at list_index before reaching node.",
        "I use a dummy head node to simplify the linked list construction — I never have to special-case the first node. This is a standard Python idiom for building linked lists: start with a throwaway node, then return dummy.next.",
        "Each iteration: `heapq.heappop(heap)` removes and returns the global minimum — O(log k). I attach the popped node to the result list, then push that node's successor (if it exists) from the same list. This is the key insight — each list contributes exactly one node to the heap at a time, keeping heap size ≤ k. I never peek with `heap[0]` here because I always want to consume and replace the minimum.",
        "Time: O(n log k) where n is total nodes. Each node is pushed and popped once, and heap operations are O(log k). Space: O(k) for the heap.",
      ],
      testCase: {
        input: "lists = [[1→4→5], [1→3→4], [2→6]]",
        expected: "1→1→2→3→4→4→5→6",
        trace: [
          "init heap: [(1,0,node1_0), (1,1,node2_0), (2,2,node3_0)]",
          "pop (1,0,1) → attach 1  push (4,0,node1_1) → heap: [(1,1,1),(2,2,2),(4,0,4)]",
          "pop (1,1,1) → attach 1  push (3,1,node2_1) → heap: [(2,2,2),(3,1,3),(4,0,4)]",
          "pop (2,2,2) → attach 2  push (6,2,node3_1) → heap: [(3,1,3),(4,0,4),(6,2,6)]",
          "pop (3,1,3) → attach 3  push (4,1,node2_2) → heap: [(4,0,4),(4,1,4),(6,2,6)]",
          "pop (4,0,4) → attach 4  push (5,0,node1_2) → heap: [(4,1,4),(5,0,5),(6,2,6)]",
          "pop (4,1,4) → attach 4  node.next=None    → heap: [(5,0,5),(6,2,6)]",
          "pop (5,0,5) → attach 5  node.next=None    → heap: [(6,2,6)]",
          "pop (6,2,6) → attach 6  node.next=None    → heap: []",
          "return dummy.next → 1→1→2→3→4→4→5→6",
        ],
        traceExplanations: [
          "Heap is seeded with the current minimum of each list. Three lists → three entries. Heap size stays ≤ k throughout.",
          "The global minimum is 1 from list 0. After attaching it, we push its successor (4) to maintain list 0's presence in the heap.",
          "Another 1, this time from list 1. The heap always surfaces the global min — we never scan all k lists manually.",
          "2 from list 2 wins. Its successor 6 enters the heap. Notice heap size is always exactly 3 (k) here.",
          "3 from list 1. We push 4 (next in list 1). Two 4s are now in the heap — the list_index tiebreaker prevents a comparison error.",
          "Tie: two 4s. list_index=0 wins. We push 5 (next in list 0).",
          "The second 4 (from list 1) is popped. list 1 is now exhausted — nothing pushed.",
          "5 from list 0. list 0 exhausted.",
          "6, last element. Heap empties.",
          "Every node was processed exactly once. The dummy node trick avoided any special handling for the result list head.",
        ],
      },
      explanationBlanks: [
        {
          line: "I seed the heap with the head of each list — one representative per list. `import heapq` is used here because we're repeatedly extracting the global minimum across k live cursors — exactly what a heap is built for. A naive scan across all k list heads each iteration would be O(nk); the heap reduces that to O(n log k). The heap tuple is (value, list_index, node). I include list_index as a tiebreaker because Python will try to compare nodes if values are equal, and ListNode isn't comparable — the tuple comparison short-circuits at list_index before reaching node.",
          answer: "global minimum",
        },
        {
          line: "I use a dummy head node to simplify the linked list construction — I never have to special-case the first node. This is a standard Python idiom for building linked lists: start with a throwaway node, then return dummy.next.",
          answer: "dummy head node",
        },
        {
          line: "Each iteration: `heapq.heappop(heap)` removes and returns the global minimum — O(log k). I attach the popped node to the result list, then push that node's successor (if it exists) from the same list. This is the key insight — each list contributes exactly one node to the heap at a time, keeping heap size ≤ k. I never peek with `heap[0]` here because I always want to consume and replace the minimum.",
          answer: "heap size ≤ k",
        },
        {
          line: "Time: O(n log k) where n is total nodes. Each node is pushed and popped once, and heap operations are O(log k). Space: O(k) for the heap.",
          answer: "O(n log k)",
        },
      ],
      blanks: [
        { line: `heapq.heappush(heap, (node.val, ___, node))`, answer: "i" },
        { line: `val, i, node = heapq.heappop(___)`, answer: "heap" },
        { line: `if node.___:`, answer: "next" },
        {
          line: `heapq.heappush(heap, (node.next.val, i, ___))`,
          answer: "node.next",
        },
      ],
    },

    {
      id: "median-data-stream",
      title: "Find Median from Data Stream",
      difficulty: "hard",
      prompt:
        "The MedianFinder class should support two operations: addNum(num) which adds a number to the data structure, and findMedian() which returns the median of all elements so far. If the size of the list is even, return the mean of the two middle values.",
      patternKeywords: ["median", "streaming", "two heaps", "balance", "dynamic"],
      solution: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (lower half) — store negated
        self.hi = []  # min-heap (upper half)

    def addNum(self, num):
        heapq.heappush(self.lo, -num)
        # Balance: ensure lo's max <= hi's min
        if self.hi and -self.lo[0] > self.hi[0]:
            heapq.heappush(self.hi, -heapq.heappop(self.lo))
        # Rebalance sizes: lo may have at most 1 more element than hi
        if len(self.lo) > len(self.hi) + 1:
            heapq.heappush(self.hi, -heapq.heappop(self.lo))
        elif len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]
        return (-self.lo[0] + self.hi[0]) / 2`,
      solutionExplanation: [
        "I split the stream into two halves: `lo` holds the smaller half as a max-heap (stored negated), `hi` holds the larger half as a min-heap (stored as-is). The invariant: every element in lo is ≤ every element in hi. Two heaps are used instead of one because a single heap can only give you the min or max, not both boundaries simultaneously — and the median sits at the boundary.",
        "I always push to lo first using `heapq.heappush(self.lo, -num)`. The negation is the Python idiom for a max-heap: since `heapq` only supports min-heap, negating all values means the largest real value becomes the most negative stored value and floats to the root. Reading the max is then `-self.lo[0]` — peeking with `heap[0]` rather than popping, because we only want to inspect the boundary, not remove it. Then I enforce the ordering invariant — if lo's maximum exceeds hi's minimum, the boundary between halves is in the wrong place, so I move the offending element to hi.",
        "I then enforce the size invariant: lo can have at most one more element than hi (to handle odd counts). If either heap is too large, I rebalance by moving the boundary element. Each move uses `heapq.heappop` (destructive, O(log n)) followed by `heapq.heappush` (O(log n)) — unavoidable here since we're actually transferring elements between heaps.",
        "findMedian is O(1): if sizes are unequal, the extra element in lo is the median, read with `-self.lo[0]` (peek, not pop). If equal, average the two boundary values. The tradeoff: O(log n) per insertion, O(1) per query — ideal for a stream where queries are frequent.",
      ],
      testCase: {
        input: `addNum(1), addNum(2), findMedian(), addNum(3), findMedian()`,
        expected: "1.5, 2.0",
        trace: [
          "addNum(1): push -1 to lo → lo=[-1], hi=[]",
          "  size check: lo=1, hi=0  → ok (lo may lead by 1)",
          "addNum(2): push -2 to lo → lo=[-2,-1], hi=[]",
          "  order check: -lo[0]=2, hi empty → skip",
          "  size check: lo=2 > hi=0+1 → move max of lo to hi: pop -2 from lo, push 2 to hi",
          "  lo=[-1], hi=[2]",
          "findMedian(): sizes equal → (-(-1) + 2) / 2 = 1.5",
          "addNum(3): push -3 to lo → lo=[-3,-1], hi=[2]",
          "  order check: -lo[0]=3 > hi[0]=2 → move 3 to hi: lo=[-1], hi=[2,3]",
          "  size check: hi=2 > lo=1 → move min of hi to lo: lo=[-2,-1], hi=[3]",
          "findMedian(): lo=2 > hi=1 → return -lo[0] = 2.0",
        ],
        traceExplanations: [
          "First element always goes to lo. No rebalancing needed yet.",
          "lo has one element, hi has zero — allowed since lo can lead by one.",
          "2 also goes to lo first. lo now has two elements, which is more than hi+1.",
          "hi is empty so no ordering violation yet.",
          "Size violation: lo has 2, hi has 0. Move lo's max (2) to hi to restore balance.",
          "Balanced: lo=[1], hi=[2]. Every element in lo (1) ≤ every element in hi (2). ✓",
          "Sizes are equal → even count → median is average of boundary values (1 and 2).",
          "3 goes to lo first. Now lo's max (3) is larger than hi's min (2) — ordering violated.",
          "Move 3 to hi to fix ordering. But now hi leads in size.",
          "Move hi's min (2) back to lo to fix size. Now lo=[-2,-1], hi=[3]. Every element in lo (1,2) ≤ hi (3). ✓",
          "lo has one extra element — odd count — so lo's max (2) is the median.",
        ],
      },
      explanationBlanks: [
        {
          line: "I split the stream into two halves: `lo` holds the smaller half as a max-heap (stored negated), `hi` holds the larger half as a min-heap (stored as-is). The invariant: every element in lo is ≤ every element in hi. Two heaps are used instead of one because a single heap can only give you the min or max, not both boundaries simultaneously — and the median sits at the boundary.",
          answer: "median sits at the boundary",
        },
        {
          line: "I always push to lo first using `heapq.heappush(self.lo, -num)`. The negation is the Python idiom for a max-heap: since `heapq` only supports min-heap, negating all values means the largest real value becomes the most negative stored value and floats to the root. Reading the max is then `-self.lo[0]` — peeking with `heap[0]` rather than popping, because we only want to inspect the boundary, not remove it. Then I enforce the ordering invariant — if lo's maximum exceeds hi's minimum, the boundary between halves is in the wrong place, so I move the offending element to hi.",
          answer: "ordering invariant",
        },
        {
          line: "I then enforce the size invariant: lo can have at most one more element than hi (to handle odd counts). If either heap is too large, I rebalance by moving the boundary element. Each move uses `heapq.heappop` (destructive, O(log n)) followed by `heapq.heappush` (O(log n)) — unavoidable here since we're actually transferring elements between heaps.",
          answer: "size invariant",
        },
        {
          line: "findMedian is O(1): if sizes are unequal, the extra element in lo is the median, read with `-self.lo[0]` (peek, not pop). If equal, average the two boundary values. The tradeoff: O(log n) per insertion, O(1) per query — ideal for a stream where queries are frequent.",
          answer: "O(1) per query",
        },
      ],
      blanks: [
        { line: `self.lo = []  # max-heap — store ___`, answer: "negated" },
        { line: `heapq.heappush(self.lo, ___)`, answer: "-num" },
        {
          line: `if self.hi and -self.lo[0] ___ self.hi[0]:`,
          answer: ">",
        },
        {
          line: `if len(self.lo) > len(self.hi) + ___:`,
          answer: "1",
        },
        {
          line: `return (-self.lo[0] + self.hi[0]) / ___`,
          answer: "2",
        },
      ],
    },
  ],
}
