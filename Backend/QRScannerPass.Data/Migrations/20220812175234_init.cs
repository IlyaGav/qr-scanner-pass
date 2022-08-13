using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QRScannerPass.Data.Migrations
{
    public partial class init : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tickets",
                columns: table => new
                {
                    Code = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    State = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tickets", x => x.Code);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_CreateDate",
                table: "Tickets",
                column: "CreateDate");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_Name",
                table: "Tickets",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Tickets_State",
                table: "Tickets",
                column: "State");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tickets");
        }
    }
}
