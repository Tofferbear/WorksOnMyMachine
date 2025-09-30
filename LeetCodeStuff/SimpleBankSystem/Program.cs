// ["Bank","withdraw","transfer","deposit","transfer","withdraw"]
// [[[10,100,20,50,30]],[3,10],[5,1,20],[5,20],[3,4,15],[10,50]]

var bank = new Bank(new long[] { 10, 100, 20, 50, 30 });
var withdraw1 = bank.Withdraw(3, 10);    // return true
var transfer1 = bank.Transfer(5, 1, 20);  // return true
var deposit1 = bank.Deposit(5, 20);      // return true
var transfer2 = bank.Transfer(3, 4, 15);  // return false
var withdraw2 = bank.Withdraw(10, 50);    // return false

// Output: [true,true,true,false,false]
Console.WriteLine($"{withdraw1}, {transfer1}, {deposit1}, {transfer2}, {withdraw2}");
