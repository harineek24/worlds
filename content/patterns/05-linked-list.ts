import { Pattern } from "../types"

export const linkedList: Pattern = {
  id: "linked-list",
  order: 5,
  patternName: "Linked List",

  philosophy: {
    text: "You cannot step into the same river twice.",
    source: "Heraclitus",
    connection:
      "A linked list can only be traversed forward — each node leads only to the next. You cannot go back. Navigate with intention; once you move past a node, it is gone unless you saved a reference. The slow/fast pointer and dummy head techniques exist precisely because of this constraint: they let you see ahead, remember what matters, and restructure without losing the thread.",
  },

  template: {
    description:
      "Three core sub-patterns: dummy head to avoid edge cases on head deletion/insertion; slow/fast pointers to find midpoints or detect cycles; in-place reversal by saving next before relinking.",
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
      name: "Dummy head for safe head manipulation",
      snippet: "dummy = ListNode(0); dummy.next = head",
    },
    {
      name: "Slow/fast pointers for midpoint or cycle",
      snippet: "slow, fast = head, head",
    },
    {
      name: "Always save next before relinking",
      snippet: "next_node = curr.next",
    },
  ],

  problems: [
    {
      id: "linked-list-cycle",
      title: "Linked List Cycle",
      difficulty: "easy",
      prompt:
        "Given the head of a linked list, determine if it contains a cycle. A cycle exists if a node's next pointer points back to a previous node in the list. Return true if there is a cycle, false otherwise.",
      patternKeywords: ["cycle", "loop", "meet", "tortoise"],
      solution: `def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False`,
      solutionExplanation: [
        "I'm initializing both slow and fast to head because both pointers need to start at the same entry point. The tradeoff here is that if head itself is None I need the while condition to protect me — that's why I check `fast and fast.next` before any dereference.",
        "I'm moving slow by one and fast by two each iteration. The key insight is that if a cycle exists, fast will lap slow inside the cycle — they're guaranteed to meet because their relative speed is exactly 1 node per step, so fast closes the gap by 1 each iteration and will never skip over slow.",
        "I'm returning True the moment slow == fast (pointer equality, not value equality). The tradeoff versus using a visited set is O(1) space here at the cost of not knowing where the cycle starts — but the problem only asks for existence.",
        "I'm returning False after the loop exhausts. If fast ever reaches None or fast.next is None, we've hit the end of a non-cyclic list. A cyclic list has no end, so the loop never terminates naturally — only the cycle-detection branch returns.",
      ],
      testCase: {
        input: "3 -> 2 -> 0 -> -4, tail connects to node at index 1",
        expected: "true",
        trace: [
          "Start: slow=3, fast=3",
          "Step 1: slow=2, fast=0",
          "Step 2: slow=0, fast=2  (fast jumped: -4 -> 2)",
          "Step 3: slow=-4, fast=-4  (slow: 0->-4, fast: 2->0->-4)",
          "slow == fast → return True",
        ],
        traceExplanations: [
          "Both pointers enter at node 3. No comparison yet — we haven't moved.",
          "Slow takes 1 step to node 2. Fast takes 2 steps: 3->2->0. They haven't met because fast is ahead.",
          "Slow takes 1 step to node 0. Fast takes 2 steps: 0->-4->2 (cycle wraps). Fast is now behind slow in list order but inside the cycle.",
          "Slow takes 1 step to -4. Fast takes 2 steps: 2->0->-4. They land on the same node. The relative speed of 1 node/iteration means fast inevitably catches slow — it cannot skip over it inside a finite cycle.",
          "Pointer identity check passes. We confirm a cycle exists.",
        ],
      },
      blanks: [
        {
          line: "        slow = slow.next",
          answer: "slow = slow.next",
        },
        {
          line: "        fast = fast.next.next",
          answer: "fast = fast.next.next",
        },
        {
          line: "        if slow == fast:",
          answer: "if slow == fast:",
        },
      ],
    },
    {
      id: "palindrome-linked-list",
      title: "Palindrome Linked List",
      difficulty: "easy",
      prompt:
        "Given the head of a singly linked list, return true if the list is a palindrome, false otherwise. A palindrome reads the same forward and backward.",
      patternKeywords: ["palindrome", "reverse", "midpoint", "compare"],
      solution: `def isPalindrome(head):
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
        "I'm using slow/fast to find the midpoint in one pass. When fast reaches the end, slow is at the start of the second half. The tradeoff is that this modifies the list — for a production API I'd restore it afterward, but for an interview this is acceptable and saves O(n) extra space.",
        "I'm reversing the second half in-place starting from slow. I save next_node before relinking because once I set curr.next = prev, I've lost the original forward pointer. This is the single most common bug in linked list reversal — forgetting to save next.",
        "I'm comparing from both ends simultaneously: left starts at head (first half), right starts at prev (the new head of the reversed second half). I iterate while right exists — the reversed half may be shorter by 1 for odd-length lists, which is correct because the middle element doesn't need a match.",
      ],
      testCase: {
        input: "1 -> 2 -> 2 -> 1",
        expected: "true",
        trace: [
          "Find mid: slow=1, fast=1 → slow=2(idx1), fast=2(idx2) → slow=2(idx2), fast=1(idx3 wraps) → slow stops at node 2(idx2)",
          "Reverse from node 2(idx2): prev=None",
          "  curr=2(idx2): save next=1(idx3), 2.next=None, prev=2(idx2), curr=1(idx3)",
          "  curr=1(idx3): save next=None, 1.next=2(idx2), prev=1(idx3), curr=None",
          "Reversed second half: 1 -> 2 -> None",
          "Compare: left=1(idx0) vs right=1(idx3) → match",
          "Compare: left=2(idx1) vs right=2(idx2) → match",
          "right exhausted → return True",
        ],
        traceExplanations: [
          "Slow/fast find the midpoint. For a 4-node list, after 2 iterations fast lands at the tail (index 3) and slow lands at index 2 — the start of the second half.",
          "Reversal initializes with prev=None so the new tail of the reversed half correctly points to None.",
          "Saving next before relinking is critical — without this, curr.next = prev would destroy the only pointer to index 3.",
          "After the second reversal step, prev points to the original last node (value 1), which is now the head of the reversed second half.",
          "The reversed second half [1, 2] mirrors the first half [1, 2] if it's a palindrome.",
          "First comparison: both ends are 1 — they match.",
          "Second comparison: both inner nodes are 2 — they match.",
          "right becomes None (reversed half exhausted) — we've confirmed all pairs match.",
        ],
      },
      blanks: [
        {
          line: "        next_node = curr.next",
          answer: "next_node = curr.next",
        },
        {
          line: "        curr.next = prev",
          answer: "curr.next = prev",
        },
        {
          line: "        prev = curr",
          answer: "prev = curr",
        },
        {
          line: "        curr = next_node",
          answer: "curr = next_node",
        },
      ],
    },
    {
      id: "remove-nth-from-end",
      title: "Remove Nth Node From End of List",
      difficulty: "medium",
      prompt:
        "Given the head of a linked list, remove the nth node from the end of the list and return its head. Do it in one pass.",
      patternKeywords: ["nth from end", "gap", "two pointers", "one pass"],
      solution: `def removeNthFromEnd(head, n):
    dummy = ListNode(0)
    dummy.next = head
    fast = slow = dummy

    # Advance fast by n+1 steps
    for _ in range(n + 1):
        fast = fast.next

    # Move both until fast is None
    while fast:
        slow = slow.next
        fast = fast.next

    # Delete target
    slow.next = slow.next.next
    return dummy.next`,
      solutionExplanation: [
        "I'm creating a dummy node before head for two reasons: it handles the edge case where the node to remove is the head itself (n equals list length), and it gives slow a 'before target' position — when I delete, I need the node one before the target, not the target itself.",
        "I'm advancing fast by n+1 steps (not n) because I want slow to stop at the node before the target. If I advance only n steps, slow ends up on the target, and I can't delete it without a previous-pointer reference. The gap of n+1 puts slow exactly one behind the node to delete.",
        "I'm moving both pointers in lockstep until fast falls off the end (fast is None). At this point the gap is maintained and slow.next is the nth node from the end — exactly the node to remove.",
        "The deletion is a single pointer reassignment: slow.next = slow.next.next. The tradeoff is that this leaks the deleted node in languages with manual memory management, but in Python/interviews that's fine.",
      ],
      testCase: {
        input: "1 -> 2 -> 3 -> 4 -> 5, n=2",
        expected: "1 -> 2 -> 3 -> 5",
        trace: [
          "dummy -> 1 -> 2 -> 3 -> 4 -> 5",
          "fast advances n+1=3 steps from dummy: fast=3",
          "slow=dummy, fast=3",
          "Move together: slow=1, fast=4",
          "Move together: slow=2, fast=5",
          "Move together: slow=3, fast=None",
          "fast is None — stop. slow=3, slow.next=4 (target)",
          "slow.next = slow.next.next → 3.next = 5",
          "Result: 1 -> 2 -> 3 -> 5",
        ],
        traceExplanations: [
          "The dummy node is prepended so slow has somewhere to stand before node 1.",
          "fast advances 3 steps (n+1=3) so that when it falls off the end, slow is one behind the 2nd-from-end node (node 4).",
          "At this moment, the gap between slow (dummy, position 0) and fast (node 3, position 3) is exactly n+1.",
          "Both advance in lockstep — the gap stays constant at n+1.",
          "Lockstep continues. Fast is now at node 5 (last node).",
          "Fast advances to None. The gap of n+1 is maintained, so slow is at node 3 — one before the 2nd-from-end node (4).",
          "Slow.next is node 4, the node we want to remove. We have the predecessor — now we can unlink.",
          "Relinking: node 3 now points directly to node 5, bypassing node 4.",
          "Returning dummy.next handles the case where head itself was removed.",
        ],
      },
      blanks: [
        {
          line: "    for _ in range(n + 1):",
          answer: "for _ in range(n + 1):",
        },
        {
          line: "        fast = fast.next",
          answer: "fast = fast.next",
        },
        {
          line: "    slow.next = slow.next.next",
          answer: "slow.next = slow.next.next",
        },
      ],
    },
    {
      id: "reorder-list",
      title: "Reorder List",
      difficulty: "medium",
      prompt:
        "Given the head of a singly linked list, reorder it in-place so that the new order is: L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → ... You may not modify node values, only the links.",
      patternKeywords: ["reorder", "merge", "reverse half", "interleave"],
      solution: `def reorderList(head):
    if not head or not head.next:
        return

    # Step 1: find midpoint
    slow, fast = head, head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next

    # Step 2: reverse second half
    second = slow.next
    slow.next = None  # cut list
    prev = None
    while second:
        tmp = second.next
        second.next = prev
        prev = second
        second = tmp

    # Step 3: merge alternately
    first, second = head, prev
    while second:
        tmp1, tmp2 = first.next, second.next
        first.next = second
        second.next = tmp1
        first = tmp1
        second = tmp2`,
      solutionExplanation: [
        "I'm using slow/fast to find the end of the first half. I check fast.next and fast.next.next (not just fast) so that slow stops at the last node of the first half, not the first node of the second half. This means I can cut the list at slow.next = None cleanly.",
        "I'm reversing the second half in-place. The cut at slow.next = None is critical — without it, the reversal loop would process the entire list, not just the second half. After reversal, prev is the new head of the reversed second half (originally the tail).",
        "I'm merging by saving both next pointers before relinking. I need tmp1 = first.next and tmp2 = second.next simultaneously because the moment I set first.next = second, I lose the original chain of the first half. The merge interleaves one node from each half per iteration, stopping when second is exhausted (the reversed half may be same length or one shorter).",
      ],
      testCase: {
        input: "1 -> 2 -> 3 -> 4 -> 5",
        expected: "1 -> 5 -> 2 -> 4 -> 3",
        trace: [
          "Find mid: slow/fast walk → slow stops at node 3",
          "Cut: 3.next = None → first half: 1->2->3, second half starts at 4",
          "Reverse [4->5]: prev=None → 5->4->None, prev=5",
          "Merge: first=1, second=5",
          "  tmp1=2, tmp2=4; 1.next=5, 5.next=2; first=2, second=4",
          "  tmp1=3, tmp2=None; 2.next=4, 4.next=3; first=3, second=None",
          "second is None — stop",
          "Result: 1 -> 5 -> 2 -> 4 -> 3",
        ],
        traceExplanations: [
          "Slow/fast with the fast.next and fast.next.next condition stops slow at node 3 — the last node of the first half for a 5-node list.",
          "Cutting the list at slow.next=None isolates the two halves so the reversal only processes [4, 5].",
          "Reversing [4->5] gives [5->4->None]. Prev=5 is the entry point for the merge.",
          "Merge starts with the original head (1) and the reversed tail (5).",
          "First merge iteration: save next pointers (2 and 4), wire 1->5->2. Advance both pointers one step.",
          "Second merge iteration: save next pointers (3 and None), wire 2->4->3. Advance. Second becomes None.",
          "second is None means the reversed half is exhausted. The first half's remaining node (3) is already correctly wired as the tail.",
          "The final list interleaves from both ends exactly as required.",
        ],
      },
      blanks: [
        {
          line: "    slow.next = None  # cut list",
          answer: "slow.next = None",
        },
        {
          line: "        tmp1, tmp2 = first.next, second.next",
          answer: "tmp1, tmp2 = first.next, second.next",
        },
        {
          line: "        first.next = second",
          answer: "first.next = second",
        },
        {
          line: "        second.next = tmp1",
          answer: "second.next = tmp1",
        },
      ],
    },
    {
      id: "swap-nodes-in-pairs",
      title: "Swap Nodes in Pairs",
      difficulty: "medium",
      prompt:
        "Given a linked list, swap every two adjacent nodes and return its head. You must solve the problem without modifying the values in the list's nodes (i.e. only node swaps, not value swaps).",
      patternKeywords: ["swap pairs", "adjacent", "dummy", "iterative"],
      solution: `def swapPairs(head):
    dummy = ListNode(0)
    dummy.next = head
    prev = dummy

    while prev.next and prev.next.next:
        first = prev.next
        second = prev.next.next

        # Swap
        prev.next = second
        first.next = second.next
        second.next = first

        # Advance
        prev = first

    return dummy.next`,
      solutionExplanation: [
        "I'm using a dummy head so that prev always has a valid node — on the very first pair, prev.next = head and I need to update prev.next to point to second. Without dummy, I'd have no node to attach second to for the first swap.",
        "I'm naming the two nodes first and second explicitly before touching any pointers. Once I start relinking, the .next relationships change and it becomes impossible to read the original chain — naming them upfront makes the three reassignments unambiguous.",
        "The three-step swap is ordered carefully: (1) prev.next = second pulls second to the front of the pair, (2) first.next = second.next attaches first to whatever came after second, (3) second.next = first closes the swap by placing first after second. Order matters — if I did step 3 before step 2, I'd lose second.next.",
        "After the swap, first is the second node in the pair (the one now at the back). I advance prev = first so it points to the last-swapped node, ready to be the anchor for the next pair. The tradeoff of iterative over recursive is O(1) space vs O(n) call stack.",
      ],
      testCase: {
        input: "1 -> 2 -> 3 -> 4",
        expected: "2 -> 1 -> 4 -> 3",
        trace: [
          "dummy -> 1 -> 2 -> 3 -> 4, prev=dummy",
          "Pair 1: first=1, second=2",
          "  prev.next=2, 1.next=3, 2.next=1",
          "  List: dummy -> 2 -> 1 -> 3 -> 4",
          "  prev=1 (advance)",
          "Pair 2: first=3, second=4",
          "  prev.next=4, 3.next=None, 4.next=3",
          "  List: dummy -> 2 -> 1 -> 4 -> 3",
          "  prev=3 (advance)",
          "prev.next=None — loop ends",
          "Return dummy.next = 2",
        ],
        traceExplanations: [
          "Dummy anchors the list before node 1. Prev starts at dummy so the first pair has a valid predecessor.",
          "We identify the pair to swap: first=node(1), second=node(2). Naming them now preserves the references before relinking.",
          "Three-pointer reassignment: dummy now points to 2 (second promoted to front), 1 now points to 3 (first's new successor is whatever was after second), 2 now points to 1 (second links back to first — swap complete).",
          "After pair 1, the sublist reads: dummy -> 2 -> 1 -> 3 -> 4.",
          "Prev advances to node 1 (the back of the swapped pair) — it's now the anchor for the next pair.",
          "Second pair: first=node(3), second=node(4).",
          "Same three-step swap: 1.next=4 (prev.next=second), 3.next=None (first.next=second.next which is None), 4.next=3 (second.next=first).",
          "Final list: dummy -> 2 -> 1 -> 4 -> 3.",
          "Prev advances to node 3. prev.next is None — no more complete pairs.",
          "dummy.next is node 2 — the new head after all swaps.",
        ],
      },
      blanks: [
        {
          line: "        prev.next = second",
          answer: "prev.next = second",
        },
        {
          line: "        first.next = second.next",
          answer: "first.next = second.next",
        },
        {
          line: "        second.next = first",
          answer: "second.next = first",
        },
        {
          line: "        prev = first",
          answer: "prev = first",
        },
      ],
    },
  ],
}
