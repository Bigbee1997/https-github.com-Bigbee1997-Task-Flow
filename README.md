# ⚡ Task Flow Lite 🎯

**Task Flow Lite** is a polished, lightweight, and vibrant personal task manager web application that runs 100% offline and has been custom-packaged as a compact, high-performance native Android WebView APK.

Keep your daily schedule clean, track your completion stats with a gorgeous progress slider, trigger celebration effects, and enjoy offline-synthesized satisfying click sounds!

---

## 🌟 Key Features

1. **Task Flow Management**:
   - Add detailed tasks with titles, descriptions, due dates, categories, and priorities (Low 🟢, Medium 🟡, High 🔴).
   - Mark tasks completed with a satisfying, custom offline-synthesized auditory pop using the Web Audio API.
   - Interactive local storage persistence (data remains secure on your device caches!).
   - Interactive search and filter options: **All**, **Active**, and **Completed**.
   - Sort tasks by creation date, target due date, and priority score.

2. **Aesthetic Design**:
   - Friendly and clean "Inter" and "Space Grotesk" display typography pairing.
   - Beautiful, playful color tags and emojis for categorizing: 🏡 Personal, 🎯 Work & Study, 🛒 Shopping, 🥦 Health & Care, 🧠 Ideas & Projects.
   - Elegant enter/leave list motion animations powered by `motion/react`.
   - **Confetti Celebration Trigger**: Checks trigger a vector rainbow burst directly on screen!

3. **Android WebView APK Packaging**:
   - Optimized with relative base paths for seamless, resource-friendly Android loading via the `file:///android_asset/www/index.html` protocol.
   - Equipped with hardware acceleration, localStorage support, and DOM storage features.
   - Customized package name (`com.taskflowlite.app`) and a vibrant neon custom-generated launcher icon.

---

## 🚀 How to Run the Web App Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Instructions
1. Clone this repository to your machine.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🛠️ How to Build the APK

To compile and package the native Android WebView APK, complete the following commands:

### Prerequisites
- Install **Java SE Development Kit (JDK 17)**.
- Set up the **Android SDK (API 34 / Build Tools 34.0.0)**.
- Set up **Gradle 8.2**.

### Compilation & Signing
1. Build the production React output using Vite:
   ```bash
   npm run build
   ```
2. Move the static web resources to the Android assets directory:
   ```bash
   node -e '
     const fs = require("fs");
     const path = require("path");
     const www = "android/app/src/main/assets/www";
     if (fs.existsSync(www)) fs.rmSync(www, { recursive: true, force: true });
     fs.mkdirSync(www, { recursive: true });
     function copy(src, dest) {
       if (fs.statSync(src).isDirectory()) {
         fs.mkdirSync(dest, { recursive: true });
         fs.readdirSync(src).forEach(child => copy(path.join(src, child), path.join(dest, child)));
       } else {
         fs.copyFileSync(src, dest);
       }
     }
     copy("dist", www);
   '
   ```
3. Run the Gradle wrapper assemble command:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
4. Sign the output APK (`android/app/build/outputs/apk/release/app-release-unsigned.apk`) using `jarsigner` or `apksigner` with your release Keystore profile.

---

## 📂 Where to Find the APK

The fully compiled, signed, and ready-to-test APK can be found at the root of this project:
📦 **`./taskflowlite.apk`**

---

### 🎨 Visual & Sound Credits
- **UI Typography**: Inter & Space Grotesk via Google Fonts
- **Launcher Icon Asset**: Custom vector-stylized flat checkmark design (`/android/app/src/main/res/drawable/ic_launcher.jpg`)
- **Sound Synthesis**: Audio waveforms synthesized dynamically in real-time on-device via native `Web Audio API` oscillator pipelines.
