var solution = new Solution();
Console.WriteLine(solution.ClimbStairs(2));  // 2
Console.WriteLine(solution.ClimbStairs(3));  // 3
Console.WriteLine(solution.ClimbStairs(4));  // 5
Console.WriteLine(solution.ClimbStairs(5));  // 8

public class Solution
{
    public int ClimbStairs(int n)
    {
        if (n <= 2)
        {
            return n;
        }

        var all = 0;
        var oneStepBefore = 2;
        var twoStepsBefore = 1;

        for (var i = 3; i <= n; ++i)
        {
            all = oneStepBefore + twoStepsBefore;
            twoStepsBefore = oneStepBefore;
            oneStepBefore = all;
        }

        return all;
    }
}