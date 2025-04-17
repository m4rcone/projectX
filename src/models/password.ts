import bycriptjs from "bcryptjs";

async function hash(password: string) {
  const rounds = getNumberOfRounds();
  const pepper = getPepper();
  const spicyPassword = password + pepper;

  return await bycriptjs.hash(spicyPassword, rounds);
}

async function compare(providedPassword: string, storedPassword: string) {
  const pepper = getPepper();
  const spicyPassword = providedPassword + pepper;

  return bycriptjs.compare(spicyPassword, storedPassword);
}

function getNumberOfRounds() {
  return process.env.NODE_ENV === "production" ? 14 : 1;
}

function getPepper() {
  const pepper =
    process.env.NODE_ENV === "production"
      ? process.env.PEPPER
      : "CAROLINA_REAPER";

  if (!pepper) {
    console.log("PEPPER não definido no ambiente de produção.");
    throw new Error("PEPPER não definido no ambiente de produção.");
  }

  return pepper;
}

const password = {
  hash,
  compare,
};

export default password;
