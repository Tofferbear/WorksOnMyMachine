var solution = new Solution();
var response = solution.VerticalTraversal(
    new TreeNode(3,
        new TreeNode(9),
        new TreeNode(20,
            new TreeNode(15),
            new TreeNode(7))));
            
foreach (var list in response)
{
    Console.WriteLine(string.Join(", ", list));
}

public class Solution
{
    public IList<IList<int>> VerticalTraversal(TreeNode root)
    {
        var nodePositions = new Dictionary<int, Dictionary<int, List<int>>>();
        var outputList = new List<IList<int>>();

        LocateNode(root, 0, 0, ref nodePositions);

        foreach (var col in nodePositions.Keys.OrderBy(c => c))
        {
            var values = new List<int>();

            foreach (var row in nodePositions[col].Keys.OrderBy(r => r))
            {
                nodePositions[col][row].Sort();
                values.AddRange(nodePositions[col][row]);
            }

            outputList.Add(values);
        }

        return outputList;
    }

    public void LocateNode(TreeNode node, int column, int row, ref Dictionary<int, Dictionary<int, List<int>>> nodePositions)
    {
        if (!nodePositions.ContainsKey(column))
        {
            nodePositions.Add(column, new Dictionary<int, List<int>>());
        }

        if (!nodePositions[column].ContainsKey(row))
        {
            nodePositions[column].Add(row, new List<int>());
        }

        nodePositions[column][row].Add(node.val);

        if (node.left != null)
        {
            LocateNode(node.left, column - 1, row + 1, ref nodePositions);
        }

        if (node.right != null)
        {
            LocateNode(node.right, column + 1, row + 1, ref nodePositions);
        }
    }
}
