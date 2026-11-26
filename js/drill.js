// 문장 연습(생활 영어 단원) — 영상 없이 기기 음성이 읽어 줍니다.
// 1단계 따라 치기: 문장을 읽어 주면 보고(또는 듣고) 따라 칩니다.
// 2단계 문답: 질문을 읽어 주면 ① 낱말 조각을 순서대로 맞추고 → ② 한글 뜻과 첫 글자만 보고 대답을 떠올려 칩니다.
// 채점·기록은 노래 연습과 같습니다(정확도 = 맞게 친 글자 ÷ 누른 글자, 틀린 칸에서 기다림).
(function () {
  const TT = (window.TT = window.TT || {});
  const { $, esc, toast } = TT.ui;

  let D = null; // 지금 하는 단원

  // ── 읽어 주기(기기에 들어 있는 영어 음성) ──
  const speech = { ok: "speechSynthesis" in window && "SpeechSynthesisUtterance" in window, voices: [] };
  function loadVoices() {
    if (!speech.ok) return;
    speech.voices = speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang));
  }
  if (speech.ok) {
    loadVoices();
    speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }
  // 자연스러운 음성을 먼저 고릅니다. 문답에서는 질문(A)과 대답(B)을 다른 목소리로 읽습니다.
  function pickVoice(second) {
    const all = speech.voices;
    if (!all.length) return null;
    const us = all.filter((v) => /en[-_]US/i.test(v.lang));
    const pool = us.length ? us : all;
    const score = (v) => (/natural|online|neural/i.test(v.name) ? 2 : 0) + (/google|aria|jenny|guy|samantha|ava|allison/i.test(v.name) ? 1 : 0);
    const sorted = pool.slice().sort((a, b) => score(b) - score(a));
    return second ? sorted[1] || sorted[0] : sorted[0];
  }
  function say(text, opts = {}) {
    if (!speech.ok || !text) return;
    const my = D;
    speechSynthesis.cancel();
    // cancel 바로 뒤의 speak가 씹히는 브라우저가 있어 아주 잠깐 쉬었다 읽습니다.
    setTimeout(() => {
      if (D !== my || !D) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      const v = pickVoice(opts.second);
      if (v) u.voice = v;
      u.rate = D.rate;
      // 낱말 읽기(quiet)는 짧아서 「읽어 주는 중」 표시를 바꾸지 않습니다.
      if (opts.quiet) { D.speaking = false; renderStatus(); speechSynthesis.speak(u); return; }
      u.onstart = () => { if (D === my) { D.speaking = true; renderStatus(); } };
      const end = () => { if (D === my) { clearTimeout(D.sayTimer); D.speaking = false; renderStatus(); } };
      u.onend = end;
      u.onerror = end;
      speechSynthesis.speak(u);
      // 끝났다는 신호를 주지 않는 기기도 있어, 넉넉한 예상 시간이 지나면 「읽어 주는 중」을 풉니다.
      clearTimeout(D.sayTimer);
      D.sayTimer = setTimeout(end, 2000 + (text.length * 90) / D.rate);
    }, 60);
  }
  function hush() {
    if (speech.ok) speechSynthesis.cancel();
    if (D) D.speaking = false;
  }

  // ── 낱말 조각 ──
  const norm = (w) => String(w || "").toLowerCase().replace(/[‘’]/g, "'").replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, "");
  // 대답 문장을 조각으로 나눕니다. 문장부호는 떼고, 문장 첫머리 낱말은 소문자로
  // (대문자가 정답 순서를 알려 주지 않게. I와 문장 중간의 고유명사 Monday 등은 그대로).
  function tilesOf(sentence) {
    const toks = TT.typing.normalizeText(sentence).split(" ");
    return toks.map((tok, i) => {
      let w = tok.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "");
      const starts = i === 0 || /[.!?]$/.test(toks[i - 1]);
      if (starts && !/^I($|')/.test(w)) w = w.charAt(0).toLowerCase() + w.slice(1);
      return w;
    }).filter(Boolean);
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ── 문제은행에서 고르기 ──
  // 따라 치기: 은행에서 pick.follow개를 무작위로 골라 은행 순서(쉬운 것 → 긴 것)대로.
  // 문답: 그날 따라 친 문장 가운데 pick.qa개를 골라 순서를 섞음(대답 = 몇 분 전에 익힌 문장).
  function choosePicks(lesson) {
    const bank = lesson.bank || [];
    const pick = lesson.pick || {};
    const nF = Math.min(pick.follow || 6, bank.length);
    const f = shuffle(bank.map((_, i) => i)).slice(0, nF).sort((a, b) => a - b);
    const withQa = f.filter((i) => bank[i].qa);
    const q = shuffle(withQa).slice(0, Math.min(pick.qa || 4, withQa.length));
    return { f, q };
  }
  const validPicks = (lesson, p) => p && Array.isArray(p.f) && Array.isArray(p.q) &&
    p.f.concat(p.q).every((i) => Number.isInteger(i) && lesson.bank && lesson.bank[i]);
  function itemsOf(lesson, picks) {
    const bank = lesson.bank || [];
    const out = [];
    picks.f.forEach((i) => { const b = bank[i]; out.push({ type: "follow", en: b.en, ko: b.ko, key: b.key, words: b.words || [] }); });
    // 문답의 대답 = 앞에서 따라 친 그 문장 그대로(같은 문장을 조각 맞추기 → 떠올려 치기로 복습)
    picks.q.forEach((i) => {
      const b = bank[i];
      out.push({ type: "qa", q: b.qa.q, en: b.en, ko: b.ko, key: b.key, decoys: b.qa.decoys || [], words: b.words || [] });
    });
    return out;
  }
  // 완료 화면의 「다시 보면 좋은 단어」에 뜻이 나오도록 단원 낱말을 모읍니다.
  function glossaryOf(lesson) {
    const g = [];
    (lesson.bank || []).forEach((b) => (b.words || []).forEach((w) => g.push(w)));
    return g;
  }

  function open(item, profile, opts = {}) {
    close();
    const lesson = item.lesson;
    const rec = TT.store.record(profile.id, item.videoId);
    // 이어서 할 때는 지난번에 고른 문장 그대로, 새로 할 때는 문제은행에서 새로 고릅니다.
    let cur = opts.resume && rec && rec.current && validPicks(lesson, rec.current.picks) ? rec.current : null;
    const picks = cur ? cur.picks : choosePicks(lesson);
    const items = itemsOf(lesson, picks);
    if (cur && cur.lineIndex >= items.length) cur = null;
    D = {
      item, lesson, profile, items, picks,
      song: { videoId: item.videoId, title: item.title, artist: item.artist, glossary: glossaryOf(lesson), lesson: true },
      idx: cur ? cur.lineIndex : 0,
      phase: "type", // type | tiles
      mode: TT.store.settings().mode === "listen" ? "listen" : "see",
      strict: !!profile.strict,
      rate: 0.9, started: false, speaking: false, reveal: false,
      engine: null, tiles: null, buf: "", tries: 0, busy: false,
      sess: cur
        ? { correct: cur.correct || 0, typed: cur.typed || 0, ms: cur.ms || 0, wrong: new Set(cur.wrongWords || []) }
        : { correct: 0, typed: 0, ms: 0, wrong: new Set() }
    };
    $("#qTitle").textContent = item.title || "";
    $("#qSubTitle").textContent = item.artist || "";
    $("#qPattern").innerHTML = `<b>${esc(lesson.pattern.en)}</b><span>${esc(lesson.pattern.ko)}</span>`;
    const nF = picks.f.length;
    const nQ = picks.q.length;
    $("#qStartNote").textContent = cur
      ? `${D.idx + 1}번째 문제부터 이어서 해요.`
      : `문장 ${(lesson.bank || []).length}개 중 오늘은 ${nF}개! ① 따라 치기 ${nF}문장 → ② 문답 ${nQ}개. 할 때마다 문장이 바뀌어요 🔊`;
    $("#qShield").classList.remove("started");
    $("#qStartCard").hidden = false;
    $("#qStart").disabled = false;
    hint(speech.ok ? "" : "이 기기는 읽어 주기를 할 수 없어요. 글자를 보고 따라 쳐요.", speech.ok ? "" : "warn");
    setItem(D.idx, { silent: true });
    setTimeout(() => { if (D) $("#qStart").focus(); }, 50);
  }

  function start() {
    if (!D || D.started) return;
    D.started = true;
    $("#qShield").classList.add("started");
    $("#qStartCard").hidden = true;
    if (speech.ok) {
      loadVoices();
      if (!speech.voices.length) toast("이 기기에서 영어 음성을 찾지 못했어요. 소리가 어색하면 글자를 보고 쳐요.", 4500);
    }
    speakCurrent();
    hint(D.items[D.idx].type === "follow" ? "읽어 주는 문장을 듣고 따라 쳐요. Enter를 누르면 다시 들려줘요." : "", "soft");
    renderStatus();
    focusInput();
  }

  function close() {
    if (!D) return;
    hush();
    clearTimeout(D.nextTimer);
    clearTimeout(D.sayTimer);
    D = null;
  }

  function exit() {
    if (!D) return;
    const n = D.idx;
    if (n > 0) saveProgress();
    close();
    TT.app.goSongs();
    if (n > 0) toast(`${n}문제까지 저장했어요. 다음에 이어서 할 수 있어요.`);
  }

  // ── 문제 하나 ──
  function setItem(i, opts = {}) {
    D.idx = i;
    const it = D.items[i];
    D.reveal = false;
    D.buf = "";
    D.tries = 0;
    D.busy = false;
    D.saidAt = -1;
    if (it.type === "qa") {
      D.phase = "tiles";
      const words = tilesOf(it.en);
      let bank = shuffle(words.concat(it.decoys).map((w, k) => ({ id: k, w, used: false })));
      // 우연히 정답 순서 그대로 섞이지 않게
      if (bank.slice(0, words.length).map((t) => t.w).join(" ") === words.join(" ")) bank = bank.slice(1).concat(bank[0]);
      D.tiles = { answer: words, bank, placed: [], wrongFrom: -1, glow: -1 };
      D.engine = null;
    } else {
      D.phase = "type";
      D.tiles = null;
      newEngine();
    }
    renderAll();
    if (!opts.silent) speakCurrent();
  }

  function speakCurrent() {
    if (!D || !D.started) return;
    const it = D.items[D.idx];
    if (it.type === "follow") say(it.en);
    else say(it.q.en);
  }

  function newEngine() {
    D.engine = new TT.typing.Engine(D.items[D.idx].en, D.strict);
  }

  function itemDone() {
    const e = D.engine;
    D.sess.correct += e.correct;
    D.sess.typed += e.typed;
    D.sess.ms += e.elapsedMs();
    e.wrongWords().forEach((w) => D.sess.wrong.add(w));
    D.lineDoneAt = Date.now();
    pulseDone();
    const it = D.items[D.idx];
    const nextI = D.idx + 1;
    if (nextI >= D.items.length) {
      D.idx = nextI;
      D.busy = true;
      hint("단원을 끝까지 했어요! 👏", "soft");
      clearTimeout(D.nextTimer);
      D.nextTimer = setTimeout(() => { if (D) finish(); }, 900);
      return;
    }
    D.idx = nextI;
    saveProgress();
    D.idx = nextI - 1;
    D.busy = true;
    const toQa = it.type === "follow" && D.items[nextI].type === "qa";
    hint(toQa ? "따라 치기를 마쳤어요! 이제 ② 문답: 방금 따라 친 문장으로 질문에 대답하며 복습해요." : it.type === "qa" ? "좋은 대답이에요! 🙂" : "잘했어요!", "soft");
    clearTimeout(D.nextTimer);
    // 마지막 낱말 읽기가 끝날 틈을 두고 다음 문제로 넘어갑니다.
    D.nextTimer = setTimeout(() => { if (D) setItem(nextI); }, toQa ? 1600 : 1000);
  }

  // ── 낱말 조각 맞추기 ──
  function placeTile(id) {
    const T = D.tiles;
    const t = T.bank.find((x) => x.id === id);
    if (!t || t.used || D.busy) return;
    t.used = true;
    T.placed.push(id);
    T.wrongFrom = -1;
    T.glow = -1;
    D.buf = "";
    renderTiles();
    renderTyped();
    if (T.placed.length === T.answer.length) checkTiles();
  }
  function unplaceTile(id) {
    const T = D.tiles;
    if (D.busy) return;
    const k = T.placed.indexOf(id);
    if (k < 0) return;
    T.placed.splice(k, 1);
    const t = T.bank.find((x) => x.id === id);
    if (t) t.used = false;
    T.wrongFrom = -1;
    renderTiles();
  }
  function checkTiles() {
    const T = D.tiles;
    const got = T.placed.map((id) => T.bank.find((x) => x.id === id).w);
    let k = 0;
    while (k < T.answer.length && norm(got[k]) === norm(T.answer[k])) k++;
    if (k >= T.answer.length) {
      // 맞혔어요: 대답을 다른 목소리로 읽어 주고, 떠올려 치기로 넘어갑니다.
      D.busy = true;
      T.done = true;
      renderTiles();
      hint("순서가 딱 맞아요! 이제 조각 없이 떠올려서 쳐 봐요.", "soft");
      say(D.items[D.idx].en, { second: true });
      clearTimeout(D.nextTimer);
      D.nextTimer = setTimeout(() => {
        if (!D) return;
        D.busy = false;
        D.phase = "type";
        newEngine();
        renderAll();
        focusInput();
      }, 1800);
      return;
    }
    D.tries++;
    T.wrongFrom = k;
    D.busy = true;
    renderTiles();
    hint(k === 0 ? "첫 조각부터 다시 생각해 봐요. 빨간 조각은 잠시 뒤 돌아가요." : `${k}번째 조각까지는 맞았어요! 빨간 조각부터 다시 골라 봐요.`, "help");
    clearTimeout(D.nextTimer);
    D.nextTimer = setTimeout(() => {
      if (!D || !D.tiles) return;
      // 틀린 곳부터 뒤의 조각을 바구니로 돌려보냅니다(맞은 앞부분은 그대로).
      T.placed.splice(k).forEach((id) => { const t = T.bank.find((x) => x.id === id); if (t) t.used = false; });
      T.wrongFrom = -1;
      // 두 번 넘게 틀리면 다음에 올 조각을 반짝여 알려 줍니다.
      if (D.tries >= 2) {
        const want = norm(T.answer[k]);
        const t = T.bank.find((x) => !x.used && norm(x.w) === want);
        T.glow = t ? t.id : -1;
        if (t) hint(`반짝이는 조각 ‘${t.w}’가 ${k + 1}번째예요.`, "help");
      }
      D.busy = false;
      renderTiles();
      focusInput();
    }, 1100);
  }
  // 자판으로도 조각을 고릅니다: 낱말을 치고 띄어쓰기(또는 Enter). 하나뿐이면 다 치는 순간 들어갑니다.
  function tileKey(ch) {
    const T = D.tiles;
    if (D.busy || T.done) return;
    if (ch === " ") { pickByBuffer(true); return; }
    if (/[ㄱ-ㆎ가-힣]/.test(ch)) { imeHint(); return; }
    D.buf += ch;
    const b = norm(D.buf);
    const free = T.bank.filter((x) => !x.used);
    if (!free.some((x) => norm(x.w).startsWith(b))) {
      flashWrong(ch);
      hint(`‘${D.buf}’(으)로 시작하는 조각이 없어요. 다시 쳐 봐요.`, "help");
      D.buf = "";
    } else {
      const exact = free.filter((x) => norm(x.w) === b);
      const longer = free.filter((x) => norm(x.w).startsWith(b) && norm(x.w) !== b);
      if (exact.length && !longer.length) { placeTile(exact[0].id); return; }
      hint("", "");
    }
    renderTyped();
  }
  function pickByBuffer(fromSpace) {
    const T = D.tiles;
    const b = norm(D.buf);
    if (!b) { if (!fromSpace) speakCurrent(); return; }
    const t = T.bank.find((x) => !x.used && norm(x.w) === b);
    if (t) placeTile(t.id);
    else {
      hint(`‘${D.buf}’ 조각이 없어요. 다시 쳐 봐요.`, "help");
      D.buf = "";
      renderTyped();
    }
  }
  function tileBackspace() {
    const T = D.tiles;
    if (D.busy || T.done) return;
    if (D.buf) D.buf = D.buf.slice(0, -1);
    else if (T.placed.length) { unplaceTile(T.placed[T.placed.length - 1]); return; }
    renderTyped();
  }

  // ── 타자 ──
  function onChar(ch) {
    if (!D) return;
    if (!D.started) { hint("먼저 [▶ 시작]을 눌러 주세요.", "warn"); return; }
    if (ch === "\n" || ch === "\r") return;
    if (D.phase === "tiles") { tileKey(ch); return; }
    if (/[ㄱ-ㆎ가-힣]/.test(ch)) { imeHint(); return; }
    if (D.busy || !D.engine || D.engine.done) return;
    const r = D.engine.input(ch);
    if (r.kind === "wrong") { flashWrong(ch); wrongHint(r); }
    else if (r.kind === "ok") { hint("", ""); sayTypedWord(); }
    renderLine();
    renderTyped();
    if (D.engine.done) itemDone();
  }
  // 따라 치기: 문장은 처음에 한 번 읽어 주고, 그 뒤로는 낱말 하나를 다 칠 때마다 그 낱말을 읽어 줍니다.
  function sayTypedWord() {
    const it = D.items[D.idx];
    if (!it || it.type !== "follow") return;
    const e = D.engine;
    const re = /[\p{L}\p{N}'’-]+/gu;
    let m, last = null;
    while ((m = re.exec(e.text))) {
      if (m.index + m[0].length <= e.pos) last = { at: m.index, w: m[0] };
      else break;
    }
    if (!last || last.at === D.saidAt) return;
    D.saidAt = last.at;
    const w = last.w.replace(/^['’-]+|['’-]+$/g, "");
    if (/[A-Za-z0-9]/.test(w)) say(w, { quiet: true });
  }
  function onEnter() {
    if (!D || !D.started) return;
    if (D.phase === "tiles" && D.buf) { pickByBuffer(false); return; }
    if (Date.now() - (D.lineDoneAt || 0) > 800) speakCurrent();
  }
  function onBackspace() {
    if (!D) return;
    if (D.phase === "tiles") { tileBackspace(); return; }
    backspaceHint();
  }

  function finish() {
    const s = D.sess;
    const acc = s.typed ? Math.round((s.correct / s.typed) * 1000) / 10 : 100;
    const wpm = s.ms > 0 ? Math.round(s.correct / 5 / (s.ms / 60000)) : 0;
    const result = {
      date: TT.ui.today(), accuracy: acc, wpm, seconds: Math.round(s.ms / 1000),
      lines: D.items.length, unit: "문제", wrongWords: Array.from(s.wrong)
    };
    const vid = D.item.videoId;
    const rec = TT.store.record(D.profile.id, vid) || {};
    const prev = rec.last || null;
    const best = rec.best || { accuracy: 0, wpm: 0 };
    TT.store.saveRecord(D.profile.id, vid, Object.assign({}, rec, {
      totalLines: D.items.length,
      linesDone: D.items.length,
      completed: true,
      completions: (rec.completions || 0) + 1,
      accuracy: acc,
      wpm,
      wrongWords: result.wrongWords,
      lastDate: result.date,
      current: null,
      last: result,
      best: { accuracy: Math.max(best.accuracy || 0, acc), wpm: Math.max(best.wpm || 0, wpm) },
      history: (rec.history || []).concat([{ date: result.date, accuracy: acc, wpm, seconds: result.seconds }]).slice(-20)
    }));
    const payload = { song: D.song, profile: D.profile, result, prev };
    TT.cloud.recordDone(Object.assign({ profileId: D.profile.id, nickname: D.profile.nickname, videoId: vid, title: D.item.title }, result));
    close();
    TT.app.showDone(payload);
  }

  // 문제를 마칠 때마다 저장해 두어, 창을 닫아도 이어서 할 수 있게 합니다.
  function saveProgress() {
    if (!D) return;
    const vid = D.item.videoId;
    const rec = TT.store.record(D.profile.id, vid) || {};
    const s = D.sess;
    TT.store.saveRecord(D.profile.id, vid, Object.assign({}, rec, {
      totalLines: D.items.length,
      linesDone: D.idx,
      completed: !!rec.completed,
      accuracy: s.typed ? Math.round((s.correct / s.typed) * 1000) / 10 : rec.accuracy,
      wpm: s.ms > 0 ? Math.round(s.correct / 5 / (s.ms / 60000)) : rec.wpm,
      wrongWords: Array.from(s.wrong),
      lastDate: TT.ui.today(),
      current: { lineIndex: D.idx, picks: D.picks, correct: s.correct, typed: s.typed, ms: Math.round(s.ms), wrongWords: Array.from(s.wrong) }
    }));
  }

  // ── 도구 버튼 ──
  // 문답: 대답(정답) 영어 문장을 대답 목소리로 들려줍니다.
  function sayAnswer() {
    if (!D || !D.started) return;
    const it = D.items[D.idx];
    if (!it || it.type !== "qa") return;
    say(it.en, { second: true });
    focusInput();
  }
  function toggleMode() {
    if (!D) return;
    D.mode = D.mode === "see" ? "listen" : "see";
    TT.store.saveSettings({ mode: D.mode });
    renderAll();
    toast(D.mode === "listen" ? "👂 듣고 치기: 따라 치기 문장이 가려져요. Enter로 다시 들어요." : "👀 보고 치기: 문장을 보며 쳐요.");
    focusInput();
  }
  function toggleReveal() {
    if (!D || D.phase !== "type" || D.items[D.idx].type !== "qa") return;
    D.reveal = !D.reveal;
    renderLine();
    renderTools();
    focusInput();
  }
  function toggleStrict() {
    if (!D) return;
    D.strict = !D.strict;
    D.profile.strict = D.strict;
    TT.store.updateProfile(D.profile.id, { strict: D.strict });
    if (D.engine && D.engine.typed === 0) { newEngine(); renderAll(); }
    else toast("다음 문제부터 바뀐 채점이 적용돼요.");
    renderTools();
    focusInput();
  }

  // ── 그리기 ──
  function renderAll() {
    renderCard();
    renderLine();
    renderTiles();
    renderTyped();
    renderStats();
    renderTools();
    renderStatus();
  }

  // 위쪽 카드(영상 자리): 단계 표시 + 들을 문장(따라 치기) 또는 질문 말풍선(문답)
  function renderCard() {
    const it = D.items[D.idx];
    if (!it) return;
    const nF = D.items.filter((x) => x.type === "follow").length;
    let html;
    if (it.type === "follow") {
      html = `<div class="lc-step"><span class="lc-badge">① 따라 치기</span><span>${D.idx + 1} / ${nF}</span></div>` +
        `<div class="lc-main"><span class="lc-speaker" aria-hidden="true">🔊</span><p class="lc-ko">${esc(it.ko)}</p></div>` +
        `<p class="lc-tip">핵심 표현 · <b>${esc(it.key)}</b></p>`;
    } else {
      const k = D.idx - nF + 1;
      const nQ = D.items.length - nF;
      const stepName = D.phase === "tiles" ? "조각 맞추기" : "떠올려 치기";
      html = `<div class="lc-step"><span class="lc-badge qa">② 문답 · ${stepName}</span><span>${k} / ${nQ}</span></div>` +
        `<div class="lc-bubble a"><span class="lc-who">A</span><span><span class="lc-en">${esc(it.q.en)}</span><span class="lc-ko small">${esc(it.q.ko)}</span></span></div>` +
        `<div class="lc-bubble b"><span><span class="lc-ko">${esc(it.ko)}</span><span class="lc-en small">${D.phase === "tiles" ? "방금 따라 친 문장을 조각으로 맞춰요" : "방금 맞춘 문장을 떠올려 쳐요"}</span></span><span class="lc-who">나</span></div>`;
    }
    $("#qCard").innerHTML = html;
  }

  function charHtml(i, e, hide) {
    const ch = e.text[i];
    let cls = "c " + e.state[i];
    if (i === e.pos) cls += " cur";
    if (e.lastWrong && e.lastWrong.at === i) cls += " err";
    if (ch === " ") cls += " sp";
    if (hide && hide(i) && i >= e.pos && /[\p{L}\p{N}]/u.test(ch)) cls += " hid";
    return `<span class="${cls}">${ch === " " ? " " : esc(ch)}</span>`;
  }

  // 아래쪽 자막 자리: 칠 문장(핵심 표현 밑줄, 어려운 낱말 아래 한글 뜻)
  function renderLine() {
    const it = D.items[D.idx];
    const sub = $("#qSub");
    if (!it || D.phase === "tiles" || !D.engine) {
      $("#qLine").innerHTML = "";
      sub.textContent = it && D.phase === "tiles" ? "🧩 조각을 눌러(또는 낱말을 치고 띄어쓰기) 순서대로 놓아요" : "";
      return;
    }
    const e = D.engine;
    const t = e.text;
    // 핵심 표현 위치(대소문자 무시)
    const kAt = it.key ? t.toLowerCase().indexOf(TT.typing.normalizeText(it.key).toLowerCase()) : -1;
    const kEnd = kAt >= 0 ? kAt + TT.typing.normalizeText(it.key).length : -1;
    let hide = null;
    if (it.type === "follow" && D.mode === "listen") hide = () => true;
    if (it.type === "qa" && !D.reveal) {
      // 낱말의 첫 글자만 보여 줍니다.
      hide = (i) => i > 0 && /[\p{L}\p{N}'’]/u.test(t[i - 1]);
    }
    const re = /[\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+/gu;
    let html = "";
    let m;
    while ((m = re.exec(t))) {
      const seg = m[0];
      const s = m.index;
      let chars = "";
      for (let k = 0; k < seg.length; k++) chars += charHtml(s + k, e, hide);
      const inKey = kAt >= 0 && s >= kAt && s < kEnd;
      if (/[\p{L}\p{N}]/u.test(seg)) {
        const ko = TT.typing.meaningFor(seg, { words: it.words }, D.song);
        const show = ko && (!hide || e.pos >= s + seg.length);
        html += `<span class="w${inKey ? " key" : ""}"><span class="en">${chars}</span>${show ? `<span class="ko">${esc(ko)}</span>` : ""}</span>`;
      } else {
        html += inKey && s + seg.length <= kEnd ? `<span class="keysp">${chars}</span>` : chars;
      }
    }
    $("#qLine").innerHTML = html;
    sub.textContent = it.type === "qa"
      ? (D.reveal ? "💡 정답을 보며 쳐요" : "첫 글자만 보여요. 떠올려서 쳐 봐요 (막히면 💡 정답 보기)")
      : D.mode === "listen" ? "👂 잘 듣고 쳐요 (Enter: 다시 듣기)" : "";
  }

  function renderTiles() {
    const bankEl = $("#qBank");
    const it = D.items[D.idx];
    const on = it && it.type === "qa" && D.phase === "tiles" && D.tiles;
    bankEl.hidden = !on;
    $("#qCaption").classList.toggle("tiles-mode", !!on);
    if (!on) return;
    const T = D.tiles;
    const slots = T.answer.map((_, k) => {
      const id = T.placed[k];
      if (id == null) return `<span class="tile-slot" aria-hidden="true"></span>`;
      const t = T.bank.find((x) => x.id === id);
      const cls = T.done ? " ok" : T.wrongFrom >= 0 && k >= T.wrongFrom ? " bad" : "";
      return `<button type="button" class="tile placed${cls}" data-placed="${id}">${esc(t.w)}</button>`;
    }).join("");
    $("#qLine").innerHTML = `<div class="tile-row" aria-label="내 대답">${slots}</div>`;
    bankEl.innerHTML = T.bank.map((t) =>
      `<button type="button" class="tile${t.used ? " used" : ""}${T.glow === t.id ? " glow" : ""}" data-tile="${t.id}" ${t.used ? "disabled" : ""}>${esc(t.w)}</button>`
    ).join("");
    renderCard();
  }

  function renderTyped() {
    if (D.phase === "tiles") {
      $("#qTyped").textContent = D.buf;
      return;
    }
    const e = D.engine;
    let s = "";
    if (e) for (let i = 0; i < e.pos; i++) {
      const ch = esc(e.text[i]);
      s += e.state[i] === "skip" ? `<span class="sk">${ch}</span>` : ch;
    }
    $("#qTyped").innerHTML = s;
    const wrap = $("#qTypedWrap");
    wrap.scrollLeft = wrap.scrollWidth;
  }

  function renderStats() {
    if (!D) return;
    const e = D.engine;
    const s = D.sess;
    const live = e && !e.done;
    const correct = s.correct + (live ? e.correct : 0);
    const typed = s.typed + (live ? e.typed : 0);
    const ms = s.ms + (live ? e.elapsedMs() : 0);
    $("#qAcc").textContent = typed ? Math.round((correct / typed) * 1000) / 10 + "%" : "–";
    $("#qWpm").textContent = ms > 3000 ? String(Math.round(correct / 5 / (ms / 60000))) : "–";
    $("#qProg").textContent = `${Math.min(D.idx + 1, D.items.length)} / ${D.items.length}`;
    $("#qBar").style.width = (D.idx / D.items.length) * 100 + "%";
  }

  function renderTools() {
    const it = D.items[D.idx] || {};
    $("#qAnswer").hidden = it.type !== "qa";
    $("#qMode").hidden = it.type !== "follow";
    $("#qMode").textContent = D.mode === "see" ? "👀 보고 치기" : "👂 듣고 치기";
    $("#qReveal").hidden = !(it.type === "qa" && D.phase === "type");
    $("#qReveal").textContent = D.reveal ? "🙈 정답 가리기" : "💡 정답 보기";
    $("#qSay").innerHTML = `🔊 ${it.type === "qa" ? "질문 다시 듣기" : "다시 듣기"} <kbd>Enter</kbd>`;
    $("#qStrict").textContent = "채점: " + (D.strict ? "엄격하게" : "너그럽게");
    $("#qStrict").title = D.strict ? "대소문자·문장부호까지 봐요" : "대소문자·문장부호는 봐주어요";
  }

  function renderStatus() {
    if (!D) return;
    const pill = $("#qStatus");
    const st = !D.started ? "ready" : D.speaking ? "playing" : "waiting";
    pill.textContent = !D.started ? "▶ [시작]을 눌러 주세요" : D.speaking ? "🔊 읽어 주는 중" : D.phase === "tiles" ? "🧩 조각 맞추기" : "⌨ 내 차례예요";
    pill.dataset.status = st;
    $("#qCaption").classList.toggle("your-turn", D.started && !D.speaking);
  }

  function pulseDone() {
    const el = $("#qCaption");
    el.classList.remove("line-done");
    void el.offsetWidth;
    el.classList.add("line-done");
  }
  function flashWrong(ch) {
    const el = $("#qWrong");
    el.textContent = ch === " " ? "␣" : ch;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }
  function wrongHint(r) {
    const exp = r.expected;
    const name = exp === " " ? "띄어쓰기(스페이스바)" : `‘${exp}’`;
    const it = D.items[D.idx];
    if (r.streak >= 2 || (it.type === "qa" && !D.reveal) || D.mode === "listen") {
      const extra = D.strict && /[A-Z]/.test(exp) ? " — Shift를 누른 채로 치면 대문자가 돼요." : "";
      hint(`다음 글자는 ${name}예요${extra}`, "help");
    } else {
      hint("빨간 칸의 글자를 다시 쳐 보세요.", "soft");
    }
  }
  function imeHint() { hint("지금 한글 입력 상태예요. [한/영] 키를 눌러 영어로 바꿔 주세요.", "warn"); }
  function backspaceHint() {
    if (!D || !D.engine) return;
    const exp = D.engine.expected();
    const name = exp === " " ? "띄어쓰기(스페이스바)" : `‘${exp}’`;
    hint(`지우지 않아도 돼요 🙂 ${D.engine.lastWrong ? "빨간 칸에" : "다음 칸에"} 맞는 글자 ${name}만 치면 돼요.`, "help");
  }
  function hint(msg, kind) {
    const el = $("#qHint");
    el.textContent = msg;
    el.className = "type-hint" + (kind ? " " + kind : "");
  }
  function focusInput() {
    const inp = $("#qInput");
    if (inp) inp.focus({ preventScroll: true });
  }

  // ── 처음 한 번 연결 ──
  function init() {
    const inp = $("#qInput");
    const { keyFromCode, isImeKey } = TT.practice;
    inp.addEventListener("input", (e) => {
      if (!D) { inp.value = ""; return; }
      if (e.isComposing) return;
      const v = inp.value;
      inp.value = "";
      if (performance.now() < (D.imeSkipUntil || 0)) return;
      for (const ch of v) onChar(ch);
    });
    inp.addEventListener("compositionend", () => { inp.value = ""; });
    inp.addEventListener("keydown", (e) => {
      if (!D) return;
      if (isImeKey(e)) {
        D.imeSkipUntil = performance.now() + 150;
        if (e.code === "Enter") { onEnter(); return; }
        if (e.code === "Backspace") { onBackspace(); return; }
        if (e.code === "Tab") { e.preventDefault(); return; }
        const ch = keyFromCode(e);
        if (ch) onChar(ch);
        return;
      }
      if (e.key === "Enter") { e.preventDefault(); onEnter(); }
      else if (e.key === "Tab") e.preventDefault();
      else if (e.key === "Backspace" || e.key === "Delete") { e.preventDefault(); onBackspace(); }
    });
    // 초점이 버튼·조각에 있어도 치는 글자는 입력란으로 갑니다.
    document.addEventListener("keydown", (e) => {
      if (!D || TT.app.screen() !== "drill" || e.target === inp) return;
      if (document.querySelector(".modal-back") || e.ctrlKey || e.metaKey || e.altKey) return;
      const typing = e.key.length === 1 || e.key === "Process";
      if (!D.started) {
        if (e.target.id === "qStart" && (e.key === "Enter" || e.key === " ")) return;
        if (typing) { hint("먼저 [▶ 시작]을 눌러 주세요. (Enter를 눌러도 시작돼요)", "warn"); $("#qStart").focus(); }
        return;
      }
      if (typing || e.key === "Enter" || e.key === "Backspace") {
        e.preventDefault();
        focusInput();
        if (e.key === "Enter") onEnter();
        else if (e.key === "Backspace") onBackspace();
        else if (e.key.length === 1) onChar(e.key);
        else if (e.key === "Process") {
          D.imeSkipUntil = performance.now() + 150;
          const ch = keyFromCode(e);
          if (ch) onChar(ch);
        }
      }
    });
    inp.addEventListener("focus", () => $("#qTypeBox").classList.remove("blurred"));
    inp.addEventListener("blur", () => $("#qTypeBox").classList.add("blurred"));
    $("#qTypeBox").addEventListener("mousedown", (e) => { e.preventDefault(); focusInput(); });
    $("#qBank").addEventListener("click", (e) => {
      const b = e.target.closest("[data-tile]");
      if (b && D) { placeTile(Number(b.dataset.tile)); focusInput(); }
    });
    $("#qLine").addEventListener("click", (e) => {
      const b = e.target.closest("[data-placed]");
      if (b && D) { unplaceTile(Number(b.dataset.placed)); focusInput(); }
    });
    $("#qCard").addEventListener("click", () => { if (D && D.started) { speakCurrent(); focusInput(); } });
    $("#qStart").addEventListener("click", start);
    $("#qSay").addEventListener("click", () => { speakCurrent(); focusInput(); });
    $("#qAnswer").addEventListener("click", sayAnswer);
    $("#qMode").addEventListener("click", toggleMode);
    $("#qReveal").addEventListener("click", toggleReveal);
    $("#qStrict").addEventListener("click", toggleStrict);
    $("#qExit").addEventListener("click", exit);
    setInterval(() => { if (D && D.started && TT.app.screen() === "drill") renderStats(); }, 500);
  }

  TT.drill = { init, open, close, exit, isOpen: () => !!D, tilesOf, itemsOf, choosePicks, voiceOk: () => speech.ok };  // tilesOf·itemsOf·choosePicks: 시험용
})();
