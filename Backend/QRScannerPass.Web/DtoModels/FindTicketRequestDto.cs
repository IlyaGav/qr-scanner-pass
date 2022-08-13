using QRScannerPass.Core.Models;

namespace QRScannerPass.Web.DtoModels;

public class FindTicketRequestDto
{
    public string? Code { get; set; }

    public string? Name { get; set; }

    public TicketState? State { get; set; }

    public DateTime? From { get; set; }

    public DateTime? To { get; set; }
    
    public int? Limit { get; set; }

    public int? Offset { get; set; }
}