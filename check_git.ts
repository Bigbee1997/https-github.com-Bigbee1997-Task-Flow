import { execSync } from "child_process";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

console.log("Checking SSH keys and credentials...");
const homeDir = os.homedir();
const sshDir = path.join(homeDir, ".ssh");

if (fs.existsSync(sshDir)) {
  console.log("SSH Directory exists!");
  try {
    const files = fs.readdirSync(sshDir);
    console.log("SSH Files:", files);
  } catch (e: any) {
    console.log("Error reading SSH dir:", e.message);
  }
} else {
  console.log("No SSH Directory at", sshDir);
}

try {
  const gitConfig = execSync("git config --list", { encoding: "utf8" });
  console.log("Git Config:\n", gitConfig);
} catch (e: any) {
  console.log("Error running git config:", e.message);
}
