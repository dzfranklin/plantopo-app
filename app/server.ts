import { createRequestHandler } from "@react-router/express";
import { drizzle } from "drizzle-orm/postgres-js";
import express from "express";
import postgres from "postgres";
import "react-router";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { DatabaseContext } from "~/db/db.server";
import * as schema from "~/db/schema.server";
import { betterAuth } from "better-auth";
import { AuthenticationContext } from "~/auth/auth.server";

export const app = express();

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const dbClient = postgres(process.env.DATABASE_URL);
const db = drizzle(dbClient, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
  },
});

app.use((_, __, next) =>
  DatabaseContext.run(db, () => AuthenticationContext.run(auth, next))
);

app.use(
  createRequestHandler({
    build: () => import("virtual:react-router/server-build"),
  })
);
