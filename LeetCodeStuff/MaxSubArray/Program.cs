var solution = new Solution();
Console.WriteLine(solution.MaxSubArray(new int[] { -2, 1, -3, 4, -1, 2, 1, -5, 4 }));
Console.WriteLine(solution.MaxSubArray(new int[] { 1 }));
Console.WriteLine(solution.MaxSubArray(new int[] { 5, 4, -1, 7, 8 }));

public class Solution
{
    // The below was my first attempt and it works, but is slow...then I stumbled
    // across Kadane's Algorithm and used that instead which is super fast.
    
    // public int MaxSubArray(int[] nums) {
    //     var arrayTotal = int.MinValue;

    //     for (var i = 0; i < nums.Length; ++i) {
    //         for (var j = i; j < nums.Length; ++j) {
    //             var subArray = new ArraySegment<int>(nums, i, j - i + 1).ToArray();
    //             var sum = subArray.Sum();

    //             if (sum > arrayTotal) {
    //                 arrayTotal = sum;
    //             }
    //         }
    //     }

    //     return arrayTotal;
    // }

    public int MaxSubArray(int[] nums)
    {
        int maxSum = nums[0];
        int currentSum = nums[0];

        for (int i = 1; i < nums.Length; i++)
        {
            currentSum = Math.Max(nums[i], currentSum + nums[i]);
            maxSum = Math.Max(maxSum, currentSum);
        }

        return maxSum;
    }
}
