(function (global) {
  "use strict";
  const button = document.getElementById("connectionCheckButton");
  const status = document.getElementById("connectionCheckStatus");
  if (!button || !status) return;
  let running = false;
  const publicCodes = new Set([
    "production_disabled", "production_closed", "production_not_configured", "production_review_required",
    "production_wrong_spreadsheet", "followup_not_configured", "no_configured_spreadsheet",
    "http_test_disabled", "http_test_unauthorized", "invalid_schema_version", "invalid_callback", "internal_error"
  ]);
  function safeCode(value) {
    return typeof value === "string" && /^[a-z][a-z0-9_]{0,63}$/.test(value) && publicCodes.has(value)
      ? value : "unexpected_response";
  }
  function target() {
    const config = global.EXPERIMENT_CONFIG;
    if (!config || config.jsonp?.callbackParameter !== "callback" || !Number.isInteger(config.jsonp.timeoutMs) ||
        config.jsonp.timeoutMs < 1000 || config.jsonp.timeoutMs > 120000) throw new Error("invalid_configuration");
    const url = new URL(config.serverEndpoint);
    if (url.protocol !== "https:" || url.hostname !== "script.google.com" || url.port || url.username || url.password ||
        url.search || url.hash || !/^\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url.pathname)) throw new Error("invalid_configuration");
    return {url, timeout:config.jsonp.timeoutMs};
  }
  function check() {
    if (running) return;
    let settings, callback;
    try {
      settings = target();
      const bytes = new Uint8Array(16);
      global.crypto.getRandomValues(bytes);
      callback = "__btsProbe_" + Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
    } catch (_) {
      status.textContent = "接続確認の設定を読み込めませんでした。（invalid_configuration）";
      return;
    }
    running = true;
    button.disabled = true;
    status.textContent = "接続を確認しています。最大" + Math.ceil(settings.timeout / 1000) + "秒ほどお待ちください。";
    const script = document.createElement("script");
    let settled = false, timer;
    function removeCallback() {
      try { delete global[callback]; } catch (_) { global[callback] = undefined; }
    }
    function finish(code, success, late) {
      if (settled) return;
      settled = true;
      if (timer) global.clearTimeout(timer);
      if (script.parentNode) script.parentNode.removeChild(script);
      if (late) {
        const ignore = function () {};
        global[callback] = ignore;
        global.setTimeout(function () { if (global[callback] === ignore) removeCallback(); }, 360000);
      } else removeCallback();
      running = false;
      button.disabled = false;
      status.textContent = success
        ? "接続できました。Googleから予定どおりの応答を受け取りました。回答保存・実験完了の確認ではありません。（invalid_action）"
        : "接続を確認できませんでした。もう一度試すか、研究者へこの結果をお知らせください。（" + code + "）";
    }
    global[callback] = function (payload) {
      if (payload && payload.ok === false && payload.error === "invalid_action") finish("invalid_action", true, false);
      else finish(safeCode(payload && payload.error), false, false);
    };
    // Deliberately not assign, receipt, followup or completion. No participant
    // identifiers, answers, tokens, account cookies or page URL are forwarded.
    settings.url.searchParams.set("action", "connectivity_probe");
    settings.url.searchParams.set("schema_version", "2");
    settings.url.searchParams.set("callback", callback);
    script.async = true;
    script.crossOrigin = "anonymous";
    script.referrerPolicy = "no-referrer";
    script.src = settings.url.toString();
    script.onerror = function () { finish("network_error", false, true); };
    timer = global.setTimeout(function () { finish("timeout", false, true); }, settings.timeout);
    try { document.head.appendChild(script); }
    catch (_) { finish("network_error", false, true); }
  }
  button.addEventListener("click", check);
})(window);
