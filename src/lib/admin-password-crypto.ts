import { pbkdf2, randomBytes, timingSafeEqual } from "node:crypto";

const ITERATIONS = 600_000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const DIGEST = "sha256";

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

/** Store a salted PBKDF2 hash, never the password itself. */
export async function hashAdminPassword(password: string) {
  const salt = randomBytes(SALT_LENGTH);
  const hash = await derive(password, salt);
  return `pbkdf2$${ITERATIONS}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}

export async function verifyAdminPasswordHash(
  password: string,
  stored: string,
) {
  const [algorithm, iterationsText, saltText, hashText, ...rest] =
    stored.split("$");
  if (
    rest.length ||
    algorithm !== "pbkdf2" ||
    iterationsText !== String(ITERATIONS) ||
    !saltText ||
    !hashText
  )
    return false;

  try {
    const salt = Buffer.from(saltText, "base64url");
    const expected = Buffer.from(hashText, "base64url");
    if (salt.length !== SALT_LENGTH || expected.length !== KEY_LENGTH)
      return false;
    const actual = await derive(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function isStrongAdminPassword(password: string) {
  return password.length >= 12 && password.length <= 128;
}
