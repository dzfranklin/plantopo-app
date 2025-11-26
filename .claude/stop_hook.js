const { spawn } = await import("node:child_process");
const process = await import("node:process");

function checkCmd(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: "pipe",
      env: process.env,
    });

    const outputs = [];

    p.stdout.on("data", (data) => outputs.push(data));
    p.stderr.on("data", (data) => outputs.push(data));

    p.on("exit", (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        const cmdName = [cmd, ...args].join(" ");
        process.stderr.write(`> ${cmdName}\n`);
        const output = Buffer.concat(outputs);
        process.stderr.write(output);
        process.stderr.write(`${cmdName} failed: exit code ${code}\n`);
        resolve(false);
      }
    });
  });
}

const checks = [
  { name: "typecheck", result: checkCmd("npm", ["run", "typecheck"]) },
];

const results = await Promise.all(
  checks.map((c) =>
    c.result.then((resultValue) => ({ name: c.name, result: resultValue }))
  )
);
const successCount = results.filter(r => r.result).length;
if (successCount < results.length) {
  process.stderr.write(`\n\n${successCount}/${results.length} checks passed:`);
  for (const result of results) {
    process.stderr.write(`- ${result.name}: ${result.result ? 'OK' : 'FAIL'}`);
  }
  process.exit(2);
}
