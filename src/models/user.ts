import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors";
import password from "models/password";

export type UserInputValues = {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  created_at?: Date;
  updated_at?: Date;
};

async function findOneByUsername(username: string) {
  const userFound = await runSelectQuery(username);
  return userFound;

  async function runSelectQuery(username: string) {
    const result = await database.query({
      text: `
        SELECT 
          *
        FROM 
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique o username informado e tente novamente.",
      });
    }

    return result.rows[0];
  }
}

async function findOneByEmail(email: string) {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email: string) {
    const result = await database.query({
      text: `
        SELECT
          *
        FROM 
          users
        WHERE
          LOWER(email) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [email],
    });

    if (result.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema.",
        action: "Verifique o email informado e tente novamente.",
      });
    }

    return result.rows[0];
  }
}

async function create(userInputValues: UserInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);

  return newUser;

  async function runInsertQuery(userInputValues: UserInputValues) {
    const result = await database.query({
      text: `
        INSERT INTO 
          users (username, email, password) 
        VALUES 
          ($1, $2, $3)
        RETURNING
          *
        ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });

    return result.rows[0];
  }
}

async function update(username: string, userInputValues: UserInputValues) {
  const currentUser = await findOneByUsername(username);

  if ("username" in userInputValues) {
    if (username.toLowerCase() !== userInputValues.username.toLowerCase()) {
      await validateUniqueUsername(userInputValues.username);
    }
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);

  return updatedUser;

  async function runUpdateQuery(userWithNewValues: UserInputValues) {
    const result = await database.query({
      text: `
        UPDATE
          users
        SET 
          username = $1,
          email = $2,
          password = $3,
          updated_at = timezone('UTC', now())
        WHERE
          id = $4
        RETURNING
          *
        ;`,
      values: [
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
        userWithNewValues.id,
      ],
    });

    return result.rows[0];
  }
}

async function validateUniqueUsername(username: string) {
  const result = await database.query({
    text: `
      SELECT 
        username
      FROM 
        users
      WHERE
        LOWER(username) = LOWER($1)
      ;`,
    values: [username],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O username informado já está sendo utilizado.",
      action: "Utilize outro username para realizar a operação.",
    });
  }
}

async function validateUniqueEmail(email: string) {
  const result = await database.query({
    text: `
      SELECT 
        email
      FROM 
        users
      WHERE
        LOWER(email) = LOWER($1)
      ;`,
    values: [email],
  });

  if (result.rowCount > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro email para realizar a operação.",
    });
  }
}

async function hashPasswordInObject(userInputValues: UserInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

const user = {
  create,
  update,
  findOneByUsername,
  findOneByEmail,
};

export default user;
