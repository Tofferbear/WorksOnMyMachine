var solution = new Solution();
Console.WriteLine(solution.Search(new[] { 4, 5, 6, 7, 0, 1, 2 }, 0)); // should return 4

public class Solution
{
    public int Search(int[] nums, int target)
    {
        for (var i = 0; i < nums.Length; ++i)
        {
            if (nums[i] == target)
            {
                return i;
            }
        }

        return -1;
    }
}
