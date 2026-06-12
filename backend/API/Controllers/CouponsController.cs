using Core.Application.Features.Sales.Commands;
using Core.Application.Features.Sales.Queries;
using Core.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CouponsController : ControllerBase
{
    private readonly IMediator _mediator;

    public CouponsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCouponCommand command)
    {
        var couponId = await _mediator.Send(command);
        return Ok(new { Message = "Coupon created successfully.", CouponId = couponId });
    }

    [Authorize] 
    [HttpGet("validate/{code}")]
    public async Task<IActionResult> Validate(string code)
    {
        var query = new ValidateCouponQuery { Code = code };
        var couponDto = await _mediator.Send(query);

        return Ok(couponDto);
    }
}