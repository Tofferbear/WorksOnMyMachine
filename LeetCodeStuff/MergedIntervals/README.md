# 📆 Merge Intervals — LeetCode Challenge

## Problem Description

Given an array of intervals where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the input.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/merge-intervals/)

---

## Example

```text
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
```

Explanation:

[1,3] and [2,6] overlap → merge into [1,6]

[8,10] and [15,18] do not overlap → remain separate

## Constraints
- 1 ≤ intervals.length ≤ 10⁴
- intervals[i].length == 2
- 0 ≤ start_i ≤ end_i ≤ 10⁴

## Approach
### 🧠 Sort + Merge Strategy
Sort intervals by start time Ensures overlapping intervals are adjacent

Iterate and merge

Track a current interval

If next.start ≤ current.end, merge them

Otherwise, push current to result and start a new one

### ⏱ Time Complexity
O(n log n) — due to sorting

### 🧠 Space Complexity
O(n) — for storing merged intervals
