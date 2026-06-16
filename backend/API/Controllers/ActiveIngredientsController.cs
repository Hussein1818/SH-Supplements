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
[Authorize(Roles = Roles.Admin)] 
public class ActiveIngredientsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ActiveIngredientsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddActiveIngredientCommand command)
    {
        var resultId = await _mediator.Send(command);
        return Ok(new { Message = "Active ingredient added to medical database successfully.", Id = resultId });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var query = new GetAllActiveIngredientsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}