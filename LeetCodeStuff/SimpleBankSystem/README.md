# 🏦 Simple Bank System

## Problem Description

Implement a simple banking system that supports basic operations on multiple accounts. Each account has a balance, and the system must support the following operations:

- **Transfer**: Move funds from one account to another.
- **Deposit**: Add funds to an account.
- **Withdraw**: Remove funds from an account.

All operations must validate account existence and ensure sufficient funds before proceeding.

## Constraints

- `n == balance.Length`  
- `1 <= n <= 10^5`  
- `0 <= balance[i] <= 10^9`  
- `1 <= account <= n`  
- `0 <= amount <= 10^9`  
- At most `10^4` operations will be performed.

## Class Definition

```csharp
public class Bank {
    public Bank(long[] balance) { ... }

    public bool Transfer(int account1, int account2, long money) { ... }

    public bool Deposit(int account, long money) { ... }

    public bool Withdraw(int account, long money) { ... }
}
```

## Example Usage
```csharp
Bank bank = new Bank(new long[] {10, 20, 30, 40, 50});

Console.WriteLine(bank.Withdraw(3, 10));     // True → Account 3 now has 20
Console.WriteLine(bank.Transfer(5, 1, 20));  // True → Account 5: 30, Account 1: 30
Console.WriteLine(bank.Deposit(5, 20));      // True → Account 5: 50
Console.WriteLine(bank.Transfer(10, 2, 10)); // False → Account 10 does not exist
Console.WriteLine(bank.Withdraw(5, 100));    // False → Insufficient funds
```

## Notes
- All account indices are 1-based.
- Operations return true if successful, false otherwise.
- Efficient handling is required due to high potential volume of operations.