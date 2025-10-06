var solution = new Solution();

Console.WriteLine($"[ {string.Join(", ", solution.TwoSum(new[] { 2, 7, 11, 15 }, 9))} ]");

public class Solution
{
    public int[] TwoSum(int[] nums, int target)
    {
        var seen = new Dictionary<int, int>();

        for (var i = 0; i < nums.Length; ++i)
        {
            if (seen.ContainsKey(target - nums[i]))
            {
                return new[] { seen[target - nums[i]], i };
            }

            seen[nums[i]] = i;
        }

        return Array.Empty<int>();
    }
}
