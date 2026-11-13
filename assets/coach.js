/* Coach dashboard: applications, client files, smart summary, check-in charts, exports. Arabic / English. */
(function () {
  const $ = s => document.querySelector(s), app = $("#app");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const S = window.SCHEMA, NC = window.NC;
  let L = (() => { try { return localStorage.getItem("nc-coach-lang") || "ar"; } catch (e) { return "ar"; } })();
  let session = (() => { try { return sessionStorage.getItem("nc-session") || ""; } catch (e) { return ""; } })();
  let rows = [], view = "overview", filter = { q: "", st: "all", special: "" }, current = null;

  const D = {
    ar: {
      login: "دخول الكوتش", pw: "الباسورد", enter: "دخول", wrong: "الباسورد غلط.", setup: "لسه مربطتش الموقع بجوجل شيت — حط الـ apiUrl في assets/config.js.", runSetup: "شغّل setup في Apps Script الأول.", net: "مفيش اتصال بالسيرفر. جرّب تاني.",
      logout: "خروج", overview: "نظرة عامة", clients: "الطلبات والعملاء", settings: "الإعدادات",
      t_total: "كل الطلبات", t_pending: "مستني مراجعة", t_accepted: "مقبول", t_active: "مشترك حاليًا", t_apending: "تقييم لسه متعملش", t_adone: "تقييم مكتمل", t_review: "محتاج مراجعة صحية", latest: "آخر الطلبات",
      search: "دوّر بالاسم أو الإيميل أو الرقم…", all: "كل الحالات", none: "مفيش نتائج.", noRows: "لسه مفيش طلبات.", refresh: "تحديث", csv: "تنزيل Excel (CSV)",
      c_name: "الاسم", c_wa: "واتساب", c_date: "تاريخ الطلب", c_goal: "الهدف", c_status: "الحالة", c_sub: "الاشتراك", c_assess: "التقييم", c_next: "المتابعة الجاية",
      st: { new: "طلب جديد", review: "تحت المراجعة", accepted: "مقبول", active: "مشترك", hold: "موقوف مؤقتًا", completed: "خلّص", rejected: "مرفوض" },
      done: "اتعمل", notYet: "لسه", noAccess: "مش مفعّل", back: "→ رجوع للقائمة",
      contact: "التواصل", age: "السن", sex: "النوع", lang: "لغة العميل", applied: "تاريخ الطلب",
      manage: "إدارة العميل", status: "الحالة", subM: "مدة الاشتراك", months: "{n} شهر", start: "بداية الاشتراك", end: "نهاية الاشتراك", noSub: "—",
      health: "المراجعة الصحية", hr: { "": "—", not_needed: "مش محتاجة", needs_review: "محتاجة مراجعة", discussed: "اتكلمت معاه", reviewed: "اتراجعت — تمام" },
      notes: "ملاحظات الكوتش (مش بتظهر للعميل)", save: "حفظ", saved: "اتحفظ ✓",
      access: "رابط العميل", activate: "فعّل التقييم وابعت الرابط", renew: "رابط جديد (يلغي القديم)", copy: "نسخ", copied: "اتنسخ ✓", sendWa: "ابعت الرابط على واتساب",
      accessNote: "الرابط ده هو مفتاح العميل: منه بيملا التقييم والمتابعة الأسبوعية ويشوف اشتراكه.",
      summary: "ملخص التدريب الذكي", fromAnswers: "من إجابات العميل بس — مفيش أي تخمين أو تشخيص.", review: "حاجات لازم تراجعها", nothing: "مفيش حاجة محتاجة مراجعة من الإجابات.",
      answers: "الإجابات", appSec: "طلب الاشتراك", unanswered: "{n} سؤال متجاوبش عليه", allAns: "كل الأسئلة متجاوب عليها", na: "— لم يُجب",
      noAssess: "العميل لسه مملاش التقييم الكامل.",
      checks: "المتابعة الأسبوعية", noChecks: "لسه مفيش متابعات.", ch_w: "الوزن (كجم)", ch_waist: "الوسط (سم)", ch_adh: "الالتزام بالأكل /10", ch_energy: "الطاقة /10", ch_sleep: "النوم /10", ch_sess: "عدد التمارين",
      date: "التاريخ", pain: "ألم", challenge: "أصعب حاجة", cnotes: "ملاحظات",
      pdf: "طباعة / PDF", report: "تنزيل تقرير", del: "مسح بيانات العميل", delQ: "متأكد؟ هيتمسح الطلب والتقييم وكل المتابعات نهائيًا (لو العميل طلب مسح بياناته).",
      g: { goal: "الهدف", body: "الجسم", avail: "التمرين المتاح", exp: "الخبرة", where: "المكان والأدوات", activity: "النشاط اليومي", nutrition: "التغذية", supps: "مكملات ومشروبات", sleep: "النوم", stress: "الضغط", injury: "إصابات وألم", check: "يوم المتابعة", support: "يحفّزه" },
      days: "{n} أيام/أسبوع", perS: "{n} دقيقة للتمرين", h: "ساعة", quality: "جودة", allergy: "حساسية", dislikes: "مش بيحب", likes: "بيحب", meals: "وجبات/يوم", rehab: "تأهيل",
      f: { f_symptoms: "أعراض أثناء المجهود (ألم صدر/دوخة/نهجان/خفقان) — لازم كلام قبل أي تمرين، والأفضل موافقة دكتور", f_conditions: "مرض مشخّص أو اختار يتكلم على انفراد", f_meds: "بياخد أدوية ممكن تأثر على التمرين", f_pain: "عنده ألم حالي", f_advice: "عنده تعليمات طبية بخصوص التمرين", f_rehab: "إصابة قديمة متأهلش منها بالكامل", f_allergy: "حساسية أو عدم تحمل لأكل", f_appmed: "قال في الطلب إن عنده حالة صحية" },
      lvl: { high: "مهم جدًا", mid: "راجع", low: "خد بالك" },
      setT: "الإعدادات", setP: "الإجابات بتتحفظ في جوجل شيت بتاعك (تابات Applications و Assessments و CheckIns). الباسورد بيتغير من ملف Code.gs وبعدين تشغّل setup تاني.", apiOk: "متصل بالسيرفر ✓", apiUrl: "رابط السيرفر",
      waMsg: "أهلاً {name} 👋\nده رابطك الشخصي في Coach Ahmed Maher Online Coaching:\n{link}\nمنه تملا التقييم الكامل وتبعت متابعتك الأسبوعية. الرابط ده ليك انت بس — متشاركهوش."
    },
    en: {
      login: "Coach login", pw: "Password", enter: "Sign in", wrong: "Wrong password.", setup: "The site isn't connected to the Google Sheet yet — set apiUrl in assets/config.js.", runSetup: "Run setup in Apps Script first.", net: "Can't reach the server. Try again.",
      logout: "Sign out", overview: "Overview", clients: "Applications & clients", settings: "Settings",
      t_total: "Total applications", t_pending: "Pending review", t_accepted: "Accepted", t_active: "Active clients", t_apending: "Assessments pending", t_adone: "Completed assessments", t_review: "Needs health review", latest: "Latest applications",
      search: "Search name, email or number…", all: "All statuses", none: "No results.", noRows: "No applications yet.", refresh: "Refresh", csv: "Download Excel (CSV)",
      c_name: "Name", c_wa: "WhatsApp", c_date: "Applied", c_goal: "Goal", c_status: "Status", c_sub: "Subscription", c_assess: "Assessment", c_next: "Next check-in",
      st: { new: "New application", review: "Under review", accepted: "Accepted", active: "Active", hold: "On hold", completed: "Completed", rejected: "Rejected" },
      done: "Done", notYet: "Not yet", noAccess: "Not activated", back: "← Back to list",
      contact: "Contact", age: "Age", sex: "Sex", lang: "Client language", applied: "Applied on",
      manage: "Manage client", status: "Status", subM: "Subscription length", months: "{n} month(s)", start: "Start date", end: "End date", noSub: "—",
      health: "Health review", hr: { "": "—", not_needed: "Not needed", needs_review: "Needs review", discussed: "Discussed with client", reviewed: "Reviewed — OK" },
      notes: "Coach notes (never shown to the client)", save: "Save", saved: "Saved ✓",
      access: "Client link", activate: "Activate assessment & send link", renew: "New link (old one stops working)", copy: "Copy", copied: "Copied ✓", sendWa: "Send link on WhatsApp",
      accessNote: "This link is the client's key: assessment, weekly check-ins and subscription info.",
      summary: "Smart coaching summary", fromAnswers: "Built only from the client's answers — no guessing, no diagnosis.", review: "Items to review", nothing: "Nothing in the answers needs review.",
      answers: "Answers", appSec: "Application", unanswered: "{n} question(s) not answered", allAns: "All questions answered", na: "— not answered",
      noAssess: "The client hasn't completed the full assessment yet.",
      checks: "Weekly check-ins", noChecks: "No check-ins yet.", ch_w: "Weight (kg)", ch_waist: "Waist (cm)", ch_adh: "Nutrition adherence /10", ch_energy: "Energy /10", ch_sleep: "Sleep /10", ch_sess: "Sessions",
      date: "Date", pain: "Pain", challenge: "Challenge", cnotes: "Notes",
      pdf: "Print / PDF", report: "Download report", del: "Delete client data", delQ: "Are you sure? The application, assessment and all check-ins will be deleted permanently (for a client's deletion request).",
      g: { goal: "Client goal", body: "Body", avail: "Training availability", exp: "Training experience", where: "Location & equipment", activity: "Daily activity", nutrition: "Nutrition considerations", supps: "Supplements & drinks", sleep: "Sleep", stress: "Stress", injury: "Injury notes", check: "Check-in day", support: "Stays consistent with" },
      days: "{n} days/week", perS: "{n} min/session", h: "h", quality: "quality", allergy: "Allergy", dislikes: "Dislikes", likes: "Likes", meals: "meals/day", rehab: "rehab",
      f: { f_symptoms: "Symptoms during exercise (chest pain / dizziness / breathlessness / palpitations) — talk before any training; doctor clearance recommended", f_conditions: "Diagnosed condition, or prefers to discuss privately", f_meds: "Takes medication that may affect exercise", f_pain: "Current pain", f_advice: "Has medical advice/restrictions about exercise", f_rehab: "Old injury with rehab not completed", f_allergy: "Food allergy or intolerance", f_appmed: "Mentioned a health concern in the application" },
      lvl: { high: "High priority", mid: "Review", low: "Note" },
      setT: "Settings", setP: "Answers are saved in your Google Sheet (tabs Applications, Assessments, CheckIns). To change the password, edit Code.gs and run setup again.", apiOk: "Connected ✓", apiUrl: "Server URL",
      waMsg: "Hi {name} 👋\nHere is your personal link for Coach Ahmed Maher Online Coaching:\n{link}\nUse it to fill in your full assessment and send your weekly check-ins. This link is only for you — please don't share it."
    }
  };
  const t = (k, v) => { let o = D[L]; for (const p of k.split(".")) o = o == null ? o : o[p]; let s = o == null ? k : String(o); if (v) for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
  const NL = () => NC[L] || NC.en;
  const qLabel = id => (NL().q || {})[id] || NC.en.q[id] || id;
  const optLabel = (f, v) => { const set = f.set || f.id; return ((NL().o || {})[set] || {})[v] || ((NC.en.o || {})[set] || {})[v] || v; };
  const allFields = [].concat(...S.assessment.map(s => s.fields)), appFields = S.application[0].fields;
  const fld = id => allFields.find(f => f.id === id) || appFields.find(f => f.id === id);
  const visible = (f, d) => !f.show || f.show(d);
  const emptyV = v => v == null || v === "" || (Array.isArray(v) && !v.length);
  function human(f, v, d) {
    if (emptyV(v)) return "";
    const u = k => (NL().ui || {})[k] || k;
    if (f.type === "height") return v.u === "ft" ? `${v.ft || 0} ${u("ft")} ${v.in || 0} ${u("in")} (${Math.round((v.ft || 0) * 30.48 + (v.in || 0) * 2.54)} ${u("cm")})` : `${v.v} ${u("cm")}`;
    if (f.type === "weight") return v.u === "lb" ? `${v.v} ${u("lb")} (${Math.round(v.v * 0.4536 * 10) / 10} ${u("kg")})` : `${v.v} ${u("kg")}`;
    if (f.type === "single" || f.type === "multi") return (Array.isArray(v) ? v : [v]).map(x => x === "other" && d[f.id + "_o"] ? optLabel(f, x) + ": " + d[f.id + "_o"] : optLabel(f, x)).join("، ".replace("، ", L === "ar" ? "، " : ", "));
    if (f.type === "scale") return `${v} / ${f.max}`;
    if (f.type === "number" && f.unit) return `${v} ${(NL().ui || {})[f.unit] || f.unit}`;
    if (f.type === "check") return v ? "✓" : "";
    return String(v);
  }
  const fmt = iso => { if (!iso) return ""; const d = new Date(String(iso).length === 10 ? iso + "T00:00:00" : iso); return isNaN(d) ? String(iso) : d.toLocaleDateString(L === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" }); };
  const toast = m => { const n = document.createElement("div"); n.className = "toast"; n.textContent = m; document.body.appendChild(n); setTimeout(() => n.remove(), 1800); };
  const ICON = (window.NCX && NCX.icon) || (n => "");
  const svgI = p => `<span class="ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg></span>`;
  const IC = { sum: '<path d="M5 4h14v16H5z"/><path d="M8 9h8M8 13h8M8 17h5"/>', flag: '<path d="M5 21V4h11l-2 4 2 4H5"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>', key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3"/>', chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>' };

  async function api(action, payload) {
    const url = (window.SITE || {}).apiUrl; if (!url) throw new Error("setup");
    const r = await fetch(url, { method: "POST", body: JSON.stringify(Object.assign({ action, session }, payload || {})) });
    if (!r.ok) throw new Error("net");
    const j = await r.json();
    if (!j.ok && j.error === "login") { session = ""; try { sessionStorage.removeItem("nc-session"); } catch (e) {} renderLogin(); throw new Error("login"); }
    return j;
  }

  function setLangUI() {
    document.documentElement.lang = L; document.documentElement.dir = L === "ar" ? "rtl" : "ltr";
    $("#lang").textContent = L === "ar" ? "English" : "العربية";
    $("#logout").textContent = t("logout"); $("#logout").hidden = !session;
  }
  $("#lang").addEventListener("click", () => { L = L === "ar" ? "en" : "ar"; try { localStorage.setItem("nc-coach-lang", L); } catch (e) {} setLangUI(); route(); });
  $("#logout").addEventListener("click", () => { session = ""; try { sessionStorage.removeItem("nc-session"); } catch (e) {} setLangUI(); renderLogin(); });

  /* ---------- login ---------- */
  function renderLogin(msg) {
    setLangUI();
    app.innerHTML = `<form class="formcard login" id="lf"><div class="fhead">${svgI(IC.key)}<h1>${esc(t("login"))}</h1></div>
      <div class="field"><label class="lbl" for="pw">${esc(t("pw"))}</label><input class="inp" id="pw" type="password" autocomplete="current-password" required></div>
      <div class="err" id="le" ${msg ? "" : "hidden"} role="alert">${esc(msg || "")}</div>
      <div class="nav"><span></span><button class="btn gold" type="submit">${esc(t("enter"))}</button></div></form>`;
    $("#pw").focus();
    $("#lf").addEventListener("submit", async e => {
      e.preventDefault(); const le = $("#le"), b = e.target.querySelector("button"); b.disabled = true;
      try {
        const r = await api("login", { password: $("#pw").value });
        if (!r.ok) { le.textContent = t(r.error === "run_setup" ? "runSetup" : "wrong"); le.hidden = false; b.disabled = false; return; }
        session = r.session; try { sessionStorage.setItem("nc-session", session); } catch (e2) {}
        setLangUI(); await load(); route();
      } catch (er) { le.textContent = t(er.message === "setup" ? "setup" : "net"); le.hidden = false; b.disabled = false; }
    });
  }

  /* ---------- data ---------- */
  async function load() { const r = await api("list"); rows = (r.rows || []).sort((a, b) => String(b.created).localeCompare(String(a.created))); }
  const hasAssess = r => !!r.assessment_at;
  const needsReview = r => r.health_review === "needs_review" || (!!r.flags && !r.health_review);
  const counts = () => ({
    total: rows.length, pending: rows.filter(r => r.status === "new" || r.status === "review").length,
    accepted: rows.filter(r => r.status === "accepted").length, active: rows.filter(r => r.status === "active").length,
    apending: rows.filter(r => (r.status === "accepted" || r.status === "active") && !hasAssess(r)).length,
    adone: rows.filter(hasAssess).length, review: rows.filter(needsReview).length
  });
  const DAYIDX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  function nextCheck(r, assess) {
    const day = assess && assess.q38; if (!day || r.status !== "active") return "";
    const n = new Date(), diff = (DAYIDX[day] - n.getDay() + 7) % 7; n.setDate(n.getDate() + diff); return n.toISOString().slice(0, 10);
  }

  /* ---------- views ---------- */
  function route() { if (!session) return renderLogin(); if (current) return renderDetail(); renderShell(); }
  function renderShell() {
    setLangUI();
    const tabs = [["overview", t("overview")], ["clients", t("clients")], ["settings", t("settings")]];
    app.innerHTML = `<div class="tabs" role="tablist">${tabs.map(([k, n]) => `<button role="tab" type="button" data-v="${k}" aria-selected="${view === k}">${esc(n)}</button>`).join("")}</div><div id="pane"></div>`;
    app.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => { view = b.dataset.v; filter.special = ""; renderShell(); }));
    ({ overview: renderOverview, clients: renderTable, settings: renderSettings })[view]();
  }
  function renderOverview() {
    const c = counts(), pane = $("#pane");
    const T2 = [["total", "", "all"], ["pending", "", "pending"], ["accepted", "", "accepted"], ["active", "", "active"], ["apending", "", "apending"], ["adone", "", "adone"], ["review", "alert", "review"]];
    pane.innerHTML = `<div class="tiles">${T2.map(([k, cls, sp]) => `<button type="button" class="tile ${c[k] && cls ? cls : ""}" data-sp="${sp}"><b>${c[k]}</b><span>${esc(t("t_" + k))}</span></button>`).join("")}</div>
      <h2 style="font-size:1.1rem;margin:26px 0 10px">${esc(t("latest"))}</h2>
      <div class="tblbox">${rows.length ? `<table class="tbl" style="min-width:560px"><tbody>${rows.slice(0, 6).map(r => `<tr tabindex="0" data-id="${esc(r.id)}"><td><b>${esc(r.name)}</b>${needsReview(r) ? ` <span class="flag">⚑</span>` : ""}</td><td>${esc(fmt(r.created))}</td><td>${esc(goalText(r))}</td><td><span class="pill s-${esc(r.status)}">${esc(t("st." + r.status))}</span></td></tr>`).join("")}</tbody></table>` : `<div class="empty">${esc(t("noRows"))}</div>`}</div>`;
    pane.querySelectorAll("tr[data-id]").forEach(tr => { const go = () => openClient(tr.dataset.id); tr.addEventListener("click", go); tr.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); });
    pane.querySelectorAll("[data-sp]").forEach(b => b.addEventListener("click", () => { view = "clients"; filter.special = b.dataset.sp; filter.st = "all"; renderShell(); }));
  }
  function filtered() {
    const q = filter.q.trim().toLowerCase();
    return rows.filter(r => {
      if (filter.st !== "all" && r.status !== filter.st) return false;
      const sp = filter.special;
      if (sp === "pending" && !(r.status === "new" || r.status === "review")) return false;
      if (["accepted", "active"].indexOf(sp) > -1 && r.status !== sp) return false;
      if (sp === "apending" && !((r.status === "accepted" || r.status === "active") && !hasAssess(r))) return false;
      if (sp === "adone" && !hasAssess(r)) return false;
      if (sp === "review" && !needsReview(r)) return false;
      if (q && [r.name, r.email, r.whatsapp, r.id].join(" ").toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }
  function goalText(r) { const a = (r.app || {}).a_goal || []; return a.map(x => optLabel(fld("a_goal"), x)).join(L === "ar" ? "، " : ", "); }
  function renderTable() {
    const pane = $("#pane");
    pane.innerHTML = `<div class="bar2 noprint"><input class="inp" id="q" type="search" placeholder="${esc(t("search"))}" value="${esc(filter.q)}" aria-label="${esc(t("search"))}">
      <select class="inp" id="st" aria-label="${esc(t("c_status"))}"><option value="all">${esc(t("all"))}</option>${Object.keys(D[L].st).map(k => `<option value="${k}"${filter.st === k ? " selected" : ""}>${esc(t("st." + k))}</option>`).join("")}</select>
      <button class="btn ghost sm" id="rf" type="button">${esc(t("refresh"))}</button><button class="btn ghost sm" id="csv" type="button">${esc(t("csv"))}</button></div>
      ${filter.special ? `<p style="color:var(--gold2);font-weight:700;margin:0 0 10px">${esc(t("t_" + ({ all: "total" }[filter.special] || filter.special)))} <button class="btn ghost sm" id="clr" type="button">✕</button></p>` : ""}
      <div class="tblbox" id="tb"></div>`;
    const draw = () => {
      const list = filtered();
      $("#tb").innerHTML = list.length ? `<table class="tbl"><thead><tr><th>${esc(t("c_name"))}</th><th>${esc(t("c_wa"))}</th><th>${esc(t("c_date"))}</th><th>${esc(t("c_goal"))}</th><th>${esc(t("c_status"))}</th><th>${esc(t("c_sub"))}</th><th>${esc(t("c_assess"))}</th></tr></thead><tbody>
        ${list.map(r => `<tr tabindex="0" data-id="${esc(r.id)}"><td><b>${esc(r.name)}</b>${needsReview(r) ? ` <span class="flag" title="${esc(t("t_review"))}">⚑</span>` : ""}<div style="color:var(--muted);font-size:.8rem">${esc(r.email)}</div></td>
          <td dir="ltr" style="text-align:start">${esc(r.whatsapp)}</td><td>${esc(fmt(r.created))}</td><td style="max-width:220px">${esc(goalText(r))}</td>
          <td><span class="pill s-${esc(r.status)}">${esc(t("st." + r.status))}</span></td>
          <td>${r.sub_months ? esc(t("months", { n: r.sub_months })) + `<div style="color:var(--muted);font-size:.8rem">${esc(fmt(r.sub_end))}</div>` : "—"}</td>
          <td>${hasAssess(r) ? `<span class="pill s-active">${esc(t("done"))}</span>` : r.token ? `<span class="pill s-new">${esc(t("notYet"))}</span>` : `<span class="pill">${esc(t("noAccess"))}</span>`}</td></tr>`).join("")}</tbody></table>`
        : `<div class="empty">${esc(rows.length ? t("none") : t("noRows"))}</div>`;
      $("#tb").querySelectorAll("tr[data-id]").forEach(tr => { const go = () => openClient(tr.dataset.id); tr.addEventListener("click", go); tr.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); });
    };
    draw();
    $("#q").addEventListener("input", e => { filter.q = e.target.value; draw(); });
    $("#st").addEventListener("change", e => { filter.st = e.target.value; draw(); });
    $("#rf").addEventListener("click", async () => { await load(); renderTable(); });
    $("#csv").addEventListener("click", exportCSV);
    const clr = $("#clr"); if (clr) clr.addEventListener("click", () => { filter.special = ""; renderTable(); });
  }
  function renderSettings() {
    $("#pane").innerHTML = `<div class="panel"><h3>${svgI(IC.gear)}${esc(t("setT"))}</h3><p style="color:var(--ink2)">${esc(t("setP"))}</p>
      <dl class="kv"><dt>${esc(t("apiUrl"))}</dt><dd dir="ltr" style="text-align:start;font-size:.85rem">${esc((window.SITE || {}).apiUrl)}</dd><dt></dt><dd style="color:var(--good)">${esc(t("apiOk"))}</dd></dl></div>`;
  }

  /* ---------- client file ---------- */
  async function openClient(id) {
    app.innerHTML = `<div class="state"><div class="spin"></div></div>`;
    const r = await api("get", { id }); if (!r.ok) { await load(); current = null; return renderShell(); }
    current = r.client; window.scrollTo(0, 0); renderDetail();
  }
  function summaryRows(c) {
    const a = c.assess || {}, p = c.app || {}, H = id => human(fld(id), (fld(id).id.startsWith("a_") ? p : a)[id], fld(id).id.startsWith("a_") ? p : a), J = xs => xs.filter(Boolean).join(" • ");
    const has = Object.keys(a).length > 0;
    const R = [
      ["goal", J([H("a_goal"), a.q4 && `“${String(a.q4).slice(0, 220)}”`])],
      ["body", has && J([H("q1"), H("q2"), a.q3 && (H("q3") + (a.q3b ? ` (${a.q3b} ${(NL().ui || {}).kg || "kg"})` : ""))])],
      ["avail", J([p.a_days && (p.a_days === "other" ? H("a_days") : t("days", { n: p.a_days })), a.q14 && t("perS", { n: a.q14 }), a.q13 != null && a.q13 !== "" && (L === "ar" ? `بيتمرن دلوقتي ${a.q13} أيام` : `currently ${a.q13} days/week`)])],
      ["exp", J([H("a_exp"), H("q16")])],
      ["where", J([H("a_where"), H("q15")])],
      ["activity", has && J([H("q34"), a.q18 && (L === "ar" ? "خطوات: " : "Steps: ") + H("q18"), a.q34b])],
      ["nutrition", has && J([H("q26"), a.q20 && `${H("q20")} ${t("meals")}`, H("q27"), a.q23 === "yes" && `${t("allergy")}: ${a.q23d || ""}`, a.q24 && `${t("dislikes")}: ${a.q24}`, a.q25 && `${t("likes")}: ${a.q25}`, a.q22 === "yes" && a.q22d])],
      ["supps", has && J([a.q30 === "yes" && a.q30a, H("q28") && (L === "ar" ? "مية: " : "Water: ") + H("q28"), a.q29 && (L === "ar" ? "كافيين: " : "Caffeine: ") + H("q29")])],
      ["sleep", has && J([a.q31 && `${H("q31")} ${t("h")}`, a.q32 && `${t("quality")} ${a.q32}/5`, a.q32b])],
      ["stress", has && J([a.q33 !== undefined && a.q33 !== "" && `${a.q33}/10`, H("q33b")])],
      ["injury", has && J([a.q9 === "yes" && `${a.q9a || ""} (${a.q9b}/10)${a.q9c ? " — " + a.q9c : ""}`, a.q10 === "yes" && `${a.q10a || ""}${a.q10b ? " · " + a.q10b : ""}${a.q10c ? " · " + t("rehab") + ": " + H("q10c") : ""}${a.q10d ? " · " + a.q10d : ""}`]) || (has ? "—" : "")],
      ["check", has && H("q38")], ["support", has && H("q39")]
    ];
    return R.filter(x => x[1]);
  }
  function chart(title, pts, key, max) {
    const v = pts.map(p => ({ d: p.date, y: p[key] === "" || p[key] == null ? null : Number(p[key]) })).filter(p => p.y != null && !isNaN(p.y));
    if (!v.length) return `<div class="chart"><h4>${esc(title)}</h4><div class="none">—</div></div>`;
    const W = 320, Hh = 140, pad = 26, ys = v.map(p => p.y), mn = max ? 0 : Math.min(...ys), mx = max || Math.max(...ys), rng = (mx - mn) || 1;
    const lo = max ? 0 : mn - rng * 0.15, hi = max ? max : mx + rng * 0.15;
    const X = i => pad + (v.length === 1 ? (W - pad * 2) / 2 : i * (W - pad * 2) / (v.length - 1)), Y = y => 12 + (Hh - 34) * (1 - (y - lo) / ((hi - lo) || 1));
    const grid = [lo, (lo + hi) / 2, hi].map(g => `<line x1="${pad}" x2="${W - 6}" y1="${Y(g)}" y2="${Y(g)}" stroke="#2b2b31"/><text x="${pad - 4}" y="${Y(g) + 4}" font-size="10" text-anchor="end" fill="#8d877b">${Math.round(g * 10) / 10}</text>`).join("");
    const line = v.length > 1 ? `<polyline fill="none" stroke="#e0ac2b" stroke-width="2" points="${v.map((p, i) => X(i) + "," + Y(p.y)).join(" ")}"/>` : "";
    const dots = v.map((p, i) => `<g class="pt" data-tip="${esc(fmt(p.d))}: ${p.y}"><circle cx="${X(i)}" cy="${Y(p.y)}" r="12" fill="transparent"/><circle cx="${X(i)}" cy="${Y(p.y)}" r="4.5" fill="#0b0b0c" stroke="#e0ac2b" stroke-width="2"/></g>`).join("");
    const xl = [0, v.length - 1].filter((x, i, a) => a.indexOf(x) === i).map(i => `<text x="${X(i)}" y="${Hh - 4}" font-size="10" text-anchor="${i === 0 && v.length > 1 ? "start" : "end"}" fill="#8d877b">${esc(fmt(v[i].d))}</text>`).join("");
    return `<div class="chart"><h4>${esc(title)}</h4><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${esc(title)}">${grid}${line}${dots}${xl}</svg></div>`;
  }
  function sectionQA(title, fields, d, count) {
    let unans = 0;
    const items = fields.filter(f => visible(f, d) && f.type !== "check").map(f => {
      const v = human(f, d[f.id], d); if (!v) unans++;
      const raw = d[f.id], flagged = ["q6", "q7", "q8", "q9", "q11", "a_med", "q23"].indexOf(f.id) > -1 && !emptyV(raw) && !(Array.isArray(raw) ? raw.every(x => x === "none") : raw === "no" || raw === "none");
      return `<div class="${v ? "" : "na"}${flagged ? " flagged" : ""}"><dt>${esc(qLabel(f.id))}</dt><dd>${esc(v || t("na"))}</dd></div>`;
    }).join("");
    count.n += unans;
    return `<details class="sec" open><summary><span>${esc(title)}</span><small>${unans ? esc(t("unanswered", { n: unans })) : "✓"}</small></summary><dl class="qa">${items}</dl></details>`;
  }
  function renderDetail() {
    setLangUI();
    const c = current, a = c.assess || {}, p = c.app || {}, has = Object.keys(a).length > 0;
    const flags = has ? S.flags(a, p) : S.flags({}, p);
    const link = c.token ? new URL("client.html?t=" + c.token, location.href).href : "";
    const nc = nextCheck(c, a);
    const waText = t("waMsg", { name: (c.name || "").split(" ")[0], link });
    const count = { n: 0 };
    const secHtml = sectionQA(t("appSec"), appFields, p, count) + (has ? S.assessment.map(s => sectionQA((NL().sec[s.id] || NC.en.sec[s.id]).t, s.fields, a, count)).join("") : `<div class="panel" style="color:var(--muted)">${esc(t("noAssess"))}</div>`);
    const ch = c.checkins || [];
    app.innerHTML = `<div class="noprint" style="display:flex;gap:8px;flex-wrap:wrap;margin:18px 0"><button class="btn ghost sm" id="bk" type="button">${esc(t("back"))}</button><span style="flex:1"></span>
        <button class="btn ghost sm" id="pdf" type="button">${esc(t("pdf"))}</button><button class="btn ghost sm" id="dl" type="button">${esc(t("report"))}</button></div>
      <div class="fhead" style="margin-bottom:14px">${svgI(IC.user)}<div><h1 style="margin:0">${esc(c.name)}</h1><span class="pill s-${esc(c.status)}">${esc(t("st." + c.status))}</span>${needsReview(c) ? ` <span class="pill bad">⚑ ${esc(t("t_review"))}</span>` : ""}</div></div>
      <div class="det">
        <div>
          <div class="panel"><h3>${svgI(IC.user)}${esc(t("contact"))}</h3><dl class="kv">
            <dt>Email</dt><dd><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></dd>
            <dt>${esc(t("c_wa"))}</dt><dd dir="ltr" style="text-align:start"><a href="https://wa.me/${esc(String(c.whatsapp).replace(/\D/g, ""))}" target="_blank" rel="noopener">${esc(c.whatsapp)}</a></dd>
            <dt>${esc(t("age"))}</dt><dd>${esc(c.age)}</dd><dt>${esc(t("sex"))}</dt><dd>${esc(human(fld("a_sex"), c.sex, p))}</dd>
            <dt>${esc(t("lang"))}</dt><dd>${esc((window.NCX && NCX.NAMES[c.lang]) || c.lang)}</dd><dt>${esc(t("applied"))}</dt><dd>${esc(fmt(c.created))}</dd>
            ${nc ? `<dt>${esc(t("c_next"))}</dt><dd>${esc(fmt(nc))}</dd>` : ""}</dl></div>
          <div class="panel noprint"><h3>${svgI(IC.gear)}${esc(t("manage"))}</h3><div class="ctl">
            <label>${esc(t("status"))}<select class="inp" id="m_st">${Object.keys(D[L].st).map(k => `<option value="${k}"${c.status === k ? " selected" : ""}>${esc(t("st." + k))}</option>`).join("")}</select></label>
            <label>${esc(t("subM"))}<select class="inp" id="m_m"><option value="">—</option>${[1, 2, 3].map(m => `<option value="${m}"${Number(c.sub_months) === m ? " selected" : ""}>${esc(t("months", { n: m }))}</option>`).join("")}</select></label>
            <label>${esc(t("start"))}<input class="inp" id="m_s" type="date" value="${esc(String(c.sub_start || "").slice(0, 10))}"></label>
            <div style="font-size:.9rem;color:var(--ink2)">${esc(t("end"))}: <b id="m_e">${esc(c.sub_end ? fmt(c.sub_end) : t("noSub"))}</b></div>
            <label>${esc(t("health"))}<select class="inp" id="m_h">${Object.keys(D[L].hr).map(k => `<option value="${k}"${(c.health_review || "") === k ? " selected" : ""}>${esc(t("hr." + k))}</option>`).join("")}</select></label>
            <label>${esc(t("notes"))}<textarea class="inp" id="m_n" rows="5">${esc(c.coach_notes || "")}</textarea></label>
            <button class="btn gold" id="m_save" type="button">${esc(t("save"))}</button></div></div>
          <div class="panel noprint"><h3>${svgI(IC.key)}${esc(t("access"))}</h3>
            <p style="color:var(--ink2);font-size:.88rem;margin-top:0">${esc(t("accessNote"))}</p>
            ${link ? `<div class="link"><input class="inp" id="lk" readonly value="${esc(link)}" aria-label="${esc(t("access"))}"><button class="btn ghost sm" id="cp" type="button">${esc(t("copy"))}</button></div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><a class="btn gold sm" target="_blank" rel="noopener" href="https://wa.me/${esc(String(c.whatsapp).replace(/\D/g, ""))}?text=${encodeURIComponent(waText)}">${esc(t("sendWa"))}</a><button class="btn ghost sm" id="rn" type="button">${esc(t("renew"))}</button></div>`
              : `<button class="btn gold" id="act" type="button">${esc(t("activate"))}</button>`}
          </div>
          <div class="panel noprint"><button class="btn ghost sm" id="del" type="button" style="color:var(--bad);border-color:rgba(255,107,94,.4)">${esc(t("del"))}</button></div>
        </div>
        <div>
          <div class="panel"><h3>${svgI(IC.flag)}${esc(t("review"))}</h3><div class="rv">${flags.length ? flags.map(f => `<div class="${f.lvl}">⚑ <span>${esc(t("lvl." + f.lvl))}: ${esc(t("f." + f.k))}</span></div>`).join("") : `<div class="low">${esc(t("nothing"))}</div>`}</div></div>
          <div class="panel"><h3>${svgI(IC.sum)}${esc(t("summary"))}</h3><p style="color:var(--muted);font-size:.84rem;margin:-6px 0 8px">${esc(t("fromAnswers"))}</p>
            <div class="sumbox">${summaryRows(c).map(([k, v]) => `<div><b>${esc(t("g." + k))}</b><span>${esc(v)}</span></div>`).join("")}
            ${flags.length ? `<div><b>${esc(t("review"))}</b><span>${esc(flags.map(f => t("f." + f.k)).join(" • "))}</span></div>` : ""}</div></div>
          <div class="panel"><h3>${svgI(IC.chart)}${esc(t("checks"))}</h3>
            ${ch.length ? `<div class="charts">${chart(t("ch_w"), ch, "weight_kg")}${chart(t("ch_waist"), ch, "waist_cm")}${chart(t("ch_adh"), ch, "nutrition_1_10", 10)}${chart(t("ch_energy"), ch, "energy_1_10", 10)}${chart(t("ch_sleep"), ch, "sleep_1_10", 10)}${chart(t("ch_sess"), ch, "sessions")}</div>
              <div style="overflow-x:auto;margin-top:12px"><table class="tbl" style="min-width:640px"><thead><tr><th>${esc(t("date"))}</th><th>kg</th><th>cm</th><th>${esc(t("ch_sess"))}</th><th>🍽</th><th>⚡</th><th>😴</th><th>${esc(t("pain"))}</th><th>${esc(t("challenge"))}</th><th>${esc(t("cnotes"))}</th></tr></thead><tbody>
              ${ch.slice().reverse().map(x => `<tr style="cursor:default"><td>${esc(fmt(x.date))}</td><td>${esc(x.weight_kg)}</td><td>${esc(x.waist_cm)}</td><td>${esc(x.sessions)}</td><td>${esc(x.nutrition_1_10)}</td><td>${esc(x.energy_1_10)}</td><td>${esc(x.sleep_1_10)}</td><td>${x.pain === "yes" ? `<span class="flag">⚑ ${esc(x.pain_details)}</span>` : "—"}</td><td>${esc(x.challenge)}</td><td>${esc(x.notes)}</td></tr>`).join("")}</tbody></table></div>`
              : `<div class="empty" style="padding:20px">${esc(t("noChecks"))}</div>`}</div>
          <h2 style="font-size:1.15rem;margin:6px 0 10px">${esc(t("answers"))} <small style="color:var(--muted);font-weight:600" id="unans"></small></h2>
          ${secHtml}
        </div>
      </div>`;
    $("#unans").textContent = "— " + (count.n ? t("unanswered", { n: count.n }) : t("allAns"));
    wireDetail(waText);
  }
  function wireDetail() {
    const c = current;
    $("#bk").addEventListener("click", async () => { current = null; view = "clients"; await load(); renderShell(); });
    $("#pdf").addEventListener("click", () => window.print());
    $("#dl").addEventListener("click", downloadReport);
    const endPrev = () => { const m = Number($("#m_m").value), s = $("#m_s").value; if (!m || !s) { $("#m_e").textContent = t("noSub"); return; }
      const d = new Date(s + "T00:00:00Z"), day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + m); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); d.setUTCDate(d.getUTCDate() - 1); $("#m_e").textContent = fmt(d.toISOString().slice(0, 10)); };
    $("#m_m").addEventListener("change", endPrev); $("#m_s").addEventListener("change", endPrev);
    $("#m_save").addEventListener("click", async e => {
      e.target.disabled = true;
      // send only what the coach changed, so an old open page never overwrites newer data
      const now = { status: $("#m_st").value, sub_months: $("#m_m").value, sub_start: $("#m_s").value, health_review: $("#m_h").value, coach_notes: $("#m_n").value };
      const was = { status: c.status, sub_months: String(c.sub_months || ""), sub_start: String(c.sub_start || "").slice(0, 10), health_review: c.health_review || "", coach_notes: c.coach_notes || "" };
      const patch = {}; for (const k in now) if (String(now[k]) !== String(was[k])) patch[k] = now[k];
      if ("sub_months" in patch || "sub_start" in patch) { patch.sub_months = now.sub_months; patch.sub_start = now.sub_start; }
      try { const r = await api("update", { id: c.id, patch }); if (r.ok) { toast(t("saved")); await openClient(c.id); } } catch (er) { toast(t("net")); }
      e.target.disabled = false;
    });
    const act = $("#act"); if (act) act.addEventListener("click", async () => { const r = await api("activate", { id: c.id }); if (r.ok) openClient(c.id); });
    const rn = $("#rn"); if (rn) rn.addEventListener("click", async () => { const r = await api("activate", { id: c.id, renew: true }); if (r.ok) openClient(c.id); });
    const cp = $("#cp"); if (cp) cp.addEventListener("click", async () => { try { await navigator.clipboard.writeText($("#lk").value); } catch (e) { $("#lk").select(); document.execCommand("copy"); } toast(t("copied")); });
    $("#del").addEventListener("click", async () => { if (!confirm(t("delQ"))) return; const r = await api("remove", { id: c.id }); if (r.ok) { current = null; await load(); view = "clients"; renderShell(); } });
    const tip = $("#tip");
    app.querySelectorAll(".pt").forEach(g => {
      g.addEventListener("mousemove", e => { tip.textContent = g.dataset.tip; tip.style.opacity = 1; tip.style.left = (e.clientX + 12) + "px"; tip.style.top = (e.clientY - 30) + "px"; });
      g.addEventListener("mouseleave", () => tip.style.opacity = 0);
      g.addEventListener("click", e => { tip.textContent = g.dataset.tip; tip.style.opacity = 1; tip.style.left = (e.clientX + 12) + "px"; tip.style.top = (e.clientY - 30) + "px"; setTimeout(() => tip.style.opacity = 0, 1800); });
    });
  }
  function downloadReport() {
    const c = current, css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join("\n"); } catch (e) { return ""; } }).join("\n");
    const body = app.cloneNode(true); body.querySelectorAll(".noprint").forEach(n => n.remove());
    const html = `<!DOCTYPE html><html lang="${L}" dir="${L === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(c.name)} — Coach Ahmed Maher</title><style>${css}</style></head><body><main class="wrap" style="padding-bottom:40px">${body.innerHTML}</main></body></html>`;
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
    a.download = (c.name || "client").replace(/[^\w؀-ۿ -]/g, "").trim().replace(/\s+/g, "_") + "_report.html"; a.click();
  }
  function exportCSV() {
    const cols = ["id", "created", "status", "name", "email", "whatsapp", "age", "sex", "lang", "goals", "experience", "days", "where", "medical", "expect", "sub_months", "sub_start", "sub_end", "health_review", "assessment_at", "flags", "checkins", "last_checkin", "coach_notes"];
    const q = v => `"${String(v == null ? "" : v).replace(/"/g, '""')}"`;
    const csv = "﻿" + cols.join(",") + "\n" + filtered().map(r => cols.map(k => q(r[k])).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })); a.download = "new_clients.csv"; a.click();
  }

  /* ---------- start ---------- */
  setLangUI();
  (async () => {
    if (!session) return renderLogin();
    app.innerHTML = `<div class="state"><div class="spin"></div></div>`;
    try { await load(); route(); } catch (e) { if (e.message !== "login") renderLogin(t(e.message === "setup" ? "setup" : "net")); }
  })();
})();
