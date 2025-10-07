# 🔤 Group Anagrams — LeetCode Challenge

## Problem Description

Given an array of strings `strs`, group the anagrams together.  
You can return the answer in any order.

🔗 [LeetCode Problem Link](https://leetcode.com/problems/group-anagrams/)

---

## Example

```text
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["eat","tea","ate"],["tan","nat"],["bat"]]
```

## Constraints
- 1 ≤ strs.length ≤ 10⁴
- 0 ≤ strs[i].length ≤ 100
- strs[i] consists of lowercase English letters

## Approach
### 🧠 Canonical Sorting
Anagrams share the same characters in different orders. By sorting each word alphabetically, we create a canonical form that acts as a key.

Example:

"eat" → "aet"

"tea" → "aet"

"tan" → "ant"

Group words by their sorted form using a dictionary.

### ⏱ Time Complexity
O(n * k log k) — where n is the number of words and k is the average word length

### 🧠 Space Complexity
O(n * k) — storing all words in grouped lists
