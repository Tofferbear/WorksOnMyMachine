# 🔗 Merge Two Sorted Lists — LeetCode Challenge

## Problem Description

You are given the heads of two sorted linked lists `list1` and `list2`.  
Merge the two lists into one **sorted** linked list and return its head.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/merge-two-sorted-lists/)

---

## Example

```text
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
```

## Constraints
- The number of nodes in both lists is in the range [0, 50]
- -100 ≤ Node.val ≤ 100

Both list1 and list2 are sorted in non-decreasing order

## Approach
### 🧠 Iterative (Optimal)
Use a dummy node to anchor the merged list. Traverse both lists with a pointer (tail) and attach the smaller node at each step.

### ⏱ Time Complexity
O(n + m) — where n and m are the lengths of the two lists

### 🧠 Space Complexity
O(1) — In-place merge using existing nodes
