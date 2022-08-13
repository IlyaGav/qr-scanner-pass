using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRScannerPass.Core.Models;
using QRScannerPass.Data;
using QRScannerPass.Web.Auth;
using QRScannerPass.Web.DtoModels;
using QRScannerPass.Web.Extensions;

namespace QRScannerPass.Web.Controllers;

[ApiController]
[Route("api/ticket")]
[Authorize]
public class TicketController : ControllerBase
{
    private readonly ILogger<TicketController> _logger;
    private readonly IMapper _mapper;
    private readonly Context _context;

    public TicketController(ILogger<TicketController> logger, Context context, IMapper mapper)
    {
        _logger = logger;
        _context = context;
        _mapper = mapper;
    }

    [HttpPost("find")]
    public async Task<ActionResult<FindTicketResponseDto>> Find(FindTicketRequestDto request)
    {
        var query = _context.Tickets
            .OrderByDescending(t => t.CreateDate)
            .WhereIf(request.From is { }, t => t.CreateDate >= request.From)
            .WhereIf(request.To is { }, t => t.CreateDate <= request.To)
            .WhereIf(request.Name is { }, t => t.Name.ToLower().Contains(request.Name!.ToLower()))
            .WhereIf(request.Code is { }, t => t.Code.ToLower().Contains(request.Code!.ToLower()))
            .WhereIf(request.State is { }, t => t.State == request.State);

        var totalCount = await query.CountAsync();

        if (request.Offset is { })
        {
            query = query.Skip(request.Offset.Value);
        }

        if (request.Limit is { })
        {
            query = query.Take(request.Limit.Value);
        }

        var results = await query.ToListAsync();

        return new FindTicketResponseDto
        {
            TotalCount = totalCount,
            Results = _mapper.Map<TicketDto[]>(results.ToArray())
        };
    }

    [HttpGet("{code}")]
    [AllowAnonymous]
    public async Task<ActionResult<TicketDto?>> Get(string code)
    {
        var ticket = await _context.Tickets.FindAsync(code);

        if (ticket is null)
        {
            return NotFound();
        }

        return Ok(_mapper.Map<TicketDto>(ticket));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] TicketDto dtoModel)
    {
        var ticket = _mapper.Map<Ticket>(dtoModel);

        ticket.State = TicketState.Inactivated;
        ticket.CreateDate = DateTime.Now;

        await _context.Tickets.AddAsync(ticket);

        await _context.SaveChangesAsync();

        return Ok();
    }


    [HttpPut("{code}")]
    public async Task<IActionResult> Update(string code, [FromBody] TicketDto dtoModel)
    {
        var ticket = await _context.Tickets.FindAsync(code);

        if (ticket is null)
        {
            return NotFound();
        }

        ticket.Name = dtoModel.Name;
        ticket.State = dtoModel.State;

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{code}")]
    public async Task<IActionResult> Delete(string code)
    {
        var ticket = await _context.Tickets.FindAsync(code);

        if (ticket is null)
        {
            return NotFound();
        }

        _context.Remove(ticket);

        await _context.SaveChangesAsync();

        return Ok();
    }
}