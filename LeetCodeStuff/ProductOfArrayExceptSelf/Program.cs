var solution = new Solution();
var nums = new int[] { 1, 2, 3, 4 };
var result = solution.ProductExceptSelf(nums);
Console.WriteLine($"[{string.Join(", ", result)}]");

result = solution.ProductExceptSelf(new int[] { -1, 1, 0, -3, 3 });
Console.WriteLine($"[{string.Join(", ", result)}]");

public class Solution
{
    public int[] ProductExceptSelf(int[] nums)
    {
        var answer = new int[nums.Length];
        answer[0] = 1;

        for (var i = 1; i < nums.Length; ++i)
        {
            answer[i] = answer[i - 1] * nums[i - 1];
        }

        var postFix = 1;

        for (var i = nums.Length - 1; i >= 0; --i)
        {
            answer[i] *= postFix;
            postFix *= nums[i];
        }

        return answer;
    }
}
