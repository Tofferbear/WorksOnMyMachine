# 🔤 Valid Anagram — LeetCode Challenge

## Problem Description

Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.

An anagram is a word formed by rearranging the letters of another, using all original letters exactly once.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/valid-anagram/)

---

## Example

```text
Input: s = "anagram", t = "nagaram"  
Output: true

Input: s = "rat", t = "car"  
Output: false
```

## Constraints
- 1 ≤ s.length, t.length ≤ 5 × 10⁴
- s and t consist of lowercase English letters

## Approach
### ✅ Frequency Count (Optimal)
We use a dictionary to count the frequency of each character in s, then decrement using characters from t. If all counts return to zero, the strings are anagrams.

### Time Complexity
⏱ O(n) — Single pass through both strings

### Space Complexity
🧠 O(1) — Fixed alphabet size (26 lowercase letters)
