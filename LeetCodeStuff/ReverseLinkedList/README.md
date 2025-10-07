# 🔄 Reverse Linked List — LeetCode Challenge

## Problem Description

Given the `head` of a singly linked list, reverse the list and return the new head.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/reverse-linked-list/)

---

## Example

```text
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
```

## Constraints
The number of nodes in the list is in the range [0, 5000]
- -5000 ≤ Node.val ≤ 5000

## Approach
### 🧠 Iterative (Optimal)
Use three pointers: previous, current, and next. At each step:

Store current.next in next

Reverse the link: current.next = previous

Move previous and current forward

### ⏱ Time Complexity
O(n) — One pass through the list

### 🧠 Space Complexity
O(1) — In-place reversal
