var solution = new Solution();
var head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
var newHead = solution.ReverseList(head);

Console.Write("[");

while (newHead.next != null)
{
    Console.Write(newHead.val);
    newHead = newHead.next;

    if (newHead != null)
    {
        Console.Write(", ");
    }
}

Console.Write(newHead.val);
Console.WriteLine("]");

public class Solution
{
    public ListNode ReverseList(ListNode head)
    {
        if (head == null || head.next == null)
        {
            return head;
        }

        var newHead = ReverseList(head.next);
        head.next.next = head;
        head.next = null;

        return newHead;
    }
}