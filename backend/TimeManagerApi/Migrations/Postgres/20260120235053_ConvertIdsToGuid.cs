using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimeManagerApi.Migrations.Postgres
{
    /// <inheritdoc />
    public partial class ConvertIdsToGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Drop all foreign keys first
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" DROP CONSTRAINT IF EXISTS \"FK_TaskTimeSessions_User_UserId\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" DROP CONSTRAINT IF EXISTS \"FK_TaskTimeSessions_Tasks_TaskId\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" DROP CONSTRAINT IF EXISTS \"FK_TaskTimeSessions_Projects_ProjectId\";");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" DROP CONSTRAINT IF EXISTS \"FK_Tasks_Projects_ProjectId\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" DROP CONSTRAINT IF EXISTS \"FK_Projects_User_ownerId\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" DROP CONSTRAINT IF EXISTS \"FK_Projects_Projects_ParentProjectId\";");

            // Step 2: Drop primary keys
            migrationBuilder.Sql("ALTER TABLE \"User\" DROP CONSTRAINT IF EXISTS \"PK_User\";");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" DROP CONSTRAINT IF EXISTS \"PK_Tasks\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" DROP CONSTRAINT IF EXISTS \"PK_Projects\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" DROP CONSTRAINT IF EXISTS \"PK_TaskTimeSessions\";");

            // Step 3: Create temporary uuid columns and populate them
            migrationBuilder.Sql("ALTER TABLE \"User\" ADD COLUMN \"Id_new\" uuid DEFAULT gen_random_uuid();");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" ADD COLUMN \"Id_new\" uuid DEFAULT gen_random_uuid();");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ADD COLUMN \"Id_new\" uuid DEFAULT gen_random_uuid();");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD COLUMN \"Id_new\" uuid DEFAULT gen_random_uuid();");

            // Step 4: Create mapping tables to maintain relationships
            migrationBuilder.Sql("CREATE TEMP TABLE user_id_map AS SELECT \"Id\" AS old_id, gen_random_uuid() AS new_id FROM \"User\";");
            migrationBuilder.Sql("CREATE TEMP TABLE task_id_map AS SELECT \"Id\" AS old_id, gen_random_uuid() AS new_id FROM \"Tasks\";");
            migrationBuilder.Sql("CREATE TEMP TABLE project_id_map AS SELECT \"Id\" AS old_id, gen_random_uuid() AS new_id FROM \"Projects\";");
            migrationBuilder.Sql("CREATE TEMP TABLE task_session_id_map AS SELECT \"Id\" AS old_id, gen_random_uuid() AS new_id FROM \"TaskTimeSessions\";");

            // Step 5: Update the new ID columns with mapped values
            migrationBuilder.Sql("UPDATE \"User\" u SET \"Id_new\" = m.new_id FROM user_id_map m WHERE u.\"Id\" = m.old_id;");
            migrationBuilder.Sql("UPDATE \"Tasks\" t SET \"Id_new\" = m.new_id FROM task_id_map m WHERE t.\"Id\" = m.old_id;");
            migrationBuilder.Sql("UPDATE \"Projects\" p SET \"Id_new\" = m.new_id FROM project_id_map m WHERE p.\"Id\" = m.old_id;");
            migrationBuilder.Sql("UPDATE \"TaskTimeSessions\" ts SET \"Id_new\" = m.new_id FROM task_session_id_map m WHERE ts.\"Id\" = m.old_id;");

            // Step 6: Create new foreign key columns as uuid
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD COLUMN \"UserId_new\" uuid;");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD COLUMN \"TaskId_new\" uuid;");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD COLUMN \"ProjectId_new\" uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" ADD COLUMN \"ProjectId_new\" uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ADD COLUMN \"ownerId_new\" uuid;");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ADD COLUMN \"ParentProjectId_new\" uuid;");

            // Step 7: Populate foreign key columns with mapped values
            migrationBuilder.Sql(@"
                UPDATE ""TaskTimeSessions"" ts SET ""UserId_new"" = m.new_id
                FROM user_id_map m WHERE ts.""UserId"" = m.old_id;

                UPDATE ""TaskTimeSessions"" ts SET ""TaskId_new"" = m.new_id
                FROM task_id_map m WHERE ts.""TaskId"" = m.old_id;

                UPDATE ""TaskTimeSessions"" ts SET ""ProjectId_new"" = m.new_id
                FROM project_id_map m WHERE ts.""ProjectId"" = m.old_id;

                UPDATE ""Tasks"" t SET ""ProjectId_new"" = m.new_id
                FROM project_id_map m WHERE t.""ProjectId"" = m.old_id;

                UPDATE ""Projects"" p SET ""ownerId_new"" = m.new_id
                FROM user_id_map m WHERE p.""ownerId"" = m.old_id;

                UPDATE ""Projects"" p SET ""ParentProjectId_new"" = m.new_id
                FROM project_id_map m WHERE p.""ParentProjectId"" = m.old_id;
            ");

            // Step 8: Drop old columns
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" DROP COLUMN \"UserId\", DROP COLUMN \"TaskId\", DROP COLUMN \"ProjectId\", DROP COLUMN \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" DROP COLUMN \"ProjectId\", DROP COLUMN \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" DROP COLUMN \"ownerId\", DROP COLUMN \"ParentProjectId\", DROP COLUMN \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"User\" DROP COLUMN \"Id\";");

            // Step 9: Rename new columns to original names
            migrationBuilder.Sql("ALTER TABLE \"User\" RENAME COLUMN \"Id_new\" TO \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" RENAME COLUMN \"Id_new\" TO \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" RENAME COLUMN \"ProjectId_new\" TO \"ProjectId\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" RENAME COLUMN \"Id_new\" TO \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" RENAME COLUMN \"ownerId_new\" TO \"ownerId\";");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" RENAME COLUMN \"ParentProjectId_new\" TO \"ParentProjectId\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" RENAME COLUMN \"Id_new\" TO \"Id\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" RENAME COLUMN \"UserId_new\" TO \"UserId\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" RENAME COLUMN \"TaskId_new\" TO \"TaskId\";");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" RENAME COLUMN \"ProjectId_new\" TO \"ProjectId\";");

            // Step 10: Set NOT NULL constraints
            migrationBuilder.Sql("ALTER TABLE \"User\" ALTER COLUMN \"Id\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" ALTER COLUMN \"Id\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" ALTER COLUMN \"ProjectId\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ALTER COLUMN \"Id\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ALTER COLUMN \"ownerId\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ALTER COLUMN \"Id\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ALTER COLUMN \"UserId\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ALTER COLUMN \"TaskId\" SET NOT NULL;");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ALTER COLUMN \"ProjectId\" SET NOT NULL;");

            // Step 11: Re-add primary keys
            migrationBuilder.Sql("ALTER TABLE \"User\" ADD PRIMARY KEY (\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" ADD PRIMARY KEY (\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ADD PRIMARY KEY (\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD PRIMARY KEY (\"Id\");");

            // Step 12: Re-add foreign keys
            migrationBuilder.Sql("ALTER TABLE \"Tasks\" ADD CONSTRAINT \"FK_Tasks_Projects_ProjectId\" FOREIGN KEY (\"ProjectId\") REFERENCES \"Projects\"(\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ADD CONSTRAINT \"FK_Projects_User_ownerId\" FOREIGN KEY (\"ownerId\") REFERENCES \"User\"(\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"Projects\" ADD CONSTRAINT \"FK_Projects_Projects_ParentProjectId\" FOREIGN KEY (\"ParentProjectId\") REFERENCES \"Projects\"(\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD CONSTRAINT \"FK_TaskTimeSessions_User_UserId\" FOREIGN KEY (\"UserId\") REFERENCES \"User\"(\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD CONSTRAINT \"FK_TaskTimeSessions_Tasks_TaskId\" FOREIGN KEY (\"TaskId\") REFERENCES \"Tasks\"(\"Id\");");
            migrationBuilder.Sql("ALTER TABLE \"TaskTimeSessions\" ADD CONSTRAINT \"FK_TaskTimeSessions_Projects_ProjectId\" FOREIGN KEY (\"ProjectId\") REFERENCES \"Projects\"(\"Id\");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Rollback is complex for this type of migration
            // You may want to manually handle rollback or create a separate migration
            throw new NotImplementedException("Rollback of GUID conversion is not implemented.");
        }
    }
}
