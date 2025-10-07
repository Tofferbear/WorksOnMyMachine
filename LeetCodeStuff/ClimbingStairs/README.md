# 🧗 Climbing Stairs — LeetCode Challenge

## Problem Description

You are climbing a staircase with `n` steps.  
Each time you can climb either **1 step** or **2 steps**.  
In how many distinct ways can you reach the top?

🔗 [LeetCode Problem Link](https://leetcode.com/problems/climbing-stairs/)

---

## Example

```text
Input: n = 3
Output: 3
Explanation: There are three ways to climb:
1 + 1 + 1  
1 + 2  
2 + 1
```

## Constraints
- 1 ≤ n ≤ 45

## Approach
### 🧠 Iterative Fibonacci
This problem maps directly to the Fibonacci sequence:

ways(n) = ways(n-1) + ways(n-2)

Base cases:

ways(1) = 1

ways(2) = 2

We build the sequence iteratively using two variables.

### ⏱ Time Complexity
O(n) — Single pass through the steps

### 🧠 Space Complexity
O(1) — Constant space using two variables
