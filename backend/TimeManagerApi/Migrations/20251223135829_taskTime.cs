using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagerApi.Migrations
{
    /// <inheritdoc />
    public partial class taskTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProjectId",
                table: "TaskTimeSessions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_TaskTimeSessions_ProjectId",
                table: "TaskTimeSessions",
                column: "ProjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaskTimeSessions_Projects_ProjectId",
                table: "TaskTimeSessions",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaskTimeSessions_Projects_ProjectId",
                table: "TaskTimeSessions");

            migrationBuilder.DropIndex(
                name: "IX_TaskTimeSessions_ProjectId",
                table: "TaskTimeSessions");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "TaskTimeSessions");
        }
    }
}
