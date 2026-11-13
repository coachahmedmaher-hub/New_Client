/* All questions in one place. Words live in assets/lang/<lang>.js (q = question, h = helper, o = options).
   type: text | textarea | email | phone | number | single | multi | scale | height | weight
   show(d) = only when that returns true. excl = options that can't be combined with others. other = adds a text box. */
(function () {
  const yes = v => v === "yes", any = (a, xs) => Array.isArray(a) && a.some(x => xs.indexOf(x) < 0);
  const S = {};

  S.application = [{ id: "app", fields: [
    { id: "a_name", type: "text", req: true, max: 120, auto: "name" },
    { id: "a_email", type: "email", req: true, auto: "email" },
    { id: "a_wa", type: "phone", req: true },
    { id: "a_age", type: "number", req: true, min: 10, max: 100, unit: "years" },
    { id: "a_sex", type: "single", req: true, opts: ["male", "female"] },
    { id: "a_goal", type: "multi", req: true, opts: ["fat_loss", "muscle_gain", "recomp", "weight_gain", "strength", "athletic", "mobility", "health", "other"], other: true },
    { id: "a_exp", type: "single", req: true, opts: ["complete_beginner", "beginner", "intermediate", "advanced"] },
    { id: "a_days", type: "single", req: true, opts: ["2", "3", "4", "5", "6", "other"], other: true },
    { id: "a_where", type: "single", req: true, opts: ["gym", "home_gym", "home_none", "combo"] },
    { id: "a_med", type: "single", req: true, opts: ["no", "yes", "private"] },
    { id: "a_expect", type: "multi", req: true, opts: ["program", "nutrition", "accountability", "technique", "monitoring", "complete"] },
    { id: "a_plan", type: "single", req: true, opts: ["2", "3", "4"], note: "planNote" }
  ] }];

  S.assessment = [
    { id: "s1", icon: "target", fields: [
      { id: "q1", type: "height", req: true },
      { id: "q2", type: "weight", req: true },
      { id: "q3", type: "single", req: true, opts: ["increased", "decreased", "stable", "unsure"] },
      { id: "q3b", type: "number", min: 0, max: 80, unit: "kg", show: d => d.q3 === "increased" || d.q3 === "decreased" },
      { id: "q4", type: "textarea", req: true, max: 1500 },
      { id: "q5", type: "multi", req: true, opts: ["time", "nutrition", "motivation", "knowledge", "inconsistency", "health", "other"], other: true }
    ] },
    { id: "s2", icon: "heart", note: "healthNote", fields: [
      { id: "q6", type: "multi", req: true, opts: ["none", "cardio", "bp", "diabetes", "resp", "neuro", "bone", "other_dx", "private"], excl: ["none", "private"] },
      { id: "q6d", type: "textarea", max: 1500, show: d => any(d.q6, ["none", "private"]) },
      { id: "q7", type: "multi", req: true, opts: ["chest", "dizzy", "breath", "palp", "none", "private"], excl: ["none", "private"] },
      { id: "q8", type: "single", req: true, opts: ["yes", "no", "unsure"], set: "ynu" },
      { id: "q8d", type: "textarea", max: 1500, show: d => d.q8 === "yes" },
      { id: "q9", type: "single", req: true, opts: ["yes", "no"], set: "yn" },
      { id: "q9a", type: "text", req: true, max: 200, show: d => yes(d.q9) },
      { id: "q9b", type: "scale", min: 0, max: 10, tone: "lowGood", req: true, show: d => yes(d.q9) },
      { id: "q9c", type: "text", max: 300, show: d => yes(d.q9) },
      { id: "q9d", type: "text", max: 300, show: d => yes(d.q9) },
      { id: "q9e", type: "text", req: true, max: 120, show: d => yes(d.q9) },
      { id: "q10", type: "single", req: true, opts: ["yes", "no"], set: "yn" },
      { id: "q10a", type: "text", req: true, max: 200, show: d => yes(d.q10) },
      { id: "q10b", type: "text", max: 80, show: d => yes(d.q10) },
      { id: "q10c", type: "single", opts: ["yes", "partly", "no"], show: d => yes(d.q10) },
      { id: "q10d", type: "text", max: 300, show: d => yes(d.q10) },
      { id: "q11", type: "single", req: true, opts: ["yes", "no", "unsure"], set: "ynu" },
      { id: "q11d", type: "textarea", max: 1500, show: d => d.q11 === "yes" },
      { id: "q12a", type: "single", opts: ["no", "sometimes", "daily", "skip"] },
      { id: "q12b", type: "single", opts: ["no", "sometimes", "weekly", "daily", "skip"] }
    ] },
    { id: "s3", icon: "dumbbell", fields: [
      { id: "q13", type: "single", req: true, opts: ["0", "1", "2", "3", "4", "5", "6", "7"], row: true },
      { id: "q14", type: "single", req: true, opts: ["30", "45", "60", "75", "90"], row: true },
      { id: "q15", type: "multi", req: true, opts: ["full_gym", "db", "bb", "bands", "cardio", "bw", "other"], other: true },
      { id: "q16", type: "single", req: true, opts: ["none", "lt6", "6to12", "1to3", "gt3"] },
      { id: "q17", type: "textarea", max: 1500 },
      { id: "q18", type: "single", req: true, opts: ["lt3", "3to5", "5to8", "8to10", "gt10", "unknown"], stars: { "3to5": 1, "5to8": 2, "8to10": 3, gt10: 4 } },
      { id: "q19a", type: "text", max: 300 },
      { id: "q19b", type: "text", max: 300 }
    ] },
    { id: "s4", icon: "plate", fields: [
      { id: "q20", type: "single", req: true, opts: ["1", "2", "3", "4", "5"], row: true },
      { id: "q21a", type: "text", max: 300 }, { id: "q21b", type: "text", max: 300 }, { id: "q21c", type: "text", max: 300 },
      { id: "q21d", type: "text", max: 300 }, { id: "q21e", type: "text", max: 300 },
      { id: "q22", type: "single", req: true, opts: ["yes", "no"], set: "yn" },
      { id: "q22d", type: "textarea", max: 1000, show: d => yes(d.q22) },
      { id: "q23", type: "single", req: true, opts: ["yes", "no", "unsure"], set: "ynu" },
      { id: "q23d", type: "text", req: true, max: 300, show: d => yes(d.q23) },
      { id: "q24", type: "textarea", max: 800 },
      { id: "q25", type: "textarea", max: 800 },
      { id: "q26", type: "single", req: true, opts: ["none", "vegetarian", "vegan", "halal", "religious", "other"], other: true },
      { id: "q27", type: "single", req: true, opts: ["home", "family", "restaurants", "prep", "combo"] },
      { id: "q27b", type: "single", opts: ["tight", "moderate", "flexible", "skip"] },
      { id: "q28", type: "single", req: true, opts: ["lt1", "1to15", "15to2", "2to3", "gt3", "unsure"] },
      { id: "q29", type: "single", req: true, opts: ["0", "1", "2", "3"], row: true },
      { id: "q29d", type: "text", max: 200, show: d => d.q29 && d.q29 !== "0" },
      { id: "q30", type: "single", req: true, opts: ["yes", "no"], set: "yn" },
      { id: "q30a", type: "textarea", req: true, max: 1000, show: d => yes(d.q30) },
      { id: "q30b", type: "text", max: 300, show: d => yes(d.q30) }
    ] },
    { id: "s5", icon: "moon", fields: [
      { id: "q31", type: "single", req: true, opts: ["lt5", "5to6", "6to7", "7to8", "8to9", "gt9"] },
      { id: "q32", type: "scale", min: 1, max: 5, tone: "highGood", req: true },
      { id: "q32b", type: "text", max: 120 },
      { id: "q33", type: "scale", min: 0, max: 10, tone: "lowGood", req: true },
      { id: "q33b", type: "multi", opts: ["sleep", "appetite", "training", "none"], excl: ["none"], show: d => Number(d.q33) >= 7 },
      { id: "q34", type: "single", req: true, opts: ["sitting", "standing", "walking", "physical", "mixed", "shift"] },
      { id: "q34b", type: "text", max: 200 }
    ] },
    { id: "s6", icon: "chart", fields: [
      { id: "q35", type: "single", req: true, opts: ["yes", "no", "other"] },
      { id: "q36", type: "single", req: true, opts: ["yes", "no", "help"] },
      { id: "q37", type: "single", req: true, opts: ["yes", "no"], set: "yn" },
      { id: "q38", type: "single", req: true, opts: ["sat", "sun", "mon", "tue", "wed", "thu", "fri"], row: true },
      { id: "q39", type: "multi", req: true, opts: ["accountability", "workout", "nutrition", "motivation", "reports"] },
      { id: "q40", type: "textarea", max: 2000 },
      { id: "consent_health", type: "check", req: true },
      { id: "consent_photos", type: "check", show: d => yes(d.q37) }
    ] }
  ];

  S.checkin = [{ id: "ci", fields: [
    { id: "c_weight", type: "number", min: 30, max: 300, step: 0.1, unit: "kg" },
    { id: "c_waist", type: "number", min: 40, max: 250, step: 0.5, unit: "cm" },
    { id: "c_sessions", type: "single", req: true, opts: ["0", "1", "2", "3", "4", "5", "6", "7"], row: true },
    { id: "c_nutrition", type: "scale", min: 1, max: 10, tone: "highGood", req: true },
    { id: "c_energy", type: "scale", min: 1, max: 10, tone: "highGood", req: true },
    { id: "c_sleep", type: "scale", min: 1, max: 10, tone: "highGood", req: true },
    { id: "c_steps", type: "single", opts: ["lt2", "2to4", "4to6", "6to8", "8to10", "gt10"], stars: { "2to4": 1, "4to6": 2, "6to8": 3, "8to10": 4, gt10: 5, lt2: 0 }, ask: ["lt2", "gt10"] },
    { id: "c_pain", type: "single", req: true, opts: ["yes", "no"], set: "yn" },
    { id: "c_paind", type: "textarea", req: true, max: 800, show: d => yes(d.c_pain) },
    { id: "c_challenge", type: "textarea", max: 800 },
    { id: "c_notes", type: "textarea", max: 1500 }
  ] }];

  /* What the coach must look at — computed only from what the client answered. */
  S.flags = function (a, app) {
    const out = [], arr = x => Array.isArray(x) ? x : [];
    if (arr(a.q7).some(x => x !== "none")) out.push({ k: "f_symptoms", lvl: "high" });
    if (arr(a.q6).some(x => x !== "none")) out.push({ k: "f_conditions", lvl: "mid" });
    if (a.q8 === "yes" || a.q8 === "unsure") out.push({ k: "f_meds", lvl: "mid" });
    if (a.q9 === "yes") out.push({ k: "f_pain", lvl: Number(a.q9b) >= 6 ? "high" : "mid" });
    if (a.q11 === "yes" || a.q11 === "unsure") out.push({ k: "f_advice", lvl: "mid" });
    if (a.q10 === "yes" && a.q10c && a.q10c !== "yes") out.push({ k: "f_rehab", lvl: "mid" });
    if (a.q23 === "yes" || a.q23 === "unsure") out.push({ k: "f_allergy", lvl: "low" });
    if (app && (app.a_med === "yes" || app.a_med === "private")) out.push({ k: "f_appmed", lvl: "mid" });
    return out;
  };
  window.SCHEMA = S;
})();
