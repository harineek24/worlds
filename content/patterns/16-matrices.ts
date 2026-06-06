import { Pattern } from "../types"

export const matrices: Pattern = {
  id: "matrices",
  order: 16,
  patternName: "Matrices",

  philosophy: {
    text: "The obstacle is the path.",
    source: "Zen proverb",
    connection:
      "Matrix problems require navigating constraints — boundaries, directions, visited cells. The structure itself defines the path. Work with the grid, not against it. The boundaries aren't in the way; they are the way.",
  },

  template: {
    description:
      "Use direction arrays to move through a grid. Always bounds-check before accessing. For in-place work, track state using the grid itself.",
    snippet: `rows, cols = len(grid), len(grid[0])
directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

def in_bounds(r, c):
    return 0 <= r < rows and 0 <= c < cols

for dr, dc in directions:
    nr, nc = r + dr, c + dc
    if in_bounds(nr, nc):
        # process grid[nr][nc]`,
  },

  pythonTools: [
    {
      name: "Direction arrays for 4-directional movement",
      snippet: `directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]  # right, left, down, up
for dr, dc in directions:
    nr, nc = r + dr, c + dc`,
    },
    {
      name: "In-bounds check",
      snippet: `def in_bounds(r, c, rows, cols):
    return 0 <= r < rows and 0 <= c < cols`,
    },
    {
      name: "Layer-by-layer traversal with shrinking boundaries",
      snippet: `top, bottom, left, right = 0, rows - 1, 0, cols - 1
while top <= bottom and left <= right:
    # process top row, right col, bottom row, left col
    top += 1; bottom -= 1; left += 1; right -= 1`,
    },
  ],

  problems: [
    {
      id: "spiral-matrix",
      title: "Spiral Matrix",
      difficulty: "medium",
      prompt:
        "Given an m x n matrix, return all elements of the matrix in spiral order.",
      patternKeywords: ["spiral", "layer by layer", "boundaries", "clockwise", "shrink"],
      solution: `result = []
top, bottom = 0, len(matrix) - 1
left, right = 0, len(matrix[0]) - 1

while top <= bottom and left <= right:
    for c in range(left, right + 1):
        result.append(matrix[top][c])
    top += 1

    for r in range(top, bottom + 1):
        result.append(matrix[r][right])
    right -= 1

    if top <= bottom:
        for c in range(right, left - 1, -1):
            result.append(matrix[bottom][c])
        bottom -= 1

    if left <= right:
        for r in range(bottom, top - 1, -1):
            result.append(matrix[r][left])
        left += 1

return result`,
      solutionExplanation: [
        "I maintain four boundary pointers: top, bottom, left, right. Each iteration of the while loop processes one full ring of the spiral — the outermost layer — then shrinks the boundaries inward.",
        "I traverse left-to-right along the top row, then top-to-bottom along the right column, then right-to-left along the bottom row, then bottom-to-top along the left column. After each direction, I shrink the corresponding boundary.",
        "I add guards before the bottom row and left column traversals because after moving top and right, the layer may have collapsed to a single row or column. Without the guards, I'd traverse those cells twice.",
        "Syntax — why four separate for-loops instead of a direction-array loop: The spiral pattern has four distinct directional segments that share no common update logic — each one shrinks a different boundary pointer. A direction-array loop works well for uniform grid traversal (BFS, DFS), but here the bookkeeping after each direction differs, so four explicit loops are cleaner. Forcing it into a direction array would require index-tracking overhead that obscures the logic.",
      ],
      testCase: {
        input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        expected: "[1,2,3,6,9,8,7,4,5]",
        trace: [
          "top=0,bottom=2,left=0,right=2",
          "Top row (r=0): 1,2,3 → top=1",
          "Right col (c=2): 6,9 → right=1",
          "Bottom row (r=2, top<=bottom): 8,7 → bottom=1",
          "Left col (c=0, left<=right): 4 → left=1",
          "top=1,bottom=1,left=1,right=1: center element 5",
          "Top row: 5 → top=2. top>bottom, loop ends",
        ],
        traceExplanations: [
          "Initial boundaries enclose the full 3x3 matrix.",
          "We traverse the top row left to right collecting 1,2,3. Then shrink top to 1, meaning the top row is consumed.",
          "We traverse the right column top to bottom collecting 6,9 (rows 1 and 2). Shrink right to 1.",
          "Top<=bottom (1<=2), so we traverse the bottom row right to left collecting 8,7. Shrink bottom to 1.",
          "Left<=right (0<=1), so we traverse the left column bottom to top collecting 4. Shrink left to 1.",
          "Now top=bottom=1, left=right=1. The single center element 5 is collected as the next 'top row'.",
          "After collecting 5, top becomes 2, which exceeds bottom=1. Loop exits.",
        ],
      },
      blanks: [
        {
          line: "for c in range(left, right + 1):",
          answer: "for c in range(left, right + 1):",
        },
        {
          line: "if top <= ___:",
          answer: "bottom",
        },
        {
          line: "if left <= ___:",
          answer: "right",
        },
      ],
    },
    {
      id: "rotate-image",
      title: "Rotate Image",
      difficulty: "medium",
      prompt:
        "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees clockwise. You have to rotate the image in-place.",
      patternKeywords: ["rotate", "in-place", "transpose", "reverse", "90 degrees"],
      solution: `n = len(matrix)
# Step 1: Transpose
for i in range(n):
    for j in range(i + 1, n):
        matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
# Step 2: Reverse each row
for row in matrix:
    row.reverse()`,
      solutionExplanation: [
        "A 90-degree clockwise rotation is equivalent to two simpler operations: first transpose the matrix (flip across the main diagonal), then reverse each row.",
        "The transpose swaps matrix[i][j] with matrix[j][i] for all i < j. I only iterate over the upper triangle (j starts at i+1) to avoid double-swapping back to the original.",
        "After transposing, reversing each row completes the rotation. Both operations are in-place with O(1) extra space. The insight is recognizing the rotation as a composition of two reflections.",
        "Syntax — why in-place modification instead of a new matrix: The problem requires it, and it saves O(n²) space. Python's simultaneous assignment (a, b = b, a) makes in-place swapping a one-liner with no temp variable needed. row.reverse() also modifies in-place. If the problem allowed a new matrix, creating one would be simpler to reason about — but in-place shows you understand memory constraints.",
        "Syntax — why for j in range(i+1, n) for the transpose: Starting j at i+1 restricts swaps to the upper triangle. If j started at 0 or i, you'd swap each pair twice, returning to the original. Starting at i would also swap an element with itself (a no-op but wasted work). i+1 is the minimal range that touches each off-diagonal pair exactly once.",
      ],
      testCase: {
        input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        expected: "[[7,4,1],[8,5,2],[9,6,3]]",
        trace: [
          "Original: [[1,2,3],[4,5,6],[7,8,9]]",
          "After transpose: [[1,4,7],[2,5,8],[3,6,9]]",
          "After reversing rows: [[7,4,1],[8,5,2],[9,6,3]]",
        ],
        traceExplanations: [
          "The original matrix has 1 in top-left and 9 in bottom-right.",
          "Transposing flips across the diagonal: element at (0,1)=2 moves to (1,0), element at (0,2)=3 moves to (2,0), etc. Rows become columns.",
          "Reversing each row flips left-to-right within each row. Row [1,4,7] becomes [7,4,1]. This is the final rotated result — 7 is now top-left, matching a 90-degree clockwise rotation of the original.",
        ],
      },
      blanks: [
        {
          line: "for j in range(___ + 1, n):",
          answer: "i",
        },
        {
          line: "matrix[i][j], matrix[j][i] = matrix[j][i], ___",
          answer: "matrix[i][j]",
        },
        {
          line: "row.___",
          answer: "reverse()",
        },
      ],
    },
    {
      id: "set-matrix-zeroes",
      title: "Set Matrix Zeroes",
      difficulty: "medium",
      prompt:
        "Given an m x n integer matrix, if an element is 0, set its entire row and column to 0's. Do it in-place.",
      patternKeywords: ["in-place", "zero out", "flags", "constant space", "mark rows and columns"],
      solution: `m, n = len(matrix), len(matrix[0])
first_row_zero = any(matrix[0][j] == 0 for j in range(n))
first_col_zero = any(matrix[i][0] == 0 for i in range(m))

# Use first row and first col as flags
for i in range(1, m):
    for j in range(1, n):
        if matrix[i][j] == 0:
            matrix[i][0] = 0
            matrix[0][j] = 0

# Zero out cells based on flags
for i in range(1, m):
    for j in range(1, n):
        if matrix[i][0] == 0 or matrix[0][j] == 0:
            matrix[i][j] = 0

# Zero out first row and first col if needed
if first_row_zero:
    for j in range(n):
        matrix[0][j] = 0
if first_col_zero:
    for i in range(m):
        matrix[i][0] = 0`,
      solutionExplanation: [
        "The naive approach uses O(m+n) extra space to store which rows and columns need zeroing. I can do O(1) by repurposing the first row and first column as those flag arrays.",
        "First I save whether the first row and first column themselves contain any zeros — because I'm about to overwrite them as flags, and I need to remember their original state.",
        "I scan the interior of the matrix (rows 1+ and cols 1+). When I find a zero at (i,j), I mark matrix[i][0] and matrix[0][j] as 0 to flag that row i and column j need zeroing.",
        "Then I do a second pass over the interior: if the flag for a row or column is 0, zero out that cell. Finally I handle the first row and first column themselves using the booleans I saved at the start.",
        "Syntax — why any(matrix[0][j] == 0 for j in range(n)): any() short-circuits — it stops as soon as it finds the first True. This is more efficient and expressive than building a list and checking if 0 in list. The generator expression inside avoids allocating an intermediate list. This pattern (any/all with a generator) is idiomatic Python for checking whether a condition holds for any element in a sequence.",
        "Syntax — why in-place modification with the first row/column as flags: This reduces space from O(m+n) to O(1) by reusing existing matrix storage. The trick only works because the flag information (which rows/columns to zero) can be encoded as zeros in the first row/column — the same value we're setting. Saving first_row_zero and first_col_zero before overwriting is critical: without those two booleans, we'd corrupt the flag information we just wrote.",
      ],
      testCase: {
        input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]",
        expected: "[[1,0,1],[0,0,0],[1,0,1]]",
        trace: [
          "first_row_zero=False, first_col_zero=False",
          "Scan interior: (1,1)=0 → set matrix[1][0]=0, matrix[0][1]=0",
          "After flag pass: matrix=[[1,0,1],[0,0,1],[1,1,1]]",
          "Zero-out pass: i=1,j=1: matrix[1][0]=0 → zero. i=1,j=2: matrix[1][0]=0 → zero. i=2,j=1: matrix[0][1]=0 → zero.",
          "Result: [[1,0,1],[0,0,0],[1,0,1]]",
          "first_row_zero=False, first_col_zero=False → no additional zeroing of first row/col",
        ],
        traceExplanations: [
          "Neither the first row nor first column contains a zero originally, so we record False for both.",
          "We find the zero at (1,1). We flag its row (matrix[1][0]=0) and its column (matrix[0][1]=0).",
          "After the flag-marking pass, the first row and column now encode which rows and columns must be zeroed.",
          "In the zero-out pass, any cell whose row flag or column flag is 0 gets zeroed. Row 1 flag is 0 so entire row 1 interior gets zeroed. Column 1 flag is 0 so entire column 1 interior gets zeroed.",
          "The interior is now correctly zeroed out.",
          "Since neither the first row nor first column originally had zeros, we leave them as their (flagged) state — which already has the right zero at (0,1).",
        ],
      },
      blanks: [
        {
          line: "first_row_zero = any(matrix[0][j] == 0 for j in range(n))",
          answer: "any(matrix[0][j] == 0 for j in range(n))",
        },
        {
          line: "matrix[i][0] = ___",
          answer: "0",
        },
        {
          line: "if matrix[i][0] == 0 or matrix[0][j] == ___:",
          answer: "0",
        },
      ],
    },
  ],
}
