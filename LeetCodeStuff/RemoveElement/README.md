# 🧹 Remove Element (In-Place)

## Problem Statement

Given an integer array `nums` and an integer `val`, remove **all occurrences** of `val` from `nums` **in-place**.  
Return the number of elements that are **not equal** to `val`.

> The order of elements may change.  
> The contents beyond the returned length `k` are irrelevant.

---

## 🧪 Examples

### Example 1
**Input:** `nums = [3,2,2,3]`, `val = 3`  
**Output:** `2`, `nums = [2,2,_,_]`  
**Explanation:** First two elements are `2`. Underscores represent ignored values.

### Example 2
**Input:** `nums = [0,1,2,2,3,0,4,2]`, `val = 2`  
**Output:** `5`, `nums = [0,1,4,0,3,_,_,_]`  
**Explanation:** First five elements are `[0,1,4,0,3]` in any order.

---

## 🧷 Constraints

- `0 <= nums.length <= 100`
- `0 <= nums[i] <= 50`
- `0 <= val <= 100`

---

## 🧠 Approach

This is a classic in-place overwrite problem.  
We iterate through `nums`, and for every element that **isn't** equal to `val`, we overwrite the front of the array.

### Why It Works:
- No extra space.
- No sorting required.
- No need to preserve order.
- Just overwrite and count.

---

## 🧑‍⚖️ Custom Judge
The judge will:
- Call your method.
- Check that the returned k matches the expected length.
- Sort the first k elements and compare them to the expected result.

## 🪵 Final Thoughts
This challenge is a great reminder that sometimes the best solution is the simplest one. No need for fancy data structures or clever tricks—just a clean loop and a counter.

If you’re tempted to use List.RemoveAll or Array.FindAll, remember:
In-place means no cheating with extra allocations.
