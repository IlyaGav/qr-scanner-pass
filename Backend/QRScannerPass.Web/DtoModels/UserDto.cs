using AutoMapper;
using QRScannerPass.Core.Models;

namespace QRScannerPass.Web.DtoModels;

public class UserDto
{
    public long? Id { get; set; }

    public string? FullName { get; set; } = string.Empty;
    
    public string? QrCode { get; set; } = string.Empty;
    
    public bool Activated { get; set; }
}

/// <inheritdoc />
public class CourierProfile : Profile
{
    /// <inheritdoc />
    public CourierProfile()
    {
        CreateMap<User, UserDto>().ReverseMap();
    }
}