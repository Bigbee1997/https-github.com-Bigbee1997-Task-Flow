import { execSync } from "child_process";

console.log("Installing OpenJDK 17 with noninteractive flags...");
try {
  execSync(
    'export DEBIAN_FRONTEND=noninteractive && apt-get update && apt-get install -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" openjdk-17-jdk-headless',
    { stdio: "inherit", shell: "bash" }
  );
  console.log("OpenJDK 17 installation completed successfully!");
  
  const javaVersion = execSync("java -version", { encoding: "utf8" });
  console.log("Java Version After Install:\n", javaVersion.trim());
} catch (e: any) {
  console.log("Error installing JDK:", e.message);
}
