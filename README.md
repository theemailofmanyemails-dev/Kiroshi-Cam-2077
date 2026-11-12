# Kiroshi Optics MK.V — Standalone Offline Android APK Project

This repository packages `fx_studio_netrunner_kiroshi_ui.tsx` into a **standalone, 100% offline Android APK** using **Vite + React + Tailwind CSS + Capacitor 6 (Android WebView + WebGL2)** and compiles it automatically via **GitHub Actions**.

## Features Configured for Standalone Offline Android Execution

- **Zero Browser / Zero Internet Required**: All React components, Tailwind CSS styles, Lucide icons, LUTs, ASCII glyph atlases, and WebGL2 GLSL 300 ES shaders are compiled into local assets bundled inside the APK.
- **Live Hardware Camera & Synth Fallback**: Configured with native Android `CAMERA` permissions, runtime permission prompts, automatic camera feed activation upon granting permission, and front/rear camera switching (`INNER` / `OUTER`), plus automatic fallback to the procedural Night City Synth feed.
- **Offline Snapshot & Braindance Video Saving (`Downloads/KiroshiOptics`)**: Includes a native Android `@JavascriptInterface` (`KiroshiNativeBridge`) in `MainActivity.java` so tapping **SNAP**, **STOP_BD**, or downloading from the **SHARD VAULT** writes `.jpg` and `.webm`/`.mp4` files directly to your phone's `Downloads/KiroshiOptics` folder offline.
- **Persistent Cyberdeck Memory Slots**: Your 3 custom preset slots (`SLOT_01` – `SLOT_03`) are saved in local device storage (`localStorage`) so they persist across app restarts.
- **Immersive Kiroshi HUD**: Hardware-accelerated OpenGL ES 3.0 / WebGL2 canvas, keep-screen-on flag, dark system bars (`#050508`), and a custom Kiroshi Optics adaptive vector app icon.

---

## How to Compile the APK on GitHub (No Local Android Studio Required)

### Option A: Push via Git CLI (Recommended)

1. Extract `kiroshi-optics-apk-github.zip` into a folder on your computer.
2. Create a new empty repository on [GitHub](https://github.com/new).
3. Open a terminal inside the extracted folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Kiroshi Optics MK.V Android APK"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
   git push -u origin main
   ```
4. Go to your GitHub repository -> click the **Actions** tab (or check **Releases** on the right sidebar).
5. Once the **Build Kiroshi Optics Standalone Offline APK** workflow finishes (~2–3 minutes), download **`Kiroshi-Optics-MKV-release-signed.apk`** from **Releases** or from the workflow run's **Artifacts** section.

### Option B: Upload Directly in the GitHub Web Browser

1. Create a new repository on [GitHub](https://github.com/new) (check **Add a README file** so the repo is initialized).
2. Click **Add file** -> **Upload files**, and drag-and-drop all extracted files and folders from `kiroshi-optics-apk-github.zip` (or even upload `kiroshi-optics-apk-github.zip` itself) and click **Commit changes**.
3. If your operating system hid the `.github` folder when dragging and dropping in the browser:
   - Click the **Actions** tab in your GitHub repo -> click **set up a workflow yourself**.
   - Paste the contents of `build-apk.yml` into the editor and click **Commit changes**.
4. Wait ~2–3 minutes for the workflow to complete, then download **`Kiroshi-Optics-MKV-release-signed.apk`** from the **Releases** page or the workflow run **Artifacts**.

---

## Installing on Your Android Device

1. Transfer **`Kiroshi-Optics-MKV-release-signed.apk`** to your Android phone (or download it directly from your GitHub repo's **Releases** page on your phone, then turn off Wi-Fi/mobile data whenever you want).
2. Tap the `.apk` file to install (allow *Install unknown apps* if prompted by Android).
3. Launch **Kiroshi Optics MK.V**, grant Camera permission when prompted, and use all 23 optic daemons completely offline.
