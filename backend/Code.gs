/**
 * COACH AHMED MAHER — New Client backend (Google Apps Script).
 * Lives inside your own Google Sheet: Extensions → Apps Script → paste this file.
 *
 * 1) Change COACH_PASSWORD below to your own password.
 * 2) (Optional) Run "setup" once. If it fails, skip it: the tabs are created automatically on the first application.
 * 3) Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone → Deploy.
 * 4) Copy the Web app URL into assets/config.js on the website.
 *
 * Nothing secret is ever sent to the website: the password stays here, clients only get their own data.
 */
const COACH_PASSWORD = "CHANGE-ME-Ahmed2026";
const NOTIFY_EMAIL = "ahmedbeso621@gmail.com";   // where alerts go. Empty = your own Gmail (the account that owns this script).
const DASHBOARD_URL = "https://coachahmedmaher-hub.github.io/New_Client/coach.html";

const TABS = {
  apps: { name: "Applications", head: ["id", "created", "status", "name", "email", "whatsapp", "age", "sex", "lang", "goals", "experience", "days", "where", "medical", "expect", "token", "sub_months", "sub_start", "sub_end", "health_review", "coach_notes", "assessment_at", "flags", "updated", "app_json", "assess_json"] },
  assess: { name: "Assessments", head: ["id", "submitted", "name"] },
  checks: { name: "CheckIns", head: ["id", "date", "name", "weight_kg", "waist_cm", "sessions", "nutrition_1_10", "energy_1_10", "sleep_1_10", "steps", "pain", "pain_details", "challenge", "notes", "json"] }
};
const STATUSES = ["new", "review", "accepted", "active", "hold", "completed", "rejected"];
const OPEN_FOR_CLIENT = ["accepted", "active", "hold", "completed"];

/* ---------- setup ---------- */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  Object.keys(TABS).forEach(k => {
    const t = TABS[k];
    let sh = ss.getSheetByName(t.name);
    if (!sh) sh = ss.insertSheet(t.name);
    if (sh.getLastRow() === 0) { sh.appendRow(t.head); sh.setFrozenRows(1); sh.getRange(1, 1, 1, t.head.length).setFontWeight("bold"); }
  });
  PropertiesService.getScriptProperties().setProperty("PW_HASH", hash_(COACH_PASSWORD));
  return "Setup done. Now deploy as a Web app.";
}

/* ---------- web entry ---------- */
function doGet() { return out_({ ok: true, service: "coach-ahmed-new-client" }); }

function doPost(e) {
  let req = {};
  try { req = JSON.parse((e && e.postData && e.postData.contents) || "{}"); } catch (err) { return out_({ ok: false, error: "bad_json" }); }
  try {
    const fn = ACTIONS[req.action];
    if (!fn) return out_({ ok: false, error: "unknown_action" });
    return out_(fn(req));
  } catch (err) {
    return out_({ ok: false, error: String(err && err.message || err) });
  }
}

const ACTIONS = {
  apply: req => {
    const d = req.data || {};
    if (d.website) return { ok: true };                       // honeypot: bots fill hidden fields
    const age = Number(d.a_age);
    if (!str_(d.a_name) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(str_(d.a_email)) || !str_(d.a_wa) || !(age >= 18 && age <= 100) || !d.consent)
      return { ok: false, error: "invalid" };
    const id = "A" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
    const now = new Date().toISOString();
    withLock_(() => sheet_("apps").appendRow([id, now, "new", cut_(d.a_name, 120), cut_(d.a_email, 160), cut_(d.a_wa, 40), age, cut_(d.a_sex, 10), cut_(req.lang, 5),
      list_(d.a_goal), str_(d.a_exp), str_(d.a_days), str_(d.a_where), str_(d.a_med), list_(d.a_expect), "", "", "", "", "", "", "", "", now, JSON.stringify(d).slice(0, 45000), ""]));
    notify_("🆕 طلب جديد: " + cut_(d.a_name, 60), [
      "الاسم: " + str_(d.a_name), "السن: " + age + " — " + ar_(d.a_sex), "واتساب: " + str_(d.a_wa) + "  https://wa.me/" + str_(d.a_wa).replace(/\D/g, ""), "الإيميل: " + str_(d.a_email),
      "الهدف: " + ar_(d.a_goal), "الخبرة: " + ar_(d.a_exp) + " — أيام في الأسبوع: " + ar_(d.a_days), "مشكلة صحية: " + ar_(d.a_med), "الاشتراك اللي اختاره: " + (d.a_plan ? d.a_plan + " شهور" : "—")]);
    return { ok: true };
  },

  client: req => {
    const r = byToken_(req.token); if (!r) return { ok: false, error: "no_access" };
    const v = r.v;
    return { ok: true, client: { name: v.name, sex: v.sex, lang: v.lang, status: v.status, sub_months: v.sub_months, sub_start: v.sub_start, sub_end: v.sub_end,
      assessment_at: v.assessment_at, checkins: checkins_(v.id).map(c => ({ date: c.date, w: c.weight_kg, waist: c.waist_cm, s: c.sessions, n: c.nutrition_1_10, e: c.energy_1_10, sl: c.sleep_1_10 })) } };
  },

  assess: req => {
    const r = byToken_(req.token); if (!r) return { ok: false, error: "no_access" };
    if (["completed"].indexOf(r.v.status) > -1) return { ok: false, error: "closed" };
    const data = req.data || {}, flat = req.flat || {};
    const now = new Date().toISOString();
    withLock_(() => {
      const sh = sheet_("apps");
      setCells_(sh, r.row, { assessment_at: now, assess_json: JSON.stringify(data).slice(0, 48000), flags: cut_(req.flags, 500), updated: now,
        health_review: req.flags ? (r.v.health_review || "needs_review") : (r.v.health_review || "not_needed") });
      // readable copy, one column per question, in its own tab
      const as = sheet_("assess"), head = as.getRange(1, 1, 1, as.getLastColumn()).getValues()[0];
      Object.keys(flat).forEach(k => { if (head.indexOf(k) < 0) { head.push(k); as.getRange(1, head.length).setValue(k).setFontWeight("bold"); } });
      const rowVals = head.map(h => h === "id" ? r.v.id : h === "submitted" ? now : h === "name" ? r.v.name : cut_(flat[h], 5000));
      const ids = as.getLastRow() > 1 ? as.getRange(2, 1, as.getLastRow() - 1, 1).getValues().map(x => x[0]) : [];
      const at = ids.indexOf(r.v.id);
      if (at > -1) as.getRange(at + 2, 1, 1, rowVals.length).setValues([rowVals]); else as.appendRow(rowVals);
    });
    notify_("📋 تقييم كامل وصل: " + r.v.name, ["العميل خلّص التقييم الكامل.", req.flags ? "⚑ محتاج مراجعة صحية: " + ar_(cut_(req.flags, 300)) : "مفيش حاجة صحية محتاجة مراجعة."]);
    return { ok: true };
  },

  checkin: req => {
    const r = byToken_(req.token); if (!r) return { ok: false, error: "no_access" };
    if (["accepted", "active"].indexOf(r.v.status) < 0) return { ok: false, error: "closed" };
    if (!r.v.sub_months || !r.v.sub_start) return { ok: false, error: "no_subscription" };   // weekly check-ins start only once the coach sets the subscription
    const d = req.data || {}, n = x => (x === "" || x == null || isNaN(Number(x))) ? "" : Number(x);
    withLock_(() => sheet_("checks").appendRow([r.v.id, new Date().toISOString(), r.v.name, n(d.c_weight), n(d.c_waist), n(d.c_sessions), n(d.c_nutrition), n(d.c_energy), n(d.c_sleep),
      n(d.c_steps), str_(d.c_pain), cut_(d.c_paind, 1000), cut_(d.c_challenge, 1000), cut_(d.c_notes, 2000), JSON.stringify(d).slice(0, 8000)]));
    notify_("📈 متابعة أسبوعية: " + r.v.name, ["الوزن: " + (d.c_weight || "—") + " — تمارين: " + (d.c_sessions || 0) + " — أكل: " + (d.c_nutrition || "—") + "/10 — طاقة: " + (d.c_energy || "—") + "/10",
      d.c_pain === "yes" ? "⚑ ألم: " + cut_(d.c_paind, 300) : "مفيش ألم.", d.c_challenge ? "أصعب حاجة: " + cut_(d.c_challenge, 300) : "", d.c_notes ? "ملاحظات: " + cut_(d.c_notes, 500) : ""]);
    return { ok: true };
  },

  /* ---------- coach only ---------- */
  login: req => {
    // works even if "setup" was never run: falls back to the password written at the top of this file
    const saved = PropertiesService.getScriptProperties().getProperty("PW_HASH") || hash_(COACH_PASSWORD);
    if (hash_(String(req.password || "")) !== saved) { Utilities.sleep(800); return { ok: false, error: "wrong_password" }; }
    const s = Utilities.getUuid();
    CacheService.getScriptCache().put("s_" + s, "1", 21600);   // 6 hours
    return { ok: true, session: s };
  },
  list: req => coach_(req, () => {
    const checks = allCheckins_(), byId = {};
    checks.forEach(c => { (byId[c.id] = byId[c.id] || []).push(c); });
    return { ok: true, rows: rows_("apps").map(x => {
      const v = x.v; delete v.assess_json;
      v.app = safeJson_(v.app_json); delete v.app_json;
      v.checkins = (byId[v.id] || []).length; v.last_checkin = ((byId[v.id] || []).slice(-1)[0] || {}).date || "";
      return v; }) };
  }),
  get: req => coach_(req, () => {
    const r = rowById_(req.id); if (!r) return { ok: false, error: "not_found" };
    const v = r.v, out = Object.assign({}, v);
    out.app = safeJson_(v.app_json); out.assess = safeJson_(v.assess_json); delete out.app_json; delete out.assess_json;
    out.checkins = checkins_(v.id);
    return { ok: true, client: out };
  }),
  update: req => coach_(req, () => {
    const r = rowById_(req.id); if (!r) return { ok: false, error: "not_found" };
    const p = req.patch || {}, set = { updated: new Date().toISOString() };
    if (p.status != null) { if (STATUSES.indexOf(p.status) < 0) return { ok: false, error: "bad_status" }; set.status = p.status; }
    ["health_review", "coach_notes"].forEach(k => { if (p[k] != null) set[k] = cut_(p[k], 20000); });
    if (p.sub_months != null || p.sub_start != null) {
      const m = Number(p.sub_months != null ? p.sub_months : r.v.sub_months) || "", s = str_(p.sub_start != null ? p.sub_start : r.v.sub_start);
      set.sub_months = m; set.sub_start = s; set.sub_end = (m && s) ? addMonths_(s, m) : "";
    }
    withLock_(() => setCells_(sheet_("apps"), r.row, set));
    return { ok: true };
  }),
  activate: req => coach_(req, () => {
    const r = rowById_(req.id); if (!r) return { ok: false, error: "not_found" };
    const set = {};
    if (!r.v.token || req.renew) set.token = Utilities.getUuid().replace(/-/g, "").slice(0, 24);
    if (["new", "review", "rejected"].indexOf(r.v.status) > -1) set.status = "accepted";
    set.updated = new Date().toISOString();
    withLock_(() => setCells_(sheet_("apps"), r.row, set));
    return { ok: true, token: set.token || r.v.token, status: set.status || r.v.status };
  }),
  remove: req => coach_(req, () => {           // for a client's deletion request
    const r = rowById_(req.id); if (!r) return { ok: false, error: "not_found" };
    withLock_(() => {
      sheet_("apps").deleteRow(r.row);
      ["assess", "checks"].forEach(k => {
        const sh = sheet_(k); if (sh.getLastRow() < 2) return;
        const ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().map(x => x[0]);
        for (let i = ids.length - 1; i >= 0; i--) if (ids[i] === r.v.id) sh.deleteRow(i + 2);
      });
    });
    return { ok: true };
  })
};

/* ---------- alerts ---------- */
const AR = {
  male: "راجل", female: "ست", yes: "أيوه", no: "لأ", private: "عايز يتكلم على انفراد", other: "أخرى",
  fat_loss: "خسارة دهون", muscle_gain: "بناء عضل", recomp: "إعادة تشكيل الجسم", weight_gain: "زيادة وزن", strength: "قوة", athletic: "أداء رياضي", mobility: "مرونة وحركة", health: "صحة عامة",
  complete_beginner: "مبتدئ تمامًا", beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم",
  f_symptoms: "أعراض أثناء المجهود (أولوية)", f_conditions: "مرض مشخّص", f_meds: "أدوية", f_pain: "ألم حالي", f_advice: "تعليمات طبية", f_rehab: "إصابة متأهلتش", f_allergy: "حساسية أكل", f_appmed: "حالة صحية في الطلب"
};
const ar_ = x => (Array.isArray(x) ? x : String(x || "").split(/\s*,\s*/)).filter(String).map(v => AR[v] || v).join("، ");
function notify_(subject, lines) {   // an email never blocks saving: any problem is ignored
  try {
    const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail(); if (!to) return;
    MailApp.sendEmail({ to: to, subject: subject + " — Coach Ahmed Maher", body: lines.filter(String).join("\n") + "\n\nافتح لوحة الكوتش:\n" + DASHBOARD_URL });
  } catch (e) {}
}
/* Run this once from the editor: it asks Google for permission to send you emails, then sends a test email. */
function testNotify() {
  notify_("✅ تجربة الإشعارات", ["لو الإيميل ده وصلك، يبقى الإشعارات شغالة."]);
  return "Sent to " + (NOTIFY_EMAIL || Session.getEffectiveUser().getEmail());
}

/* ---------- helpers ---------- */
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function str_(x) { return x == null ? "" : String(x).trim(); }
function cut_(x, n) { return str_(x).slice(0, n); }
function list_(x) { return Array.isArray(x) ? x.join(", ") : str_(x); }
function safeJson_(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function hash_(s) { return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, "am-coach|" + s).map(b => ((b + 256) % 256).toString(16).padStart(2, "0")).join(""); }
function sheet_(k) { const ss = SpreadsheetApp.getActiveSpreadsheet(); let sh = ss.getSheetByName(TABS[k].name); if (!sh) { setup(); sh = ss.getSheetByName(TABS[k].name); } return sh; }
function withLock_(fn) { const l = LockService.getScriptLock(); l.waitLock(20000); try { return fn(); } finally { l.releaseLock(); } }
function rows_(k) {
  const sh = sheet_(k), n = sh.getLastRow(); if (n < 2) return [];
  const vals = sh.getRange(1, 1, n, sh.getLastColumn()).getValues(), head = vals[0];
  return vals.slice(1).map((r, i) => { const v = {}; head.forEach((h, j) => v[h] = r[j] instanceof Date ? r[j].toISOString() : r[j]); return { row: i + 2, v }; });
}
function rowById_(id) { return rows_("apps").filter(x => x.v.id === id)[0] || null; }
function byToken_(t) {
  t = str_(t); if (t.length < 16) return null;
  const r = rows_("apps").filter(x => x.v.token === t)[0];
  return r && OPEN_FOR_CLIENT.indexOf(r.v.status) > -1 ? r : null;
}
function setCells_(sh, row, obj) {
  const head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  Object.keys(obj).forEach(k => { const c = head.indexOf(k); if (c > -1) sh.getRange(row, c + 1).setValue(obj[k]); });
}
function allCheckins_() { return rows_("checks").map(x => x.v); }
function checkins_(id) { return allCheckins_().filter(c => c.id === id).map(c => { delete c.json; return c; }); }
function coach_(req, fn) {
  if (!req.session || !CacheService.getScriptCache().get("s_" + req.session)) return { ok: false, error: "login" };
  return fn();
}
function addMonths_(iso, m) {   // end date = same day next month(s) minus one day, e.g. 13 Nov + 1 month → 12 Dec
  const d = new Date(String(iso).slice(0, 10) + "T00:00:00Z"); if (isNaN(d)) return "";
  const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + Number(m));
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last)); d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
