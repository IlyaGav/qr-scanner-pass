namespace QRScannerPass.Web.DtoModels;

public class FindTicketResponseDto
{
    public long TotalCount { get; set; }

    public TicketDto[] Results { get; set; }
}