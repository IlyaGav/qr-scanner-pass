FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["QRScannerPass.Web/QRScannerPass.Web.csproj", "QRScannerPass.Web/"]
RUN dotnet restore "QRScannerPass.Web/QRScannerPass.Web.csproj"
COPY . .
WORKDIR "/src/QRScannerPass.Web"
RUN dotnet build "QRScannerPass.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "QRScannerPass.Web.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "QRScannerPass.Web.dll"]
