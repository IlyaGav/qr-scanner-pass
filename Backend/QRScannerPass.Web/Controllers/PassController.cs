using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QRScannerPass.Core.Models;
using QRScannerPass.Data;

namespace QRScannerPass.Web.Controllers;

[Route("api/pass")]
[AllowAnonymous]
public class PassController : ControllerBase
{
    private readonly ILogger<PassController> _logger;
    private readonly Context _context;

    public PassController(ILogger<PassController> logger, Context context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> Activate(string code)
    {
        var ticket = await _context.Tickets.FindAsync(code);

        if (ticket is null)
        {
            return NotFound();
        }

        if (ticket.State == TicketState.Activated)
        {
            return BadRequest();
        }

        ticket.State = TicketState.Activated;

        await _context.SaveChangesAsync();

        return Ok();
    }
}