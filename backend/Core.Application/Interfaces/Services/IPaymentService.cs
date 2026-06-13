using System;
using System.Threading.Tasks;

namespace Core.Application.Interfaces.Services;

public interface IPaymentService
{
    Task<string> GeneratePaymentUrlAsync(Guid transactionId, decimal amount, string billingName, string billingEmail);
    Task<bool> ValidateWebhookSignatureAsync(string payload, string signature);
}