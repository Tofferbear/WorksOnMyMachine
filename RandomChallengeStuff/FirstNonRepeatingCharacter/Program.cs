var solution = new Solution();

solution.myBruteForceFirstNonRepeatingCharacter("Hello World! This is a test string with vowels.");
Console.WriteLine();
solution.mySlightlyBetterFirstNonRepeatingCharacter("Hello World! This is a test string with vowels.");
Console.WriteLine();

public class Solution
{
    public void myBruteForceFirstNonRepeatingCharacter(string s)
    {
        //  This is a simple solution to find the first non-repeating character in a string.
        //  It uses a Dictionary to store the count of each character and then iterates
        //  through the string again to find the first character with a count of
        //  1 in the same dictionary.  For this task, I would probably lean towards
        //  using this first unless perf and memory were absolutely critical just
        //  because working with a dictionary for this purpose is so easy to read
        //  and understand.
        var charCount = new Dictionary<char, int>();

        foreach (var c in s)
        {
            if (charCount.ContainsKey(c))
            {
                charCount[c]++;
            }
            else
            {
                charCount[c] = 1;
            }
        }

        foreach (var c in s)
        {
            if (charCount[c] == 1)
            {
                Console.WriteLine(c);
                return;
            }
        }

        Console.WriteLine("No non-repeating character found.");
    }

    public void mySlightlyBetterFirstNonRepeatingCharacter(string s)
    {
        //  This is a more efficient solution to find the first non-repeating character
        //  in a string.  It uses an array to count the occurrences of each character
        //  and a List to maintain the order of characters. This avoids the overhead
        //  of using a Dictionary and makes it easier to find the first non-repeating
        //  character.  This is a good solution if you know the character set is
        //  limited (like ASCII characters) and you want to optimize for performance
        //  and memory usage.  It is also easy to read and understand.
        //  Note: This solution assumes the input string only contains ASCII characters.

        int[] counts = new int[256];
        var order = new List<char>();

        foreach (var c in s)
        {
            if (counts[c] == 0)
            {
                order.Add(c);
            }

            counts[c]++;
        }

        foreach (char c in order)
        {
            if (counts[c] == 1)
            {
                Console.WriteLine(c);
                return;
            }
        }

        Console.WriteLine("No non-repeating character found.");
    }
}
