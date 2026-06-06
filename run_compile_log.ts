import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const logFile = path.resolve("./compile_log.txt");
fs.writeFileSync(logFile, "=== BUILD LOG STARTED ===\n", "utf8");

const proc = spawn("npx", ["tsx", "run_gradle.ts"], {
  env: process.env,
  shell: true
});

proc.stdout.on("data", (data) => {
  fs.appendFileSync(logFile, data);
  process.stdout.write(data);
});

proc.stderr.on("data", (data) => {
  fs.appendFileSync(logFile, data);
  process.stderr.write(data);
});

proc.on("close", (code) => {
  fs.appendFileSync(logFile, `\n=== PROCESS CLOSED WITH CODE ${code} ===\n`);
  console.log(`Process closed with code ${code}`);
});
