import { randomBytes } from "node:crypto";

// Qikink accepts at most 15 lower-case alphanumeric/underscore characters.
// Random rather than timestamp-based so public tracking references are not predictable.
export function newOrderReference() {
  return `gm${randomBytes(7).toString("hex").slice(0, 13)}`;
}
