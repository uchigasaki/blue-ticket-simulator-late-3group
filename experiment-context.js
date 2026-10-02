(function (global) {
  "use strict";

  class ExperimentContextError extends Error {
    constructor(code, message, details) {
      super(message);
      this.name = "ExperimentContextError";
      this.code = code;
      this.details = details || null;
    }
  }

  function own(object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  }

  function getConfig(override) {
    const config = override || global.EXPERIMENT_CONFIG;
    if (!config) {
      throw new ExperimentContextError(
        "CONFIG_MISSING",
        "EXPERIMENT_CONFIG must be loaded before experiment-context.js is used."
      );
    }
    return config;
  }

  function getOverlays(override) {
    const overlays = override || global.CONDITION_OVERLAYS;
    if (!overlays) {
      throw new ExperimentContextError(
        "OVERLAYS_MISSING",
        "CONDITION_OVERLAYS must be loaded before condition helpers are used."
      );
    }
    return overlays;
  }

  function getEvaluationData(override) {
    const data = override || global.EVALUATION_DATA;
    if (!data) {
      throw new ExperimentContextError(
        "EVALUATION_DATA_MISSING",
        "EVALUATION_DATA must be loaded before evaluation helpers are used."
      );
    }
    return data;
  }

  function searchParamsFrom(source) {
    if (source instanceof URLSearchParams) return source;
    if (source && source.searchParams instanceof URLSearchParams) return source.searchParams;
    if (source && typeof source.search === "string") return new URLSearchParams(source.search);
    if (typeof source === "string") {
      const questionMark = source.indexOf("?");
      return new URLSearchParams(questionMark >= 0 ? source.slice(questionMark + 1) : source);
    }
    return new URLSearchParams(global.location ? global.location.search : "");
  }

  function normalizeStore(value) {
    return String(value == null ? "" : value).trim().toUpperCase();
  }

  function validateStore(value, configOverride) {
    const config = getConfig(configOverride);
    return config.allowedStores.includes(normalizeStore(value));
  }

  function parseStore(source, configOverride) {
    const values = searchParamsFrom(source).getAll("store");
    if (values.length !== 1) return null;
    const raw = values[0];
    const normalized = normalizeStore(raw);
    return validateStore(normalized, configOverride) ? normalized : null;
  }

  function requireStore(sourceOrValue, configOverride) {
    const directValue = typeof sourceOrValue === "string" && !/[?=&]/.test(sourceOrValue)
      ? normalizeStore(sourceOrValue)
      : null;
    const store = directValue || parseStore(sourceOrValue, configOverride);
    if (!store || !validateStore(store, configOverride)) {
      throw new ExperimentContextError(
        "INVALID_STORE",
        "A valid store query value (A, B, or C) is required."
      );
    }
    return store;
  }

  function hostnameOf(locationLike) {
    return String((locationLike || global.location || {}).hostname || "").toLowerCase();
  }

  function isLocalhost(locationLike) {
    const hostname = hostnameOf(locationLike);
    return hostname === "localhost" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "[::1]" ||
      /^127(?:\.\d{1,3}){3}$/.test(hostname) ||
      hostname.endsWith(".localhost");
  }

  function normalizeParticipantId(value) {
    return String(value == null ? "" : value).trim().toUpperCase();
  }

  function validateParticipantId(value) {
    return /^[A-Z]{4}\d{2}$/.test(normalizeParticipantId(value));
  }

  function randomBytes(length) {
    const bytes = new Uint8Array(length);
    if (global.crypto && typeof global.crypto.getRandomValues === "function") {
      global.crypto.getRandomValues(bytes);
      return bytes;
    }
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    return bytes;
  }

  function createUuid() {
    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      return global.crypto.randomUUID();
    }
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, function (byte) {
      return byte.toString(16).padStart(2, "0");
    }).join("");
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join("-");
  }

  function assignmentCacheKey(store, participantId, configOverride) {
    const config = getConfig(configOverride);
    const normalizedStore = requireStore(store, config);
    const normalizedParticipantId = normalizeParticipantId(participantId);
    if (!validateParticipantId(normalizedParticipantId)) {
      throw new ExperimentContextError(
        "INVALID_PARTICIPANT_ID",
        "Participant ID must be four letters followed by two digits."
      );
    }
    return [
      config.storage.assignmentKeyPrefix,
      config.experimentId,
      config.allocationVersion,
      normalizedStore,
      normalizedParticipantId
    ].map(encodeURIComponent).join(":");
  }

  function defaultStorage() {
    try {
      return global.sessionStorage || null;
    } catch (_error) {
      return null;
    }
  }

  function safeStorageGet(storage, key) {
    try {
      return storage ? storage.getItem(key) : null;
    } catch (_error) {
      return null;
    }
  }

  function safeStorageSet(storage, key, value) {
    try {
      if (!storage) return false;
      const serialized = String(value);
      storage.setItem(key, serialized);
      return storage.getItem(key) === serialized;
    } catch (_error) {
      return false;
    }
  }

  function safeStorageRemove(storage, key) {
    try {
      if (storage) storage.removeItem(key);
    } catch (_error) {}
  }

  function recordControlRevision(controlValues, key, value) {
    if (!controlValues || typeof controlValues !== "object" || !String(key || "")) {
      throw new ExperimentContextError("INVALID_CONTROL_STATE", "A control state object and key are required.");
    }
    const changed = own(controlValues, key) && controlValues[key] !== value;
    controlValues[key] = value;
    return changed;
  }

  function normalizeCondition(value, configOverride) {
    const config = getConfig(configOverride);
    const normalized = String(value == null ? "" : value).trim().toLowerCase();
    return config.conditions.includes(normalized) ? normalized : null;
  }

  function parseLocalConditionOverride(source, locationLike, configOverride) {
    const config = getConfig(configOverride);
    if (!isLocalhost(locationLike) || !config.localhost.allowConditionOverride) return null;
    const raw = searchParamsFrom(source).get(config.localhost.conditionQueryParameter || "condition");
    if (raw == null || String(raw).trim() === "") return null;
    const condition = normalizeCondition(raw, config);
    if (!condition) {
      throw new ExperimentContextError(
        "INVALID_CONDITION_OVERRIDE",
        "The localhost condition override is not a configured condition.",
        { suppliedCondition: raw }
      );
    }
    return condition;
  }

  function stableHash(value) {
    let hash = 0x811c9dc5;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function deterministicLocalCondition(store, participantId, configOverride) {
    const config = getConfig(configOverride);
    const normalizedStore = requireStore(store, config);
    const normalizedParticipantId = normalizeParticipantId(participantId);
    if (!validateParticipantId(normalizedParticipantId)) {
      throw new ExperimentContextError("INVALID_PARTICIPANT_ID", "A valid participant ID is required.");
    }
    const seed = [
      config.experimentId,
      config.allocationVersion,
      normalizedStore,
      normalizedParticipantId
    ].join("|");
    return config.conditions[stableHash(seed) % config.conditions.length];
  }

  function assignmentMatches(assignment, store, participantId, config) {
    const condition = assignment ? normalizeCondition(assignment.condition, config) : null;
    const assignmentId = String((assignment || {}).assignmentId || "").trim();
    const clientRunIdValue = String((assignment || {}).clientRunId || "").trim();
    const method = String((assignment || {}).method || "").trim();
    const status = String((assignment || {}).status || "").trim();
    const opaqueId = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,179}$/;
    const validMethodAndStatus = status === "confirmed"
      ? method === config.assignmentMethod && /^[a-f0-9]{64}$/.test(assignment.participantToken || "") && opaqueId.test(assignment.sessionId || "")
      : status === "local_test" && ["localhost_override", "localhost_deterministic"].includes(method);
    return assignment && typeof assignment === "object" && !Array.isArray(assignment) &&
      assignment.schemaVersion === config.schemaVersion &&
      assignment.experimentId === config.experimentId &&
      assignment.appVersion === config.appVersion &&
      assignment.allocationVersion === config.allocationVersion &&
      assignment.storeId === store &&
      assignment.participantId === participantId &&
      assignment.condition === condition &&
      Boolean(condition) &&
      opaqueId.test(assignmentId) &&
      opaqueId.test(clientRunIdValue) &&
      validMethodAndStatus &&
      typeof assignment.reused === "boolean" &&
      Boolean(assignment.assignedAt) &&
      Number.isFinite(Date.parse(assignment.assignedAt));
  }

  function loadCachedAssignment(store, participantId, options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const normalizedStore = requireStore(store, config);
    const normalizedParticipantId = normalizeParticipantId(participantId);
    const storage = settings.storage === undefined ? defaultStorage() : settings.storage;
    const key = assignmentCacheKey(normalizedStore, normalizedParticipantId, config);
    const raw = safeStorageGet(storage, key);
    if (!raw) return null;
    try {
      const assignment = JSON.parse(raw);
      if (assignmentMatches(assignment, normalizedStore, normalizedParticipantId, config)) {
        return assignment;
      }
    } catch (_error) {}
    safeStorageRemove(storage, key);
    return null;
  }

  function saveCachedAssignment(assignment, options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const storage = settings.storage === undefined ? defaultStorage() : settings.storage;
    if (!assignmentMatches(assignment, assignment.storeId, assignment.participantId, config)) {
      throw new ExperimentContextError("INVALID_ASSIGNMENT", "The assignment cannot be cached safely.");
    }
    const key = assignmentCacheKey(assignment.storeId, assignment.participantId, config);
    if (!safeStorageSet(storage, key, JSON.stringify(assignment))) {
      throw new ExperimentContextError(
        "STORAGE_UNAVAILABLE",
        "The confirmed assignment could not be stored safely."
      );
    }
    return assignment;
  }

  function clearCachedAssignment(store, participantId, options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const storage = settings.storage === undefined ? defaultStorage() : settings.storage;
    const key = assignmentCacheKey(store, participantId, config);
    safeStorageRemove(storage, key);
    safeStorageRemove(storage, key + ":client-run-id");
  }

  function clientRunId(store, participantId, options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const storage = settings.storage === undefined ? defaultStorage() : settings.storage;
    const key = assignmentCacheKey(store, participantId, config) + ":client-run-id";
    let value = safeStorageGet(storage, key);
    if (!value) {
      value = createUuid();
      if (!safeStorageSet(storage, key, value)) {
        throw new ExperimentContextError(
          "STORAGE_UNAVAILABLE",
          "A stable assignment request id could not be stored safely."
        );
      }
    }
    return value;
  }

  function jsonpRequest(endpoint, parameters, options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const locationLike = settings.location || global.location;
    if (isLocalhost(locationLike) && config.localhost.disableNetwork) {
      return Promise.reject(new ExperimentContextError(
        "LOCALHOST_NETWORK_DISABLED",
        "Remote allocation is disabled on localhost."
      ));
    }
    if (!endpoint || !String(endpoint).trim()) {
      return Promise.reject(new ExperimentContextError(
        "SERVER_ENDPOINT_MISSING",
        "The production assignment server endpoint has not been configured."
      ));
    }

    const documentObject = settings.document || global.document;
    if (!documentObject || !documentObject.createElement) {
      return Promise.reject(new ExperimentContextError("JSONP_UNAVAILABLE", "JSONP requires a browser document."));
    }

    return new Promise(function (resolve, reject) {
      const callbackParameter = config.jsonp.callbackParameter || "callback";
      const timeoutMs = Number(settings.timeoutMs || config.jsonp.timeoutMs || 45000);
      const callbackName = "__btsAssignment_" + createUuid().replace(/-/g, "");
      let script = null;
      let timer = null;
      let settled = false;

      function cleanup(preserveLateCallback) {
        if (timer) global.clearTimeout(timer);
        if (script && script.parentNode) script.parentNode.removeChild(script);
        if (preserveLateCallback && settings.ignoreLateAssignmentCallback === true) {
          // Removing a script does not reliably cancel an in-flight GAS reply.
          // Discard that reply without letting it settle a retry or create an
          // undefined-callback error. The bounded tombstone contains no data.
          const ignore = function () {};
          global[callbackName] = ignore;
          global.setTimeout(function () {
            if (global[callbackName] === ignore) {
              try { delete global[callbackName]; } catch (_error) { global[callbackName] = undefined; }
            }
          }, 360000);
          return;
        }
        try {
          delete global[callbackName];
        } catch (_error) {
          global[callbackName] = undefined;
        }
      }

      function finish(error, value) {
        if (settled) return;
        settled = true;
        cleanup(Boolean(error));
        if (error) reject(error);
        else resolve(value);
      }

      let url;
      try {
        url = new URL(String(endpoint), locationLike && locationLike.href ? locationLike.href : undefined);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
          throw new Error("Unsupported endpoint protocol");
        }
        Object.keys(parameters || {}).forEach(function (key) {
          if (parameters[key] != null) url.searchParams.set(key, String(parameters[key]));
        });
        url.searchParams.set(callbackParameter, callbackName);
      } catch (error) {
        finish(new ExperimentContextError("INVALID_SERVER_ENDPOINT", "The assignment endpoint is invalid.", error));
        return;
      }

      global[callbackName] = function (payload) {
        finish(null, payload);
      };

      script = documentObject.createElement("script");
      script.async = true;
      script.referrerPolicy = "no-referrer";
      // This is an anonymously deployed endpoint. Do not attach a browser's
      // Google account cookies (including conflicting multi-login sessions).
      script.crossOrigin = "anonymous";
      script.src = url.toString();
      script.onerror = function () {
        finish(new ExperimentContextError("ASSIGNMENT_NETWORK_ERROR", "The assignment server could not be reached."));
      };
      timer = global.setTimeout(function () {
        finish(new ExperimentContextError("ASSIGNMENT_TIMEOUT", "The assignment server timed out."));
      }, timeoutMs);
      (documentObject.head || documentObject.documentElement).appendChild(script);
    });
  }

  function normalizeRemoteAssignment(response, expected, config) {
    if (!response || response.ok !== true) {
      throw new ExperimentContextError(
        "ASSIGNMENT_REJECTED",
        response && response.error ? String(response.error) : "The assignment server rejected the request.",
        response || null
      );
    }
    const payload = response.assignment || response.data || response;
    const condition = normalizeCondition(payload.condition, config);
    const storeId = normalizeStore(payload.store_id || payload.storeId);
    const participantId = normalizeParticipantId(
      payload.participant_id_normalized || payload.participant_id || payload.participantId
    );
    const assignmentId = String(payload.assignment_id || payload.assignmentId || "").trim();
    const schemaVersion = Number(payload.schema_version ?? payload.schemaVersion);
    const experimentId = String(payload.experiment_id || payload.experimentId || "").trim();
    const appVersion = String(payload.app_version || payload.appVersion || "").trim();
    const allocationVersion = String(payload.allocation_version || payload.allocationVersion || "").trim();
    const clientRunId = String(payload.client_run_id || payload.clientRunId || payload.request_id || "").trim();
    const sessionId = String(payload.session_id || "");
    const participantToken = String(payload.participant_token || "");
    const method = String(payload.assignment_method || payload.assignmentMethod || "").trim();
    const status = String(payload.status || "").trim().toLowerCase();
    const assignedAt = String(payload.assigned_at || payload.assignedAt || "").trim();
    const reusedValue = own(payload, "reused") ? payload.reused : response.reused;
    const validAssignmentId = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,179}$/.test(assignmentId);
    const validAssignedAt = Boolean(assignedAt) && Number.isFinite(Date.parse(assignedAt));

    if (!condition || storeId !== expected.storeId || participantId !== expected.participantId ||
        !validAssignmentId || schemaVersion !== config.schemaVersion || experimentId !== config.experimentId ||
        appVersion !== config.appVersion || method !== config.assignmentMethod ||
        allocationVersion !== config.allocationVersion || clientRunId !== expected.clientRunId ||
        sessionId !== expected.sessionId || !/^[a-f0-9]{64}$/.test(participantToken) ||
        status !== "confirmed" || typeof reusedValue !== "boolean" || !validAssignedAt) {
      throw new ExperimentContextError(
        "INVALID_ASSIGNMENT_RESPONSE",
        "The assignment response did not match the requested experiment, allocation, participant, store, and confirmed run.",
        null
      );
    }

    return {
      schemaVersion: config.schemaVersion,
      experimentId: config.experimentId,
      appVersion: config.appVersion,
      allocationVersion: config.allocationVersion,
      assignmentId: assignmentId,
      clientRunId: expected.clientRunId,
      sessionId: sessionId,
      participantToken: participantToken,
      storeId: storeId,
      participantId: participantId,
      condition: condition,
      source: "server",
      method: method,
      status: status,
      reused: reusedValue,
      assignedAt: assignedAt
    };
  }

  async function getSubmissionReceipt(options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const submissionId = String(settings.submissionId || "").trim();
    const participantId = normalizeParticipantId(settings.participantId);
    const storeId = requireStore(settings.storeId || settings.store, config);
    const condition = normalizeCondition(settings.condition, config);
    const assignmentId = String(settings.assignmentId || "").trim();
    const participantToken = String(settings.participantToken || "");
    const sessionId = String(settings.sessionId || "");

    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,179}$/.test(submissionId)) {
      throw new ExperimentContextError("INVALID_SUBMISSION_ID", "A valid submission id is required.");
    }
    if (!validateParticipantId(participantId) || !condition || !assignmentId ||
        !/^[a-f0-9]{64}$/.test(participantToken) || !/^[A-Za-z0-9][A-Za-z0-9._:-]{7,179}$/.test(sessionId)) {
      throw new ExperimentContextError(
        "INVALID_RECEIPT_REQUEST",
        "Receipt checks require the assigned participant, store, condition, and assignment id."
      );
    }

    const response = await jsonpRequest(config.serverEndpoint, {
      action: "receipt",
      schema_version: config.schemaVersion,
      submission_id: submissionId,
      experiment_id: config.experimentId,
      allocation_version: config.allocationVersion,
      assignment_id: assignmentId,
      participant_token: participantToken,
      session_id: sessionId,
      participant_id: participantId,
      store_id: storeId,
      condition: condition
    }, {
      config: config,
      document: settings.document,
      location: settings.location || global.location,
      timeoutMs: settings.timeoutMs
    });

    if (!response || response.ok === false) {
      throw new ExperimentContextError(
        "RECEIPT_REJECTED",
        response && response.error ? String(response.error) : "The receipt server rejected the request.",
        response || null
      );
    }

    const payload = response.receipt || response.data || response;
    const status = String(payload.status || "missing").toLowerCase();
    const responseSchemaVersion = Number(payload.schema_version ?? payload.schemaVersion);
    const responseAllocationVersion = String(payload.allocation_version || payload.allocationVersion || "").trim();
    const identityProofValid = payload.action === "receipt" && payload.identity_checked === true &&
      payload.conflict === false &&
      (status === "missing"
        ? payload.found === false && payload.identity_match === null
        : payload.found === true && payload.identity_match === true);
    if (!["missing", "processing", "error", "complete"].includes(status)) {
      throw new ExperimentContextError("INVALID_RECEIPT_RESPONSE", "The receipt status is invalid.", response);
    }
    if (responseSchemaVersion !== config.schemaVersion ||
        responseAllocationVersion !== config.allocationVersion || !identityProofValid) {
      throw new ExperimentContextError(
        "INVALID_RECEIPT_RESPONSE",
        "The receipt response did not prove the requested schema, allocation, and identity.",
        response
      );
    }
    if (status !== "missing") {
      const responseParticipant = normalizeParticipantId(payload.participant_id_normalized || payload.participant_id);
      const responseStore = normalizeStore(payload.store_id);
      const responseCondition = normalizeCondition(payload.condition, config);
      const responseSubmission = String(payload.submission_id || "").trim();
      const responseExperiment = String(payload.experiment_id || "").trim();
      const responseAssignment = String(payload.assignment_id || "").trim();
      if (responseSubmission !== submissionId || responseParticipant !== participantId ||
          responseStore !== storeId || responseCondition !== condition ||
          responseExperiment !== config.experimentId || responseAssignment !== assignmentId) {
        throw new ExperimentContextError(
          "RECEIPT_IDENTITY_MISMATCH",
          "The receipt did not match the submitted participant and condition.",
          response
        );
      }
    }

    return {
      status: status,
      complete: status === "complete",
      submissionId: submissionId,
      lastError: String(payload.last_error || payload.lastError || ""),
      completedAt: payload.completed_at || payload.completedAt || null
    };
  }

  function validateOverlayStructure(overlaysOverride, configOverride) {
    const config = getConfig(configOverride);
    const overlays = getOverlays(overlaysOverride);
    const errors = [];
    const conditions = overlays.conditions || {};
    const forbidden = new Set(overlays.forbiddenQuestionFields || []);
    const allowedByCondition = {
      no_image: new Set(["sceneDescription"]),
      improved: new Set([
        "keyPoint",
        "okExample",
        "ngExample",
        "decisionRule",
        "decisionFlow",
        "highlight",
        "explanationImage",
        "explanationImageAlt",
        "feedbackByAnswer"
      ])
    };

    if (overlays.schemaVersion !== config.schemaVersion) errors.push("Overlay schemaVersion must match the experiment schemaVersion.");
    if (!own(conditions, "original") || Object.keys(conditions.original || {}).length !== 0) {
      errors.push("Condition original must be an empty overlay.");
    }

    ["no_image", "improved"].forEach(function (condition) {
      const conditionOverlay = conditions[condition];
      if (!conditionOverlay || typeof conditionOverlay !== "object") {
        errors.push("Missing overlay for condition " + condition + ".");
        return;
      }
      const questions = conditionOverlay.questions || {};
      Object.keys(questions).forEach(function (questionId) {
        const questionOverlay = questions[questionId];
        if (!questionOverlay || typeof questionOverlay !== "object" || Array.isArray(questionOverlay)) {
          errors.push(condition + "." + questionId + " must be an object.");
          return;
        }
        Object.keys(questionOverlay).forEach(function (field) {
          if (forbidden.has(field)) {
            errors.push(condition + "." + questionId + " illegally overrides frozen field " + field + ".");
          }
          if (!allowedByCondition[condition].has(field)) {
            errors.push(condition + "." + questionId + " contains unsupported field " + field + ".");
          }
        });
      });
    });

    const noImage = conditions.no_image || {};
    if (noImage.hideLearningImages !== true) errors.push("Condition no_image must hide learning images.");
    const expectedNoImage = Array.from({ length: 7 }, function (_value, index) { return "q" + (index + 1); });
    const actualNoImage = Object.keys(noImage.questions || {}).sort();
    if (JSON.stringify(actualNoImage) !== JSON.stringify(expectedNoImage)) {
      errors.push("Condition no_image must define sceneDescription for q1-q7 only.");
    }
    expectedNoImage.forEach(function (questionId) {
      if (!own((noImage.questions || {})[questionId] || {}, "sceneDescription")) {
        errors.push("Condition no_image is missing " + questionId + ".sceneDescription.");
      }
    });

    const expectedImproved = Array.from({ length: 12 }, function (_value, index) { return "q" + (index + 1); });
    const actualImproved = Object.keys((conditions.improved || {}).questions || {}).sort(function (a, b) {
      return Number(a.slice(1)) - Number(b.slice(1));
    });
    if (JSON.stringify(actualImproved) !== JSON.stringify(expectedImproved)) {
      errors.push("Condition improved must define extension fields for q1-q12.");
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function validateConfiguration(configOverride) {
    const config = getConfig(configOverride);
    const errors = [];
    if (config.schemaVersion !== 2) errors.push("schemaVersion must be 2.");
    ["experimentId", "appVersion", "contentVersion", "commonCorrectionVersion", "baselineVariant", "allocationVersion", "assignmentMethod"].forEach(function (field) {
      if (!String(config[field] || "").trim()) errors.push(field + " is required.");
    });
    if (JSON.stringify(config.allowedStores) !== JSON.stringify(["A", "B", "C"])) {
      errors.push("allowedStores must be A, B, and C.");
    }
    if (JSON.stringify(config.conditions) !== JSON.stringify(["no_image", "original", "improved"])) {
      errors.push("conditions must be no_image, original, and improved.");
    }
    if (JSON.stringify(config.enabledLanguages) !== JSON.stringify(["ja", "en"])) {
      errors.push("enabledLanguages must explicitly contain ja and en while both language buttons are available.");
    }
    if (config.productionFailClosed !== true) errors.push("productionFailClosed must remain enabled.");
    if (!["google_forms", "web_token"].includes(config.followupMode)) errors.push("followupMode must use a tokenized supported follow-up mode.");
    if (!config.localhost || config.localhost.disableNetwork !== true || config.localhost.allowConditionOverride !== true) {
      errors.push("Localhost network disable and condition override must remain enabled.");
    }
    return { valid: errors.length === 0, errors: errors };
  }

  function nonEmptyContent(value) {
    if (typeof value === "string") return Boolean(value.trim());
    if (value && typeof value === "object") {
      return Object.keys(value).some(function (key) { return nonEmptyContent(value[key]); });
    }
    return false;
  }

  function hasLanguageContent(value, language) {
    if (!value || typeof value !== "object") return false;
    if (own(value, language)) return nonEmptyContent(value[language]);
    return Object.keys(value).some(function (key) {
      return hasLanguageContent(value[key], language);
    });
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function normalizedSurveyItemId(item) {
    return isPlainObject(item) ? String(item.id || "").trim() : "";
  }

  function baseSurveyItems(phase, language) {
    const data = global.APP_DATA || {};
    if (phase === "pre") return Array.isArray((data.survey || {})[language]) ? data.survey[language] : [];
    if (phase === "post") return Array.isArray((data.postSurvey || {})[language]) ? data.postSurvey[language] : [];
    return [];
  }

  function filterBaseSurveyItems(items, phase, evaluationData) {
    const excluded = ((evaluationData || {}).excludedBaseIds || {})[phase] || [];
    if (!Array.isArray(excluded) || excluded.length === 0) return items;
    const excludedSet = new Set(excluded);
    return items.filter(function (item) { return !excludedSet.has(item.id); });
  }

  function validateEvaluationItem(item, label, errors) {
    if (!isPlainObject(item)) {
      errors.push(label + " must be an object.");
      return;
    }
    const id = normalizedSurveyItemId(item);
    if (!/^[A-Za-z][A-Za-z0-9._:-]{0,99}$/.test(id)) {
      errors.push(label + " requires a safe non-empty id of at most 100 characters.");
    }
    const supportedTypes = new Set(["single", "multi", "scale", "number", "text", "notice"]);
    const type = String(item.type || "").trim();
    if (!supportedTypes.has(type)) errors.push(label + " has unsupported type " + (type || "(empty)") + ".");
    if (typeof item.title !== "string" || !item.title.trim()) errors.push(label + " requires a non-empty title string.");
    if (own(item, "optional") && typeof item.optional !== "boolean") errors.push(label + ".optional must be boolean when supplied.");

    if (type === "single" || type === "multi") {
      if (!Array.isArray(item.choices) || item.choices.length < 2) {
        errors.push(label + ".choices must contain at least two choices.");
      } else {
        const choices = item.choices.map(function (choice) { return typeof choice === "string" ? choice.trim() : ""; });
        if (choices.some(function (choice) { return !choice; })) errors.push(label + ".choices must be non-empty strings.");
        if (new Set(choices).size !== choices.length) errors.push(label + ".choices must not contain duplicates.");
      }
    }

    if (type === "scale") {
      const points = item.points === undefined ? [1, 2, 3, 4] : item.points;
      if (!Array.isArray(points) || points.length < 2 ||
          points.some(function (point) { return typeof point !== "number" || !Number.isFinite(point); }) ||
          new Set(points).size !== points.length) {
        errors.push(label + ".points must contain at least two unique finite numbers.");
      }
      if (typeof item.min !== "string" || !item.min.trim() || typeof item.max !== "string" || !item.max.trim()) {
        errors.push(label + " scale items require non-empty min and max labels.");
      }
    }

    if (type === "number") {
      const hasMin = own(item, "min") && item.min !== "" && item.min != null;
      const hasMax = own(item, "max") && item.max !== "" && item.max != null;
      if (hasMin && !Number.isFinite(Number(item.min))) errors.push(label + ".min must be numeric.");
      if (hasMax && !Number.isFinite(Number(item.max))) errors.push(label + ".max must be numeric.");
      if (hasMin && hasMax && Number(item.min) > Number(item.max)) errors.push(label + ".min must not exceed max.");
    }

    if (own(item, "image")) {
      if (typeof item.image !== "string" || !item.image.trim()) {
        errors.push(label + ".image must be a non-empty path when supplied.");
      } else if (typeof item.imageAlt !== "string" || !item.imageAlt.trim()) {
        errors.push(label + ".image requires non-empty imageAlt text.");
      }
    }
  }

  function validateEvaluationStructure(evaluationOverride, configOverride) {
    const evaluationData = getEvaluationData(evaluationOverride);
    const config = getConfig(configOverride);
    const errors = [];
    const phases = ["pre", "post", "followup"];
    const languages = Array.isArray(config.enabledLanguages) ? config.enabledLanguages : [];
    const combinedByPhase = {};

    if (!isPlainObject(evaluationData)) {
      return { valid: false, errors: ["Evaluation data must be an object."] };
    }

    if (own(evaluationData, "excludedBaseIds")) {
      const exclusions = evaluationData.excludedBaseIds;
      if (!isPlainObject(exclusions) || Object.keys(exclusions).some(function (phase) { return !phases.includes(phase); })) {
        errors.push("Evaluation excludedBaseIds must use only pre/post/followup arrays.");
      } else {
        phases.forEach(function (phase) {
          const ids = exclusions[phase] || [];
          if (!Array.isArray(ids) || new Set(ids).size !== ids.length || ids.some(function (id) { return typeof id !== "string"; })) {
            errors.push("Evaluation excludedBaseIds." + phase + " must be a unique id array.");
            return;
          }
          ids.forEach(function (id) {
            if (!languages.every(function (language) { return baseSurveyItems(phase, language).some(function (item) { return item.id === id; }); })) {
              errors.push("Evaluation excludedBaseIds." + phase + " contains unknown bilingual base id " + id + ".");
            }
            if (own((evaluationData.answerKeys || {})[phase] || {}, id)) {
              errors.push("Evaluation cannot exclude an objective baseline item without revising its answer key: " + id + ".");
            }
          });
        });
      }
    }

    ["extensions", "futureItems"].forEach(function (section) {
      if (!isPlainObject(evaluationData[section])) {
        errors.push("Evaluation " + section + " must be an object.");
        return;
      }
      phases.forEach(function (phase) {
        const phaseData = evaluationData[section][phase];
        if (!isPlainObject(phaseData)) {
          errors.push("Evaluation " + section + "." + phase + " must contain language arrays.");
          return;
        }
        languages.forEach(function (language) {
          if (!Array.isArray(phaseData[language])) {
            errors.push("Evaluation " + section + "." + phase + "." + language + " must be an array.");
          }
        });
      });
    });

    phases.forEach(function (phase) {
      combinedByPhase[phase] = {};
      languages.forEach(function (language) {
        const additions = extensionItems(phase, language, evaluationData);
        combinedByPhase[phase][language] = additions;
        const seen = new Set(baseSurveyItems(phase, language).map(function (item) {
          return normalizedSurveyItemId(item);
        }).filter(Boolean));
        additions.forEach(function (item, index) {
          const label = "Evaluation " + phase + "." + language + " item " + (index + 1);
          validateEvaluationItem(item, label, errors);
          const id = normalizedSurveyItemId(item);
          if (id && seen.has(id)) errors.push(label + " duplicates survey id " + id + ".");
          if (id) seen.add(id);
        });
      });

      if (languages.includes("ja") && languages.includes("en")) {
        const jaItems = combinedByPhase[phase].ja || [];
        const enItems = combinedByPhase[phase].en || [];
        const jaIds = jaItems.map(normalizedSurveyItemId);
        const enIds = enItems.map(normalizedSurveyItemId);
        if (JSON.stringify(jaIds) !== JSON.stringify(enIds)) {
          errors.push("Evaluation " + phase + " ja/en item ids and order must match.");
        }
        const enById = new Map(enItems.map(function (item) { return [normalizedSurveyItemId(item), item]; }));
        jaItems.forEach(function (jaItem) {
          const id = normalizedSurveyItemId(jaItem);
          const enItem = enById.get(id);
          if (!id || !isPlainObject(jaItem) || !isPlainObject(enItem)) return;
          if (jaItem.type !== enItem.type) errors.push("Evaluation " + phase + " item " + id + " must use the same type in ja/en.");
          if (Boolean(jaItem.optional) !== Boolean(enItem.optional)) errors.push("Evaluation " + phase + " item " + id + " must use the same optional setting in ja/en.");
          if (["single", "multi"].includes(jaItem.type) &&
              (jaItem.choices || []).length !== (enItem.choices || []).length) {
            errors.push("Evaluation " + phase + " item " + id + " must have the same number of ja/en choices.");
          }
          if (jaItem.type === "scale" && JSON.stringify(jaItem.points || [1, 2, 3, 4]) !== JSON.stringify(enItem.points || [1, 2, 3, 4])) {
            errors.push("Evaluation " + phase + " item " + id + " must have the same ja/en scale points.");
          }
          if (jaItem.type === "number" &&
              (String(jaItem.min ?? "") !== String(enItem.min ?? "") || String(jaItem.max ?? "") !== String(enItem.max ?? ""))) {
            errors.push("Evaluation " + phase + " item " + id + " must have the same ja/en numeric range.");
          }
          if (Boolean(String(jaItem.image || "").trim()) !== Boolean(String(enItem.image || "").trim())) {
            errors.push("Evaluation " + phase + " item " + id + " must use an image in both languages or neither.");
          }
        });
      }
    });

    if (!isPlainObject(evaluationData.answerKeys)) {
      errors.push("Evaluation answerKeys must be an object.");
    } else {
      phases.forEach(function (phase) {
        const keys = evaluationData.answerKeys[phase];
        if (!isPlainObject(keys)) {
          errors.push("Evaluation answerKeys." + phase + " must be an object.");
          return;
        }
        const knownIds = new Set();
        languages.forEach(function (language) {
          baseSurveyItems(phase, language).forEach(function (item) {
            const id = normalizedSurveyItemId(item);
            if (id) knownIds.add(id);
          });
          (combinedByPhase[phase][language] || []).forEach(function (item) {
            const id = normalizedSurveyItemId(item);
            if (id) knownIds.add(id);
          });
        });
        Object.keys(keys).forEach(function (id) {
          if (!knownIds.has(id)) errors.push("Evaluation answerKeys." + phase + " contains unknown id " + id + ".");
          const answer = keys[id];
          const values = Array.isArray(answer) ? answer : [answer];
          const validValues = values.length > 0 && values.every(function (value) {
            return (typeof value === "string" && Boolean(value.trim())) || (typeof value === "number" && Number.isFinite(value));
          });
          if (!validValues || new Set(values.map(String)).size !== values.length) {
            errors.push("Evaluation answerKeys." + phase + "." + id + " must contain unique non-empty string or numeric values.");
          }
        });
      });
    }

    return { valid: errors.length === 0, errors: errors };
  }

  function getReadinessReport(options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const overlays = getOverlays(settings.overlays);
    const evaluationData = getEvaluationData(settings.evaluationData);
    const production = settings.production === undefined
      ? !isLocalhost(settings.location || global.location)
      : Boolean(settings.production);
    const errors = [];

    errors.push.apply(errors, validateConfiguration(config).errors);
    errors.push.apply(errors, validateOverlayStructure(overlays, config).errors);
    errors.push.apply(errors, validateEvaluationStructure(evaluationData, config).errors);
    const corrections = global.COMMON_CORRECTIONS;
    if (!corrections || !global.FROZEN_APP_DATA || global.APP_DATA === global.FROZEN_APP_DATA) {
      errors.push("The shared common-correction layer must be loaded before using the late-term app.");
    } else if (corrections.version !== config.commonCorrectionVersion || corrections.contentVersion !== config.contentVersion || corrections.baselineVariant !== config.baselineVariant || overlays.contentVersion !== config.contentVersion) {
      errors.push("Shared correction, configuration, and overlay content versions must match.");
    }
    if (evaluationData.schemaVersion !== config.schemaVersion) {
      errors.push("Evaluation schemaVersion must match the experiment schemaVersion.");
    }

    if (production) {
      if (config.followupMode !== "google_forms") errors.push("Production follow-up collection must use google_forms.");
      if (!String(config.serverEndpoint || "").trim()) errors.push("Production serverEndpoint is not configured.");
      if (!String(config.deploymentUrl || "").trim()) errors.push("Production deploymentUrl is not configured for tokenized follow-up.");
      const reviewIssues = evaluationData.contentReviewIssues || [];
      if (!Array.isArray(reviewIssues)) {
        errors.push("Content review issues must be an array.");
      } else {
        reviewIssues.forEach(function (issue) {
          if (!issue || typeof issue.id !== "string" || !issue.id.trim() || typeof issue.status !== "string") {
            errors.push("Content review issue requires an id and status.");
          } else if ((issue.severity === "blocking" || issue.blocking === true) && issue.status !== "resolved") {
            errors.push("Unresolved blocking content review issue: " + issue.id + ".");
          }
        });
      }
      const noImage = (overlays.conditions || {}).no_image || { questions: {} };
      const improved = (overlays.conditions || {}).improved || { questions: {} };
      if (noImage.readyForProduction !== true) errors.push("Condition no_image is not ready for production.");
      if (improved.readyForProduction !== true) errors.push("Condition improved is not ready for production.");
      if (evaluationData.readyForProduction !== true) errors.push("Shared evaluation data is not ready for production.");
      const approvals = evaluationData.researcherApprovals || {};
      ["conditionNeutralPostSurvey", "lateEvaluationInstruments", "followupInstrumentAndUrl"].forEach(function (approval) {
        if (approvals[approval] !== true) errors.push("Researcher approval is missing: " + approval + ".");
      });
      Object.keys(noImage.questions || {}).forEach(function (questionId) {
        config.enabledLanguages.forEach(function (language) {
          if (!hasLanguageContent(noImage.questions[questionId].sceneDescription, language)) {
            errors.push("Condition no_image is missing researcher-approved " + language + " sceneDescription for " + questionId + ".");
          }
        });
      });
      Object.keys(improved.questions || {}).forEach(function (questionId) {
        config.enabledLanguages.forEach(function (language) {
          const question = improved.questions[questionId];
          const fields = ["keyPoint", "okExample", "ngExample", "decisionRule", "decisionFlow", "highlight", "explanationImage", "feedbackByAnswer"];
          if (!fields.some(function (field) { return hasLanguageContent(question[field], language); })) {
            errors.push("Condition improved has no researcher-approved " + language + " support for " + questionId + ".");
          }
          if (hasLanguageContent(question.explanationImage, language) &&
              !hasLanguageContent(question.explanationImageAlt, language)) {
            errors.push("Condition improved explanationImage requires " + language + " alt text for " + questionId + ".");
          }
        });
      });
      ["pre", "post", "followup"].forEach(function (phase) {
        config.enabledLanguages.forEach(function (language) {
          if (extensionItems(phase, language, evaluationData).length === 0) {
            errors.push("Shared evaluation data is missing " + language + " items for " + phase + ".");
          }
        });
      });
    }

    return {
      ready: errors.length === 0,
      production: production,
      errors: errors
    };
  }

  function assertReadyForProduction(options) {
    const report = getReadinessReport(Object.assign({}, options || {}, { production: true }));
    if (!report.ready) {
      throw new ExperimentContextError(
        "EXPERIMENT_NOT_READY",
        "The experiment is intentionally blocked until all production requirements are complete.",
        report
      );
    }
    return report;
  }

  function derivePresentationQuestion(baseQuestion, conditionValue, options) {
    if (!baseQuestion || typeof baseQuestion !== "object") {
      throw new ExperimentContextError("INVALID_QUESTION", "A base question object is required.");
    }
    const settings = options || {};
    const config = getConfig(settings.config);
    const overlays = getOverlays(settings.overlays);
    const condition = normalizeCondition(conditionValue, config);
    if (!condition) throw new ExperimentContextError("INVALID_CONDITION", "Unknown experiment condition.");

    // This identity guarantee is the central Condition B invariant.
    if (condition === "original") return baseQuestion;

    const conditionOverlay = overlays.conditions[condition] || {};
    const questionOverlay = (conditionOverlay.questions || {})[baseQuestion.id] || null;
    const hideImage = condition === "no_image" && conditionOverlay.hideLearningImages === true && Boolean(baseQuestion.image);
    if (!questionOverlay && !hideImage) return baseQuestion;

    const presentation = Object.assign({}, baseQuestion);
    if (hideImage) presentation.image = null;
    if (questionOverlay) Object.keys(questionOverlay).forEach(function (key) {
      presentation[key] = questionOverlay[key];
    });
    return presentation;
  }

  function extensionItems(phase, language, evaluationData) {
    const extensionsByLanguage = (evaluationData.extensions || {})[phase] || {};
    const futureByLanguage = (evaluationData.futureItems || {})[phase] || {};
    const extensions = Array.isArray(extensionsByLanguage)
      ? extensionsByLanguage
      : (Array.isArray(extensionsByLanguage[language]) ? extensionsByLanguage[language] : []);
    const futureItems = Array.isArray(futureByLanguage)
      ? futureByLanguage
      : (Array.isArray(futureByLanguage[language]) ? futureByLanguage[language] : []);
    return extensions.concat(futureItems);
  }

  function mergeSurveyItems(baseItems, phase, options) {
    if (!Array.isArray(baseItems)) {
      throw new ExperimentContextError("INVALID_SURVEY", "Base survey items must be an array.");
    }
    if (!["pre", "post", "followup"].includes(phase)) {
      throw new ExperimentContextError("INVALID_PHASE", "Survey phase must be pre, post, or followup.");
    }
    const settings = options || {};
    const evaluationData = getEvaluationData(settings.evaluationData);
    const language = settings.language || settings.lang || "ja";
    const additions = extensionItems(phase, language, evaluationData);
    const retainedBase = filterBaseSurveyItems(baseItems, phase, evaluationData);
    if (additions.length === 0) return retainedBase;

    const seen = new Set(baseItems.map(function (item) { return item && item.id; }).filter(Boolean));
    additions.forEach(function (item) {
      if (!item || !item.id) {
        throw new ExperimentContextError("INVALID_SURVEY_EXTENSION", "Every survey extension requires an id.");
      }
      if (seen.has(item.id)) {
        throw new ExperimentContextError(
          "DUPLICATE_SURVEY_ID",
          "Survey extension id duplicates an existing item: " + item.id
        );
      }
      seen.add(item.id);
    });
    return retainedBase.concat(additions);
  }

  function lookupAnswerKey(phase, questionId, options) {
    const evaluationData = getEvaluationData((options || {}).evaluationData);
    const phaseKeys = (evaluationData.answerKeys || {})[phase];
    if (!phaseKeys || !own(phaseKeys, questionId)) return null;
    const answer = phaseKeys[questionId];
    return Array.isArray(answer) ? answer.slice() : answer;
  }

  function buildCompletionPayload(options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const data = settings.data || global.APP_DATA || {};
    const state = settings.state;
    const fail = function (message, details) {
      throw new ExperimentContextError("INVALID_COMPLETION_STATE", message, details || null);
    };
    if (!isPlainObject(state)) fail("Completion state must be an object.");

    const participantId = normalizeParticipantId(state.participantId);
    const participantIdNormalized = normalizeParticipantId(state.participantIdNormalized);
    const storeId = normalizeStore(state.storeId);
    const condition = normalizeCondition(state.condition, config);
    const assignment = state.assignment;
    const opaqueId = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,179}$/;
    if (state.schemaVersion !== config.schemaVersion || state.appVersion !== config.appVersion) {
      fail("Completion state schema or app version is stale.");
    }
    if (!validateParticipantId(participantId) || participantIdNormalized !== participantId) {
      fail("Completion participant identity is invalid.");
    }
    if (!validateStore(storeId, config) || !condition) fail("Completion store or condition is invalid.");
    if (!opaqueId.test(String(state.submissionId || "")) || !opaqueId.test(String(state.sessionId || ""))) {
      fail("Completion submission_id and session_id must be stable opaque ids.");
    }
    if (!isPlainObject(assignment) || assignment.schemaVersion !== config.schemaVersion ||
        assignment.experimentId !== config.experimentId || assignment.appVersion !== config.appVersion ||
        assignment.allocationVersion !== config.allocationVersion ||
        assignment.participantId !== participantId || assignment.storeId !== storeId ||
        assignment.condition !== condition || !opaqueId.test(String(assignment.assignmentId || "")) ||
        !["confirmed", "local_test"].includes(String(assignment.status || ""))) {
      fail("Completion assignment identity is inconsistent.");
    }
    if (assignment.status === "confirmed" && (assignment.sessionId !== state.sessionId || !/^[a-f0-9]{64}$/.test(assignment.participantToken || ""))) fail("Completion requires the private capability bound to the assigned session.");

    const timestampValue = function (value, label) {
      const text = String(value || "").trim();
      if (!text || !Number.isFinite(Date.parse(text))) fail(label + " must be a valid timestamp.");
      return text;
    };
    const startTime = timestampValue(state.sessionStartedAt, "start_time");
    const simulationCompletedAt = timestampValue(state.completedAt, "simulation_completed_at");
    const endTime = timestampValue(state.postSurveyCompletedAt, "end_time");
    if (Date.parse(startTime) > Date.parse(simulationCompletedAt) || Date.parse(simulationCompletedAt) > Date.parse(endTime)) {
      fail("Completion timestamps must be in start, simulation completion, post completion order.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(state.experimentDate || ""))) {
      fail("experiment_date must use YYYY-MM-DD.");
    }

    const sources = [
      { phase: "pre", rows: state.preSurveyLogs },
      { phase: "learning", rows: state.answers },
      { phase: "post", rows: state.postSurveyLogs }
    ];
    const questionLogs = [];
    const eventIds = new Set();
    sources.forEach(function (source) {
      if (!Array.isArray(source.rows)) fail(source.phase + " logs must be an array.");
      source.rows.forEach(function (row, index) {
        if (!isPlainObject(row)) fail(source.phase + " log " + (index + 1) + " must be an object.");
        const eventId = String(row.event_id || "").trim();
        const answeredAt = String(row.answered_at || row.timestamp || "").trim();
        if (!eventId || eventIds.has(eventId)) fail("Question log event_id values must be non-empty and unique.", eventId);
        eventIds.add(eventId);
        if (row.phase !== source.phase || !String(row.question_id || "").trim()) {
          fail(source.phase + " log " + (index + 1) + " has an invalid phase or question_id.");
        }
        if (normalizeParticipantId(row.participant_id_normalized || row.participant_id) !== participantId ||
            normalizeStore(row.store_id) !== storeId || normalizeCondition(row.condition, config) !== condition ||
            String(row.session_id || "") !== String(state.sessionId) ||
            String(row.assignment_id || "") !== String(assignment.assignmentId)) {
          fail(source.phase + " log " + (index + 1) + " does not match the completion identity.", row);
        }
        if (!answeredAt || !Number.isFinite(Date.parse(answeredAt))) {
          fail(source.phase + " log " + (index + 1) + " requires a valid answered_at or timestamp.");
        }
        const answeredMs = Date.parse(answeredAt);
        if (answeredMs < Date.parse(startTime) || answeredMs > Date.parse(endTime) ||
            (source.phase === "post" && answeredMs < Date.parse(simulationCompletedAt)) ||
            (source.phase !== "post" && answeredMs > Date.parse(simulationCompletedAt))) {
          fail(source.phase + " log " + (index + 1) + " has a timestamp outside its phase.");
        }
        ["response_time_ms", "screen_dwell_time_ms", "answer_change_count", "explanation_view_time_ms"].forEach(function (field) {
          if (row[field] != null && (!Number.isFinite(Number(row[field])) || Number(row[field]) < 0)) {
            fail(source.phase + " log " + (index + 1) + " has invalid " + field + ".");
          }
        });
        questionLogs.push(Object.assign({}, row, {
          experiment_id: config.experimentId,
          content_version: config.contentVersion,
          common_correction_version: config.commonCorrectionVersion,
          instrument_version: String((global.EVALUATION_DATA || {}).instrumentVersion || "")
        }));
      });
    });

    const nowMs = settings.nowMs === undefined ? Date.now() : Number(settings.nowMs);
    if (!Number.isFinite(nowMs)) fail("nowMs must be finite when supplied.");
    const followupSendAt = new Date(nowMs + 7 * 24 * 60 * 60 * 1000).toISOString();
    return {
      schema_version: config.schemaVersion,
      event_type: "completion",
      submission_id: state.submissionId,
      experiment_id: config.experimentId,
      app_version: config.appVersion,
      content_version: config.contentVersion,
      common_correction_version: config.commonCorrectionVersion,
      baseline_variant: config.baselineVariant,
      instrument_version: String((global.EVALUATION_DATA || {}).instrumentVersion || ""),
      session_id: state.sessionId,
      participant_token: assignment.status === "confirmed" ? assignment.participantToken : "",
      participant_id: state.participantId,
      participant_id_normalized: participantId,
      email: state.email || "",
      language: state.lang,
      store_id: storeId,
      condition: condition,
      experiment_date: state.experimentDate,
      start_time: startTime,
      end_time: endTime,
      session_started_at: startTime,
      simulation_completed_at: simulationCompletedAt,
      post_survey_completed_at: endTime,
      consent: {
        version: config.experimentId + ":" + config.appVersion,
        given: Boolean(state.consent),
        given_at: state.consentGivenAt || null
      },
      allocation: {
        assignment_id: assignment.assignmentId,
        client_run_id: assignment.clientRunId || "",
        allocation_version: config.allocationVersion,
        method: assignment.method || assignment.source || "",
        status: assignment.status,
        assigned_at: assignment.assignedAt || null
      },
      phase_times: state.phaseTimes || {},
      completion_status: "completed",
      followup: {
        requested: Boolean(state.email),
        send_at: followupSendAt,
        delivery_mode: config.followupMode || (data.config || {}).followupDeliveryMode || "language",
        instrument_version: String((global.EVALUATION_DATA || {}).instrumentVersion || ""),
        email_preview: config.followupMode === "google_forms" ? null : settings.followupEmailPreview || null
      },
      summary: Object.assign({}, settings.summary || {}, {
        content_version: config.contentVersion,
        common_correction_version: config.commonCorrectionVersion,
        instrument_version: String((global.EVALUATION_DATA || {}).instrumentVersion || ""),
        baseline_variant: config.baselineVariant
      }),
      pre_survey: state.preSurveyAnswers || {},
      post_survey: state.postSurveyAnswers || {},
      answers: state.answers,
      question_logs: questionLogs
    };
  }

  async function getOrCreateAssignment(options) {
    const settings = options || {};
    const config = getConfig(settings.config);
    const locationLike = settings.location || global.location;
    const searchSource = settings.search === undefined ? locationLike : settings.search;
    const store = settings.store
      ? requireStore(settings.store, config)
      : requireStore(searchSource, config);
    const participantId = normalizeParticipantId(settings.participantId);
    if (!validateParticipantId(participantId)) {
      throw new ExperimentContextError(
        "INVALID_PARTICIPANT_ID",
        "Participant ID must be four letters followed by two digits."
      );
    }

    const storage = settings.storage === undefined ? defaultStorage() : settings.storage;
    const cached = loadCachedAssignment(store, participantId, { config: config, storage: storage });
    if (cached) {
      if (!isLocalhost(locationLike)) {
        assertReadyForProduction({ config, overlays: settings.overlays, evaluationData: settings.evaluationData, location: locationLike });
        if (cached.status !== "confirmed") throw new ExperimentContextError("INVALID_ASSIGNMENT", "Local assignments cannot authorize production participation.");
      }
      if (cached.status === "confirmed" && settings.sessionId && settings.sessionId !== cached.sessionId) throw new ExperimentContextError("ASSIGNMENT_SESSION_MISMATCH", "The saved assignment belongs to a different session.");
      return cached;
    }

    const local = isLocalhost(locationLike);
    const structuralReport = getReadinessReport({
      config: config,
      overlays: settings.overlays,
      evaluationData: settings.evaluationData,
      location: locationLike,
      production: false
    });
    if (!structuralReport.ready) {
      throw new ExperimentContextError("INVALID_EXPERIMENT_STRUCTURE", "Experiment configuration is invalid.", structuralReport);
    }

    const runId = settings.clientRunId || clientRunId(store, participantId, {
      config: config,
      storage: storage
    });
    const sessionId = String(settings.sessionId || runId);
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{7,179}$/.test(sessionId)) throw new ExperimentContextError("INVALID_SESSION_ID", "A stable session identifier is required.");
    let assignment;

    if (local) {
      const override = parseLocalConditionOverride(searchSource, locationLike, config);
      const condition = override || deterministicLocalCondition(store, participantId, config);
      const localIdSeed = [config.experimentId, config.allocationVersion, store, participantId, condition].join("|");
      assignment = {
        schemaVersion: config.schemaVersion,
        experimentId: config.experimentId,
        appVersion: config.appVersion,
        allocationVersion: config.allocationVersion,
        assignmentId: "local-" + stableHash(localIdSeed).toString(16).padStart(8, "0"),
        clientRunId: runId,
        sessionId: sessionId,
        storeId: store,
        participantId: participantId,
        condition: condition,
        source: override ? "localhost_override" : "localhost_deterministic",
        method: override ? "localhost_override" : "localhost_deterministic",
        status: "local_test",
        reused: false,
        assignedAt: new Date().toISOString()
      };
    } else {
      // No unbalanced/random client fallback is permitted outside localhost.
      assertReadyForProduction({
        config: config,
        overlays: settings.overlays,
        evaluationData: settings.evaluationData,
        location: locationLike
      });
      // At most one recovery request, using the SAME participant, session and
      // client run. The server can therefore return a saved assignment even if
      // its first successful response arrived after the browser timeout.
      const request = {
          action: "assign",
          schema_version: config.schemaVersion,
          experiment_id: config.experimentId,
          app_version: config.appVersion,
          allocation_version: config.allocationVersion,
          store: store,
          store_id: store,
          participant_id: participantId,
          request_id: runId,
          client_run_id: runId,
          session_id: sessionId
      };
      for (let attempt = 0; attempt < 2; attempt += 1) {
        let response;
        try {
          response = await jsonpRequest(config.serverEndpoint, request, {
            config: config,
            document: settings.document,
            location: locationLike,
            timeoutMs: settings.timeoutMs,
            ignoreLateAssignmentCallback: true
          });
        } catch (error) {
          if (attempt === 0 && ["ASSIGNMENT_TIMEOUT", "ASSIGNMENT_NETWORK_ERROR"].includes(error?.code)) continue;
          if (config.productionFailClosed) throw error;
          throw new ExperimentContextError(
            "UNSAFE_FALLBACK_BLOCKED",
            "Client fallback allocation is disabled for research integrity.",
            error
          );
        }
        try {
          assignment = normalizeRemoteAssignment(response, {
            storeId: store,
            participantId: participantId,
            clientRunId: runId,
            sessionId: sessionId
          }, config);
          break;
        } catch (error) {
          if (attempt === 0 && error?.code === "ASSIGNMENT_REJECTED" && error.details?.error === "assignment_busy") continue;
          throw error;
        }
      }
    }

    saveCachedAssignment(assignment, { config: config, storage: storage });
    return assignment;
  }

  global.EXPERIMENT_CONTEXT = Object.freeze({
    ExperimentContextError: ExperimentContextError,
    normalizeStore: normalizeStore,
    validateStore: validateStore,
    parseStore: parseStore,
    requireStore: requireStore,
    isLocalhost: isLocalhost,
    normalizeParticipantId: normalizeParticipantId,
    validateParticipantId: validateParticipantId,
    createUuid: createUuid,
    recordControlRevision: recordControlRevision,
    normalizeCondition: normalizeCondition,
    parseLocalConditionOverride: parseLocalConditionOverride,
    deterministicLocalCondition: deterministicLocalCondition,
    assignmentCacheKey: assignmentCacheKey,
    assignmentMatches: assignmentMatches,
    loadCachedAssignment: loadCachedAssignment,
    saveCachedAssignment: saveCachedAssignment,
    clearCachedAssignment: clearCachedAssignment,
    jsonpRequest: jsonpRequest,
    getSubmissionReceipt: getSubmissionReceipt,
    getOrCreateAssignment: getOrCreateAssignment,
    validateConfiguration: validateConfiguration,
    validateOverlayStructure: validateOverlayStructure,
    validateEvaluationStructure: validateEvaluationStructure,
    getReadinessReport: getReadinessReport,
    assertReadyForProduction: assertReadyForProduction,
    derivePresentationQuestion: derivePresentationQuestion,
    mergeSurveyItems: mergeSurveyItems,
    lookupAnswerKey: lookupAnswerKey,
    buildCompletionPayload: buildCompletionPayload
  });
})(window);
