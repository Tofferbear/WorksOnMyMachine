var solution = new Solution();
Console.WriteLine(solution.IsValid("()"));
Console.WriteLine(solution.IsValid("()[]{}"));
Console.WriteLine(solution.IsValid("(]"));
Console.WriteLine(solution.IsValid("([)]"));

public class Solution
{
    public bool IsValid(string s)
    {
        var charStack = new Stack<char>();

        for (var i = 0; i < s.Length; ++i)
        {
            if (s[i] == '(')
            {
                charStack.Push(')');
            }
            else if (s[i] == '{')
            {
                charStack.Push('}');
            }
            else if (s[i] == '[')
            {
                charStack.Push(']');
            }
            else if (charStack.Count == 0 || charStack.Pop() != s[i])
            {
                return false;
            }
        }

        return charStack.Count == 0;
    }
}
