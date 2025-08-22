# 🧮 Depth-Weighted Sum of Nested Integers

Welcome to the recursive rabbit hole. This tackles a deceptively simple challenge: take a nested list of integers and return the sum of each integer multiplied by its depth. Sounds easy—until you realize you're parsing a matryoshka doll of lists.

## 🧠 Problem Statement

Given a `nestedList` where each element is either:
- a single integer, or
- a list containing more integers or other lists (yes, it's turtles all the way down),

Return the sum of all integers, each multiplied by the number of lists it's wrapped in.

### 📦 Examples

```txt
Input:  [[1,1], 2, [1,1]]
Output: 10
Explanation: Four 1's at depth 2 → 4 * 2 = 8, plus one 2 at depth 1 → 2 * 1 = 2

Input:  [1, [4, [6]]]
Output: 27
Explanation: 1*1 + 4*2 + 6*3 = 27

Input:  [0]
Output: 0
```

## 🔒 Constraints
- nestedList.length is between 1 and 50
- Integer values range from -100 to 100
- Maximum depth ≤ 50 (so yes, you can go deep, but not Mariana Trench deep)

## 🧰 Solution Overview
We go full recursion here. For each element:
- If it's an integer, multiply it by the current depth.
- If it's a list, recurse deeper with depth + 1.

No stack gymnastics, no memoization—just clean traversal with a depth counter and a healthy respect for edge cases.

## 🧪 Testing
Includes mock implementation of the NestedInteger interface for local testing. Because LeetCode doesn't let you peek behind the curtain, we built our own.

## 🧼 Clean Code Notes
Recursive helper method: SumArray(nestedList, depth)
- Avoids mutation, favors clarity
- Handles mixed nesting gracefully
