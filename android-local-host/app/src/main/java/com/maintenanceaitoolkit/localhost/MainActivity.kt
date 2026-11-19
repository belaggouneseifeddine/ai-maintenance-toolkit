package com.maintenanceaitoolkit.localhost

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import com.google.ai.edge.litertlm.Backend
import com.google.ai.edge.litertlm.Contents
import com.google.ai.edge.litertlm.Conversation
import com.google.ai.edge.litertlm.ConversationConfig
import com.google.ai.edge.litertlm.Engine
import com.google.ai.edge.litertlm.EngineConfig
import com.google.ai.edge.litertlm.SamplerConfig
import java.io.File
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MainActivity : Activity() {
    companion object {
        private const val PICK_MODEL_REQUEST = 4102
        private const val MAX_MODEL_BYTES = 2L * 1024L * 1024L * 1024L
    }

    private val worker: ExecutorService = Executors.newSingleThreadExecutor()
    private var selectedModel: File? = null
    private var engine: Engine? = null
    private var conversation: Conversation? = null

    private lateinit var status: TextView
    private lateinit var prompt: EditText
    private lateinit var output: TextView
    private lateinit var loadButton: Button
    private lateinit var sendButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        buildUi()
        status.text = "Local runtime test • CPU only • no network inference"
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 24, 24, 24)
        }
        status = TextView(this).apply { textSize = 14f }
        val pickButton = Button(this).apply {
            text = "1. Select .litertlm model"
            setOnClickListener {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
                startActivityForResult(intent, PICK_MODEL_REQUEST)
            }
        }
        loadButton = Button(this).apply {
            text = "2. Load model on CPU"
            isEnabled = false
            setOnClickListener { loadModel() }
        }
        prompt = EditText(this).apply {
            hint = "Enter an Arabic or English maintenance question"
            minLines = 3
            gravity = android.view.Gravity.TOP
        }
        sendButton = Button(this).apply {
            text = "3. Generate locally"
            isEnabled = false
            setOnClickListener { generate() }
        }
        output = TextView(this).apply {
            textSize = 16f
            setTextIsSelectable(true)
            text = "The model response will appear here."
        }
        val scroll = ScrollView(this).apply {
            addView(output, ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ))
        }
        root.addView(status)
        root.addView(pickButton)
        root.addView(loadButton)
        root.addView(prompt, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT
        ))
        root.addView(sendButton)
        root.addView(scroll, LinearLayout.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT, 0, 1f
        ))
        setContentView(root)
    }

    @Deprecated("Use Activity Result APIs in the production host")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode != PICK_MODEL_REQUEST || resultCode != RESULT_OK) return
        val uri = data?.data ?: return
        status.text = "Copying model into private app storage…"
        loadButton.isEnabled = false
        worker.execute {
            try {
                selectedModel = copyModel(uri)
                runOnUiThread {
                    status.text = "Model selected: ${selectedModel?.name}\nReady to load on CPU."
                    loadButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread { status.text = "Model import failed: ${error.message}" }
            }
        }
    }

    private fun copyModel(uri: Uri): File {
        val name = queryDisplayName(uri) ?: "selected-model.litertlm"
        require(name.endsWith(".litertlm", ignoreCase = true)) {
            "Select the .litertlm model file."
        }
        val destinationDir = File(filesDir, "models").apply { mkdirs() }
        val destination = File(destinationDir, "qwen3.5-0.8b.litertlm")
        val temporary = File(destinationDir, "model.tmp")
        contentResolver.openInputStream(uri).use { input ->
            requireNotNull(input) { "Cannot open selected model file." }
            temporary.outputStream().use { outputStream ->
                val buffer = ByteArray(1024 * 1024)
                var total = 0L
                while (true) {
                    val count = input.read(buffer)
                    if (count < 0) break
                    total += count
                    require(total <= MAX_MODEL_BYTES) { "Model file exceeds the 2 GB POC limit." }
                    outputStream.write(buffer, 0, count)
                }
                outputStream.fd.sync()
            }
        }
        require(temporary.length() > 0L) { "Selected model file is empty." }
        if (destination.exists()) destination.delete()
        check(temporary.renameTo(destination)) { "Could not finalize the model copy." }
        return destination
    }

    private fun queryDisplayName(uri: Uri): String? {
        contentResolver.query(uri, arrayOf(android.provider.OpenableColumns.DISPLAY_NAME),
            null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) return cursor.getString(0)
        }
        return null
    }

    private fun loadModel() {
        val model = selectedModel ?: return
        loadButton.isEnabled = false
        sendButton.isEnabled = false
        status.text = "Loading LiteRT-LM model on CPU. Keep the app open…"
        worker.execute {
            try {
                val candidate = Engine(EngineConfig(
                    modelPath = model.absolutePath,
                    backend = Backend.CPU(),
                    cacheDir = cacheDir.absolutePath
                ))
                candidate.initialize()
                engine = candidate
                conversation = candidate.createConversation(
                    ConversationConfig(
                        systemInstruction = Contents.of(
                            "You are a careful industrial maintenance assistant. " +
                            "Answer in the user's language. Separate observations from hypotheses. " +
                            "Do not invent measurements or claim certainty without evidence."
                        ),
                        samplerConfig = SamplerConfig(
                            topK = 64,
                            topP = 0.95,
                            temperature = 0.4
                        ),
                        maxOutputToken = 512
                    )
                )
                runOnUiThread {
                    status.text = "Model loaded • LiteRT-LM • CPU • local inference"
                    sendButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread {
                    status.text = "Model load failed: ${error.javaClass.simpleName}: ${error.message}"
                    loadButton.isEnabled = true
                }
            }
        }
    }

    private fun generate() {
        val text = prompt.text.toString().trim()
        if (text.isEmpty()) return
        sendButton.isEnabled = false
        output.text = "Generating locally…"
        worker.execute {
            try {
                val response = requireNotNull(conversation).sendMessage(text)
                runOnUiThread {
                    output.text = response.text
                    sendButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread {
                    output.text = "Generation failed: ${error.javaClass.simpleName}: ${error.message}"
                    sendButton.isEnabled = true
                }
            }
        }
    }

    override fun onDestroy() {
        worker.execute {
            try { conversation?.close() } catch (_: Exception) { }
            try { engine?.close() } catch (_: Exception) { }
        }
        worker.shutdown()
        super.onDestroy()
    }
}
