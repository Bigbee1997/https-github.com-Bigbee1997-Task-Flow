import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

const BASE_DIR = path.resolve("./android");

// Helper to make directory recursively
function mkdir(p: string) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

// Helper to write file
function writeFile(p: string, content: string) {
  mkdir(path.dirname(p));
  fs.writeFileSync(p, content, "utf8");
  console.log(`Created file: ${p}`);
}

async function generate() {
  console.log("=== GENERATING ANDROID PROJECT DIRECTORY STRUCTURE ===");

  // 1. settings.gradle
  writeFile(
    path.join(BASE_DIR, "settings.gradle"),
    `include ':app'
rootProject.name = "Task Flow Lite"
`
  );

  // 2. build.gradle (Project level)
  writeFile(
    path.join(BASE_DIR, "build.gradle"),
    `buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.1.1'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
`
  );

  // 3. gradle.properties
  writeFile(
    path.join(BASE_DIR, "gradle.properties"),
    `android.useAndroidX=true
android.enableJetifier=true
`
  );

  // 4. app/build.gradle
  writeFile(
    path.join(BASE_DIR, "app", "build.gradle"),
    `plugins {
    id 'com.android.application'
}

android {
    namespace 'com.taskflowlite.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.taskflowlite.app"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.9.0'
}
`
  );

  // 5. AndroidManifest.xml
  writeFile(
    path.join(BASE_DIR, "app", "src", "main", "AndroidManifest.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.taskflowlite.app">

    <uses-permission android:name="android.permission.INTERNET" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="Task Flow Lite"
        android:roundIcon="@drawable/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:hardwareAccelerated="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize"
            android:theme="@style/AppTheme.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`
  );

  // 6. MainActivity.java
  writeFile(
    path.join(BASE_DIR, "app", "src", "main", "java", "com", "taskflowlite", "app", "MainActivity.java"),
    `package com.taskflowlite.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);
        WebSettings settings = webView.getSettings();
        
        // Requirements: Enable JavaScript and localStorage in the WebView
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Optimizations
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setSupportZoom(false);
        
        // Handle transitions cleanly with hardware acceleration
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
`
  );

  // 7. layout activity_main.xml
  writeFile(
    path.join(BASE_DIR, "app", "src", "main", "res", "layout", "activity_main.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <android.webkit.WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</RelativeLayout>
`
  );

  // 8. styles.xml
  writeFile(
    path.join(BASE_DIR, "app", "src", "main", "res", "values", "styles.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">#4F46E5</item>
        <item name="colorPrimaryDark">#4338CA</item>
        <item name="colorAccent">#4F46E5</item>
    </style>
    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.Light.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
    </style>
</resources>
`
  );

  // 9. Download or copy custom launcher icon to res/drawable/ic_launcher.jpg
  console.log("Locating launcher icon...");
  const drawableDir = path.join(BASE_DIR, "app", "src", "main", "res", "drawable");
  mkdir(drawableDir);
  
  // Find generated image inside /src/assets/images
  try {
    const imagesDir = path.resolve("./src/assets/images");
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir);
      const launcherFile = files.find(f => f.startsWith("ic_launcher") && f.endsWith(".png"));
      if (launcherFile) {
        fs.copyFileSync(path.join(imagesDir, launcherFile), path.join(drawableDir, "ic_launcher.jpg"));
        console.log("Custom launcher icon was successfully positioned in drawable res directory!");
      } else {
        console.log("No custom launcher icon found, falling back to a placeholder touch file.");
        fs.writeFileSync(path.join(drawableDir, "ic_launcher.jpg"), ""); // create empty
      }
    } else {
      console.log("No images directory found, creating empty launcher file.");
      fs.writeFileSync(path.join(drawableDir, "ic_launcher.jpg"), ""); 
    }
  } catch (err: any) {
    console.log("Launcher positioning warning:", err.message);
  }

  // 10. Copy Vite web output in /dist to assets/www
  console.log("Ensuring web files are up to date in assets/www...");
  const wwwDir = path.join(BASE_DIR, "app", "src", "main", "assets", "www");
  
  // Clean first
  if (fs.existsSync(wwwDir)) {
    fs.rmSync(wwwDir, { recursive: true, force: true });
  }
  mkdir(wwwDir);

  const distDir = path.resolve("./dist");
  if (fs.existsSync(distDir)) {
    // recursively copy distDir to wwwDir
    copyRecursiveSync(distDir, wwwDir);
    console.log("Vite web assets successfully transferred inside main/assets/www!");
  } else {
    console.log("Warning: /dist directory not present. Make sure to build Vite app first!");
  }

  console.log("=== ANDROID PROJECT INITIALIZED SUCCESSFULLY ===");
}

function copyRecursiveSync(src: string, dest: string) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

generate().catch(err => {
  console.error("Android structure generation failed:", err);
  process.exit(1);
});
