var solution = new Solution();

var nums = new int[] { 3, 2, 2, 3 };
var val = 3;

var keepLength = solution.RemoveElement(ref nums, val);
var sortedArray = nums.Take(keepLength).OrderBy(n => n).ToArray();

Console.WriteLine($"[{string.Join(", ", sortedArray)}]");

public class Solution
{
    public int RemoveElement(ref int[] nums, int val)
    {
        var keepCount = 0;
        var returnList = new List<int>();

        for (var i = 0; i < nums.Length; ++i)
        {
            if (nums[i] != val)
            {
                returnList.Add(nums[i]);
            }
        }

        keepCount = returnList.Count;

        for (var i = 0; i < nums.Length - keepCount; ++i)
        {
            returnList.Add(val);
        }

        nums = returnList.ToArray();

        return keepCount;
    }
}
