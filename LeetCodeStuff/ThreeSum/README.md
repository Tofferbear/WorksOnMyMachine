# 🧊 ThreeSum Challenge

## Problem Statement

Given an integer array `nums`, return **all unique triplets** `[nums[i], nums[j], nums[k]]` such that:

- `i != j`, `i != k`, and `j != k`
- `nums[i] + nums[j] + nums[k] == 0`

The solution set must **not contain duplicate triplets**, and the **order of elements and triplets does not matter**.

---

## 🧪 Examples

### Example 1
**Input:** `[-1,0,1,2,-1,-4]`  
**Output:** `[[-1,-1,2],[-1,0,1]]`

### Example 2
**Input:** `[0,1,1]`  
**Output:** `[]`

### Example 3
**Input:** `[0,0,0]`  
**Output:** `[[0,0,0]]`

---

## 📐 Constraints

- `3 <= nums.length <= 3000`
- `-10⁵ <= nums[i] <= 10⁵`

---

## 💡 Approach

The brute-force triple-loop works... until it doesn’t. For large inputs, it hits a time wall. So I pivoted to a more performant strategy:

### ✅ Two-Pointer Technique (Post-Sort)
1. **Sort** the array.
2. **Fix one number** (`nums[i]`) and use two pointers (`left`, `right`) to find pairs that sum to `-nums[i]`.
3. **Skip duplicates** to avoid redundant triplets.

### Time Complexity:  
**O(n²)** — a major upgrade from the naive **O(n³)**

---

🧠 Final Thoughts
This challenge is a great reminder that brute force is fine... until it isn’t. Sorting and scanning with intent beats blind iteration every time.

If you’re tempted to hash your way through it or stringify triplets for deduplication — you’re not wrong, but you’re probably slower.

“The best optimizations are the ones that make your code faster and your brain calmer.”