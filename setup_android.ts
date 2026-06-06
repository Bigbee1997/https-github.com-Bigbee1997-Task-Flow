import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const SDK_DIR = path.resolve("./android-sdk");
const CMDLINE_TOOLS_URL = "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip";

async function run() {
  console.log("=== STARTING ANDROID BUILD ENVIRONMENT SETUP ===");
  
  // 1. Install unzip and dependencies if not available
  console.log("Ensuring unzip is installed...");
  try {
    execSync("which unzip", { stdio: "ignore" });
    console.log("unzip is already installed!");
  } catch (e) {
    console.log("Installing unzip via apt-get...");
    execSync("export DEBIAN_FRONTEND=noninteractive && apt-get install -y unzip", { stdio: "inherit" });
  }

  // 2. Create SDK directory structure
  if (!fs.existsSync(SDK_DIR)) {
    fs.mkdirSync(SDK_DIR, { recursive: true });
  }

  const zipPath = path.join(SDK_DIR, "cmdtools.zip");
  const extractedDir = path.join(SDK_DIR, "cmdline-tools-temp");
  const latestDir = path.join(SDK_DIR, "cmdline-tools", "latest");

  // 3. Download Android Command Line Tools
  if (!fs.existsSync(latestDir)) {
    console.log(`Downloading Android Command Line Tools from ${CMDLINE_TOOLS_URL}...`);
    execSync(`wget -O "${zipPath}" "${CMDLINE_TOOLS_URL}"`, { stdio: "inherit" });

    console.log("Extracting Command Line Tools...");
    if (fs.existsSync(extractedDir)) {
      fs.rmSync(extractedDir, { recursive: true, force: true });
    }
    fs.mkdirSync(extractedDir, { recursive: true });
    execSync(`unzip -q "${zipPath}" -d "${extractedDir}"`, { stdio: "inherit" });

    console.log("Structuring commandline tools into 'latest' directory...");
    const destParent = path.dirname(latestDir);
    if (!fs.existsSync(destParent)) {
      fs.mkdirSync(destParent, { recursive: true });
    }
    
    // Move cmdline-tools subdir files to latest
    const innerCmdlineTools = path.join(extractedDir, "cmdline-tools");
    if (fs.existsSync(innerCmdlineTools)) {
      fs.renameSync(innerCmdlineTools, latestDir);
    } else {
      throw new Error("Could not find extracted cmdline-tools directory!");
    }

    // Clean up zip and temp files
    fs.rmSync(zipPath, { force: true });
    fs.rmSync(extractedDir, { recursive: true, force: true });
    console.log("Command Line Tools successfully configured at 'latest'!");
  } else {
    console.log("Command Line Tools already configured at 'latest'!");
  }

  // 4. Accept licenses and install platform packages
  const sdkmanagerPath = path.join(latestDir, "bin", "sdkmanager");
  console.log(`Using sdkmanager at: ${sdkmanagerPath}`);

  // Set environment variables for sdkmanager
  const env = {
    ...process.env,
    ANDROID_HOME: SDK_DIR,
    PATH: `${path.join(latestDir, "bin")}:${process.env.PATH}`,
  };

  console.log("Accepting licenses...");
  execSync(`yes | "${sdkmanagerPath}" --sdk_root="${SDK_DIR}" --licenses`, { stdio: "inherit", env });

  console.log("Installing Platform Tools, Build Tools 34.0.0, and Platforms Android 34...");
  execSync(`"${sdkmanagerPath}" --sdk_root="${SDK_DIR}" "platform-tools" "build-tools;34.0.0" "platforms;android-34"`, {
    stdio: "inherit",
    env,
  });

  console.log("=== ANDROID SDK ENVIRONMENT SETUP FULLY COMPLETED ===");
}

run().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
