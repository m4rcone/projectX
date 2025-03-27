import migrationRunner from "node-pg-migrate";
import { resolve } from "path";
import database from "infra/database";
import { ServiceError } from "infra/errors";

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

const migrator = {
  runMigrations,
};

export default migrator;
