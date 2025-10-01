# 🔐 Decode String

## Problem Description

Given an encoded string, decode it according to the following rule:

- The encoding format is `k[encoded_string]`, where the `encoded_string` inside the square brackets is repeated exactly `k` times.
- You may assume that the input string is always valid — no extra white spaces, well-formed brackets, and no invalid characters.

The goal is to return the decoded string.

## Constraints

- `1 <= s.Length <= 30_000`
- `s` consists of digits, English letters, `'['`, `']'`, and is guaranteed to be valid.
- All digits are non-zero and may be more than one digit (e.g., `"12[a]"` is valid).

## Method Signature

```csharp
public class Solution {
    public string DecodeString(string s) {
        ...
    }
}
```

## Example Usage

```csharp
var solution = new Solution();

Console.WriteLine(solution.DecodeString("3[a]2[bc]"));      // Output: "aaabcbc"
Console.WriteLine(solution.DecodeString("3[a2[c]]"));       // Output: "accaccacc"
Console.WriteLine(solution.DecodeString("2[abc]3[cd]ef"));  // Output: "abcabccdcdcdef"
Console.WriteLine(solution.DecodeString("abc3[cd]xyz"));    // Output: "abccdcdcdxyz"
```

## 🔬 Implementation Comparison

I explored two approaches for solving this problem:
### ✅ Stack-Based Parsing (Winner)

The stack version outperformed recursion in both speed and memory efficiency due to:

- Iterative control flow (No recursive call stack buildup, Avoids overhead of function calls and return values)
- StringBuilder usage (Minimizes memory allocation, Reduces garbage collection load)
- Efficient parsing (Uses arithmetic (k = k * 10 + (ch - '0')) to avoid string parsing, Keeps everything in primitive types until absolutely needed)

### 🧠 Recursive Parsing

I left this version commented out in code:

- More elegant for deeply nested structures
- Easier to reason about in terms of decoding logic
- Slightly slower due to call stack overhead and repeated string allocations
