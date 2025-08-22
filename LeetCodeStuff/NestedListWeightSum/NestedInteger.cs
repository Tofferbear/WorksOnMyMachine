public class NestedInteger {
    private int? singleInteger;
    private List<NestedInteger> nestedList;

    // Constructor initializes an empty nested list.
    public NestedInteger() {
        nestedList = new List<NestedInteger>();
        singleInteger = null;
    }

    // Constructor initializes a single integer.
    public NestedInteger(int value) {
        singleInteger = value;
        nestedList = null;
    }

    // @return true if this NestedInteger holds a single integer, rather than a nested list.
    public bool IsInteger() {
        return singleInteger.HasValue;
    }

    // @return the single integer that this NestedInteger holds, if it holds a single integer
    public int GetInteger() {
        return singleInteger ?? throw new InvalidOperationException("This NestedInteger holds a list.");
    }

    // Set this NestedInteger to hold a single integer.
    public void SetInteger(int value) {
        singleInteger = value;
        nestedList = null;
    }

    // Set this NestedInteger to hold a nested list and adds a nested integer to it.
    public void Add(NestedInteger ni) {
        if (nestedList == null) {
            nestedList = new List<NestedInteger>();
            singleInteger = null;
        }
        nestedList.Add(ni);
    }

    // @return the nested list that this NestedInteger holds, if it holds a nested list
    public IList<NestedInteger> GetList() {
        return nestedList ?? throw new InvalidOperationException("This NestedInteger holds an integer.");
    }
}
