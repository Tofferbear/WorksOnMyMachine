// See https://aka.ms/new-console-template for more information
var solution = new Solution();
var response = solution.ReverseKGroup(new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5))))), 2);

while (response != null)
{
    Console.Write(response.val + " ");
    response = response.next;
}

Console.WriteLine();

public class Solution
{
    public ListNode ReverseKGroup(ListNode head, int k)
    {
        var swapNode = head;
        var currentNode = head;
        var reverseValues = new int[k];
        var reverseIndex = 0;

        while (currentNode != null)
        {
            reverseValues[reverseIndex++] = currentNode.val;

            if (reverseIndex == k)
            {
                for (var i = k - 1; i >= 0; i--)
                {
                    swapNode.val = reverseValues[i];
                    swapNode = swapNode.next;
                }

                reverseIndex = 0;
            }

            currentNode = currentNode.next;
        }

        return head;
    }
}
