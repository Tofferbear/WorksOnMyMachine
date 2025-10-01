public class Solution {
    public string DecodeString(string s) {
        var countStack = new Stack<int>();
        var stringStack = new Stack<string>();
        var currentString = new StringBuilder();
        int k = 0;

        foreach (char ch in s)
        {
            if (char.IsDigit(ch))
            {
                k = k * 10 + (ch - '0'); // handles multi-digit numbers
            }
            else if (ch == '[')
            {
                countStack.Push(k);
                stringStack.Push(currentString.ToString());
                currentString.Clear();
                k = 0;
            }
            else if (ch == ']')
            {
                var decoded = currentString.ToString();
                currentString.Clear();
                currentString.Append(stringStack.Pop());
                currentString.Append(string.Concat(Enumerable.Repeat(decoded, countStack.Pop())));
            }
            else
            {
                currentString.Append(ch);
            }
        }

        return currentString.ToString();

        // var outputString = decodeSequence(1, s);
        // return outputString;
    }

    // public string decodeSequence(int repeatCount, string baseString) {
    //     var currentString = string.Empty;

    //     if (repeatCount == 1 && !baseString.Contains(']'))
    //     {
    //         return baseString;
    //     }

    //     for (var i = 0; i < baseString.Length; i++)
    //     {
    //         if (char.IsLetter(baseString[i]))
    //         {
    //             currentString += baseString[i];
    //         }
    //         else if (char.IsDigit(baseString[i]))
    //         {
    //             var numberString = string.Empty;

    //             while (i < baseString.Length && char.IsDigit(baseString[i]))
    //             {
    //                 numberString += baseString[i];
    //                 i++;
    //             }

    //             var number = int.Parse(numberString);
    //             i++; // Skip the opening bracket '['
    //             var subString = string.Empty;
    //             var bracketCount = 1;

    //             while (i < baseString.Length && bracketCount > 0)
    //             {
    //                 if (baseString[i] == '[')
    //                 {
    //                     bracketCount++;
    //                 }
    //                 else if (baseString[i] == ']')
    //                 {
    //                     bracketCount--;
    //                 }

    //                 if (bracketCount > 0)
    //                 {
    //                     subString += baseString[i];
    //                 }

    //                 i++;
    //             }

    //             currentString += decodeSequence(number, subString);
    //             i--; // Adjust index after inner loop
    //         }
    //     }

    //     return string.Concat(Enumerable.Repeat(currentString, repeatCount));
    // }
}
