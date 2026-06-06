import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const GRADLE_ZIP_URL = "https://services.gradle.org/distributions/gradle-8.2-bin.zip";
const GRADLE_DIR = path.resolve("./gradle-dist");
const SDK_DIR = path.resolve("./android-sdk");
const PROJECT_DIR = path.resolve("./android");

async function run() {
  console.log("=== STARTING GRADLE & APK COMPILATION ===");

  // 1. Ensure Gradle is downloaded & extracted
  if (!fs.existsSync(GRADLE_DIR)) {
    fs.mkdirSync(GRADLE_DIR, { recursive: true });
  }

  const zipPath = path.join(GRADLE_DIR, "gradle-8.2-bin.zip");
  const binPath = path.join(GRADLE_DIR, "gradle-8.2", "bin", "gradle");

  if (!fs.existsSync(binPath)) {
    console.log(`Downloading Gradle from ${GRADLE_ZIP_URL}...`);
    execSync(`wget -O "${zipPath}" "${GRADLE_ZIP_URL}"`, { stdio: "inherit" });

    console.log("Extracting Gradle zip...");
    execSync(`unzip -q "${zipPath}" -d "${GRADLE_DIR}"`, { stdio: "inherit" });
    
    // Cleanup zip
    fs.rmSync(zipPath, { force: true });
    console.log("Gradle successfully configured!");
  } else {
    console.log("Gradle already configured!");
  }

  // 2. Set environment variables
  const env = {
    ...process.env,
    ANDROID_HOME: SDK_DIR,
    JAVA_HOME: "/usr/lib/jvm/java-17-openjdk-amd64",
    PATH: `${path.join(GRADLE_DIR, "gradle-8.2", "bin")}:${process.env.PATH}`,
  };

  console.log("Gradle version check:");
  execSync(`"${binPath}" -v`, { stdio: "inherit", env });

  // 3. Compile Android release APK
  console.log("Starting Android APK Gradle compilation (assembleRelease)...");
  execSync(`"${binPath}" -p "${PROJECT_DIR}" assembleRelease`, { stdio: "inherit", env });

  // 4. Locate APK
  const apkSrcPath = path.join(PROJECT_DIR, "app", "build", "outputs", "apk", "release", "app-release-unsigned.apk");
  const apkDestPath = path.resolve("./taskflowlite.apk");

  if (!fs.existsSync(apkSrcPath)) {
    throw new Error("Could not find compiled release APK at " + apkSrcPath);
  }

  // 5. Generate self-signed Keystore
  const keystorePath = path.resolve("./taskflow.keystore");
  console.log("Generating self-signed keystore for APK signing...");
  if (fs.existsSync(keystorePath)) {
    fs.rmSync(keystorePath);
  }
  
  execSync(
    `keytool -genkey -v -keystore "${keystorePath}" -keyalg RSA -keysize 2048 -validity 10000 -alias taskflow-key -storepass password123 -keypass password123 -dname "CN=taskflowlite.app, OU=Mobile, O=TaskFlow, L=London, S=London, C=GB"`,
    { stdio: "inherit", env }
  );

  // 6. Sign APK with apksigner or jarsigner
  console.log("Signing the APK using jarsigner...");
  // Copy to final location unsigned first
  fs.copyFileSync(apkSrcPath, apkDestPath);

  execSync(
    `jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore "${keystorePath}" -storepass password123 -keypass password123 "${apkDestPath}" taskflow-key`,
    { stdio: "inherit", env }
  );

  // 7. Verify the APK signature
  console.log("Verifying APK signing integrity...");
  const verifyOutput = execSync(`jarsigner -verify -verbose -certs "${apkDestPath}"`, { encoding: "utf8", env });
  console.log("Signature Verification Summary:\n", verifyOutput.split("\n").slice(0, 5).join("\n"));

  console.log(`SUCCESS! Copied fully signed release APK to project root: ${apkDestPath}`);
  console.log("=== APK COMPILATION & SIGNING COMPLETED SUCCESSFULLY ===");
}

run().catch((err) => {
  console.error("Compilation / Signing failed:", err);
  process.exit(1);
});
