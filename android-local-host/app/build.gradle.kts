import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.gradle.api.tasks.Sync

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
        versionName = "0.2.0"
    }

    buildTypes {
        release { isMinifyEnabled = false }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlin {
        compilerOptions { jvmTarget.set(JvmTarget.JVM_17) }
    }
}

dependencies {
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("com.google.ai.edge.litertlm:litertlm-android:0.19.1")
}

// Package only files referenced by the PWA entry point and its local data stores.
// Do not ship CI scripts, provider implementations, worker code, tests, or research drafts.
val repositoryRoot = rootProject.projectDir.parentFile
val syncMaintenanceWebAssets = tasks.register<Sync>("syncMaintenanceWebAssets") {
    from(repositoryRoot) {
        include(
            "index.html", "manifest.json", "sw.js", "icon.svg",
            "app-shell.css", "design-system.css", "document-library.css",
            "ux-redesign.css", "p1-app-shell.css", "maintenance-v03.css",
            "diagnostic-flows.js", "normalization.js", "bayesian-engine.js",
            "diagnostic-engine.js", "engineering-core.js", "agent-core.js",
            "evidence-reasoning.js", "evidence-reasoning-ui.js", "i18n.js",
            "oem-lookup.js", "maintenance-records.js", "app-legacy.js",
            "maintenance-v03.js", "knowledge-review.js", "answer-tools.js",
            "ux-redesign.js", "navigation-redesign.js", "p1-app-shell.js",
            "agent-ui.js", "native-local-llm-bridge.js", "local-llm-runtime.js",
            "assistant-case-context.js", "assistant-session-contract.js", "assistant-tool-registry.js",
            "assistant-local-orchestrator.js", "assistant-model-agent.js",
            "assistant-local-tools.js", "local-model-ui.js",
            "diagnostic-session.js", "diagnostic-session-ui.js", "diagnostic-chat.js",
            "learning-feedback-ui.js", "document-library-core.js",
            "document-semantic-search.js", "learning-memory.js", "document-library.js",
            "document-retrieval-adapter.js", "document-review-workspaces.js",
            "diagnostic-document-evidence.js",
            "faults.json", "decision-trees.json", "diagnostic-evidence-register.json",
            "knowledge/*.json", "knowledge/*.md", "knowledge/diagnostic-cases/*.json",
            "knowledge/schemas/*.json"
        )
        exclude(
            "knowledge/candidates/**", "knowledge/experimental/**",
            "knowledge/**/benchmarks/**", "knowledge/**/UPSTREAM-LICENSE-*"
        )
    }
    into(layout.projectDirectory.dir("src/main/assets/www"))
}

val vendorDocumentRuntime = tasks.register<Exec>("vendorDocumentRuntime") {
    dependsOn(syncMaintenanceWebAssets)
    workingDir(repositoryRoot)
    environment("MAINTENANCE_SKIP_EMBEDDINGS", "1")
    commandLine(
        "bash", "scripts/vendor-document-runtime.sh",
        layout.projectDirectory.dir("src/main/assets/www").asFile.absolutePath
    )
}
tasks.named("preBuild").configure { dependsOn(vendorDocumentRuntime) }
