using Core.Application.Features.Financials.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PaymentController : ControllerBase
{
    private readonly IMediator _mediator;

    public PaymentController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize]
    [HttpPost("initiate")]
    public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentCommand command)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        
        command.UserId = userId;
        command.GatewayName = "Paymob";

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [AllowAnonymous] 
    [HttpPost("webhook/paymob")]
    public async Task<IActionResult> PaymobWebhook([FromQuery] string hmac)
    {
        
        using var reader = new StreamReader(Request.Body);
        var rawPayload = await reader.ReadToEndAsync();

        
        var parsedPayload = System.Text.Json.JsonDocument.Parse(rawPayload);
        var obj = parsedPayload.RootElement.GetProperty("obj");
        var transactionRef = obj.GetProperty("id").GetInt32().ToString();
        var isSuccess = obj.GetProperty("success").GetBoolean();

        var command = new ProcessPaymentWebhookCommand
        {
            TransactionReference = transactionRef,
            IsSuccess = isSuccess,
            HmacSignature = hmac ?? string.Empty,
            RawPayload = rawPayload
        };

        await _mediator.Send(command);

        
        return Ok();
    }
}