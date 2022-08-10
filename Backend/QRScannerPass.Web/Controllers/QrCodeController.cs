using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRScannerPass.Data;
using QRScannerPass.Web.DtoModels;

namespace QRScannerPass.Web.Controllers;

[Route("api/[controller]")]
public class QrCodeController : ControllerBase
{
    private readonly ILogger<QrCodeController> _logger;
    private readonly IMapper _mapper;
    private readonly Context _context;

    public QrCodeController(ILogger<QrCodeController> logger, IMapper mapper, Context context)
    {
        _logger = logger;
        _mapper = mapper;
        _context = context;
    }

    [HttpGet("activate/{code}")]
    public async Task<IActionResult> Activate(string code)
    {
        var qr = await _context.QrCodes.FirstOrDefaultAsync(qr => qr.Code == code);

        if (qr is null)
        {
            return NotFound();
        }

        if (qr.Activated)
        {
            return BadRequest();
        }

        qr.Activated = true;

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpGet("{code}")]
    public async Task<ActionResult<QrCodeDto>> Get(string code)
    {
        var qr = await _context.QrCodes
            .Include(qr => qr.User)
            .FirstOrDefaultAsync(qr => qr.Code == code);

        if (qr is null)
        {
            return NotFound();
        }

        return Ok(new QrCodeDto
        {
            FullName = qr.User.FullName,
            Code = qr.Code,
            Activated = qr.Activated
        });
    }
}