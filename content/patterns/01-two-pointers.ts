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
        "First I clean the input — lowercase everything and strip out anything that isn't a letter or digit. The expression [c.lower() for c in s if c.isalnum()] is a Python list comprehension that performs two operations on a string s:",
        "Filters: It iterates through every character c in the string s and keeps only those where c.isalnum() is True (alphanumeric characters: letters and numbers). Transforms: For each kept character, it converts it to lowercase using c.lower()This gives me a pure sequence to compare. I use a list comprehension here instead of a for-loop that builds a list manually, because it's a single expression — more readable, and Python can optimize the construction slightly better for simple filters like this.",
        "The choice between a for loop and a while loop depends entirely on whether you know the number of iterations in advance",
        "I place one pointer at the start and one at the end. Since a palindrome is symmetric, these two positions should always match. I use a while loop instead of a for loop because the termination condition is dynamic — both pointers move inward but the loop ends when they meet, not after a fixed number of steps, so I need a condition check at each iteration rather than a fixed range.",
        "If the characters at left and right don't match, I can immediately return False. No need to continue — the symmetry is already broken. Returning early here avoids scanning the rest of the string pointlessly.",
        "If they match, I move both pointers one step inward using `+= 1` and `-= 1` on separate lines rather than a tuple assignment — both are equivalent here, but the separate lines make the intent clear: left moves right, right moves left.",
        "If I make it through the entire loop without returning False, every pair matched — it's a palindrome. I return True at the function level rather than inside the loop so this only executes once all pairs are confirmed.",
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
        "I start with the widest possible window — leftmost and rightmost elements. This gives me the full range to work with. I use a while loop instead of a for loop because the termination condition is dynamic — the two pointers move at different rates depending on what we find at each step, so I need a condition check rather than a fixed iteration count.",
        "I sum the two values the pointers point at and store the result in a local variable `s`. This is the candidate answer for this window — computing it once and reusing it avoids recalculating in each branch of the if-elif-else.",
        "If the sum matches the target exactly, I've found the pair. I return `[left + 1, right + 1]` as a list literal rather than a tuple because the problem specifies a list return — and the `+ 1` offset is applied inline rather than in a separate step to keep the return concise.",
        "If the sum is too small, I need a larger value. Since the array is sorted, moving left rightward is the only way to increase the sum without touching right. I use `left += 1` rather than reassigning `left = left + 1` — the augmented assignment is idiomatic Python and makes the directional intent obvious.",
        "If the sum is too large, I need a smaller value. Moving right leftward decreases the sum — the sorted order guarantees this is the only correct move. I use `right -= 1` for the same reason: augmented assignment is cleaner and signals 'shrink from the right'.",
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
        "I start at the widest possible container — outermost walls. Width can only decrease from here, so I need to find height gains that compensate. I use a while loop instead of a for loop because both pointers move independently toward each other — neither has a fixed step size, so a condition-based loop is the right tool.",
        "I initialize `max_water = 0` as a plain integer rather than using `float('-inf')` — because area is always non-negative here, 0 is a safe and semantically clear starting value.",
        "Area is width times height. I use `min(height[left], height[right])` rather than an if-else to select the shorter wall — `min()` is a single expression that communicates 'the bottleneck' directly. Width is `right - left`, the distance between the two pointers.",
        "I update the running maximum using `max(max_water, water)` rather than an if statement — `max()` as an expression assigned back to `max_water` is idiomatic Python and keeps the update to one line without a conditional branch.",
        "The shorter wall is the bottleneck — it's capping the height. Moving the shorter wall inward is the only move that could possibly find a better container. Moving the taller wall inward could only reduce width without any chance of increasing height, so that direction is provably suboptimal.",
        "If they're equal, either move works — the code falls into the `else` branch and moves right, which is a valid convention. The choice doesn't affect correctness.",
        "Return `max_water` — the best area found across all evaluated windows.",
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

    {
      id: "three-sum",
      title: "3Sum",
      difficulty: "medium",
      prompt:
        "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i, j, and k are all distinct indices and nums[i] + nums[j] + nums[k] == 0. The solution set must not contain duplicate triplets.",
      patternKeywords: ["triplets", "sum to zero", "unique combinations", "sorted"],
      solution: `nums.sort()
result = []
for i in range(len(nums) - 2):
    if i > 0 and nums[i] == nums[i - 1]:
        continue
    left, right = i + 1, len(nums) - 1
    while left < right:
        s = nums[i] + nums[left] + nums[right]
        if s == 0:
            result.append([nums[i], nums[left], nums[right]])
            while left < right and nums[left] == nums[left + 1]:
                left += 1
            while left < right and nums[right] == nums[right - 1]:
                right -= 1
            left += 1
            right -= 1
        elif s < 0:
            left += 1
        else:
            right -= 1
return result`,
      solutionExplanation: [
        "I sort the array first using `.sort()` — in-place, O(1) extra space — rather than `sorted()` which allocates a new list. Since we don't need to preserve the original order for this problem, in-place is the right call. Sorting is also what makes two pointers viable: it gives us directionality so that 'sum too small → move left rightward' and 'sum too large → move right leftward' are provably correct moves.",
        "I iterate over each element as the fixed anchor using a for loop with `range(len(nums) - 2)` — I stop at len-2 because I need at least two more elements to the right for the pair. A for loop is correct here because the anchor advances exactly one position per outer iteration — no conditional step size.",
        "Duplicate skip for the anchor: if `nums[i] == nums[i-1]`, this anchor value has already been explored fully. I check `i > 0` first to avoid an index-out-of-bounds on the first iteration — it's a guard condition, not the main check.",
        "For each fixed anchor, I initialize `left` and `right` for a fresh two-pointer search on the remaining subarray. I use a while loop here because the two inner pointers move at different rates depending on the sum — a for loop with a fixed range couldn't express the variable termination.",
        "When I find a valid triplet, I `append` it to `result` as a list literal `[nums[i], nums[left], nums[right]]` rather than a tuple — the problem asks for a list of lists, so I match the expected type exactly. Then I use inner while loops to skip adjacent duplicates on both sides before advancing the pointers, which is the deduplication step.",
        "If the sum is negative, the pair is too small — `left += 1` moves to a larger value. If positive, `right -= 1` moves to a smaller one. The sorted order guarantees these are the correct directions. Using `elif` rather than separate `if` checks is important: only one pointer should move per iteration.",
      ],
      testCase: {
        input: `nums = [-1, 0, 1, 2, -1, -4]`,
        expected: "[[-1, -1, 2], [-1, 0, 1]]",
        trace: [
          `sorted → [-4, -1, -1, 0, 1, 2]`,
          "i=0  anchor=-4  left=1(-1)  right=5(2)  sum=-3  too small → left++",
          "i=0  anchor=-4  left=2(-1)  right=5(2)  sum=-3  too small → left++",
          "i=0  anchor=-4  left=3(0)   right=5(2)  sum=-2  too small → left++",
          "i=0  anchor=-4  left=4(1)   right=5(2)  sum=-1  too small → left++",
          "i=0  left=5 >= right=5 → inner loop done",
          "i=1  anchor=-1  left=2(-1)  right=5(2)  sum=0   ✓ → append [-1,-1,2], skip dupes, left++ right--",
          "i=1  anchor=-1  left=3(0)   right=4(1)  sum=0   ✓ → append [-1,0,1],  skip dupes, left++ right--",
          "i=1  left=4 >= right=3 → inner loop done",
          "i=2  nums[2]==-1 == nums[1]==-1 → skip (duplicate anchor)",
          "i=3  anchor=0   left=4(1)   right=5(2)  sum=3   too large → right--",
          "i=3  left=4 >= right=4 → inner loop done",
          `return [[-1,-1,2], [-1,0,1]]`,
        ],
        traceExplanations: [
          "Sorting first groups duplicates together and enables the two-pointer logic. Now we know: moving left right increases sum, moving right left decreases it.",
          "Anchor is -4. To hit zero we'd need a pair summing to 4, but max pair here is -1+2=1. Every step confirms we can't get there — left keeps moving right.",
          "Left is now at the second -1. Still sum -3. The anchor -4 is simply too negative to be rescued by any pair in this array.",
          "Left at 0. -4+0+2=-2. Still negative — the pair isn't large enough.",
          "Left at 1. -4+1+2=-1. Closest we got with this anchor but still negative. Left is now adjacent to right.",
          "Pointers crossed — anchor -4 exhausted. No valid triplet with -4 as the fixed element.",
          "Anchor -1 with left=-1 and right=2: sum is exactly 0. Record it. Then skip duplicate -1s on the left and duplicate 2s on the right before advancing both pointers.",
          "After dedup, left landed at 0 and right at 1: another zero sum. Record [-1,0,1]. Advance both — loop ends next check.",
          "Pointers met — anchor -1 fully explored. Two triplets found.",
          "This anchor is also -1. Since we already processed -1 fully in the previous iteration, skipping it prevents exact duplicate triplets in the output.",
          "Anchor 0. Need pair summing to 0. Try 1+2=3, too large — move right inward.",
          "Right moved to index 4 (value 1) but left is also 4 — crossed. No valid pair for anchor 0.",
          "Final deduplicated result. Each unique triplet appears exactly once.",
        ],
      },
      blanks: [
        { line: `if i > 0 and nums[i] == nums[___ - 1]:`, answer: "i" },
        { line: `left, right = i + ___, len(nums) - 1`, answer: "1" },
        { line: `s = nums[i] + nums[___] + nums[___]`, answer: "left, right" },
        { line: `while left < right and nums[left] == nums[left + ___]:`, answer: "1" },
        { line: `elif s < 0: ___ += 1`, answer: "left" },
        { line: `else: ___ -= 1`, answer: "right" },
      ],
    },

    {
      id: "valid-triangle-number",
      title: "Valid Triangle Number",
      difficulty: "medium",
      prompt:
        "Given an integer array nums, return the number of triplets chosen from the array that can make triangles if we take them as side lengths. A valid triangle requires that the sum of any two sides must be greater than the third side.",
      patternKeywords: ["triangle inequality", "count triplets", "sorted sides", "longest side"],
      solution: `nums.sort()
count = 0
for k in range(len(nums) - 1, 1, -1):
    left, right = 0, k - 1
    while left < right:
        if nums[left] + nums[right] > nums[k]:
            count += right - left
            right -= 1
        else:
            left += 1
return count`,
      solutionExplanation: [
        "I sort first using `.sort()` — in-place, O(1) extra space — rather than `sorted()` which would allocate a new list. The key insight after sorting: for a triple (a ≤ b ≤ c), only one inequality matters: a + b > c. The other two are automatically satisfied because c is the largest. This reduces a 3-condition check to one.",
        "I fix the largest side using `k` as the outer loop variable, iterating backward with `range(len(nums) - 1, 1, -1)`. I use a for loop for the outer iteration because `k` always advances by exactly one position — unlike the inner two pointers which move conditionally. Starting from the right ensures the fixed element is always the true maximum of the triple.",
        "If `nums[left] + nums[right] > nums[k]`, then every value between left and right-1 also satisfies the inequality with `right` (since the array is sorted and all those values are ≥ nums[left]). So I count `right - left` valid triangles in one step rather than iterating through them — this is the O(n²) speedup over the naïve O(n³) approach.",
        "After bulk-counting, I move `right` inward with `right -= 1` to try the next candidate for the second-largest side. I don't need to reset `left` — valid pairs from the previous `right` are still valid candidates for the new, smaller `right`.",
        "If the sum is too small, `nums[left]` is the bottleneck — it's the smaller of the two remaining sides. Moving `left` rightward with `left += 1` is the only way to increase the sum, because `right` is already as large as it can be for this inner loop.",
      ],
      testCase: {
        input: `nums = [2, 2, 3, 4]`,
        expected: "3",
        trace: [
          `sorted → [2, 2, 3, 4]`,
          "k=3  nums[k]=4  left=0(2)  right=2(3)  2+3=5 > 4  ✓  count += 2-0=2  right--",
          "k=3  nums[k]=4  left=0(2)  right=1(2)  2+2=4 > 4?  No  left++",
          "k=3  left=1 >= right=1 → done  count=2",
          "k=2  nums[k]=3  left=0(2)  right=1(2)  2+2=4 > 3  ✓  count += 1-0=1  right--",
          "k=2  left=0 >= right=0 → done  count=3",
          "return 3",
        ],
        traceExplanations: [
          "Sort so the rightmost of any triple is always the largest. Now only one inequality matters.",
          "Fixing largest side as 4. left=2, right=3: sum is 5 > 4. Because left=2 also satisfies this with right=3, we count both pairs (left,right) and (left+1 through right-1, right) at once — that's right-left=2 triangles. Move right left to try next candidate.",
          "Now right=2. sum 2+2=4 is NOT greater than 4 — triangle inequality is strict. Move left rightward to increase the sum.",
          "Pointers met — all pairs with largest side 4 explored. Found 2 valid triangles.",
          "Now fixing largest side as 3. left=2, right=2: sum 4 > 3. count += 1. Move right.",
          "Pointers met — all pairs with largest side 3 explored. Total count is 3.",
          "Three valid triplets: (2,3,4), (2,3,4) [second 2], and (2,2,3).",
        ],
      },
      blanks: [
        { line: `for k in range(len(nums) - 1, ___, -1):`, answer: "1" },
        { line: `left, right = 0, k - ___`, answer: "1" },
        { line: `if nums[left] + nums[right] ___ nums[k]:`, answer: ">" },
        { line: `count += right - ___`, answer: "left" },
        { line: `___ -= 1`, answer: "right" },
        { line: `else: ___ += 1`, answer: "left" },
      ],
    },

    {
      id: "move-zeroes",
      title: "Move Zeroes",
      difficulty: "easy",
      prompt:
        "Given an integer array nums, move all 0s to the end of it while maintaining the relative order of the non-zero elements. You must do this in-place without making a copy of the array.",
      patternKeywords: ["in-place", "relative order", "partition", "write pointer"],
      solution: `write = 0
for read in range(len(nums)):
    if nums[read] != 0:
        nums[write] = nums[read]
        write += 1
while write < len(nums):
    nums[write] = 0
    write += 1`,
      solutionExplanation: [
        "I use a `write` pointer initialized to 0 — a plain integer, not a list index object or sentinel. It tracks the next position to place a non-zero value and only advances when we've actually written something, so it always points at the first unfilled slot. I use a for loop for the read pointer — `for read in range(len(nums))` — because the read pointer advances exactly one step per element regardless of what it finds. Only the write pointer moves conditionally.",
        "Every time the read pointer finds a non-zero value, I copy it to `nums[write]` using direct index assignment rather than `list.append` or any other method — because the constraint is in-place with no extra list, I'm reusing the existing array slots. Non-zeros are compacted to the front in their original relative order because I copy them left-to-right without rearranging.",
        "After the read scan, everything from `write` to the end is leftover space from elements that were moved forward. I fill it with zeros using a second while loop — `while write < len(nums)` — rather than a slice assignment like `nums[write:] = [0] * (len(nums) - write)`, because the while loop is O(1) space and makes the fill logic explicit: advance `write` and zero each position one at a time.",
      ],
      testCase: {
        input: `nums = [0, 1, 0, 3, 12]`,
        expected: "[1, 3, 12, 0, 0]",
        trace: [
          "write=0  read=0  nums[0]=0    skip (zero)",
          "write=0  read=1  nums[1]=1    write: nums[0]=1   write→1",
          "write=1  read=2  nums[2]=0    skip (zero)",
          "write=1  read=3  nums[3]=3    write: nums[1]=3   write→2",
          "write=2  read=4  nums[4]=12   write: nums[2]=12  write→3",
          "array so far: [1, 3, 12, 3, 12]  (write=3, tail not yet zeroed)",
          "fill: nums[3]=0  nums[4]=0",
          "final: [1, 3, 12, 0, 0]",
        ],
        traceExplanations: [
          "Read hits a zero — write pointer stays put. We don't advance write because we haven't placed anything valid yet.",
          "Read hits 1 — a non-zero. We copy it to write position 0 (overwriting the zero there), then advance write. The 1 is now locked in at the front.",
          "Another zero — read advances, write stays. The gap accumulates.",
          "3 is non-zero — copy to write position 1. The relative order of 1 then 3 is preserved.",
          "12 is non-zero — copy to write position 2. All non-zeros are now packed to the front in original order.",
          "The tail of the array still has stale values from the original. Write pointer is at index 3, marking where zeros must start.",
          "Overwrite positions 3 and 4 with zeros. Simple fill loop.",
          "Non-zeros at front in original order, zeros at the back. In-place, O(n) time, O(1) space.",
        ],
      },
      blanks: [
        { line: `___ = 0`, answer: "write" },
        { line: `for read in range(len(___)):`, answer: "nums" },
        { line: `if nums[read] ___ 0:`, answer: "!=" },
        { line: `nums[___] = nums[read]`, answer: "write" },
        { line: `___ += 1`, answer: "write" },
        { line: `nums[write] = ___`, answer: "0" },
      ],
    },

    {
      id: "sort-colors",
      title: "Sort Colors",
      difficulty: "medium",
      prompt:
        "Given an array nums with n objects colored red, white, or blue (represented as 0, 1, and 2), sort them in-place so that objects of the same color are adjacent, with the colors in the order red (0), white (1), and blue (2). You must solve this without using the library sort function.",
      patternKeywords: ["three-way partition", "in-place sort", "Dutch National Flag", "three pointers"],
      solution: `low, mid, high = 0, 0, len(nums) - 1
while mid <= high:
    if nums[mid] == 0:
        nums[low], nums[mid] = nums[mid], nums[low]
        low += 1
        mid += 1
    elif nums[mid] == 1:
        mid += 1
    else:
        nums[mid], nums[high] = nums[high], nums[mid]
        high -= 1`,
      solutionExplanation: [
        "I initialize three pointers in one tuple assignment: `low, mid, high = 0, 0, len(nums) - 1`. This is idiomatic Python for multi-variable initialization — cleaner than three separate lines and makes the starting state of all three regions visible at once. The regions are: everything before `low` is confirmed 0s, `low` to `mid-1` is confirmed 1s, `mid` to `high` is unknown, after `high` is confirmed 2s. I start with the entire array unknown.",
        "I use a while loop with condition `mid <= high` — not `mid < high` — because when `mid == high` there's still one unknown element at that position that needs to be classified. The loop terminates when `mid` passes `high`, meaning the unknown region is empty.",
        "If `nums[mid] == 0`, I swap with `nums[low]` using Python's tuple swap — `nums[low], nums[mid] = nums[mid], nums[low]` — which is atomic: no temp variable needed, and there's no risk of reading a half-updated value. Both `low` and `mid` advance: `low` because the 0-region grew, `mid` because the element swapped in from `low` was a confirmed 1 (it was already in the 1s region), so `mid` can safely move past it.",
        "If `nums[mid] == 1`, it's already in the right region — just advance `mid` with `mid += 1` to shrink the unknown zone. No swap needed; the element is already where it belongs.",
        "If `nums[mid] == 2`, I swap with `nums[high]` — again using tuple swap — and shrink `high` with `high -= 1`. Critically, I do NOT advance `mid` here: the element just swapped in from `high` came from the unknown region and must be re-examined in the next iteration. Advancing `mid` here would silently skip it.",
      ],
      testCase: {
        input: `nums = [2, 0, 2, 1, 1, 0]`,
        expected: "[0, 0, 1, 1, 2, 2]",
        trace: [
          "low=0  mid=0  high=5  nums[mid]=2 → swap(mid,high)  arr=[0,0,2,1,1,2]  high--→4",
          "low=0  mid=0  high=4  nums[mid]=0 → swap(low,mid)   arr=[0,0,2,1,1,2]  low++→1  mid++→1",
          "low=1  mid=1  high=4  nums[mid]=0 → swap(low,mid)   arr=[0,0,2,1,1,2]  low++→2  mid++→2",
          "low=2  mid=2  high=4  nums[mid]=2 → swap(mid,high)  arr=[0,0,1,1,2,2]  high--→3",
          "low=2  mid=2  high=3  nums[mid]=1 → mid++→3",
          "low=2  mid=3  high=3  nums[mid]=1 → mid++→4",
          "mid=4 > high=3 → loop ends",
          "return [0, 0, 1, 1, 2, 2]",
        ],
        traceExplanations: [
          "mid points at 2. Swap with high — the 2 goes to its correct place at the end. We don't advance mid because the element just swapped in (0) is unknown and must be checked.",
          "mid now points at 0. Swap with low — the 0 goes to its correct place at the front. Both low and mid advance because we know the swapped-in element (which was already in the confirmed-1s zone) is a valid 1.",
          "mid still points at 0 (same value, different position). Same logic — swap to front, advance both. The 0s region at front grows.",
          "mid at 2 again. Swap with high — this time a 1 comes in from high. high shrinks. mid stays to re-examine the incoming 1.",
          "mid at 1. It's already in the right place — just advance mid to reduce unknown zone.",
          "mid at another 1. Same — advance mid.",
          "mid crossed high — no unknown elements remain. The three regions are fully partitioned.",
          "Sorted in one pass, O(1) space, without any comparison-based sort.",
        ],
      },
      blanks: [
        { line: `low, mid, high = 0, 0, len(nums) - ___`, answer: "1" },
        { line: `while mid ___ high:`, answer: "<=" },
        { line: `if nums[mid] == ___:`, answer: "0" },
        { line: `nums[low], nums[mid] = nums[___], nums[___]`, answer: "mid, low" },
        { line: `elif nums[mid] == ___: mid += 1`, answer: "1" },
        { line: `nums[mid], nums[high] = nums[___], nums[___]`, answer: "high, mid" },
        { line: `___ -= 1`, answer: "high" },
      ],
    },
  ],
}
