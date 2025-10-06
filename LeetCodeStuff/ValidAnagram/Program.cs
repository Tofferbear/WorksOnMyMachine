var solution = new Solution();
Console.WriteLine(solution.IsAnagram("anagram", "nagaram"));

public class Solution
{
    public bool IsAnagram(string s, string t)
    {
        if (s.Length != t.Length)
        {
            return false;
        }

        var letterCount = new int[26];

        for (var i = 0; i < s.Length; ++i)
        {
            letterCount[s[i] - 'a']++;
            letterCount[t[i] - 'a']--;
        }

        return !letterCount.Any(lc => lc != 0);
    }
}
