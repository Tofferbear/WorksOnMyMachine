# ✖️ Product of Array Except Self — LeetCode Challenge

## Problem Description

Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` **except** `nums[i]`.

You must solve it **without using division** and in **O(n)** time.  
Extra space complexity must be **O(1)** (excluding the output array).

🔗 [LeetCode Problem Link](https://leetcode.com/problems/product-of-array-except-self/)

---

## Example

```text
Input: nums = [1,2,3,4]
Output: [24,12,8,6]
```

Explanation:
- answer[0] = 2×3×4 = 24
- answer[1] = 1×3×4 = 12
- answer[2] = 1×2×4 = 8
- answer[3] = 1×2×3 = 6

## Constraints
- 2 ≤ nums.length ≤ 10⁵
- -30 ≤ nums[i] ≤ 30
- The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer

## Approach
### 🧠 Prefix + Postfix Accumulation
We build the result in two passes:

Prefix pass (left to right):

Store the product of all elements before each index

Postfix pass (right to left):

Multiply each index by the product of all elements after it

This avoids division and uses only a single scalar variable for postfix accumulation.

### ⏱ Time Complexity
O(n) — Two linear passes

### 🧠 Space Complexity
O(1) extra — Output array excluded
