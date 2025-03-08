import { NextResponse } from "next/server";
import migrationRunner from "node-pg-migrate";
import { join } from "path";
import database from "infra/database";

export async function GET() {
  try {
    const pendingMigrations = await runMigrations(true);

    return NextResponse.json(pendingMigrations);
  } catch (error) {
    console.error("Erro ao verificar migrações pendentes: ", error);

    return NextResponse.json({
      error: "Erro ao verificar migrações pendentes.",
      status: 500,
    });
  }
}

export async function POST() {
  try {
    const migratedMigrations = await runMigrations(false);

    if (migratedMigrations.length > 0) {
      return NextResponse.json(migratedMigrations, { status: 201 });
    }

    return NextResponse.json(migratedMigrations);
  } catch (error) {
    console.error("Erro ao executar migrações pendentes: ", error);

    return NextResponse.json({
      error: "Erro ao executar migrações pendentes.",
      status: 500,
    });
  }
}

async function runMigrations(dryRun: boolean) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const migrationsPath = join(process.cwd(), "src", "infra", "migrations");

    const result = await migrationRunner({
      dbClient: dbClient,
      dryRun,
      dir: migrationsPath,
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    return result;
  } catch (error) {
    console.error("Erro ao rodar as migrações: ", error);
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}
