const DATA = window.APP_DATA;
const EXPERIMENT = window.EXPERIMENT_CONTEXT;
const EXPERIMENT_CONFIG = window.EXPERIMENT_CONFIG;
const LOG_ENDPOINT = String(EXPERIMENT_CONFIG?.serverEndpoint || "").trim();
const IS_LOCAL = Boolean(EXPERIMENT?.isLocalhost(window.location));
const INTRO_ADVANCE_LOCK_MS = 500;

function studyInformationErrors(){
  const validate = window.BTS_PUBLIC_STUDY_INFORMATION?.validate;
  return typeof validate === "function"
    ? validate(EXPERIMENT_CONFIG?.studyInformation)
    : ["Public study-information validation is unavailable."];
}
function requireStudyInformation(){
  if(IS_LOCAL || studyInformationErrors().length === 0) return;
  const error = new Error("参加者向けの研究者・連絡先・保存期限の設定が完了していません。");
  error.code = "STUDY_INFORMATION_NOT_READY";
  throw error;
}

let bootstrapError = null;
let sessionEnding = false;
let STORE_ID = null;
try {
  if(!EXPERIMENT || !EXPERIMENT_CONFIG) throw new Error("後期実験用の設定ファイルを読み込めませんでした。");
  STORE_ID = EXPERIMENT.requireStore(window.location.search);
  requireStudyInformation();
  const readiness = EXPERIMENT.getReadinessReport({location: window.location});
  if(!readiness.ready) {
    const error = new Error("後期実験用の設定が完了していません。");
    error.code = "EXPERIMENT_NOT_READY";
    error.details = readiness;
    throw error;
  }
} catch(error) {
  bootstrapError = error;
}

function createId(){
  if(EXPERIMENT?.createUuid) return EXPERIMENT.createUuid();
  return (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random());
}
function localDateString(date = new Date()){
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function createInitialState(){
  const startedAt = new Date().toISOString();
  return {
    schemaVersion: EXPERIMENT_CONFIG?.schemaVersion || 2,
    appVersion: EXPERIMENT_CONFIG?.appVersion || "unknown",
    contentVersion: EXPERIMENT_CONFIG?.contentVersion || "unknown",
    commonCorrectionVersion: EXPERIMENT_CONFIG?.commonCorrectionVersion || "unknown",
    lang: "ja",
    screen: "language",
    participantId: "",
    participantIdNormalized: "",
    email: "",
    consent: false,
    consentGivenAt: null,
    storeId: STORE_ID,
    condition: null,
    assignment: null,
    sessionId: createId(),
    submissionId: createId(),
    experimentDate: localDateString(),
    preSurveyAnswers: {},
    postSurveyAnswers: {},
    preSurveyLogs: [],
    postSurveyLogs: [],
    surveyTimings: {pre:{}, post:{}},
    introIndex: 0,
    qIndex: 0,
    selected: null,
    score: 0,
    answers: [],
    questionStartedAt: null,
    questionElapsedMs: 0,
    questionDraft: null,
    questionControlValues: {},
    answerChangeCount: 0,
    feedbackStartedAt: null,
    feedbackElapsedMs: 0,
    sessionStartedAt: startedAt,
    completedAt: null,
    postSurveyCompletedAt: null,
    phaseTimes: {
      pre_started_at: null,
      pre_completed_at: null,
      learning_started_at: null,
      learning_completed_at: null,
      post_started_at: null,
      post_completed_at: null
    },
    logDeliveryStatus: "not_started",
    resumeScreen: null,
    lastPersistedAt: startedAt,
    error: "",
    validationErrors: {},
    isAssigningCondition: false,
    isSubmittingPost: false,
    introAdvanceLocked: false
  };
}

const app = document.getElementById("app");
const SESSION_STORAGE_KEY = STORE_ID
  ? `${EXPERIMENT_CONFIG?.experimentId || "bts"}:${EXPERIMENT_CONFIG?.allocationVersion || "v1"}:${STORE_ID}:active-session`
  : null;
const PENDING_STORAGE_PREFIX = `${EXPERIMENT_CONFIG?.experimentId || "bts"}:${EXPERIMENT_CONFIG?.allocationVersion || "v1"}:pending:`;

function storageIsUsable(storage, label){
  try {
    const key = `${PENDING_STORAGE_PREFIX}probe:${label}:${createId()}`;
    storage.setItem(key, key);
    const ok = storage.getItem(key) === key;
    storage.removeItem(key);
    return ok;
  } catch(_error) {
    return false;
  }
}

if(!bootstrapError) {
  let usable = false;
  try {
    usable = storageIsUsable(window.sessionStorage, "session") && storageIsUsable(window.localStorage, "local");
  } catch(_error) {
    usable = false;
  }
  if(!usable) {
    const error = new Error("実験に必要な端末内保存を利用できません。");
    error.code = "STORAGE_UNAVAILABLE";
    bootstrapError = error;
  }
}

function validRestoredAssignment(saved){
  const assignment = saved?.assignment;
  const condition = EXPERIMENT.normalizeCondition(saved?.condition);
  const participant = EXPERIMENT.normalizeParticipantId(saved?.participantIdNormalized || saved?.participantId);
  return Boolean(
    assignment && condition &&
    EXPERIMENT.assignmentMatches(assignment, STORE_ID, participant, EXPERIMENT_CONFIG) &&
    assignment.condition === condition &&
    (assignment.status !== "confirmed" || assignment.sessionId === saved.sessionId) &&
    EXPERIMENT.validateParticipantId(participant)
  );
}

function restoredStateIsValid(saved){
  const screens = new Set(["language","pre","intro","question","feedback","result","post","final","resume"]);
  if(!saved || !screens.has(saved.screen) || !["ja","en"].includes(saved.lang)) return false;
  if(saved.screen === "resume" && (!screens.has(saved.resumeScreen) || saved.resumeScreen === "resume")) return false;
  if(!Array.isArray(saved.answers) || !Number.isInteger(saved.qIndex) || saved.qIndex < 0 || saved.qIndex >= DATA.questions.length) return false;
  if(!Number.isInteger(saved.score) || saved.score < 0 || saved.score > DATA.questions.length) return false;
  const assignedScreens = new Set(["intro","question","feedback","result","post","final"]);
  const effectiveScreen = saved.screen === "resume" ? saved.resumeScreen : saved.screen;
  if(assignedScreens.has(effectiveScreen) && !validRestoredAssignment(saved)) return false;
  if(saved.condition && !validRestoredAssignment(saved)) return false;
  if(effectiveScreen === "feedback") {
    const last = saved.answers[saved.answers.length - 1];
    if(!last || last.question_id !== DATA.questions[saved.qIndex].id) return false;
  }
  return true;
}

function readSessionState(){
  if(!SESSION_STORAGE_KEY) return null;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if(!raw) return null;
    const saved = JSON.parse(raw);
    if(saved.schemaVersion !== EXPERIMENT_CONFIG.schemaVersion ||
       saved.appVersion !== EXPERIMENT_CONFIG.appVersion ||
       saved.storeId !== STORE_ID) return null;
    if(!restoredStateIsValid(saved)) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    saved.isAssigningCondition = false;
    saved.isSubmittingPost = false;
    saved.introAdvanceLocked = false;
    saved.validationErrors = saved.validationErrors || {};
    saved.phaseTimes = saved.phaseTimes || createInitialState().phaseTimes;
    saved.preSurveyLogs = saved.preSurveyLogs || [];
    saved.postSurveyLogs = saved.postSurveyLogs || [];
    saved.surveyTimings = saved.surveyTimings || {pre:{}, post:{}};
    saved.questionElapsedMs = Number(saved.questionElapsedMs || 0);
    saved.questionDraft = saved.questionDraft || null;
    saved.questionControlValues = saved.questionControlValues || {};
    saved.answerChangeCount = Number(saved.answerChangeCount || 0);
    saved.feedbackElapsedMs = Number(saved.feedbackElapsedMs || 0);
    if(saved.logDeliveryStatus === "sending") saved.logDeliveryStatus = "pending";
    if(saved.postSurveyCompletedAt && saved.screen === "post") saved.screen = "final";
    if(saved.screen === "question" && saved.questionStartedAt){
      const until = saved.lastPersistedAt || saved.questionStartedAt;
      saved.questionElapsedMs += Math.max(0, new Date(until) - new Date(saved.questionStartedAt));
      saved.questionStartedAt = null;
    }
    if(saved.screen === "feedback" && saved.feedbackStartedAt){
      const until = saved.lastPersistedAt || saved.feedbackStartedAt;
      saved.feedbackElapsedMs += Math.max(0, new Date(until) - new Date(saved.feedbackStartedAt));
      saved.feedbackStartedAt = null;
    }
    const target = saved.screen === "resume" ? saved.resumeScreen : saved.screen;
    if(target && target !== "language") {
      saved.resumeScreen = target;
      saved.screen = "resume";
    }
    return saved;
  } catch(_error) {
    return null;
  }
}
function persistState(){
  if(sessionEnding || !SESSION_STORAGE_KEY) return false;
  try {
    state.lastPersistedAt = new Date().toISOString();
    const snapshot = {...state, isAssigningCondition:false, isSubmittingPost:false, introAdvanceLocked:false};
    const serialized = JSON.stringify(snapshot);
    sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === serialized;
  } catch(_error) {
    return false;
  }
}
function clearSessionState(){
  if(!SESSION_STORAGE_KEY) return;
  try { sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch(_error) {}
}

let state = readSessionState() || createInitialState();
let activeQuestions = state.condition
  ? (state.condition === "original" ? DATA.questions : DATA.questions.map(q => EXPERIMENT.derivePresentationQuestion(q, state.condition)))
  : DATA.questions;

function syncConditionAttribute(){
  if(state.condition) document.body.dataset.condition = state.condition;
  else delete document.body.dataset.condition;
}
syncConditionAttribute();

const t = (key) => DATA.ui[state.lang][key] || key;
const textOf = (obj) => typeof obj === "string" ? obj : obj?.[state.lang] || obj?.ja || "";
const $ = (s) => document.querySelector(s);

function syncSelectionState(root=app){
  root.querySelectorAll(".choice, .scale-option, .classify-option").forEach(label => {
    const input = label.querySelector("input");
    label.classList.toggle("is-selected", Boolean(input?.checked));
  });
}
app.addEventListener("change", (event) => {
  if(event.target.matches('input[type="radio"], input[type="checkbox"]')) syncSelectionState();
});

function escapeHtml(str){
  return String(str ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function csvEscape(v){
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
function correctValue(q){
  if(q.type === "classify") return Object.entries(q.correct_groups).map(([k,v])=>`${k}:${textOf(v)}`).join("; ");
  if(Array.isArray(q.correct)) return q.correct.join("|");
  return q.correct;
}
function selectedValue(sel){
  if(Array.isArray(sel)) return sel.join("|");
  if(sel && typeof sel === "object") return Object.entries(sel).map(([k,v])=>`${k}:${v}`).join("; ");
  return sel || "";
}
function setScreen(screen){
  state.screen = screen;
  state.error = "";
  state.validationErrors = {};
  persistState();
  render();
  window.scrollTo({top:0, behavior:"smooth"});
}
function surveyItems(phase){
  const base = phase === "pre" ? DATA.survey[state.lang] : DATA.postSurvey[state.lang];
  return EXPERIMENT.mergeSurveyItems(base, phase, {language: state.lang});
}
function refreshActiveQuestions(){
  activeQuestions = state.condition === "original"
    ? DATA.questions
    : DATA.questions.map(q => EXPERIMENT.derivePresentationQuestion(q, state.condition));
  syncConditionAttribute();
}
function setupErrorText(){
  if(bootstrapError?.code === "INVALID_STORE") {
    return state.lang === "ja"
      ? "実験用URLが正しくありません。店舗用QRコードを読み直すか、担当者にお知らせください。"
      : "The experiment URL is invalid. Please scan the store QR code again or contact the researcher.";
  }
  return state.lang === "ja"
    ? "実験の準備設定が完了していないため開始できません。担当者にお知らせください。"
    : "The experiment cannot start because its setup is incomplete. Please contact the researcher.";
}
function renderSetupError(){
  if(bootstrapError?.code === "INVALID_STORE") {
    app.innerHTML = layout(`<section class="card stack center"><div class="theme">研究への参加 / Study entry</div><h2 class="title">参加用リンクをご確認ください</h2><p>案内された参加場所の専用リンク（末尾が <code>?store=A</code> など）から開始してください。場所をこちらで推測して割り付けることはありません。</p><p>Open the location-specific link supplied by the researcher. The location is not your experimental condition.</p><p>お問い合わせ：${escapeHtml(EXPERIMENT_CONFIG.studyInformation?.contactEmail || "研究担当者")}</p></section>`);
    return;
  }
  console.error("Blue Ticket late experiment bootstrap blocked", bootstrapError);
  app.innerHTML = layout(`
    <section class="card stack center bts-late-setup" role="alert">
      <div class="theme">SETUP CHECK</div>
      <h2 class="title">${state.lang === "ja" ? "実験を開始できません" : "The experiment cannot start"}</h2>
      <p class="bts-late-error">${escapeHtml(setupErrorText())}</p>
    </section>
  `);
}
function layout(content, progressText=""){
  const ui = DATA.ui[state.lang];
  return `
  <main class="site">
    <header class="header">
      <div class="brand">
        <h1>${escapeHtml(ui.appTitle)}</h1>
        <p>${escapeHtml(ui.subtitle)}</p>
      </div>
      ${progressText ? `<div class="badge">${escapeHtml(progressText)}</div>` : ""}
    </header>
    ${content}
  </main>`;
}
function classifyGroupLabel(q, groupKey){
  const labelObj = q.group_labels?.[groupKey];
  return labelObj ? textOf(labelObj) : groupKey;
}
function render(){
  document.documentElement.lang = state.lang === "en" ? "en" : "ja";
  if(state.screen === "resume") renderResume();
  if(state.screen === "language") renderLanguage();
  if(state.screen === "pre") renderPreSurvey();
  if(state.screen === "intro") renderIntro();
  if(state.screen === "question") renderQuestion();
  if(state.screen === "feedback") renderFeedback();
  if(state.screen === "result") renderResult();
  if(state.screen === "post") renderPostSurvey();
  if(state.screen === "final") renderFinal();
  syncSelectionState();
}

function renderLanguage(){
  app.innerHTML = layout(`
    <section class="card center stack">
      <div class="theme">Bicycle Blue Ticket Simulator 2026</div>
      <h2 class="title">言語を選択してください / Choose your language</h2>
      <div class="row">
        <button class="btn" onclick="chooseLang('ja')">日本語で開始</button>
        <button class="btn secondary" onclick="chooseLang('en')">Start in English</button>
      </div>
    </section>
  `);
}
function chooseLang(lang){
  state.lang = lang;
  if(!state.phaseTimes.pre_started_at) state.phaseTimes.pre_started_at = new Date().toISOString();
  document.documentElement.lang = lang;
  setScreen("pre");
}

function renderResume(){
  app.innerHTML = layout(`
    <section class="card stack center bts-late-setup">
      <div class="theme">SESSION CHECK</div>
      <h2 class="title">${state.lang === "ja" ? "途中の回答があります" : "An unfinished response is stored"}</h2>
      <p class="bts-late-status" data-state="restoring" role="status">${state.lang === "ja" ? "この端末で途中保存された回答を続けますか。別の参加者が使用する場合は、新しく開始してください。" : "Continue the response saved on this device, or start a new session for a different participant."}</p>
      <div class="row">
        <button class="btn" onclick="resumeExperiment()">${state.lang === "ja" ? "回答を続ける" : "Continue"}</button>
        <button class="btn secondary" onclick="startFreshExperiment()">${state.lang === "ja" ? "新しく開始" : "Start new"}</button>
      </div>
    </section>
  `);
}

function resumeExperiment(){
  const target = state.resumeScreen;
  if(!target || target === "resume") return startFreshExperiment();
  state.resumeScreen = null;
  state.screen = target;
  if(target === "question") state.questionStartedAt = new Date().toISOString();
  if(target === "feedback") state.feedbackStartedAt = new Date().toISOString();
  persistState();
  render();
}

function startFreshExperiment(){
  clearSessionState();
  state = createInitialState();
  activeQuestions = DATA.questions;
  syncConditionAttribute();
  persistState();
  render();
  window.scrollTo({top:0, behavior:"smooth"});
}


function scaleOptionLabel(point, q){
  const labels = {
    ja: {
      1: q.min || "あてはまらない",
      2: "あまりあてはまらない",
      3: "ややあてはまる",
      4: q.max || "あてはまる"
    },
    en: {
      1: q.min || "Does not apply",
      2: "Mostly does not apply",
      3: "Somewhat applies",
      4: q.max || "Applies"
    }
  };
  return labels[state.lang]?.[point] || String(point);
}

function validationMessage(key){
  return state.validationErrors[key] || "";
}
function invalidClass(key){
  return validationMessage(key) ? " invalid" : "";
}
function fieldErrorHtml(key){
  const message = validationMessage(key);
  return message ? `<p class="field-error">${escapeHtml(message)}</p>` : "";
}
function surveyErrorSummary(){
  const messages = Object.values(state.validationErrors);
  if(messages.length === 0) return "";
  const uniqueMessages = [...new Set(messages)];
  return `<div class="error-summary" role="alert" tabindex="-1"><strong>${escapeHtml(state.lang === "ja" ? "未入力または修正が必要な項目があります。" : "Some items are missing or need correction.")}</strong><ul>${uniqueMessages.map(message => `<li>${escapeHtml(message)}</li>`).join("")}</ul></div>`;
}

function focusFirstValidationError(){
  window.requestAnimationFrame(() => {
    const target = app.querySelector(
      "input.invalid, textarea.invalid, select.invalid, .invalid input, .invalid textarea, .invalid select, .error-summary"
    );
    if(!target) return;
    if(typeof target.focus === "function") target.focus({preventScroll:true});
    if(typeof target.scrollIntoView === "function") target.scrollIntoView({block:"center", behavior:"smooth"});
  });
}

function surveyMediaHtml(q){
  const src = textOf(q?.image).trim();
  if(!src) return "";
  const alt = textOf(q?.imageAlt).trim();
  return `<img class="bts-late-evaluation-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}">`;
}

function renderSurveyFields(items, answers, prefix=""){
  let questionNumber = 0;
  return items.map((q)=>{
    const value = answers[q.id] || "";
    const name = `${prefix}${q.id}`;
    const error = fieldErrorHtml(name);
    const cardClass = `card survey-card${invalidClass(name)}`;
    const media = surveyMediaHtml(q);

    const isNotice = q.type === "notice";
    if(!isNotice) questionNumber += 1;
    const qLabel = isNotice ? "" : `<div class="theme">Q${questionNumber}</div>`;

    if(isNotice){
      return `<div class="${cardClass}"><h2 class="title">${escapeHtml(q.title)}</h2>${media}</div>`;
    }

    if(q.type === "single"){
      return `<div class="${cardClass}">${qLabel}<h2 class="title">${escapeHtml(q.title)}</h2>${media}
        ${q.choices.map(c=>`<label class="choice"><input type="radio" name="${name}" value="${escapeHtml(c)}" ${value===c?'checked':''}><span class="choice-marker" aria-hidden="true"></span><span class="choice-text">${escapeHtml(c)}</span></label>`).join("")}
        ${error}
      </div>`;
    }

    if(q.type === "scale"){
      const points = q.points || [1,2,3,4];
      return `<div class="${cardClass}">${qLabel}<h2 class="title">${escapeHtml(q.title)}</h2>${media}
        <div class="scale${invalidClass(name)}">
          <div class="scale-labels"><span class="muted">${escapeHtml(q.min)}</span><span class="muted">${escapeHtml(q.max)}</span></div>
          <div class="scale-options">${points.map(n=>`<label class="scale-option"><input type="radio" name="${name}" value="${n}" ${String(value)===String(n)?'checked':''}><span class="scale-number">${n}</span><span class="scale-text">${escapeHtml(scaleOptionLabel(n, q))}</span></label>`).join("")}</div>
        </div>
        ${error}
      </div>`;
    }

    if(q.type === "number"){
      const min = q.min ?? "";
      const max = q.max ?? "";
      return `<div class="${cardClass}">${qLabel}<h2 class="title">${escapeHtml(q.title)}</h2>${media}
        <input class="input${invalidClass(name)}" type="number" name="${name}" min="${escapeHtml(min)}" max="${escapeHtml(max)}" placeholder="${escapeHtml(q.placeholder || "")}" value="${escapeHtml(value)}" />
        ${error}
      </div>`;
    }

    if(q.type === "multi"){
      const arr = Array.isArray(value) ? value : [];
      return `<div class="${cardClass}">${qLabel}<h2 class="title">${escapeHtml(q.title)}</h2>${media}
        ${q.choices.map(c=>`<label class="choice"><input type="checkbox" name="${name}" value="${escapeHtml(c)}" ${arr.includes(c)?'checked':''}><span class="choice-marker" aria-hidden="true"></span><span class="choice-text">${escapeHtml(c)}</span></label>`).join("")}
        <input class="input" data-other="${name}" placeholder="${escapeHtml(t('otherText'))}" value="${escapeHtml(answers[q.id+'_other']||'')}" />
        ${error}
      </div>`;
    }

    return `<div class="${cardClass}">${qLabel}<h2 class="title">${escapeHtml(q.title)}</h2>${media}
      <textarea class="textarea${invalidClass(name)}" name="${name}" placeholder="${q.optional ? (state.lang==='ja'?'任意':'Optional') : ''}">${escapeHtml(value)}</textarea>
      ${error}
    </div>`;
  }).join("");
}
function collectSurvey(formElement, items, answers, prefix=""){
  const form = new FormData(formElement);
  const nextAnswers = {...answers};
  const errors = {};
  for(const q of items){
    const name = `${prefix}${q.id}`;
    if(q.type === "multi"){
      const vals = form.getAll(name);
      nextAnswers[q.id] = vals;
            const other = document.querySelector(`[data-other="${name}"]`)?.value.trim() || "";
      nextAnswers[q.id+"_other"] = other;
      if(vals.length === 0 && !q.optional) errors[name] = t("required");
    }else if(q.type === "number"){
      const val = form.get(name) || "";
      nextAnswers[q.id] = val;
      if(!val && !q.optional){
        errors[name] = t("required");
      }else if(val){
        const n = Number(val);
        if(!Number.isFinite(n) || (q.min !== undefined && n < q.min) || (q.max !== undefined && n > q.max)){
          errors[name] = state.lang === "ja" ? `${q.min}〜${q.max}の範囲で入力してください。` : `Please enter a value between ${q.min} and ${q.max}.`;
        }
      }
    }else{
      const val = form.get(name) || "";
      nextAnswers[q.id] = val;
      if(!val && !q.optional) errors[name] = t("required");
    }
  }
  Object.assign(answers, nextAnswers);
  state.validationErrors = {...state.validationErrors, ...errors};
  return Object.keys(errors).length === 0;
}

function surveyTimingRecord(phase, questionId){
  state.surveyTimings = state.surveyTimings || {pre:{}, post:{}};
  state.surveyTimings[phase] = state.surveyTimings[phase] || {};
  if(!state.surveyTimings[phase][questionId]) {
    state.surveyTimings[phase][questionId] = {
      startedAt: null,
      answeredAt: null,
      answerChangeCount: 0,
      controlValues: {}
    };
  }
  return state.surveyTimings[phase][questionId];
}

function surveyControlContext(phase, target){
  const prefix = `${phase}_`;
  const name = target?.dataset?.other || target?.name || "";
  if(!name.startsWith(prefix)) return null;
  const questionId = name.slice(prefix.length);
  const item = surveyItems(phase).find(candidate => candidate.id === questionId);
  return item ? {name, questionId, item} : null;
}

function trackSurveyEvent(phase, event){
  const target = event.target;
  const context = surveyControlContext(phase, target);
  if(!context) return;
  const answers = phase === "pre" ? state.preSurveyAnswers : state.postSurveyAnswers;
  const timing = surveyTimingRecord(phase, context.questionId);
  const now = new Date().toISOString();
  timing.startedAt = timing.startedAt || now;

  if(event.type === "focusin") {
    persistState();
    return;
  }

  if(target.dataset?.other) {
    answers[`${context.questionId}_other`] = target.value;
  } else if(context.item.type === "multi") {
    answers[context.questionId] = new FormData(event.currentTarget).getAll(context.name);
  } else if(target.type !== "radio" || target.checked) {
    answers[context.questionId] = target.value;
  }

  if(event.type === "change") {
    const isCheckbox = target.type === "checkbox";
    const controlKey = isCheckbox ? `${context.name}|${target.value}` : context.name;
    const controlValue = isCheckbox ? Boolean(target.checked) : String(target.value);
    if(EXPERIMENT.recordControlRevision(timing.controlValues, controlKey, controlValue)) {
      timing.answerChangeCount += 1;
    }
  }
  timing.answeredAt = now;
  persistState();
}

function bindSurveyTracking(phase, form){
  ["focusin","input","change"].forEach(type => {
    form.addEventListener(type, event => trackSurveyEvent(phase, event));
  });
}

function renderStudyInformation(){
  const info = EXPERIMENT_CONFIG?.studyInformation || {};
  const ja = state.lang === "ja";
  const pending = ja ? "準備中（未設定）" : "In preparation (not configured)";
  const value = candidate => typeof candidate === "string" && candidate.trim() ? candidate : pending;
  const retention = key => {
    const months = info.retentionMonths?.[key];
    if(!Number.isInteger(months) || months < 1 || months > 120) return pending;
    return ja ? `当該データの取得日から${months}か月` : `${months} calendar months from acquisition of that data`;
  };
  const rows = [
    [ja ? "研究者" : "Researcher", value(info.researcherName?.[state.lang])],
    [ja ? "問い合わせ・削除の相談先" : "Contact for questions or deletion requests", value(info.contactEmail)],
    [ja ? "連絡先データの保存期間" : "Contact data retention period", retention("contact")],
    [ja ? "原回答の保存期間（Googleフォームの照合用資格情報を含む）" : "Raw response retention period (including Google Forms matching credentials)", retention("rawResponses")],
    [ja ? "分析データの保存期間" : "Analysis data retention period", retention("analysisData")],
    [ja ? "研究データの閲覧・削除担当" : "Person responsible for viewing and deleting research data", info.ownerOnlyAccess === true ? (ja ? "研究者本人のみ" : "The researcher only") : pending]
  ];
  const notice = IS_LOCAL && studyInformationErrors().length
    ? `<p class="notice" role="note">${ja ? "ローカル確認用：運用情報は準備中です。本番の参加受付は開始できません。" : "Local preview: operational information is in preparation. Production participation cannot start."}</p>`
    : "";
  // Configuration is plain text, never HTML or an unchecked mailto URL.
  return `<section class="card" aria-labelledby="studyInformationTitle">
    <h2 id="studyInformationTitle" class="title">${ja ? "研究者とデータの取扱い" : "Researcher and data handling"}</h2>
    <p>${escapeHtml(EXPERIMENT_CONFIG.recruitmentPeriod?.[state.lang] || "")}</p>
    ${notice}
    <dl>${rows.map(([label, content]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(content)}</dd>`).join("")}</dl>
    <p class="notice">${ja ? "上記の期間に従って研究者本人が削除を行います。このシステムは自動削除しません。問い合わせや削除の相談は上記の連絡先へお願いします。" : "The researcher is responsible for deletion in accordance with these periods; this system does not delete data automatically. Please use the contact above for questions or deletion requests."}</p>
  </section>`;
}

function renderPreSurvey(){
  const survey = surveyItems("pre");
  const fields = renderSurveyFields(survey, state.preSurveyAnswers, "pre_");
  const idHelp = state.lang === "ja"
    ? "本名は入力せず，好きな英字4文字＋数字2桁で入力してください。例：BIKE33，NEKO12，STAR07"
    : "Do not enter your real name. Use four letters and two digits, such as BIKE33, NEKO12, or STAR07.";
  const emailHelp = state.lang === "ja"
    ? "1週間後の追加アンケートに協力できる場合のみ入力してください。入力は任意です。"
    : "Enter your email only if you can cooperate with the follow-up survey one week later. This is optional.";
  const consentText = state.lang === "ja"
    ? "以下のデータ取扱い説明を確認し、Web教材での回答内容・正誤・回答時間と、希望した場合のGoogleフォームによる1週間後の回答を研究目的で記録することに同意します。"
    : "I have read the data-handling notice below and agree to research recording of my Web answers, correctness and response times, and, if I opt in, my one-week Google Forms responses.";
  const privacyNotice = state.lang === "ja"
    ? "1週間後アンケートはGoogleフォームだけで回答します。メールアドレスは案内用に非公開の連絡先データとして別管理し、分析出力には含めません。Googleフォームの原回答には参加記録との照合用の資格情報が含まれますが、分析出力には含めません。フォーム側では各問の回答時間や変更回数を取得できないため、Web教材と同じ計測値として扱いません。"
    : "The one-week follow-up is answered only in Google Forms. Your email is kept separately in private contact records for invitations and is excluded from analysis exports. Raw Google Forms responses contain a scoped credential for matching participation; it is excluded from analysis exports. Google Forms does not provide per-question response time or answer-change counts, so these are not treated as equivalent to Web measurements.";
  const sharedDeviceNotice = sharedDeviceMessage();
  const summary = surveyErrorSummary();
  const assignmentNotice = state.error
    ? `<p class="bts-late-error" role="alert">${escapeHtml(state.error)}</p>`
    : "";
  const startLabel = t('start');
  app.innerHTML = layout(`
    ${summary}
    ${assignmentNotice}
    ${renderStudyInformation()}
    <section class="card">
      <div class="theme">${escapeHtml(t('surveyTitle'))}</div>
      <h2 class="title">${escapeHtml(t('participantId'))}</h2>
      <input id="participant" class="input${invalidClass('participant')}" placeholder="BIKE33" value="${escapeHtml(state.participantId)}" />
      ${fieldErrorHtml('participant')}
      <p class="notice">${escapeHtml(idHelp)}</p>
      <h2 class="title" style="margin-top:18px">${state.lang === "ja" ? "メールアドレス（任意）" : "Email address (optional)"}</h2>
      <input id="email" class="input${invalidClass('email')}" type="email" placeholder="example@example.com" value="${escapeHtml(state.email)}" />
      ${fieldErrorHtml('email')}
      <p class="notice">${escapeHtml(emailHelp)}</p>
      <p class="notice">${escapeHtml(privacyNotice)}</p>
      <p class="notice">${escapeHtml(sharedDeviceNotice)}</p>
      <label class="choice consent-choice${invalidClass('consent')}"><input id="consent" type="checkbox" ${state.consent ? 'checked' : ''}><span class="choice-marker" aria-hidden="true"></span><span class="choice-text">${escapeHtml(consentText)}</span></label>
      ${fieldErrorHtml('consent')}
    </section>
    <form id="preSurveyForm">${fields}
      <div class="row card"><button type="submit" class="btn" ${state.isAssigningCondition ? "disabled" : ""}>${escapeHtml(startLabel)}</button></div>
    </form>
  `);
  const form = $("#preSurveyForm");
  form.addEventListener("submit", submitPreSurvey);
  bindSurveyTracking("pre", form);
  $("#participant").addEventListener("input", event => { state.participantId = event.target.value; persistState(); });
  $("#email").addEventListener("input", event => { state.email = event.target.value; persistState(); });
  $("#consent").addEventListener("change", event => { state.consent = event.target.checked; persistState(); });
}
async function submitPreSurvey(e){
  e.preventDefault();
  if(state.isAssigningCondition) return;
  try { requireStudyInformation(); }
  catch(error) { bootstrapError = error; return renderSetupError(); }
  state.validationErrors = {};
  state.error = "";
  state.participantId = $("#participant").value.trim();
  state.email = $("#email").value.trim();
  state.consent = $("#consent").checked;
  const errors = {};
  if(!state.participantId) errors.participant = t("required");
  else if(!/^[A-Za-z]{4}\d{2}$/.test(state.participantId)){
    errors.participant = state.lang === "ja" ? "参加者IDは英字4文字＋数字2桁で入力してください。例：BIKE33" : "Participant ID must be four letters and two digits, such as BIKE33.";
  }
  if(state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)){
    errors.email = state.lang === "ja" ? "メールアドレスの形式を確認してください。" : "Please check the email address format.";
  }
  if(!state.consent) errors.consent = state.lang === "ja" ? "同意欄にチェックしてください。" : "Please check the consent box.";
  state.validationErrors = errors;
  const currentSurvey = surveyItems("pre");
  const surveyOk = collectSurvey(e.target, currentSurvey, state.preSurveyAnswers, "pre_");
  if(Object.keys(state.validationErrors).length > 0 || !surveyOk) {
    renderPreSurvey();
    focusFirstValidationError();
    return;
  }
  state.isAssigningCondition = true;
  renderPreSurvey();
  try {
    state.participantIdNormalized = EXPERIMENT.normalizeParticipantId(state.participantId);
    state.assignment = await EXPERIMENT.getOrCreateAssignment({
      participantId: state.participantId,
      sessionId: state.sessionId,
      store: STORE_ID,
      search: window.location.search,
      location: window.location
    });
    state.condition = state.assignment.condition;
    state.consentGivenAt = state.consentGivenAt || new Date().toISOString();
    state.phaseTimes.pre_completed_at = new Date().toISOString();
    state.preSurveyLogs = buildSurveyLogs("pre", currentSurvey, state.preSurveyAnswers, state.phaseTimes.pre_completed_at);
    refreshActiveQuestions();
  } catch(error) {
    console.error("Condition assignment failed", error?.code || "ASSIGNMENT_FAILED");
    state.isAssigningCondition = false;
    const rejection = error?.details?.error || error?.message;
    state.error = rejection === "production_enrollment_not_open"
      ? (state.lang === "ja" ? "まだ募集開始前です。表示された募集期間をご確認ください。" : "Recruitment has not opened yet. Please check the recruitment dates above.")
      : rejection === "production_enrollment_closed"
        ? (state.lang === "ja" ? "新規参加の受付期間が終了しました。" : "The recruitment period for new participation has ended.")
        : state.lang === "ja"
          ? "条件割付を確認できませんでした。通信を確認して、もう一度「開始」を押してください。"
          : "The assignment could not be confirmed. Check the connection and press Start again.";
    persistState();
    return renderPreSurvey();
  }
  state.isAssigningCondition = false;
  state.introIndex = 0;
  setScreen("intro");
}

function renderIntro(){
  const card = DATA.introCards[state.introIndex];
  app.innerHTML = layout(`
    <section class="card stack">
      <div class="theme">${escapeHtml(textOf(card.theme))}</div>
      <h2 class="title">${escapeHtml(textOf(card.title))}</h2>
      <p>${escapeHtml(textOf(card.body)).replace(/\n/g,"<br>")}</p>
      <p class="notice">${escapeHtml(textOf(card.hint))}</p>
      <div class="row"><button class="btn" onclick="nextIntro()">${escapeHtml(t('next'))}</button></div>
    </section>
  `, `${state.introIndex+1} / ${DATA.introCards.length}`);
}
function nextIntro(){
  if(state.screen !== "intro" || state.introAdvanceLocked) return;
  state.introAdvanceLocked = true;
  if(state.introIndex < DATA.introCards.length-1){
    state.introIndex++;
    persistState();
    renderIntro();
    window.setTimeout(() => { state.introAdvanceLocked = false; }, INTRO_ADVANCE_LOCK_MS);
  } else {
    state.qIndex = 0;
    state.questionDraft = null;
    state.questionControlValues = {};
    state.answerChangeCount = 0;
    state.questionElapsedMs = 0;
    state.questionStartedAt = new Date().toISOString();
    state.phaseTimes.learning_started_at = state.questionStartedAt;
    setScreen("question");
    window.setTimeout(() => { state.introAdvanceLocked = false; }, INTRO_ADVANCE_LOCK_MS);
  }
}

function renderSceneDescription(q){
  if(state.condition !== "no_image") return "";
  const description = textOf(q.sceneDescription).trim();
  if(!description) return "";
  return `<div class="bts-late-scene"><div class="bts-late-scene-label">${state.lang === "ja" ? "場面説明" : "Scene description"}</div><p class="bts-late-scene-body">${escapeHtml(description).replace(/\n/g,"<br>")}</p></div>`;
}
function improvementValue(q, field){
  return state.condition === "improved" ? textOf(q[field]).trim() : "";
}
function renderImprovementSupport(q, selected){
  if(state.condition !== "improved") return "";
  const rows = [
    ["keyPoint", "key-point", state.lang === "ja" ? "重要ポイント" : "Key point"],
    ["decisionRule", "decision-rule", state.lang === "ja" ? "判断基準" : "Decision rule"],
    ["decisionFlow", "decision-flow", state.lang === "ja" ? "判断フロー" : "Decision flow"],
    ["okExample", "ok-example", state.lang === "ja" ? "OK例" : "OK example"],
    ["ngExample", "ng-example", state.lang === "ja" ? "NG例" : "NG example"],
    ["highlight", "highlight", state.lang === "ja" ? "注目箇所" : "Highlighted point"]
  ].map(([field, kind, label]) => {
    const value = improvementValue(q, field);
    return value ? `<div class="bts-late-improvement-section" data-kind="${kind}"><h3 class="bts-late-improvement-heading">${escapeHtml(label)}</h3><p class="bts-late-improvement-body">${escapeHtml(value).replace(/\n/g,"<br>")}</p></div>` : "";
  }).filter(Boolean);
  const selectedKey = selectedValue(selected);
  const answerSpecific = q.feedbackByAnswer && textOf(q.feedbackByAnswer[selectedKey]).trim();
  if(answerSpecific) {
    rows.push(`<div class="bts-late-improvement-section" data-kind="answer-feedback"><h3 class="bts-late-improvement-heading">${state.lang === "ja" ? "今回の回答への補足" : "Feedback for this answer"}</h3><p class="bts-late-improvement-body">${escapeHtml(answerSpecific).replace(/\n/g,"<br>")}</p></div>`);
  }
  const explanationImage = textOf(q.explanationImage).trim();
  if(explanationImage) {
    rows.push(`<div class="bts-late-improvement-section" data-kind="explanation-image"><img class="bts-late-improvement-media" src="${escapeHtml(explanationImage)}" alt="${escapeHtml(textOf(q.explanationImageAlt).trim())}"></div>`);
  }
  return rows.length ? `<aside class="bts-late-improvement">${rows.join("")}</aside>` : "";
}
function selectionSignature(formElement, q){
  const form = new FormData(formElement);
  if(q.type === "single") return String(form.get("answer") || "");
  if(q.type === "multi") return form.getAll("answer").map(String).sort().join("|");
  if(q.type === "classify") {
    return Object.keys(q.choices).map(k => `${k}:${form.get(`class_${k}`) || ""}`).join("|");
  }
  return "";
}
function trackQuestionInteraction(event){
  const form = event.currentTarget;
  const q = DATA.questions[state.qIndex];
  const input = event.target;
  const isCheckbox = input.type === "checkbox";
  const controlKey = isCheckbox ? `${input.name}|${input.value}` : input.name;
  const controlValue = isCheckbox ? Boolean(input.checked) : String(input.value);
  if(EXPERIMENT.recordControlRevision(state.questionControlValues, controlKey, controlValue)) {
    state.answerChangeCount += 1;
  }
  const data = new FormData(form);
  if(q.type === "single") {
    state.questionDraft = {questionId:q.id, single:String(data.get("answer") || "")};
  } else if(q.type === "multi") {
    state.questionDraft = {questionId:q.id, multi:data.getAll("answer").map(String)};
  } else if(q.type === "classify") {
    const classify = {};
    Object.keys(q.choices).forEach(key => { classify[key] = String(data.get(`class_${key}`) || ""); });
    state.questionDraft = {questionId:q.id, classify};
  }
  persistState();
}
function renderQuestion(){
  const q = activeQuestions[state.qIndex];
  const draft = state.questionDraft?.questionId === q.id ? state.questionDraft : null;
  const progress = `${state.qIndex+1} / ${activeQuestions.length}`;
  let inputHtml = "";
  if(q.type === "single"){
    inputHtml = Object.keys(q.choices).map(k=>`<label class="choice"><input type="radio" name="answer" value="${k}" ${draft?.single===k?'checked':''}><span class="choice-marker" aria-hidden="true">${k}</span><span class="choice-text">${escapeHtml(textOf(q.choices[k]))}</span></label>`).join("");
  } else if(q.type === "multi"){
    inputHtml = Object.keys(q.choices).map(k=>`<label class="choice"><input type="checkbox" name="answer" value="${k}" ${draft?.multi?.includes(k)?'checked':''}><span class="choice-marker" aria-hidden="true">${k}</span><span class="choice-text">${escapeHtml(textOf(q.choices[k]))}</span></label>`).join("");
  } else if(q.type === "classify"){
    inputHtml = Object.keys(q.choices).map(k=>`
      <div class="choice classify-choice">
        <div class="classify-prompt"><span class="choice-marker" aria-hidden="true">${k}</span><span class="choice-text">${escapeHtml(textOf(q.choices[k]))}</span></div>
        <div class="classify-options">
  ${q.groups.map(g=>`<label class="classify-option"><input type="radio" name="class_${k}" value="${escapeHtml(g)}" ${draft?.classify?.[k]===g?'checked':''}><span>${escapeHtml(classifyGroupLabel(q, g))}</span></label>`).join("")}
</div>
      </div>`).join("");
  }
  app.innerHTML = layout(`
    ${q.image ? `<img class="question-img" src="./assets/${escapeHtml(q.image)}" alt="">` : ""}
    <section class="card">
      <div class="theme">${escapeHtml(textOf(q.theme))}</div>
      <h2 class="title">${escapeHtml(textOf(q.title))}</h2>
      ${renderSceneDescription(q)}
      ${q.prelude ? `<p class="prelude">${escapeHtml(textOf(q.prelude))}</p>` : ""}
      <p>${escapeHtml(textOf(q.body))}</p>
      ${state.error ? `<p id="questionError" class="error" role="alert" tabindex="-1">${escapeHtml(state.error)}</p>` : ""}
      <form id="qForm">${inputHtml}<div class="row"><button class="btn" type="submit">${escapeHtml(t('submit'))}</button></div></form>
    </section>
  `, progress);
  $("#qForm").addEventListener("submit", submitQuestion);
  $("#qForm").addEventListener("change", trackQuestionInteraction);
  if(state.error) {
    window.requestAnimationFrame(() => {
      const error = $("#questionError");
      error?.focus({preventScroll:true});
      error?.scrollIntoView({block:"center", behavior:"smooth"});
    });
  }
}
function submitQuestion(e){
  e.preventDefault();
  if(state.screen !== "question") return;
  const q = DATA.questions[state.qIndex];
  const form = new FormData(e.target);
  let selected, isCorrect = false;
  if(q.type === "single"){
    selected = form.get("answer");
    if(!selected){ state.error=t("required"); return renderQuestion(); }
    isCorrect = selected === q.correct;
  } else if(q.type === "multi"){
    selected = form.getAll("answer").sort();
    if(selected.length===0){ state.error=t("required"); return renderQuestion(); }
    isCorrect = JSON.stringify(selected) === JSON.stringify([...q.correct].sort());
  } else if(q.type === "classify"){
    selected = {};
    for(const k of Object.keys(q.choices)){
      const v = form.get(`class_${k}`);
      if(!v){ state.error=t("required"); return renderQuestion(); }
      selected[k] = v;
    }
    isCorrect = Object.keys(q.correct_groups).every(k => selected[k] === q.correct_groups[k]);
  }
  const answeredAt = new Date().toISOString();
  const activeSegment = state.questionStartedAt ? new Date(answeredAt) - new Date(state.questionStartedAt) : 0;
  const responseTime = Math.max(0, Number(state.questionElapsedMs || 0) + activeSegment);
  const feedbackStartedAt = new Date().toISOString();
  if(isCorrect) state.score++;
  state.selected = selected;
  state.feedbackStartedAt = feedbackStartedAt;
  state.answers.push({
    event_id: `${state.submissionId}:learning:${q.id}:1`,
    session_id: state.sessionId,
    participant_id: state.participantId,
    participant_id_normalized: state.participantIdNormalized,
    assignment_id: state.assignment?.assignmentId || "",
    store_id: state.storeId,
    condition: state.condition,
    language: state.lang,
    phase: "learning",
    question_id: q.id,
    question_order: state.qIndex + 1,
    attempt_no: 1,
    selected_answer: selectedValue(selected),
    correct_answer: correctValue(q),
    is_correct: isCorrect,
    question_started_at: state.questionStartedAt,
    answered_at: answeredAt,
    timestamp: answeredAt,
    response_time_ms: responseTime,
    screen_dwell_time_ms: responseTime,
    answer_change_count: Math.max(0, Number(state.answerChangeCount || 0)),
    feedback_started_at: feedbackStartedAt,
    feedback_ended_at: null,
    explanation_view_time_ms: null
  });
  state.questionStartedAt = null;
  state.questionElapsedMs = 0;
  setScreen("feedback");
}
function renderFeedback(){
  const q = DATA.questions[state.qIndex];
  const presentationQ = activeQuestions[state.qIndex];
  const selected = state.selected;
  const row = state.answers[state.answers.length-1];
  let details = "";
  if(q.type === "classify"){
    details = Object.keys(q.choices).map(k=>{
      const ok = selected[k] === q.correct_groups[k];
      return `<div class="detail-item"><span class="${ok?'good':'bad'}">${ok?'✓':'✗'}</span> <strong>${k}</strong> ${escapeHtml(textOf(q.choices[k]))}<br>
      <span class="muted">${escapeHtml(t('yourAnswer'))}: ${escapeHtml(classifyGroupLabel(q, selected[k]))} / ${escapeHtml(t('correctAnswer'))}: ${escapeHtml(classifyGroupLabel(q, q.correct_groups[k]))}</span><br>
      ${escapeHtml(textOf(q.per_choice_feedback[k]))}</div>`;
    }).join("");
  } else {
    const selectedSet = new Set(Array.isArray(selected) ? selected : [selected]);
    const correctSet = new Set(Array.isArray(q.correct) ? q.correct : [q.correct]);
    details = Object.keys(q.choices).map(k=>{
      const picked = selectedSet.has(k), should = correctSet.has(k);
      let mark='・', cls='', status='';
      if(picked && should){mark='✓';cls='good';status= state.lang==='ja'?'選択して正解':'Selected correctly';}
      else if(picked && !should){mark='✗';cls='bad';status= state.lang==='ja'?'選択したが不正解':'Selected but incorrect';}
      else if(!picked && should){mark='△';cls='warn';status= state.lang==='ja'?'選ばなかったが本来は必要':'Should have selected';}
      else {status= state.lang==='ja'?'選ばなくてよい':'Not needed';}
      return `<div class="detail-item"><span class="${cls}">${mark} ${escapeHtml(status)}</span><br><strong>${k}</strong> ${escapeHtml(textOf(q.choices[k]))}<br>${escapeHtml(textOf(q.feedback[k]))}</div>`;
    }).join("");
      }
  const ok = row.is_correct;
  const nextLabel = state.qIndex >= activeQuestions.length-1 ? t("seeResult") : t("next");
  app.innerHTML = layout(`
    <section class="card">
      <div class="${ok?'feedback-ok':'feedback-ng'}">${escapeHtml(ok ? t('correct') : t('review'))}</div>
      <p class="notice">${escapeHtml(textOf(ok ? q.result_ok : q.result_ng))}</p>
      <div class="detail"><h3>${state.lang==='ja'?'各選択肢の整理':'Review of choices'}</h3>${details}</div>
      ${renderImprovementSupport(presentationQ, selected)}
      <div class="row"><button class="btn" onclick="nextQuestion()">${escapeHtml(nextLabel)}</button></div>
    </section>
  `, `${state.score} / ${activeQuestions.length}`);
}
function nextQuestion(){
  if(state.screen !== "feedback") return;
  const feedbackEndedAt = new Date().toISOString();
  const row = state.answers[state.answers.length - 1];
  if(row && !row.feedback_ended_at){
    row.feedback_ended_at = feedbackEndedAt;
    const activeSegment = state.feedbackStartedAt
      ? Math.max(0, new Date(feedbackEndedAt) - new Date(state.feedbackStartedAt))
      : 0;
    row.explanation_view_time_ms = Math.max(0, Number(state.feedbackElapsedMs || 0) + activeSegment);
  }
  state.feedbackStartedAt = null;
  state.feedbackElapsedMs = 0;
  if(state.qIndex >= activeQuestions.length-1){
    state.completedAt = new Date().toISOString();
    state.phaseTimes.learning_completed_at = state.completedAt;
    setScreen("result");
  }else{
    state.qIndex++;
    state.questionDraft = null;
    state.questionControlValues = {};
    state.answerChangeCount = 0;
    state.questionElapsedMs = 0;
    state.questionStartedAt = new Date().toISOString();
    setScreen("question");
  }
}

function diagnosis(){
  const s = state.score;
  if(state.lang === "ja"){
    if(s>=10) return ["ルール判断マスター型","多くの場面で，交通ルールと安全判断を安定して結びつけられています。"];
    if(s>=7) return ["基本理解型","基本的なルールは理解できていますが，一部の場面判断で迷いが残る可能性があります。"];
    if(s>=4) return ["感覚判断型","危なそうという感覚はありますが，制度上どう扱われるかの整理が必要です。"];
    return ["これから学習型","青切符制度や具体的な場面判断を，これから整理していく段階です。"];
  }
  if(s>=10) return ["Rule Judgment Master","You can connect traffic rules and safe decisions consistently in many situations."];
  if(s>=7) return ["Basic Understanding Type","You understand the basics, but some situation-based decisions may still be confusing."];
  if(s>=4) return ["Intuitive Judgment Type","You may sense danger, but need to organize how each action is handled under the system."];
  return ["Learning Starter","You are at the stage of organizing the blue ticket system and concrete situation-based judgments."];
}
function renderResult(){
  const [type, comment] = diagnosis();
  const totalQuestions = DATA.questions.length;
  const pct = Math.round(state.score / totalQuestions * 100);
  const situationQuestions = DATA.questions.filter(q => q.score_domain === "situation").map(q => q.id);
  const systemQuestions = DATA.questions.filter(q => q.score_domain === "system").map(q => q.id);
  const situationCorrect = state.answers.filter(a => a.is_correct && situationQuestions.includes(a.question_id)).length;
  const systemCorrect = state.answers.filter(a => a.is_correct && systemQuestions.includes(a.question_id)).length;
  const situationScore = situationQuestions.length ? Math.round((situationCorrect / situationQuestions.length) * 100) : 0;
  const systemScore = systemQuestions.length ? Math.round((systemCorrect / systemQuestions.length) * 100) : 0;
  const avgTimeMs = state.answers.length ? Math.round(state.answers.reduce((acc, cur) => acc + Number(cur.response_time_ms || 0), 0) / state.answers.length) : 0;
  const avgTimeSec = (avgTimeMs / 1000).toFixed(1);
  const btnText = state.lang === "ja" ? "事後アンケートへ進む" : "Continue to post-survey";
  app.innerHTML = layout(`
    <section class="card stack">
      <div class="theme">${escapeHtml(t('resultTitle'))}</div>
      <h2 class="title">${escapeHtml(t('score'))}: ${state.score} / ${totalQuestions}</h2>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <div class="result-grid">
        <div class="notice"><strong>${state.lang === "ja" ? "総合正答率" : "Overall accuracy"}</strong><br>${pct}%</div>
        <div class="notice"><strong>${state.lang === "ja" ? "場面判断スコア" : "Situation judgment score"}</strong><br>${situationScore}%</div>
        <div class="notice"><strong>${state.lang === "ja" ? "制度理解スコア" : "System understanding score"}</strong><br>${systemScore}%</div>
        <div class="notice"><strong>${state.lang === "ja" ? "平均回答時間" : "Average response time"}</strong><br>${avgTimeSec}s</div>
      </div>
      <p class="result-type">${escapeHtml(type)}</p>
      <p>${escapeHtml(comment)}</p>
      <p class="notice">${state.lang === "ja" ? "最後に，学習後の意識変化を確認するための簡単な事後アンケートに回答してください。" : "Finally, please answer a short post-survey to check changes after learning."}</p>
      <div class="row"><button class="btn" onclick="startPostSurvey()">${escapeHtml(btnText)}</button></div>
    </section>
  `, `${state.score} / ${totalQuestions}`);
}

function startPostSurvey(){
  if(state.screen !== "result") return;
  state.phaseTimes.post_started_at = state.phaseTimes.post_started_at || new Date().toISOString();
  setScreen("post");
}

function renderPostSurvey(){
  const survey = surveyItems("post");
  const fields = renderSurveyFields(survey, state.postSurveyAnswers, "post_");
  const summary = surveyErrorSummary();
  const submittingNotice = `<p class="notice sending-notice${state.isSubmittingPost ? " bts-late-status" : ""}"${state.isSubmittingPost ? ' data-state="sending" role="status"' : ""}>${state.isSubmittingPost
    ? (state.lang === "ja" ? "送信中です。画面が切り替わるまで、送信ボタンは1度だけ押してお待ちください。" : "Submitting. Please press the submit button only once and wait until the screen changes.")
    : (state.lang === "ja" ? "送信ボタンを押すと画面が切り替わります。二重送信を防ぐため、送信ボタンは1度だけ押してください。" : "After pressing submit, the screen will change. To prevent duplicate submissions, please press the submit button only once.")}</p>`;

  app.innerHTML = layout(`
    ${summary}
    <section class="card">
      <div class="theme">${state.lang === "ja" ? "事後アンケート" : "Post-survey"}</div>
      <h2 class="title">${state.lang === "ja" ? "学習後の変化について" : "About changes after learning"}</h2>
      ${submittingNotice}
    </section>
    <form id="postSurveyForm">${fields}
      <div class="row card"><button type="submit" class="btn" ${state.isSubmittingPost ? "disabled" : ""}>${state.isSubmittingPost ? (state.lang === "ja" ? "送信中です…" : "Submitting...") : (state.lang === "ja" ? "送信して終了" : "Submit and finish")}</button></div>
    </form>
  `, `${state.score} / ${DATA.questions.length}`);

  const form = $("#postSurveyForm");
  form.addEventListener("submit", submitPostSurvey);
  bindSurveyTracking("post", form);
}
function submitPostSurvey(e){
  e.preventDefault();
  if(state.isSubmittingPost) return;
  state.validationErrors = {};
  state.error = "";
  const currentSurvey = surveyItems("post");
  if(!collectSurvey(e.target, currentSurvey, state.postSurveyAnswers, "post_")) {
    renderPostSurvey();
    focusFirstValidationError();
    return;
  }
  state.postSurveyCompletedAt = new Date().toISOString();
  state.phaseTimes.post_completed_at = state.postSurveyCompletedAt;
  state.postSurveyLogs = buildSurveyLogs("post", currentSurvey, state.postSurveyAnswers, state.postSurveyCompletedAt);
  state.isSubmittingPost = true;
  state.logDeliveryStatus = "sending";
  persistState();
  renderPostSurvey();
  sendCompletionLog().then(result => {
    state.logDeliveryStatus = result.status;
  }).catch(error => {
    state.logDeliveryStatus = error?.code === "INVALID_COMPLETION_STATE" ? "validation_error" : "pending";
  }).finally(() => {
    state.isSubmittingPost = false;
    setScreen("final");
  });
}
function followupFormsForParticipant(){
  if(["web_token", "google_forms"].includes(EXPERIMENT_CONFIG.followupMode)) return [];
  const forms = DATA.config?.followupForms || {};
  const mode = DATA.config?.followupDeliveryMode || "language";
  if(mode === "both") return Object.entries(forms).filter(([,url]) => url).map(([lang,url]) => ({lang, url}));
  const url = forms[state.lang] || forms.ja || forms.en || "";
  return url ? [{lang: state.lang, url}] : [];
}

function followupEmailPreview(){
  if(!state.email) return null;
  if(["web_token", "google_forms"].includes(EXPERIMENT_CONFIG.followupMode)) return null;
  const forms = followupFormsForParticipant();
  const formLines = forms.map(f => `${f.lang.toUpperCase()}: ${f.url}`);
  const subject = state.lang === "ja" ? "自転車青切符シミュレーター 1週間後アンケートのお願い" : "Follow-up survey for the Bicycle Blue Ticket Simulator";
  const choiceInstruction = forms.length > 1
    ? (state.lang === "ja" ? "下記のうち回答しやすい言語のフォームを1つ選んで回答してください。" : "Please choose one form in the language you prefer and answer it.")
    : (state.lang === "ja" ? "下記のフォームに回答してください。" : "Please answer the form below.");
  const body = state.lang === "ja"
    ? `ご協力ありがとうございます。1週間後アンケートにご回答ください。\n${choiceInstruction}\n\n参加者ID: ${state.participantId}\n${formLines.join("\n")}\n\n回答時にも参加者IDを入力してください。`
    : `Thank you for your participation. Please answer the one-week follow-up survey.\n${choiceInstruction}\n\nParticipant ID: ${state.participantId}\n${formLines.join("\n")}\n\nPlease enter this participant ID when answering the form.`;
  return {subject, body, forms};
}

function renderFinal(){
  const emailPreview = followupEmailPreview();
  const follow = state.email
    ? (state.lang === "ja" ? "1週間後アンケートの案内を希望する設定です。保存確認後、専用リンクからGoogleフォームで回答します。メールの送信完了を示す表示ではありません。" : "You requested a one-week follow-up invitation. Once saving is confirmed, use your personal link to answer in Google Forms. This message does not confirm that an email has been sent.")
    : (state.lang === "ja" ? "メールアドレスは未入力のため，1週間後アンケートの送付対象にはなりません。" : "No email address was entered, so no follow-up survey will be sent.");
  const deliveryNotice = state.logDeliveryStatus === "pending"
    ? `<p class="bts-late-status" data-state="saved" role="status">${state.lang === "ja" ? "通信が完了していないため、回答をこの端末に一時保存しました。接続が戻ると再送します。" : "The response is temporarily saved on this device because transmission is incomplete. It will retry when the connection returns."}</p>`
    : ["storage_error", "validation_error"].includes(state.logDeliveryStatus)
      ? `<p class="bts-late-error" role="alert">${state.lang === "ja" ? "回答を端末へ安全に保存できませんでした。画面を閉じず、担当者にお知らせください。" : "The response could not be stored safely on this device. Keep this screen open and contact the researcher."}</p>`
      : "";
  app.innerHTML = layout(`
    <section class="card stack center final-card">
      <div class="theme">${state.lang === "ja" ? "終了" : "Finished"}</div>
      <h2 class="title">${state.lang === "ja" ? "ご協力ありがとうございました" : "Thank you for your cooperation"}</h2>
      <p>${escapeHtml(follow)}</p>
      ${deliveryNotice}
      <p class="notice">${escapeHtml(sharedDeviceMessage())}</p>
      ${emailPreview ? `<p class="notice followup-links">${escapeHtml(emailPreview.forms.map(f => `${f.lang.toUpperCase()}: ${f.url}`).join(" / "))}</p>` : ""}
      <div class="row"><button class="btn" onclick="restartExperiment()">${escapeHtml(t('restart'))}</button></div>
    </section>
  `);
}
function restartExperiment(){
  if(!IS_LOCAL && state.logDeliveryStatus !== "sent") {
    window.alert(state.lang === "ja" ? "まだ保存を確認できていません。画面を閉じず、接続を確認するか担当者にお知らせください。" : "Saving has not been confirmed. Keep this page open, check your connection, or contact the researcher.");
    return;
  }
  if(EXPERIMENT.validateParticipantId(state.participantId)) EXPERIMENT.clearCachedAssignment(STORE_ID, state.participantId);
  sessionEnding = true;
  clearPendingSubmission(state.submissionId);
  clearSessionState();
  window.location.reload();
}
function sharedDeviceMessage(){
  return state.lang === "ja"
    ? "共有端末では保存確認まで画面を閉じず、終了画面のボタンで端末内の参加資格とセッションを消去してください。通信未完了の回答と再送用資格はこの端末に一時保存し、サーバーの保存確認後に消去します。個人用リンクは他の人に共有しないでください。"
    : "On a shared device, keep this page open until saving is confirmed, then use the final-screen button to clear the participation credential and session. Unsent responses and their retry credential are temporarily stored on this device and removed after server confirmation. Do not share your personal link.";
}

function surveyChoiceCodes(value){
  const values = Array.isArray(value) ? value : [value];
  return values.map(item => {
    const match = String(item ?? "").trim().match(/^([A-Z])(?:[\.．、:\s]|$)/i);
    return match ? match[1].toUpperCase() : "";
  }).filter(Boolean).sort();
}
function surveyAnswerIsCorrect(selected, correct){
  if(correct == null) return null;
  const selectedCodes = surveyChoiceCodes(selected);
  const correctCodes = (Array.isArray(correct) ? correct : [correct]).map(String).sort();
  return JSON.stringify(selectedCodes) === JSON.stringify(correctCodes);
}
function buildSurveyLogs(phase, items, answers, completedAt){
  let questionOrder = 0;
  const phaseStartedAt = phase === "pre" ? state.phaseTimes.pre_started_at : state.phaseTimes.post_started_at;
  const phaseDwellMs = phaseStartedAt ? Math.max(0, new Date(completedAt) - new Date(phaseStartedAt)) : null;
  return items.filter(item => item.type !== "notice").map(item => {
    questionOrder += 1;
    const selected = answers[item.id] ?? "";
    const correct = EXPERIMENT.lookupAnswerKey(phase, item.id);
    const timing = state.surveyTimings?.[phase]?.[item.id] || null;
    const startedAt = timing?.startedAt || null;
    const answeredAt = timing?.answeredAt || completedAt;
    const responseTime = startedAt && answeredAt ? Math.max(0, new Date(answeredAt) - new Date(startedAt)) : null;
    return {
      event_id: `${state.submissionId}:${phase}:${item.id}:1`,
      session_id: state.sessionId,
      participant_id: state.participantId,
      participant_id_normalized: state.participantIdNormalized,
      assignment_id: state.assignment?.assignmentId || "",
      store_id: state.storeId,
      condition: state.condition,
      language: state.lang,
      phase,
      question_id: item.id,
      question_order: questionOrder,
      attempt_no: 1,
      selected_answer: selectedValue(selected),
      correct_answer: correct == null ? null : selectedValue(correct),
      is_correct: surveyAnswerIsCorrect(selected, correct),
      question_started_at: startedAt,
      answered_at: answeredAt,
      timestamp: answeredAt,
      response_time_ms: responseTime,
      screen_dwell_time_ms: phaseDwellMs,
      answer_change_count: timing ? Number(timing.answerChangeCount || 0) : null,
      feedback_started_at: null,
      feedback_ended_at: null,
      explanation_view_time_ms: null
    };
  });
}

function buildSummary(){
  const totalQuestions = DATA.questions.length;
  const overall = Math.round((state.score / totalQuestions) * 100);
  const situationIds = DATA.questions.filter(q => q.score_domain === "situation").map(q => q.id);
  const systemIds = DATA.questions.filter(q => q.score_domain === "system").map(q => q.id);
  const situationCorrect = state.answers.filter(a => a.is_correct && situationIds.includes(a.question_id)).length;
  const systemCorrect = state.answers.filter(a => a.is_correct && systemIds.includes(a.question_id)).length;
  return {
    overall_accuracy: overall,
    situation_score: situationIds.length ? Math.round((situationCorrect / situationIds.length) * 100) : 0,
    system_score: systemIds.length ? Math.round((systemCorrect / systemIds.length) * 100) : 0
  };
}

function buildCompletionPayload(){
  if(!validRestoredAssignment(state)) throw new Error("Assignment state is inconsistent and cannot be logged.");
  return EXPERIMENT.buildCompletionPayload({
    state,
    data: DATA,
    summary: buildSummary(),
    followupEmailPreview: followupEmailPreview(),
    nowMs: Date.now()
  });
}
function pendingSubmissionKey(submissionId){
  return `${PENDING_STORAGE_PREFIX}${submissionId}`;
}
function savePendingSubmission(payload, attempts = 0, lastError = ""){
  try {
    const key = pendingSubmissionKey(payload.submission_id);
    const value = JSON.stringify({payload, attempts, lastError, updatedAt:new Date().toISOString()});
    localStorage.setItem(key, value);
    return localStorage.getItem(key) === value;
  } catch(_error) {
    return false;
  }
}
function listPendingSubmissions(){
  try {
    const pending = [];
    for(let index = 0; index < localStorage.length; index += 1){
      const key = localStorage.key(index);
      if(!key?.startsWith(PENDING_STORAGE_PREFIX) || key.includes(":probe:")) continue;
      try {
        const record = JSON.parse(localStorage.getItem(key));
        if(record?.payload?.submission_id && pendingSubmissionKey(record.payload.submission_id) === key) {
          pending.push(record);
        }
      } catch(_error) {}
    }
    return pending.sort((a,b) => String(a.updatedAt || "").localeCompare(String(b.updatedAt || "")));
  } catch(_error) {
    return [];
  }
}
function clearPendingSubmission(submissionId){
  try { localStorage.removeItem(pendingSubmissionKey(submissionId)); } catch(_error) {}
}
async function postPayload(payload){
  await fetch(LOG_ENDPOINT, {
    method: "POST",
    mode: "no-cors",
    headers: {"Content-Type":"text/plain;charset=utf-8"},
    referrerPolicy: "no-referrer",
    body: JSON.stringify(payload)
  });
}
function waitMs(milliseconds){
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}
async function confirmSubmissionReceipt(payload){
  return EXPERIMENT.getSubmissionReceipt({
    submissionId: payload.submission_id,
    participantId: payload.participant_id_normalized || payload.participant_id,
    storeId: payload.store_id,
    condition: payload.condition,
    assignmentId: payload.allocation?.assignment_id,
    sessionId: payload.session_id,
    participantToken: payload.participant_token,
    location: window.location
  });
}
async function deliverAndConfirm(payload){
  await postPayload(payload);
  const attempts = Math.max(1, Number(EXPERIMENT_CONFIG.logging?.receiptPollAttempts || 3));
  const delayMs = Math.max(0, Number(EXPERIMENT_CONFIG.logging?.receiptPollDelayMs || 650));
  let lastStatus = "missing";
  let lastError = "";
  for(let attempt = 0; attempt < attempts; attempt += 1){
    try {
      const receipt = await confirmSubmissionReceipt(payload);
      lastStatus = receipt.status;
      lastError = receipt.lastError || "";
      if(receipt.complete) return {confirmed:true, receipt};
      if(receipt.status === "error") break;
    } catch(error) {
      lastError = String(error?.message || error);
    }
    if(attempt < attempts - 1 && delayMs) await waitMs(delayMs);
  }
  return {confirmed:false, status:lastStatus, error:lastError || `receipt_${lastStatus}`};
}
async function sendCompletionLog(){
  const payload = buildCompletionPayload();
  if(IS_LOCAL && EXPERIMENT_CONFIG.localhost.disableNetwork) return {status:"skipped_local"};
  if(!savePendingSubmission(payload)) return {status:"storage_error"};
  if(!LOG_ENDPOINT) return {status:"pending"};
  try{
    const delivery = await deliverAndConfirm(payload);
    if(delivery.confirmed) {
      clearPendingSubmission(payload.submission_id);
      return {status:"sent"};
    }
    savePendingSubmission(payload, 1, delivery.error || delivery.status || "receipt_unconfirmed");
    return {status:"pending"};
  }catch(error){
    savePendingSubmission(payload, 1, String(error?.message || error));
    return {status:"pending"};
  }
}
let pendingRetryInProgress = false;
async function retryPendingSubmissions(){
  if(IS_LOCAL || !LOG_ENDPOINT || pendingRetryInProgress) return;
  const records = listPendingSubmissions();
  if(records.length === 0) return;
  pendingRetryInProgress = true;
  try {
    for(const record of records){
      const payload = record?.payload;
      if(!payload?.submission_id) continue;
      try {
        const delivery = await deliverAndConfirm(payload);
        if(delivery.confirmed) {
          clearPendingSubmission(payload.submission_id);
          if(payload.submission_id === state.submissionId) state.logDeliveryStatus = "sent";
        } else {
          savePendingSubmission(payload, Number(record.attempts || 0) + 1, delivery.error || delivery.status || "receipt_unconfirmed");
          if(payload.submission_id === state.submissionId) state.logDeliveryStatus = "pending";
        }
      } catch(error) {
        savePendingSubmission(payload, Number(record.attempts || 0) + 1, String(error?.message || error));
        if(payload.submission_id === state.submissionId) state.logDeliveryStatus = "pending";
      }
    }
  } finally {
    pendingRetryInProgress = false;
    persistState();
    if(state.screen === "final") renderFinal();
  }
}

function downloadCsv(){
  const rows = [];
  rows.push(["section","key","value"]);
  rows.push(["session","schema_version",EXPERIMENT_CONFIG.schemaVersion]);
  rows.push(["session","submission_id",state.submissionId]);
  rows.push(["session","experiment_id",EXPERIMENT_CONFIG.experimentId]);
  rows.push(["session","app_version",EXPERIMENT_CONFIG.appVersion]);
  rows.push(["session","content_version",EXPERIMENT_CONFIG.contentVersion]);
  rows.push(["session","common_correction_version",EXPERIMENT_CONFIG.commonCorrectionVersion]);
  rows.push(["session","instrument_version",window.EVALUATION_DATA?.instrumentVersion || ""]);
  rows.push(["session","baseline_variant",EXPERIMENT_CONFIG.baselineVariant]);
  rows.push(["session","session_id",state.sessionId]);
  rows.push(["session","participant_id",state.participantId]);
  rows.push(["session","participant_id_normalized",state.participantIdNormalized]);
  rows.push(["session","store_id",state.storeId]);
  rows.push(["session","condition",state.condition]);
  rows.push(["session","assignment_id",state.assignment?.assignmentId || ""]);
  rows.push(["session","email",state.email]);
  rows.push(["session","followup_requested",Boolean(state.email)]);
  rows.push(["session","followup_forms",followupFormsForParticipant().map(f=>`${f.lang}:${f.url}`).join("|")]);
  rows.push(["session","language",state.lang]);
  rows.push(["session","started_at",state.sessionStartedAt]);
  rows.push(["session","simulation_completed_at",state.completedAt]);
  rows.push(["session","post_survey_completed_at",state.postSurveyCompletedAt]);
  rows.push(["session","total_score",state.score]);
  for(const [k,v] of Object.entries(state.preSurveyAnswers)) rows.push(["pre_survey",k,Array.isArray(v)?v.join("|"):v]);
  for(const [k,v] of Object.entries(state.postSurveyAnswers)) rows.push(["post_survey",k,Array.isArray(v)?v.join("|"):v]);
  rows.push([]);
  rows.push(["event_id","phase","question_id","question_order","selected_answer","correct_answer","is_correct","question_started_at","answered_at","response_time_ms","answer_change_count","explanation_view_time_ms","store_id","condition"]);
  [...state.preSurveyLogs, ...state.answers, ...state.postSurveyLogs].forEach(a=>rows.push([
    a.event_id,a.phase,a.question_id,a.question_order,a.selected_answer,a.correct_answer,a.is_correct,
    a.question_started_at,a.answered_at,a.response_time_ms,a.answer_change_count,a.explanation_view_time_ms,
    a.store_id,a.condition
  ]));
  const csv = "\ufeff" + rows.map(r=>r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${state.participantId || "participant"}_${new Date().toISOString().replace(/[:.]/g,"-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function suspendActiveTiming(){
  if(sessionEnding) return;
  const now = new Date().toISOString();
  if(state.screen === "question" && state.questionStartedAt){
    state.questionElapsedMs = Number(state.questionElapsedMs || 0) + Math.max(0, new Date(now) - new Date(state.questionStartedAt));
    state.questionStartedAt = null;
  }
  if(state.screen === "feedback" && state.feedbackStartedAt){
    state.feedbackElapsedMs = Number(state.feedbackElapsedMs || 0) + Math.max(0, new Date(now) - new Date(state.feedbackStartedAt));
    state.feedbackStartedAt = null;
  }
  persistState();
}
window.addEventListener("beforeunload", suspendActiveTiming);
window.addEventListener("pageshow", () => {
  if(state.screen === "question" && !state.questionStartedAt) state.questionStartedAt = new Date().toISOString();
  if(state.screen === "feedback" && !state.feedbackStartedAt) state.feedbackStartedAt = new Date().toISOString();
});
window.addEventListener("online", retryPendingSubmissions);



function bootstrap(){
  if(bootstrapError) return renderSetupError();
  render();
  retryPendingSubmissions();
}

bootstrap();
