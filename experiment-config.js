(function (global) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.getOwnPropertyNames(value).forEach(function (key) {
      deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }

  // Public operational information is separate from the adopted research content.
  // Keep one validator for the participant page and the production release check.
  global.BTS_PUBLIC_STUDY_INFORMATION = Object.freeze({
    validate: function (info) {
      var errors = [];
      info = info && typeof info === "object" && !Array.isArray(info) ? info : {};
      ["ja", "en"].forEach(function (language) {
        var name = info.researcherName && info.researcherName[language];
        if (typeof name !== "string" || !name.trim() || name.length > 160 || /[\u0000-\u001f\u007f]/.test(name)) {
          errors.push("studyInformation.researcherName." + language + " requires the public researcher name.");
        }
      });
      var email = info.contactEmail;
      if (typeof email !== "string" || email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)+$/.test(email) || /@(?:[^@]*\.)?example\.(?:com|org|net|test)$/i.test(email)) {
        errors.push("studyInformation.contactEmail requires one approved public contact email.");
      }
      ["contact", "rawResponses", "analysisData"].forEach(function (key) {
        var value = info.retentionMonths && info.retentionMonths[key];
        if (!Number.isInteger(value) || value < 1 || value > 120) {
          errors.push("studyInformation.retentionMonths." + key + " requires 1 to 120 calendar months from acquisition of that data.");
        }
      });
      if (info.ownerOnlyAccess !== true) errors.push("studyInformation.ownerOnlyAccess must record the approved owner-only viewing/deletion policy.");
      return errors;
    }
  });

  global.EXPERIMENT_CONFIG = deepFreeze({
    schemaVersion: 2,
    experimentId: "blue-ticket-simulator-late-3group",
    appVersion: "2.2.0-review.1",
    contentVersion: "2026-late-content-v2",
    commonCorrectionVersion: "2026-09-common-law-v1",
    baselineVariant: "late_common_corrected_v1",
    allocationVersion: "2026-late-v1",
    assignmentMethod: "gas_min_count_v1",

    allowedStores: ["A", "B", "C"],
    conditions: ["no_image", "original", "improved"],
    enabledLanguages: ["ja", "en"],

    // Separate late-term deployment; actual HTTP acceptance remains server-gated.
    serverEndpoint: "https://script.google.com/macros/s/AKfycbxRGQpMPcJmVTyyz4dzWfvVDCEf1-qlSM2LK5h7e40ckFkp9mw8aDO7Wi4nFV0kTyvO/exec",
    deploymentUrl: "https://uchigasaki.github.io/blue-ticket-simulator-late-3group/",
    // Public operational values supplied by the researcher on 2026-09-29.
    // The exact name is retained in both languages; no romanization is inferred.
    studyInformation: {
      researcherName: {ja: "内ヶ崎優斗", en: "内ヶ崎優斗"},
      contactEmail: "af23014@shibaura-it.ac.jp",
      retentionMonths: {contact: 6, rawResponses: 6, analysisData: 6},
      ownerOnlyAccess: true
    },
    recruitmentPeriod: {
      ja: "2026年9月29日～10月31日（日本時間）。目標100人以上、人数上限なし。",
      en: "September 29–October 31, 2026 (Japan time). Target: at least 100 participants; no numeric enrollment cap."
    },
    // Follow-up answers are collected only in the server-verified Google Form.
    // Public form URLs and credentials must never be put in this configuration.
    followupMode: "google_forms",
    productionFailClosed: true,

    jsonp: {
      callbackParameter: "callback",
      // Apps Script execution + redirect/network time can exceed 10 seconds.
      timeoutMs: 45000
    },

    logging: {
      receiptPollAttempts: 3,
      receiptPollDelayMs: 650
    },

    localhost: {
      allowConditionOverride: true,
      conditionQueryParameter: "condition",
      disableNetwork: true,
      deterministicFallback: true
    },

    storage: {
      assignmentKeyPrefix: "bts-assignment-v2"
    }
  });
})(window);
