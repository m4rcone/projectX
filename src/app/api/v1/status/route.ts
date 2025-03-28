import { NextResponse } from "next/server";
import database from "infra/database";
import { MethodNotAllowedError } from "infra/errors";
import controller from "infra/controller";

export async function GET() {
  try {
    const updatedAt = new Date().toISOString();
    const databaseName = process.env.POSTGRES_DB;

    const [resultVersion, resultMaxConnections, resultOpenedConnections] =
      await Promise.all([
        database.query("SHOW server_version;"),
        database.query("SHOW max_connections;"),
        database.query({
          text: "SELECT COUNT(*)::int as opened_connections FROM pg_stat_activity WHERE datname = $1;",
          values: [databaseName],
        }),
      ]);

    const version = resultVersion.rows[0].server_version;
    const maxConnections = parseInt(
      resultMaxConnections.rows[0].max_connections,
    );
    const openedConnections =
      resultOpenedConnections.rows[0].opened_connections;

    return NextResponse.json(
      {
        updated_at: updatedAt,
        dependencies: {
          database: {
            version: version,
            max_connections: maxConnections,
            opened_connections: openedConnections,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return controller.errorHandlerResponse(error);
  }
}

export function POST() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export function PUT() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export function DELETE() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}

export function PATCH() {
  const publicErrorObject = new MethodNotAllowedError();

  return controller.errorHandlerResponse(publicErrorObject);
}
