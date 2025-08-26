# 🧮 Valid Number Challenge

## Problem Statement

Given a string `s`, determine whether it represents a valid number.

### ✅ Valid Examples
``2``, ``0089``, ``-0.1``, ``+3.14``, ``4.``, ``-.9``, ``2e10``, ``-90E3``, ``3e+7``, ``+6e-1``, ``53.5e93``, ``-123.456e789``

### ❌ Invalid Examples
``abc``, ``1a``, ``1e``, ``e3``, ``99e2.5``, ``--6``, ``-+3``, ``95a54e53``

## Formal Definition

A valid number is defined as either:
- An **integer** followed by an optional **exponent**
- A **decimal** followed by an optional **exponent**

### Integer
- Optional sign (`+` or `-`)
- Followed by digits

### Decimal
- Optional sign (`+` or `-`)
- One of:
  - Digits followed by a dot (`.`)
  - Digits followed by a dot and more digits
  - Dot followed by digits

### Exponent
- Notation `e` or `E`
- Followed by an integer (optional sign + digits)

## Constraints

- `1 <= s.length <= 20`
- Characters include: English letters, digits, `+`, `-`, `.`

---

## 💡 My Approach

Instead of hand-rolling a regex monster or reinventing the wheel with a custom parser, I leaned on the tried-and-true `float.TryParse`. Why?

- It’s **battle-tested**: decades of .NET evolution have tuned it for performance and correctness.
- It’s **readable**: no need to decode a regex or trace a state machine.
- It’s **robust**: handles most edge cases out of the box.

I paired it with a simple `switch` statement to catch the few outliers that `TryParse` lets through (e.g., `"infinity"` or `"nan"`). This hybrid approach keeps things clean, fast, and maintainable.

If this were a cryptographic validator or needed ultra-low-latency parsing in a hot path, I’d dig deeper into benchmarks and maybe even write a custom lexer. But for general-purpose input validation? This covers 99% of use cases with 1% of the effort.

🧠 Final Thoughts
This solution is pragmatic, performant, and easy to reason about. It’s not trying to be clever—it’s trying to be useful. And sometimes, that’s the cleverest thing you can do.