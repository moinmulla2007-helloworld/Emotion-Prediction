(() => {
  "use strict";

  const EMOJI = {
    sadness: "😢",
    joy: "😄",
    love: "❤️",
    anger: "😠",
    fear: "😨",
    surprise: "😲",
  };

  const HISTORY_KEY = "moodline_history";
  const THEME_KEY = "moodline_theme";
  const MAX_HISTORY = 6;

  const el = {
    statusDot: document.getElementById("statusDot"),
    serverStatusText: document.getElementById("serverStatusText"),
    textInput: document.getElementById("textInput"),
    charCount: document.getElementById("charCount"),
    analyzeBtn: document.getElementById("analyzeBtn"),
    clearBtn: document.getElementById("clearBtn"),
    errorMsg: document.getElementById("errorMsg"),
    orb: document.getElementById("orb"),
    orbEmoji: document.getElementById("orbEmoji"),
    resultSection: document.getElementById("resultSection"),
    emotionWord: document.getElementById("emotionWord"),
    emotionEmoji: document.getElementById("emotionEmoji"),
    confidenceText: document.getElementById("confidenceText"),
    echoedText: document.getElementById("echoedText"),
    barsContainer: document.getElementById("barsContainer"),
    copyBtn: document.getElementById("copyBtn"),
    copyIcon: document.getElementById("copyIcon"),
    examples: document.getElementById("examples"),
    historySection: document.getElementById("historySection"),
    historyList: document.getElementById("historyList"),
    themeToggle: document.getElementById("themeToggle"),
    themeIcon: document.getElementById("themeIcon"),
  };

  let modelReady = false;
  let lastResult = null; // { emotion, confidence, text }

  /* ---------------------------------------------------------------
     Theme
  --------------------------------------------------------------- */
  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(THEME_KEY);
    } catch (e) {
      /* storage unavailable — fall back to default dark theme */
    }
    applyTheme(saved === "light" ? "light" : "dark");
  }

  function applyTheme(theme) {
    if (theme === "light") {
      document.body.setAttribute("data-theme", "light");
      el.themeIcon.textContent = "☀";
    } else {
      document.body.removeAttribute("data-theme");
      el.themeIcon.textContent = "☾";
    }
  }

  el.themeToggle.addEventListener("click", () => {
    const isLight = document.body.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* ignore — theme just won't persist */
    }
  });

  /* ---------------------------------------------------------------
     Health check — poll until the model is loaded
  --------------------------------------------------------------- */
  async function checkHealth() {
    try {
      const res = await fetch("/health");
      if (!res.ok) throw new Error("bad status");
      const data = await res.json();

      modelReady = !!data.model_loaded;
      if (modelReady) {
        setStatus("live", "model ready — say something");
      } else {
        setStatus("warming", "waking the model up…");
        setTimeout(checkHealth, 3000);
      }
    } catch (e) {
      setStatus("down", "can't reach the server");
      setTimeout(checkHealth, 5000);
    }
    syncButtonState();
  }

  function setStatus(kind, text) {
    el.statusDot.className = "brand-mark " + kind;
    el.serverStatusText.textContent = text;
  }

  /* ---------------------------------------------------------------
     Input handling
  --------------------------------------------------------------- */
  el.textInput.addEventListener("input", () => {
    el.charCount.textContent = el.textInput.value.length;
    syncButtonState();
  });

  el.textInput.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      runAnalysis();
    }
  });

  function syncButtonState() {
    const hasText = el.textInput.value.trim().length > 0;
    el.analyzeBtn.disabled = !hasText || !modelReady;
    el.clearBtn.hidden = !hasText && el.resultSection.hidden;
  }

  el.analyzeBtn.addEventListener("click", runAnalysis);

  /* ---------------------------------------------------------------
     Example prompts
  --------------------------------------------------------------- */
  el.examples.addEventListener("click", (e) => {
    const chip = e.target.closest(".example-chip");
    if (!chip) return;
    el.textInput.value = chip.dataset.text;
    el.charCount.textContent = el.textInput.value.length;
    syncButtonState();
    el.textInput.focus();
  });

  /* ---------------------------------------------------------------
     Clear
  --------------------------------------------------------------- */
  el.clearBtn.addEventListener("click", () => {
    el.textInput.value = "";
    el.charCount.textContent = "0";
    hideError();
    el.resultSection.hidden = true;
    el.orb.classList.remove("settled");
    el.orbEmoji.textContent = "✎";
    el.orbEmoji.style.opacity = "1";
    document.body.removeAttribute("data-emotion");
    lastResult = null;
    syncButtonState();
    el.textInput.focus();
  });

  /* ---------------------------------------------------------------
     Copy result
  --------------------------------------------------------------- */
  el.copyBtn.addEventListener("click", async () => {
    if (!lastResult) return;
    const summary = `${capitalize(lastResult.emotion)} (${(lastResult.confidence * 100).toFixed(1)}% confidence) — “${lastResult.text}”`;
    try {
      await navigator.clipboard.writeText(summary);
      flashCopied();
    } catch (e) {
      // fallback for environments without clipboard API access
      const ta = document.createElement("textarea");
      ta.value = summary;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        flashCopied();
      } catch (err) {
        /* copy unsupported — silently ignore */
      }
      document.body.removeChild(ta);
    }
  });

  function flashCopied() {
    el.copyBtn.classList.add("copied");
    el.copyIcon.textContent = "✓";
    setTimeout(() => {
      el.copyBtn.classList.remove("copied");
      el.copyIcon.textContent = "⧉";
    }, 1400);
  }

  /* ---------------------------------------------------------------
     History
  --------------------------------------------------------------- */
  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistoryEntry(entry) {
    const items = loadHistory();
    items.unshift(entry);
    const trimmed = items.slice(0, MAX_HISTORY);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
      /* storage unavailable — history just won't persist */
    }
    renderHistory(trimmed);
  }

  function renderHistory(items) {
    items = items || loadHistory();
    el.historyList.innerHTML = "";

    if (!items.length) {
      el.historySection.hidden = true;
      return;
    }

    el.historySection.hidden = false;
    items.forEach((item) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "history-item";
      row.innerHTML = `
        <span class="history-emoji">${EMOJI[item.emotion] || "🙂"}</span>
        <span class="history-text">${escapeHtml(item.text)}</span>
        <span class="history-label">${item.emotion}</span>
      `;
      row.addEventListener("click", () => {
        el.textInput.value = item.text;
        el.charCount.textContent = item.text.length;
        syncButtonState();
        runAnalysis();
      });
      el.historyList.appendChild(row);
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------------
     Analysis flow
  --------------------------------------------------------------- */
  async function runAnalysis() {
    const text = el.textInput.value.trim();
    if (!text || !modelReady) return;

    hideError();
    enterThinking();

    try {
      const res = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const detail =
          body && body.detail
            ? typeof body.detail === "string"
              ? body.detail
              : "The model couldn't process that sentence."
            : `Request failed (${res.status}).`;
        throw new Error(detail);
      }

      const data = await res.json();
      renderResult(data, text);
      saveHistoryEntry({ text, emotion: data.predicted_emotion });
    } catch (err) {
      exitThinking(false);
      showError(err.message || "Something went wrong. Try again.");
    }
  }

  function enterThinking() {
    el.analyzeBtn.classList.add("loading");
    el.analyzeBtn.querySelector(".btn-label").textContent = "Reading…";
    el.analyzeBtn.disabled = true;
    el.orb.classList.remove("settled");
    el.orb.classList.add("thinking");
    el.orbEmoji.style.opacity = "0";
  }

  function exitThinking(success) {
    el.analyzeBtn.classList.remove("loading");
    el.analyzeBtn.querySelector(".btn-label").textContent = "Read the mood";
    syncButtonState();
    el.orb.classList.remove("thinking");
    if (!success) {
      el.orbEmoji.textContent = "✎";
      el.orbEmoji.style.opacity = "1";
    }
  }

  function renderResult(data, originalText) {
    const emotion = data.predicted_emotion;
    const emoji = EMOJI[emotion] || "🙂";

    document.body.setAttribute("data-emotion", emotion);

    el.orb.classList.add("settled");
    el.orbEmoji.textContent = emoji;
    el.orbEmoji.style.opacity = "1";
    exitThinking(true);

    el.emotionWord.textContent = capitalize(emotion);
    el.emotionEmoji.textContent = emoji;
    el.confidenceText.textContent = `${(data.confidence * 100).toFixed(1)}% confidence`;
    el.echoedText.textContent = `“${originalText}”`;

    lastResult = { emotion, confidence: data.confidence, text: originalText };

    renderBars(data.all_probabilites);

    el.resultSection.hidden = false;
    el.resultSection.classList.remove("entering");
    void el.resultSection.offsetWidth; // restart animation
    el.resultSection.classList.add("entering");

    el.resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
    syncButtonState();
  }

  function renderBars(probs) {
    const entries = Object.entries(probs).sort((a, b) => b[1] - a[1]);
    el.barsContainer.innerHTML = "";

    entries.forEach(([label, value], i) => {
      const pct = value * 100;
      const row = document.createElement("div");
      row.className = `bar-row bar-${label}`;
      row.innerHTML = `
        <span class="bar-label">${EMOJI[label] || ""} ${label}</span>
        <span class="bar-track"><span class="bar-fill"></span></span>
        <span class="bar-pct">${pct.toFixed(1)}%</span>
      `;
      el.barsContainer.appendChild(row);

      const fill = row.querySelector(".bar-fill");
      setTimeout(() => {
        fill.style.width = pct + "%";
      }, 60 + i * 70);
    });
  }

  function showError(msg) {
    el.errorMsg.textContent = msg;
    el.errorMsg.hidden = false;
  }
  function hideError() {
    el.errorMsg.hidden = true;
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ---------------------------------------------------------------
     Boot
  --------------------------------------------------------------- */
  initTheme();
  renderHistory();
  checkHealth();
})();