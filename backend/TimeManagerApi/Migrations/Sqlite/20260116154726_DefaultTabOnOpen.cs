using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagerApi.Migrations.Sqlite
{
    /// <inheritdoc />
    public partial class DefaultTabOnOpen : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DefaultTabOnOpen",
                table: "Projects",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DefaultTabOnOpen",
                table: "Projects");
        }
    }
}
