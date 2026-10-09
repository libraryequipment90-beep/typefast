(() => {
  const DURATIONS = [
    { id: 30, label: "30s" },
    { id: 60, label: "1 min" },
    { id: 120, label: "2 min" },
    { id: 180, label: "3 min" },
    { id: 300, label: "5 min" },
    { id: 600, label: "10 min" }
  ];
  const DIFFS = [
    { id: "easy", label: "Easy" },
    { id: "medium", label: "Medium" },
    { id: "hard", label: "Hard" }
  ];
  const COLLECTIONS = [
    { id: "medium", label: "Standard" },
    { id: "pop", label: "Pop culture" },
    { id: "sport", label: "Sport" },
    { id: "nature", label: "Nature" },
    { id: "tech", label: "Technology" },
    { id: "travel", label: "Travel" },
    { id: "mixed", label: "Mixed" },
    { id: "fable", label: "Fable" },
    { id: "baseball", label: "Baseball" },
    { id: "space", label: "Space" },
    { id: "oz", label: "Story" },
    { id: "legal", label: "Legal" },
    { id: "medical", label: "Medical" },
    { id: "business", label: "Business" },
    { id: "coding", label: "Coding" }
  ];

  const settings = {
    duration: 60,
    difficulty: "medium",
    collection: "medium",
    punctuation: false,
    numbers: false,
    blind: false,
    mode: "timed",
    practice: "words",
    customText: "",
    lessonPrompt: ""
  };

  let state = null;
  let ticker = null;
  let lastResult = null;
  let soundOn = true;
  const audio = makeAudio();
  const storeKey = "typemaster-history-v1";

  const $ = (id) => document.getElementById(id);
  const views = {
    home: $("view-home"),
    test: $("view-test"),
    results: $("view-results"),
    practice: $("view-practice"),
    history: $("view-history"),
    faq: $("view-faq")
  };

  const SEO = {
    home: {
      title: "TypeFast — Free Typing Test to Practice, Improve and Type Faster",
      desc: "Take a free typing test online. Measure WPM and accuracy, practice letters, keys and keywords, and track your speed with TypeFast.",
      path: "/",
      hash: "home"
    },
    test: {
      title: "Free Typing Speed Test | TypeFast WPM Test",
      desc: "Start a timed typing test. Choose 30 seconds to 10 minutes, type the passage, and see your WPM, accuracy and errors when time ends.",
      path: "/#test",
      hash: "test"
    },
    results: {
      title: "Typing Test Results | TypeFast WPM Score",
      desc: "See your net WPM, accuracy, errors, consistency and a keyboard heatmap after finishing a TypeFast typing test.",
      path: "/#results",
      hash: "results"
    },
    practice: {
      title: "Typing Practice — Letters, Keys and Keywords | TypeFast",
      desc: "Practice typing with letter drills, key tests, keyword lessons and custom text. Learn the right finger for every key.",
      path: "/#practice",
      hash: "practice"
    },
    history: {
      title: "Typing Leaderboard and History | TypeFast",
      desc: "Track your typing scores locally. Compare WPM, accuracy and errors across timed tests on this device.",
      path: "/#leaderboard",
      hash: "leaderboard"
    },
    faq: {
      title: "About TypeFast — Typing Test FAQ",
      desc: "Learn how WPM is measured, what a good typing speed is, and how TypeFast helps you type faster with free tests and drills.",
      path: "/#about",
      hash: "about"
    }
  };

  function applySeo(name) {
    const page = SEO[name] || SEO.home;
    const origin = (location.origin && location.origin !== "null") ? location.origin : "https://typefast.app";
    const url = origin + (page.path === "/" ? "/" : page.path);
    document.title = page.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", page.desc);
    const set = (id, attr, val) => { const el = $(id); if (el) el.setAttribute(attr, val); };
    set("canonicalLink", "href", url);
    set("ogTitle", "content", page.title);
    set("ogDesc", "content", page.desc);
    set("ogUrl", "content", url);
    set("twTitle", "content", page.title);
    set("twDesc", "content", page.desc);
    const ld = $("ldJson");
    if (ld) {
      const graph = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            "name": "TypeFast",
            "url": origin + "/",
            "description": SEO.home.desc,
            "inLanguage": "en"
          },
          {
            "@type": "WebPage",
            "name": page.title,
            "description": page.desc,
            "url": url,
            "isPartOf": { "@type": "WebSite", "name": "TypeFast", "url": origin + "/" }
          },
          {
            "@type": "SoftwareApplication",
            "name": "TypeFast",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          }
        ]
      };
      if (name === "faq" && typeof FAQ !== "undefined") {
        graph["@graph"].push({
          "@type": "FAQPage",
          "mainEntity": FAQ.map((item) => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": { "@type": "Answer", "text": item.a }
          }))
        });
      }
      ld.textContent = JSON.stringify(graph);
    }
  }

  function show(name, opts = {}) {
    const map = { lessons: "practice", keys: "practice", about: "faq", leaderboard: "history" };
    name = map[name] || name;
    if (!views[name]) name = "home";
    Object.values(views).forEach((v) => v && v.classList.remove("is-active"));
    document.querySelectorAll(".nav-btn").forEach((b) => {
      const n = b.dataset.nav;
      b.classList.toggle(
        "is-active",
        n === name ||
          (name === "results" && n === "test") ||
          (name === "test" && ["letter", "key", "keyword", "lesson"].includes(settings.mode) && n === "practice")
      );
    });
    const view = views[name] || views.home;
    view.classList.add("is-active");
    document.body.classList.toggle("is-exam", name === "test" && views.test && views.test.classList.contains("is-exam"));
    applySeo(name);
    if (!opts.silentHash) {
      const hash = (SEO[name] && SEO[name].hash) || name;
      if (location.hash.replace("#", "") !== hash) history.replaceState(null, "", "#" + hash);
    }
    window.scrollTo(0, 0);
  }

  function chips(el, items, key, onPick) {
    if (!el) return;
    el.innerHTML = "";
    items.forEach((item) => {
      const b = document.createElement("button");
      b.className = "chip" + (settings[key] === item.id ? " is-on" : "");
      b.textContent = item.label;
      b.addEventListener("click", () => {
        settings[key] = item.id;
        chips(el, items, key, onPick);
        if (onPick) onPick();
      });
      el.appendChild(b);
    });
  }

  function updatePreview() {
    const s = { ...settings, mode: "timed" };
    const words = Engine.create(s).words;
    const text = words.slice(0, 42).join(" ");
    if ($("previewTitle")) $("previewTitle").textContent = COLLECTIONS.find((c) => c.id === settings.collection)?.label || "Passage";
    if ($("previewWords")) $("previewWords").textContent = words.length + " words";
    if ($("previewText")) $("previewText").textContent = text + (words.length > 42 ? " ..." : "");
  }

  function history() {
    try {
      return JSON.parse(localStorage.getItem(storeKey) || "[]");
    } catch {
      return [];
    }
  }

  function saveHistory(entry) {
    const list = history();
    list.unshift(entry);
    localStorage.setItem(storeKey, JSON.stringify(list.slice(0, 80)));
    paintHero();
  }

  function paintHero() {
    const list = history();
    if ($("statUsers")) $("statUsers").textContent = list.length ? String(Math.max(10000, 10000 + list.length)) + "+" : "10,000+";
    if (!list.length) {
      if ($("bestWpm")) $("bestWpm").textContent = "75+";
      if ($("avgAcc")) $("avgAcc").textContent = "98%";
      return;
    }
    if ($("bestWpm")) $("bestWpm").textContent = String(Math.max(...list.map((x) => x.wpm)));
    const avg = list.reduce((a, b) => a + b.acc, 0) / list.length;
    if ($("avgAcc")) $("avgAcc").textContent = Math.round(avg) + "%";
  }

  function setTestPhase(phase) {
    const setup = $("setupPanel");
    const run = $("testRun");
    if (setup) setup.hidden = phase !== "setup";
    if (run) run.hidden = phase !== "run";
    const exam = phase === "run";
    if (views.test) views.test.classList.toggle("is-exam", exam);
    document.body.classList.toggle("is-exam", exam);
  }

  function updateSetupCopy() {
    const titles = {
      timed: "How long do you want to type?",
      letter: "How long do you want to practice this letter?",
      key: "How long do you want to practice these keys?",
      keyword: "How long do you want to practice these words?",
      lesson: "How long do you want to run this lesson?",
      practice: "How long do you want to practice?"
    };
    const subs = {
      timed: "Choose a duration. Only the timer will show while you type.",
      letter: "Pick a time, then type. Results appear when the timer ends.",
      key: "Pick a time, then type. Results appear when the timer ends.",
      keyword: "Pick a time, then type. Results appear when the timer ends.",
      lesson: "Pick a time, then type. Results appear when the timer ends.",
      practice: "Pick a time, then type. Results appear when the timer ends."
    };
    if ($("setupTitle")) $("setupTitle").textContent = titles[settings.mode] || titles.timed;
    if ($("setupSub")) $("setupSub").textContent = subs[settings.mode] || subs.timed;
  }

  function paintSetupDurations() {
    const grid = $("setupDurations");
    if (!grid) return;
    grid.innerHTML = "";
    DURATIONS.forEach((item) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "duration-card" + (settings.duration === item.id ? " is-on" : "");
      const big = item.id < 60 ? String(item.id) : String(item.id / 60);
      const unit = item.id < 60 ? "seconds" : item.id === 60 ? "minute" : "minutes";
      b.innerHTML = "<strong>" + big + "</strong><span>" + unit + "</span>";
      b.addEventListener("click", () => {
        settings.duration = item.id;
        paintSetupDurations();
      });
      b.addEventListener("dblclick", () => startTest());
      grid.appendChild(b);
    });
    const picked = DURATIONS.find((d) => d.id === settings.duration);
    if ($("beginTestBtn")) $("beginTestBtn").textContent = "Start " + (picked ? picked.label : "") + " test";
  }

  function openTimedSetup(extra = {}) {
    Object.assign(settings, extra);
    if (!settings.mode) settings.mode = "timed";
    stopTicker();
    state = null;
    paintSetupDurations();
    updateSetupCopy();
    setTestPhase("setup");
    show("test");
  }

  function startTest(extra = {}) {
    Object.assign(settings, extra);
    stopTicker();
    state = Engine.create({ ...settings });
    lastResult = null;
    renderWords();
    if ($("liveWpm")) $("liveWpm").textContent = "0";
    if ($("liveAcc")) $("liveAcc").textContent = "100%";
    if ($("liveErr")) $("liveErr").textContent = "0";
    if ($("progressFill")) $("progressFill").style.width = "0%";
    if ($("focusVeil")) $("focusVeil").classList.remove("is-hidden");
    if ($("typeStage")) $("typeStage").classList.toggle("is-blind", !!settings.blind);
    if ($("testShell")) $("testShell").classList.add("is-exam");
    setTestPhase("run");
    updateTime();
    highlightGuide();
    show("test");
    setTimeout(() => { if ($("hiddenInput")) $("hiddenInput").focus(); }, 40);
  }

  function renderWords() {
    const box = $("words");
    if (!box || !state) return;
    box.innerHTML = "";
    let wi = -1;
    let wordEl = null;
    state.chars.forEach((c, i) => {
      if (c.word !== wi) {
        wi = c.word;
        wordEl = document.createElement("span");
        wordEl.className = "word";
        box.appendChild(wordEl);
      }
      const s = document.createElement("span");
      s.className = "ch";
      s.dataset.i = String(i);
      s.textContent = c.ch === " " ? "\u00a0" : c.ch;
      if (c.space) s.classList.add("space");
      wordEl.appendChild(s);
    });
    paintTyped();
  }

  function paintTyped() {
    if (!$("words") || !state) return;
    const nodes = $("words").querySelectorAll(".ch");
    nodes.forEach((n, i) => {
      n.classList.remove("ok", "bad", "cur");
      if (i < state.index) {
        const t = state.typed[i];
        n.classList.add(t && t.ok ? "ok" : "bad");
      } else if (i === state.index) {
        n.classList.add("cur");
      }
    });
    const cur = $("words").querySelector(".ch.cur") || $("words").querySelector(".ch:last-child");
    const caret = $("caret");
    const stage = $("typeStage");
    if (cur && caret && stage) {
      const cr = cur.getBoundingClientRect();
      const sr = stage.getBoundingClientRect();
      caret.style.transform = `translate(${cr.left - sr.left + stage.scrollLeft}px, ${cr.top - sr.top + stage.scrollTop}px)`;
      caret.style.height = cr.height + "px";
      const mid = sr.height / 2;
      const rel = cr.top - sr.top;
      if (rel > mid) stage.scrollTop += rel - mid;
    }
    highlightGuide();
  }

  function fingerFor(ch) {
    if (!ch) return "th";
    return KEY_MAP[ch.toLowerCase()] || KEY_MAP[ch] || "th";
  }

  function buildBoard(el, nextCh) {
    if (!el) return;
    el.innerHTML = "";
    const next = nextCh ? nextCh.toLowerCase() : "";
    KEY_ROWS.forEach((row) => {
      const r = document.createElement("div");
      r.className = "key-row";
      row.forEach((k) => {
        const b = document.createElement("span");
        const f = fingerFor(k);
        b.className = "key f-" + f + (k === " " ? " space-key" : "") + (k === "f" || k === "j" ? " is-home" : "");
        b.dataset.k = k;
        b.textContent = k === " " ? "space" : k;
        if (next === k || (next === " " && k === " ")) b.classList.add("is-next");
        r.appendChild(b);
      });
      el.appendChild(r);
    });
  }

  function highlightGuide() {
    if (!state) return;
    const target = state.chars[state.index];
    const ch = target ? target.ch : " ";
    const shown = ch === " " ? "␣" : ch;
    const f = fingerFor(ch);
    if ($("nextKeyBig")) $("nextKeyBig").textContent = shown === "␣" ? "SPC" : shown.toUpperCase();
    if ($("fingerName")) $("fingerName").textContent = FINGER_NAME[f] || "Thumb";
    if ($("fingerHint")) $("fingerHint").textContent = "Press with " + (FINGER_NAME[f] || "thumb") + " · keep F and J as home bumps";
    buildBoard($("liveBoard"), ch);
    document.querySelectorAll("#hands .finger").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.finger === f);
    });
  }

  function fmtTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return m + ":" + String(r).padStart(2, "0");
  }

  function updateTime() {
    if (!state) return;
    if (state.practice) {
      const elapsed = state.startedAt ? Date.now() - state.startedAt : 0;
      if ($("liveTime")) $("liveTime").textContent = fmtTime(elapsed);
      if ($("progressFill")) $("progressFill").style.width = "0%";
      return;
    }
    const left = Engine.remaining(state);
    if ($("liveTime")) $("liveTime").textContent = fmtTime(left);
    const pct = 100 - (left / (settings.duration * 1000)) * 100;
    if ($("progressFill")) $("progressFill").style.width = Math.min(100, Math.max(0, pct)) + "%";
  }

  function liveStats() {
    if (!state || !state.running) return;
    const st = Engine.stats(state);
    if ($("liveWpm")) $("liveWpm").textContent = String(st.net);
    if ($("liveAcc")) $("liveAcc").textContent = st.acc + "%";
    if ($("liveErr")) $("liveErr").textContent = String(st.errors);
  }

  function stopTicker() {
    if (ticker) clearInterval(ticker);
    ticker = null;
  }

  function beginTicker() {
    stopTicker();
    ticker = setInterval(() => {
      if (!state) return;
      const done = Engine.tick(state);
      updateTime();
      liveStats();
      drawSpark();
      if (done) onFinish();
    }, 200);
  }

  function onKey(e) {
    if ($("setupPanel") && !$("setupPanel").hidden) {
      if (e.key === "Enter") {
        e.preventDefault();
        startTest();
      }
      return;
    }
    if ($("testRun") && $("testRun").hidden) return;
    if (!state || state.finished) return;
    if (!views.test || !views.test.classList.contains("is-active")) return;
    if ($("authModal") && !$("authModal").hidden) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "TEXTAREA") return;
    if (tag === "INPUT" && e.target.id !== "hiddenInput") return;
    if (e.key === "Tab") return;
    if (e.key === "Escape") {
      e.preventDefault();
      openTimedSetup();
      return;
    }
    if (e.key === "Enter" && e.repeat) return;
    if (e.key.length === 1 || e.key === "Backspace") {
      e.preventDefault();
      if ($("focusVeil")) $("focusVeil").classList.add("is-hidden");
      if (!state.running) beginTicker();
      Engine.feed(state, e.key);
      if (soundOn && e.key.length === 1 && audio) audio.click();
      paintTyped();
      liveStats();
      if (state.finished) onFinish();
    }
  }

  function onFinish() {
    stopTicker();
    const st = Engine.stats(state);
    lastResult = st;
    $("resWpm").textContent = String(st.net);
    $("resGross").textContent = String(st.gross);
    $("resAcc").textContent = st.acc + "%";
    $("resChars").textContent = String(st.chars);
    $("resErr").textContent = String(st.errors);
    $("resCons").textContent = st.consistency + "%";
    $("resWords").textContent = String(st.correctWords);
    $("resGrade").textContent = st.grade;
    fillKeys($("slowKeys"), st.slow.map(([k, v]) => [k === " " ? "space" : k, Math.round(v) + " ms"]));
    fillKeys($("missKeys"), st.missed.map(([k, v]) => [k === " " ? "space" : k, v + " misses"]));
    drawChart($("wpmChart"), st.samples.map((s) => s.wpm), st.samples.map((s) => s.t));
    drawKeyboard(state);
    saveHistory({
      at: Date.now(),
      duration: settings.duration,
      mode: settings.mode === "timed" ? settings.collection : settings.mode,
      wpm: st.net,
      acc: st.acc,
      errors: st.errors
    });
    show("results");
  }

  function fillKeys(el, rows) {
    if (!el) return;
    el.innerHTML = "";
    if (!rows.length) {
      el.innerHTML = "<li>None yet</li>";
      return;
    }
    rows.forEach(([k, v]) => {
      const li = document.createElement("li");
      li.innerHTML = `<code>${escapeHtml(k)}</code><span>${escapeHtml(String(v))}</span>`;
      el.appendChild(li);
    });
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function drawChart(canvas, values, times) {
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = getCss("--white") || "#ffffff";
    ctx.fillRect(0, 0, w, h);
    if (!values.length) return;
    const max = Math.max(20, ...values) * 1.15;
    ctx.strokeStyle = getCss("--line");
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 24 + ((h - 48) * i) / 4;
      ctx.beginPath();
      ctx.moveTo(48, y);
      ctx.lineTo(w - 16, y);
      ctx.stroke();
      ctx.fillStyle = getCss("--muted");
      ctx.font = "12px DM Sans, sans-serif";
      ctx.fillText(String(Math.round(max - (max * i) / 4)), 8, y + 4);
    }
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = 48 + ((w - 64) * i) / Math.max(values.length - 1, 1);
      const y = 24 + (h - 48) * (1 - v / max);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = getCss("--blue") || "#2f6bff";
    ctx.lineWidth = 2.4;
    ctx.stroke();
  }

  function drawSpark() {
    const canvas = $("sparkCanvas");
    if (!canvas) return;
    if (!state || !state.samples.length) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }
    drawChart(canvas, state.samples.map((s) => s.wpm), state.samples.map((s) => s.t));
  }

  function drawKeyboard(st) {
    const wrap = $("keyboard");
    if (!wrap || !st) return;
    wrap.innerHTML = "";
    const heat = {};
    Object.entries(st.misses).forEach(([k, n]) => {
      heat[k] = n;
    });
    const max = Math.max(1, ...Object.values(heat), 1);
    Engine.KEY_LAYOUT.forEach((row) => {
      const r = document.createElement("div");
      r.className = "key-row";
      [...row].forEach((k) => {
        const b = document.createElement("span");
        b.className = "key" + (k === " " ? " space-key" : "");
        b.textContent = k === " " ? "space" : k;
        const n = heat[k] || 0;
        const a = n / max;
        b.style.background = `rgba(232, 93, 58, ${0.08 + a * 0.72})`;
        r.appendChild(b);
      });
      wrap.appendChild(r);
    });
  }

  function getCss(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim() || "#2f6bff";
  }

  function makeAudio() {
    let ctx = null;
    function click() {
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "square";
        o.frequency.value = 410;
        g.gain.value = 0.03;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
        o.stop(ctx.currentTime + 0.03);
      } catch {}
    }
    return { click };
  }

  function downloadCert() {
    if (!lastResult) return;
    const c = $("certCanvas");
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#1a1612";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#c45c32";
    ctx.lineWidth = 8;
    ctx.strokeRect(36, 36, c.width - 72, c.height - 72);
    ctx.strokeStyle = "#e8dcc8";
    ctx.lineWidth = 1;
    ctx.strokeRect(52, 52, c.width - 104, c.height - 104);
    ctx.fillStyle = "#e8dcc8";
    ctx.font = "28px Cormorant Garamond, serif";
    ctx.textAlign = "center";
    ctx.fillText("TYPEMASTER CERTIFICATE", c.width / 2, 160);
    ctx.font = "italic 64px Cormorant Garamond, serif";
    ctx.fillStyle = "#f4eee4";
    ctx.fillText("Typing Proficiency", c.width / 2, 260);
    ctx.font = "22px DM Sans, sans-serif";
    ctx.fillStyle = "#b9a992";
    ctx.fillText("This certifies a completed timed examination", c.width / 2, 330);
    ctx.fillStyle = "#c45c32";
    ctx.font = "120px Cormorant Garamond, serif";
    ctx.fillText(String(lastResult.net), c.width / 2, 500);
    ctx.fillStyle = "#e8dcc8";
    ctx.font = "28px DM Sans, sans-serif";
    ctx.fillText("NET WORDS PER MINUTE", c.width / 2, 550);
    ctx.font = "20px DM Sans, sans-serif";
    ctx.fillStyle = "#b9a992";
    ctx.fillText(
      `Accuracy ${lastResult.acc}%   ·   Grade ${lastResult.grade}   ·   ${settings.duration}s   ·   ${new Date().toLocaleDateString()}`,
      c.width / 2,
      640
    );
    ctx.fillText("Generated locally by TypeMaster", c.width / 2, 780);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "typemaster-certificate.png";
    a.click();
  }

  function paintLessons() {
    const grid = $("lessonGrid");
    if (!grid) return;
    grid.innerHTML = "";
    LESSONS.forEach((L) => {
      const card = document.createElement("button");
      card.className = "lesson-card";
      card.innerHTML = `<strong>${L.title}</strong><span>${L.keys}</span><em>45 second drill</em>`;
      card.addEventListener("click", () => {
        openTimedSetup({
          mode: "lesson",
          duration: 45,
          lessonPrompt: L.prompt,
          collection: "easy",
          punctuation: false,
          numbers: false
        });
      });
      grid.appendChild(card);
    });
  }

  function startDrill(mode, prompt, duration) {
    openTimedSetup({
      mode,
      duration: duration || 60,
      lessonPrompt: prompt,
      collection: "easy",
      punctuation: false,
      numbers: false,
      blind: false
    });
  }

  function paintKeysPage() {
    const letters = $("letterGrid");
    if (!letters || !$("keyDrillGrid") || !$("keywordGrid")) return;
    letters.innerHTML = "";
    "abcdefghijklmnopqrstuvwxyz".split("").forEach((ch) => {
      const b = document.createElement("button");
      b.className = "letter-btn";
      b.textContent = ch.toUpperCase();
      b.title = FINGER_NAME[fingerFor(ch)];
      b.addEventListener("click", () => {
        const burst = Array(80).fill(ch).join(" ");
        startDrill("letter", burst, 30);
      });
      letters.appendChild(b);
    });
    const keyGrid = $("keyDrillGrid");
    keyGrid.innerHTML = "";
    KEY_DRILLS.forEach((d) => {
      const card = document.createElement("button");
      card.className = "lesson-card";
      card.innerHTML = `<strong>${d.title}</strong><span>${d.keys}</span><em>Key test</em>`;
      card.addEventListener("click", () => startDrill("key", d.prompt, 45));
      keyGrid.appendChild(card);
    });
    const wordGrid = $("keywordGrid");
    wordGrid.innerHTML = "";
    KEYWORD_DRILLS.forEach((d) => {
      const card = document.createElement("button");
      card.className = "lesson-card";
      card.innerHTML = `<strong>${d.title}</strong><span>${d.keys}</span><em>Keyword test</em>`;
      card.addEventListener("click", () => startDrill("keyword", d.prompt, 60));
      wordGrid.appendChild(card);
    });
    buildBoard($("keysPreviewBoard"), "f");
    const legend = $("fingerLegend");
    if (legend) {
      legend.innerHTML = Object.entries(FINGER_NAME)
        .map(([, name]) => `<span><b></b>${name}</span>`)
        .join("");
    }
  }

  function paintFaq() {
    const box = $("faqList");
    if (!box) return;
    box.innerHTML = "";
    FAQ.forEach((item) => {
      const d = document.createElement("details");
      d.innerHTML = `<summary>${item.q}</summary><p>${item.a}</p>`;
      box.appendChild(d);
    });
  }

  function paintHistory() {
    const list = history();
    const sum = $("historySummary");
    if (!sum) return;
    if (!list.length) {
      sum.innerHTML = "<p class='lede'>No tests yet. Run one from Home.</p>";
      if ($("histBody")) $("histBody").innerHTML = "";
      drawChart($("histChart"), [], []);
      return;
    }
    const best = Math.max(...list.map((x) => x.wpm));
    const avg = Math.round(list.reduce((a, b) => a + b.wpm, 0) / list.length);
    const acc = Math.round(list.reduce((a, b) => a + b.acc, 0) / list.length);
    sum.innerHTML = `
      <div class="result-cell"><span>Best</span><strong>${best}</strong></div>
      <div class="result-cell"><span>Average WPM</span><strong>${avg}</strong></div>
      <div class="result-cell"><span>Average accuracy</span><strong>${acc}%</strong></div>
      <div class="result-cell"><span>Sessions</span><strong>${list.length}</strong></div>`;
    const recent = list.slice(0, 20).reverse();
    drawChart($("histChart"), recent.map((x) => x.wpm), recent.map((x) => x.at));
    if ($("histBody")) $("histBody").innerHTML = list
      .slice(0, 40)
      .map((x) => {
        const d = new Date(x.at);
        return `<tr><td>${d.toLocaleString()}</td><td>${x.duration}s</td><td>${escapeHtml(String(x.mode))}</td><td>${x.wpm}</td><td>${x.acc}%</td><td>${x.errors}</td></tr>`;
      })
      .join("");
  }

  function bind() {
    chips($("durationChips"), DURATIONS, "duration", updatePreview);
    chips($("difficultyChips"), DIFFS, "difficulty", () => {
      settings.collection = settings.difficulty;
      chips($("collectionChips"), COLLECTIONS, "collection", updatePreview);
      updatePreview();
    });
    chips($("collectionChips"), COLLECTIONS, "collection", updatePreview);
    document.querySelectorAll("[data-opt]").forEach((b) => {
      b.addEventListener("click", () => {
        const k = b.dataset.opt;
        settings[k] = !settings[k];
        b.classList.toggle("is-on", settings[k]);
        updatePreview();
      });
    });
    document.querySelectorAll("[data-nav]").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const name = el.dataset.nav;
        if (name === "history") paintHistory();
        if (name === "practice" || name === "keys" || name === "lessons") paintKeysPage();
        if (name === "test") {
          openTimedSetup({ mode: "timed" });
          return;
        }
        show(name);
      });
    });
    document.querySelectorAll("[data-quick]").forEach((b) => {
      b.addEventListener("click", () => openTimedSetup({ mode: "timed", duration: Number(b.dataset.quick) }));
    });
    if ($("heroStart")) $("heroStart").addEventListener("click", () => openTimedSetup({ mode: "timed", duration: 60 }));
    if ($("customStart")) $("customStart").addEventListener("click", () => openTimedSetup({ mode: "timed" }));
    if ($("beginTestBtn")) $("beginTestBtn").addEventListener("click", () => startTest());
    if ($("restartBtn")) $("restartBtn").addEventListener("click", () => openTimedSetup());
    if ($("retryBtn")) $("retryBtn").addEventListener("click", () => openTimedSetup());
    if ($("newTestBtn")) $("newTestBtn").addEventListener("click", () => show("home"));
    if ($("certBtn")) $("certBtn").addEventListener("click", downloadCert);
    if ($("practiceStart")) $("practiceStart").addEventListener("click", () => {
      openTimedSetup({
        mode: "practice",
        duration: 60,
        customText: ($("customText") && $("customText").value) || "",
        collection: "mixed"
      });
    });
    document.querySelectorAll("[data-practice]").forEach((b) => {
      b.addEventListener("click", () => {
        settings.practice = b.dataset.practice;
        document.querySelectorAll("[data-practice]").forEach((x) => x.classList.toggle("is-on", x === b));
      });
    });
    if ($("wordTestBtn")) {
      $("wordTestBtn").addEventListener("click", () => startDrill("keyword", KEYWORD_DRILLS[2].prompt, 60));
    }
    if ($("levelBtn")) {
      $("levelBtn").addEventListener("click", () => openTimedSetup({ mode: "timed", duration: 60 }));
    }
    const modal = $("authModal");
    function openAuth(title) {
      if ($("authTitle")) $("authTitle").textContent = title;
      if (modal) modal.hidden = false;
    }
    if ($("loginBtn")) $("loginBtn").addEventListener("click", () => openAuth("Login"));
    if ($("signupBtn")) $("signupBtn").addEventListener("click", () => openAuth("Sign Up"));
    if ($("authClose")) $("authClose").addEventListener("click", () => { if (modal) modal.hidden = true; });
    if ($("authSave")) $("authSave").addEventListener("click", () => {
      const name = ($("authName") && $("authName").value.trim()) || "Guest";
      localStorage.setItem("typefast-user", name);
      if ($("loginBtn")) $("loginBtn").textContent = name;
      if (modal) modal.hidden = true;
    });
    if ($("typeStage")) {
      $("typeStage").addEventListener("click", () => {
        if ($("focusVeil")) $("focusVeil").classList.add("is-hidden");
        if ($("hiddenInput")) $("hiddenInput").focus();
      });
    }
    if ($("hiddenInput")) {
      $("hiddenInput").addEventListener("input", () => { $("hiddenInput").value = ""; });
      $("hiddenInput").addEventListener("focus", () => {
        if ($("focusVeil")) $("focusVeil").classList.add("is-hidden");
      });
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("hashchange", () => {
      const raw = (location.hash || "#home").replace("#", "") || "home";
      const map = { about: "faq", leaderboard: "history", lessons: "practice", keys: "practice" };
      const name = map[raw] || raw;
      if (name === "test") {
        openTimedSetup({ mode: "timed" });
        return;
      }
      if (name === "history") paintHistory();
      if (name === "practice") paintKeysPage();
      show(name, { silentHash: true });
    });
  }

  try { paintSetupDurations(); } catch (err) {}
  try { paintLessons(); } catch (err) {}
  try { paintKeysPage(); } catch (err) {}
  try { paintFaq(); } catch (err) {}
  try { paintHero(); } catch (err) {}
  try { updatePreview(); } catch (err) {}
  try { bind(); } catch (err) {}
  const savedUser = localStorage.getItem("typefast-user");
  if (savedUser && $("loginBtn")) $("loginBtn").textContent = savedUser;
  const bootHash = (location.hash || "").replace("#", "");
  if (bootHash && bootHash !== "home") {
    const map = { about: "faq", leaderboard: "history", lessons: "practice", keys: "practice" };
    const name = map[bootHash] || bootHash;
    if (name === "test") openTimedSetup({ mode: "timed" });
    else {
      if (name === "history") paintHistory();
      if (name === "practice") paintKeysPage();
      show(name, { silentHash: true });
    }
  } else {
    applySeo("home");
  }
})();
