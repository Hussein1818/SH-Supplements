using Core.Application.Features.Catalog.Commands;
using Core.Application.Features.Catalog.Queries;
using Core.Domain.Constants;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Core.Application.Settings;
namespace API.Controllers;


[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] GetProductsQuery query)
    {
        var products = await _mediator.Send(query);
        return Ok(products);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var product = await _mediator.Send(new GetProductByIdQuery { Id = id });
        return Ok(product);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        var productId = await _mediator.Send(command);
        return Ok(new { Message = "Product created successfully.", ProductId = productId });
    }

    [HttpPost("{productId}/notify-restock")]
    [Authorize]
    public async Task<IActionResult> RequestRestockNotification(Guid productId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { Message = "User is not authorized." });

        var command = new CreateStockNotificationCommand { UserId = userId, ProductId = productId };

        await _mediator.Send(command);
        return Ok(new { Message = "You will be notified when this product is back in stock." });
    }
    [HttpPost("ingredients")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddIngredientGlossary([FromBody] AddIngredientGlossaryCommand command)
    {
        var ingredientId = await _mediator.Send(command);
        return Ok(new { Message = "Ingredient added to glossary successfully.", IngredientId = ingredientId });
    }

    [HttpPost("{productId}/serial-numbers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddProductSerialNumbers(Guid productId, [FromBody] List<string> serialNumbers)
    {
        var command = new AddProductSerialNumbersCommand
        {
            ProductId = productId,
            SerialNumbers = serialNumbers
        };

        var addedCount = await _mediator.Send(command);

        return Ok(new { Message = $"Successfully registered {addedCount} authentic serial numbers." });
    }
    [HttpGet("verify-serial/{serialNumber}")]
    public async Task<IActionResult> VerifySerialNumber(string serialNumber)
    {
        var command = new VerifySerialNumberCommand { SerialNumber = serialNumber };
        var result = await _mediator.Send(command);

        return Ok(result);
    }

    [HttpGet("ingredients/{name}")]
    public async Task<IActionResult> GetIngredientDetails(string name)
    {
        var query = new GetIngredientDetailsQuery { IngredientName = name };
        var result = await _mediator.Send(query);

        return Ok(result);
    }
    [HttpGet("personalized-for-me")]
    [Authorize]
    public async Task<IActionResult> GetPersonalizedProducts()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var query = new GetPersonalizedProductsQuery { UserId = userId! };
        var result = await _mediator.Send(query);
        return Ok(result);
    }
    [HttpPost("{id}/alternatives")]
    [Authorize(Roles = Roles.Admin)] 
    public async Task<IActionResult> AddAlternative(Guid id, [FromBody] Guid alternativeProductId)
    {
        var command = new AddProductAlternativeCommand
        {
            ProductId = id,
            AlternativeProductId = alternativeProductId
        };

        var resultId = await _mediator.Send(command);

        return Ok(new { Message = "Alternative product linked successfully.", LinkId = resultId });
    }

    [HttpGet("{id}/alternatives")]
    [AllowAnonymous] 
    public async Task<IActionResult> GetAlternatives(Guid id)
    {
        var query = new GetProductAlternativesQuery { ProductId = id };
        var alternatives = await _mediator.Send(query);

        return Ok(alternatives);
    }
    [HttpPost("analyze-stack")]
    [AllowAnonymous] 
    public async Task<IActionResult> AnalyzeStack([FromBody] AnalyzeStackConflictsQuery query)
    {
        var analysisResult = await _mediator.Send(query);

        return Ok(analysisResult);
    }
    [HttpPost("{id}/active-ingredients")]
    [Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> AddActiveIngredient(Guid id, [FromBody] AddProductActiveIngredientCommand command)
    {
        command.ProductId = id;

        var resultId = await _mediator.Send(command);

        return Ok(new { Message = "Active ingredient linked to product successfully.", LinkId = resultId });
    }
}