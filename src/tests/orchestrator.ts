import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import user, { type UserInputValues } from "models/user";
import { faker } from "@faker-js/faker";
import session from "models/session";

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebService();
  await waitForEmailService();

  async function waitForWebService() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");
      if (response.status !== 200) {
        throw Error();
      }
    }
  }

  async function waitForEmailService() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      const response = await fetch(emailHttpUrl);
      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public");
}

async function runPendingMigrations() {
  await migrator.runMigrations(false);
}

const usedFakeUsername = new Set();
const usedFakeEmail = new Set();

async function createUser(
  userObject?: UserInputValues,
): Promise<UserInputValues> {
  let username = userObject?.username;
  let email = userObject?.email;

  while (!username) {
    username = faker.internet
      .username()
      .normalize("NFD")
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 30);
    if (usedFakeUsername.has(username)) {
      username = undefined;
    } else {
      usedFakeUsername.add(username);
    }
  }

  while (!email) {
    email = faker.internet.email();
    if (usedFakeEmail.has(email)) {
      email = undefined;
    } else {
      usedFakeEmail.add(email);
    }
  }

  return await user.create({
    username,
    email,
    password: userObject?.password || "validPassword",
  });
}

async function createSession(userId: string) {
  return session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();

  const lastEmail = emailListBody.pop();

  const emailTextReponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmail.id}.plain`,
  );
  const emailTextBody = await emailTextReponse.text();

  lastEmail.text = emailTextBody;

  return lastEmail;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
