import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const SDK_DIR = path.resolve("./android-sdk");
const GRADLE_BIN = path.resolve("./gradle-dist/gradle-8.2/bin/gradle");
const PROJECT_DIR = path.resolve("./android");
const KEYSTORE_PATH = path.resolve("./taskflow.keystore");
const APK_DEST_PATH = path.resolve("./taskflowlite.apk");

const env = {
  ...process.env,
  ANDROID_HOME: SDK_DIR,
  JAVA_HOME: "/usr/lib/jvm/java-17-openjdk-amd64",
  PATH: `${path.dirname(GRADLE_BIN)}:${process.env.PATH}`,
};

function runCommand(cmd: string, args: string[], options: any): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${cmd} ${args.join(" ")}`);
    const proc = spawn(cmd, args, options);

    proc.stdout.on("data", (data) => {
      process.stdout.write(data);
    });

    proc.stderr.on("data", (data) => {
      process.stderr.write(data);
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function run() {
  console.log("=== STARTING REAL-TIME GRADLE COMPILE ===");
  
  // 1. Compile APK
  await runCommand(GRADLE_BIN, ["-p", PROJECT_DIR, "assembleRelease"], { env });

  // 2. Clear old keystore and generate a new one if needed
  if (!fs.existsSync(KEYSTORE_PATH)) {
    console.log("Generating keystore...");
    await runCommand(
      "keytool",
      [
        "-genkey", "-v",
        "-keystore", KEYSTORE_PATH,
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-alias", "taskflow-key",
        "-storepass", "password123",
        "-keypass", "password123",
        "-dname", "CN=taskflowlite.app, OU=Mobile, O=TaskFlow, L=London, S=London, C=GB"
      ],
      { env }
    );
  }

  // 3. Move unsigned APK to root
  const apkSrcPath = path.join(PROJECT_DIR, "app", "build", "outputs", "apk", "release", "app-release-unsigned.apk");
  if (!fs.existsSync(apkSrcPath)) {
    throw new Error("Could not find compiled release build at: " + apkSrcPath);
  }
  fs.copyFileSync(apkSrcPath, APK_DEST_PATH);
  console.log("Copied apk to project root!");

  // 4. Sign APK
  console.log("Signing APK...");
  await runCommand(
    "jarsigner",
    [
      "-verbose",
      "-sigalg", "SHA256withRSA",
      "-digestalg", "SHA-256",
      "-keystore", KEYSTORE_PATH,
      "-storepass", "password123",
      "-keypass", "password123",
      APK_DEST_PATH,
      "taskflow-key"
    ],
    { env }
  );

  // 5. Verify the APK
  console.log("Verifying signed APK signature...");
  await runCommand("jarsigner", ["-verify", "-verbose", APK_DEST_PATH], { env });

  console.log("=== APK COMPILED AND SIGNED SUCCESSFULLY ===");
}

run().catch((err) => {
  console.error("Compilation failed:", err);
  process.exit(1);
});
