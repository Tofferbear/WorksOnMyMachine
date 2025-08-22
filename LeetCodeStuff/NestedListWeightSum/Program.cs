var ni1 = new NestedInteger(1);
var ni4 = new NestedInteger(4);
var ni6 = new NestedInteger(6);

var innerList = new NestedInteger();
innerList.Add(ni6);

var midList = new NestedInteger();
midList.Add(ni4);
midList.Add(innerList);

var topList = new List<NestedInteger> { ni1, midList };

var solution = new Solution();
Console.WriteLine(solution.DepthSum(topList)); // Output: 27


public class Solution
{
    public int DepthSum(IList<NestedInteger> nestedList)
    {
        return SumArray(nestedList, 1);
    }

    public int SumArray(IList<NestedInteger> nestedList, int multiplier)
    {
        var summedValue = 0;

        foreach (var nestedInt in nestedList)
        {
            if (nestedInt.IsInteger())
            {
                summedValue += nestedInt.GetInteger() * multiplier;
            }
            else
            {
                summedValue += SumArray(nestedInt.GetList(), multiplier + 1);
            }
        }

        return summedValue;
    }
}
