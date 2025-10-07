var solution = new Solution();
var list1 = new ListNode(1, new ListNode(2, new ListNode(4)));
var list2 = new ListNode(1, new ListNode(3, new ListNode(4)));
var mergedList = solution.MergeTwoLists(list1, list2);

Console.Write("[");

while (mergedList.next != null) {
    Console.Write(mergedList.val);
    mergedList = mergedList.next;

    if (mergedList != null) {
        Console.Write(", ");
    }
}

Console.Write(mergedList.val);
Console.WriteLine("]");

public class Solution
{
    // This commented out section was my brute force attempt and used the mergedListHead
    // as the return node.  I later discovered it was better to use it as a dummy
    // node and to not return the head element which simplified the needed logic
    // in my final version.

    // public ListNode MergeTwoLists(ListNode list1, ListNode list2) {
    //     if (list1 == null && list2 == null) {
    //         return null;
    //     }

    //     ListNode mergedListHead = new ListNode();
    //     var mergedList = mergedListHead;
    //     var list1Head = list1;
    //     var list2Head = list2;

    //     if (list1Head != null) {
    //         if (list2Head == null || list1Head.val <= list2Head.val) {
    //             mergedList.val = list1Head.val;
    //             list1Head = list1Head.next;

    //             if (list1Head != null || list2Head != null) {
    //                 mergedList.next = new ListNode();
    //                 mergedList = mergedList.next;
    //             }
    //         }
    //     }

    //     if (list2Head != null) {
    //         if (list1Head == null || list2Head.val < list1Head.val) {
    //             mergedList.val = list2Head.val;
    //             list2Head = list2Head.next;

    //             if (list1Head != null || list2Head != null) {
    //                 mergedList.next = new ListNode();
    //                 mergedList = mergedList.next;
    //             }
    //         }
    //     }

    //     while (list1Head != null || list2Head != null) {
    //         if (list1Head != null) {
    //             if (list2Head == null || list1Head.val <= list2Head.val) {
    //                 mergedList.val = list1Head.val;
    //                 list1Head = list1Head.next;

    //                 if (list1Head != null || list2Head != null) {
    //                     mergedList.next = new ListNode();
    //                     mergedList = mergedList.next;
    //                 }
    //             }
    //         }

    //         if (list2Head != null) {
    //             if (list1Head == null || list2Head.val < list1Head.val) {
    //                 mergedList.val = list2Head.val;
    //                 list2Head = list2Head.next;

    //                 if (list1Head != null || list2Head != null) {
    //                     mergedList.next = new ListNode();
    //                     mergedList = mergedList.next;
    //                 }
    //             }
    //         }     
    //     }

    //     mergedList = null;
    //     return mergedListHead;
    // }

    public ListNode MergeTwoLists(ListNode list1, ListNode list2)
    {
        ListNode dummy = new ListNode();
        ListNode tail = dummy;

        while (list1 != null && list2 != null)
        {
            if (list1.val <= list2.val)
            {
                tail.next = list1;
                list1 = list1.next;
            }
            else
            {
                tail.next = list2;
                list2 = list2.next;
            }
            tail = tail.next;
        }

        // Attach the remaining list
        tail.next = list1 ?? list2;

        return dummy.next;
    }
}
