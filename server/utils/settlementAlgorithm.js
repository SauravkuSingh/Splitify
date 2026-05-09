/**
 * Smart Settlement Algorithm
 * 
 * Input: balances object { userId: netAmount }
 *   Positive = user ko milna chahiye (creditor)
 *   Negative = user ko dena chahiye (debtor)
 * 
 * Output: minimum transactions array
 *   [ { from: userId, to: userId, amount: number } ]
 * 
 * Approach: Greedy — max creditor + max debtor pair karo
 * Complexity: O(N² log N) worst case — N log N per iteration
 */

export const calculateSettlements = (balances) => {
  // balances = { "userId1": 1000, "userId2": -800, ... }
  
  const transactions = [];

  // Creditors aur debtors alag karo
  // creditors = [ { userId, amount } ] — positive balances
  // debtors   = [ { userId, amount } ] — negative balances (positive mein store karenge)
  let creditors = [];
  let debtors = [];

  Object.entries(balances).forEach(([userId, amount]) => {
    if (amount > 0.01) {
      // 0.01 se check karo — floating point issues avoid karne ke liye
      creditors.push({ userId, amount: parseFloat(amount.toFixed(2)) });
    } else if (amount < -0.01) {
      debtors.push({ userId, amount: parseFloat((-amount).toFixed(2)) });
      // Negative ko positive mein store karte hain for easy comparison
    }
    // Exactly 0 wale ignore — woh already settled hain
  });

  // Jab tak dono lists mein elements hain
  while (creditors.length > 0 && debtors.length > 0) {
    // Sabse bada creditor aur debtor lo (descending sort)
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const creditor = creditors[0]; // Sabse zyada lena hai jise
    const debtor = debtors[0];     // Sabse zyada dena hai jise

    // Kitna settle hoga — dono mein se chhota amount
    const settleAmount = parseFloat(
      Math.min(creditor.amount, debtor.amount).toFixed(2)
    );

    // Transaction record karo
    transactions.push({
      from: debtor.userId,   // Debtor deta hai
      to: creditor.userId,   // Creditor leta hai
      amount: settleAmount,
    });

    // Balances update karo
    creditor.amount = parseFloat((creditor.amount - settleAmount).toFixed(2));
    debtor.amount = parseFloat((debtor.amount - settleAmount).toFixed(2));

    // Agar balance 0 ho gaya toh list se remove karo
    if (creditor.amount < 0.01) creditors.shift();
    if (debtor.amount < 0.01) debtors.shift();
  }

  return transactions;
};