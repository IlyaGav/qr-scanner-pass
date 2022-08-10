namespace QRScannerPass.Core.Models;

public class QrCode
{
    public string Code { get; set; } = string.Empty;

    public long UserId { get; set; }

    public bool Activated { get; set; }

    public User User { get; set; } = null!;
}

