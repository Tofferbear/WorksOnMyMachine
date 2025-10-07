var solution = new Solution();
var strs = new string[] { "eat", "tea", "tan", "ate", "nat", "bat" };
var result = solution.GroupAnagrams(strs);

foreach (var group in result)
{
    Console.WriteLine($"[{string.Join(", ", group)}]");
}

public class Solution
{
    public IList<IList<string>> GroupAnagrams(string[] strs)
    {
        var anagrams = new Dictionary<string, IList<string>>();

        for (var i = 0; i < strs.Length; ++i)
        {
            char[] chars = strs[i].ToCharArray();
            Array.Sort(chars);
            string key = new string(chars);

            if (anagrams.ContainsKey(key))
            {
                anagrams[key].Add(strs[i]);
            }
            else
            {
                anagrams.Add(key, new List<string> { strs[i] });
            }
        }

        return anagrams.Values.ToList();
    }
}