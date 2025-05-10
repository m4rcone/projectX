import password from "models/password";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With non-existent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "NovoNomeDeUsuarioInexistente",
          }),
        },
      );
      const responseBody = await response.json();

      expect(response.status).toBe(404);

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique o username informado e tente novamente.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "username1",
      });

      const createdUser2 = await orchestrator.createUser({
        username: "username2",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: createdUser1.username,
          }),
        },
      );
      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar a operação.",
        status_code: 400,
      });
    });

    test("With duplicated 'email'", async () => {
      const createdUser1 = await orchestrator.createUser({
        email: "email1@email.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: createdUser1.email,
          }),
        },
      );
      const responseBody = await response.json();

      expect(response.status).toBe(400);

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar a operação.",
        status_code: 400,
      });
    });

    test("With same 'username' but different case", async () => {
      await orchestrator.createUser({
        username: "username",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "UserName",
          }),
        },
      );

      expect(response.status).toBe(200);
    });

    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUsername",
      });
      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "newUniqueUsername",
          }),
        },
      );
      const responseBody = await response.json();

      expect(response.status).toBe(200);

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "newUniqueUsername",
        email: createdUser.email,
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const createdUser = await orchestrator.createUser({
        email: "unique-email@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "new-unique-email@email.com",
          }),
        },
      );
      const responseBody = await response.json();

      expect(response.status).toBe(200);

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: "new-unique-email@email.com",
        password: createdUser.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "password",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword",
          }),
        },
      );
      const responseBody = await response.json();

      expect(response.status).toBe(200);

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        password: responseBody.password,
        created_at: createdUser.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const correctPassword = await password.compare(
        "newPassword",
        responseBody.password,
      );
      const incorrectPassword = await password.compare(
        "incorrectPassword",
        responseBody.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });
  });
});
