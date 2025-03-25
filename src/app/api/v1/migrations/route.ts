import { NextResponse } from "next/server";
import migrationRunner from "node-pg-migrate";
import { resolve } from "path";
import database from "infra/database";
import { MethodNotAllowedError, ServiceError } from "infra/errors";
import controller from "infra/controller";

export async function GET() {
  try {
    const pendingMigrations = await runMigrations(true);

    return NextResponse.json(pendingMigrations, { status: 200 });
  } catch (error) {
    return controller.errorHandlerResponse(error);
  }
}

export async function POST() {
  try {
    const migratedMigrations = await runMigrations(false);

    if (migratedMigrations.length > 0) {
      return NextResponse.json(migratedMigrations, { status: 201 });
    }

    return NextResponse.json(migratedMigrations, { status: 200 });
  } catch (error) {
    return controller.errorHandlerResponse(error);
  }
}

async function runMigrations(dryRun: boolean) {
  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const migrationsPath = resolve("src", "infra", "migrations");

    const result = await migrationRunner({
      dbClient,
      dryRun,
      dir: migrationsPath,
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    });

    return result;
  } catch (error) {
    const serviceErrorObject = new ServiceError({
      cause: error,
      message: "Erro na conexão com o Database ou ao rodar Migrations.",
    });

    throw serviceErrorObject;
  } finally {
    if (dbClient) {
      await dbClient?.end();
    }
  }
}

export function PUT() {
  return methodNotAllowedResponse();
}

export function DELETE() {
  return methodNotAllowedResponse();
}

export function PATCH() {
  return methodNotAllowedResponse();
}

function methodNotAllowedResponse() {
  const publicErrorObject = new MethodNotAllowedError();

  return NextResponse.json(publicErrorObject, { status: 405 });
}
