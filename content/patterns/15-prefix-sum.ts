import { Pattern } from "../types"

export const prefixSum: Pattern = {
  id: "prefix-sum",
  order: 15,
  patternName: "Prefix Sum",

  philosophy: {
    text: "By learning you will teach; by teaching you will learn.",
    source: "Latin proverb",
    connection:
      "Prefix sum precomputes knowledge so future queries are instant. The work done upfront pays dividends for every subsequent query — preparation enables speed. Just as teaching forces deeper understanding, building the prefix array forces you to encode all future answers in advance.",
  },

  template: {
    description:
      "Precompute cumulative sums so any subarray sum query is answered in O(1). Range sum [i, j] = prefix[j+1] - prefix[i].",
    snippet: `# Build
prefix = [0] * (len(nums) + 1)
for i, x in enumerate(nums):
    prefix[i + 1] = prefix[i] + x

# Query: sum of nums[left..right] inclusive
range_sum = prefix[right + 1] - prefix[left]`,
  },

  pythonTools: [
    {
      name: "itertools.accumulate",
      snippet: `from itertools import accumulate
prefix = [0] + list(accumulate(nums))  # prefix[0]=0, prefix[i]=sum of first i elements`,
    },
    {
      name: "Running sum + hashmap for subarray problems",
      snippet: `seen = {0: 1}  # running_sum → count of times seen
running = 0
for x in nums:
    running += x
    # check seen for target`,
    },
    {
      name: "Range sum query with prefix array",
      snippet: `# sum of nums[left..right] inclusive:
prefix[right + 1] - prefix[left]`,
    },
  ],

  problems: [
    {
      id: "subarray-sum-equals-k",
      title: "Subarray Sum Equals K",
      difficulty: "medium",
      prompt:
        "Given an array of integers nums and an integer k, return the total number of subarrays whose sum equals k.",
      patternKeywords: ["subarray sum", "count subarrays", "running sum", "hashmap", "complement"],
      solution: `from collections import defaultdict
count = 0
running_sum = 0
seen = defaultdict(int)
seen[0] = 1
for num in nums:
    running_sum += num
    count += seen[running_sum - k]
    seen[running_sum] += 1
return count`,
      solutionExplanation: [
        "I maintain a running sum as I scan left to right. At each position, running_sum is the sum from index 0 to here.",
        "I want to know: how many times has (running_sum - k) appeared as a running sum before? If running_sum_at_j - running_sum_at_i == k, then the subarray from i+1 to j sums to k. The hashmap seen stores exactly those previous running sums.",
        "I initialize seen[0] = 1 to handle subarrays that start from index 0 — if running_sum itself equals k, then running_sum - k = 0, and we need to count it.",
        "This is O(n) time and O(n) space — one pass with a hashmap.",
      ],
      testCase: {
        input: "nums = [1, 1, 1], k = 2",
        expected: "2",
        trace: [
          "seen={0:1}, running=0, count=0",
          "num=1: running=1, count+=seen[1-2]=seen[-1]=0, seen={0:1,1:1}",
          "num=1: running=2, count+=seen[2-2]=seen[0]=1 → count=1, seen={0:1,1:2}",
          "num=1: running=3, count+=seen[3-2]=seen[1]=2 → count=3... wait, seen[1]=1 at this point",
          "num=1: running=3, count+=seen[1]=1 → count=2, seen={0:1,1:2,2:1,3:1}",
        ],
        traceExplanations: [
          "We start with seen[0]=1 to account for subarrays beginning at index 0.",
          "After first element, running_sum=1. We check seen[-1]=0. No subarray ending here sums to 2.",
          "After second element, running_sum=2. We check seen[0]=1. There was one prefix with sum 0 (the empty prefix), so nums[0..1]=[1,1] sums to 2. count=1.",
          "After third element, running_sum=3. We check seen[1]=1. There was one prefix with sum 1 (just nums[0]), so nums[1..2]=[1,1] sums to 2. count=2.",
          "Final answer is 2: subarrays [1,1] at positions 0–1 and 1–2 both sum to k=2.",
        ],
      },
      blanks: [
        {
          line: "seen[___] = 1",
          answer: "0",
        },
        {
          line: "count += seen[running_sum - ___]",
          answer: "k",
        },
        {
          line: "seen[___] += 1",
          answer: "running_sum",
        },
      ],
    },
    {
      id: "count-vowels-substrings",
      title: "Count Vowels in Substrings",
      difficulty: "medium",
      prompt:
        "Given a string word, return the sum of the number of vowels in every substring of word. A vowel is one of 'a', 'e', 'i', 'o', 'u'.",
      patternKeywords: ["count vowels", "substrings", "prefix sum", "contribution"],
      solution: `vowels = set('aeiou')
n = len(word)
prefix = [0] * (n + 1)
for i in range(n):
    prefix[i + 1] = prefix[i] + (1 if word[i] in vowels else 0)

total = 0
for i in range(n):
    for j in range(i, n):
        total += prefix[j + 1] - prefix[i]
return total`,
      solutionExplanation: [
        "I build a prefix sum array where prefix[i] is the number of vowels in word[0..i-1]. This lets me answer 'how many vowels in word[i..j]?' in O(1) as prefix[j+1] - prefix[i].",
        "I then iterate over all (i, j) pairs to sum up vowel counts for every substring. With prefix sums, each query is O(1), so the total is O(n²) rather than O(n³).",
        "An even cleverer O(n) approach uses contribution counting: vowel at position i contributes to (i+1) * (n-i) substrings. But the prefix sum approach demonstrates the pattern cleanly.",
      ],
      testCase: {
        input: 'word = "aba"',
        expected: "6",
        trace: [
          "prefix = [0, 1, 1, 2]  (a=vowel, b=not, a=vowel)",
          'substrings: "a"→1, "ab"→1, "aba"→2, "b"→0, "ba"→1, "a"→1',
          "total = 1+1+2+0+1+1 = 6",
        ],
        traceExplanations: [
          "prefix[1]=1 because word[0]='a' is a vowel. prefix[2]=1 because word[1]='b' is not. prefix[3]=2 because word[2]='a' adds one more.",
          "For each substring we compute prefix[j+1]-prefix[i]. For 'aba' (i=0,j=2): prefix[3]-prefix[0]=2-0=2 vowels.",
          "Summing all 6 substrings gives 6.",
        ],
      },
      blanks: [
        {
          line: "prefix[i + 1] = prefix[i] + (1 if word[i] in ___ else 0)",
          answer: "vowels",
        },
        {
          line: "total += prefix[___ + 1] - prefix[___]",
          answer: "j + 1] - prefix[i",
        },
      ],
    },
    {
      id: "range-sum-query",
      title: "Range Sum Query — Immutable",
      difficulty: "easy",
      prompt:
        "Given an integer array nums, handle multiple queries of the form sumRange(left, right) which returns the sum of the elements of nums between indices left and right inclusive. Implement the NumArray class with a constructor that takes nums and a sumRange method.",
      patternKeywords: ["range sum", "immutable", "precompute", "O(1) query"],
      solution: `class NumArray:
    def __init__(self, nums: list[int]):
        self.prefix = [0] * (len(nums) + 1)
        for i, x in enumerate(nums):
            self.prefix[i + 1] = self.prefix[i] + x

    def sumRange(self, left: int, right: int) -> int:
        return self.prefix[right + 1] - self.prefix[left]`,
      solutionExplanation: [
        "In the constructor, I precompute prefix sums. prefix[i] holds the sum of all elements from index 0 up to index i-1. I make the array one element longer than nums to avoid off-by-one handling — prefix[0] = 0 always.",
        "For any query sumRange(left, right), I return prefix[right+1] - prefix[left]. This works because prefix[right+1] includes all elements 0..right, and subtracting prefix[left] removes all elements 0..left-1, leaving exactly the sum of elements left..right.",
        "Construction is O(n), each query is O(1). This is the canonical use case for prefix sums.",
      ],
      testCase: {
        input: "nums = [-2, 0, 3, -5, 2, -1], sumRange(0,2), sumRange(2,5), sumRange(0,5)",
        expected: "1, -1, -3",
        trace: [
          "prefix = [0, -2, -2, 1, -4, -2, -3]",
          "sumRange(0,2): prefix[3]-prefix[0] = 1-0 = 1",
          "sumRange(2,5): prefix[6]-prefix[2] = -3-(-2) = -1",
          "sumRange(0,5): prefix[6]-prefix[0] = -3-0 = -3",
        ],
        traceExplanations: [
          "prefix[i+1] = prefix[i] + nums[i]. So prefix[1]=-2, prefix[2]=-2+0=-2, prefix[3]=-2+3=1, and so on.",
          "Sum of nums[0..2] = -2+0+3 = 1. prefix[3]-prefix[0] = 1-0 = 1. Correct.",
          "Sum of nums[2..5] = 3+(-5)+2+(-1) = -1. prefix[6]-prefix[2] = -3-(-2) = -1. Correct.",
          "Sum of entire array = -2+0+3-5+2-1 = -3. prefix[6]-prefix[0] = -3-0 = -3. Correct.",
        ],
      },
      blanks: [
        {
          line: "self.prefix[i + 1] = self.prefix[i] + ___",
          answer: "x",
        },
        {
          line: "return self.prefix[___ + 1] - self.prefix[___]",
          answer: "right + 1] - self.prefix[left",
        },
      ],
    },
  ],
}
