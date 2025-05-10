import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import user, { type UserInputValues } from "models/user";
import { faker } from "@faker-js/faker";

async function waitForAllServices() {
  await waitForWebService();

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
  userObject: UserInputValues,
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
    password: userObject.password || "validPassword",
  });
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
};

export default orchestrator;
