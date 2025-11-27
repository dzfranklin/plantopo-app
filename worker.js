export { };

const BUILD_PATH = "./build/worker/index.js";

console.log("Starting production worker");
const { startWorker } = await import(BUILD_PATH);
await startWorker();
