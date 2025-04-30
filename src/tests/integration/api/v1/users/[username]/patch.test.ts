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
      const username1Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "username1",
            email: "username1@email.com",
            password: "abc123",
          }),
        },
      );

      expect(username1Response.status).toBe(201);

      const username2Response = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "username2",
            email: "username2@email.com",
            password: "abc123",
          }),
        },
      );

      expect(username2Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/username2",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "username1",
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
      const email1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@email.com",
          password: "abc123",
        }),
      });

      const email2Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@email.com",
          password: "abc123",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/email2",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@email.com",
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
      const responsePOST = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "username",
          email: "username@email.com",
          password: "abc123",
        }),
      });

      const responsePATCH = await fetch(
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

      expect(responsePATCH.status).toBe(200);
    });

    test("With unique 'username'", async () => {
      const responseCreate = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUsername",
          email: "uniqueUsername@email.com",
          password: "uniqueUsername",
        }),
      });
      const responseCreateBody = await responseCreate.json();

      expect(responseCreate.status).toBe(201);

      const responseUpdate = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUsername",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUsernameAtualizado",
          }),
        },
      );
      const responseUpdateBody = await responseUpdate.json();

      expect(responseUpdate.status).toBe(200);

      expect(responseUpdateBody).toEqual({
        id: responseCreateBody.id,
        username: "uniqueUsernameAtualizado",
        email: "uniqueUsername@email.com",
        password: responseCreateBody.password,
        created_at: responseCreateBody.created_at,
        updated_at: responseUpdateBody.updated_at,
      });

      expect(
        responseUpdateBody.updated_at > responseUpdateBody.created_at,
      ).toBe(true);
    });

    test("With unique 'email'", async () => {
      const responseCreate = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail",
          email: "uniqueEmail@email.com",
          password: "uniqueEmail",
        }),
      });
      const responseCreateBody = await responseCreate.json();

      expect(responseCreate.status).toBe(201);

      const responseUpdate = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmailAtualizado@email.com",
          }),
        },
      );
      const responseUpdateBody = await responseUpdate.json();

      expect(responseUpdate.status).toBe(200);

      expect(responseUpdateBody).toEqual({
        id: responseCreateBody.id,
        username: "uniqueEmail",
        email: "uniqueEmailAtualizado@email.com",
        password: responseCreateBody.password,
        created_at: responseCreateBody.created_at,
        updated_at: responseUpdateBody.updated_at,
      });

      expect(
        responseUpdateBody.updated_at > responseUpdateBody.created_at,
      ).toBe(true);
    });

    test("With new 'password'", async () => {
      const responseCreate = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: "newPassword",
          email: "newPassword@email.com",
          password: "newPassword",
        }),
      });
      const responseCreateBody = await responseCreate.json();

      expect(responseCreate.status).toBe(201);

      const responseUpdate = await fetch(
        "http://localhost:3000/api/v1/users/newPassword",
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            password: "updatedNewPassword",
          }),
        },
      );
      const responseUpdateBody = await responseUpdate.json();

      expect(responseUpdate.status).toBe(200);

      expect(responseUpdateBody).toEqual({
        id: responseCreateBody.id,
        username: "newPassword",
        email: "newPassword@email.com",
        password: responseUpdateBody.password,
        created_at: responseCreateBody.created_at,
        updated_at: responseUpdateBody.updated_at,
      });

      expect(
        responseUpdateBody.updated_at > responseUpdateBody.created_at,
      ).toBe(true);

      const correctPassword = await password.compare(
        "updatedNewPassword",
        responseUpdateBody.password,
      );
      const incorrectPassword = await password.compare(
        "SenhaIncorreta",
        responseUpdateBody.password,
      );

      expect(correctPassword).toBe(true);
      expect(incorrectPassword).toBe(false);
    });
  });
});
