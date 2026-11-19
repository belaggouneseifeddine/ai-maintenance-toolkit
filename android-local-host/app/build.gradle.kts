plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.maintenanceaitoolkit.localhost"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.maintenanceaitoolkit.localhost"
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
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    // Pin to the runtime generation documented for the selected Qwen CPU artifact.
    implementation("com.google.ai.edge.litertlm:litertlm-android:0.19.2")
}
