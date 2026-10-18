(() => {
  const DURATIONS = [
    { id: 30, label: "30s" },
    { id: 45, label: "45s" },
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
  let currentPrac = "letter";
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
      path: "/typing-test/",
      hash: "test"
    },
    results: {
      title: "Typing Test Results | TypeFast WPM Score",
      desc: "See your net WPM, accuracy, errors, consistency and a keyboard heatmap after finishing a TypeFast typing test.",
      path: "/typing-test/",
      hash: "results"
    },
    practice: {
      title: "Typing Practice — Letters, Keys and Keywords | TypeFast",
      desc: "Practice typing with letter drills, key tests, keyword lessons and custom text. Learn the right finger for every key.",
      path: "/practice/",
      hash: "practice"
    },
    letter: {
      title: "Letter Typing Practice | TypeFast",
      desc: "Practice one letter at a time on a live keyword layout and learn the right finger for every key.",
      path: "/practice/",
      hash: "practice-letter"
    },
    key: {
      title: "Key Typing Tests | TypeFast",
      desc: "Practice home-row and key-group drills with a timed typing test.",
      path: "/practice/",
      hash: "practice-key"
    },
    keyword: {
      title: "Keyword Typing Tests | TypeFast",
      desc: "Practice common word sets and improve accuracy with timed keyword tests.",
      path: "/practice/",
      hash: "practice-keyword"
    },
    lesson: {
      title: "Guided Typing Lessons | TypeFast",
      desc: "Follow guided typing lessons from home row to full keyboard.",
      path: "/practice/",
      hash: "practice-lesson"
    },
    custom: {
      title: "Custom Text Typing Practice | TypeFast",
      desc: "Paste your own passage or practice random words, quotes and code.",
      path: "/practice/",
      hash: "practice-custom"
    },
    history: {
      title: "Typing Leaderboard and History | TypeFast",
      desc: "Track your typing scores locally. Compare WPM, accuracy and errors across timed tests on this device.",
      path: "/leaderboard/",
      hash: "leaderboard"
    },
    faq: {
      title: "About TypeFast — Typing Test FAQ",
      desc: "Learn how WPM is measured, what a good typing speed is, and how TypeFast helps you type faster with free tests and drills.",
      path: "/about/",
      hash: "about"
    }
  };

  const SITE_ORIGIN = (typeof window !== "undefined" && window.__SITE_ORIGIN__)
    || ((location.origin && location.origin !== "null") ? location.origin : "https://example.com");

  const PATH_ROUTES = {
    "/": "home",
    "/typing-test": "test",
    "/practice": "practice",
    "/leaderboard": "history",
    "/about": "faq"
  };

  function routeFromPath() {
    let path = location.pathname || "/";
    if (!path.endsWith("/")) path += "/";
    path = path.replace(/\/+$/, "/");
    return PATH_ROUTES[path] || (PATH_ROUTES[path.replace(/\/$/, "")] || "home");
  }

  function pathFor(name) {
    return (SEO[name] && SEO[name].path) || "/";
  }

  function urlFor(name) {
    if (typeof PRAC_COPY !== "undefined" && PRAC_COPY[name]) return "/practice/?mode=" + name;
    return pathFor(name);
  }

  function navigate(path) {
    if (!path) return;
    if (location.pathname + location.search === path) return;
    try {
      history.pushState(null, "", path);
    } catch (err) {
      location.hash = path;
    }
  }

  function navigated() {
    const name = routeFromPath();
    const params = new URLSearchParams(location.search);
    if (name === "test") { openTimedSetup({ mode: "timed" }); return; }
    if (name === "history") paintHistory();
    if (name === "practice") {
      paintKeysPage();
      show(name, { silentHash: true });
      const pane = params.get("mode");
      showPracPane(pane && PRAC_COPY[pane] ? pane : currentPrac || "letter", { keepUrl: true });
      return;
    }
    show(name, { silentHash: true });
  }

  function applySeo(name) {
    const page = SEO[name] || SEO.home;
    const origin = SITE_ORIGIN;
    const url = origin + (page.path === "/" ? "/" : page.path);
    document.title = page.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", page.desc);
    const set = (id, attr, val) => { const el = $(id); if (el) el.setAttribute(attr, val); };
    set("canonicalLink", "href", url);
    set("ogTitle", "content", page.title);
    set("ogDesc", "content", page.desc);
    set("ogUrl", "content", url);
    set("ogImage", "content", origin + "/og-image.png");
    set("twTitle", "content", page.title);
    set("twDesc", "content", page.desc);
    set("twImage", "content", origin + "/og-image.png");
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
    const map = { lessons: "practice", keys: "practice", about: "faq", leaderboard: "history", letter: "practice", key: "practice", keyword: "practice", lesson: "practice", custom: "practice", "practice-letter": "practice", "practice-key": "practice", "practice-keyword": "practice", "practice-lesson": "practice", "practice-custom": "practice" };
    name = map[name] || name;
    if (!views[name]) name = "home";
    Object.values(views).forEach((v) => v && v.classList.remove("is-active"));
    document.querySelectorAll(".nav-btn").forEach((b) => {
      const n = b.dataset.nav;
      const fromPractice = ["letter", "key", "keyword", "lesson", "practice"].includes(settings.mode);
      let active = n === name;
      if (name === "test" || name === "results") {
        active = fromPractice ? n === "practice" : n === "test";
      }
      b.classList.toggle("is-active", active);
    });
    const view = views[name] || views.home;
    view.classList.add("is-active");
    document.body.classList.toggle("is-exam", name === "test" && views.test && views.test.classList.contains("is-exam"));
    if (name !== "practice") hideKwStage();
    applySeo(name);
    if (!opts.silentHash) navigate(pathFor(name));
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

  function readHistory() {
    try {
      return JSON.parse(localStorage.getItem(storeKey) || "[]");
    } catch {
      return [];
    }
  }

  function saveHistory(entry) {
    const list = readHistory();
    list.unshift(entry);
    localStorage.setItem(storeKey, JSON.stringify(list.slice(0, 80)));
    paintHero();
  }

  function paintHero() {
    const list = readHistory();
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

  const STUDIO_TEXT = "The quick brown fox jumps over the lazy dog.";
  const studio = { text: STUDIO_TEXT, typed: "", started: false, done: false, t0: 0, left: 60, timer: null };

  function studioFmt(sec) {
    const s = Math.max(0, Math.floor(sec));
    if (s < 60) return "00:" + String(s).padStart(2, "0");
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function buildStudioBoard(el, nextCh) {
    if (!el) return;
    el.innerHTML = "";
    const next = nextCh ? nextCh.toLowerCase() : "";
    const rows = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
      ["z", "x", "c", "v", "b", "n", "m"]
    ];
    rows.forEach((row, ri) => {
      const r = document.createElement("div");
      r.className = "key-row";
      if (ri === 2) {
        const sh = document.createElement("span");
        sh.className = "key shift-key";
        sh.dataset.k = "shift";
        sh.textContent = "Shift";
        r.appendChild(sh);
      }
      row.forEach((k) => {
        const b = document.createElement("span");
        const f = fingerFor(k);
        b.className = "key f-" + f;
        b.dataset.k = k;
        if ("asdf".indexOf(k) >= 0) b.classList.add("home-l");
        if ("jkl;".indexOf(k) >= 0) b.classList.add("home-r");
        b.textContent = k;
        if (next === k) b.classList.add("is-next");
        r.appendChild(b);
      });
      if (ri === 0) {
        const bk = document.createElement("span");
        bk.className = "key back-key";
        bk.dataset.k = "backspace";
        bk.textContent = "Backspace";
        r.appendChild(bk);
      }
      if (ri === 2) {
        const sh = document.createElement("span");
        sh.className = "key shift-key";
        sh.textContent = "Shift";
        sh.dataset.k = "shift";
        r.appendChild(sh);
      }
      el.appendChild(r);
    });
    const spaceRow = document.createElement("div");
    spaceRow.className = "key-row";
    const space = document.createElement("span");
    space.className = "key space-key";
    space.dataset.k = " ";
    space.textContent = "space";
    if (next === " " || next === "") space.classList.add("is-next");
    spaceRow.appendChild(space);
    el.appendChild(spaceRow);
  }

  function paintStudioPrompt() {
    const el = $("studioPrompt");
    if (!el) return;
    const t = studio.text;
    const typed = studio.typed;
    let html = "";
    for (let i = 0; i < t.length; i++) {
      let cls = "";
      if (i < typed.length) cls = typed[i] === t[i] ? "ok" : "bad";
      else if (i === typed.length) cls = "cur";
      html += "<span class=\"" + cls + "\">" + escapeHtml(t[i]) + "</span>";
    }
    el.innerHTML = html;
    const next = (t[typed.length] || " ").toLowerCase();
    buildStudioBoard($("studioBoard"), next);
    document.querySelectorAll(".hand-key").forEach((node) => {
      node.classList.toggle("is-on", node.textContent.toLowerCase() === next);
    });
  }

  function studioStats() {
    let ok = 0;
    for (let i = 0; i < studio.typed.length; i++) if (studio.typed[i] === studio.text[i]) ok++;
    const elapsed = studio.started ? Math.max(0.001, (Date.now() - studio.t0) / 1000) : 0;
    const wpm = elapsed ? Math.round((ok / 5) / (elapsed / 60)) : 0;
    const acc = studio.typed.length ? Math.round((ok / studio.typed.length) * 100) : 100;
    if ($("studioWpm")) $("studioWpm").textContent = String(wpm);
    if ($("studioAcc")) $("studioAcc").textContent = acc + "%";
    if ($("studioTime")) $("studioTime").textContent = studioFmt(studio.left);
  }

  function stopStudioTimer() {
    if (studio.timer) { clearInterval(studio.timer); studio.timer = null; }
  }

  function resetStudio() {
    stopStudioTimer();
    studio.typed = "";
    studio.started = false;
    studio.done = false;
    studio.t0 = 0;
    studio.left = Number(($("studioDur") && $("studioDur").value) || 60);
    if ($("studioInput")) $("studioInput").value = "";
    paintStudioPrompt();
    studioStats();
  }

  function startStudioTick() {
    if (studio.started || studio.done) return;
    studio.started = true;
    studio.t0 = Date.now();
    studio.timer = setInterval(() => {
      studio.left = Math.max(0, studio.left - 1);
      studioStats();
      if (studio.left <= 0) { studio.done = true; stopStudioTimer(); }
    }, 1000);
  }

  function bindStudio() {
    if (!$("studioPrompt")) return;
    paintStudioPrompt();
    studioStats();
    if ($("studioInput")) {
      $("studioInput").addEventListener("input", (e) => {
        if (studio.done) { e.target.value = studio.typed; return; }
        startStudioTick();
        studio.typed = e.target.value.slice(0, studio.text.length);
        if (studio.typed.length >= studio.text.length) { studio.done = true; stopStudioTimer(); }
        paintStudioPrompt();
        studioStats();
      });
    }
    if ($("studioReset")) $("studioReset").addEventListener("click", resetStudio);
    ["studioDiff", "studioText", "studioDur"].forEach((id) => {
      if (!$(id)) return;
      $(id).addEventListener("change", () => {
        if (id === "studioDiff") {
          settings.difficulty = $("studioDiff").value;
          settings.collection = $("studioDiff").value;
        }
        if (id === "studioText") {
          const v = $("studioText").value;
          const map = { normal: "medium", quotes: "pop", tech: "tech", nature: "nature" };
          settings.collection = map[v] || "medium";
          if (v === "quotes") settings.practice = "quotes";
        }
        if (id === "studioDur") settings.duration = Number($("studioDur").value);
        resetStudio();
      });
    });
    if ($("studioSettings")) {
      $("studioSettings").addEventListener("click", () => {
        openTimedSetup({
          mode: "timed",
          duration: Number(($("studioDur") && $("studioDur").value) || 60),
          difficulty: ($("studioDiff") && $("studioDiff").value) || "easy",
          collection: ($("studioDiff") && $("studioDiff").value) || "easy"
        });
      });
    }
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
    if (!views.test || !views.test.classList.contains("is-active")) return;
    if ($("setupPanel") && !$("setupPanel").hidden) {
      if (e.key === "Enter" && !e.repeat) {
        e.preventDefault();
        startTest();
      }
      return;
    }
    if ($("testRun") && $("testRun").hidden) return;
    if (!state || state.finished) return;
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
    ctx.fillText("TYPEFAST CERTIFICATE", c.width / 2, 160);
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
    ctx.fillText("Generated locally by TypeFast", c.width / 2, 780);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = "typefast-certificate.png";
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

  function wordsForLetter(ch) {
    const c = ch.toLowerCase();
    const extra = {
      q: ["quick", "quiet", "equal", "quote", "quest", "unique", "question", "quite", "require", "square"],
      x: ["next", "extra", "box", "text", "six", "example", "exact", "mixed", "index", "except"],
      z: ["size", "quiz", "zone", "zero", "haze", "puzzle", "freeze", "lazy", "amazing", "zebra"],
      j: ["just", "join", "major", "enjoy", "jump", "object", "project", "job", "juice", "adjust"],
      k: ["think", "like", "make", "know", "keep", "kind", "walk", "back", "work", "talk"],
      v: ["have", "very", "every", "over", "even", "live", "give", "never", "move", "leave"]
    };
    const hits = WORD_BANK.filter((w) => w.toLowerCase().includes(c));
    let pool = hits.concat(extra[c] || []);
    if (!pool.length) pool = [c + "at", c + "in", c + "ay", "the"];
    const out = [];
    for (let i = 0; i < 90; i++) out.push(pool[Math.floor(Math.random() * pool.length)]);
    return out.join(" ");
  }

  function paintKeysPage() {
    const letters = $("letterGrid");
    if (!letters || !$("keyDrillGrid") || !$("keywordGrid")) return;
    letters.innerHTML = "";
    "abcdefghijklmnopqrstuvwxyz".split("").forEach((ch) => {
      const samples = WORD_BANK.filter((w) => w.toLowerCase().includes(ch)).slice(0, 3);
      const preview = (samples.length ? samples : [ch + "at", ch + "in", ch + "ay"]).join(" ");
      const b = document.createElement("button");
      b.className = "lesson-card letter-card";
      b.dataset.letter = ch;
      b.innerHTML = "<strong>" + ch.toUpperCase() + "</strong><span>" + preview + "</span><em>Keyword drill</em>";
      b.title = FINGER_NAME[fingerFor(ch)];
      b.addEventListener("click", () => startKwLetter(ch));
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
    bindKwBoard();
    if (kw.letter) {
      showKwStage();
      paintKwPrompt();
    }
  }

  const kw = { letter: "", text: "The quick brown fox jumps over the lazy dog.", typed: "", index: 0 };

  const PRAC_COPY = {
    letter: { title: "Letter tests", sub: "Tap a letter. Then type its words on the keyword layout below." },
    key: { title: "Key tests", sub: "Pick a key group. Timed exam starts after you choose duration." },
    keyword: { title: "Keyword tests", sub: "Practice common word sets. Timed exam starts after you choose duration." },
    lesson: { title: "Guided lessons", sub: "Follow a lesson path. Timed exam starts after you choose duration." },
    custom: { title: "Custom text", sub: "Paste your own passage or start random words, quotes, or code." }
  };

  function showPracPane(id, opts = {}) {
    const pane = id && PRAC_COPY[id] ? id : "letter";
    currentPrac = pane;
    document.querySelectorAll(".prac-pane").forEach((el) => {
      const on = el.dataset.pracPane === pane;
      el.classList.toggle("is-on", on);
      el.hidden = !on;
    });
    document.querySelectorAll("[data-prac-go]").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.pracGo === pane);
    });
    const copy = PRAC_COPY[pane];
    if ($("pracHeading")) $("pracHeading").textContent = copy.title;
    if ($("pracSub")) $("pracSub").textContent = copy.sub;
    hideKwStage();
    if (!opts.keepUrl) navigate("/practice/?mode=" + pane);
    applySeo(pane);
  }

  function showKwStage() {
    const stage = $("kwStage");
    if (!stage) return;
    stage.hidden = false;
    stage.classList.remove("is-idle");
    document.body.classList.add("is-kw");
    window.scrollTo(0, 0);
  }

  function hideKwStage() {
    const stage = $("kwStage");
    if (stage) {
      stage.hidden = true;
      stage.classList.add("is-idle");
    }
    document.body.classList.remove("is-kw");
    kw.letter = "";
    document.querySelectorAll("#letterGrid .letter-card").forEach((el) => el.classList.remove("is-on"));
    document.querySelectorAll("#kwStage .kw-hands path.is-on").forEach((el) => el.classList.remove("is-on"));
  }

  function startKwLetter(ch) {
    const c = String(ch || "a").toLowerCase();
    kw.letter = c;
    kw.text = wordsForLetter(c);
    kw.typed = "";
    kw.index = 0;
    showKwStage();
    if ($("kwTitle")) $("kwTitle").textContent = "Letter " + c.toUpperCase();
    if ($("kwHint")) $("kwHint").textContent = "Type words with " + c.toUpperCase() + " on the keyword board";
    if ($("kwInput")) {
      $("kwInput").value = "";
      $("kwInput").focus();
    }
    document.querySelectorAll("#letterGrid .letter-card").forEach((el) => {
      el.classList.toggle("is-on", el.dataset.letter === c);
    });
    paintKwPrompt();
  }

  function paintKwPrompt() {
    const el = $("kwPrompt");
    if (!el) return;
    const t = kw.text;
    const start = Math.max(0, kw.index - 18);
    const shown = t.slice(start, start + 70);
    let html = "";
    for (let i = 0; i < shown.length; i++) {
      const abs = start + i;
      let cls = "";
      if (abs < kw.index) cls = kw.typed[abs] === t[abs] ? "ok" : "bad";
      else if (abs === kw.index) cls = "cur";
      html += "<span class=\"" + cls + "\">" + escapeHtml(shown[i]) + "</span>";
    }
    el.innerHTML = html;
    const next = (t[kw.index] || " ").toLowerCase();
    buildStudioBoard($("keysPreviewBoard"), next);
    paintKwFinger(next);
  }

  function paintKwFinger(next) {
    const f = fingerFor(next);
    document.querySelectorAll("#kwStage .kw-hands path").forEach((p) => {
      p.classList.toggle("is-on", !!f && p.dataset.finger === f);
    });
  }

  function feedKw(ch) {
    if (!kw.text) return;
    if (ch === "Backspace") {
      if (kw.index > 0) {
        kw.index -= 1;
        kw.typed = kw.typed.slice(0, kw.index);
      }
      paintKwPrompt();
      paintKwHit("backspace", true);
      return;
    }
    if (ch.length !== 1) return;
    kw.typed += ch;
    kw.index += 1;
    if (kw.index >= kw.text.length) {
      kw.text = wordsForLetter(kw.letter || "a");
      kw.typed = "";
      kw.index = 0;
    }
    paintKwPrompt();
    paintKwHit(ch, true);
  }

  function kwKeyNode(ch) {
    const board = $("keysPreviewBoard");
    if (!board || ch == null) return null;
    const k = String(ch).toLowerCase();
    if (k === "shift") return board.querySelector(".shift-key");
    if (k === "backspace") return board.querySelector(".back-key");
    if (k === " " || k === "space") return board.querySelector(".space-key");
    return board.querySelector('.key[data-k="' + k.replace(/"/g, "") + '"]');
  }

  function paintKwHit(ch, press) {
    const board = $("keysPreviewBoard");
    if (!board) return;
    const k = String(ch || "").toLowerCase();
    if (k === "shift") {
      board.querySelectorAll(".shift-key").forEach((el) => {
        el.classList.toggle("is-press", !!press);
      });
      return;
    }
    board.querySelectorAll(".key.is-press").forEach((el) => el.classList.remove("is-press"));
    const node = kwKeyNode(k);
    if (!node || !press) return;
    node.classList.add("is-press");
    setTimeout(() => node.classList.remove("is-press"), 160);
  }

  function onPracticeKey(e) {
    if (!views.practice || !views.practice.classList.contains("is-active")) return;
    if (e.key === "Escape" && kw.letter) {
      e.preventDefault();
      hideKwStage();
      return;
    }
    if (!kw.letter) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "TEXTAREA" || tag === "SELECT") return;
    if (tag === "INPUT" && e.target.id !== "kwInput") return;
    if (e.key === "Shift") {
      paintKwHit("shift", true);
      return;
    }
    if (e.key === "Backspace" || e.key.length === 1) {
      if (e.target && e.target.id === "kwInput") e.preventDefault();
      feedKw(e.key === "Backspace" ? "Backspace" : e.key);
    }
  }

  function bindKwBoard() {
    const board = $("keysPreviewBoard");
    if (!board || board.dataset.bound === "1") return;
    board.dataset.bound = "1";
    board.addEventListener("click", (e) => {
      const key = e.target.closest(".key");
      if (!key) return;
      const k = key.dataset.k || key.textContent.toLowerCase();
      if (k === "shift") paintKwHit("shift", true);
      else if (k === "backspace") feedKw("Backspace");
      else if (k === " " || k === "space") feedKw(" ");
      else if (kw.letter) feedKw(k);
      else paintKwHit(k === "space" ? " " : k, true);
    });
    if ($("kwBack")) $("kwBack").addEventListener("click", hideKwStage);
    if ($("kwInput")) {
      $("kwInput").addEventListener("focus", () => {
        if (!kw.letter) $("kwInput").blur();
      });
    }
    document.addEventListener("keydown", onPracticeKey);
    document.addEventListener("keyup", (e) => {
      if (!views.practice || !views.practice.classList.contains("is-active")) return;
      if (e.key === "Shift") paintKwHit("shift", false);
    });
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
    const list = readHistory();
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
        const link = el.tagName === "A";
        if (link && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
        e.preventDefault();
        const name = el.dataset.nav;
        if (name === "history") paintHistory();
        if (name === "practice" || name === "keys" || name === "lessons") {
          paintKeysPage();
          show(name, { silentHash: true });
          showPracPane(name === "keys" ? "key" : name === "lessons" ? "lesson" : currentPrac || "letter");
          return;
        }
        if (name === "test") {
          openTimedSetup({ mode: "timed" });
          return;
        }
        show(name);
      });
    });
    document.querySelectorAll("[data-prac-go]").forEach((el) => {
      el.addEventListener("click", (e) => {
        const link = el.tagName === "A";
        if (link && (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
        e.preventDefault();
        e.stopPropagation();
        paintKeysPage();
        show("practice", { silentHash: true });
        showPracPane(el.dataset.pracGo);
      });
    });
    document.querySelectorAll("[data-quick]").forEach((b) => {
      b.addEventListener("click", () => openTimedSetup({ mode: "timed", duration: Number(b.dataset.quick) }));
    });
    if ($("heroStart")) $("heroStart").addEventListener("click", () => {
      openTimedSetup({ mode: "timed", duration: 60, difficulty: "medium", collection: "medium" });
    });
    if ($("customStart")) $("customStart").addEventListener("click", () => openTimedSetup({ mode: "timed" }));
    if ($("beginTestBtn")) $("beginTestBtn").addEventListener("click", () => startTest());
    if ($("restartBtn")) $("restartBtn").addEventListener("click", () => openTimedSetup());
    if ($("retryBtn")) $("retryBtn").addEventListener("click", () => openTimedSetup());
    if ($("newTestBtn")) $("newTestBtn").addEventListener("click", () => show("home"));
    if ($("certBtn")) $("certBtn").addEventListener("click", downloadCert);
    if ($("practiceStart")) $("practiceStart").addEventListener("click", () => {
      const customText = ($("customText") && $("customText").value) || "";
      openTimedSetup({
        mode: "practice",
        duration: 60,
        customText,
        practice: customText.trim() ? "custom" : settings.practice,
        collection: "mixed"
      });
    });
    document.querySelectorAll("[data-practice]").forEach((b) => {
      b.addEventListener("click", () => {
        settings.practice = b.dataset.practice;
        document.querySelectorAll("[data-practice]").forEach((x) => x.classList.toggle("is-on", x === b));
      });
    });
    bindStudio();
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
    window.addEventListener("popstate", navigated);
    window.addEventListener("hashchange", () => {
      if (!location.hash || location.hash === "#") return;
      const target = urlFor(legacyHashToName(location.hash));
      history.replaceState(null, "", target);
      navigated();
    });
  }

  function legacyHashToName(hash) {
    const raw = (hash || "").replace(/^#/, "") || "home";
    const pane = raw.indexOf("practice-") === 0 ? raw.slice(9) : (raw === "keys" ? "key" : raw === "lessons" ? "lesson" : "");
    const map = {
      about: "faq", leaderboard: "history", lessons: "practice", keys: "practice",
      letter: "practice", key: "practice", keyword: "practice", lesson: "practice",
      custom: "practice", "practice-letter": "letter", "practice-key": "key",
      "practice-keyword": "keyword", "practice-lesson": "lesson", "practice-custom": "custom"
    };
    if (pane && PRAC_COPY[pane]) return pane;
    return map[raw] || raw;
  }

  try { paintSetupDurations(); } catch (err) {}
  try { paintLessons(); } catch (err) {}
  try { paintKeysPage(); } catch (err) {}
  try { paintFaq(); } catch (err) {}
  try { paintHero(); } catch (err) {}
  try { updatePreview(); } catch (err) {}
  try { bind(); } catch (err) {}
  const bootName = routeFromPath();
  const bootPane = new URLSearchParams(location.search).get("mode");
  const legacyHash = (location.hash || "").replace(/^#/, "");
  if (bootName === "home" && legacyHash && legacyHash !== "home") {
    history.replaceState(null, "", urlFor(legacyHashToName("#" + legacyHash)));
    navigated();
  } else if (bootName === "test") {
    openTimedSetup({ mode: "timed" });
  } else if (bootName === "history") {
    paintHistory();
    show("history", { silentHash: true });
  } else if (bootName === "practice") {
    paintKeysPage();
    show("practice", { silentHash: true });
    showPracPane(bootPane && PRAC_COPY[bootPane] ? bootPane : "letter", { keepUrl: true });
  } else {
    show(bootName, { silentHash: true });
  }
})();
