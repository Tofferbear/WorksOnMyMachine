# 🧹 Valid Palindrome

Can a string become a palindrome by removing *at most* `k` characters?

This repo tackles that deceptively spicy question with an efficient, memoized approach that avoids the performance pitfalls of brute-force backtracking.

## 🧪 Problem Statement

> Given a string `s` and an integer `k`, return `true` if `s` is a `k`-palindrome.

A string is `k`-palindrome if it can be transformed into a palindrome by removing at most `k` characters.

### ✅ Examples
```txt
Input: s = "abcdeca", k = 2
Output: true
Explanation: Remove 'b' and 'e' characters

Input: s = "abbababa", k = 1
Output: true
```

## ⛓️ Constraints
- 1 <= s.length <= 1000
- s consists of only lowercase English letters
- 1 <= k <= s.length

## ⚙️ Approach
Instead of brute-forcing all possible deletions, we use a recursive two-pointer strategy:
- Traverse inward from both ends of the string.
- On mismatch: decide whether to remove a character from either side.
- Each removal decrements k.
- Memoize each (left, right, k) combination to avoid recomputation.

No string copying. No unnecessary allocation. Just good ol’ pointer math.

## 🏎️ Performance
This can be solved fairly easily using brute force, but that can hit O(n^k) in time complexity (goodbye, CPU).

This optimized version operates near O(n * k) in practice, thanks to smart caching and greedy traversal. Suitable for input sizes up to 1000 characters—just like the constraint gods intended.

✏️ Final Thoughts
Memoized, pointer-based recursion...like your favorite engineer...efficient, elegant, and allergic to unnecessary meetings.  :P

Enjoy!
