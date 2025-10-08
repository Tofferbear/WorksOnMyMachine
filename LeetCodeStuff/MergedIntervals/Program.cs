var solution = new Solution();
var intervals = new int[][] {
    new int[] { 1, 3 },
    new int[] { 2, 6 },
    new int[] { 8, 10 },
    new int[] { 15, 18 }
};

var mergedIntervals = solution.Merge(intervals);
Console.Write("[");

for (var i = 0; i < mergedIntervals.Length; ++i)
{
    Console.Write("[" + string.Join(", ", mergedIntervals[i]) + "]");

    if (i < mergedIntervals.Length - 1)
    {
        Console.Write(", ");
    }
}

Console.WriteLine("]");

public class Solution
{
    public int[][] Merge(int[][] intervals)
    {
        if (intervals.Length <= 1)
        {
            return intervals;
        }

        Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
        var mergedIntervals = new List<int[]>();
        var current = intervals[0];

        for (var i = 1; i < intervals.Length; ++i)
        {
            if (intervals[i][0] <= current[1])
            {
                current[1] = Math.Max(current[1], intervals[i][1]);
            }
            else
            {
                mergedIntervals.Add(current);
                current = intervals[i];
            }
        }

        mergedIntervals.Add(current);

        return mergedIntervals.ToArray();
    }
}
