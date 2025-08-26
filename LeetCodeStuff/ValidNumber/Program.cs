var solution = new Solution();

Console.WriteLine(solution.IsNumber("123")); // True
Console.WriteLine(solution.IsNumber("123.45")); // True
Console.WriteLine(solution.IsNumber("abc")); // False
Console.WriteLine(solution.IsNumber("1e10")); // True
Console.WriteLine(solution.IsNumber("infinity")); // False

public class Solution
{
    public bool IsNumber(string s)
    {
        var lowered = s.ToLower();

        switch (lowered)
        {
            case "infinity":
            case "-infinity":
            case "+infinity":
            case "nan":
                return false;
        }

        return float.TryParse(s, out _);
    }
}
