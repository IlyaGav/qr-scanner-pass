using AutoMapper;
using QRScannerPass.Core.Models;

namespace QRScannerPass.Web.DtoModels;

public class TicketDto
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public TicketState State { get; set; }

    public DateTime CreateDate { get; set; }
}

/// <inheritdoc />
public class CourierProfile : Profile
{
    /// <inheritdoc />
    public CourierProfile()
    {
        CreateMap<Ticket, TicketDto>().ReverseMap();
    }
}