export {};
const vite = await import("vite");

const viteDevServer = await vite.createServer({
  configFile: "./vite.worker.config.ts",
  server: { middlewareMode: false },
});

console.log("Worker dev wrapper: Loading worker module...");

async function loadWorker() {
  try {
    const source = await viteDevServer.ssrLoadModule("./app/worker.ts");
    await source.startWorker();
  } catch (error) {
    if (typeof error === "object" && error instanceof Error) {
      viteDevServer.ssrFixStacktrace(error);
    }
    console.error("Worker error:", error);
    throw error;
  }
}

// Watch for changes and exit (parent will respawn)
viteDevServer.watcher.on("change", async (file) => {
  console.log(`Worker file changed: ${file}`);
  console.log("Exiting for reload...");
  await viteDevServer.close();
  process.exit(0);
});

// Initial load
await loadWorker();
