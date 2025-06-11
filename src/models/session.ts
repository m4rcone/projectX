import database from "infra/database";
import crypto from "node:crypto";

const EXPIRATION_IN_MILLISECONDS = 1000 * 60 * 60 * 24 * 30; // 30 Days

async function create(userId: string) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = EXPIRATION_IN_MILLISECONDS;

  const newSession = await insertQuery(token, userId, expiresAt);

  return newSession;

  async function insertQuery(token: string, userId: string, expiresAt: number) {
    const result = await database.query({
      text: `
        INSERT INTO
          sessions (token, user_id, expires_at)
        VALUES
          ($1, $2, timezone('UTC', now()) + ($3 || ' milliseconds')::interval)
        RETURNING
          *
      `,
      values: [token, userId, expiresAt],
    });

    return result.rows[0];
  }
}

const session = {
  create,
  EXPIRATION_IN_MILLISECONDS,
};

export default session;
