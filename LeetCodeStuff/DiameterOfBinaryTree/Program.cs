var solution = new Solution();

var root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);

Console.WriteLine(solution.DiameterOfBinaryTree(root)); // Output: 3

public class Solution
{
    int diameter = 0;

    public int DiameterOfBinaryTree(TreeNode root)
    {
        LongestPath(root);
        return diameter;
    }

    public int LongestPath(TreeNode node)
    {
        if (node == null)
        {
            return -1;
        }

        var leftCount = LongestPath(node.left);
        var rightCount = LongestPath(node.right);
        var edgeCount = leftCount + rightCount + 2;

        if (edgeCount > diameter)
        {
            diameter = edgeCount;
        }

        return (leftCount > rightCount) ? leftCount + 1 : rightCount + 1;
    }
}
