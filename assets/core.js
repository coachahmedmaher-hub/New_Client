/* Shared code for every client page: language, header/footer, server calls, and the step-by-step form. */
(function () {
  const ORDER = ["ar", "en", "ur", "hi", "ml", "fil", "fr", "de", "ru"];
  const NAMES = { ar: "العربية", en: "English", ur: "اردو", hi: "हिन्दी", ml: "മലയാളം", fil: "Filipino", fr: "Français", de: "Deutsch", ru: "Русский" };
  const RTL = { ar: 1, ur: 1 };
  const V = "?v=3";
  const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }, del: k => { try { localStorage.removeItem(k); } catch (e) {} } };
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function pickLang() {
    const q = new URLSearchParams(location.search).get("lang"); if (q && NAMES[q]) return q;
    const u = new URLSearchParams(location.search).get("l"); if (u && NAMES[u]) { store.set("nc-lang", u); return u; }   // personal links carry the client's language
    const s = store.get("nc-lang"); if (s && NAMES[s]) return s;
    const n = (navigator.language || "en").toLowerCase(), m = { ar: "ar", ur: "ur", hi: "hi", ml: "ml", fil: "fil", tl: "fil", fr: "fr", de: "de", ru: "ru" };
    return m[n.slice(0, 3)] || m[n.slice(0, 2)] || "en";
  }
  let LANG = pickLang();
  const base = (document.currentScript && document.currentScript.src || "").replace(/core\.js.*$/, "");
  function loadLang(l) {
    return new Promise(res => {
      if (window.NC && NC[l]) return res();
      const s = document.createElement("script"); s.src = base + "lang/" + l + ".js" + V; s.onload = res; s.onerror = res; document.head.appendChild(s);
    });
  }
  function get(path, L) {
    let o = (window.NC || {})[L || LANG]; for (const k of path.split(".")) { if (o == null) break; o = o[k]; }
    if (o == null && (L || LANG) !== "en") return get(path, "en");
    return o;
  }
  function T(path, vars) { let s = get(path); if (s == null) s = path; s = String(s); if (vars) for (const k in vars) s = s.split("{" + k + "}").join(vars[k]); return s; }
  const Q = id => T("q." + id), H = id => get("h." + id);
  function O(f, v) { const set = f.set || f.id; const a = get("o." + set + "." + v); return a == null ? String(v) : a; }
  function OL(f, v, L) { const set = f.set || f.id; const a = get("o." + set + "." + v, L); return a == null ? String(v) : a; }

  const ICONS = {
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>',
    heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
    dumbbell: '<path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12"/>',
    plate: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
    moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/>',
    check: '<path d="m5 12 5 5 9-10"/>', info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    plan: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>', chat: '<path d="M4 5h16v11H9l-5 4Z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>', shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z"/>'
  };
  const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.4.8 3.2.6a2.8 2.8 0 0 0 1.8-1.3 2.3 2.3 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3Z"/></svg>';
  const IG_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';

  function chrome() {
    const h = $("#top"), f = $("#foot"), S = window.SITE || {};
    if (h) h.innerHTML = `<div class="wrap"><a class="logo" href="index.html" aria-label="${esc(T("ui.brand"))}"><span class="am">AM</span><span><b>${esc(T("ui.brand"))}</b><small>${esc(T("ui.online"))}</small></span></a>
      <div class="tools"><select class="langsel" id="langsel" aria-label="${esc(T("ui.lang"))}">${ORDER.map(k => `<option value="${k}"${k === LANG ? " selected" : ""} lang="${k}">${NAMES[k]}</option>`).join("")}</select></div></div>`;
    if (f) f.innerHTML = `<div class="wrap"><div class="social">
        <a class="wa" href="https://wa.me/${esc((S.whatsapp || "").replace(/\D/g, ""))}" target="_blank" rel="noopener">${WA_SVG}<span>${esc(T("ui.wa"))}</span></a>
        <a class="ig" href="https://www.instagram.com/${esc(S.instagram || "")}/" target="_blank" rel="noopener">${IG_SVG}<span dir="ltr">@${esc(S.instagram || "")}</span></a></div>
        <div class="flinks"><a href="privacy.html">${esc(T("ui.privacy"))}</a><a href="terms.html">${esc(T("ui.terms"))}</a></div>
        <div>${esc(T("ui.rights", { y: new Date().getFullYear() }))}</div></div>`;
    const sel = $("#langsel");
    if (sel) sel.addEventListener("change", async () => { await setLang(sel.value); });
  }
  const listeners = [];
  async function setLang(l) {
    if (!NAMES[l]) return; await loadLang(l); LANG = l; store.set("nc-lang", l);
    document.documentElement.lang = l; document.documentElement.dir = RTL[l] ? "rtl" : "ltr";
    chrome(); $$("[data-t]").forEach(n => n.innerHTML = T(n.dataset.t)); listeners.forEach(fn => fn(l));
  }
  async function start(fn) {
    await loadLang("en"); await loadLang(LANG);
    document.documentElement.lang = LANG; document.documentElement.dir = RTL[LANG] ? "rtl" : "ltr";
    chrome(); $$("[data-t]").forEach(n => n.innerHTML = T(n.dataset.t));
    if (fn) { listeners.push(fn); fn(LANG); }
  }

  async function api(action, payload) {
    const url = (window.SITE || {}).apiUrl;
    if (!url) throw new Error("setup");
    const res = await fetch(url, { method: "POST", body: JSON.stringify(Object.assign({ action }, payload || {})) });
    if (!res.ok) throw new Error("net");
    return res.json();
  }

  /* Number colours: green = good, dark red = bad. lowGood: 0 is good (pain, stress). highGood: max is good (sleep, energy). */
  function tone(f, v) {
    let t = (v - f.min) / ((f.max - f.min) || 1); if (f.tone === "highGood") t = 1 - t;
    const h = Math.round(125 * (1 - t)), l = Math.round(40 - t * 12), sat = 72;
    return `background:hsl(${h} ${sat}% ${l}%);border-color:hsl(${h} ${sat}% ${l + 8}%);color:#fff`;
  }
  window.NC_TONE = tone;

  /* ---------- the form ---------- */
  const CODES = ["+971", "+966", "+974", "+965", "+968", "+973", "+20", "+962", "+961", "+212", "+213", "+216", "+91", "+92", "+880", "+94", "+977", "+63", "+44", "+33", "+49", "+7", "+1", "+61", "+90", "+98"];
  const visible = (f, d) => !f.show || f.show(d);
  const empty = v => v == null || v === "" || (Array.isArray(v) && !v.length);

  function Form(root, sections, opts) {
    const d = opts.data || {}; let step = opts.step || 0;
    const total = sections.length;
    function save() { if (opts.onChange) opts.onChange(d, step); }
    function fieldHtml(f) {
      const id = "f_" + f.id, val = d[f.id], help = H(f.id);
      const req = f.req ? ` <span class="req" aria-hidden="true">*</span>` : (f.type === "check" || T("q." + f.id).indexOf(T("ui.optional")) > -1 ? "" : ` <span class="optl">(${esc(T("ui.optional"))})</span>`);
      const sub = f.show ? " sub" : "";
      let lab = f.type === "check" ? "" : `<label class="lbl" for="${id}" id="${id}_l">${esc(Q(f.id))}${req}</label>`;
      let h = help ? `<p class="help" id="${id}_h">${esc(help)}</p>` : "";
      let body = "";
      const desc = `aria-describedby="${help ? id + "_h " : ""}${id}_e"`;
      if (f.type === "text" || f.type === "email" || f.type === "textarea") {
        const t = f.type === "textarea" ? "textarea" : "input";
        body = `<${t} class="inp" id="${id}" data-k="${f.id}" ${t === "input" ? `type="${f.type === "email" ? "email" : "text"}"` : ""} maxlength="${f.max || 500}" ${f.auto ? `autocomplete="${f.auto}"` : ""} ${desc}${f.req ? " aria-required=\"true\"" : ""}>${t === "textarea" ? esc(val || "") + "</textarea>" : ""}`;
        if (t === "input") body = body.replace("<input ", `<input value="${esc(val || "")}" `);
      } else if (f.type === "number") {
        body = `<div class="unitwrap"><input class="inp" id="${id}" data-k="${f.id}" type="number" inputmode="decimal" min="${f.min}" max="${f.max}" step="${f.step || 1}" value="${esc(val == null ? "" : val)}" ${desc}>${f.unit ? `<span class="unit">${esc(T("ui." + f.unit))}</span>` : ""}</div>`;
      } else if (f.type === "phone") {
        const v = String(val || "+971 "), sp = v.indexOf(" "), cc = sp > 0 ? v.slice(0, sp) : "+971", num = sp > 0 ? v.slice(sp + 1) : "";
        body = `<div class="phone" dir="ltr"><select class="inp" data-pc="${f.id}" aria-label="Country code">${CODES.map(c => `<option${c === cc ? " selected" : ""}>${c}</option>`).join("")}</select><input class="inp" id="${id}" data-pn="${f.id}" type="tel" inputmode="tel" autocomplete="tel-national" value="${esc(num)}" ${desc}></div>`;
      } else if (f.type === "height" || f.type === "weight") {
        const H2 = f.type === "height", v = val || { u: H2 ? "cm" : "kg" }, units = H2 ? ["cm", "ft"] : ["kg", "lb"];
        body = `<div class="seg" role="group" aria-label="${esc(Q(f.id))}">${units.map(u => `<button type="button" data-unit="${f.id}" data-u="${u}" aria-pressed="${v.u === u}">${esc(T("ui." + u))}</button>`).join("")}</div>`;
        if (H2 && v.u === "ft") body += `<div class="unitwrap"><input class="inp" id="${id}" data-uk="${f.id}" data-part="ft" type="number" inputmode="numeric" min="3" max="8" value="${esc(v.ft || "")}" ${desc}><span class="unit">${esc(T("ui.ft"))}</span><input class="inp" data-uk="${f.id}" data-part="in" type="number" inputmode="numeric" min="0" max="11" value="${esc(v.in == null ? "" : v.in)}" aria-label="${esc(T("ui.in"))}"><span class="unit">${esc(T("ui.in"))}</span></div>`;
        else body += `<div class="unitwrap"><input class="inp" id="${id}" data-uk="${f.id}" data-part="v" type="number" inputmode="decimal" step="0.1" value="${esc(v.v || "")}" ${desc}><span class="unit">${esc(T("ui." + v.u))}</span></div>`;
      } else if (f.type === "single" || f.type === "multi" || f.type === "scale") {
        const multi = f.type === "multi", list = f.type === "scale" ? Array.from({ length: f.max - f.min + 1 }, (_, i) => String(f.min + i)) : f.opts;
        const cls = f.type === "scale" ? "scale" : "opts" + (f.row ? " row" : "");
        body = `<div class="${cls}" role="${multi ? "group" : "radiogroup"}" aria-labelledby="${id}_l" id="${id}">` + list.map(o => {
          const on = multi ? (Array.isArray(val) && val.indexOf(o) > -1) : String(val) === o;
          const st = f.stars && f.stars[o] ? `<span class="stars" aria-hidden="true">${"★".repeat(f.stars[o])}</span>` : "";
          const col = on && f.tone ? ` style="${tone(f, Number(o))}"` : "";
          return `<label class="opt${multi ? " multi" : ""}${on ? " on" : ""}${col ? " toned" : ""}"${col}><input type="${multi ? "checkbox" : "radio"}" name="${id}" value="${esc(o)}" data-k="${f.id}"${on ? " checked" : ""}><span class="mk"></span><span>${esc(f.type === "scale" ? o : O(f, o))}</span>${st}</label>`;
        }).join("") + `</div>`;
        if (f.type === "scale") body += `<div class="scale-ends"><span>${f.min}</span><span>${f.max}</span></div>`;
        if (f.ask && f.ask.indexOf(val) > -1) body += `<div class="unitwrap other"><input class="inp" data-k="${f.id}_n" type="number" inputmode="numeric" min="0" max="100000" value="${esc(d[f.id + "_n"] == null ? "" : d[f.id + "_n"])}" placeholder="${esc(T("ui.howMany"))}" aria-label="${esc(T("ui.howMany"))}"></div>`;
        if (f.note) body += `<div class="note hot">${icon("info")}<span>${esc(T("ui." + f.note))}</span></div>`;
        if (f.other && (multi ? (val || []).indexOf("other") > -1 : val === "other")) body += `<input class="inp other" data-k="${f.id}_o" type="text" maxlength="200" placeholder="${esc(T("ui.other"))}" value="${esc(d[f.id + "_o"] || "")}" aria-label="${esc(T("ui.other"))}">`;
      } else if (f.type === "check") {
        body = `<label class="check"><input type="checkbox" id="${id}" data-k="${f.id}"${val ? " checked" : ""}><span>${T("q." + f.id)}${f.req ? ` <span class="req">*</span>` : ""}</span></label>`;
      }
      return `<div class="field${sub}" data-f="${f.id}">${lab}${h}${body}<div class="err" id="${id}_e" role="alert" hidden></div></div>`;
    }
    function render(focusTop) {
      const sec = sections[step], st = get("sec." + sec.id) || {};
      const pct = Math.round(((step) / total) * 100);
      let html = "";
      if (opts.header) html += opts.header(sec, step, total);
      if (total > 1) html += `<div class="progress"><div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${Math.max(pct, 4)}%"></i></div>
        <div class="meta"><span>${esc(T("ui.step", { a: step + 1, b: total }))}</span><span class="saved" id="savedmark" hidden>✓ ${esc(T("ui.draft"))}</span></div>
        <div class="secdots">${sections.map((s, i) => `<span class="${i === step ? "on" : i < step ? "done" : ""}" title="${esc((get("sec." + s.id) || {}).t || "")}">${icon(s.icon || "check")}</span>`).join("")}</div></div>`;
      if (total > 1 || st.d) html += `<div class="fhead">${sec.icon ? `<span class="ico">${icon(sec.icon)}</span>` : ""}<h2>${esc(st.t || "")}</h2></div>${st.d ? `<p class="fdesc">${esc(st.d)}</p>` : ""}`;
      if (sec.note) html += `<div class="note">${icon("shield")}<span>${esc(T("ui." + sec.note))}<br>${T("ui.parq")}</span></div>`;
      html += `<div class="fields">` + sec.fields.filter(f => visible(f, d)).map(fieldHtml).join("") + `</div>`;
      if (opts.extra) html += opts.extra(sec, step, total);
      html += `<div class="formerr" id="formerr" hidden></div><div class="nav">${step > 0 ? `<button type="button" class="btn ghost" id="prev">${esc(T("ui.back"))}</button>` : "<span></span>"}<button type="button" class="btn gold" id="next">${esc(step === total - 1 ? T("ui.submit") : T("ui.next"))}</button></div>`;
      root.innerHTML = html;
      wire();
      if (focusTop) { root.scrollIntoView({ behavior: "smooth", block: "start" }); const h = root.querySelector("h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
    }
    function rerenderFields() {   // conditional questions appear/disappear without losing focus position
      const sec = sections[step], box = root.querySelector(".fields"), act = document.activeElement, actK = act && (act.dataset.k || act.dataset.pn || act.dataset.uk), part = act && act.dataset.part;
      const y = window.scrollY;
      box.innerHTML = sec.fields.filter(f => visible(f, d)).map(fieldHtml).join("");
      wire(true);
      if (actK) { const el = box.querySelector(`[data-k="${actK}"]${act.type === "radio" || act.type === "checkbox" ? `[value="${CSS.escape(act.value)}"]` : ""},[data-pn="${actK}"],[data-uk="${actK}"]${part ? `[data-part="${part}"]` : ""}`); if (el) el.focus({ preventScroll: true }); }
      window.scrollTo(0, y);
    }
    function wire(fieldsOnly) {
      const sec = sections[step];
      root.querySelectorAll("[data-k]").forEach(el => {
        const k = el.dataset.k, f = sec.fields.find(x => x.id === k);
        if (el.type === "radio") el.addEventListener("change", () => { d[k] = el.value; clearErr(k); save(); rerenderFields(); mark(); });
        else if (el.type === "checkbox" && f && f.type === "multi") el.addEventListener("change", () => {
          let a = Array.isArray(d[k]) ? d[k].slice() : [];
          if (el.checked) { if ((f.excl || []).indexOf(el.value) > -1) a = [el.value]; else a = a.filter(x => (f.excl || []).indexOf(x) < 0).concat(el.value); }
          else a = a.filter(x => x !== el.value);
          d[k] = a; clearErr(k); save(); rerenderFields(); mark();
        });
        else if (el.type === "checkbox") el.addEventListener("change", () => { d[k] = el.checked; clearErr(k); save(); rerenderFields(); mark(); });
        else el.addEventListener("input", () => { d[k] = el.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value; clearErr(k.replace(/_(o|n)$/, "")); save(); mark(); });
      });
      root.querySelectorAll("[data-pn],[data-pc]").forEach(el => el.addEventListener("input", () => {
        const k = el.dataset.pn || el.dataset.pc, w = el.closest(".phone");
        d[k] = w.querySelector("select").value + " " + w.querySelector("input").value.replace(/[^\d ]/g, "").trim(); clearErr(k); save(); mark();
      }));
      root.querySelectorAll("[data-unit]").forEach(b => b.addEventListener("click", () => {
        const k = b.dataset.unit, prev = d[k] || {}; if (prev.u === b.dataset.u) return;
        d[k] = { u: b.dataset.u }; save(); rerenderFields();
      }));
      root.querySelectorAll("[data-uk]").forEach(el => el.addEventListener("input", () => {
        const k = el.dataset.uk, o = Object.assign({ u: (d[k] || {}).u || (k === "q1" ? "cm" : "kg") }, d[k] || {});
        o[el.dataset.part] = el.value === "" ? "" : Number(el.value); d[k] = o; clearErr(k); save(); mark();
      }));
      if (fieldsOnly) return;
      const prev = root.querySelector("#prev"), next = root.querySelector("#next");
      if (prev) prev.addEventListener("click", () => { step--; save(); render(true); });
      next.addEventListener("click", async () => {
        if (!validate()) return;
        if (step < total - 1) { step++; save(); render(true); return; }
        next.disabled = true; next.textContent = T("ui.sending"); const fe = root.querySelector("#formerr"); fe.hidden = true;
        try { await opts.onSubmit(d); }
        catch (e) { fe.textContent = T(e && e.message === "setup" ? "ui.eSetup" : "ui.eNet"); fe.hidden = false; next.disabled = false; next.textContent = T("ui.submit"); }
      });
    }
    let markT; function mark() { const m = root.querySelector("#savedmark"); if (!m || !opts.draft) return; m.hidden = false; clearTimeout(markT); markT = setTimeout(() => m.hidden = true, 1600); }
    function clearErr(k) { const fd = root.querySelector(`[data-f="${k}"]`); if (fd) { fd.classList.remove("bad"); const e = fd.querySelector(".err"); if (e) e.hidden = true; } }
    function check(f) {
      const v = d[f.id];
      if (f.type === "height" || f.type === "weight") {
        const o = v || {}; let n;
        if (f.type === "height") n = o.u === "ft" ? ((Number(o.ft) || 0) * 30.48 + (Number(o.in) || 0) * 2.54) : Number(o.v);
        else n = o.u === "lb" ? Number(o.v) * 0.4536 : Number(o.v);
        if (!n) return f.req ? "ui.eReq" : null;
        const [a, b] = f.type === "height" ? [100, 250] : [30, 300];
        if (n < a || n > b) return ["ui.eNum", f.type === "height" ? (o.u === "ft" ? { a: "3 ft", b: "8 ft" } : { a: 100, b: 250 }) : (o.u === "lb" ? { a: 66, b: 660 } : { a: 30, b: 300 })];
        return null;
      }
      if (f.type === "phone") { const digits = String(v || "").split(" ").slice(1).join("").replace(/\D/g, ""); if (!digits) return f.req ? "ui.eReq" : null; return digits.length < 6 || digits.length > 14 ? "ui.ePhone" : null; }
      if (f.type === "check") return f.req && !v ? "ui.eReq" : null;
      if (empty(v) || (typeof v === "string" && !v.trim())) return f.req ? "ui.eReq" : null;
      if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(v).trim())) return "ui.eEmail";
      if (f.type === "number") { const n = Number(v); if (isNaN(n) || n < f.min || n > f.max) return ["ui.eNum", { a: f.min, b: f.max }]; }
      if (f.other && (Array.isArray(v) ? v.indexOf("other") > -1 : v === "other") && !String(d[f.id + "_o"] || "").trim()) return "ui.eOther";
      if (f.ask && f.ask.indexOf(v) > -1 && (d[f.id + "_n"] === "" || d[f.id + "_n"] == null)) return "ui.eHowMany";
      return null;
    }
    function validate() {
      const sec = sections[step]; let first = null;
      sec.fields.filter(f => visible(f, d)).forEach(f => {
        const r = check(f), fd = root.querySelector(`[data-f="${f.id}"]`); if (!fd) return;
        const e = fd.querySelector(".err");
        if (r) { const [k, vars] = Array.isArray(r) ? r : [r]; e.textContent = T(k, vars); e.hidden = false; fd.classList.add("bad"); if (!first) first = fd; }
      });
      if (first) { first.scrollIntoView({ behavior: "smooth", block: "center" }); const el = first.querySelector("input,textarea,select"); if (el) setTimeout(() => el.focus({ preventScroll: true }), 300); return false; }
      return true;
    }
    render(false);
    return { rerender: () => render(false), data: d, get step() { return step; } };
  }

  /* Plain-language copy of the answers (English, for the coach's Google Sheet). */
  function flatten(sections, d) {
    const out = {};
    sections.forEach(sec => sec.fields.forEach(f => {
      if (!visible(f, d) || f.type === "check") return;
      const v = d[f.id]; if (empty(v)) return;
      const key = f.id.toUpperCase() + " " + T("q." + f.id).replace(/\s*\(optional\)\s*/i, "");
      out[key] = human(f, v, d, "en");
    }));
    return out;
  }
  function human(f, v, d, L) {
    if (v == null || v === "") return "";
    const tl = p => get(p, L);
    if (f.type === "height") return v.u === "ft" ? `${v.ft || 0} ft ${v.in || 0} in (${Math.round((v.ft || 0) * 30.48 + (v.in || 0) * 2.54)} cm)` : `${v.v} cm`;
    if (f.type === "weight") return v.u === "lb" ? `${v.v} lb (${Math.round(v.v * 0.4536 * 10) / 10} kg)` : `${v.v} kg`;
    if (f.type === "single" || f.type === "multi") {
      const a = (Array.isArray(v) ? v : [v]).map(x => x === "other" && d[f.id + "_o"] ? OL(f, x, L) + ": " + d[f.id + "_o"] : (f.ask && f.ask.indexOf(x) > -1 && d[f.id + "_n"] !== "" && d[f.id + "_n"] != null) ? OL(f, x, L) + ": " + d[f.id + "_n"] : OL(f, x, L));
      return a.join(", ");
    }
    if (f.type === "scale") return `${v} / ${f.max}`;
    if (f.type === "number" && f.unit) return `${v} ${tl("ui." + f.unit) || f.unit}`;
    if (f.type === "check") return v ? "✓" : "";
    return String(v);
  }

  window.NCX = { $, $$, esc, T, Q, O, OL, get, icon, start, setLang, loadLang, api, Form, flatten, human, visible, empty, store, LANG: () => LANG, NAMES, ORDER, WA_SVG, IG_SVG };
})();
