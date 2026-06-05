import { Pattern } from "../types"

export const stack: Pattern = {
  id: "stack",
  order: 4,
  patternName: "Stack",

  philosophy: {
    text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    source: "Buddha",
    connection:
      "The stack only knows what's immediately on top — it doesn't look back at what was popped or forward at what's coming. Every decision is made with the single element in front of you right now. That tunnel-vision focus is exactly what makes it powerful: defer the past onto the stack, and resolve it only when the present moment demands it.",
  },

  template: {
    description:
      "Use a stack when the solution requires remembering 'what came before' in a way that's LIFO — brackets, nested structures, or 'next greater element' problems. Monotonic stacks maintain a sorted invariant to answer range queries in O(n).",
    snippet: `# Basic stack
stack = []
for item in arr:
    stack.append(item)   # push
    top = stack[-1]      # peek
    stack.pop()          # pop

# Monotonic stack (increasing) — useful for "next greater element" problems
stack = []
for i, val in enumerate(arr):
    while stack and arr[stack[-1]] > val:
        stack.pop()
    stack.append(i)`,
  },

  pythonTools: [
    {
      name: "Peek without popping",
      snippet: "stack[-1]",
    },
    {
      name: "O(1) pop from top",
      snippet: "stack.pop()",
    },
    {
      name: "Monotonic stack pattern",
      snippet: "while stack and condition:\n    stack.pop()",
    },
  ],

  problems: [
    {
      id: "valid-parentheses",
      title: "Valid Parentheses",
      difficulty: "easy",
      prompt:
        "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
      patternKeywords: ["brackets", "matching", "balanced", "parentheses"],
      solution: `def is_valid(s: str) -> bool:
    stack = []
    matching = {')': '(', '}': '{', ']': '['}

    for ch in s:
        if ch in '({[':
            stack.append(ch)
        else:
            if not stack or stack[-1] != matching[ch]:
                return False
            stack.pop()

    return len(stack) == 0`,
      solutionExplanation: [
        "I'm using a stack because bracket matching is inherently LIFO — the most recently opened bracket must be the first one closed. A stack lets me remember the open bracket I'm waiting to close.",
        "I define a mapping from each closing bracket to its expected opener. When I see a closing bracket, I peek at the stack top — if it's the matching opener, we're good and I pop it. If it's wrong or the stack is empty, the string is invalid.",
        "At the end, if the stack is empty, every opener was matched. If there's anything left, we have unmatched openers — invalid.",
      ],
      testCase: {
        input: 's = "()[]{}"',
        expected: "true",
        trace: [
          "ch='(' → push → stack=['(']",
          "ch=')' → matching[')']='(' == stack[-1]='(' → pop → stack=[]",
          "ch='[' → push → stack=['[']",
          "ch=']' → matching[']']='[' == stack[-1]='[' → pop → stack=[]",
          "ch='{' → push → stack=['{']",
          "ch='}' → matching['}]='{' == stack[-1]='{' → pop → stack=[]",
          "len(stack)==0 → return True",
        ],
        traceExplanations: [
          "Every open bracket gets pushed — we're deferring its resolution until we see its closer.",
          "')' checks the top: '(' matches. We resolve the pair and pop.",
          "'[' is another opener — push it. Stack now has one pending opener.",
          "']' checks the top: '[' matches. Resolve and pop.",
          "'{' opens — push.",
          "'}' checks '{' on top — matches, pop.",
          "Stack is empty — every opener was matched in the right order.",
        ],
      },
      blanks: [
        {
          line: "            if not stack or stack[-1] != matching[ch]:",
          answer: "not stack or stack[-1] != matching[ch]",
        },
        {
          line: "    return len(stack) == 0",
          answer: "len(stack) == 0",
        },
      ],
    },

    {
      id: "decode-string",
      title: "Decode String",
      difficulty: "medium",
      prompt:
        "Given an encoded string, return its decoded string. The encoding rule is: k[encoded_string], where the encoded_string inside the square brackets is repeated exactly k times. You may assume the input is always valid.",
      patternKeywords: ["nested", "decode", "repeat", "brackets"],
      solution: `def decode_string(s: str) -> str:
    stack = []  # stores (current_string, repeat_count)
    current = ""
    k = 0

    for ch in s:
        if ch.isdigit():
            k = k * 10 + int(ch)
        elif ch == '[':
            stack.append((current, k))
            current = ""
            k = 0
        elif ch == ']':
            prev_string, repeat = stack.pop()
            current = prev_string + current * repeat
        else:
            current += ch

    return current`,
      solutionExplanation: [
        "I'm using a stack to handle nesting — when I enter a '[', I freeze the current string and its repetition count on the stack. This lets me build the inner string fresh, then combine when I hit ']'.",
        "I track k as the number being built digit by digit (k = k * 10 + digit handles multi-digit numbers like '12[a]'). I track current as the string being built at the current nesting level.",
        "On '[', I push (current, k) to save the outer context, then reset both. Now I'm building the inner string from scratch.",
        "On ']', I pop the saved context. The current string is the completed inner piece — I repeat it `repeat` times and prepend the outer string (prev_string) that was waiting for it.",
        "On a regular character, I just extend current. At the end, current holds the fully decoded string.",
      ],
      testCase: {
        input: 's = "3[a2[c]]"',
        expected: '"accaccacc"',
        trace: [
          "ch='3' → k=3",
          "ch='[' → push ('', 3), current='', k=0",
          "ch='a' → current='a'",
          "ch='2' → k=2",
          "ch='[' → push ('a', 2), current='', k=0",
          "ch='c' → current='c'",
          "ch=']' → pop ('a', 2): current = 'a' + 'c'*2 = 'acc'",
          "ch=']' → pop ('', 3): current = '' + 'acc'*3 = 'accaccacc'",
          "Return 'accaccacc'",
        ],
        traceExplanations: [
          "We accumulate the digit 3 into k.",
          "Entering the outer '[': we save the empty outer string and k=3, then reset to build the inner content fresh.",
          "The letter 'a' is part of the inner content at this nesting level.",
          "We accumulate k=2 for the nested bracket.",
          "Entering the inner '[': save context ('a', 2). We'll need to repeat whatever comes next 2 times and prepend 'a'.",
          "'c' is the content of the innermost bracket.",
          "Closing the inner ']': pop ('a', 2). We built 'c' inside, repeat it 2 times → 'cc', prepend 'a' → 'acc'. Now current='acc'.",
          "Closing the outer ']': pop ('', 3). We built 'acc' inside, repeat 3 times → 'accaccacc', prepend '' → 'accaccacc'.",
        ],
      },
      blanks: [
        {
          line: "            stack.append((current, k))",
          answer: "(current, k)",
        },
        {
          line: "            current = prev_string + current * repeat",
          answer: "prev_string + current * repeat",
        },
        {
          line: "            k = k * 10 + int(ch)",
          answer: "k * 10 + int(ch)",
        },
      ],
    },

    {
      id: "longest-valid-parentheses",
      title: "Longest Valid Parentheses",
      difficulty: "hard",
      prompt:
        "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
      patternKeywords: ["longest", "valid", "substring", "parentheses"],
      solution: `def longest_valid_parentheses(s: str) -> int:
    stack = [-1]  # base index for length calculation
    max_len = 0

    for i, ch in enumerate(s):
        if ch == '(':
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)  # new base
            else:
                max_len = max(max_len, i - stack[-1])

    return max_len`,
      solutionExplanation: [
        "I'm storing indices in the stack, not characters. This lets me calculate lengths directly from index differences.",
        "I seed the stack with -1 as a 'base' index. The length of a valid sequence ending at index i is i - stack[-1], and the base -1 ensures this works even when the sequence starts at index 0.",
        "For '(', I push its index — it's a potential start of a valid sequence.",
        "For ')', I always pop first. If the stack becomes empty after popping, the current ')' is unmatched — it becomes the new base by pushing i. If the stack is non-empty after popping, the top is the index just before this valid sequence ends, so the length is i - stack[-1].",
        "The key insight: the stack always has at least one element (the base). When we compute i - stack[-1], that stack[-1] is the last 'invalid' index — everything between it and i is a valid run.",
      ],
      testCase: {
        input: 's = ")()())"',
        expected: "4",
        trace: [
          "stack=[-1], max_len=0",
          "i=0, ch=')' → pop (-1) → stack empty → push 0 (new base) → stack=[0]",
          "i=1, ch='(' → push 1 → stack=[0,1]",
          "i=2, ch=')' → pop 1 → stack=[0] not empty → max_len=max(0, 2-0)=2",
          "i=3, ch='(' → push 3 → stack=[0,3]",
          "i=4, ch=')' → pop 3 → stack=[0] not empty → max_len=max(2, 4-0)=4",
          "i=5, ch=')' → pop 0 → stack empty → push 5 (new base) → stack=[5]",
          "Return 4",
        ],
        traceExplanations: [
          "We start with -1 as the base so that a valid sequence starting at index 0 computes length correctly (0 - (-1) = 1).",
          "The first ')' has no matching '(' — after popping the base, the stack is empty. We push i=0 as the new boundary. Anything valid now must end after index 0.",
          "'(' at index 1 — push its index to mark a potential start.",
          "')' at index 2 pops the '(' at index 1 — they match. Stack top is now 0 (the base). Length = 2 - 0 = 2.",
          "'(' at index 3 — push it.",
          "')' at index 4 pops index 3. Stack top is 0. Length = 4 - 0 = 4. This captures '()()' as one valid run.",
          "The final ')' at index 5 pops the base 0. Stack is empty — push 5 as new base. No valid extension from here.",
        ],
      },
      blanks: [
        {
          line: "    stack = [-1]  # base index for length calculation",
          answer: "[-1]",
        },
        {
          line: "                stack.append(i)  # new base",
          answer: "stack.append(i)",
        },
        {
          line: "                max_len = max(max_len, i - stack[-1])",
          answer: "i - stack[-1]",
        },
      ],
    },

    {
      id: "daily-temperatures",
      title: "Daily Temperatures",
      difficulty: "medium",
      prompt:
        "Given an array of integers temperatures representing the daily temperatures, return an array answer such that answer[i] is the number of days you have to wait after the i-th day to get a warmer temperature. If there is no future day for which this is possible, keep answer[i] == 0.",
      patternKeywords: ["next greater", "waiting days", "temperatures", "monotonic"],
      solution: `def daily_temperatures(temperatures: list[int]) -> list[int]:
    n = len(temperatures)
    answer = [0] * n
    stack = []  # stores indices, decreasing temperature order

    for i, temp in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < temp:
            j = stack.pop()
            answer[j] = i - j
        stack.append(i)

    return answer`,
      solutionExplanation: [
        "I'm using a monotonic decreasing stack of indices. The invariant is: temperatures at indices in the stack are in decreasing order. Whenever the current temperature breaks that invariant (it's warmer), every index it 'beats' gets its answer filled in.",
        "I push indices, not temperatures, because I need to compute the distance (i - j). I can always look up the temperature via temperatures[j].",
        "For each new temperature, I pop all indices from the stack that have a colder temperature. For each popped index j, the current day i is the first warmer day — answer[j] = i - j.",
        "After the inner while loop, I push the current index. Any indices still in the stack at the end have no warmer future day — their answer stays 0.",
      ],
      testCase: {
        input: "temperatures = [73,74,75,71,69,72,76,73]",
        expected: "[1,1,4,2,1,1,0,0]",
        trace: [
          "i=0, T=73 → stack empty → push 0 → stack=[0]",
          "i=1, T=74 → 74>T[0]=73 → pop 0, answer[0]=1-0=1 → stack empty → push 1 → stack=[1]",
          "i=2, T=75 → 75>T[1]=74 → pop 1, answer[1]=2-1=1 → push 2 → stack=[2]",
          "i=3, T=71 → 71<T[2]=75 → push 3 → stack=[2,3]",
          "i=4, T=69 → 69<T[3]=71 → push 4 → stack=[2,3,4]",
          "i=5, T=72 → 72>T[4]=69 → pop 4, answer[4]=5-4=1; 72>T[3]=71 → pop 3, answer[3]=5-3=2; 72<T[2]=75 → stop → push 5 → stack=[2,5]",
          "i=6, T=76 → 76>T[5]=72 → pop 5, answer[5]=6-5=1; 76>T[2]=75 → pop 2, answer[2]=6-2=4; stack empty → push 6 → stack=[6]",
          "i=7, T=73 → 73<T[6]=76 → push 7 → stack=[6,7]",
          "Remaining [6,7] have answer=0",
          "Return [1,1,4,2,1,1,0,0]",
        ],
        traceExplanations: [
          "First day, nothing to compare — push index 0.",
          "Day 1 (74) is warmer than day 0 (73). We resolve day 0: waited 1 day.",
          "Day 2 (75) is warmer than day 1 (74). Resolve day 1: waited 1 day.",
          "Day 3 (71) is colder than day 2 (75) — no resolution yet. Push 3 to wait.",
          "Day 4 (69) is colder than day 3 (71) — push 4.",
          "Day 5 (72) is warmer than day 4 (69) and day 3 (71) — resolve both. Then 72 < 75, so stop. Days 3 and 4 each had to wait until day 5.",
          "Day 6 (76) is warmer than day 5 (72) and day 2 (75) — resolves both in one sweep. Day 2 had been waiting since index 2 — it waited 4 days.",
          "Day 7 (73) is colder than day 6 (76) — push 7.",
          "Unresolved indices mean no warmer day exists — they stay at 0.",
        ],
      },
      blanks: [
        {
          line: "        while stack and temperatures[stack[-1]] < temp:",
          answer: "temperatures[stack[-1]] < temp",
        },
        {
          line: "            answer[j] = i - j",
          answer: "i - j",
        },
        {
          line: "        stack.append(i)",
          answer: "stack.append(i)",
        },
      ],
    },

    {
      id: "largest-rectangle-histogram",
      title: "Largest Rectangle in Histogram",
      difficulty: "hard",
      prompt:
        "Given an array of integers heights representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.",
      patternKeywords: ["histogram", "rectangle", "largest area", "monotonic"],
      solution: `def largest_rectangle_area(heights: list[int]) -> int:
    stack = []  # stores indices, increasing height order
    max_area = 0
    n = len(heights)

    for i in range(n + 1):
        curr_height = heights[i] if i < n else 0

        while stack and heights[stack[-1]] > curr_height:
            h = heights[stack.pop()]
            w = i if not stack else i - stack[-1] - 1
            max_area = max(max_area, h * w)

        stack.append(i)

    return max_area`,
      solutionExplanation: [
        "I'm using a monotonic increasing stack of indices. The key insight: a bar can extend a rectangle as far left as the nearest shorter bar to its left, and as far right as the nearest shorter bar to its right. When a shorter bar forces us to pop, that's exactly the moment we can calculate the rectangle.",
        "I iterate to n+1 and use a sentinel height of 0 at index n. This forces all remaining bars to be popped and evaluated at the end — without this, bars never smaller than anything would never get calculated.",
        "When I pop height h from index j, the width of the rectangle is: the current index i (right boundary, exclusive) minus the new stack top + 1 (left boundary, exclusive). If the stack is empty after popping, the rectangle spans from index 0 to i-1, so width = i.",
        "The formula `w = i if not stack else i - stack[-1] - 1` captures this: stack[-1] is the last bar shorter than h on the left side, so the rectangle using h as height spans (stack[-1]+1) to (i-1), width = i - stack[-1] - 1.",
      ],
      testCase: {
        input: "heights = [2,1,5,6,2,3]",
        expected: "10",
        trace: [
          "stack=[], max_area=0",
          "i=0, h=2 → stack empty → push 0 → stack=[0]",
          "i=1, h=1 → 1 < heights[0]=2 → pop 0: h=2, stack empty so w=1, area=2*1=2, max=2 → push 1 → stack=[1]",
          "i=2, h=5 → 5>heights[1]=1 → push 2 → stack=[1,2]",
          "i=3, h=6 → 6>heights[2]=5 → push 3 → stack=[1,2,3]",
          "i=4, h=2 → 2<heights[3]=6 → pop 3: h=6, w=4-2-1=1, area=6*1=6, max=6",
          "           2<heights[2]=5 → pop 2: h=5, w=4-1-1=2, area=5*2=10, max=10",
          "           2>heights[1]=1 → stop → push 4 → stack=[1,4]",
          "i=5, h=3 → 3>heights[4]=2 → push 5 → stack=[1,4,5]",
          "i=6, sentinel h=0:",
          "  pop 5: h=3, w=6-4-1=1, area=3",
          "  pop 4: h=2, w=6-1-1=4, area=8",
          "  pop 1: h=1, stack empty so w=6, area=6",
          "Return 10",
        ],
        traceExplanations: [
          "Stack is empty at start — push index 0.",
          "Bar at index 1 (height 1) is shorter than bar 0 (height 2). Bar 0 can't extend right anymore. Stack is empty after popping, so the rectangle spans from 0 to i-1=0, width=1. Area=2.",
          "Heights 5 and 6 are increasing — just push, no resolution yet.",
          "Bar at index 4 (height 2) is the first bar shorter than both 6 and 5.",
          "Pop index 3 (height 6): right boundary is i=4, left boundary is stack[-1]=2, so width = 4-2-1 = 1. Area = 6.",
          "Pop index 2 (height 5): right boundary is i=4, left boundary is stack[-1]=1, width = 4-1-1 = 2. Area = 10. This is the largest rectangle: bars 2 and 3 both have height ≥ 5, width 2.",
          "Height 2 is not less than 1 (stack top), stop popping. Push 4.",
          "Height 3 is greater than height at index 4 (2), push 5.",
          "Sentinel 0 forces resolution of everything left. For height 3 at index 5: right=6, left=index 4, width=1. For height 2 at index 4: right=6, left=index 1, width=4. For height 1 at index 1: stack empty after pop, width=6.",
        ],
      },
      blanks: [
        {
          line: "        while stack and heights[stack[-1]] > curr_height:",
          answer: "heights[stack[-1]] > curr_height",
        },
        {
          line: "            w = i if not stack else i - stack[-1] - 1",
          answer: "i if not stack else i - stack[-1] - 1",
        },
        {
          line: "            max_area = max(max_area, h * w)",
          answer: "h * w",
        },
        {
          line: "        curr_height = heights[i] if i < n else 0",
          answer: "heights[i] if i < n else 0",
        },
      ],
    },
  ],
}
