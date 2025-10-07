# 📊 Maximum Subarray — LeetCode Challenge

## Problem Description

Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/maximum-subarray/)

---

## Example

```text
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]  
Output: 6  
Explanation: [4,-1,2,1] has the largest sum = 6
```

## Constraints
- 1 ≤ nums.length ≤ 10⁵
- -10⁴ ≤ nums[i] ≤ 10⁴

## Approach
### ⚡ Kadane’s Algorithm (Optimal)
Track the maximum subarray sum ending at each index using a running total. If the running total drops below zero, reset it. Update the global max as you go.

### Time Complexity
⏱ O(n) — Single pass through the array

### Space Complexity
🧠 O(1) — No extra space beyond a few variables
