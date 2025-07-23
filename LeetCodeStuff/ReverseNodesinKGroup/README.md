# 🔁 Reverse Nodes in k-Group

## 📘 Problem Statement

Given the `head` of a singly-linked list, reverse the nodes in groups of size `k`, and return the modified list.

- `k` is a positive integer and `k ≤ length of the list`.
- If the number of nodes isn't a multiple of `k`, the remaining nodes at the end should remain unchanged.
- You **cannot** change the node values — only the actual node connections.

## 🧠 Approach

1. Traverse the list, counting nodes in groups of `k`.
2. Reverse each group of `k` nodes in place.
3. Stitch the reversed blocks back into the main list while preserving any leftover nodes.

## 🧪 Examples

| Example | Input                  | k | Output            | Explanation                                         |
|--------:|------------------------|---|--------------------|-----------------------------------------------------|
| 1       | `[1,2,3,4,5]`          | 2 | `[2,1,4,3,5]`      | Reversed every 2 nodes; node `5` remains.           |
| 2       | `[1,2,3,4,5]`          | 3 | `[3,2,1,4,5]`      | Reversed first 3 nodes; last 2 remain unchanged.    |

## 📏 Constraints

- `1 <= k <= n <= 5000`  
- `0 <= Node.val <= 1000`  
- You may not mutate node values — only reorder the links.
