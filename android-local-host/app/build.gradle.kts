import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.maintenanceaitoolkit.localhost"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.maintenanceaitoolkit.localassistant"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        compilerOptions {
            jvmTarget.set(JvmTarget.JVM_17)
        }
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    // Google Maven Android artifact. CPU model compatibility is validated on-device separately.
    implementation("com.google.ai.edge.litertlm:litertlm-android:0.19.1")
}


// Package the existing PWA as local WebView assets; the APK does not need INTERNET permission.
val repositoryRoot = rootProject.projectDir.parentFile
val syncMaintenanceWebAssets = tasks.register<Copy>("syncMaintenanceWebAssets") {
    from(repositoryRoot) {
        include("**/*.html", "**/*.js", "**/*.css", "**/*.json", "**/*.md", "**/*.svg",
            "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.webp", "**/*.ico", "**/*.woff2", "**/*.mjs", "**/*.wasm", "**/*.gz", "**/*.txt")
        exclude(".git/**", ".github/**", "node_modules/**", "android-local-host/**",
            "tests/**", "docs/**", "coverage/**", "dist/**", "build/**",
            "**/*.pdf", "**/*.zip", "**/*.apk", "**/*.jar", "**/*.class")
    }
    into(layout.projectDirectory.dir("src/main/assets/www"))
}
val vendorDocumentRuntime = tasks.register<Exec>("vendorDocumentRuntime") {
    dependsOn(syncMaintenanceWebAssets)
    workingDir(repositoryRoot)
    commandLine("bash", "scripts/vendor-document-runtime.sh",
        layout.projectDirectory.dir("src/main/assets/www").asFile.absolutePath)
    onlyIf {
        !layout.projectDirectory.file("src/main/assets/www/vendor/pdfjs/pdf.min.mjs").asFile.exists()
    }
}
tasks.named("preBuild").configure { dependsOn(vendorDocumentRuntime) }
