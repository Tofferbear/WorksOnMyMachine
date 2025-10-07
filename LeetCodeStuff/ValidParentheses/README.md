# 🔗 Valid Parentheses — LeetCode Challenge

## Problem Description

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['`, and `']'`, determine if the input string is valid.

A string is valid if:
1. Open brackets are closed by the same type of brackets.
2. Open brackets are closed in the correct order.
3. Every closing bracket has a corresponding opening bracket.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/valid-parentheses/)

---

## Examples

```text
Input: s = "()"
Output: true

Input: s = "()[]{}"
Output: true

Input: s = "(]"
Output: false

Input: s = "([)]"
Output: false

Input: s = "{[]}"
Output: true
```

## Constraints
- 1 ≤ s.length ≤ 10⁴
- s consists only of '()[]{}'

## Approach
### 🧠 Stack-Based Matching
Use a Stack<char> to track expected closing brackets.

When you see an opening bracket, push its matching closer.

When you see a closing bracket, check if it matches the top of the stack.

If it doesn’t match or the stack is empty, return false.

At the end, the stack should be empty for a valid string.

### Time Complexity
⏱ O(n) — Single pass through the string

### Space Complexity
🧠 O(n) — Stack may hold up to n characters in worst case
