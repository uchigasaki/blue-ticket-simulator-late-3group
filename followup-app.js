(function () {
  "use strict";
  const config = window.EXPERIMENT_CONFIG || {};
  const evaluation = window.EVALUATION_DATA || {};
  const byId = id => document.getElementById(id);
  const form = byId("followup-form");
  const formsMode = config.followupMode === "google_forms";
  const local = ["localhost", "127.0.0.1", "::1", "[::1]"].includes(location.hostname);
  const preview = local && new URLSearchParams(location.search).get("preview") === "1";
  const fragment = new URLSearchParams(location.hash.slice(1));
  const token = fragment.getAll("token").length === 1 ? fragment.get("token") : "";
  const texts = {
    ja: {
      heading: "1週間後アンケート", intro: "教材を見直さず、現在の理解で回答してください。個人用リンクは他の人に共有しないでください。",
      loading: "参加記録を確認しています…", preview: "ローカル確認用：回答は送信されず、研究データには記録されません。",
      ready: "回答できます。すべての必須項目に回答して送信してください。", submit: "回答を送信", retry: "再試行",
      saving: "同じタブでは途中の回答を保存します。", pending: "回答を送信し、保存結果を確認しています…",
      success: "回答が保存されました。ご協力ありがとうございました。", previewSuccess: "確認用の回答を受け付けました。外部への送信はしていません。",
      required: "未回答または入力範囲外の項目があります。赤枠の項目を確認してください。", optional: "任意",
      failed: "保存を確認できませんでした。回答を保持しています。同じ画面で再試行してください。",
      invalid: "このリンクは無効です。案内された個人用リンクを開き直してください。",
      configured: "アンケートの設定を確認できません。研究担当者に連絡してください。",
      completed: "研究サーバーで回答の受理を確認しました。ご協力ありがとうございました。",
      formsReady: "Googleフォームで回答してください。送信後はこの画面に戻り、受理状況を確認してください。",
      formsNotice: "Googleフォームの送信完了画面だけでは、研究データとしての受理は確定しません。識別情報や期限などを研究サーバーが照合した後に、ここへ受理済みと表示します。",
      formsOpen: "Googleフォームを開く（新しいタブ）", formsCheck: "受理状況を再確認",
      formsPreview: "確認用：本番では参加記録・開始日時・期限をサーバーで確認し、専用Googleフォームを表示します。この画面からフォームを開いたり回答を送信したりはしません。",
      expired: "このアンケートの回答期限は終了しました。", not_due: "回答開始日時：", unavailable: "参加記録を確認できませんでした。通信状態を確認して再試行してください。",
      storage: "回答の一時保存が利用できません。ブラウザの保存設定を確認して開き直してください。"
    },
    en: {
      heading: "One-week follow-up survey", intro: "Please answer from your current understanding without reviewing the learning material. Do not share your personal link.",
      loading: "Checking your participation record…", preview: "Local preview: responses are not sent or included in research data.",
      ready: "The survey is open. Please answer all required questions before submitting.", submit: "Submit responses", retry: "Retry",
      saving: "Your unfinished responses are saved in this tab.", pending: "Sending responses and checking the saved record…",
      success: "Your responses have been saved. Thank you for participating.", previewSuccess: "Preview responses accepted. Nothing was sent externally.",
      required: "Some responses are missing or out of range. Please check the questions outlined in red.", optional: "Optional",
      failed: "Saving could not be confirmed. Your responses have been kept. Please retry on this page.",
      invalid: "This link is invalid. Please reopen the personal link you received.", configured: "The survey configuration could not be verified. Please contact the researcher.",
      completed: "The research server has confirmed acceptance of your response. Thank you.", expired: "The response deadline has passed.",
      formsReady: "Please answer in Google Forms, then return here to check whether your response has been accepted.",
      formsNotice: "The Google Forms thank-you screen alone does not confirm acceptance into the research data. Acceptance appears here only after the research server has checked the identity, response period, and other requirements.",
      formsOpen: "Open Google Form (new tab)", formsCheck: "Check acceptance again",
      formsPreview: "Preview only: the live page will verify participation, opening time, and deadline before offering your personal Google Form. No form is opened and no response is sent here.",
      not_due: "The survey opens at: ", unavailable: "The participation record could not be checked. Check your connection and retry.",
      storage: "Temporary response storage is unavailable. Check your browser storage settings and reopen this page."
    }
  };
  let language = new URLSearchParams(location.search).get("lang") === "en" ? "en" : "ja";
  let identity = null;
  let draft = null;
  let storageKey = "";
  let instrumentHash = "";
  let busy = false;
  let retryAction = initialize;
  let initializationSerial = 0;
  const identityFields = ["followup_id", "experiment_id", "allocation_version", "assignment_id", "session_id", "participant_id", "participant_id_normalized", "store_id", "condition", "parent_submission_id", "instrument_version", "instrument_hash"];
  const text = key => texts[language][key];
  const items = lang => ["extensions", "futureItems"].flatMap(key => evaluation[key]?.followup?.[lang] || []);
  const answerItems = () => items(language).filter(item => item.type !== "notice");
  const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object"
    ? Object.keys(value).sort().reduce((out, key) => { out[key] = canonical(value[key]); return out; }, {}) : value;
  async function sha256(value) {
    return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))))
      .map(byte => byte.toString(16).padStart(2, "0")).join("");
  }
  function status(key, error, suffix) {
    const element = byId("status");
    element.textContent = text(key) + (suffix || "");
    element.setAttribute("role", error ? "alert" : "status");
    if (error) { element.tabIndex = -1; element.focus(); }
  }
  function labels() {
    document.documentElement.lang = language;
    byId("language").value = language;
    byId("heading").textContent = text("heading");
    byId("intro").textContent = text("intro");
    byId("submit").textContent = text("submit");
    byId("retry").textContent = text("retry");
    byId("save-note").textContent = text("saving");
    byId("preview-warning").textContent = text("preview");
    byId("preview-warning").classList.toggle("hidden", !preview);
    byId("forms-open").textContent = text("formsOpen");
    byId("forms-check").textContent = text("formsCheck");
    byId("forms-notice").textContent = text("formsNotice");
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(draft)); return true; }
    catch (_error) { status("storage", true); return false; }
  }
  function randomId() { return crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n => n.toString(16)).join(""); }
  function jsonp(parameters) {
    if (preview || local) return Promise.reject(new Error("network_disabled"));
    return new Promise((resolve, reject) => {
      const callback = "btsFollowup_" + randomId().replace(/[^A-Za-z0-9]/g, "");
      const script = document.createElement("script");
      let timer;
      const cleanup = () => { clearTimeout(timer); script.remove(); delete window[callback]; };
      window[callback] = response => { cleanup(); resolve(response); };
      script.onerror = () => { cleanup(); reject(new Error("network_error")); };
      const url = new URL(config.serverEndpoint);
      Object.entries({ ...parameters, callback }).forEach(([key, value]) => url.searchParams.set(key, String(value)));
      script.referrerPolicy = "no-referrer";
      script.src = url.toString();
      timer = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, 12000);
      document.head.appendChild(script);
    });
  }
  function validIdentity(response) {
    return response?.ok === true && response.action === "followup" && response.schema_version === 2 &&
      (!formsMode || response.measurement_mode === "forms") &&
      response.experiment_id === config.experimentId && response.allocation_version === config.allocationVersion &&
      response.instrument_version === evaluation.instrumentVersion && /^[a-f0-9]{64}$/.test(response.instrument_hash || "") && response.instrument_hash === instrumentHash &&
      /^[A-Z]{4}\d{2}$/.test(response.participant_id_normalized) && typeof response.participant_id === "string" && response.participant_id.toUpperCase() === response.participant_id_normalized &&
      ["A", "B", "C"].includes(response.store_id) && ["no_image", "original", "improved"].includes(response.condition) &&
      ["assignment_id", "session_id", "followup_id", "parent_submission_id"].every(key => /^[A-Za-z0-9][A-Za-z0-9._:-]{7,179}$/.test(response[key])) &&
      ["ready", "not_due", "expired", "completed"].includes(response.status) &&
      ["due_at", "expires_at", "window_ends_at", "server_time"].every(key => Number.isFinite(Date.parse(response[key]))) &&
      validStatusTiming(response);
  }
  function validStatusTiming(response) {
    const due = Date.parse(response.due_at), end = Date.parse(response.expires_at), windowEnd = Date.parse(response.window_ends_at), now = Date.parse(response.server_time);
    if (due > windowEnd || windowEnd > end) return false;
    if (response.status === "ready") return now >= due && now <= end;
    if (response.status === "not_due") return now < due;
    if (response.status === "expired") return now > end;
    return response.status === "completed";
  }
  function verifiedFormsUrl(response) {
    if (response.measurement_mode !== "forms" || response.forms?.measurement_mode !== "forms" ||
        response.forms.language !== language || !/^[A-Za-z0-9_-]{10,180}$/.test(response.forms.form_id || "")) return null;
    const expiry = Date.parse(response.forms.expires_at);
    if (!Number.isFinite(expiry) || expiry <= Date.parse(response.server_time) || expiry > Date.parse(response.expires_at)) return null;
    try {
      const url = new URL(response.forms.form_url);
      if (url.protocol !== "https:" || url.hostname !== "docs.google.com" || url.port || url.username || url.password || url.hash ||
          !/^\/forms\/d\/(?:e\/)?[A-Za-z0-9_-]{10,180}\/viewform$/.test(url.pathname)) return null;
      const keys = [...url.searchParams.keys()];
      if (!keys.some(key => /^entry\.\d+$/.test(key)) || new Set(keys).size !== keys.length ||
          keys.some(key => !(key === "usp" && url.searchParams.get(key) === "pp_url") && !/^entry\.\d+$/.test(key))) return null;
      if (token && (url.href.includes(token) || [...url.searchParams.values()].some(value => value.includes(token)))) return null;
      return url.href;
    } catch (_error) { return null; }
  }
  function showFormsLanding(response) {
    const url = verifiedFormsUrl(response);
    if (!url) { status("configured", true); return; }
    const link = byId("forms-open");
    link.href = url;
    link.dataset.expiresAt = response.forms.expires_at;
    link.classList.remove("hidden");
    byId("forms-panel").classList.remove("hidden");
    byId("forms-check").disabled = false;
    status("formsReady");
  }
  function node(tag, content, className) {
    const element = document.createElement(tag);
    if (content != null) element.textContent = content;
    if (className) element.className = className;
    return element;
  }
  function render() {
    const holder = byId("questions");
    holder.replaceChildren();
    let number = 0;
    items(language).forEach(item => {
      const notice = item.type === "notice";
      const field = node(notice ? "section" : "fieldset", null, notice ? "panel" : "");
      field.id = "field-" + item.id;
      field.append(node(notice ? "h2" : "legend", (notice ? "" : ++number + ". ") + item.title + (!notice && item.optional ? " (" + text("optional") + ")" : "")));
      if (item.image) {
        const image = document.createElement("img"); image.src = item.image; image.alt = item.imageAlt || ""; field.append(image);
      }
      const value = draft.answers[item.id];
      if (["single", "multi", "scale"].includes(item.type)) {
        if (item.type === "scale") field.append(node("p", item.min + " → " + item.max, "muted"));
        const choices = item.type === "scale" ? (item.points || [1, 2, 3, 4]) : item.choices;
        choices.forEach(choice => {
          const label = node("label", null, "choice");
          const input = document.createElement("input");
          input.type = item.type === "multi" ? "checkbox" : "radio"; input.name = item.id; input.value = String(choice);
          input.checked = item.type === "multi" ? Array.isArray(value) && value.includes(String(choice)) : String(value ?? "") === String(choice);
          label.append(input, node("span", String(choice))); field.append(label);
        });
      } else if (!notice) {
        const input = document.createElement(item.type === "number" ? "input" : "textarea");
        input.name = item.id; input.setAttribute("aria-label", item.title); input.value = value ?? "";
        if (item.type === "number") { input.type = "number"; if (item.min !== undefined) input.min = item.min; if (item.max !== undefined) input.max = item.max; }
        field.append(input);
      }
      holder.append(field);
    });
    form.classList.remove("hidden");
    if (draft.pending) form.querySelectorAll("input,textarea").forEach(input => { input.disabled = true; });
  }
  function collect() {
    const values = new FormData(form);
    return Object.fromEntries(answerItems().map(item => [item.id, item.type === "multi" ? values.getAll(item.id).map(String) : String(values.get(item.id) || "").trim()]));
  }
  function validAnswers(answers) {
    let valid = true;
    answerItems().forEach(item => {
      const answer = answers[item.id];
      const empty = Array.isArray(answer) ? !answer.length : answer === "";
      const invalid = (!item.optional && empty) || (item.type === "number" && !empty &&
        (!Number.isFinite(Number(answer)) || (item.min !== undefined && Number(answer) < item.min) || (item.max !== undefined && Number(answer) > item.max)));
      byId("field-" + item.id).classList.toggle("invalid", invalid);
      if (invalid) valid = false;
    });
    return valid;
  }
  function score(answer, correct) {
    if (correct === undefined) return null;
    const normalized = value => (Array.isArray(value) ? value : [value]).map(entry => String(entry).match(/^([A-Z])(?:[.．、:：)）\s]|$)/)?.[1] || String(entry)).sort();
    return JSON.stringify(normalized(answer)) === JSON.stringify(normalized(correct));
  }
  function payload() {
    const end = new Date().toISOString();
    const fields = ["followup_id", "experiment_id", "allocation_version", "assignment_id", "session_id", "participant_id", "participant_id_normalized", "store_id", "condition", "parent_submission_id", "instrument_version", "content_version", "common_correction_version"];
    const result = Object.fromEntries(fields.map(key => [key, identity[key]]));
    Object.assign(result, { schema_version: 2, event_type: "followup", submission_id: draft.submissionId, token,
      language, instrument_hash: instrumentHash, started_at: draft.startedAt, completed_at: end, answers: draft.answers });
    result.question_logs = answerItems().map((item, index) => {
      const timing = draft.timings[item.id] || {};
      const first = timing.first || draft.startedAt;
      const answered = timing.last || end;
      const correct = evaluation.answerKeys?.followup?.[item.id];
      return { event_id: "event_" + draft.submissionId + "_" + index, phase: "followup", question_id: item.id,
        question_order: index + 1, attempt_no: 1, assignment_id: identity.assignment_id, session_id: identity.session_id,
        participant_id_normalized: identity.participant_id_normalized, store_id: identity.store_id, condition: identity.condition,
        content_version: identity.content_version || "", common_correction_version: identity.common_correction_version || "", instrument_version: identity.instrument_version,
        selected_answer: draft.answers[item.id], correct_answer: correct ?? null, is_correct: score(draft.answers[item.id], correct),
        question_started_at: first, answered_at: answered, timestamp: answered,
        response_time_ms: Math.max(0, Date.parse(answered) - Date.parse(first)),
        screen_dwell_time_ms: Math.max(0, Date.parse(end) - Date.parse(first)), answer_change_count: timing.changes || 0 };
    });
    return result;
  }
  async function send() {
    if (formsMode) return; // No Web follow-up POST, including an old saved draft.
    if (busy) return;
    busy = true; byId("submit").disabled = true; byId("language").disabled = true; byId("retry").classList.add("hidden");
    status("pending");
    try {
      if (preview) { draft.completed = true; save(); form.classList.add("hidden"); status("previewSuccess"); return; }
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      try { await fetch(config.serverEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: JSON.stringify(draft.pending), signal: controller.signal, referrerPolicy: "no-referrer" }); }
      catch (_sendError) { /* The server may have stored the response; always check its receipt. */ }
      finally { clearTimeout(timer); }
      const request = { action: "receipt", schema_version: 2, submission_id: draft.submissionId, token };
      ["experiment_id", "allocation_version", "assignment_id", "participant_id_normalized", "store_id", "condition"].forEach(key => { request[key] = identity[key]; });
      let stored = false;
      for (let attempt = 0; attempt < 3; attempt += 1) {
        if (attempt) await new Promise(resolve => setTimeout(resolve, 800));
        const receipt = await jsonp(request);
        if (receipt?.ok === true && receipt.schema_version === 2 && receipt.action === "receipt" && receipt.status === "complete" &&
          receipt.identity_checked === true && receipt.identity_match === true && receipt.submission_id === draft.submissionId &&
          receipt.event_type === "followup" && receipt.followup_id === identity.followup_id &&
          ["experiment_id", "allocation_version", "assignment_id", "participant_id_normalized", "store_id", "condition"].every(key => receipt[key] === identity[key])) { stored = true; break; }
      }
      if (!stored) throw new Error("unconfirmed_receipt");
      draft.completed = true; draft.pending = null; save(); form.classList.add("hidden"); status("success");
    } catch (_error) { status("failed", true); retryAction = send; byId("retry").classList.remove("hidden"); }
    finally { busy = false; byId("submit").disabled = false; }
  }
  async function initialize() {
    const serial = ++initializationSerial;
    labels(); status("loading"); form.classList.add("hidden"); byId("retry").classList.add("hidden");
    byId("forms-panel").classList.add("hidden");
    byId("forms-open").classList.add("hidden");
    byId("forms-open").removeAttribute("href");
    byId("forms-check").disabled = true;
    identity = null;
    try {
      if (!["google_forms", "web_token"].includes(config.followupMode)) { status("configured", true); return; }
      const approvals = evaluation.researcherApprovals || {};
      const issues = evaluation.contentReviewIssues || [];
      if (!preview && (evaluation.readyForProduction !== true ||
        !["conditionNeutralPostSurvey", "lateEvaluationInstruments", "followupInstrumentAndUrl"].every(key => approvals[key] === true) ||
        !Array.isArray(issues) || issues.some(issue => !issue || ((issue.severity === "blocking" || issue.blocking === true) && issue.status !== "resolved")))) {
        status("configured", true); return;
      }
      if (!evaluation.instrumentVersion || !answerItems().length || !items("ja").length || !items("en").length) { status("configured", true); return; }
      instrumentHash = await sha256(JSON.stringify(canonical({ instrumentVersion: evaluation.instrumentVersion,
        items: { ja: items("ja"), en: items("en") }, answerKeys: evaluation.answerKeys?.followup || {} })));
      if (serial !== initializationSerial) return;
      if (formsMode && preview) {
        byId("forms-panel").classList.remove("hidden");
        status("formsPreview"); return;
      }
      if (!preview && (local || !/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(config.serverEndpoint || ""))) { status("configured", true); return; }
      if (!preview && !/^[a-f0-9]{64}$/.test(token || "")) { status("invalid", true); return; }
      const response = preview ? { ok: true, action: "followup", schema_version: 2, status: "ready", experiment_id: config.experimentId,
        allocation_version: config.allocationVersion, assignment_id: "preview_assignment", session_id: "preview_session",
        participant_id: "TEST01", participant_id_normalized: "TEST01", store_id: "A", condition: "original",
        followup_id: "preview_followup", parent_submission_id: "preview_parent", instrument_version: evaluation.instrumentVersion,
        instrument_hash: instrumentHash, due_at: new Date(0).toISOString(), expires_at: new Date(Date.now() + 86400000).toISOString(),
        window_ends_at: new Date(Date.now() + 86400000).toISOString(), server_time: new Date().toISOString() }
        : await jsonp({ action: "followup", schema_version: 2, token, language });
      if (serial !== initializationSerial) return;
      identity = response;
      if (!validIdentity(identity)) { status(identity?.error === "invalid_followup_token" ? "invalid" : "configured", true); return; }
      if (identity.status !== "ready") { status(identity.status, false, identity.status === "not_due" ? new Date(identity.due_at).toLocaleString(language === "ja" ? "ja-JP" : "en-US") : ""); return; }
      if (formsMode) { showFormsLanding(identity); return; }
      storageKey = "bts-followup-v2:" + identity.followup_id;
      const identityBinding = JSON.stringify(identityFields.map(key => identity[key] || ""));
      try {
        const stored = sessionStorage.getItem(storageKey);
        draft = stored ? JSON.parse(stored) : null;
        if (draft && (draft.instrumentHash !== instrumentHash || draft.identityBinding !== identityBinding ||
          !["ja", "en"].includes(draft.language) || !Number.isFinite(Date.parse(draft.startedAt)) ||
          !draft.answers || typeof draft.answers !== "object" || !draft.timings || typeof draft.timings !== "object" ||
          (draft.pending && (draft.pending.token !== token || !identityFields.filter(key => key !== "instrument_hash").every(key => draft.pending[key] === identity[key]))))) {
          status("configured", true); return;
        }
        if (!draft) draft = { instrumentHash, identityBinding, submissionId: "followup_" + randomId(), language,
          startedAt: new Date().toISOString(), answers: {}, timings: {}, controls: {}, pending: null, completed: false };
        if (draft.language !== language) { language = draft.language; labels(); }
      } catch (_error) { status("storage", true); return; }
      if (!save()) return;
      if (draft.completed) { status(preview ? "previewSuccess" : "completed"); return; }
      render(); status(draft.pending ? "failed" : "ready", Boolean(draft.pending));
      byId("language").disabled = Boolean(draft.pending);
      if (draft.pending) { retryAction = send; byId("retry").classList.remove("hidden"); }
    } catch (_error) { if (serial !== initializationSerial) return; status("unavailable", true); retryAction = initialize; byId("retry").classList.remove("hidden"); }
  }
  form.addEventListener("focusin", event => {
    const id = event.target.name; if (!id || !draft || draft.pending) return;
    if (!draft.timings[id]) draft.timings[id] = { first: new Date().toISOString(), changes: 0 };
    save();
  });
  form.addEventListener("change", event => {
    const id = event.target.name; if (!id || !draft || draft.pending) return;
    const now = new Date().toISOString();
    const timing = draft.timings[id] || { first: now, changes: 0 };
    const answers = collect();
    const controlKey = event.target.type === "checkbox" ? id + "|" + event.target.value : id;
    const controlValue = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    const controls = draft.controls || (draft.controls = {});
    if (Object.prototype.hasOwnProperty.call(controls, controlKey) && controls[controlKey] !== controlValue) timing.changes += 1;
    controls[controlKey] = controlValue;
    timing.last = now; draft.timings[id] = timing; draft.answers = answers; save();
  });
  form.addEventListener("submit", event => {
    event.preventDefault(); if (formsMode || !draft || busy) return;
    if (!draft.pending) {
      draft.answers = collect();
      if (!validAnswers(draft.answers)) { status("required", true); return; }
      draft.pending = payload(); if (!save()) { draft.pending = null; return; }
      form.querySelectorAll("input,textarea").forEach(input => { input.disabled = true; });
    }
    send();
  });
  byId("language").addEventListener("change", () => {
    const next = byId("language").value;
    if (formsMode) { language = next === "en" ? "en" : "ja"; initialize(); return; }
    if (draft && Object.keys(draft.answers).length) {
      // Preserve stable answer values by their original choice index when switching language.
      const before = Object.fromEntries(items(language).map(item => [item.id, item]));
      items(next).forEach(item => {
        if (!item.choices || !before[item.id]?.choices) return;
        const translate = value => item.choices[before[item.id].choices.indexOf(value)] ?? value;
        if (Array.isArray(draft.answers[item.id])) draft.answers[item.id] = draft.answers[item.id].map(translate);
        else if (draft.answers[item.id] !== undefined) draft.answers[item.id] = translate(draft.answers[item.id]);
      });
    }
    language = next; labels();
    if (draft && identity?.status === "ready") { draft.language = language; save(); render(); status("ready"); }
    else initialize();
  });
  byId("retry").addEventListener("click", () => retryAction());
  byId("forms-check").addEventListener("click", initialize);
  byId("forms-open").addEventListener("click", event => {
    if (preview || !identity || identity.status !== "ready" || !verifiedFormsUrl(identity) || Date.now() >= Date.parse(identity.forms?.expires_at)) {
      event.preventDefault(); initialize();
    }
  });
  initialize();
})();
