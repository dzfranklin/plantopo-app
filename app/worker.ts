import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { DatabaseContext } from "~/db/db.server";
import * as schema from "~/db/schema.server";
import { setTimeout } from "node:timers/promises";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const dbClient = postgres(process.env.DATABASE_URL);
const db = drizzle(dbClient, { schema });

export async function startWorker() {
  console.log("Worker starting...");

  await DatabaseContext.run(db, async () => {
    while (true) {
      console.log("worker tick");
      await setTimeout(1_000);
    }
    // Placeholder: Add your background job logic here
    // Example: setInterval for periodic tasks, queue consumers, etc.
  });
}

// Handle graceful shutdown
let shutdownSignalsReceived = 0;
["SIGTERM", "SIGINT"].forEach((signal) =>
  process.on(signal, async () => {
    shutdownSignalsReceived++;
    console.log(`received ${shutdownSignalsReceived}`);
    // If spawned in server.js run by an interactive shell we will get a
    // duplicate signal as the child of the process, so check for >2 here
    if (shutdownSignalsReceived > 2) {
      console.log("Forcibly killing worker");
      process.exit(1);
    }

    console.log(`Worker shutting down (received ${signal})...`);

    console.log("Closing database client...");
    await dbClient.end({ timeout: 1 });

    console.log("Worker shutdown complete.");
    process.exit(0);
  })
);
