using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QRScannerPass.Core.Models;
using QRScannerPass.Data;
using QRScannerPass.Web.DtoModels;

namespace QRScannerPass.Web.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly ILogger<UserController> _logger;
    private readonly IMapper _mapper;
    private readonly Context _context;

    public UserController(ILogger<UserController> logger, Context context, IMapper mapper)
    {
        _logger = logger;
        _context = context;
        _mapper = mapper;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await _context.Users
            .Join(_context.QrCodes, user => user.Id, userQr => userQr.UserId,
                (user, code) => new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    QrCode = code.Code,
                    Activated = code.Activated
                })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("find")]
    public async Task<ActionResult<List<UserDto>>> Find([FromQuery] string name)
    {
        var users = await _context.Users
            .Where(u => u.FullName.ToLower().Contains(name.ToLower()))
            .Join(_context.QrCodes, user => user.Id, userQr => userQr.UserId,
                (user, code) => new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    QrCode = code.Code,
                    Activated = code.Activated
                })
            .ToListAsync();

        return Ok(users);
    }

    // [HttpGet("{id:long}")]
    // public Task<ActionResult<UserDto>> GetById(long id)
    // {
    //     return null;
    // }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<UserDto?>> Get(long id)
    {
        var user = await _context.Users
            .Join(_context.QrCodes, user => user.Id, userQr => userQr.UserId,
                (user, code) => new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    QrCode = code.Code,
                    Activated = code.Activated
                }).FirstOrDefaultAsync(u => u.Id == id);

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserDto dtoModel)
    {
        var user = _mapper.Map<User>(dtoModel);

        // await using var transaction = await _context.Database.BeginTransactionAsync();

        var userQr = new QrCode
        {
            Code = dtoModel.QrCode ?? string.Empty,
            Activated = false,
            User = user
        };

        await _context.Users.AddAsync(user);
        await _context.QrCodes.AddAsync(userQr);

        await _context.SaveChangesAsync();

        return Ok();
    }


    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] UserDto dtoModel)
    {
        var user = await _context.Users.FirstAsync(u => u.Id == id);

        var qr = await _context.QrCodes.FirstAsync(u => u.UserId == id);

        user.FullName = dtoModel.FullName;

        qr.Code = dtoModel.QrCode;
        qr.Activated = dtoModel.Activated;

        await _context.SaveChangesAsync();

        return Ok();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var user = await _context.Users.FirstAsync(u => u.Id == id);

        _context.Remove(user);

        await _context.SaveChangesAsync();

        return Ok();
    }
}