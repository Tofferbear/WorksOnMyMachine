var solution = new Solution();
Console.WriteLine(solution.MaxProfit(new int[] { 7, 1, 5, 3, 6, 4 }));
Console.WriteLine(solution.MaxProfit(new int[] { 3, 2, 6, 5, 0, 3 }));

public class Solution
{
    public int MaxProfit(int[] prices)
    {
        var lowestPriceIndex = 0;
        var highestPriceIndex = 0;
        var bestPrice = 0;

        for (var i = 0; i < prices.Length; ++i)
        {
            if (prices[i] < prices[lowestPriceIndex] && i < prices.Length - 1)
            {
                lowestPriceIndex = i;
                highestPriceIndex = i;
            }

            if (prices[i] > prices[highestPriceIndex])
            {
                highestPriceIndex = i;
            }

            if (prices[highestPriceIndex] - prices[lowestPriceIndex] > bestPrice) {
                bestPrice = prices[highestPriceIndex] - prices[lowestPriceIndex];
            }
        }

        return bestPrice;
    }
}
