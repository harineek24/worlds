import { Pattern } from "../types"

export const slidingWindow: Pattern = {
  id: "sliding-window",
  order: 2,
  patternName: "Sliding Window",

  philosophy: {
    text: "The present moment is the only moment available to us, and it is the door to all moments.",
    source: "Thich Nhat Hanh",
    connection:
      "The window holds only what's currently relevant — as it slides, it releases the past and receives the present without judgment. Each element gets its moment of consideration, then is let go. The answer isn't hoarded from the beginning; it's discovered by staying fully present with each new window.",
  },

  template: {
    description:
      "A contiguous subarray that expands rightward and contracts from the left. Fixed-size windows maintain a constant width; variable-size windows shrink whenever a constraint is violated. Both run in O(n) because every element enters and exits the window exactly once.",
    snippet: `# Fixed size window
left = 0
for right in range(len(arr)):
    # add arr[right] to window
    if right - left + 1 == k:
        # record result
        # remove arr[left] from window
        left += 1

# Variable size window
left = 0
for right in range(len(arr)):
    # add arr[right] to window
    while <window invalid>:
        # remove arr[left]
        left += 1
    # window is valid — record result`,
  },

  pythonTools: [
    {
      name: "collections.defaultdict(int) for character/element frequency in window",
      snippet: `from collections import defaultdict
freq = defaultdict(int)
freq[arr[right]] += 1
freq[arr[left]] -= 1`,
    },
    {
      name: "dict.get(key, 0) safe frequency lookup",
      snippet: `count = freq.get(char, 0)`,
    },
    {
      name: "right - left + 1 current window size",
      snippet: `window_size = right - left + 1`,
    },
  ],

  problems: [
    {
      id: "max-sum-subarray-k",
      title: "Maximum Sum Subarray of Size K",
      difficulty: "easy",
      prompt:
        "Given an array of integers and a positive integer k, find the maximum sum of any contiguous subarray of exactly size k.",
      patternKeywords: ["contiguous subarray", "fixed size", "maximum sum", "exactly k"],
      solution: `def max_sum_subarray(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for right in range(k, len(arr)):
        window_sum += arr[right] - arr[right - k]
        max_sum = max(max_sum, window_sum)
    return max_sum`,
      solutionExplanation: [
        "I seed the window with the first k elements using sum(). This is the only O(k) operation — every subsequent step is O(1). The tradeoff is a small upfront cost for a clean loop body.",
        "The sliding step is the key insight: instead of recomputing the sum of k elements from scratch each time (which would be O(nk)), I add the incoming right element and subtract the outgoing left element. The window 'slides' in one arithmetic operation.",
        "I track the running maximum. The window never shrinks or grows — it just shifts one position right per iteration, so every position is visited exactly once.",
      ],
      testCase: {
        input: `arr = [2, 1, 5, 1, 3, 2], k = 3`,
        expected: "9",
        trace: [
          "initial window [0..2]: 2+1+5 = 8   max=8",
          "right=3  add arr[3]=1  sub arr[0]=2  window [1..3]: 8+1-2=7   max=8",
          "right=4  add arr[4]=3  sub arr[1]=1  window [2..4]: 7+3-1=9   max=9",
          "right=5  add arr[5]=2  sub arr[2]=5  window [3..5]: 9+2-5=6   max=9",
          "return 9",
        ],
        traceExplanations: [
          "First window covers indices 0-2. Sum is 8. This is our baseline — the first candidate for max.",
          "Window slides right. We gain the 1 at index 3 and lose the 2 at index 0. Net change is -1. Sum drops to 7. Max stays at 8.",
          "Window is now [2..4]. We gain 3 and lose 1 — net +2. Sum jumps to 9, beating the previous max. This is our answer.",
          "Final window [3..5]. We gain 2 and lose 5 — net -3. Sum falls to 6. Max stays at 9.",
          "All windows of size 3 have been evaluated. The best was [5,1,3] at indices 2-4.",
        ],
      },
      blanks: [
        { line: `window_sum = sum(arr[:___])`, answer: "k" },
        { line: `for right in range(___, len(arr)):`, answer: "k" },
        { line: `window_sum += arr[right] - arr[right - ___]`, answer: "k" },
        { line: `max_sum = max(___, window_sum)`, answer: "max_sum" },
      ],
    },

    {
      id: "max-points-cards",
      title: "Max Points You Can Obtain from Cards",
      difficulty: "medium",
      prompt:
        "There are several cards arranged in a row, and each card has an associated number of points. You may pick exactly k cards from either the front or back of the row. Your score is the sum of the points of the cards you have picked. Given the integer array cardPoints and the integer k, return the maximum score you can obtain.",
      patternKeywords: ["pick from either end", "exactly k cards", "complement window", "minimize middle"],
      solution: `def max_score(cardPoints, k):
    n = len(cardPoints)
    total = sum(cardPoints)
    window_size = n - k
    if window_size == 0:
        return total
    window_sum = sum(cardPoints[:window_size])
    min_sum = window_sum
    for right in range(window_size, n):
        window_sum += cardPoints[right] - cardPoints[right - window_size]
        min_sum = min(min_sum, window_sum)
    return total - min_sum`,
      solutionExplanation: [
        "The key inversion: instead of tracking which k cards you pick from the ends, I track the (n-k) cards you leave behind in the middle. Maximizing picked points is equivalent to minimizing the sum of the middle window. This turns an awkward 'pick from both ends' problem into a clean fixed-size sliding window.",
        "If window_size is 0, you're taking all cards — return the total immediately.",
        "I seed the first window of size (n-k) and slide it across the array, tracking the minimum sum seen. The sliding step is the same O(1) add-and-subtract trick.",
        "The answer is total minus the minimum middle window. Whatever the middle contributes least, the ends contribute most.",
      ],
      testCase: {
        input: `cardPoints = [1, 2, 3, 4, 5, 6, 1], k = 3`,
        expected: "12",
        trace: [
          "n=7  k=3  window_size=4  total=22",
          "initial window [0..3]: 1+2+3+4=10   min_sum=10",
          "right=4  add 5  sub 1  window [1..4]: 10+5-1=14   min_sum=10",
          "right=5  add 6  sub 2  window [2..5]: 14+6-2=18   min_sum=10",
          "right=6  add 1  sub 3  window [3..6]: 18+1-3=16   min_sum=10",
          "return total - min_sum = 22 - 10 = 12",
        ],
        traceExplanations: [
          "We need to leave 4 cards in the middle and take 3 from the ends. Total is 22.",
          "First candidate for the 'middle 4': cards [1,2,3,4] summing to 10. If these stay, we take 5+6+1=12 from the ends.",
          "Middle shifts to [2,3,4,5] summing to 14. Leaving these behind means we'd take only 8. Worse.",
          "Middle [3,4,5,6] = 18. Leaving the highest-valued middle cards means we take very little. min_sum stays 10.",
          "Middle [4,5,6,1] = 16. Still worse than 10.",
          "Minimum middle is 10. The best we can do is take the complement: 22-10=12. That corresponds to picking cards [5,6,1] from the right end.",
        ],
      },
      blanks: [
        { line: `window_size = n - ___`, answer: "k" },
        { line: `window_sum = sum(cardPoints[:___])`, answer: "window_size" },
        { line: `window_sum += cardPoints[right] - cardPoints[right - ___]`, answer: "window_size" },
        { line: `min_sum = min(___, window_sum)`, answer: "min_sum" },
        { line: `return total - ___`, answer: "min_sum" },
      ],
    },

    {
      id: "max-sum-distinct-k",
      title: "Max Sum of Distinct Subarrays with Length K",
      difficulty: "medium",
      prompt:
        "Given an integer array nums and an integer k, find the maximum sum of a subarray of length k that contains only distinct elements. If no such subarray exists, return 0.",
      patternKeywords: ["distinct elements", "fixed length k", "maximum sum", "uniqueness constraint"],
      solution: `from collections import defaultdict

def max_sum_distinct(nums, k):
    freq = defaultdict(int)
    window_sum = 0
    max_sum = 0
    left = 0
    for right in range(len(nums)):
        freq[nums[right]] += 1
        window_sum += nums[right]
        if right - left + 1 == k:
            if len(freq) == k:
                max_sum = max(max_sum, window_sum)
            window_sum -= nums[left]
            freq[nums[left]] -= 1
            if freq[nums[left]] == 0:
                del freq[nums[left]]
            left += 1
    return max_sum`,
      solutionExplanation: [
        "I use a frequency map to track how many times each element appears in the current window. Adding an element increments its count; removing decrements it. When a count hits zero, I delete the key so that len(freq) accurately reflects the number of distinct elements — this is the distinctness check.",
        "I expand the window by adding each new element and its value to the running sum. The window grows until it hits exactly size k.",
        "Once the window reaches size k, I check if it's valid: len(freq) == k means every element in the window is unique (no key has count > 1). If valid, I update the max.",
        "Whether or not the window was valid, I slide it forward: subtract the leftmost value, decrement its frequency, clean up if zero, and advance left. This keeps the window at exactly size k for the next iteration.",
      ],
      testCase: {
        input: `nums = [1, 5, 4, 2, 9, 9, 9], k = 3`,
        expected: "15",
        trace: [
          "right=0  add 1  window=[1]       freq={1:1}        size=1",
          "right=1  add 5  window=[1,5]     freq={1:1,5:1}    size=2",
          "right=2  add 4  window=[1,5,4]   freq={1:1,5:1,4:1}  size=3  len(freq)=3==k ✓  sum=10  max=10  slide: remove 1",
          "right=3  add 2  window=[5,4,2]   freq={5:1,4:1,2:1}  size=3  len(freq)=3==k ✓  sum=11  max=11  slide: remove 5",
          "right=4  add 9  window=[4,2,9]   freq={4:1,2:1,9:1}  size=3  len(freq)=3==k ✓  sum=15  max=15  slide: remove 4",
          "right=5  add 9  window=[2,9,9]   freq={2:1,9:2}      size=3  len(freq)=2≠k ✗  not valid  slide: remove 2",
          "right=6  add 9  window=[9,9,9]   freq={9:3}          size=3  len(freq)=1≠k ✗  not valid  slide: remove 9",
          "return 15",
        ],
        traceExplanations: [
          "Window grows, not yet at size k.",
          "Window still growing.",
          "First full window [1,5,4]. All distinct — len(freq)=3 equals k=3. Sum is 10. Slide forward by removing 1.",
          "Window [5,4,2]. Still all distinct. Sum is 11. New max. Slide forward.",
          "Window [4,2,9]. All distinct. Sum is 15. Best so far. Slide forward.",
          "Window [2,9,9]. The duplicate 9 means len(freq)=2, not 3. Constraint violated — skip this window. Slide forward, removing 2.",
          "Window [9,9,9]. Heavily duplicated. len(freq)=1. Invalid. No valid window improves on 15.",
          "Maximum sum from a valid distinct-k window was 15, corresponding to [4,2,9].",
        ],
      },
      blanks: [
        { line: `freq[nums[right]] += ___`, answer: "1" },
        { line: `if right - left + 1 == ___:`, answer: "k" },
        { line: `if len(freq) == ___:`, answer: "k" },
        { line: `max_sum = max(___, window_sum)`, answer: "max_sum" },
        { line: `if freq[nums[left]] == 0: del freq[nums[___]]`, answer: "left" },
      ],
    },

    {
      id: "longest-substring-no-repeat",
      title: "Longest Substring Without Repeating Characters",
      difficulty: "medium",
      prompt:
        "Given a string s, find the length of the longest substring without repeating characters.",
      patternKeywords: ["substring", "no repeating characters", "longest", "frequency map"],
      solution: `def length_of_longest_substring(s):
    freq = {}
    left = 0
    max_len = 0
    for right in range(len(s)):
        freq[s[right]] = freq.get(s[right], 0) + 1
        while freq[s[right]] > 1:
            freq[s[left]] -= 1
            if freq[s[left]] == 0:
                del freq[s[left]]
            left += 1
        max_len = max(max_len, right - left + 1)
    return max_len`,
      solutionExplanation: [
        "I use a frequency map to track character counts in the current window. I use dict.get(key, 0) instead of defaultdict here — it's a clean one-liner that avoids importing anything.",
        "Every time I add a character, I check if its count exceeded 1. If so, the window has a duplicate and is invalid. I shrink from the left until the duplicate is resolved — this is the variable-size shrink loop.",
        "The shrink loop removes characters from the left one by one until the newly added character's count drops back to 1. The window is now the longest valid window ending at right.",
        "After shrinking, the window is valid. I record its size. Because I only record after the window is valid, max_len always reflects the best valid window seen so far.",
      ],
      testCase: {
        input: `s = "abcabcbb"`,
        expected: "3",
        trace: [
          `right=0  add 'a'  window="a"      freq={a:1}        no dup  len=1  max=1`,
          `right=1  add 'b'  window="ab"     freq={a:1,b:1}    no dup  len=2  max=2`,
          `right=2  add 'c'  window="abc"    freq={a:1,b:1,c:1} no dup  len=3  max=3`,
          `right=3  add 'a'  freq={a:2,...}  DUP → shrink: remove s[0]='a'  freq={a:1,b:1,c:1}  left→1`,
          `window="bca"  no dup  len=3  max=3`,
          `right=4  add 'b'  freq={...,b:2}  DUP → shrink: remove s[1]='b'  freq={a:1,b:1,c:1}  left→2`,
          `window="cab"  no dup  len=3  max=3`,
          `right=5  add 'c'  freq={...,c:2}  DUP → shrink: remove s[2]='c'  freq={a:1,b:1,c:1}  left→3`,
          `window="abc"  no dup  len=3  max=3`,
          `right=6  add 'b'  freq={...,b:2}  DUP → shrink: remove s[3]='a', then 'b'  left→5`,
          `window="cb"  no dup  len=2  max=3`,
          `right=7  add 'b'  freq={c:1,b:2}  DUP → shrink: remove s[5]='b'  left→6`,
          `window="b"  no dup  len=1  max=3`,
          "return 3",
        ],
        traceExplanations: [
          "Window grows cleanly — all unique characters so far.",
          "Still no duplicates. Window extends.",
          "Window 'abc' is three unique chars. This is our first candidate for max length.",
          "Adding 'a' creates a duplicate. The window [a,b,c,a] is invalid. We shrink from the left, removing the first 'a'. Left advances past it — now the window is valid again.",
          "Window 'bca' is also length 3, all unique. Max stays at 3.",
          "Adding 'b' duplicates again. We remove 'b' from the left. Window becomes 'cab' — length 3, still tied for max.",
          "Window 'cab'. Consistent length 3 across multiple positions — this is the answer.",
          "Adding 'c' causes another duplicate. Remove the 'c' at left. Window slides to 'abc' again.",
          "We keep finding windows of length 3 but never exceeding it.",
          "Adding 'b' at index 6. Need to shrink past the 'a' first (it's not the duplicate but it's in the way), then the old 'b'. Left jumps to 5.",
          "Window down to 'cb', length 2.",
          "Last 'b' at the end. Causes duplicate — shrink past the previous 'b'. Window is just 'b', length 1.",
          "Best window was length 3, seen multiple times. Could be 'abc', 'bca', 'cab', or 'abc' again.",
        ],
      },
      blanks: [
        { line: `freq[s[right]] = freq.get(s[right], ___) + 1`, answer: "0" },
        { line: `while freq[s[right]] > ___:`, answer: "1" },
        { line: `freq[s[left]] -= ___`, answer: "1" },
        { line: `left += ___`, answer: "1" },
        { line: `max_len = max(max_len, right - left + ___)`, answer: "1" },
      ],
    },

    {
      id: "longest-repeating-replacement",
      title: "Longest Repeating Character Replacement",
      difficulty: "medium",
      prompt:
        "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times. Return the length of the longest substring containing the same letter you can get after performing the above operations.",
      patternKeywords: ["at most k replacements", "longest window", "dominant character", "max frequency"],
      solution: `def character_replacement(s, k):
    freq = {}
    left = 0
    max_freq = 0
    max_len = 0
    for right in range(len(s)):
        freq[s[right]] = freq.get(s[right], 0) + 1
        max_freq = max(max_freq, freq[s[right]])
        while (right - left + 1) - max_freq > k:
            freq[s[left]] -= 1
            left += 1
        max_len = max(max_len, right - left + 1)
    return max_len`,
      solutionExplanation: [
        "I maintain a frequency map and track max_freq — the count of the most common character in the current window. The key formula is: (window_size - max_freq) = number of characters that are NOT the dominant character, which equals the number of replacements needed to make them all match.",
        "I update max_freq each time a character is added. Note that I never decrease max_freq even when shrinking the window — this is a deliberate optimization. We only care about windows at least as large as the best we've already found, so a lower max_freq would never produce a longer valid window.",
        "The validity check: if (window_size - max_freq) > k, we need more replacements than allowed. Shrink from the left. I don't delete zero-frequency keys here — the max_freq optimization makes it unnecessary.",
        "After potentially shrinking, the window is valid. Record its size. Because we only shrink by one when invalid, the window size never decreases — it either stays the same or grows, which is why this finds the maximum efficiently.",
      ],
      testCase: {
        input: `s = "AABABBA", k = 1`,
        expected: "4",
        trace: [
          `right=0  add 'A'  window="A"       freq={A:1}       max_freq=1  size=1  replacements=0 ≤1 ✓  max_len=1`,
          `right=1  add 'A'  window="AA"      freq={A:2}       max_freq=2  size=2  replacements=0 ≤1 ✓  max_len=2`,
          `right=2  add 'B'  window="AAB"     freq={A:2,B:1}   max_freq=2  size=3  replacements=1 ≤1 ✓  max_len=3`,
          `right=3  add 'A'  window="AABA"    freq={A:3,B:1}   max_freq=3  size=4  replacements=1 ≤1 ✓  max_len=4`,
          `right=4  add 'B'  window="AABAB"   freq={A:3,B:2}   max_freq=3  size=5  replacements=2 >1 ✗  shrink: remove A  left→1`,
          `window="ABAB"   freq={A:2,B:2}   max_freq=3(stale)  size=4  replacements=4-3=1 ≤1 ✓  max_len=4`,
          `right=5  add 'B'  window="ABABB"  freq={A:2,B:3}   max_freq=3  size=5  replacements=2 >1 ✗  shrink: remove A  left→2`,
          `window="BABB"   freq={A:1,B:3}   max_freq=3  size=4  replacements=1 ≤1 ✓  max_len=4`,
          `right=6  add 'A'  window="BABBA"  freq={A:2,B:3}   max_freq=3  size=5  replacements=2 >1 ✗  shrink: remove B  left→3`,
          `window="ABBA"   freq={A:2,B:2}   max_freq=3(stale)  size=4  replacements=1 ≤1 ✓  max_len=4`,
          "return 4",
        ],
        traceExplanations: [
          "Single character. Zero replacements needed. Window valid.",
          "Two As. Still zero replacements needed. Window grows.",
          "Added B. We have 2 As and need 1 replacement to unify. 1 ≤ k=1, so the window is valid. Length 3.",
          "Added another A. Now 3 As, 1 B. Still only 1 replacement needed. Window valid at length 4. This is our first candidate for the answer.",
          "Added B. Now 3 As, 2 Bs. Need 2 replacements but k=1. Invalid. Shrink by removing the leftmost 'A'. Window becomes 'ABAB'.",
          "After shrink, max_freq is stale at 3 (we didn't recompute it), but window size is 4 and 4-3=1 ≤ k. The stale max_freq works in our favor — it means we only shrink when absolutely necessary, never over-shrinking.",
          "Added another B. Window size 5, replacements needed = 5-3=2 > 1. Shrink again — remove left 'A'. Window becomes 'BABB'.",
          "Now 1 A and 3 Bs. Need 1 replacement. Valid. Length 4 again — max unchanged.",
          "Added final 'A'. Window 'BABBA', size 5, replacements = 5-3=2 > 1. Shrink: remove leftmost 'B'. Window becomes 'ABBA'.",
          "After shrink: 2 As, 2 Bs. max_freq still stale at 3. 4-3=1 ≤ k. Valid. Length 4.",
          "Best window was length 4, seen at multiple positions. For example 'AABA' — replace the B to get 'AAAA'.",
        ],
      },
      blanks: [
        { line: `freq[s[right]] = freq.get(s[right], ___) + 1`, answer: "0" },
        { line: `max_freq = max(___, freq[s[right]])`, answer: "max_freq" },
        { line: `while (right - left + 1) - max_freq > ___:`, answer: "k" },
        { line: `freq[s[left]] -= ___`, answer: "1" },
        { line: `left += ___`, answer: "1" },
        { line: `max_len = max(max_len, right - ___ + 1)`, answer: "left" },
      ],
    },
  ],
}
