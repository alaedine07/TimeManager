#!/bin/bash

MIGRATION_NAME=$1
ENVIRONMENT=$2

if [ -z "$MIGRATION_NAME" ] || [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./migrate.sh <MigrationName> <dev|prod>"
  exit 1
fi

if [ "$ENVIRONMENT" = "dev" ]; then
  CONTEXT="SqliteTaskManagementDbContext"
elif [ "$ENVIRONMENT" = "prod" ]; then
  CONTEXT="PostgresTaskManagementDbContext"
else
  echo "Invalid environment. Use dev or prod."
  exit 1
fi

echo "Adding migration '$MIGRATION_NAME' using context '$CONTEXT'..."

dotnet ef migrations add $MIGRATION_NAME --context $CONTEXT

echo "Updating database..."

dotnet ef database update --context $CONTEXT

echo "Done ✅"
