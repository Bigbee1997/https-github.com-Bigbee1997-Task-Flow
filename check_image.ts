import * as fs from "fs";

try {
  const filePath = "./android/app/src/main/res/drawable/ic_launcher.png";
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath);
    console.log("File size:", buf.length);
    console.log("First 16 bytes (hex):", buf.subarray(0, 16).toString("hex"));
    console.log("First 16 bytes (ascii):", buf.slice(0, 16).toString("ascii"));
  } else {
    console.log("File doesn't exist");
  }
} catch (e: any) {
  console.log("Error:", e.message);
}
