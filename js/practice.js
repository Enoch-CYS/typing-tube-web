// 연습 화면 — 한 줄 재생 → 줄 끝에서 멈춤 → 다 칠 때까지 기다림 → 다음 줄 이어서 재생
(function () {
  const TT = (window.TT = window.TT || {});
  const { $, esc, toast } = TT.ui;
  const S = TT.YTState;

  const EARLY = 0.15;       // 줄 끝보다 조금 앞서 멈춥니다(0.1초 간격 확인 오차 보정)
  const GAP_SKIP = 4;       // 4초가 넘는 전주·간주는 건너뜁니다
  const REPLAY_LEAD = 0.25; // 다시 듣기는 줄 시작보다 살짝 앞에서

  let P = null; // 지금 연습 중인 내용

  // 한글 입력 상태에서도 「누른 자판의 위치」(e.code)로 영어 글자를 알아냅니다. 예: ㅅ 자리 → t
  const DIGIT_SHIFT = { Digit1: "!", Digit2: "@", Digit3: "#", Digit4: "$", Digit5: "%", Digit6: "^", Digit7: "&", Digit8: "*", Digit9: "(", Digit0: ")" };
  const PUNCT_KEYS = {
    Space: [" ", " "], Comma: [",", "<"], Period: [".", ">"], Slash: ["/", "?"], Semicolon: [";", ":"],
    Quote: ["'", '"'], BracketLeft: ["[", "{"], BracketRight: ["]", "}"], Minus: ["-", "_"], Equal: ["=", "+"],
    Backquote: ["`", "~"], Backslash: ["\\", "|"]
  };
  function keyFromCode(e) {
    const code = e.code || "";
    let m = code.match(/^Key([A-Z])$/);
    if (m) {
      const caps = !!(e.getModifierState && e.getModifierState("CapsLock"));
      return e.shiftKey !== caps ? m[1] : m[1].toLowerCase();
    }
    m = code.match(/^Digit(\d)$/);
    if (m) return e.shiftKey ? DIGIT_SHIFT[code] : m[1];
    const p = PUNCT_KEYS[code];
    return p ? (e.shiftKey ? p[1] : p[0]) : null;
  }
  const isImeKey = (e) => e.key === "Process" || e.isComposing || e.keyCode === 229;

  function prepareLines(song) {
    const all = (song.lines || []).filter(Boolean);
    const hasStart = (l) => l.start != null && !isNaN(Number(l.start));
    // 영어 글자·숫자가 하나라도 있는 줄만 씁니다(칠 것이 없는 줄에서 멈추지 않게).
    const typeable = (l) => /[A-Za-z0-9]/.test(TT.typing.normalizeText(l.text).normalize("NFD"));
    const endOf = (i) => {
      const l = all[i];
      const start = Number(l.start);
      if (typeof l.end === "number" && l.end > start) return l.end;
      const next = all.slice(i + 1).find(hasStart);
      return next ? Number(next.start) : start + 6;
    };
    const out = [];
    let skippedEnd = null;
    all.forEach((l, i) => {
      if (!hasStart(l)) return;
      if (l.skip) {
        // 관리자가 뺀 줄(🚫): 화면에는 나오지 않고, 그 소리는 앞 줄에 붙여 이어 듣습니다.
        // (뒤에 칠 줄이 남아 있을 때만 붙입니다. 곡 맨 끝의 뺀 줄까지 붙이면 마지막 줄 앞에서 오래 기다리게 됨)
        skippedEnd = Math.max(skippedEnd == null ? 0 : skippedEnd, endOf(i));
        return;
      }
      if (!typeable(l)) return;
      const prev = out[out.length - 1];
      if (prev && skippedEnd != null) prev.end = Math.max(prev.end, skippedEnd);
      skippedEnd = null;
      const start = Number(l.start) || 0;
      out.push({ start, end: endOf(i), text: l.text, words: l.words || [] });
    });
    // 앞 줄 끝이 다음 줄 시작을 넘으면, 다음 줄 첫 부분을 놓치거나 되감기게 되므로 다음 줄 시작에서 자릅니다.
    for (let k = 0; k < out.length - 1; k++) {
      if (out[k].end > out[k + 1].start) out[k].end = Math.max(out[k].start + 0.3, out[k + 1].start);
    }
    return out;
  }

  // ── 시작·종료 ──
  function open(song, profile, opts = {}) {
    close();
    const lines = prepareLines(song);
    const rec = TT.store.record(profile.id, song.videoId);
    const resume = !!(opts.resume && rec && rec.current && rec.current.lineIndex < lines.length);
    const cur = resume ? rec.current : null;
    const replay = !!opts.replay; // 다시 듣기: 노래에 맞춰 글자가 저절로 쳐짐(기록은 남기지 않음)
    P = {
      song, profile, lines, replay,
      idx: cur && !replay ? cur.lineIndex : 0,
      mode: !replay && TT.store.settings().mode === "listen" ? "listen" : "see",
      strict: !!profile.strict,
      rate: 1, status: "loading", started: false, buffering: false,
      engine: null, player: null, timer: null, replayAt: 0,
      sess: cur
        ? { correct: cur.correct || 0, typed: cur.typed || 0, ms: cur.ms || 0, wrong: new Set(cur.wrongWords || []) }
        : { correct: 0, typed: 0, ms: 0, wrong: new Set() }
    };
    const my = P;

    $("#pTitle").textContent = song.title || "";
    $("#pArtist").textContent = song.artist || "";
    $("#pShield").classList.remove("started");
    $("#pStartCard").hidden = false;
    $("#pErrCard").hidden = true;
    $("#pStart").disabled = true;
    $("#pStart").textContent = "영상 불러오는 중…";
    $("#pStartNote").textContent = replay
      ? "노래를 처음부터 끝까지 들어요. 글자가 노래에 맞춰 저절로 쳐져요 🎵"
      : cur
        ? `${P.idx + 1}번째 줄부터 이어서 시작해요.`
        : `모두 ${lines.length}줄이에요. [시작]을 누르면 첫 줄이 재생돼요.`;
    $('[data-screen="practice"]').classList.toggle("replay-mode", replay);
    $("#pExit").textContent = replay ? "← 그만 듣기" : "← 그만하기";
    hint("", "");
    newEngine();
    renderAll();

    P.player = new TT.Player($("#pVideo"), song.videoId, {
      onReady: () => {
        if (P !== my) return;
        P.status = "ready";
        $("#pStart").disabled = false;
        $("#pStart").textContent = P.replay ? "🎵 다시 듣기 시작" : "▶ 시작";
        renderStatus();
        $("#pStart").focus();
      },
      onState: (s) => { if (P === my) onState(s); },
      onError: (code, msg) => { if (P === my) onError(code, msg); }
    });
    P.timer = setInterval(tick, 100);
  }

  function start() {
    if (!P || !P.player || !P.player.ready || P.started) return;
    P.started = true;
    $("#pShield").classList.add("started");
    $("#pStartCard").hidden = true;
    const line = P.lines[P.idx];
    P.player.seek(Math.max(0, line.start - 1));
    P.player.play();
    if (P.rate !== 1) P.player.setRate(P.rate);
    setStatus("playing");
    hint(P.replay ? "편안히 들어요. 노래에 맞춰 글자가 저절로 쳐져요 🎵" : "자막을 보고 따라 쳐요. 줄이 끝나면 영상이 기다려 줘요.", "soft");
    focusInput();
  }

  // ── 다시 듣기: 멈추지 않고 끝까지 재생하며, 지금 부르는 줄의 글자를 노래 속도에 맞춰 채웁니다 ──
  function replayTick() {
    const t = P.player.time();
    let i = 0;
    for (let k = 0; k < P.lines.length; k++) if (t >= P.lines[k].start - 0.05) i = k;
    if (i !== P.idx || !P.engine) {
      P.idx = i;
      newEngine();
      renderNext();
    }
    const l = P.lines[i];
    const e = P.engine;
    const span = Math.max(0.6, (l.end - l.start) * 0.9); // 줄이 끝나기 조금 전에 다 쳐지도록
    const frac = Math.min(1, Math.max(0, (t - l.start) / span));
    const n = Math.round(e.text.length * frac);
    if (n !== e.pos) {
      for (let k = 0; k < e.text.length; k++) e.state[k] = k < n ? "ok" : "todo";
      e.pos = n;
      renderLine();
      renderTyped();
    }
    $("#pProg").textContent = `${i + 1} / ${P.lines.length}`;
    $("#pBar").style.width = ((i + frac) / P.lines.length) * 100 + "%";
    const last = P.lines[P.lines.length - 1];
    if (t > last.end + 1.5 || P.player.state() === S.ENDED) finishReplay();
  }
  function finishReplay() {
    close();
    TT.app.goSongs();
    toast("🎵 다시 듣기를 마쳤어요. 내가 친 노래를 끝까지 들으니 뿌듯하죠?", 4000);
  }

  function close() {
    if (!P) return;
    clearInterval(P.timer);
    if (P.player) P.player.destroy();
    P = null;
    $("#pVideo").innerHTML = "";
  }

  function exit() {
    if (!P) return;
    if (P.replay) { close(); TT.app.goSongs(); return; }
    const n = P.idx;
    if (n > 0) saveProgress();
    close();
    TT.app.goSongs();
    if (n > 0) toast(`${n}줄까지 저장했어요. 다음에 이어서 할 수 있어요.`);
  }

  // ── 영상 상태 ──
  function onState(s) {
    P.buffering = s === S.BUFFERING;
    if (P.started && !P.replay) {
      if (s === S.PLAYING) setStatus("playing");
      else if (s === S.ENDED) setStatus("waiting");
      else if (s === S.PAUSED && P.status === "playing") setStatus("waiting");
    }
    renderStatus();
  }

  function onError(code, msg) {
    $("#pShield").classList.remove("started");
    $("#pStartCard").hidden = true;
    $("#pErrCard").hidden = false;
    $("#pErrMsg").textContent = msg;
    P.status = "error";
    renderStatus();
  }

  // 0.1초마다: 줄 끝에 닿으면 멈추고, 긴 전주·간주는 건너뜁니다.
  function tick() {
    if (!P) return;
    if (P.replay) {
      if (P.started && P.player && P.player.ready) replayTick();
      return;
    }
    if (P.started && P.player && P.player.ready && P.status === "playing" && P.player.state() === S.PLAYING) {
      const line = P.lines[P.idx];
      const t = P.player.time();
      if (line && !P.engine.done && t >= line.end - EARLY) {
        P.player.pause();
        setStatus("waiting");
      } else if (line && P.engine.typed === 0 && t < line.start - GAP_SKIP) {
        const prev = P.lines[P.idx - 1];
        if (!prev || t >= prev.end - 0.3) P.player.seek(line.start - 1);
      }
    }
    renderStats();
  }

  // ── 타자 ──
  function canType() {
    return P && P.started && !P.buffering && (P.status === "playing" || P.status === "waiting") && !P.engine.done;
  }

  function onChar(ch) {
    if (!P) return;
    if (P.replay) {
      if (P.started) hint("다시 듣기 중에는 치지 않아도 돼요. 노래에 맞춰 글자가 저절로 쳐져요 🎵", "soft");
      return;
    }
    if (/[ㄱ-ㆎ가-힣]/.test(ch)) { imeHint(); return; }
    if (ch === "\n" || ch === "\r") return;
    if (!canType()) {
      if (!P.started) hint("먼저 영상 위의 [▶ 시작]을 눌러 주세요.", "warn");
      else if (P.buffering) hint("영상을 불러오는 중이에요. 잠시만 기다려 주세요.", "soft");
      return;
    }
    const r = P.engine.input(ch);
    if (r.kind === "wrong") { flashWrong(ch); wrongHint(r); }
    else if (r.kind === "ok") hint("", "");
    renderLine();
    renderTyped();
    if (P.engine.done) lineDone();
  }

  function lineDone() {
    const e = P.engine;
    P.sess.correct += e.correct;
    P.sess.typed += e.typed;
    P.sess.ms += e.elapsedMs();
    e.wrongWords().forEach((w) => P.sess.wrong.add(w));
    const wasWaiting = P.status === "waiting";
    P.lineDoneAt = Date.now();
    P.idx++;
    pulseDone();
    if (P.idx >= P.lines.length) { finish(); return; }
    saveProgress();
    newEngine();
    renderAll();
    if (wasWaiting) {
      // 멈춰 있던 영상을 다음 줄로 이어서 재생
      const next = P.lines[P.idx];
      const t = P.player.time();
      if (t < next.start - GAP_SKIP || t > next.end - EARLY - 0.2) P.player.seek(Math.max(0, next.start - 0.5));
      P.player.play();
      setStatus("playing");
    }
  }

  function replay() {
    if (!P || P.replay || !P.started || !P.player || !P.player.ready) return;
    const now = Date.now();
    if (now - P.replayAt < 700) return;
    P.replayAt = now;
    const line = P.lines[P.idx];
    if (!line) return;
    P.player.seek(Math.max(0, line.start - REPLAY_LEAD));
    P.player.play();
    setStatus("playing");
    focusInput();
  }

  function finish() {
    const s = P.sess;
    const acc = s.typed ? Math.round((s.correct / s.typed) * 1000) / 10 : 100;
    const wpm = s.ms > 0 ? Math.round(s.correct / 5 / (s.ms / 60000)) : 0;
    const result = {
      date: TT.ui.today(), accuracy: acc, wpm, seconds: Math.round(s.ms / 1000),
      lines: P.lines.length, wrongWords: Array.from(s.wrong)
    };
    const rec = TT.store.record(P.profile.id, P.song.videoId) || {};
    const prev = rec.last || null;
    const best = rec.best || { accuracy: 0, wpm: 0 };
    TT.store.saveRecord(P.profile.id, P.song.videoId, Object.assign({}, rec, {
      totalLines: P.lines.length,
      linesDone: P.lines.length,
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
    const payload = { song: P.song, profile: P.profile, result, prev };
    // 곡 창고에 반 암호로 연결된 기기면 완주 기록을 보내 아빠가 한곳에서 봅니다.
    TT.cloud.recordDone(Object.assign({ profileId: P.profile.id, nickname: P.profile.nickname, videoId: P.song.videoId, title: P.song.title }, result));
    close();
    TT.app.showDone(payload);
  }

  // 줄을 마칠 때마다 저장해 두어, 창을 닫아도 이어서 할 수 있게 합니다.
  function saveProgress() {
    if (!P) return;
    const rec = TT.store.record(P.profile.id, P.song.videoId) || {};
    const s = P.sess;
    TT.store.saveRecord(P.profile.id, P.song.videoId, Object.assign({}, rec, {
      totalLines: P.lines.length,
      linesDone: P.idx,
      completed: !!rec.completed,
      accuracy: s.typed ? Math.round((s.correct / s.typed) * 1000) / 10 : rec.accuracy,
      wpm: s.ms > 0 ? Math.round(s.correct / 5 / (s.ms / 60000)) : rec.wpm,
      wrongWords: Array.from(s.wrong),
      lastDate: TT.ui.today(),
      current: {
        lineIndex: P.idx, correct: s.correct, typed: s.typed,
        ms: Math.round(s.ms), wrongWords: Array.from(s.wrong)
      }
    }));
  }

  // ── 도구 버튼 ──
  function toggleSlow() {
    if (!P) return;
    P.rate = P.rate === 1 ? 0.75 : 1;
    if (P.player) P.player.setRate(P.rate);
    renderTools();
    focusInput();
  }
  function toggleMode() {
    if (!P) return;
    P.mode = P.mode === "see" ? "listen" : "see";
    TT.store.saveSettings({ mode: P.mode });
    renderAll();
    toast(P.mode === "listen" ? "👂 듣고 치기: 자막이 가려져요. Enter로 그 줄을 다시 들어요." : "👀 보고 치기: 자막을 보며 쳐요.");
    focusInput();
  }
  function toggleStrict() {
    if (!P) return;
    P.strict = !P.strict;
    P.profile.strict = P.strict;
    TT.store.updateProfile(P.profile.id, { strict: P.strict });
    if (P.engine.typed === 0) {
      newEngine();
      renderAll();
    } else {
      toast("다음 줄부터 바뀐 채점이 적용돼요.");
    }
    renderTools();
    focusInput();
  }

  // ── 그리기 ──
  function newEngine() {
    P.engine = new TT.typing.Engine(P.lines[P.idx].text, P.strict);
  }

  function renderAll() {
    renderLine();
    renderNext();
    renderTyped();
    renderStats();
    renderTools();
    renderStatus();
  }

  function charHtml(i, e, listen) {
    const ch = e.text[i];
    let cls = "c " + e.state[i];
    if (i === e.pos) cls += " cur";
    if (e.lastWrong && e.lastWrong.at === i) cls += " err";
    if (ch === " ") cls += " sp";
    if (listen && i >= e.pos && /[\p{L}\p{N}]/u.test(ch)) cls += " hid";
    return `<span class="${cls}">${ch === " " ? " " : esc(ch)}</span>`;
  }

  // 한 줄 자막: 글자마다 상태 색(친 글자·커서·틀림), 어려운 단어 아래 한글 뜻
  function renderLine() {
    const e = P.engine;
    const t = e.text;
    const line = P.lines[P.idx];
    const listen = P.mode === "listen";
    const re = /[\p{L}\p{N}'-]+|[^\p{L}\p{N}'-]+/gu;
    let html = "";
    let m;
    while ((m = re.exec(t))) {
      const seg = m[0];
      const s = m.index;
      let chars = "";
      for (let k = 0; k < seg.length; k++) chars += charHtml(s + k, e, listen);
      if (/[\p{L}\p{N}]/u.test(seg)) {
        const ko = TT.typing.meaningFor(seg, line, P.song);
        const show = ko && (!listen || e.pos >= s + seg.length);
        html += `<span class="w"><span class="en">${chars}</span>${show ? `<span class="ko">${esc(ko)}</span>` : ""}</span>`;
      } else {
        html += chars;
      }
    }
    $("#pLine").innerHTML = html;
    $("#pCaption").classList.toggle("listen", listen);
  }

  function renderNext() {
    const next = P.lines[P.idx + 1];
    $("#pNext").textContent = P.mode === "see" && next ? "다음 줄 · " + TT.typing.normalizeText(next.text) : "";
  }

  function renderTyped() {
    const e = P.engine;
    let s = "";
    for (let i = 0; i < e.pos; i++) {
      const ch = esc(e.text[i]);
      s += e.state[i] === "skip" ? `<span class="sk">${ch}</span>` : ch;
    }
    const el = $("#pTyped");
    el.innerHTML = s;
    const wrap = $("#pTypedWrap");
    wrap.scrollLeft = wrap.scrollWidth;
  }

  function renderStats() {
    if (!P) return;
    const e = P.engine;
    const s = P.sess;
    const correct = s.correct + (e ? e.correct : 0);
    const typed = s.typed + (e ? e.typed : 0);
    const ms = s.ms + (e ? e.elapsedMs() : 0);
    $("#pAcc").textContent = typed ? Math.round((correct / typed) * 1000) / 10 + "%" : "–";
    $("#pWpm").textContent = ms > 3000 ? String(Math.round(correct / 5 / (ms / 60000))) : "–";
    $("#pProg").textContent = `${Math.min(P.idx + 1, P.lines.length)} / ${P.lines.length}`;
    $("#pBar").style.width = (P.idx / P.lines.length) * 100 + "%";
  }

  function renderTools() {
    const slow = $("#pSlow");
    slow.textContent = P.rate === 1 ? "🐢 느리게 듣기" : "🐇 보통 빠르기";
    slow.setAttribute("aria-pressed", String(P.rate !== 1));
    $("#pMode").textContent = P.mode === "see" ? "👀 보고 치기" : "👂 듣고 치기";
    $("#pStrict").textContent = "채점: " + (P.strict ? "엄격하게" : "너그럽게");
    $("#pStrict").title = P.strict ? "대소문자·문장부호까지 봐요" : "대소문자·문장부호는 봐주어요";
  }

  const STATUS_TEXT = {
    loading: "⏳ 영상 불러오는 중",
    ready: "▶ [시작]을 눌러 주세요",
    playing: "🎧 듣는 중",
    waiting: "⌨ 내 차례예요",
    error: "⚠ 재생할 수 없어요"
  };
  function renderStatus() {
    if (!P) return;
    const pill = $("#pStatus");
    pill.textContent = P.buffering && P.started ? "⏳ 잠시만요"
      : P.replay && P.status === "playing" ? "🎵 다시 듣기 중"
      : STATUS_TEXT[P.status] || "";
    pill.dataset.status = P.status;
  }
  function setStatus(s) {
    if (!P) return;
    P.status = s;
    $("#pCaption").classList.toggle("your-turn", s === "waiting");
    renderStatus();
  }

  function pulseDone() {
    const el = $("#pCaption");
    el.classList.remove("line-done");
    void el.offsetWidth; // 애니메이션 다시 시작
    el.classList.add("line-done");
  }

  function flashWrong(ch) {
    const el = $("#pWrong");
    el.textContent = ch === " " ? "␣" : ch;
    el.classList.remove("show");
    void el.offsetWidth;
    el.classList.add("show");
  }

  function wrongHint(r) {
    const exp = r.expected;
    const name = exp === " " ? "띄어쓰기(스페이스바)" : `‘${exp}’`;
    if (P.strict && P.capsOn && /[A-Za-z]/.test(exp)) {
      hint("Caps Lock(대문자 고정)이 켜져 있어요. Caps Lock 키를 한 번 눌러 꺼 주세요.", "warn");
      return;
    }
    if (r.streak >= 2 || P.mode === "listen") {
      const extra = P.strict && /[A-Z]/.test(exp) ? " — Shift를 누른 채로 치면 대문자가 돼요." : "";
      hint(`다음 글자는 ${name}예요${extra}`, "help");
    } else {
      hint("빨간 칸의 글자를 다시 쳐 보세요.", "soft");
    }
  }

  function imeHint() { hint("지금 한글 입력 상태예요. [한/영] 키를 눌러 영어로 바꿔 주세요.", "warn"); }

  // 아이들은 틀리면 지우려고 해요. 이 앱은 지울 필요가 없다는 것을 알려 줍니다.
  function backspaceHint() {
    if (!P || !P.engine) return;
    const exp = P.engine.expected();
    const name = exp === " " ? "띄어쓰기(스페이스바)" : `‘${exp}’`;
    hint(`지우지 않아도 돼요 🙂 ${P.engine.lastWrong ? "빨간 칸에" : "다음 칸에"} 맞는 글자 ${name}만 치면 돼요.`, "help");
  }

  function hint(msg, kind) {
    const el = $("#pHint");
    el.textContent = msg;
    el.className = "type-hint" + (kind ? " " + kind : "");
  }

  function focusInput() {
    const inp = $("#pInput");
    if (inp) inp.focus({ preventScroll: true });
  }

  // ── 처음 한 번 연결 ──
  function init() {
    const inp = $("#pInput");
    inp.addEventListener("input", (e) => {
      if (!P) { inp.value = ""; return; }
      if (e.isComposing) return; // 한글 조합 중인 글자는 keydown에서 이미 영어로 처리했어요
      const v = inp.value;
      inp.value = "";
      if (performance.now() < (P.imeSkipUntil || 0)) return; // 같은 키가 두 번 들어오지 않게
      for (const ch of v) onChar(ch);
    });
    inp.addEventListener("compositionend", () => { inp.value = ""; });
    inp.addEventListener("keydown", (e) => {
      if (!P) return;
      P.capsOn = !!(e.getModifierState && e.getModifierState("CapsLock"));
      // 한글 입력 상태라도 자판 위치로 영어 글자를 알아내 바로 처리합니다(자동 영어 전환과 같은 효과).
      if (isImeKey(e)) {
        P.imeSkipUntil = performance.now() + 150;
        if (e.code === "Enter") { if (Date.now() - (P.lineDoneAt || 0) > 800) replay(); return; }
        if (e.code === "Backspace") { backspaceHint(); return; }
        if (e.code === "Tab") { e.preventDefault(); return; }
        const ch = keyFromCode(e);
        if (ch) {
          onChar(ch);
          if (!P.imeNoticed && !P.replay) {
            P.imeNoticed = true;
            toast("한글 상태지만 영어로 바꿔서 받고 있어요. 그대로 쳐도 돼요 🙂", 3500);
          }
        }
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        // 줄을 막 끝낸 직후 습관처럼 누른 Enter는 무시합니다.
        if (Date.now() - (P.lineDoneAt || 0) > 800) replay();
      } else if (e.key === "Tab") {
        e.preventDefault(); // 초점이 입력란 밖으로 나가지 않게
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        backspaceHint();
      }
    });
    // 연습 중에는 초점이 어디에 있든(영상·버튼을 누른 뒤에도) 치는 글자가 입력란으로 들어가게 합니다.
    document.addEventListener("keydown", (e) => {
      if (!P || TT.app.screen() !== "practice" || e.target === inp) return;
      if (document.querySelector(".modal-back") || e.ctrlKey || e.metaKey || e.altKey) return;
      const typing = e.key.length === 1 || e.key === "Process";
      if (!P.started) {
        if (e.target.id === "pStart" && (e.key === "Enter" || e.key === " ")) return; // 시작 버튼의 Enter·Space는 그대로
        if (typing) {
          hint("먼저 영상 위의 [▶ 시작]을 눌러 주세요. (Enter를 눌러도 시작돼요)", "warn");
          const b = $("#pStart");
          if (!b.disabled) b.focus();
        }
        return;
      }
      if (typing || e.key === "Enter" || e.key === "Backspace") {
        e.preventDefault();
        focusInput();
        if (e.key === "Enter") replay();
        else if (e.key === "Backspace") backspaceHint();
        else if (e.key.length === 1) onChar(e.key);
        else if (e.key === "Process") {
          P.imeSkipUntil = performance.now() + 150;
          const ch = keyFromCode(e);
          if (ch) onChar(ch);
        }
      }
    });
    // 영상을 눌러도 입력란 초점을 지키고, 영상이 저절로 멈추고 이어진다는 것을 알려 줍니다.
    $("#pShield").addEventListener("mousedown", (e) => {
      if (!P || !P.started) return;
      e.preventDefault();
      focusInput();
      hint("영상은 줄이 끝나면 저절로 멈추고, 다 치면 이어져요. 그대로 계속 쳐요.", "soft");
    });
    inp.addEventListener("focus", () => $("#pTypeBox").classList.remove("blurred"));
    inp.addEventListener("blur", () => $("#pTypeBox").classList.add("blurred"));
    $("#pTypeBox").addEventListener("mousedown", (e) => { e.preventDefault(); focusInput(); });
    $("#pCaption").addEventListener("mousedown", (e) => { if (P && P.started) { e.preventDefault(); focusInput(); } });
    $("#pStart").addEventListener("click", start);
    $("#pReplay").addEventListener("click", replay);
    $("#pSlow").addEventListener("click", toggleSlow);
    $("#pMode").addEventListener("click", toggleMode);
    $("#pStrict").addEventListener("click", toggleStrict);
    $("#pExit").addEventListener("click", exit);
    $("#pErrBack").addEventListener("click", () => { close(); TT.app.goSongs(); });
  }

  TT.practice = { init, open, close, exit, isOpen: () => !!P, prepareLines,   // prepareLines: 시험용으로도 씀
    keyFromCode, isImeKey };                                                  // 문장 연습(drill.js)도 같은 자판 처리를 씀
})();
