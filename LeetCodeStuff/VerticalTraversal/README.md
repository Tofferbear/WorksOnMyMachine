# 🌳 Vertical Order Traversal of a Binary Tree

Given the root of a binary tree, return its **vertical order traversal**—a list of column-wise slices from left to right. Within each column, nodes are arranged **top-to-bottom by row**, and nodes sharing the same position `(row, col)` are sorted by their value.

## 🧠 Problem Statement

Each node in the binary tree has a coordinate:
- Root is at `(row = 0, col = 0)`
- Left child at `(row + 1, col - 1)`
- Right child at `(row + 1, col + 1)`

The output is a list of vertical columns ordered **left to right**. Within each column:
- Nodes are sorted by their row (top to bottom)
- Nodes with identical position are sorted by node value

## 📥 Example Input and Output

### Example 1
```text
Input:  [3,9,20,null,null,15,7]
Output: [[9],[3,15],[20],[7]]
```

## 📊 Columns:
-1 → [9]
0 → [3,15]
1 → [20]
2 → [7]

### Example 2
```text
Input:  [1,2,3,4,5,6,7]
Output: [[4],[2],[1,5,6],[3],[7]]
```

## 🧭 Column 0:
Nodes 1 (row 0), 5 & 6 (row 2)
Order: 1, then 5 before 6 due to value comparison

### Example 3
```text
Input:  [1,2,3,4,6,5,7]
Output: [[4],[2],[1,5,6],[3],[7]]
```

Same structure as Example 2—node values 5 and 6 swapped, but relative positions unchanged.

## ✅ Constraints
1 <= number of nodes <= 1000
0 <= Node.val <= 1000

## 🔧 Implementation Notes
- Use DFS or BFS traversal to capture node positions (row, col)
- Group nodes by column
- Sort each column by row and node value
- Return combined list of sorted columns

## 📚 References
- LeetCode-style problem
- Common in coding interviews for graph/tree traversal + sorting logic
