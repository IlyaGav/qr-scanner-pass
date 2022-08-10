namespace QRScannerPass.Web.DtoModels;

public class QrCodeDto
{
    public string Code { get; set; } = string.Empty;

    public string FullName { get; set; }

    public bool Activated { get; set; }
}