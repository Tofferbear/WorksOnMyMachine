// See https://aka.ms/new-console-template for more information
var solution = new Solution();
Console.WriteLine(solution.MyAtoi("42"));

public class Solution
{
    public int MyAtoi(string s)
    {
        if (s.Length == 0)
        {
            return 0;
        }

        var startIndex = 0;
        var endIndex = 0;
        var validNums = new List<char>(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

        while (startIndex < s.Length && s[startIndex] == ' ')
        {
            startIndex++;
        }

        var signedness = 1;

        if (startIndex < s.Length && (s[startIndex] == '-' || s[startIndex] == '+'))
        {
            signedness = s[startIndex] == '-' ? -1 : 1;
            startIndex++;
        }

        while (startIndex < s.Length && s[startIndex] == '0')
        {
            startIndex++;
        }

        endIndex = startIndex;

        while (endIndex < s.Length && validNums.Contains(s[endIndex]))
        {
            endIndex++;
        }

        var returnVal = endIndex - startIndex;

        if (returnVal != 0)
        {
            try
            {
                returnVal = signedness * int.Parse(s.Substring(startIndex, endIndex - startIndex));
            }
            catch (OverflowException)
            {
                returnVal = signedness == 1 ? int.MaxValue : int.MinValue;
            }
            catch
            {
                returnVal = 0;
            }
        }

        return returnVal;
    }
}
