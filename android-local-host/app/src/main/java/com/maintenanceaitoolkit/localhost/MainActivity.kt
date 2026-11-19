package com.maintenanceaitoolkit.localhost

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.view.Gravity
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
        private const val VALVE_TEST = """أجب بالعربية فقط:
ما وظيفة صمام عدم الرجوع في خط طرد مضخة؟
أجب في ثلاث نقاط قصيرة."""
        private const val PUMP_TEST = """مضخة طرد مركزي تعمل، لكن التدفق انخفض بشكل واضح.
المعطيات:
- ضغط السحب المقاس طبيعي.
- ضغط الطرد أقل من المعتاد.
- سرعة المحرك ثابتة.
- لا توجد اهتزازات غير طبيعية.

اذكر ثلاث فرضيات قابلة للفحص، وافصل الحقائق عن الفرضيات.
اختر ثلاثة قياسات فقط ورتبها حسب قيمتها التشخيصية.
وضح ما الذي لا يمكن استنتاجه من البيانات الحالية.
لا تستبعد عطلًا بسبب غياب الاهتزازات أو ثبات السرعة.
لا تجزم بسبب دون أدلة كافية."""
    }

    // One serial executor owns all Engine and Conversation operations.
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
        status.text = "اختبار محلي • CPU فقط • دون اتصال شبكي"
        prompt.setText(VALVE_TEST)
    }

    private fun buildUi() {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(24, 24, 24, 24)
        }
        val title = TextView(this).apply {
            text = "اختبار نموذج الصيانة المحلي"
            textSize = 21f
        }
        status = TextView(this).apply { textSize = 14f }
        val pickButton = Button(this).apply {
            text = "1. اختر ملف النموذج (.litertlm)"
            setOnClickListener {
                val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*"
                }
                startActivityForResult(intent, PICK_MODEL_REQUEST)
            }
        }
        loadButton = Button(this).apply {
            text = "2. تحميل النموذج على CPU"
            isEnabled = false
            setOnClickListener { loadModel() }
        }
        val testButtons = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
        }
        val valveButton = Button(this).apply {
            text = "اختبار الصمام"
            setOnClickListener { prompt.setText(VALVE_TEST) }
        }
        val pumpButton = Button(this).apply {
            text = "اختبار المضخة"
            setOnClickListener { prompt.setText(PUMP_TEST) }
        }
        testButtons.addView(valveButton, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        testButtons.addView(pumpButton, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))

        prompt = EditText(this).apply {
            hint = "اكتب سؤال الصيانة هنا"
            minLines = 4
            gravity = Gravity.TOP
        }
        sendButton = Button(this).apply {
            text = "3. أرسل السؤال إلى النموذج المحلي"
            isEnabled = false
            setOnClickListener { generate() }
        }
        output = TextView(this).apply {
            textSize = 16f
            setTextIsSelectable(true)
            text = "ستظهر إجابة النموذج هنا."
        }
        val scroll = ScrollView(this).apply {
            addView(output, ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT
            ))
        }
        root.addView(title)
        root.addView(status)
        root.addView(pickButton)
        root.addView(loadButton)
        root.addView(testButtons)
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
        status.text = "جارٍ نسخ النموذج إلى مساحة التطبيق الخاصة…"
        loadButton.isEnabled = false
        worker.execute {
            val started = SystemClock.elapsedRealtime()
            try {
                val copied = copyModel(uri)
                selectedModel = copied
                val elapsed = SystemClock.elapsedRealtime() - started
                runOnUiThread {
                    status.text = "تم اختيار النموذج: ${copied.name}\nالحجم: ${copied.length() / (1024 * 1024)} MB • النسخ: ${elapsed} ms"
                    loadButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread {
                    status.text = "فشل استيراد النموذج: ${error.javaClass.simpleName}: ${error.message}"
                    loadButton.isEnabled = false
                }
            }
        }
    }

    private fun copyModel(uri: Uri): File {
        val name = queryDisplayName(uri) ?: "selected-model.litertlm"
        require(name.endsWith(".litertlm", ignoreCase = true)) {
            "اختر ملفًا بامتداد .litertlm"
        }
        val destinationDir = File(filesDir, "models").apply { mkdirs() }
        val destination = File(destinationDir, "qwen3.5-0.8b.litertlm")
        val temporary = File(destinationDir, "model.tmp")
        contentResolver.openInputStream(uri).use { input ->
            requireNotNull(input) { "تعذر فتح ملف النموذج المحدد." }
            temporary.outputStream().use { outputStream ->
                val buffer = ByteArray(1024 * 1024)
                var total = 0L
                while (true) {
                    val count = input.read(buffer)
                    if (count < 0) break
                    total += count
                    require(total <= MAX_MODEL_BYTES) { "حجم النموذج يتجاوز حد الاختبار 2 GB." }
                    outputStream.write(buffer, 0, count)
                }
                outputStream.fd.sync()
            }
        }
        require(temporary.length() > 0L) { "ملف النموذج فارغ." }
        if (destination.exists()) check(destination.delete()) { "تعذر استبدال النسخة السابقة." }
        check(temporary.renameTo(destination)) { "تعذر إنهاء نسخ النموذج." }
        return destination
    }

    private fun queryDisplayName(uri: Uri): String? {
        contentResolver.query(
            uri,
            arrayOf(android.provider.OpenableColumns.DISPLAY_NAME),
            null,
            null,
            null
        )?.use { cursor ->
            if (cursor.moveToFirst()) return cursor.getString(0)
        }
        return null
    }

    private fun releaseRuntime() {
        try { conversation?.close() } catch (_: Exception) { }
        conversation = null
        try { engine?.close() } catch (_: Exception) { }
        engine = null
    }

    private fun loadModel() {
        val model = selectedModel ?: return
        loadButton.isEnabled = false
        sendButton.isEnabled = false
        status.text = "جارٍ تحميل LiteRT-LM على CPU. اترك التطبيق مفتوحًا…"
        worker.execute {
            val started = SystemClock.elapsedRealtime()
            try {
                releaseRuntime()
                val candidate = Engine(EngineConfig(
                    modelPath = model.absolutePath,
                    backend = Backend.CPU(),
                    cacheDir = cacheDir.absolutePath
                ))
                candidate.initialize()
                val candidateConversation = try {
                    candidate.createConversation(
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
                } catch (error: Exception) {
                    // Initialization succeeded, so the engine can now be closed safely.
                    candidate.close()
                    throw error
                }
                engine = candidate
                conversation = candidateConversation
                val elapsed = SystemClock.elapsedRealtime() - started
                runOnUiThread {
                    status.text = "النموذج جاهز • CPU • تشغيل محلي\nزمن التحميل: ${elapsed} ms"
                    sendButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread {
                    status.text = "فشل تحميل النموذج: ${error.javaClass.simpleName}: ${error.message}"
                    loadButton.isEnabled = true
                }
            }
        }
    }

    private fun generate() {
        val text = prompt.text.toString().trim()
        if (text.isEmpty()) return
        sendButton.isEnabled = false
        output.text = "جارٍ التوليد محليًا…"
        worker.execute {
            val started = SystemClock.elapsedRealtime()
            try {
                val response = requireNotNull(conversation).sendMessage(text)
                val elapsed = SystemClock.elapsedRealtime() - started
                runOnUiThread {
                    output.text = "${response.text}\n\n[زمن الإجابة: ${elapsed} ms]"
                    sendButton.isEnabled = true
                }
            } catch (error: Exception) {
                runOnUiThread {
                    output.text = "فشل التوليد: ${error.javaClass.simpleName}: ${error.message}"
                    sendButton.isEnabled = true
                }
            }
        }
    }

    override fun onDestroy() {
        worker.execute { releaseRuntime() }
        worker.shutdown()
        super.onDestroy()
    }
}
