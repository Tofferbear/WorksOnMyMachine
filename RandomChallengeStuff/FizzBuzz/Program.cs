var solution = new Solution();

solution.myBruteForceFizzBuzz(int.MaxValue);
Console.WriteLine();
solution.myLessBrutishButHardToReadFizzBuzz(int.MaxValue);
Console.WriteLine();

public class Solution
{
    public void myBruteForceFizzBuzz(int n)
    {
        //  The defacto standard brute force solution.  I don't like this as
        //  using lots of "if" statements is like a traffic circle where the
        //  car (processor) has to slow down and figure out which street (logic
        //  branch) it needs to take...but it works and is easy to read and understand.
        for (var i = n; i >= 1; i--)
        {
            if (i % 3 == 0 && i % 5 == 0)
            {
                Console.WriteLine("FizzBuzz");
            }
            else if (i % 3 == 0)
            {
                Console.WriteLine("Fizz");
            }
            else if (i % 5 == 0)
            {
                Console.WriteLine("Buzz");
            }
            else
            {
                Console.WriteLine(i);
            }
        }
    }

    public void myLessBrutishButHardToReadFizzBuzz(int n)
    {
        //  The brute force version has 4 branches in logic where this is technically
        //  only using 3 and instead of doing the modulas evaluation twice for each
        //  Fizz or Buzz check...it is done only once each and assigning it to a
        //  bool.  While the perf gains on 1 less branch decision and 2 less evaluations
        //  will be so small it'd be immeasurable, if this sort of thinking is applied
        //  to some microservice that's called millions of times...those small perf gains
        //  start adding up and becoming measurable...so I like this version better even
        //  though it's harder to read.
        for (var i = n; i >= 1; i--)
        {
            var addFizz = i % 3 == 0;
            var addBuzz = i % 5 == 0;

            Console.WriteLine($"{(addFizz ? "Fizz" : string.Empty)}{(addBuzz ? "Buzz" : string.Empty)}{(!addFizz && !addBuzz ? i : string.Empty)}");
        }
    }

}
