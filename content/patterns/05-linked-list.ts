import { Pattern } from "../types"

export const linkedList: Pattern = {
  id: "linked-list",
  order: 5,
  patternName: "Linked List",

  philosophy: {
    text: "You cannot step into the same river twice.",
    source: "Heraclitus",
    connection:
      "A linked list can only be traversed forward — each node leads only to the next. You cannot go back. Navigate with intention; once you move past a node, it's gone unless you saved a reference. Every pointer reassignment is a one-way door. Think before you move.",
  },

  template: {
    description:
      "Three core techniques: dummy head to eliminate edge cases on insertion/deletion, slow/fast pointers to find midpoints or detect cycles, and in-place reversal by threading prev/curr/next through the list.",
    snippet: `# Dummy head pattern — avoids edge cases on head deletion
dummy = ListNode(0)
dummy.next = head
curr = dummy

# Two pointer (slow/fast) — cycle detection, midpoint
slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next

# Reverse a linked list
prev = None
curr = head
while curr:
    next_node = curr.next
    curr.next = prev
    prev = curr
    curr = next_node`,
  },

  pythonTools: [
    {
      name: "Dummy head — safe head manipulation",
      snippet: `dummy = ListNode(0)
dummy.next = head
# operate on dummy.next freely
return dummy.next`,
    },
    {
      name: "Slow/fast pointers — find midpoint or detect cycle",
      snippet: `slow = fast = head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
# slow is now at midpoint`,
    },
    {
      name: "Always save next before reassigning",
      snippet: `next_node = curr.next   # save it first
curr.next = prev        # now safe to overwrite`,
    },
  ],

  problems: [
    {
      id: "linked-list-cycle",
      title: "Linked List Cycle",
      difficulty: "easy",
      prompt:
        "Given the head of a linked list, determine if the linked list has a cycle in it. A cycle exists if some node can be reached again by continuously following the next pointer. Return true if there is a cycle, false otherwise.",
      patternKeywords: ["cycle", "loop", "slow fast", "meet"],
      solution: `from typing import Optional

def hasCycle(head: Optional[ListNode]) -> bool:
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      solutionExplanation: [
        "I use Floyd's tortoise-and-hare algorithm. Both pointers start at head. Slow moves one step at a time, fast moves two. If there's no cycle, fast will eventually fall off the end of the list.",
        "The insight is mathematical: if a cycle exists, fast and slow are both inside it. Fast gains one node on slow every iteration. Eventually it laps slow — they must meet. The gap between them decreases by one each step, so meeting is guaranteed.",
        "`slow = fast = head` — why start both at head rather than fast at head.next: starting at the same node handles single-element lists without a special case. It also keeps the math clean — we check for equality *after* moving, so the initial shared position never triggers a false positive.",
        "I check for the meeting condition inside the loop, after moving both pointers. If they ever point to the same node, there's a cycle.",
        "If fast reaches null or fast.next reaches null, there's no cycle — a linear list has an end. The `while fast and fast.next` guard handles both: `fast` catches a null tail, `fast.next` prevents a null-pointer dereference when fast is at the last node. Return false.",
      ],
      testCase: {
        input: `head = [3, 2, 0, -4], pos = 1  (tail connects back to index 1)`,
        expected: "True",
        trace: [
          "start:  slow=3,  fast=3",
          "step 1: slow=2,  fast=0   (fast moved 3→2→0)",
          "step 2: slow=0,  fast=2   (fast moved 0→-4→2, cycling back)",
          "step 3: slow=-4, fast=-4  slow == fast ✓",
          "return True",
        ],
        traceExplanations: [
          "Both pointers start at head node (value 3). Fast hasn't been tested against null yet — we enter the loop.",
          "Slow moves one step: 3→2. Fast moves two steps: 3→2→0. They're at different nodes — no meeting yet. Fast is ahead.",
          "Slow moves: 2→0. Fast moves two: 0→-4→2. Fast has looped around through the cycle. The gap is closing.",
          "Slow moves: 0→-4. Fast moves two: 2→0→-4. They land on the same node (-4). Meeting confirmed — a cycle exists.",
          "The loop condition was always satisfied because fast.next was never null — the cycle kept feeding nodes. No escape route means there's a cycle.",
        ],
      },
      explanationBlanks: [
        {
          line: "I use Floyd's ___-and-hare algorithm. Both pointers start at head. Slow moves one step at a time, fast moves two. If there's no cycle, fast will eventually fall off the end of the list.",
          answer: "tortoise",
        },
        {
          line: "The insight is mathematical: if a cycle exists, fast and slow are both inside it. Fast gains one node on slow every iteration. Eventually it laps slow — they must meet. The ___ between them decreases by one each step, so meeting is guaranteed.",
          answer: "gap",
        },
        {
          line: "`slow = fast = head` — why start both at head rather than fast at head.next: starting at the same node handles single-element lists without a ___ case. It also keeps the math clean — we check for equality *after* moving, so the initial shared position never triggers a false positive.",
          answer: "special",
        },
        {
          line: "I check for the ___ condition inside the loop, after moving both pointers. If they ever point to the same node, there's a cycle.",
          answer: "meeting",
        },
        {
          line: "If fast reaches null or fast.next reaches null, there's no cycle — a linear list has an end. The `while fast and fast.next` guard handles both: `fast` catches a null tail, `fast.next` prevents a ___ when fast is at the last node. Return false.",
          answer: "null-pointer dereference",
        },
      ],
      blanks: [
        { line: `    slow = fast = ___`, answer: "head" },
        { line: `    while fast and fast.___:`, answer: "next" },
        { line: `        slow = slow.___`, answer: "next" },
        { line: `        fast = fast.next.___`, answer: "next" },
        { line: `        if slow ___ fast:`, answer: "==" },
      ],
    },

    {
      id: "palindrome-linked-list",
      title: "Palindrome Linked List",
      difficulty: "easy",
      prompt:
        "Given the head of a singly linked list, return true if it is a palindrome or false otherwise. A palindrome reads the same forward and backward. Solve it in O(n) time and O(1) space.",
      patternKeywords: ["palindrome", "reverse", "midpoint", "compare halves"],
      solution: `from typing import Optional

def isPalindrome(head: Optional[ListNode]) -> bool:
    # Step 1: find midpoint
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: reverse second half
    prev = None
    curr = slow
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node

    # Step 3: compare
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left = left.next
        right = right.next
    return True`,
      solutionExplanation: [
        "Step 1 — find the midpoint using slow/fast pointers. `slow = fast = head` — both start at head because we want slow to land *at* the midpoint, not one before it. The loop condition `while fast and fast.next` lets slow reach the exact middle when fast hits the end or one step from it.",
        "Step 2 — I reverse the second half in place, starting from slow. The critical line is `next_node = curr.next` — this saves the original next pointer *before* overwriting it with `curr.next = prev`. Once you reassign `curr.next`, the original next is gone; `next_node` is the only reference left. Skipping this save is the most common linked-list bug. The tradeoff: I'm mutating the list, which is usually acceptable in interviews unless asked otherwise.",
        "Step 3 — I compare left (starting at head) against right (the reversed second half, starting at prev). A palindrome means these two halves mirror each other. I walk both forward simultaneously; if any values differ, it's not a palindrome.",
        "I only need to walk as far as right goes — the reversed half is the shorter or equal half. When right runs out, every value matched.",
      ],
      testCase: {
        input: `head = [1, 2, 2, 1]`,
        expected: "True",
        trace: [
          "find mid: slow/fast start at node(1)",
          "  iter1: slow=node(2,idx1), fast=node(2,idx2)",
          "  iter2: slow=node(2,idx2), fast=None → loop ends",
          "slow is at node(2,idx2) — second half starts here",
          "reverse [2→1]: prev=None, curr=node(2,idx2)",
          "  iter1: next_node=node(1), node(2).next=None, prev=node(2), curr=node(1)",
          "  iter2: next_node=None, node(1).next=node(2), prev=node(1), curr=None",
          "reversed second half: node(1)→node(2)",
          "compare: left=node(1,idx0) vs right=node(1,rev) → val 1==1 ✓",
          "compare: left=node(2,idx1) vs right=node(2,rev) → val 2==2 ✓",
          "right exhausted → return True",
        ],
        traceExplanations: [
          "Both slow and fast begin at the first node (val=1).",
          "Slow takes one step to index 1 (val=2). Fast takes two steps to index 2 (val=2). fast.next=node(1,idx3) is non-null — continue.",
          "Slow advances to index 2 (val=2). Fast tries to advance two: index 2 → index 3 → null. Loop exits. Slow marks the start of the second half.",
          "Slow is at the second occurrence of val=2. The second half [2, 1] starts here.",
          "Reversal begins on the second half. prev is None — the new tail will point to None.",
          "Save next_node (val=1) before cutting. Set node(2).next = None (prev). Advance: prev=node(2), curr=node(1).",
          "Save next_node (None). Set node(1).next = node(2). Advance: prev=node(1), curr=None. Loop ends. Reversed: 1→2.",
          "The reversed second half reads 1→2. The first half reads 1→2. These should match for a palindrome.",
          "First pair: head val=1 vs reversed-head val=1. Match.",
          "Second pair: val=2 vs val=2. Match. The list is symmetric.",
          "Right pointer is now None — all nodes in the reversed half have been checked. Every pair matched.",
        ],
      },
      explanationBlanks: [
        {
          line: "Step 1 — find the ___ using slow/fast pointers. `slow = fast = head` — both start at head because we want slow to land *at* the midpoint, not one before it. The loop condition `while fast and fast.next` lets slow reach the exact middle when fast hits the end or one step from it.",
          answer: "midpoint",
        },
        {
          line: "Step 2 — I reverse the second half in place, starting from slow. The critical line is `next_node = curr.next` — this saves the original next pointer *before* overwriting it with `curr.next = prev`. Once you reassign `curr.next`, the original next is gone; `next_node` is the only ___ left. Skipping this save is the most common linked-list bug. The tradeoff: I'm mutating the list, which is usually acceptable in interviews unless asked otherwise.",
          answer: "reference",
        },
        {
          line: "Step 3 — I compare left (starting at head) against right (the reversed second half, starting at prev). A palindrome means these two halves ___ each other. I walk both forward simultaneously; if any values differ, it's not a palindrome.",
          answer: "mirror",
        },
        {
          line: "I only need to walk as far as right goes — the ___ half is the shorter or equal half. When right runs out, every value matched.",
          answer: "reversed",
        },
      ],
      blanks: [
        { line: `    while fast and fast.___:`, answer: "next" },
        { line: `        next_node = curr.___`, answer: "next" },
        { line: `        curr.next = ___`, answer: "prev" },
        { line: `        prev = ___`, answer: "curr" },
        { line: `        curr = ___`, answer: "next_node" },
        { line: `    left, right = head, ___`, answer: "prev" },
        { line: `        if left.___ != right.val:`, answer: "val" },
      ],
    },

    {
      id: "remove-nth-from-end",
      title: "Remove Nth Node From End of List",
      difficulty: "medium",
      prompt:
        "Given the head of a linked list, remove the nth node from the end of the list and return its head. Do it in one pass.",
      patternKeywords: ["nth from end", "fixed gap", "two pointers", "one pass"],
      solution: `from typing import Optional

def removeNthFromEnd(head: Optional[ListNode], n: int) -> Optional[ListNode]:
    dummy = ListNode(0)
    dummy.next = head
    fast = slow = dummy

    # advance fast n+1 steps so gap between slow and fast is n+1
    for _ in range(n + 1):
        fast = fast.next

    # move both until fast hits end
    while fast:
        slow = slow.next
        fast = fast.next

    # slow is now just before the node to delete
    slow.next = slow.next.next
    return dummy.next`,
      solutionExplanation: [
        "`dummy = ListNode(0); dummy.next = head` — the dummy node exists so that slow always has a valid predecessor for deletion. Without it, removing the original head would require `if node == head: head = head.next` as a special case. The dummy absorbs that branch: slow can always do `slow.next = slow.next.next` regardless of which node is targeted. The value 0 is arbitrary — it's never read.",
        "I advance fast exactly n+1 steps from dummy. This creates a gap of n+1 nodes between slow and fast. The key insight: when fast reaches null (the end), slow is exactly one node before the target.",
        "Why n+1 and not n? Because I want slow to land on the node *before* the target, not *on* the target. I need the predecessor to perform the deletion — a linked list has no back-pointer, so you must arrive at the predecessor first.",
        "I advance both pointers together until fast falls off the end. The gap between them stays constant at n+1 throughout this phase.",
        "When fast is null, slow.next is the node to remove. I bypass it by setting `slow.next = slow.next.next`. The deleted node becomes unreachable and is garbage collected.",
        "I return `dummy.next` — not `head` — because if the original head was the deleted node, `head` is now stale. `dummy.next` always reflects the current first real node.",
      ],
      testCase: {
        input: `head = [1, 2, 3, 4, 5], n = 2`,
        expected: "[1, 2, 3, 5]",
        trace: [
          "dummy→1→2→3→4→5, fast=slow=dummy",
          "advance fast n+1=3 steps from dummy:",
          "  step 1: fast=node(1)",
          "  step 2: fast=node(2)",
          "  step 3: fast=node(3)",
          "gap established: slow=dummy, fast=node(3)",
          "move both together:",
          "  iter1: slow=node(1), fast=node(4)",
          "  iter2: slow=node(2), fast=node(5)",
          "  iter3: slow=node(3), fast=None → loop ends",
          "slow=node(3), slow.next=node(4) — this is the node to delete",
          "slow.next = slow.next.next → node(3).next = node(5)",
          "result: dummy→1→2→3→5",
          "return dummy.next = [1,2,3,5]",
        ],
        traceExplanations: [
          "Dummy node sits before the real list. Both pointers start at dummy — gives slow a predecessor position.",
          "Advancing fast n+1=3 steps to establish the correct gap.",
          "Fast at node(1). One step from dummy.",
          "Fast at node(2). Two steps from dummy.",
          "Fast at node(3). Three steps from dummy. The gap between slow(dummy) and fast(node 3) is exactly 3 nodes.",
          "Gap of 3 confirmed. When fast reaches null, slow will be 3 nodes behind — at node(3), one before the deletion target.",
          "Both pointers advance in lockstep. Gap preserved at 3.",
          "Slow at node(1), fast at node(4). Gap still 3.",
          "Slow at node(2), fast at node(5). Gap still 3.",
          "Fast advances to None. Loop stops. Slow is at node(3) — exactly one node before node(4), the 2nd from end. The math worked.",
          "Slow.next is node(4) — the node to remove. We have the predecessor.",
          "The bypass: node(3)'s next pointer skips over node(4) and points directly to node(5). Node(4) is now orphaned.",
          "The list is now 1→2→3→5. Node(4) is gone.",
          "dummy.next is still node(1), the correct head. If the original head had been deleted, dummy.next would point to the new head.",
        ],
      },
      explanationBlanks: [
        {
          line: "`dummy = ListNode(0); dummy.next = head` — the dummy node exists so that slow always has a valid ___ for deletion. Without it, removing the original head would require `if node == head: head = head.next` as a special case. The dummy absorbs that branch: slow can always do `slow.next = slow.next.next` regardless of which node is targeted. The value 0 is arbitrary — it's never read.",
          answer: "predecessor",
        },
        {
          line: "I advance fast exactly n+1 steps from dummy. This creates a ___ of n+1 nodes between slow and fast. The key insight: when fast reaches null (the end), slow is exactly one node before the target.",
          answer: "gap",
        },
        {
          line: "Why n+1 and not n? Because I want slow to land on the node *before* the target, not *on* the target. I need the predecessor to perform the deletion — a linked list has no ___, so you must arrive at the predecessor first.",
          answer: "back-pointer",
        },
        {
          line: "I advance both pointers together until fast falls off the end. The ___ between them stays constant at n+1 throughout this phase.",
          answer: "gap",
        },
        {
          line: "When fast is null, slow.next is the node to remove. I bypass it by setting `slow.next = slow.next.next`. The deleted node becomes ___ and is garbage collected.",
          answer: "unreachable",
        },
        {
          line: "I return `dummy.next` — not `head` — because if the original head was the deleted node, `head` is now ___. `dummy.next` always reflects the current first real node.",
          answer: "stale",
        },
      ],
      blanks: [
        { line: `    dummy = ListNode(___)`, answer: "0" },
        { line: `    for _ in range(n + ___):`, answer: "1" },
        { line: `        fast = fast.___`, answer: "next" },
        { line: `    while ___:`, answer: "fast" },
        { line: `    slow.next = slow.next.___`, answer: "next" },
        { line: `    return dummy.___`, answer: "next" },
      ],
    },

    {
      id: "reorder-list",
      title: "Reorder List",
      difficulty: "medium",
      prompt:
        "Given the head of a singly linked-list L0 → L1 → ... → Ln, reorder it to: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ... You may not modify the values in the list's nodes. Only nodes themselves may be changed.",
      patternKeywords: ["interleave", "reorder", "reverse second half", "merge alternating"],
      solution: `from typing import Optional

def reorderList(head: Optional[ListNode]) -> None:
    # Step 1: find midpoint
    slow = fast = head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: reverse second half
    second = slow.next
    slow.next = None   # cut the list
    prev = None
    curr = second
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    second = prev

    # Step 3: merge alternating
    first = head
    while second:
        tmp1 = first.next
        tmp2 = second.next
        first.next = second
        second.next = tmp1
        first = tmp1
        second = tmp2`,
      solutionExplanation: [
        "This problem is three sub-problems chained together: find the midpoint, reverse the back half, then merge the two halves alternately.",
        "Step 1 — the loop condition here is `while fast.next and fast.next.next`, not the usual `while fast and fast.next`. This small change makes slow land at the *last node of the first half* rather than the first node of the second half — so `slow.next` is exactly where the second half begins, enabling a clean cut. Choosing the wrong condition shifts the midpoint by one and creates an off-by-one in the merge.",
        "Step 2 — I sever the list at the midpoint (`slow.next = None`) to prevent cycles during reversal, then reverse the second half. The line `next_node = curr.next` must come before `curr.next = prev` — once you overwrite `curr.next`, the original next is unreachable. This save-before-overwrite pattern is mandatory for in-place reversal. After the loop, `prev` is the new head of the reversed second half.",
        "Step 3 — I interleave by saving both halves' next pointers (`tmp1`, `tmp2`) before any rewiring. This is the same principle as the reversal save: you cannot read `first.next` after you have already reassigned it. Two saves, then two wires, then two advances — order matters. The loop runs until second is exhausted — first half may have one extra node in odd-length lists, which is correct.",
      ],
      testCase: {
        input: `head = [1, 2, 3, 4, 5]`,
        expected: "[1, 5, 2, 4, 3]",
        trace: [
          "find mid: slow=fast=node(1)",
          "  iter1: slow=node(2), fast=node(3)  [fast.next=4, fast.next.next=5 → continue]",
          "  iter2: slow=node(3), fast=node(5)  [fast.next=None → loop ends]",
          "slow=node(3), second half = slow.next = node(4)",
          "cut: node(3).next = None → first half: 1→2→3",
          "reverse [4→5]: prev=None, curr=node(4)",
          "  iter1: next_node=node(5), node(4).next=None, prev=node(4), curr=node(5)",
          "  iter2: next_node=None, node(5).next=node(4), prev=node(5), curr=None",
          "second = node(5)→node(4)",
          "merge: first=node(1), second=node(5)",
          "  iter1: tmp1=node(2), tmp2=node(4); node(1).next=node(5), node(5).next=node(2); first=node(2), second=node(4)",
          "  iter2: tmp1=node(3), tmp2=None; node(2).next=node(4), node(4).next=node(3); first=node(3), second=None",
          "second=None → loop ends",
          "result: 1→5→2→4→3",
        ],
        traceExplanations: [
          "Both pointers start at head node (val=1).",
          "Slow advances to node(2), fast advances to node(3). fast.next=4 and fast.next.next=5 are both non-null — loop continues.",
          "Slow advances to node(3), fast advances to node(5). fast.next=None — loop condition fails. Slow is at the last node of the first half.",
          "The second half begins at slow.next = node(4).",
          "Severing at node(3).next = None is critical — without this cut, the reversal loop would walk into the first half and create a cycle.",
          "Reversal begins on the isolated second half [4, 5].",
          "Save node(5) as next. Set node(4).next = None (prev). Advance: prev=node(4), curr=node(5).",
          "Save None as next. Set node(5).next = node(4). Advance: prev=node(5), curr=None. Loop ends. Reversed: 5→4.",
          "The reversed second half is 5→4. This will be woven into the first half.",
          "Merge phase begins. first=node(1), second=node(5).",
          "Save node(2) as tmp1 and node(4) as tmp2 before rewiring. Wire node(1)→node(5), then node(5)→node(2). Advance first to node(2), second to node(4).",
          "Save node(3) as tmp1 and None as tmp2. Wire node(2)→node(4), then node(4)→node(3). Advance first to node(3), second to None.",
          "Second is None — no more back-half nodes to interleave. Node(3) sits as the correct tail.",
          "Final order: 1→5→2→4→3. Every node placed exactly once — O(n) time, O(1) space.",
        ],
      },
      explanationBlanks: [
        {
          line: "This problem is three sub-problems ___ together: find the midpoint, reverse the back half, then merge the two halves alternately.",
          answer: "chained",
        },
        {
          line: "Step 1 — the loop condition here is `while fast.next and fast.next.next`, not the usual `while fast and fast.next`. This small change makes slow land at the *last node of the first half* rather than the first node of the second half — so `slow.next` is exactly where the second half begins, enabling a clean cut. Choosing the wrong condition shifts the ___ by one and creates an off-by-one in the merge.",
          answer: "midpoint",
        },
        {
          line: "Step 2 — I sever the list at the midpoint (`slow.next = None`) to prevent ___ during reversal, then reverse the second half. The line `next_node = curr.next` must come before `curr.next = prev` — once you overwrite `curr.next`, the original next is unreachable. This save-before-overwrite pattern is mandatory for in-place reversal. After the loop, `prev` is the new head of the reversed second half.",
          answer: "cycles",
        },
        {
          line: "Step 3 — I ___ by saving both halves' next pointers (`tmp1`, `tmp2`) before any rewiring. This is the same principle as the reversal save: you cannot read `first.next` after you have already reassigned it. Two saves, then two wires, then two advances — order matters. The loop runs until second is exhausted — first half may have one extra node in odd-length lists, which is correct.",
          answer: "interleave",
        },
      ],
      blanks: [
        { line: `    while fast.___ and fast.next.___:`, answer: "next, next" },
        { line: `    second = slow.___`, answer: "next" },
        { line: `    slow.next = ___`, answer: "None" },
        { line: `        curr.next = ___`, answer: "prev" },
        { line: `        first.next = ___`, answer: "second" },
        { line: `        second.next = ___`, answer: "tmp1" },
        { line: `        first = ___`, answer: "tmp1" },
        { line: `        second = ___`, answer: "tmp2" },
      ],
    },

    {
      id: "swap-nodes-in-pairs",
      title: "Swap Nodes in Pairs",
      difficulty: "medium",
      prompt:
        "Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e., only node swaps are allowed).",
      patternKeywords: ["swap pairs", "adjacent", "iterative rewire", "dummy head"],
      solution: `from typing import Optional

def swapPairs(head: Optional[ListNode]) -> Optional[ListNode]:
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy

    while prev.next and prev.next.next:
        a = prev.next
        b = prev.next.next

        # rewire
        prev.next = b
        a.next = b.next
        b.next = a

        # advance
        prev = a

    return dummy.next`,
      solutionExplanation: [
        "`dummy = ListNode(0); dummy.next = head` — the dummy node gives `prev` a real predecessor before the list begins. Without it, swapping the very first pair would require special-casing the head: `head = b; ...`. The dummy absorbs that branch so every swap, including the first, goes through the same `prev.next = b` assignment. The value 0 is never read.",
        "Each iteration processes one pair: `a` is the first node, `b` is the second. The loop condition `prev.next and prev.next.next` ensures there are at least two nodes left — a single trailing node gets left in place, which is correct.",
        "The rewiring is three pointer assignments and order is mandatory. First, `prev.next = b` (b jumps to the front of the pair). Then `a.next = b.next` (a takes b's old successor — you still have `b.next` because you haven't touched it yet). Finally `b.next = a` (completes the swap). If you set `b.next = a` before `a.next = b.next`, you lose b's original successor permanently.",
        "After swapping, `a` is now the second node of the pair and becomes the new `prev`. The next iteration's pair starts at `a.next`. Advancing `prev = a` is what makes this iterative — each swap leaves prev correctly positioned for the next pair.",
        "The tradeoff: iterative with dummy is O(1) space. A recursive solution is cleaner to read but uses O(n) stack space. In an interview, I'd mention both and implement the iterative version.",
      ],
      testCase: {
        input: `head = [1, 2, 3, 4]`,
        expected: "[2, 1, 4, 3]",
        trace: [
          "dummy→1→2→3→4, prev=dummy",
          "iter1: a=node(1), b=node(2)",
          "  prev.next=node(2)   → dummy→2→3→4  [node(1) temporarily detached, a still holds ref]",
          "  a.next=b.next=node(3) → node(1).next=node(3)",
          "  b.next=a → node(2).next=node(1)",
          "  state: dummy→2→1→3→4",
          "  prev=node(1)  [advance to a]",
          "iter2: a=node(3), b=node(4)",
          "  prev.next=node(4)   → node(1).next=node(4)",
          "  a.next=b.next=None  → node(3).next=None",
          "  b.next=a → node(4).next=node(3)",
          "  state: dummy→2→1→4→3",
          "  prev=node(3)",
          "prev.next=None → loop ends",
          "return dummy.next = [2,1,4,3]",
        ],
        traceExplanations: [
          "Starting state. prev=dummy gives us a predecessor node before the real list begins.",
          "First pair: a=node(1), b=node(2). We're about to swap these two.",
          "Wire dummy to b first. dummy→2. Node(1) is temporarily detached from the main chain — but the variable 'a' still holds its reference. Nothing is lost.",
          "Wire a (node 1) to whatever followed b (node 3). Now node(1).next = node(3). Node(1) has its correct new successor.",
          "Wire b (node 2) back to a (node 1). Now node(2).next = node(1). The swap is complete.",
          "Full state after first swap: dummy→2→1→3→4. The pair (1,2) is now (2,1).",
          "Advance prev to a (node 1). Node(1) is now the second node of the swapped pair and acts as the predecessor for the next pair.",
          "Second pair: a=node(3), b=node(4).",
          "Wire node(1).next = node(4). Node(4) now connects into node(1)'s position.",
          "Wire node(3).next = None (b.next was already None). Node(3) becomes the new tail.",
          "Wire node(4).next = node(3). Swap complete.",
          "Full state: dummy→2→1→4→3.",
          "Advance prev to node(3). prev.next is None — fewer than two nodes remain. Loop exits.",
          "dummy.next is node(2) — the new head. All pairs swapped correctly.",
        ],
      },
      explanationBlanks: [
        {
          line: "`dummy = ListNode(0); dummy.next = head` — the ___ node gives `prev` a real predecessor before the list begins. Without it, swapping the very first pair would require special-casing the head: `head = b; ...`. The dummy absorbs that branch so every swap, including the first, goes through the same `prev.next = b` assignment. The value 0 is never read.",
          answer: "dummy",
        },
        {
          line: "Each iteration processes one pair: `a` is the first node, `b` is the second. The loop condition `prev.next and prev.next.next` ensures there are at least two nodes left — a single trailing node gets left in ___, which is correct.",
          answer: "place",
        },
        {
          line: "The rewiring is three pointer assignments and order is mandatory. First, `prev.next = b` (b jumps to the front of the pair). Then `a.next = b.next` (a takes b's old successor — you still have `b.next` because you haven't touched it yet). Finally `b.next = a` (completes the swap). If you set `b.next = a` before `a.next = b.next`, you lose b's original ___ permanently.",
          answer: "successor",
        },
        {
          line: "After swapping, `a` is now the second node of the pair and becomes the new `prev`. The next iteration's pair starts at `a.next`. Advancing `prev = a` is what makes this ___ — each swap leaves prev correctly positioned for the next pair.",
          answer: "iterative",
        },
        {
          line: "The tradeoff: iterative with dummy is O(1) space. A ___ solution is cleaner to read but uses O(n) stack space. In an interview, I'd mention both and implement the iterative version.",
          answer: "recursive",
        },
      ],
      blanks: [
        { line: `    dummy = ListNode(___)`, answer: "0" },
        { line: `    while prev.___ and prev.next.___:`, answer: "next, next" },
        { line: `        a = prev.___`, answer: "next" },
        { line: `        b = prev.next.___`, answer: "next" },
        { line: `        prev.next = ___`, answer: "b" },
        { line: `        a.next = b.___`, answer: "next" },
        { line: `        b.next = ___`, answer: "a" },
        { line: `        prev = ___`, answer: "a" },
      ],
    },
  ],
}
