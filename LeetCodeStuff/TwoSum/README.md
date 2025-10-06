# 🧮 Two Sum — LeetCode Challenge

## Problem Description

Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to the target.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/two-sum/)

---

## Example

```text
Input: nums = [2,7,11,15], target = 9  
Output: [0,1]  
Explanation: nums[0] + nums[1] == 9
```

## Constraints
- 2 ≤ nums.length ≤ 10⁴
- -10⁹ ≤ nums[i] ≤ 10⁹
- -10⁹ ≤ target ≤ 10⁹
- Only one valid answer exists

## Approach
### 💡 Hash Map (Optimal Solution)
We iterate through the array while storing each number's index in a hash map. For each element x, we check if target - x exists in the map. If it does, we've found our solution.

### Time Complexity
⏱ O(n) — Single pass through the array

### Space Complexity
🧠 O(n) — Hash map to store visited elements
