import { type Auth, type BetterAuthOptions } from "better-auth";
import { AsyncLocalStorage } from "node:async_hooks";

export const AuthenticationContext = new AsyncLocalStorage<
  Auth<BetterAuthOptions>
>();

export function authentication() {
  const auth = AuthenticationContext.getStore();
  if (!auth) throw new Error("AuthenticationContext not set");
  return auth;
}
