# 🧮 String to Integer (atoi)

## 📘 Problem Description

Implement the `myAtoi(string s)` function, which converts a string to a 32-bit signed integer.

## 🧠 Algorithm

The algorithm follows these steps:

1. **Whitespace**: Ignore any leading whitespace (`" "`).
2. **Signedness**: Check the next character:
   - `'-'` for negative numbers
   - `'+'` for positive
   - Default to positive if neither is present
3. **Conversion**: Read digits, skipping leading zeros, until:
   - A non-digit character is encountered
   - Or the end of the string is reached
   - Return `0` if no digits were read
4. **Rounding**: Clamp the result to fit within the 32-bit signed integer range:  
   

\[-2³¹, 2³¹ - 1\]



## 🧪 Examples

| Example | Input             | Output | Explanation                                                                 |
|--------:|------------------:|--------:|------------------------------------------------------------------------------|
| 1       | `"42"`            | `42`    | The string `"42"` is parsed into a valid integer.                          |
| 2       | `"   -042"`       | `-42`   | Leading whitespace ignored; sign is negative.                              |
| 3       | `"1337c0d3"`      | `1337`  | Stops parsing when non-digit `'c'` is encountered.                         |
| 4       | `"0-1"`           | `0`     | Only `"0"` is parsed before hitting `'-'`.                                 |
| 5       | `"words and 987"` | `0`     | No digits at the start, so returns `0`.                                    |

## 📏 Constraints

- `0 <= s.length <= 200`
- `s` consists of:
  - English letters (a–z, A–Z)
  - Digits (`0–9`)
  - Whitespace (`' '`)
  - Signs (`'+'`, `'-'`)
  - Period (`'.'`)
