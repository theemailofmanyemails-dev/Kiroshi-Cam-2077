import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');

if (!fs.existsSync(androidDir)) {
  console.error('Error: android/ directory not found. Run `npx cap add android` first.');
  process.exit(1);
}

console.log('>>> Configuring Android project for standalone offline Kiroshi Optics MK.V...');

// 1. Patch AndroidManifest.xml with Camera, Sensors, Hardware Acceleration, and Storage permissions
const manifestPath = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(manifestPath)) {
  let manifest = fs.readFileSync(manifestPath, 'utf8');

  if (!manifest.includes('android:hardwareAccelerated')) {
    manifest = manifest.replace(
      '<application',
      '<application\n        android:hardwareAccelerated="true"\n        android:largeHeap="true"'
    );
  }

  const permissionsBlock = `
    <!-- Kiroshi Optics MK.V Offline Hardware & Media Permissions -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.HIGH_SAMPLING_RATE_SENSORS" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.camera.front" android:required="false" />
    <uses-feature android:name="android.hardware.sensor.gyroscope" android:required="false" />
    <uses-feature android:glEsVersion="0x00030000" android:required="true" />
`;

  if (!manifest.includes('android.permission.CAMERA')) {
    manifest = manifest.replace('</manifest>', `${permissionsBlock}\n</manifest>`);
  }

  fs.writeFileSync(manifestPath, manifest, 'utf8');
  console.log('✓ Patched AndroidManifest.xml with Camera, WebGL2 (GLES 3.0), Gyroscope, and Media permissions.');
}

// 2. Write custom MainActivity.java with runtime Camera permission prompt, auto-camera start callback,
//    immersive dark UI, WebSettings tuning, and KiroshiNative JavascriptInterface for offline media saving
const javaDir = path.join(androidDir, 'app', 'src', 'main', 'java', 'com', 'netrunner', 'kiroshioptics');
fs.mkdirSync(javaDir, { recursive: true });

const mainActivityJava = `package com.netrunner.kiroshioptics;

import android.Manifest;
import android.content.ContentValues;
import android.content.Context;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final int PERMISSION_REQ_CODE = 2077;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Window window = getWindow();
        if (window != null) {
            window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            window.setStatusBarColor(Color.parseColor("#050508"));
            window.setNavigationBarColor(Color.parseColor("#050508"));
        }

        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            webView.setBackgroundColor(Color.parseColor("#050508"));
            WebSettings settings = webView.getSettings();
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setJavaScriptEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);

            webView.addJavascriptInterface(new KiroshiNativeBridge(this), "KiroshiNative");
        }

        requestRequiredPermissions();
    }

    private void requestRequiredPermissions() {
        List<String> needed = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                != PackageManager.PERMISSION_GRANTED) {
            needed.add(Manifest.permission.CAMERA);
        }
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED) {
                needed.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
            }
        }
        if (!needed.isEmpty()) {
            ActivityCompat.requestPermissions(
                    this,
                    needed.toArray(new String[0]),
                    PERMISSION_REQ_CODE
            );
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQ_CODE) {
            for (int i = 0; i < permissions.length; i++) {
                if (Manifest.permission.CAMERA.equals(permissions[i])
                        && grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                    if (this.bridge != null && this.bridge.getWebView() != null) {
                        this.bridge.getWebView().post(() ->
                                this.bridge.getWebView().evaluateJavascript(
                                        "window.dispatchEvent(new Event('kiroshi-camera-granted'))",
                                        null
                                )
                        );
                    }
                }
            }
        }
    }

    public static class KiroshiNativeBridge {
        private final Context context;

        public KiroshiNativeBridge(Context ctx) {
            this.context = ctx;
        }

        @JavascriptInterface
        public void saveBase64Media(String dataUrl, String filename, String mimeType) {
            try {
                String base64Part = dataUrl;
                int commaIdx = dataUrl.indexOf(',');
                if (commaIdx >= 0) {
                    base64Part = dataUrl.substring(commaIdx + 1);
                }
                byte[] bytes = Base64.decode(base64Part, Base64.DEFAULT);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    ContentValues values = new ContentValues();
                    values.put(MediaStore.MediaColumns.DISPLAY_NAME, filename);
                    values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
                    values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/KiroshiOptics");

                    Uri uri = context.getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                    if (uri != null) {
                        try (OutputStream out = context.getContentResolver().openOutputStream(uri)) {
                            if (out != null) {
                                out.write(bytes);
                                out.flush();
                            }
                        }
                    }
                } else {
                    File dir = new File(
                            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS),
                            "KiroshiOptics"
                    );
                    if (!dir.exists()) {
                        dir.mkdirs();
                    }
                    File outFile = new File(dir, filename);
                    try (FileOutputStream fos = new FileOutputStream(outFile)) {
                        fos.write(bytes);
                        fos.flush();
                    }
                    MediaScannerConnection.scanFile(
                            context,
                            new String[]{outFile.getAbsolutePath()},
                            new String[]{mimeType},
                            null
                    );
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
`;

fs.writeFileSync(path.join(javaDir, 'MainActivity.java'), mainActivityJava, 'utf8');
console.log('✓ Wrote custom MainActivity.java with KiroshiNativeBridge & runtime Camera permission callback.');

// 3. Customize Launcher Icon background & foreground with Cyberpunk Kiroshi Optics vector graphics
const resValuesDir = path.join(androidDir, 'app', 'src', 'main', 'res', 'values');
const resDrawableDir = path.join(androidDir, 'app', 'src', 'main', 'res', 'drawable');
const resDrawableV24Dir = path.join(androidDir, 'app', 'src', 'main', 'res', 'drawable-v24');

if (fs.existsSync(resValuesDir)) {
  const icBgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#050508</color>
</resources>
`;
  fs.writeFileSync(path.join(resValuesDir, 'ic_launcher_background.xml'), icBgXml, 'utf8');
}

const kiroshiForegroundXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Outer Cybernetic Octagon Ring -->
    <path
        android:fillColor="#0A0A12"
        android:strokeColor="#FCEE0A"
        android:strokeWidth="3"
        android:pathData="M40,24 L68,24 L84,40 L84,68 L68,84 L40,84 L24,68 L24,40 Z" />
    <!-- Cyan Optic Crosshair Ring -->
    <path
        android:fillColor="#00000000"
        android:strokeColor="#00F0FF"
        android:strokeWidth="2.5"
        android:pathData="M54,34 A20,20 0 1,1 53.9,34 Z" />
    <!-- Crimson Core Pupil -->
    <path
        android:fillColor="#FF003C"
        android:pathData="M54,46 A8,8 0 1,1 53.9,46 Z" />
    <!-- Targeting Tick Marks -->
    <path
        android:strokeColor="#00F0FF"
        android:strokeWidth="2.5"
        android:pathData="M54,26 L54,32 M54,76 L54,82 M26,54 L32,54 M76,54 L82,54" />
</vector>
`;

if (fs.existsSync(resDrawableV24Dir)) {
  fs.writeFileSync(path.join(resDrawableV24Dir, 'ic_launcher_foreground.xml'), kiroshiForegroundXml, 'utf8');
} else if (fs.existsSync(resDrawableDir)) {
  fs.writeFileSync(path.join(resDrawableDir, 'ic_launcher_foreground.xml'), kiroshiForegroundXml, 'utf8');
}
console.log('✓ Installed custom Kiroshi Optics MK.V vector launcher icon.');
console.log('>>> Android configuration complete!');
