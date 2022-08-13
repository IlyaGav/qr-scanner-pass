namespace QRScannerPass.Core.Models;

public class Ticket
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public TicketState State { get; set; }

    public DateTime CreateDate { get; set; }
}

public enum TicketState
{
    Activated = 1,
    Inactivated = 2
}