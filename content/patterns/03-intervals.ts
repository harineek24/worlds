import { Pattern } from "../types"

export const intervals: Pattern = {
  id: "intervals",
  order: 3,
  patternName: "Intervals",

  philosophy: {
    text: "In the confrontation between the stream and the rock, the stream always wins — not through strength, but through persistence.",
    source: "Buddha",
    connection:
      "Intervals seem to conflict when you look at them naively — you want to brute-force every pair. But if you sort first and scan linearly, overlap resolves itself cleanly. Persistence (keep scanning left to right) beats force (nested loops). The structure of the problem yields to patient, ordered traversal.",
  },

  template: {
    description:
      "Sort by start time — almost always step 1. Then walk forward: if the current interval overlaps the last merged one, extend it; otherwise append. One pass after sorting.",
    snippet: `# Sort by start time first — this is almost always step 1
intervals.sort(key=lambda x: x[0])

# Merge pattern
result = [intervals[0]]
for start, end in intervals[1:]:
    if start <= result[-1][1]:  # overlaps
        result[-1][1] = max(result[-1][1], end)
    else:
        result.append([start, end])`,
  },

  pythonTools: [
    {
      name: "Sort intervals by start time",
      snippet: "intervals.sort(key=lambda x: x[0])",
    },
    {
      name: "Peek at the last merged interval",
      snippet: "result[-1]",
    },
    {
      name: "heapq for merging multiple sorted lists (Employee Free Time)",
      snippet: `import heapq
# Push (start, end, employee_idx, interval_idx)
heap = [(sched[0][0], sched[0][1], i, 0) for i, sched in enumerate(schedules)]
heapq.heapify(heap)`,
    },
  ],

  problems: [
    {
      id: "meeting-rooms",
      title: "Meeting Rooms (Can Attend All)",
      difficulty: "easy",
      prompt:
        "Given an array of meeting time intervals where intervals[i] = [start_i, end_i], determine if a person could attend all meetings. Return true if no two intervals overlap.",
      patternKeywords: ["intervals", "overlap", "attend", "meetings"],
      solution: `def can_attend_all_meetings(intervals: list[list[int]]) -> bool:
    intervals.sort(key=lambda x: x[0])
    for i in range(1, len(intervals)):
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True`,
      solutionExplanation: [
        "I'm sorting by start time first because that's the only way a linear scan makes sense — if I don't sort, I'd have to compare every pair, which is O(n²). Sorting costs O(n log n) and makes the rest O(n). I use `intervals.sort(key=lambda x: x[0])` with a lambda rather than a named function because this is a throwaway, one-line key: a named function would force the reader to scroll elsewhere to understand something trivially simple. The `x[0]` extracts index 0 — the start time — from each two-element list. I use index access rather than unpacking because sort's `key=` receives a whole element, not a pair.",
        "I'm iterating from the second interval onward and comparing each interval's start to the previous interval's end. If the next meeting starts before the current one ends, we have a conflict and can return false immediately.",
        "If we complete the loop without finding any conflict, the person can attend all meetings — return true.",
      ],
      testCase: {
        input: "intervals = [[0,30],[5,10],[15,20]]",
        expected: "false",
        trace: [
          "Sort by start → [[0,30],[5,10],[15,20]] (already sorted by start)",
          "i=1: intervals[1][0]=5, intervals[0][1]=30 → 5 < 30 → conflict!",
          "Return False",
        ],
        traceExplanations: [
          "After sorting by start, the first meeting [0,30] sets the baseline. Any meeting starting before time 30 will conflict.",
          "The second meeting starts at 5, which is before the first meeting ends at 30 — they overlap. We don't need to check further.",
          "A single conflict is enough to know the schedule is impossible.",
        ],
      },
      blanks: [
        {
          line: "    if intervals[i][0] < intervals[i - 1][1]:",
          answer: "intervals[i][0] < intervals[i - 1][1]",
        },
        {
          line: "    intervals.sort(key=lambda x: x[0])",
          answer: "key=lambda x: x[0]",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm sorting by start time first because that's the only way a linear scan makes sense — if I don't sort, I'd have to compare every pair, which is ___. Sorting costs O(n log n) and makes the rest O(n). I use `intervals.sort(key=lambda x: x[0])` with a lambda rather than a named function because this is a throwaway, one-line key: a named function would force the reader to scroll elsewhere to understand something trivially simple. The `x[0]` extracts index 0 — the start time — from each two-element list. I use index access rather than unpacking because sort's `key=` receives a whole element, not a pair.",
          answer: "O(n²)",
        },
        {
          line: "I'm iterating from the second interval onward and comparing each interval's ___ to the previous interval's end. If the next meeting starts before the current one ends, we have a conflict and can return false immediately.",
          answer: "start",
        },
        {
          line: "If we complete the loop without finding any conflict, the person can attend all meetings — return ___.",
          answer: "true",
        },
      ],
    },

    {
      id: "insert-interval",
      title: "Insert Interval",
      difficulty: "medium",
      prompt:
        "You are given an array of non-overlapping intervals sorted by start time, and a new interval to insert. Insert the new interval and merge if necessary. Return the resulting array of non-overlapping intervals.",
      patternKeywords: ["insert", "merge", "sorted", "non-overlapping"],
      solution: `def insert(intervals: list[list[int]], new_interval: list[int]) -> list[list[int]]:
    result = []
    i = 0
    n = len(intervals)

    # Add all intervals that end before the new one starts
    while i < n and intervals[i][1] < new_interval[0]:
        result.append(intervals[i])
        i += 1

    # Merge all overlapping intervals with new_interval
    while i < n and intervals[i][0] <= new_interval[1]:
        new_interval[0] = min(new_interval[0], intervals[i][0])
        new_interval[1] = max(new_interval[1], intervals[i][1])
        i += 1

    result.append(new_interval)

    # Add remaining intervals
    while i < n:
        result.append(intervals[i])
        i += 1

    return result`,
      solutionExplanation: [
        "I'm splitting the problem into three phases: intervals before the new one (no overlap), intervals that overlap with the new one (merge them in), and intervals after the new one (no overlap). This three-phase approach avoids conditionals inside a single loop.",
        "In phase one, I keep appending intervals whose end is strictly before the new interval's start. These can never overlap with anything to come. I use `result.append(intervals[i])` — Python's list `.append()` is O(1) amortized because lists over-allocate internally. I use a plain list as a dynamic array here, not a deque, because I only ever add to the end and read from the end — no front operations are needed.",
        "In phase two, I merge every interval that overlaps with new_interval by expanding new_interval's bounds to cover both. The overlap condition is: the existing interval starts at or before new_interval ends. I mutate new_interval in place (`new_interval[0] = min(...)`) rather than creating a new list each iteration — this keeps the merge loop allocation-free.",
        "After the merge loop, I append the fully-merged new_interval once, then dump all remaining intervals. These are guaranteed non-overlapping since the input was already sorted and non-overlapping.",
      ],
      testCase: {
        input: "intervals = [[1,3],[6,9]], new_interval = [2,5]",
        expected: "[[1,5],[6,9]]",
        trace: [
          "Phase 1: i=0, intervals[0]=[1,3], end=3 >= new_interval[0]=2 → stop phase 1",
          "Phase 2: i=0, intervals[0][0]=1 <= new_interval[1]=5 → merge: new_interval = [min(2,1), max(5,3)] = [1,5], i=1",
          "Phase 2: i=1, intervals[1][0]=6 > new_interval[1]=5 → stop phase 2",
          "Append new_interval [1,5] → result = [[1,5]]",
          "Phase 3: append [6,9] → result = [[1,5],[6,9]]",
        ],
        traceExplanations: [
          "Phase 1 stops as soon as we find an interval that could overlap. [1,3] ends at 3 which is not less than 2, so it might overlap with [2,5].",
          "We expand new_interval to cover [1,3] ∪ [2,5] = [1,5]. We advance i to check the next interval.",
          "[6,9] starts at 6 which is after [1,5] ends at 5 — no more merging needed.",
          "We commit the merged interval to results.",
          "The remaining intervals are just appended as-is since they can't overlap anything already in result.",
        ],
      },
      blanks: [
        {
          line: "    while i < n and intervals[i][1] < new_interval[0]:",
          answer: "intervals[i][1] < new_interval[0]",
        },
        {
          line: "    while i < n and intervals[i][0] <= new_interval[1]:",
          answer: "intervals[i][0] <= new_interval[1]",
        },
        {
          line: "        new_interval[0] = min(new_interval[0], intervals[i][0])",
          answer: "min(new_interval[0], intervals[i][0])",
        },
        {
          line: "        new_interval[1] = max(new_interval[1], intervals[i][1])",
          answer: "max(new_interval[1], intervals[i][1])",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm splitting the problem into ___ phases: intervals before the new one (no overlap), intervals that overlap with the new one (merge them in), and intervals after the new one (no overlap). This three-phase approach avoids conditionals inside a single loop.",
          answer: "three",
        },
        {
          line: "In phase one, I keep appending intervals whose end is strictly before the new interval's start. These can never overlap with anything to come. I use `result.append(intervals[i])` — Python's list `.append()` is ___ because lists over-allocate internally. I use a plain list as a dynamic array here, not a deque, because I only ever add to the end and read from the end — no front operations are needed.",
          answer: "O(1) amortized",
        },
        {
          line: "In phase two, I merge every interval that overlaps with new_interval by expanding new_interval's bounds to cover both. The overlap condition is: the existing interval starts at or before new_interval ends. I mutate new_interval in place (`new_interval[0] = min(...)`) rather than creating a new list each iteration — this keeps the merge loop ___.",
          answer: "allocation-free",
        },
        {
          line: "After the merge loop, I append the fully-merged new_interval once, then dump all remaining intervals. These are guaranteed ___ since the input was already sorted and non-overlapping.",
          answer: "non-overlapping",
        },
      ],
    },

    {
      id: "non-overlapping-intervals",
      title: "Non-Overlapping Intervals",
      difficulty: "medium",
      prompt:
        "Given an array of intervals, return the minimum number of intervals you need to remove to make the rest non-overlapping.",
      patternKeywords: ["remove", "minimum", "non-overlapping", "greedy"],
      solution: `def erase_overlap_intervals(intervals: list[list[int]]) -> int:
    intervals.sort(key=lambda x: x[1])  # sort by END time
    removals = 0
    prev_end = float('-inf')

    for start, end in intervals:
        if start >= prev_end:
            # No overlap — keep this interval
            prev_end = end
        else:
            # Overlap — remove the interval with the later end (greedy)
            removals += 1
            # prev_end stays the same (we're implicitly keeping the earlier-ending one)

    return removals`,
      solutionExplanation: [
        "I'm sorting by end time, not start time — this is the key greedy insight. By always keeping the interval that ends earliest, I leave the most room for future intervals. It's the same logic as the classic activity selection problem. I write `intervals.sort(key=lambda x: x[1])` with `x[1]` to extract the end time (index 1). Using a lambda instead of a named function keeps the intent inline — the reader sees the sort criterion right where the sort happens. `operator.itemgetter(1)` would also work and is slightly faster, but a lambda is more universally readable without importing anything.",
        "I track prev_end as the end of the last interval I decided to keep. If the current interval's start is at or after prev_end, there's no overlap — I keep it and update prev_end.",
        "If there's an overlap (start < prev_end), I must remove one. The greedy choice is to remove the one with the later end — which is the current one, since I sorted by end. So I just increment removals without updating prev_end.",
        "This greedy approach is provably optimal: keeping the earliest-ending interval at every step maximizes the count of intervals we can keep, which minimizes removals.",
      ],
      testCase: {
        input: "intervals = [[1,2],[2,3],[3,4],[1,3]]",
        expected: "1",
        trace: [
          "Sort by end: [[1,2],[2,3],[1,3],[3,4]]",
          "prev_end = -inf, removals = 0",
          "[1,2]: start=1 >= -inf → keep, prev_end = 2",
          "[2,3]: start=2 >= 2 → keep, prev_end = 3",
          "[1,3]: start=1 < 3 → overlap, removals = 1, prev_end stays 3",
          "[3,4]: start=3 >= 3 → keep, prev_end = 4",
          "Return 1",
        ],
        traceExplanations: [
          "Sorting by end puts [1,2] first (ends at 2), then [2,3] and [1,3] tied at end=3, then [3,4].",
          "We initialize prev_end to -infinity so the first interval always passes the no-overlap check.",
          "[1,2] has no competition — keep it. Now prev_end = 2.",
          "[2,3] starts exactly at prev_end — touching but not overlapping (strictly >=). Keep it, prev_end = 3.",
          "[1,3] starts at 1 which is before prev_end=3 — conflict. We remove [1,3] (it started earlier so it's the 'bad' one creating the conflict with what we already kept). prev_end stays 3.",
          "[3,4] starts at 3 which equals prev_end — no overlap, keep it.",
        ],
      },
      blanks: [
        {
          line: "    intervals.sort(key=lambda x: x[1])  # sort by END time",
          answer: "key=lambda x: x[1]",
        },
        {
          line: "        if start >= prev_end:",
          answer: "start >= prev_end",
        },
        {
          line: "            prev_end = end",
          answer: "prev_end = end",
        },
        {
          line: "            removals += 1",
          answer: "removals += 1",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm sorting by ___ time, not start time — this is the key greedy insight. By always keeping the interval that ends earliest, I leave the most room for future intervals. It's the same logic as the classic activity selection problem. I write `intervals.sort(key=lambda x: x[1])` with `x[1]` to extract the end time (index 1). Using a lambda instead of a named function keeps the intent inline — the reader sees the sort criterion right where the sort happens. `operator.itemgetter(1)` would also work and is slightly faster, but a lambda is more universally readable without importing anything.",
          answer: "end",
        },
        {
          line: "I track prev_end as the end of the last interval I decided to keep. If the current interval's start is at or after prev_end, there's no overlap — I keep it and update ___.",
          answer: "prev_end",
        },
        {
          line: "If there's an overlap (start < prev_end), I must remove one. The greedy choice is to remove the one with the later end — which is the current one, since I sorted by end. So I just increment ___ without updating prev_end.",
          answer: "removals",
        },
        {
          line: "This greedy approach is provably optimal: keeping the earliest-ending interval at every step maximizes the count of intervals we can keep, which ___ removals.",
          answer: "minimizes",
        },
      ],
    },

    {
      id: "merge-intervals",
      title: "Merge Intervals",
      difficulty: "medium",
      prompt:
        "Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
      patternKeywords: ["merge", "overlapping", "combine", "intervals"],
      solution: `def merge(intervals: list[list[int]]) -> list[list[int]]:
    intervals.sort(key=lambda x: x[0])
    result = [intervals[0]]

    for start, end in intervals[1:]:
        if start <= result[-1][1]:
            result[-1][1] = max(result[-1][1], end)
        else:
            result.append([start, end])

    return result`,
      solutionExplanation: [
        "I'm sorting by start time so that any intervals that could overlap are adjacent in the list. After sorting, I only need to compare the current interval with the last interval in result — no interval further back can be affected. `intervals.sort(key=lambda x: x[0])` uses a lambda because defining a named function like `def get_start(x): return x[0]` for something this simple is over-engineering — it would force a reader to look elsewhere for a one-liner. The lambda keeps the key criterion right next to the sort call.",
        "I initialize result with the first interval. This avoids an empty-list edge case and gives a starting point for comparisons.",
        "For each subsequent interval, I check if it overlaps the last merged interval using `result[-1]`. I use `result[-1]` instead of `result[len(result)-1]` — Python's negative indexing reads from the end of the list, and `[-1]` is the idiomatic way to say 'last element'. It's not just shorter — it signals intent: I always want the most recently added interval, whatever the list's length is. If there's overlap, I extend via `result[-1][1] = max(result[-1][1], end)` — again operating directly on the last element without copying it out.",
        "If there's no overlap, the current interval is entirely to the right of everything in result. I `result.append([start, end])` — using a plain list as a dynamic array is appropriate here since I only grow from the tail and read from the tail. Python list `.append()` is O(1) amortized, which is all we need.",
      ],
      testCase: {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        expected: "[[1,6],[8,10],[15,18]]",
        trace: [
          "Sort by start: [[1,3],[2,6],[8,10],[15,18]] (already sorted)",
          "result = [[1,3]]",
          "[2,6]: start=2 <= result[-1][1]=3 → merge: result[-1][1] = max(3,6) = 6 → result = [[1,6]]",
          "[8,10]: start=8 > result[-1][1]=6 → no overlap, append → result = [[1,6],[8,10]]",
          "[15,18]: start=15 > result[-1][1]=10 → no overlap, append → result = [[1,6],[8,10],[15,18]]",
          "Return [[1,6],[8,10],[15,18]]",
        ],
        traceExplanations: [
          "The input is already sorted by start, so no reordering happens.",
          "Seed result with the first interval — we need at least one interval to compare against.",
          "[2,6] starts at 2, which is inside [1,3]. We extend the end from 3 to 6, absorbing the overlap.",
          "[8,10] starts at 8, clearly after [1,6] ends at 6. No merge — we start a new interval in result.",
          "[15,18] starts at 15, clearly after [8,10] ends at 10. Again no merge.",
        ],
      },
      blanks: [
        {
          line: "        if start <= result[-1][1]:",
          answer: "start <= result[-1][1]",
        },
        {
          line: "            result[-1][1] = max(result[-1][1], end)",
          answer: "max(result[-1][1], end)",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm sorting by start time so that any intervals that could overlap are ___ in the list. After sorting, I only need to compare the current interval with the last interval in result — no interval further back can be affected. `intervals.sort(key=lambda x: x[0])` uses a lambda because defining a named function like `def get_start(x): return x[0]` for something this simple is over-engineering — it would force a reader to look elsewhere for a one-liner. The lambda keeps the key criterion right next to the sort call.",
          answer: "adjacent",
        },
        {
          line: "I initialize result with the first interval. This avoids an ___ and gives a starting point for comparisons.",
          answer: "empty-list edge case",
        },
        {
          line: "For each subsequent interval, I check if it overlaps the last merged interval using `result[-1]`. I use `result[-1]` instead of `result[len(result)-1]` — Python's ___ reads from the end of the list, and `[-1]` is the idiomatic way to say 'last element'. It's not just shorter — it signals intent: I always want the most recently added interval, whatever the list's length is. If there's overlap, I extend via `result[-1][1] = max(result[-1][1], end)` — again operating directly on the last element without copying it out.",
          answer: "negative indexing",
        },
        {
          line: "If there's no overlap, the current interval is entirely to the right of everything in result. I `result.append([start, end])` — using a plain list as a dynamic array is appropriate here since I only grow from the tail and read from the tail. Python list `.append()` is ___, which is all we need.",
          answer: "O(1) amortized",
        },
      ],
    },

    {
      id: "employee-free-time",
      title: "Employee Free Time",
      difficulty: "hard",
      prompt:
        "Given a list of employees' schedules where schedules[i] is a list of non-overlapping intervals for employee i (sorted by start time), find the list of finite intervals representing the free time common to all employees. Free time means no employee is working during that interval.",
      patternKeywords: ["free time", "employees", "schedules", "gaps"],
      solution: `def employee_free_time(schedules: list[list[list[int]]]) -> list[list[int]]:
    # Flatten all intervals into one list and sort
    all_intervals = []
    for schedule in schedules:
        for interval in schedule:
            all_intervals.append(interval)
    all_intervals.sort(key=lambda x: x[0])

    # Merge all intervals, then find gaps
    merged = [all_intervals[0][:]]
    for start, end in all_intervals[1:]:
        if start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])

    # Gaps between consecutive merged intervals are free time
    free_time = []
    for i in range(1, len(merged)):
        free_time.append([merged[i - 1][1], merged[i][0]])

    return free_time`,
      solutionExplanation: [
        "I'm flattening all employee schedules into a single list of intervals. Free time is any gap in the combined schedule — it doesn't matter which employee owns which interval, only whether someone is working at any given moment. A heap-based approach (pushing one interval per employee and always advancing the smallest) would be more memory-efficient for huge inputs since it avoids materializing the full flat list. But the flat-then-sort approach is simpler to reason about — correct for interview purposes, and the O(n log n) cost is the same.",
        "After flattening, I sort by start time using `all_intervals.sort(key=lambda x: x[0])`. The lambda extracts index 0 (start time) from each interval. This is a named-function-free approach: the lambda lives right next to the sort call, making the intent immediately obvious without requiring the reader to look elsewhere. Then I merge all overlapping intervals using the standard merge pattern. The `merged[-1]` negative index lets me always address the last merged interval without computing its position — it's the idiomatic Python way to say 'I only care about the tail of this list'.",
        "The free time intervals are precisely the gaps between consecutive merged intervals. If merged[i] ends at time A and merged[i+1] starts at time B, then [A, B] is a window when nobody is working.",
        "I use `all_intervals[0][:]` (a slice copy) when seeding merged so I don't mutate the original input while extending `merged[-1][1]`. Without the copy, `merged[-1]` and `all_intervals[0]` would point to the same list object, and modifying the end time would silently corrupt the input.",
      ],
      testCase: {
        input: "schedules = [[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]",
        expected: "[[5,6],[7,9]]",
        trace: [
          "Flatten: [[1,3],[6,7],[2,4],[2,5],[9,12]]",
          "Sort by start: [[1,3],[2,4],[2,5],[6,7],[9,12]]",
          "Merge:",
          "  merged = [[1,3]]",
          "  [2,4]: 2 <= 3 → extend end to max(3,4)=4 → merged = [[1,4]]",
          "  [2,5]: 2 <= 4 → extend end to max(4,5)=5 → merged = [[1,5]]",
          "  [6,7]: 6 > 5 → append → merged = [[1,5],[6,7]]",
          "  [9,12]: 9 > 7 → append → merged = [[1,5],[6,7],[9,12]]",
          "Gaps: i=1 → [merged[0][1], merged[1][0]] = [5,6]",
          "      i=2 → [merged[1][1], merged[2][0]] = [7,9]",
          "Return [[5,6],[7,9]]",
        ],
        traceExplanations: [
          "We discard employee identity — the union of all working intervals is what matters.",
          "Sorting makes adjacent intervals in the list the natural candidates for merging.",
          "We seed merged with a copy of the first interval to avoid mutating input.",
          "[2,4] overlaps [1,3] — an employee works from 2-4, so the combined coverage extends to 4.",
          "[2,5] also overlaps [1,4] — another employee covers up to 5, so coverage extends to 5.",
          "[6,7] starts at 6, after coverage ends at 5. Gap from 5 to 6 is everyone's free time.",
          "[9,12] starts at 9, after coverage ends at 7. Gap from 7 to 9 is free time.",
          "Reading off the gaps between merged intervals gives us the answer directly.",
        ],
      },
      blanks: [
        {
          line: "    all_intervals.sort(key=lambda x: x[0])",
          answer: "key=lambda x: x[0]",
        },
        {
          line: "        if start <= merged[-1][1]:",
          answer: "start <= merged[-1][1]",
        },
        {
          line: "            merged[-1][1] = max(merged[-1][1], end)",
          answer: "max(merged[-1][1], end)",
        },
        {
          line: "        free_time.append([merged[i - 1][1], merged[i][0]])",
          answer: "[merged[i - 1][1], merged[i][0]]",
        },
      ],
      explanationBlanks: [
        {
          line: "I'm flattening all employee schedules into a single list of intervals. Free time is any gap in the combined schedule — it doesn't matter which employee owns which interval, only whether someone is working at any given moment. A ___ (pushing one interval per employee and always advancing the smallest) would be more memory-efficient for huge inputs since it avoids materializing the full flat list. But the flat-then-sort approach is simpler to reason about — correct for interview purposes, and the O(n log n) cost is the same.",
          answer: "heap-based approach",
        },
        {
          line: "After flattening, I sort by start time using `all_intervals.sort(key=lambda x: x[0])`. The lambda extracts index 0 (start time) from each interval. This is a named-function-free approach: the lambda lives right next to the sort call, making the intent immediately obvious without requiring the reader to look elsewhere. Then I merge all overlapping intervals using the standard merge pattern. The `merged[-1]` ___ lets me always address the last merged interval without computing its position — it's the idiomatic Python way to say 'I only care about the tail of this list'.",
          answer: "negative index",
        },
        {
          line: "The free time intervals are precisely the ___ between consecutive merged intervals. If merged[i] ends at time A and merged[i+1] starts at time B, then [A, B] is a window when nobody is working.",
          answer: "gaps",
        },
        {
          line: "I use `all_intervals[0][:]` (a ___ ) when seeding merged so I don't mutate the original input while extending `merged[-1][1]`. Without the copy, `merged[-1]` and `all_intervals[0]` would point to the same list object, and modifying the end time would silently corrupt the input.",
          answer: "slice copy",
        },
      ],
    },
  ],
}
