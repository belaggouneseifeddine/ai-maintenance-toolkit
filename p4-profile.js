(() => {
  "use strict";
  const PROFILE_KEY = "maintenance-p4-profile-v1";
  const SESSION_KEY = "maintenance-p4-session-v1";
  const COMMUNITY_API = "https://maintenance-ai-toolkit-staging.maintenance-ai-toolkit-api-seif.workers.dev";
  const $ = id => document.getElementById(id);
  const copy = value => JSON.parse(JSON.stringify(value));
  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      return value && typeof value === "object" ? value : null;
    } catch { return null; }
  }
  function showProfile(profile) {
    const box = $("p4ProfileSummary");
    if (!box) return;
    box.textContent = profile
      ? profile.display_name + " — " + profile.professional_title +
        (profile.qualification ? " — " + profile.qualification : "") +
        " · بيانات يصرّح بها المستخدم وليست مؤهلات موثّقة"
      : "لم يُنشأ ملف مساهم بعد.";
  }
  function setMessage(message, error=false) {
    const node = $("p4ProfileMessage");
    if (!node) return;
    node.textContent = message;
    node.style.color = error ? "#b91c1c" : "var(--muted)";
  }
  async function enroll(profile) {
    try {
      const response = await fetch(COMMUNITY_API + "/api/community/enroll", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر إنشاء جلسة المساهم.");
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        token: data.session_token, expires_at: data.expires_at, contributor_id: data.profile.id
      }));
      setMessage("تم إنشاء ملف المساهم وجلسة تجريبية على الخادم.");
      return true;
    } catch (error) {
      setMessage("حُفظ الملف على هذا الجهاز. المزامنة المركزية غير متاحة حالياً؛ لا تُعد إدخال البيانات. " + error.message, true);
      return false;
    }
  }
  async function saveProfile(event) {
    event.preventDefault();
    const profile = {
      display_name: $("p4DisplayName").value.trim(),
      professional_title: $("p4ProfessionalTitle").value.trim(),
      qualification: $("p4Qualification").value.trim()
    };
    if (!profile.display_name || !profile.professional_title) {
      setMessage("الاسم والمنصب أو التخصص مطلوبان.", true); return;
    }
    if (profile.display_name.length > 100 || profile.professional_title.length > 120 || profile.qualification.length > 160) {
      setMessage("تجاوز أحد الحقول الحد المسموح.", true); return;
    }
    const previous = readProfile();
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, created_at: previous?.created_at || new Date().toISOString(), updated_at: new Date().toISOString(), self_declared: true }));
    showProfile(profile);
    $("p4ProfileForm").hidden = true;
    $("p4ProfileEdit").hidden = false;
    if (!previous) await enroll(profile);
    else {
      const session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
      if (session?.token) {
        try {
          const response = await fetch(COMMUNITY_API + "/api/community/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + session.token },
            body: JSON.stringify(profile)
          });
          if (!response.ok) throw new Error("الخادم لم يقبل تحديث الملف.");
          setMessage("تم تحديث الملف الشخصي.");
        } catch (error) { setMessage("حُدّث الملف محلياً فقط؛ المزامنة غير متاحة حالياً.", true); }
      } else setMessage("تم تحديث الملف على هذا الجهاز فقط. ستتم المزامنة عند تفعيل الخادم التجريبي.", true);
    }
  }
  function startEdit() {
    const profile = readProfile();
    $("p4DisplayName").value = profile?.display_name || "";
    $("p4ProfessionalTitle").value = profile?.professional_title || "";
    $("p4Qualification").value = profile?.qualification || "";
    $("p4ProfileForm").hidden = false;
    $("p4ProfileEdit").hidden = true;
    $("p4DisplayName").focus();
  }
  function ensureUI() {
    if ($("p4ContributorProfile")) return;
    const nav = document.querySelector("main .nav");
    if (!nav) return;
    nav.insertAdjacentHTML("beforebegin", `
      <section class="card" id="p4ContributorProfile" aria-labelledby="p4ProfileTitle">
        <h2 id="p4ProfileTitle">ملف المساهم — مرة واحدة فقط</h2>
        <p class="hint">أدخل اسمك ومجالك المهني عند أول استخدام. ستُستخدم البيانات تلقائياً في المساهمات اللاحقة. الشهادة اختيارية. هذه بيانات يصرّح بها المستخدم وليست مؤهلات موثّقة.</p>
        <p id="p4ProfileSummary" class="hint" aria-live="polite"></p>
        <form id="p4ProfileForm">
          <label for="p4DisplayName">الاسم</label><input id="p4DisplayName" maxlength="100" autocomplete="name" required>
          <label for="p4ProfessionalTitle">المنصب أو التخصص المهني</label><input id="p4ProfessionalTitle" maxlength="120" placeholder="مثال: تقني صيانة صناعية، مهندس كهرباء" required>
          <label for="p4Qualification">الشهادة أو المؤهل (اختياري)</label><input id="p4Qualification" maxlength="160" placeholder="مثال: تقني سامٍ في الإلكترونيات الصناعية">
          <div class="actions"><button class="btn" type="submit">حفظ الملف</button><button class="btn secondary" id="p4ProfileCancel" type="button">إلغاء</button></div>
        </form>
        <button class="btn secondary" id="p4ProfileEdit" type="button" hidden>تعديل بياناتي</button>
        <p id="p4ProfileMessage" class="hint" role="status" aria-live="polite"></p>
      </section>`);
  }
  function init() {
    ensureUI();
    const profile = readProfile();
    if (profile) {
      $("p4ProfileForm").hidden = true;
      $("p4ProfileEdit").hidden = false;
      showProfile(profile);
      setMessage("تم استرجاع ملفك المحفوظ؛ لن نطلب بياناتك عند كل مساهمة.");
    } else {
      $("p4ProfileForm").hidden = false;
      $("p4ProfileEdit").hidden = true;
      setMessage("أدخل هذه البيانات مرة واحدة. يمكنك تعديلها لاحقاً.");
    }
    $("p4ProfileForm").addEventListener("submit", saveProfile);
    $("p4ProfileEdit").addEventListener("click", startEdit);
    $("p4ProfileCancel").addEventListener("click", () => {
      $("p4ProfileForm").hidden = true;
      $("p4ProfileEdit").hidden = false;
      showProfile(readProfile());
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.P4ContributorProfile = {
    get: readProfile,
    getSession: () => { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } }
  };
})();