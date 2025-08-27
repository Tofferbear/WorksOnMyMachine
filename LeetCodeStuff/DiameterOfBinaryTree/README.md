# 🌲 Diameter of a Binary Tree

## Problem Statement

Given the root of a binary tree, return the **length of its diameter**.

The diameter is defined as the length of the longest path between any two nodes in the tree. This path may or may not pass through the root.

> Length is measured by the number of edges between nodes—not the number of nodes themselves.

---

## 🧪 Examples

### Example 1
**Input:** `root = [1,2,3,4,5]`  
**Output:** `3`  
**Explanation:** Longest path is `[4,2,1,3]` or `[5,2,1,3]`, both with 3 edges.

### Example 2
**Input:** `root = [1,2]`  
**Output:** `1`  
**Explanation:** Only one edge between the two nodes.

---

## 📐 Constraints

- `1 <= number of nodes <= 10⁴`
- `-100 <= Node.val <= 100`

---

## 💡 Approach

This problem is a classic case of “don’t just look down—look sideways.”

To find the diameter, we need to compute the **depth** of each subtree and track the **maximum sum of left + right depths** encountered during traversal. That sum represents the longest path that passes through a given node.

### Key Insight:
- The diameter at any node is:  
  `left subtree depth + right subtree depth`
- We update a global max as we recurse through the tree.

### Why This Works:
- It captures paths that pass through the root *and* those that don’t.
- It’s efficient: one post-order traversal, O(n) time.

---

## 🪵 Final Thoughts
This challenge is a great reminder that the most interesting paths in a tree aren’t always the ones that go straight down. Sometimes, the real magic happens when you look sideways.

If you’re tempted to brute-force all node pairs—don’t. This recursive approach is lean, elegant, and scales beautifully.
