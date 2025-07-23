var solution = new Solution();

Console.WriteLine(solution.myBruteForceVowelCount("Hello World! This is a test string with vowels."));
Console.WriteLine();
Console.WriteLine(solution.myBetterVowelCount("Hello World! This is a test string with vowels."));
Console.WriteLine();
Console.WriteLine(solution.myBestVowelCount("Hello World! This is a test string with vowels."));
Console.WriteLine();

public class Solution
{
    public int myBruteForceVowelCount(string s)
    {
        //  This is a simple solution to count the number of vowels in a string.
        //  It uses a List to store the vowels and then iterates through the
        //  string, counting how many characters are in the set.  It's easy to read
        //  and understand, but it can be improved for performance and memory usage.
        var vowels = new List<char> { 'a', 'e', 'i', 'o', 'u' };
        var count = 0;

        foreach (var c in s.ToLower())
        {
            if (vowels.Contains(c))
            {
                count++;
            }
        }

        return count;
    }

    public int myBetterVowelCount(string s)
    {
        //  This is a more efficient solution to count the number of vowels in a
        //  string.  It uses a switch statement to check each character and increment
        //  the count and instead of calling ToLower on the string which is expensive,
        //  it checks for either casing of each vowel as it iterates through the
        //  string.  The switch statement is a little better in perf as it gets
        //  optimized by JIT into a jump table.
        var count = 0;

        foreach (var c in s)
        {
            switch (c)
            {
                case 'a': case 'A':
                case 'e': case 'E':
                case 'i': case 'I':
                case 'o': case 'O':
                case 'u': case 'U':
                    count++;
                    break;
            }
        }

        return count;
    }

    public int myBestVowelCount(string s)
    {
        //  This is an even more efficient solution to count the number of vowels in a
        //  string.  It uses a boolean array to check if a character is a vowel
        //  and iterates through the string, counting how many characters are in the
        //  array.  This is faster than using a List or switch statement because
        //  it avoids the overhead of hashing or branching.  The boolean array is
        //  indexed by the ASCII value of the character, so it can quickly check
        //  if a character is a vowel by checking the value at that index. This is
        //  a very efficient way to check for membership in a set of characters,
        //  especially when the set is small and the characters are limited to a
        //  specific range (like ASCII characters).
        bool[] vowels = new bool[256];

        vowels['a'] = vowels['A'] = true;
        vowels['e'] = vowels['E'] = true;
        vowels['i'] = vowels['I'] = true;
        vowels['o'] = vowels['O'] = true;
        vowels['u'] = vowels['U'] = true;

        var count = 0;

        foreach (var c in s)
        {
            if (c < 256 && vowels[c])
            {
                count++;
            }
        }

        return count;
    }
}
