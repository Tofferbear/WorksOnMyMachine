# 📈 Best Time to Buy and Sell Stock — LeetCode Challenge

## Problem Description

You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`th day.

You want to maximize your profit by choosing a single day to buy one stock and a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If no profit is possible, return `0`.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/)

---

## Example

```text
Input: prices = [7,1,5,3,6,4]  
Output: 5  
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.

Input: prices = [7,6,4,3,1]  
Output: 0  
Explanation: No profitable transaction is possible.
```

## Constraints
1 ≤ prices.length ≤ 10⁵

0 ≤ prices[i] ≤ 10⁴

## Approach
### 🧠 One-Pass Min Tracking (Optimal)
Track the minimum price seen so far while iterating through the array. At each step, calculate the potential profit by subtracting the current minimum from the current price. Update the maximum profit accordingly.

### Time Complexity
⏱ O(n) — Single pass through the array

### Space Complexity
🧠 O(1) — Constant space for tracking min price and max profit
