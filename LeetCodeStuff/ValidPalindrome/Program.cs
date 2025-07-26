var solution = new Solution();
// should be true
Console.WriteLine(solution.IsValidPalindrome("fcgihcgeadfehgiabegbiahbeadbiafgcfchbcacedbificicihibaeehbffeidiaiighceegbfdggggcfaiibefbgeegbcgeadcfdfegfghebcfceiabiagehhibiheddbcgdebdcfegaiahibcfhheggbheebfdahgcfcahafecfehgcgdabbghddeadecidicchfgicbdbecibddfcgbiadiffcifiggigdeedbiiihfgehhdegcaffaggiidiifgfigfiaiicadceefbhicfhbcachacaeiefdcchegfbifhaeafdehicfgbecahidgdagigbhiffhcccdhfdbd", 216));
// should be false
Console.WriteLine(solution.IsValidPalindrome("baaccaacbdcadbcdacbbdabbdddabdddadcabbdbbcaadbbdcbddcbdcdbaadaab", 9));
Console.WriteLine();

public class Solution
{
    private Dictionary<(int, int, int), bool> memo = new();

    public bool IsValidPalindrome(string s, int k)
    {
        return CanFormPalindrome(s, 0, s.Length - 1, k);
    }

    public bool CanFormPalindrome(string s, int left, int right, int k)
    {
        if (memo.TryGetValue((left, right, k), out var cached))
        {
            return cached;
        }

        while (left < right)
        {
            if (s[left] == s[right])
            {
                left++;
                right--;
            }
            else
            {
                if (k == 0)
                {
                    memo[(left, right, k)] = false;
                    return false;
                }

                bool result = CanFormPalindrome(s, left + 1, right, k - 1) || CanFormPalindrome(s, left, right - 1, k - 1);

                memo[(left, right, k)] = result;
                return result;
            }
        }

        memo[(left, right, k)] = true;
        return true;
    }
}
