using Core.Application.Features.Catalog.Commands;
using Core.Application.Features.Catalog.Queries;
using Core.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ProductBundlesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductBundlesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var bundles = await _mediator.Send(new GetAllProductBundlesQuery());
        return Ok(bundles);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductBundleCommand command)
    {
        var bundleId = await _mediator.Send(command);
        return Ok(new { Message = "Product bundle created successfully.", BundleId = bundleId });
    }
}