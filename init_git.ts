import { execSync } from "child_process";
import * as fs from "fs";

try {
  console.log("Initializing local git repository...");
  // Clear any existing .git just in case
  if (fs.existsSync("./.git")) {
    fs.rmSync("./.git", { recursive: true, force: true });
  }

  execSync("git init", { stdio: "inherit" });
  
  // Set user details
  execSync('git config user.name "Bigbee1997"', { stdio: "inherit" });
  execSync('git config user.email "olorunfemibolajiidris@gmail.com"', { stdio: "inherit" });
  
  // Add remote origin
  execSync("git remote add origin https://github.com/Bigbee1997/task-flowpro.git", { stdio: "inherit" });
  
  // Add files
  console.log("Adding files to staging...");
  execSync("git add .", { stdio: "inherit" });
  
  // Commit
  console.log("Creating initial commit...");
  execSync('git commit -m "feat: Initial commit for Task Flow Lite personal task manager and packaging"', { stdio: "inherit" });
  
  console.log("Git repository initialized and committed locally with remote set to: https://github.com/Bigbee1997/task-flowpro.git");
} catch (e: any) {
  console.log("Git Init/Commit Error:", e.message);
}
