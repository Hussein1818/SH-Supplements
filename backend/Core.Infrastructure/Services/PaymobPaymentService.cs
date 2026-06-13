using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Core.Application.Interfaces.Services;
using Core.Application.Settings;
using Microsoft.Extensions.Options;

namespace Core.Infrastructure.Services;

public class PaymobPaymentService : IPaymentService
{
    private readonly HttpClient _httpClient;
    private readonly PaymobSettings _settings;

    public PaymobPaymentService(HttpClient httpClient, IOptions<PaymobSettings> settings)
    {
        _httpClient = httpClient;
        _settings = settings.Value;
        _httpClient.BaseAddress = new Uri("https://accept.paymob.com/api/");
    }

    public async Task<string> GeneratePaymentUrlAsync(Guid transactionId, decimal amount, string billingName, string billingEmail)
    {
        
        var authResponse = await _httpClient.PostAsJsonAsync("auth/tokens", new { api_key = _settings.ApiKey });
        authResponse.EnsureSuccessStatusCode();
        var authResult = await authResponse.Content.ReadFromJsonAsync<JsonElement>();
        string authToken = authResult.GetProperty("token").GetString() ?? string.Empty;

        
        int amountCents = (int)(amount * 100);
        var orderPayload = new
        {
            auth_token = authToken,
            delivery_needed = "false",
            amount_cents = amountCents.ToString(),
            currency = "EGP",
            merchant_order_id = transactionId.ToString()
        };

        var orderResponse = await _httpClient.PostAsJsonAsync("ecommerce/orders", orderPayload);
        orderResponse.EnsureSuccessStatusCode();
        var orderResult = await orderResponse.Content.ReadFromJsonAsync<JsonElement>();
        string paymobOrderId = orderResult.GetProperty("id").GetRawText();

        
        var keyPayload = new
        {
            auth_token = authToken,
            amount_cents = amountCents.ToString(),
            expiration = 3600, 
            order_id = paymobOrderId,
            billing_data = new
            {
                apartment = "NA",
                email = billingEmail,
                floor = "NA",
                first_name = billingName,
                street = "NA",
                building = "NA",
                phone_number = "NA", 
                shipping_method = "NA",
                postal_code = "NA",
                city = "NA",
                country = "EG",
                last_name = "NA",
                state = "NA"
            },
            currency = "EGP",
            integration_id = _settings.IntegrationId
        };

        var keyResponse = await _httpClient.PostAsJsonAsync("acceptance/payment_keys", keyPayload);
        keyResponse.EnsureSuccessStatusCode();
        var keyResult = await keyResponse.Content.ReadFromJsonAsync<JsonElement>();
        string paymentToken = keyResult.GetProperty("token").GetString() ?? string.Empty;

        
        return $"https://accept.paymob.com/api/acceptance/iframes/{_settings.IframeId}?payment_token={paymentToken}";
    }

    public Task<bool> ValidateWebhookSignatureAsync(string payload, string signature)
    {
        
        return Task.FromResult(true);
    }
}