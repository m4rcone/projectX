import { NextResponse } from "next/server";
import migrationRunner from "node-pg-migrate";
import { join } from "path";
import database from "infra/database";

export async function GET() {
  const pendingMigrations = await runMigrations(true);

  return NextResponse.json(pendingMigrations);
}

export async function POST() {
  const migratedMigrations = await runMigrations(false);

  if (migratedMigrations.length > 0) {
    return NextResponse.json(migratedMigrations, { status: 201 });
  }

  return NextResponse.json(migratedMigrations);
}

async function runMigrations(dryRun: boolean) {
  const dbClient = await database.getNewClient();

  const migrationsPath = join(process.cwd(), "src", "infra", "migrations");
  console.log("Caminho das migrações: ", migrationsPath); // Debug

  const result = await migrationRunner({
    dbClient: dbClient,
    dryRun,
    dir: migrationsPath,
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  });
  await dbClient.end();

  return result;
}
