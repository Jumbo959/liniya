import crypto from "crypto";

export const COOKIE = "liniya_session";

function secret() {
  return process.env.ADMIN_SECRET || "liniya-demo-secret-change-me";
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "liniya-2027";
}

export function checkPassword(input: string) {
  const a = crypto.createHash("sha256").update(input).digest();
  const b = crypto.createHash("sha256").update(adminPassword()).digest();
  return crypto.timingSafeEqual(a, b);
}

export function signSession() {
  const exp = Date.now() + 14 * 24 * 3600 * 1000;
  const body = Buffer.from(JSON.stringify({ role: "admin", exp })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function isAuthed(token?: string | null) {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const left = Buffer.from(sig);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as { role?: string; exp?: number };
    return payload.role === "admin" && typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
