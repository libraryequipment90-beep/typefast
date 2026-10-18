const Engine = (() => {
  const KEY_LAYOUT = [
    "`1234567890-=",
    "qwertyuiop[]\\",
    "asdfghjkl;'",
    "zxcvbnm,./",
    " "
  ];

  function splitWords(text) {
    return text.replace(/\s+/g, " ").trim().split(" ");
  }

  function randomWords(n, extra = "") {
    const out = [];
    for (let i = 0; i < n; i++) {
      let w = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
      if (extra.includes("n") && Math.random() < 0.12) w += String(Math.floor(Math.random() * 90) + 10);
      if (extra.includes("p") && Math.random() < 0.14) {
        const p = [",", ".", ";", "?", "!"];
        w += p[Math.floor(Math.random() * p.length)];
      }
      out.push(w);
    }
    return out;
  }

  function passageFor(settings) {
    if (settings.mode === "lesson" || settings.mode === "letter" || settings.mode === "key" || settings.mode === "keyword") {
      const src = settings.lessonPrompt || "asdf";
      let words = splitWords(src);
      const need = Math.max(40, Math.ceil((settings.duration || 60) * 3));
      while (words.length < need) words = words.concat(splitWords(src));
      return words;
    }
    if (settings.mode === "practice") {
      if (settings.practice === "custom" && settings.customText.trim()) {
        return splitWords(settings.customText);
      }
      if (settings.practice === "quotes") {
        const q = [];
        while (q.join(" ").length < 1200) q.push(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        return splitWords(q.join(" "));
      }
      if (settings.practice === "code") {
        const q = [];
        while (q.join(" ").length < 900) q.push(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
        return splitWords(q.join(" "));
      }
      return randomWords(400, (settings.numbers ? "n" : "") + (settings.punctuation ? "p" : ""));
    }
    const extra = (settings.numbers ? "n" : "") + (settings.punctuation ? "p" : "");
    if (settings.collection === "easy" || settings.collection === "medium" || settings.collection === "hard") {
      const pool = CORPUS[settings.collection];
      let text = pool[Math.floor(Math.random() * pool.length)];
      if (settings.duration >= 180) text = pool.join(" ") + " " + pool[0];
      let words = splitWords(text);
      if (extra) {
        words = words.concat(randomWords(40, extra));
      }
      return words;
    }
    if (CORPUS[settings.collection]) {
      let words = splitWords(CORPUS[settings.collection]);
      const need = Math.max(80, Math.ceil(settings.duration * 4));
      while (words.length < need) words = words.concat(randomWords(40, extra));
      return words;
    }
    return randomWords(Math.max(220, Math.ceil(settings.duration * 4)), extra);
  }

  function create(settings) {
    const words = passageFor(settings);
    const chars = [];
    words.forEach((w, wi) => {
      for (let i = 0; i < w.length; i++) chars.push({ ch: w[i], word: wi, i });
      if (wi < words.length - 1) chars.push({ ch: " ", word: wi, i: w.length, space: true });
    });
    return {
      settings,
      words,
      chars,
      typed: [],
      index: 0,
      startedAt: 0,
      endedAt: 0,
      running: false,
      finished: false,
      errors: 0,
      samples: [],
      keyTimes: {},
      misses: {},
      lastKeyAt: 0,
      practice: false
    };
  }

  function remaining(state) {
    if (state.practice) return Infinity;
    const dur = state.settings.duration * 1000;
    if (!state.startedAt) return dur;
    return Math.max(0, dur - (Date.now() - state.startedAt));
  }

  function feed(state, key) {
    if (state.finished) return;
    if (key === "Backspace") {
      if (state.index > 0) {
        state.index -= 1;
        state.typed.pop();
      }
      return;
    }
    if (key.length !== 1) return;
    if (!state.running) {
      state.running = true;
      state.startedAt = Date.now();
      state.lastKeyAt = state.startedAt;
    }
    const target = state.chars[state.index];
    if (!target) {
      if (!state.practice) finish(state);
      return;
    }
    const now = Date.now();
    const dt = now - state.lastKeyAt;
    state.lastKeyAt = now;
    const ok = key === target.ch;
    const letter = target.ch.toLowerCase();
    if (!state.keyTimes[letter]) state.keyTimes[letter] = [];
    state.keyTimes[letter].push(dt);
    if (!ok) {
      state.errors += 1;
      state.misses[letter] = (state.misses[letter] || 0) + 1;
    }
    state.typed.push({ key, ok, t: now - state.startedAt });
    state.index += 1;
    if (!state.practice && state.index >= state.chars.length) finish(state);
  }

  function sample(state) {
    if (!state.running || state.finished) return;
    const elapsedMin = Math.max((Date.now() - state.startedAt) / 60000, 1 / 60000);
    const correct = state.typed.filter((t) => t.ok).length;
    const wpm = Math.round((correct / 5) / elapsedMin);
    state.samples.push({ t: Date.now() - state.startedAt, wpm, acc: accuracy(state) });
  }

  function accuracy(state) {
    if (!state.typed.length) return 100;
    const ok = state.typed.filter((t) => t.ok).length;
    return Math.max(0, Math.round((ok / state.typed.length) * 1000) / 10);
  }

  function stats(state) {
    const elapsedMs = (state.endedAt || Date.now()) - (state.startedAt || Date.now());
    const minutes = Math.max(elapsedMs / 60000, 1 / 60000);
    const typedChars = state.typed.length;
    const correct = state.typed.filter((t) => t.ok).length;
    const gross = (typedChars / 5) / minutes;
    const net = Math.max(0, (correct / 5) / minutes);
    const acc = accuracy(state);
    const wpmSeries = state.samples.map((s) => s.wpm);
    const mean = wpmSeries.length ? wpmSeries.reduce((a, b) => a + b, 0) / wpmSeries.length : net;
    const variance = wpmSeries.length
      ? wpmSeries.reduce((a, b) => a + (b - mean) ** 2, 0) / wpmSeries.length
      : 0;
    const consistency = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance))));
    const correctWords = countCorrectWords(state);
    const slow = Object.entries(state.keyTimes)
      .map(([k, arr]) => [k, arr.reduce((a, b) => a + b, 0) / arr.length])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
    const missed = Object.entries(state.misses).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const grade = gradeFor(net, acc);
    return {
      net: Math.round(net),
      gross: Math.round(gross),
      acc,
      chars: typedChars,
      errors: state.errors,
      consistency,
      correctWords,
      slow,
      missed,
      grade,
      elapsedMs,
      samples: state.samples.slice()
    };
  }

  function countCorrectWords(state) {
    let n = 0;
    let wi = 0;
    let wordOk = true;
    let started = false;
    for (let i = 0; i < state.index; i++) {
      const c = state.chars[i];
      const t = state.typed[i];
      if (!t) break;
      if (c.word !== wi) {
        if (started && wordOk) n += 1;
        wi = c.word;
        wordOk = true;
        started = false;
      }
      if (!c.space) {
        started = true;
        if (!t.ok) wordOk = false;
      }
    }
    if (started && wordOk && state.finished) n += 1;
    return n;
  }

  function gradeFor(wpm, acc) {
    const score = wpm * (acc / 100);
    if (score >= 100 && acc >= 98) return "S";
    if (score >= 80) return "A";
    if (score >= 60) return "B";
    if (score >= 40) return "C";
    if (score >= 25) return "D";
    return "E";
  }

  function finish(state) {
    if (state.finished) return;
    if (state.running && state.startedAt) sample(state);
    state.running = false;
    state.finished = true;
    state.endedAt = Date.now();
  }

  function tick(state) {
    if (!state.running || state.finished || state.practice) return false;
    if (remaining(state) <= 0) {
      finish(state);
      return true;
    }
    sample(state);
    return false;
  }

  return { KEY_LAYOUT, create, feed, remaining, stats, tick, sample, accuracy, finish };
})();
