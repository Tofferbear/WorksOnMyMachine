# 🎯 Search in Rotated Sorted Array (But Really Just Search)

An allegedly “tricky” problem that tries to distract you with the concept of rotation — but strip away the drama, and you’re just locating an element in a uniquely-valued array. Rotation, sorting… it’s all noise if you realize the index of the target is the index regardless of how the array got there.

## 🧠 The Actual Task

You're given:
- An array of unique integers.
- It was sorted... maybe.
- It was rotated... maybe.

You're supposed to find the index of a target integer. If it's there, return the index. If not, return `-1`.

And do it in `O(log n)` time.

## 🚫 Misleading Framing

The problem description tries to make you care about:
- Original ascending order  
- Pivot-based rotation  
- Theoretical array states  

But here's the truth:
- You never “unrotate” the array.
- You never use the original index.
- You don’t _need_ the array to be sorted — you just need to know which half is ordered at every step.

## ⚙️ How It’s Solved

You're just doing a modified binary search:
- Check if the middle element matches the target.
- Decide which half to explore based on the order.
- Repeat until found or exhausted.

Whether sorted, rotated, unsorted — your search strategy remains unchanged. The target is where it is. You’re just tracking it down in fewer steps.

## 🧪 Examples

```plaintext
nums = [4,5,6,7,0,1,2], target = 0 → Output: 4
nums = [4,5,6,7,0,1,2], target = 3 → Output: -1
nums = [1], target = 0 → Output: -1
```

## 💬 Developer Note
Personally, I felt like this problem was trying too hard to sound fancy. The whole “rotated array” story doesn’t affect the outcome — it’s just window dressing for a binary search that adapts based on the subarray’s order.