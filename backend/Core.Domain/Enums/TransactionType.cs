namespace Core.Domain.Enums;

public enum TransactionType
{
    Deposit = 1,  // Addition to wallet
    Withdrawal = 2, // Deduction from wallet (e.g., paying for an order)
    Refund = 3
}