import { Pattern } from "../types"

export const twoPointers: Pattern = {
  id: "two-pointers",
  order: 1,
  patternName: "Two Pointers",

  philosophy: {
    text: "Let right deeds be thy motive, not the fruit which comes from them.",
    source: "Bhagavad Gita, Ch. 2 v.47",
    connection:
      "The pointers don't know the answer — they just follow the rule. Move toward the center, trust the process. The solution emerges from right action, not from chasing the result.",
  },

  template: {
    description:
      "Two indices walking toward each other on a sorted structure. Eliminates O(n²) by never backtracking — each pointer moves exactly once.",
    snippet: `left, right = 0, len(arr) - 1
while left < right:
    if <move left>:
        left += 1
    elif <move right>:
        right -= 1
    else:
        # found / record answer`,
  },

  pythonTools: [
    {
      name: "Clean alphanumeric input in one line",
      snippet: `s = [c.lower() for c in s if c.isalnum()]`,
    },
    {
      name: "Swap in place, no temp variable",
      snippet: `arr[left], arr[right] = arr[right], arr[left]`,
    },
    {
      name: "Sort first when input isn't guaranteed sorted",
      snippet: `arr.sort()  # O(n log n) — then apply two pointer template`,
    },
  ],

  problems: [
    {
      id: "valid-palindrome",
      title: "Valid Palindrome",
      difficulty: "easy",
      prompt:
        "A phrase is a palindrome if, after converting all uppercase letters to lowercase and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string s, return true if it is a palindrome, or false otherwise.",
      patternKeywords: ["symmetric", "forward and backward", "same from both ends"],
      solution: `s = [c.lower() for c in s if c.isalnum()]
left, right = 0, len(s) - 1
while left < right:
    if s[left] != s[right]:
        return False
    left += 1
    right -= 1
return True`,
      solutionExplanation: [
        "First I clean the input — lowercase everything and strip out anything that isn't a letter or digit. This gives me a pure sequence to compare.",
        "I place one pointer at the start and one at the end. Since a palindrome is symmetric, these two positions should always match.",
        "I run the loop as long as the pointers haven't crossed — once they meet in the middle, every pair has been checked.",
        "If the characters at left and right don't match, I can immediately return false. No need to continue — the symmetry is already broken.",
        "If they match, I move both pointers one step inward and check the next pair.",
        "If I make it through the entire loop without returning false, every pair matched — it's a palindrome.",
      ],
      testCase: {
        input: `s = "A man, a plan, a canal: Panama"`,
        expected: "True",
        trace: [
          `clean → "amanaplanacanalpanama"`,
          "left=0  (a)   right=19 (a)  ✓  match",
          "left=1  (m)   right=18 (m)  ✓  match",
          "left=2  (a)   right=17 (a)  ✓  match",
          "left=3  (n)   right=16 (n)  ✓  match",
          "left=4  (a)   right=15 (a)  ✓  match",
          "... all pairs match ...",
          "left=10 right=10  pointers meet → loop ends",
          "return True",
        ],
        traceExplanations: [
          "Cleaning first so we're only comparing meaningful characters — spaces and punctuation would give false negatives.",
          "Widest possible window first. If the outermost characters match, we've confirmed one pair of symmetry.",
          "Still matching — we're converging inward, confirming symmetry layer by layer.",
          "Every layer we confirm, we're one step closer to the center. Each match is a proof of symmetry.",
          "Still converging. Notice we never go backwards — each pointer only moves once per iteration.",
          "We're past the halfway point — the pointers are now checking the inner half.",
          "Every pair confirmed. The string is perfectly symmetric.",
          "When left and right meet, there's nothing left to compare. Every pair has been verified.",
          "No mismatch was ever found — return true.",
        ],
      },
      blanks: [
        { line: `s = [c.lower() for c in s if c.___()]`, answer: "isalnum" },
        { line: `left, right = ___, len(s) - 1`, answer: "0" },
        { line: `while left ___ right:`, answer: "<" },
        { line: `if s[left] ___ s[right]:`, answer: "!=" },
        { line: `left ___ 1`, answer: "+=" },
        { line: `right ___ 1`, answer: "-=" },
      ],
    },

    {
      id: "two-sum-ii",
      title: "Two Sum II — Input Array Is Sorted",
      difficulty: "medium",
      prompt:
        "Given a 1-indexed array of integers that is already sorted in non-decreasing order, find two numbers that add up to a specific target. Return their indices (1-indexed). You may not use the same element twice. There is exactly one solution. Use only O(1) extra space.",
      patternKeywords: ["sorted array", "pair", "target sum", "O(1) space"],
      solution: `left, right = 0, len(numbers) - 1
while left < right:
    s = numbers[left] + numbers[right]
    if s == target:
        return [left + 1, right + 1]
    elif s < target:
        left += 1
    else:
        right -= 1`,
      solutionExplanation: [
        "I start with the widest possible window — leftmost and rightmost elements. This gives me the full range to work with.",
        "I sum the two values the pointers are pointing at. This is the candidate answer for this window.",
        "If the sum matches the target exactly, I've found the pair. I add 1 to each index because the problem asks for 1-indexed positions.",
        "If the sum is too small, I need a larger value. Since the array is sorted, moving left rightward is the only way to increase the sum without touching right.",
        "If the sum is too large, I need a smaller value. Moving right leftward decreases the sum. The sorted order guarantees this is the right move.",
      ],
      testCase: {
        input: `numbers = [2, 7, 11, 15], target = 9`,
        expected: "[1, 2]",
        trace: [
          "left=0 (2)   right=3 (15)  sum=17  17 > 9 → move right inward",
          "left=0 (2)   right=2 (11)  sum=13  13 > 9 → move right inward",
          "left=0 (2)   right=1 (7)   sum=9   9 == 9 ✓",
          "return [1, 2]",
        ],
        traceExplanations: [
          "Sum is too big. Right pointer is at 15 — the largest value. I move it inward to reduce the sum. Left stays because 2 is already our smallest candidate.",
          "Still too big. Right is now at 11. Moving inward again — each step I'm eliminating the current largest from consideration.",
          "Exact match. Left is at index 0, right is at index 1. Both pointers moved a total of 3 times combined — far better than the O(n²) brute force.",
          "Problem is 1-indexed so I add 1 to each index before returning.",
        ],
      },
      blanks: [
        { line: `left, right = ___, len(numbers) - 1`, answer: "0" },
        { line: `s = numbers[___] + numbers[___]`, answer: "left, right" },
        { line: `if s == target: return [left + ___, right + ___]`, answer: "1, 1" },
        { line: `elif s < target: ___ += 1`, answer: "left" },
        { line: `else: ___ -= 1`, answer: "right" },
      ],
    },

    {
      id: "container-with-most-water",
      title: "Container With Most Water",
      difficulty: "medium",
      prompt:
        "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container that holds the most water. Return the maximum amount of water a container can store.",
      patternKeywords: ["maximize area", "two boundaries", "width shrinks as you move inward"],
      solution: `left, right = 0, len(height) - 1
max_water = 0
while left < right:
    water = min(height[left], height[right]) * (right - left)
    max_water = max(max_water, water)
    if height[left] < height[right]:
        left += 1
    else:
        right -= 1
return max_water`,
      solutionExplanation: [
        "I start at the widest possible container — outermost walls. Width can only decrease from here, so I need to find height gains that compensate.",
        "I track the best area seen so far. Every iteration is a candidate.",
        "Area is width times height. Width is the distance between the two pointers. Height is capped by the shorter wall — water spills over anything shorter.",
        "I update the running maximum. I'm not stopping early because a wider container with short walls might still lose to a narrower one with tall walls.",
        "The shorter wall is the bottleneck — it's capping the height. Moving the shorter wall inward is the only move that could possibly find a better container. Moving the taller wall inward would only make things worse.",
        "Same logic — move the shorter wall. If they're equal, either move works.",
        "Return the best area found across all windows.",
      ],
      testCase: {
        input: `height = [1, 8, 6, 2, 5, 4, 8, 3, 7]`,
        expected: "49",
        trace: [
          "left=0 (h=1)  right=8 (h=7)  width=8  area=min(1,7)*8=8    left is shorter → move left",
          "left=1 (h=8)  right=8 (h=7)  width=7  area=min(8,7)*7=49   right is shorter → move right",
          "left=1 (h=8)  right=7 (h=3)  width=6  area=min(8,3)*6=18   right is shorter → move right",
          "left=1 (h=8)  right=6 (h=8)  width=5  area=min(8,8)*5=40   equal → move right",
          "left=1 (h=8)  right=5 (h=4)  width=4  area=min(8,4)*4=16   right is shorter → move right",
          "left=1 (h=8)  right=4 (h=5)  width=3  area=min(8,5)*3=15   right is shorter → move right",
          "left=1 (h=8)  right=3 (h=2)  width=2  area=min(8,2)*2=4    right is shorter → move right",
          "left=1 (h=8)  right=2 (h=6)  width=1  area=min(8,6)*1=6    right is shorter → move right",
          "left=1  right=1  left >= right → loop ends",
          "return 49",
        ],
        traceExplanations: [
          "Wall of height 1 on the left is capping us badly. Even though width is 8, the short wall kills the area. Only chance to improve is to move past this short wall.",
          "Now we have two tall walls — 8 and 7. Width shrank to 7 but height jumped to 7. This is our best area: 49. Right wall at 7 is shorter, so move right inward.",
          "Right dropped to height 3 — a big loss. Area falls to 18. Keep moving the shorter wall.",
          "Two walls of equal height 8. Area is 40 — good but not better than 49. Equal walls: move either, convention says move right.",
          "Right dropped to 4. Area 16. Keep eliminating shorter walls.",
          "Right at 5, area 15. The left wall at 8 is dominant — we keep moving right inward.",
          "Right at 2, almost nothing. The wide separation is gone and height is low.",
          "Last valid window before pointers meet. Width is 1, area is 6.",
          "Pointers have crossed — all windows exhausted.",
          "49 was the best we found — at left=1, right=8.",
        ],
      },
      blanks: [
        { line: `left, right = ___, len(height) - 1`, answer: "0" },
        { line: `water = min(height[left], height[right]) * (___ - ___)`, answer: "right, left" },
        { line: `max_water = max(___, water)`, answer: "max_water" },
        { line: `if height[left] ___ height[right]:`, answer: "<" },
        { line: `___ += 1`, answer: "left" },
        { line: `___ -= 1`, answer: "right" },
      ],
    },
  ],
}
