package com.maintenanceaitoolkit.localhost

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebChromeClient
import android.webkit.ValueCallback
import android.widget.Toast
import androidx.webkit.WebViewAssetLoader
import androidx.webkit.WebViewClientCompat
import androidx.webkit.ServiceWorkerControllerCompat
import androidx.webkit.ServiceWorkerClientCompat
import androidx.webkit.WebViewFeature
import com.google.ai.edge.litertlm.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest
import java.util.concurrent.Executors

class MainActivity : Activity() {
    companion object {
        private const val PICK_MODEL_REQUEST = 4102
        private const val FILE_CHOOSER_REQUEST = 4103
        private const val MAX_MODEL_BYTES = 2L * 1024L * 1024L * 1024L
        private const val MODEL_ID = "qwen3.5-0.8b-int8-cpu"
        private const val APP_URL = "https://appassets.androidplatform.net/assets/www/index.html"
    }

    private val worker = Executors.newSingleThreadExecutor()
    private val modelDirectory by lazy { File(filesDir, "models").apply { mkdirs() } }
    private val modelFile by lazy { File(modelDirectory, "qwen3.5-0.8b.litertlm") }
    private val modelHashFile by lazy { File(modelDirectory, "qwen3.5-0.8b.sha256") }
    @Volatile private var modelReady = false
    @Volatile private var busy = false
    private var webView: WebView? = null
    private var pickerCallback: String? = null
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val loader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()
        if (WebViewFeature.isFeatureSupported(WebViewFeature.SERVICE_WORKER_BASIC_USAGE)) {
            ServiceWorkerControllerCompat.getInstance().setServiceWorkerClient(
                object : ServiceWorkerClientCompat() {
                    override fun shouldInterceptRequest(request: WebResourceRequest) =
                        loader.shouldInterceptRequest(request.url)
                }
            )
        }
        val view = WebView(this)
        webView = view
        view.layoutParams = ViewGroup.LayoutParams(-1, -1)
        view.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            // SAF-selected PDF/image URIs are user-granted content URIs.
            allowContentAccess = true
            javaScriptCanOpenWindowsAutomatically = false
            setSupportMultipleWindows(false)
            mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        }
        view.addJavascriptInterface(NativeBridge(), "MaintenanceAndroidHost")
        view.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: WebChromeClient.FileChooserParams
            ): Boolean {
                fileChooserCallback?.onReceiveValue(null)
                fileChooserCallback = filePathCallback
                return try {
                    val intent = fileChooserParams.createIntent()
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST)
                    true
                } catch (_: Exception) {
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = null
                    false
                }
            }
        }
        view.webViewClient = object : WebViewClientCompat() {
            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest) =
                loader.shouldInterceptRequest(request.url)
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val u = request.url
                if (u.scheme == "https" && u.host == "appassets.androidplatform.net") return false
                if (u.scheme == "https") {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, u))
                    } catch (_: Exception) {
                        Toast.makeText(this@MainActivity, "تعذر فتح الرابط الخارجي", Toast.LENGTH_SHORT).show()
                    }
                }
                return true
            }
        }
        setContentView(view)
        view.loadUrl(APP_URL)
    }

    private inner class NativeBridge {
        @JavascriptInterface fun getCapabilities() = JSONObject()
            .put("executionMode", "local").put("localOnly", true)
            .put("runtime", "LiteRT-LM Android 0.19.1 / CPU")
            .put("supportedOperations", JSONArray(listOf("status", "load", "unload", "generate"))).toString()

        @JavascriptInterface fun getStatus() = JSONObject()
            .put("modelLoaded", modelReady && modelFile.isFile)
            .put("modelId", if (modelReady && modelFile.isFile) MODEL_ID else JSONObject.NULL)
            .put("busy", busy).put("backend", "CPU").toString()

        @JavascriptInterface fun invoke(method: String, payload: String, callbackId: String) {
            if (!callbackId.matches(Regex("^[a-zA-Z0-9_-]{1,80}$"))) return
            when (method) {
                "pickModel" -> runOnUiThread {
                    pickerCallback = callbackId
                    val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                    }
                    startActivityForResult(intent, PICK_MODEL_REQUEST)
                }
                "loadModel" -> loadModel(payload, callbackId)
                "unloadModel" -> {
                    modelReady = false
                    complete(callbackId, JSONObject().put("ok", true).put("status", "unloaded"))
                }
                "generate" -> generate(payload, callbackId)
                else -> complete(callbackId, failure("unsupported_operation"))
            }
        }
    }

    @Suppress("DEPRECATION")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST) {
            val callback = fileChooserCallback
            fileChooserCallback = null
            callback?.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data))
            return
        }
        if (requestCode != PICK_MODEL_REQUEST) return
        val callback = pickerCallback
        pickerCallback = null
        if (resultCode != RESULT_OK || data?.data == null) {
            if (callback != null) complete(callback, failure("model_selection_cancelled"))
            return
        }
        worker.execute {
            try {
                val copied = copyModel(data.data!!)
                modelReady = false
                if (callback != null) complete(callback, JSONObject().put("ok", true)
                    .put("modelId", MODEL_ID).put("fileName", copied.first.name)
                    .put("sizeBytes", copied.first.length()).put("sha256", copied.second)
                    .put("integrity", "sha256_recorded_on_import_not_upstream_authentication"))
            } catch (e: Exception) {
                if (callback != null) complete(callback, failure("model_import_failed", e.message))
            }
        }
    }

    private fun copyModel(uri: Uri): Pair<File, String> {
        val name = contentResolver.query(uri, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME), null, null, null)
            ?.use { if (it.moveToFirst()) it.getString(0) else null } ?: "model.litertlm"
        require(name.endsWith(".litertlm", true)) { "Choose a .litertlm file." }
        val dir = modelDirectory
        val temp = File(dir, "model.tmp")
        val tempHash = File(dir, "model.sha256.tmp")
        val backup = File(dir, "model.previous")
        val backupHash = File(dir, "model.previous.sha256")
        val digest = MessageDigest.getInstance("SHA-256")
        contentResolver.openInputStream(uri).use { input ->
            requireNotNull(input) { "Cannot open model file." }
            temp.outputStream().use { output ->
                val buffer = ByteArray(1024 * 1024)
                var total = 0L
                while (true) {
                    val n = input.read(buffer)
                    if (n < 0) break
                    total += n
                    require(total <= MAX_MODEL_BYTES) { "Model exceeds 2 GB." }
                    digest.update(buffer, 0, n)
                    output.write(buffer, 0, n)
                }
                output.fd.sync()
            }
        }
        require(temp.length() > 0) { "Model file is empty." }
        val hash = digest.digest().joinToString("") { "%02x".format(it) }
        tempHash.outputStream().use { output ->
            output.write(hash.toByteArray(Charsets.US_ASCII))
            output.fd.sync()
        }

        backup.delete()
        backupHash.delete()
        val hadModel = modelFile.exists()
        val hadHash = modelHashFile.exists()
        if (hadModel) check(modelFile.renameTo(backup)) { "Could not stage previous model." }
        if (hadHash && !modelHashFile.renameTo(backupHash)) {
            if (hadModel) backup.renameTo(modelFile)
            throw IllegalStateException("Could not stage previous model hash.")
        }
        if (!temp.renameTo(modelFile)) {
            if (hadModel) backup.renameTo(modelFile)
            if (hadHash) backupHash.renameTo(modelHashFile)
            throw IllegalStateException("Could not install imported model.")
        }
        if (!tempHash.renameTo(modelHashFile)) {
            modelFile.delete()
            if (hadModel) backup.renameTo(modelFile)
            if (hadHash) backupHash.renameTo(modelHashFile)
            throw IllegalStateException("Could not install model integrity record.")
        }
        backup.delete()
        backupHash.delete()
        return Pair(modelFile, hash)
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().buffered().use { input ->
            val buffer = ByteArray(1024 * 1024)
            while (true) {
                val count = input.read(buffer)
                if (count < 0) break
                digest.update(buffer, 0, count)
            }
        }
        return digest.digest().joinToString("") { "%02x".format(it) }
    }

    private fun loadModel(payload: String, callback: String) = worker.execute {
        var engineToClose: Engine? = null
        try {
            require(JSONObject(payload).optString("modelId") == MODEL_ID) { "unknown_model_id" }
            require(modelFile.isFile && modelFile.length() > 0) { "model_file_missing" }
            val expectedHash = modelHashFile.takeIf { it.isFile }?.readText()?.trim()
            require(expectedHash != null && expectedHash.matches(Regex("^[a-f0-9]{64}$"))) {
                "model_integrity_record_missing"
            }
            require(sha256(modelFile) == expectedHash) { "model_integrity_check_failed" }
            val candidate = Engine(EngineConfig(
                modelPath = modelFile.absolutePath,
                backend = Backend.CPU(),
                cacheDir = cacheDir.absolutePath
            ))
            engineToClose = candidate
            candidate.initialize()
            val warmupConversation = candidate.createConversation(ConversationConfig(
                systemInstruction = Contents.of("You are an industrial maintenance assistant."),
                samplerConfig = SamplerConfig(topK = 32, topP = 0.9, temperature = 0.2),
                maxOutputToken = 8
            ))
            warmupConversation.close()
            candidate.close()
            engineToClose = null
            modelReady = true
            complete(callback, JSONObject().put("ok", true).put("executionMode", "local").put("modelId", MODEL_ID))
        } catch (e: Exception) {
            modelReady = false
            complete(callback, failure("model_load_failed", e.message))
        } finally {
            try { engineToClose?.close() } catch (_: Exception) {}
        }
    }

    private fun generate(payload: String, callback: String) {
        if (!modelReady || !modelFile.isFile) { complete(callback, failure("local_model_not_loaded")); return }
        if (busy) { complete(callback, failure("generation_already_active")); return }
        busy = true
        worker.execute {
            var engine: Engine? = null
            var conversation: Conversation? = null
            val output = StringBuilder()
            try {
                val request = JSONObject(payload)
                require(request.optString("modelId") == MODEL_ID) { "unknown_model_id" }
                require(payload.length <= 300000) { "request_too_large" }
                val expectedHash = modelHashFile.takeIf { it.isFile }?.readText()?.trim()
                require(expectedHash != null && expectedHash.matches(Regex("^[a-f0-9]{64}$"))) {
                    "model_integrity_record_missing"
                }
                require(sha256(modelFile) == expectedHash) { "model_integrity_check_failed" }
                val messages = request.optJSONArray("messages") ?: JSONArray()
                require(messages.length() in 1..48) { "invalid_messages" }
                val system = messages.optJSONObject(0)?.optString("content").orEmpty().take(5000)
                val prompt = buildString {
                    for (i in 1 until messages.length()) {
                        val m = messages.optJSONObject(i) ?: continue
                        val role = m.optString("role", "user").take(20)
                        val body = m.optString("content").take(6000)
                        if (body.isNotBlank()) append("\n[").append(role).append("]\n").append(body).append("\n")
                    }
                }.take(18000)
                require(prompt.isNotBlank()) { "empty_prompt" }
                val candidate = Engine(EngineConfig(
                    modelPath = modelFile.absolutePath,
                    backend = Backend.CPU(),
                    cacheDir = cacheDir.absolutePath
                ))
                engine = candidate
                candidate.initialize()
                val candidateConversation = candidate.createConversation(ConversationConfig(
                    systemInstruction = Contents.of(system.ifBlank { "You are a careful industrial maintenance assistant." }),
                    samplerConfig = SamplerConfig(topK = 64, topP = 0.95,
                        temperature = request.optDouble("temperature", 0.2).coerceIn(0.0, 1.0)),
                    maxOutputToken = request.optInt("maxOutputTokens", 384).coerceIn(1, 512)
                ))
                conversation = candidateConversation
                val activeConversation = candidateConversation
                activeConversation.sendMessageAsync(prompt, object : MessageCallback {
                    override fun onMessage(message: Message) { output.append(message.toString()) }
                    override fun onDone() {
                        try { conversation?.close() } catch (_: Exception) {}
                        try { engine?.close() } catch (_: Exception) {}
                        busy = false
                        val text = output.toString().trim()
                        complete(callback, if (text.isNotEmpty()) JSONObject().put("ok", true)
                            .put("executionMode", "local").put("text", text).put("finishReason", "stop")
                            else failure("empty_model_response"))
                    }
                    override fun onError(throwable: Throwable) {
                        try { conversation?.close() } catch (_: Exception) {}
                        try { engine?.close() } catch (_: Exception) {}
                        busy = false
                        complete(callback, failure("local_generation_failed", throwable.message))
                    }
                })
            } catch (e: Exception) {
                try { conversation?.close() } catch (_: Exception) {}
                try { engine?.close() } catch (_: Exception) {}
                busy = false
                complete(callback, failure("local_generation_failed", e.message))
            }
        }
    }

    private fun failure(code: String, detail: String? = null) = JSONObject().apply {
        put("ok", false); put("error", code)
        if (!detail.isNullOrBlank()) put("detail", detail.take(300))
    }

    private fun complete(id: String, result: JSONObject) {
        val jsId = JSONObject.quote(id)
        val jsResult = JSONObject.quote(result.toString())
        runOnUiThread {
            webView?.evaluateJavascript(
                "window.__MaintenanceNativeLLMResolve && window.__MaintenanceNativeLLMResolve($jsId, $jsResult);", null
            )
        }
    }

    override fun onDestroy() {
        fileChooserCallback?.onReceiveValue(null)
        fileChooserCallback = null
        worker.shutdownNow()
        webView?.apply { removeJavascriptInterface("MaintenanceAndroidHost"); stopLoading(); destroy() }
        webView = null
        super.onDestroy()
    }
}
