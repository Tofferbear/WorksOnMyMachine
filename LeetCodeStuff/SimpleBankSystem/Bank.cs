public class Bank
{
    private long[] _balance;

    public Bank(long[] balance)
    {
        _balance = balance;
    }

    public bool Transfer(int account1, int account2, long money)
    {
        var account1Index = account1 - 1;
        var account2Index = account2 - 1;

        if (account1 < 1 || account1 > _balance.Length || account2 < 1 || account2 > _balance.Length)
        {
            return false;
        }

        if (_balance[account1Index] < money)
        {
            return false;
        }

        _balance[account1Index] -= money;
        _balance[account2Index] += money;

        return true;
    }

    public bool Deposit(int account, long money)
    {
        if (account < 1 || account > _balance.Length || money < 0)
        {
            return false;
        }

        _balance[account - 1] += money;

        return true;
    }

    public bool Withdraw(int account, long money)
    {
        var accountIndex = account - 1;

        if (account < 1 || account > _balance.Length || money < 0 || _balance[accountIndex] < money)
        {
            return false;
        }

        _balance[accountIndex] -= money;

        return true;
    }
}
