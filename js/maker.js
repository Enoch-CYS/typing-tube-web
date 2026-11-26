// 자막 준비실(관리자, 옛 이름: 줄 만들기)
//  ① 가사 자동 찾기(공개 가사 자료실 LRCLIB) 또는 직접 붙여넣기 → ② 줄 나누기
//  ③ 시간 찍기(스페이스바) 또는 한 줄씩 검수(✓) → ④ 단어 뜻 → ⑤ 저장
// 가사는 관리자의 브라우저가 직접 가져오거나 관리자가 붙여 넣습니다.
// 이 앱의 코드(와 Claude)는 가사를 미리 담아 두거나 대신 적어 넣지 않습니다.
(function () {
  const TT = (window.TT = window.TT || {});
  const { $, $$, esc, toast, confirmBox, fmtTime } = TT.ui;

  const REACT = 0.2; // 사람이 듣고 누르기까지 걸리는 시간만큼 앞당깁니다
  const LRCLIB = "https://lrclib.net/api/search";
  const FIT_GAP = 3;   // 영상과 가사 길이 차이가 이 초 안이면 「길이 같음」으로 봅니다
  const M = {
    vid: null, lines: [], player: null,
    mode: null,            // null | 'tap'(시간 찍기) | 'review'(검수)
    tapIdx: 0, revIdx: 0,
    segEnd: null, timer: null, rate: 1, nowRow: -1,
    source: null, found: []
  };

  const round2 = (n) => Math.round(n * 100) / 100;
  const fmtLen = (sec) => { sec = Math.round(sec || 0); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; };

  // "1:02.5", "01:02:03" → 초
  function toSec(s) {
    const parts = String(s).replace(",", ".").split(":").map(Number);
    if (parts.some(isNaN)) return null;
    return parts.reduce((acc, v) => acc * 60 + v, 0);
  }
  function cleanText(t) {
    return String(t || "")
      .replace(/<\d{1,2}:\d{2}(?:[.,]\d+)?>/g, "") // 낱말별 시간 표시(확장 LRC)
      .replace(/\[(?:music|음악|applause|박수|laughter|웃음|instrumental|간주)\]/gi, "")
      .replace(/[♪♫♬♩]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // 시각 바로 뒤에 붙은 「읽어 주는 시간」(21초 / 1분 24초 / 1 minute, 24 seconds)을 떼어 냅니다.
  // 그 값이 앞의 시각과 같을 때만 떼어 내므로, 대사가 숫자로 시작해도 잘리지 않아요.
  function stripSpokenTime(text, sec) {
    const m = String(text).match(/^\s*(?:(\d+)\s*(?:시간|hours?)[,\s]*)?(?:(\d+)\s*(?:분|minutes?)[,\s]*)?(?:(\d+)\s*(?:초|seconds?))?/i);
    if (!m || !m[0].trim() || !(m[1] || m[2] || m[3])) return text;
    const said = (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0);
    return Math.abs(said - Math.floor(sec)) <= 1 ? String(text).slice(m[0].length).trim() : text;
  }

  // 붙여 넣은 글(또는 가져온 LRC)을 줄로 나눕니다.
  //  · 유튜브 스크립트: "0:12" 다음 줄에 글, 또는 "0:12 글"
  //  · LRC: "[00:12.34] 글", 태그 여러 개 가능, 글 없는 태그 줄 = 앞 줄이 끝나는 시간
  function parsePaste(raw) {
    const rows = String(raw || "").replace(/\r/g, "").split("\n").map((s) => s.trim());
    const TS = "(?:\\d{1,2}:)?\\d{1,2}:\\d{2}(?:[.,]\\d+)?";
    const plainOnly = new RegExp(`^(${TS})$`);
    // 요즘 유튜브 스크립트를 복사하면 「0:21」+「21초」(읽어 주는 시간)+대사가 띄어쓰기 없이 붙어 나와요: "0:2121초Oh, …"
    const plainLead = new RegExp(`^(${TS})\\s*(\\S.*)$`);
    const lrcTags = new RegExp(`^((?:\\[${TS}\\]\\s*)+)(.*)$`);
    const tsAll = new RegExp(TS, "g");
    const lrcMeta = /^\[[a-z]+:.*\]$/i;
    const out = [];
    const gaps = [];
    let pending = null;
    for (const r of rows) {
      if (!r || lrcMeta.test(r)) continue;
      let m;
      if ((m = r.match(plainOnly))) { pending = toSec(m[1]); continue; }
      // 「0:21」 다음 줄에 따로 온 「21초」 같은 읽어 주는 시간은 건너뜀
      if (pending != null && stripSpokenTime(r, pending) === "") continue;
      if ((m = r.match(lrcTags))) {
        const times = (m[1].match(tsAll) || []).map(toSec).filter((t) => t != null);
        const text = cleanText(m[2]);
        pending = null;
        if (!/[\p{L}\p{N}]/u.test(text)) { gaps.push(...times); continue; }
        times.forEach((t) => out.push({ start: t, end: null, text }));
        continue;
      }
      let start = pending;
      let text = r;
      if ((m = r.match(plainLead))) { start = toSec(m[1]); text = m[2]; }
      if (start != null) text = stripSpokenTime(text, start);
      pending = null;
      text = cleanText(text);
      // [Music]처럼 소리 표시만 있는 줄 = 앞 줄이 끝나는 시간(음악 앞에서 멈추도록)
      if (!/[\p{L}\p{N}]/u.test(text)) { if (start != null) gaps.push(start); continue; }
      if (start == null) {
        // 유튜브 스크립트의 장 제목(「챕터 2: …」)은 건너뜀
        if (/^(?:챕터|chapter)\s*\d+\s*[:：]/i.test(text)) continue;
        // 시간 붙은 줄 바로 다음의 시간 없는 줄 = 한 자막이 두 줄로 나뉜 것 → 앞 줄에 이어 붙임
        const prev = out[out.length - 1];
        if (prev && prev.start != null && !/^\(?\[/.test(text)) { prev.text = `${prev.text} ${text}`; continue; }
      }
      out.push({ start, end: null, text });
    }
    // 유튜브 스크립트를 통째로 복사하면 장(챕터) 제목처럼 시간 없는 줄이 섞여요.
    // 대부분의 줄에 시간이 있으면, 시간 없는 줄은 건너뜁니다(가사만 붙여 넣은 경우는 그대로 둠).
    const timedN = out.filter((l) => l.start != null).length;
    let dropped = 0;
    if (timedN && timedN < out.length && timedN >= out.length * 0.6) {
      for (let k = out.length - 1; k >= 0; k--) if (out[k].start == null) { out.splice(k, 1); dropped++; }
    }
    out.untimedDropped = dropped;
    if (out.length && out.every((l) => l.start != null)) {
      out.sort((a, b) => a.start - b.start);
      // 글 없는 시간 줄 → 그 직전 줄의 끝(간주 앞에서 멈추도록)
      gaps.forEach((g) => {
        let i = -1;
        for (let k = 0; k < out.length; k++) if (out[k].start < g) i = k;
        if (i < 0) return;
        const next = out[i + 1];
        if (out[i].end == null && (!next || g < next.start)) out[i].end = g;
      });
    }
    return out;
  }

  // 영상 고르기 목록의 이름: 🚫 뺀 곡 / ✅ 검수 완료 / ✎ 검수 중
  function songLabel(c) {
    const s = TT.store.song(c.videoId);
    const mark = TT.songs.isHidden(c.videoId) ? " 🚫 뺀 곡" : s ? (s.reviewed ? " ✅" : " ✎") : "";
    return `${c.title} — ${c.artist || ""}${mark}`;
  }
  function refreshSongLabel() {
    const opt = [...$("#mSong").options].find((o) => o.value === M.vid);
    const meta = TT.songs.meta(M.vid);
    if (opt && meta) opt.textContent = songLabel(meta);
  }

  // 곡 통째로 빼기·되살리기 — 줄 자료는 지우지 않고 「뺀 곡」 표시만 바꿉니다.
  async function toggleSongHidden() {
    const meta = TT.songs.meta(M.vid) || {};
    const wasOut = TT.songs.isHidden(M.vid);
    if (!wasOut) {
      const ok = await confirmBox("이 곡을 연습 목록에서 뺄까요?",
        `「${meta.title}」은(는) 아들·학생 목록에서 사라지고, 관리자 목록에는 맨 아래에 흐리게 남아요. 검수한 줄 자료는 그대로 두니, 여기서 ↩ 되살리기를 누르면 언제든 다시 나와요.`, "빼기");
      if (!ok) return;
    }
    TT.store.setHidden(M.vid, !wasOut);
    TT.cloud.hiddenChanged();
    refreshSongLabel();
    renderState();
    toast(wasOut ? "되살렸어요. 다시 연습 목록에 나와요." : "곡을 뺐어요. 학생 목록에 나오지 않아요.");
  }

  // ── ➕ 영상 더하기: 유튜브 주소·제목·분류·난이도만(가사 없음) ──
  function parseVideoId(text) {
    const t = String(text || "").trim();
    const m = t.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(t) ? t : null;
  }
  async function addVideoFlow() {
    const curCat = TT.songs.catOf(TT.songs.meta(M.vid) || {}).id;
    const cats = (TT.categories || []).filter((c) => c.kind !== "lesson").map((c) => `<option value="${esc(c.id)}"${c.id === curCat ? " selected" : ""}>${esc(c.icon + " " + c.name)}</option>`).join("");
    const body =
      `<label class="field">유튜브 주소<input class="v-url" type="url" placeholder="https://www.youtube.com/watch?v=…" spellcheck="false"></label>` +
      `<label class="field">제목<input class="v-title" type="text" maxlength="120" spellcheck="false"></label>` +
      `<label class="field">가수·채널<input class="v-artist" type="text" maxlength="80" spellcheck="false"></label>` +
      `<div class="two"><label class="field">분류<select class="select v-cat">${cats}</select></label>` +
      `<label class="field">난이도<select class="select v-level"><option>쉬움</option><option selected>보통</option><option>어려움</option></select></label></div>` +
      `<p class="note">가사는 여기에 적지 않아요. 더한 뒤 2단계에서 가사를 가져오고, 3단계에서 한 줄씩 검수하면 학생 목록에 공개돼요. 앱에서 재생이 막힌 영상이면 3단계 영상 자리에 안내가 나와요.</p>`;
    const item = await TT.ui.modal({
      title: "➕ 영상 더하기", body,
      actions: [
        { label: "취소", value: null, kind: "ghost" },
        {
          label: "더하기", kind: "primary",
          value: (el) => {
            const videoId = parseVideoId($(".v-url", el).value);
            const title = $(".v-title", el).value.trim();
            if (!videoId) { toast("유튜브 주소를 확인해 주세요. (예: https://www.youtube.com/watch?v=…)"); return undefined; }
            if (!title) { toast("제목을 넣어 주세요."); return undefined; }
            const old = TT.songs.meta(videoId);
            if (old && !old.added) { toast(`이미 목록에 있는 영상이에요: 「${old.title}」`); return undefined; }
            return { videoId, title, artist: $(".v-artist", el).value.trim(), cat: $(".v-cat", el).value, level: $(".v-level", el).value };
          }
        }
      ]
    });
    if (!item) return;
    TT.cloud.addVideo(item);
    open(item.videoId);
    toast(TT.cloud.isAdmin()
      ? `「${item.title}」을(를) 더했어요. 곡 창고에도 올려요. 이제 2단계에서 가사를 가져와 주세요.`
      : `「${item.title}」을(를) 이 기기 목록에 더했어요. 곡 창고에 관리자 열쇠로 연결하면 함께 올라가요.`, 5000);
  }

  // ── 화면 열기·닫기 ──
  function open(videoId) {
    const sel = $("#mSong");
    sel.innerHTML = (TT.categories || []).map((cat) => {
      // 교재 단원(lesson)은 영상이 없어 자막 준비실에 나오지 않습니다.
      const items = (TT.catalog || []).filter((c) => !c.lesson && TT.songs.catOf(c).id === cat.id);
      if (!items.length) return "";
      return `<optgroup label="${esc(cat.icon + " " + cat.name)}">` + items.map((c) =>
        `<option value="${esc(c.videoId)}">${esc(songLabel(c))}</option>`
      ).join("") + "</optgroup>";
    }).join("");
    const vid = videoId && TT.songs.meta(videoId) && !TT.songs.meta(videoId).lesson ? videoId : (TT.catalog.find((c) => !c.lesson) || {}).videoId;
    sel.value = vid;
    loadSong(vid);
    clearInterval(M.timer);
    M.timer = setInterval(tick, 100);
  }
  function close() {
    clearInterval(M.timer);
    setMode(null, true);
    if (M.player) M.player.destroy();
    M.player = null;
    $("#mVideo").innerHTML = "";
  }

  function fromSaved(lines) {
    return lines.map((l, i, arr) => {
      const next = arr[i + 1];
      // 다음 줄 시작과 같은 끝 시간은 "자동"으로 보여 줍니다.
      const auto = next && typeof l.end === "number" && Math.abs(l.end - next.start) < 0.05;
      return { start: l.start, end: auto ? null : l.end, text: l.text, words: l.words, ok: !!l.ok, skip: !!l.skip };
    });
  }

  function loadSong(vid) {
    setMode(null, true);
    M.vid = vid;
    const saved = TT.store.song(vid);
    const meta = TT.songs.meta(vid) || {};
    M.lines = saved ? fromSaved(saved.lines) : [];
    M.source = saved && saved.source ? saved.source : null;
    M.found = [];
    $("#mFindTitle").value = meta.title || "";
    $("#mFindArtist").value = meta.artist || "";
    $("#mFindResult").hidden = true;
    // 노래는 [가사 자동 찾기], 강의·대화·영화는 유튜브 스크립트 붙여넣기 안내
    const isTalk = TT.songs.kindOf(vid) === "talk";
    $("#mFindBox").hidden = isTalk;
    $("#mTalkHelp").hidden = !isTalk;
    const clip = meta.clip;
    $("#mClipNote").hidden = !(isTalk && clip);
    if (isTalk && clip) $("#mClipNote").textContent = `✂ 이 영상은 ${fmtTime(clip.start, 0)} ~ ${fmtTime(clip.end, 0)} 구간만 써요. 스크립트는 통째로 붙여 넣으셔도 이 구간의 줄만 저절로 남아요.`;
    // 스크립트를 복사하러 갈 유튜브 주소(구간이 있으면 그 시작 시각부터)
    $("#mYtLink").href = `https://www.youtube.com/watch?v=${encodeURIComponent(vid)}${isTalk && clip ? `&t=${Math.floor(clip.start)}s` : ""}`;
    $("#mPaste").value = "";
    $("#mGloss").value = saved && saved.glossary ? saved.glossary.map((g) => `${g.word} = ${g.ko}`).join("\n") : "";
    M.tapIdx = firstUntimed();
    M.revIdx = firstUnchecked();
    renderTable();
    renderState();
    if (M.player) M.player.destroy();
    M.player = new TT.Player($("#mVideo"), vid, {
      onError: (code, msg) => toast(msg, 5000),
      onReady: () => { if (M.rate !== 1) M.player.setRate(M.rate); }
    });
  }

  const firstUntimed = () => { const i = M.lines.findIndex((l) => l.start == null); return i < 0 ? M.lines.length : i; };
  // 검수할 줄: ✓도 안 했고 빼지도 않은 줄
  const todo = (l) => !l.ok && !l.skip;
  const firstUnchecked = (from = 0) => {
    for (let i = from; i < M.lines.length; i++) if (todo(M.lines[i])) return i;
    for (let i = 0; i < from; i++) if (todo(M.lines[i])) return i;
    return -1;
  };
  const okCount = () => M.lines.filter((l) => l.ok && !l.skip).length;
  const skipCount = () => M.lines.filter((l) => l.skip).length;
  function lineEnd(i) {
    const l = M.lines[i];
    const next = M.lines.slice(i + 1).find((n) => n.start != null);
    if (l.end != null && l.end > l.start) return l.end;
    if (next) return next.start;
    return l.start + 6;
  }
  // 다음에 남는(빼지 않은) 줄의 시작 — 줄 끝을 늘릴 수 있는 한계
  function nextKeptStart(i) {
    const n = M.lines.slice(i + 1).find((l) => !l.skip && l.start != null);
    return n ? n.start : null;
  }
  // 연습 때 실제로 멈추는 곳: 바로 뒤에 뺀 줄이 있으면 그 소리까지 앞 줄에 붙여 듣습니다(연습 화면과 같은 셈법).
  function playEnd(i) {
    let end = lineEnd(i);
    const cap = nextKeptStart(i);
    // 뺀 줄이거나, 뒤에 남는 줄이 없으면(곡 맨 끝) 붙이지 않습니다.
    if (M.lines[i].skip || cap == null) return end;
    for (let j = i + 1; j < M.lines.length && M.lines[j].skip; j++) {
      if (M.lines[j].start != null) end = Math.max(end, lineEnd(j));
    }
    return Math.min(end, cap);
  }

  function renderState() {
    const saved = TT.store.song(M.vid);
    const savedSkip = saved ? saved.lines.filter((l) => l.skip).length : 0;
    let s = saved
      ? `이 기기에 저장된 줄 자료: ${saved.lines.length - savedSkip}줄${savedSkip ? ` (뺀 줄 ${savedSkip}개 따로)` : ""} · ${saved.reviewed ? "✅ 검수 완료 — 아들·학생 목록에 공개 중" : "검수 중 — 아직 공개 전"}`
      : "아직 저장된 줄 자료가 없어요.";
    if (M.source && M.source.kind === "lrclib") s += ` · 가사 출처: LRCLIB${M.source.album ? ` (${M.source.album})` : ""}`;
    const out = TT.songs.isHidden(M.vid);
    if (out) s = "🚫 연습 목록에서 뺀 곡이에요 — 아들·학생에게 보이지 않아요. " + s.replace("✅ 검수 완료 — 아들·학생 목록에 공개 중", "✅ 검수 완료");
    if (TT.cloud.isAdmin()) s += " · ☁ 곡 창고에 자동으로 올라가요";
    else if (TT.cloud.enabled()) s += " · 이 기기에만 저장(곡 창고에 관리자 열쇠로 연결하면 함께 올라가요)";
    $("#mSongState").textContent = s;
    $("#mHideSong").textContent = out ? "↩ 이 곡 되살리기" : "🚫 이 곡 빼기";
    $("#mHideSong").classList.toggle("is-out", out);
    renderReviewCount();
  }
  function renderReviewCount() {
    const kept = M.lines.length - skipCount();
    const left = M.lines.filter(todo).length;
    const el = $("#mReviewCount");
    el.textContent = M.lines.length ? `검수 ✓ ${okCount()} / ${kept}줄${skipCount() ? ` · 🚫 뺀 줄 ${skipCount()}` : ""}` : "";
    el.classList.toggle("all", kept > 0 && left === 0);
    // 「✓ 안 한 줄 모두 빼기」는 검수를 시작한 뒤(✓가 하나라도 있을 때)에만 보여 줍니다.
    $("#mSkipRest").hidden = !(left > 0 && okCount() > 0);
  }

  // ── 줄 표 ──
  function renderTable() {
    const tb = $("#mTable tbody");
    if (!M.lines.length) {
      tb.innerHTML = `<tr><td colspan="6" class="empty">2단계에서 [🔎 가사 자동 찾기]를 하거나, 가사를 붙여 넣고 [줄 나누기]를 눌러 주세요.</td></tr>`;
    } else {
      tb.innerHTML = M.lines.map((l, i) => {
        const cls = [
          M.mode === "tap" && i === M.tapIdx ? "next" : "",
          M.mode === "review" && i === M.revIdx ? "rev" : "",
          l.ok && !l.skip ? "ok" : "",
          l.skip ? "skip" : ""
        ].join(" ");
        return `
        <tr data-i="${i}" class="${cls}">
          <td class="num">${i + 1}</td>
          <td class="chk"><input type="checkbox" class="ok-in" data-k="ok" data-i="${i}" ${l.ok && !l.skip ? "checked" : ""} aria-label="${i + 1}번째 줄 검수 완료"></td>
          <td><input type="number" step="0.1" min="0" class="t-in" data-k="start" data-i="${i}" value="${l.start == null ? "" : l.start}" aria-label="${i + 1}번째 줄 시작(초)"></td>
          <td><input type="number" step="0.1" min="0" class="t-in" data-k="end" data-i="${i}" value="${l.end == null ? "" : l.end}" placeholder="자동" aria-label="${i + 1}번째 줄 끝(초)"></td>
          <td><input type="text" class="l-in" data-k="text" data-i="${i}" value="${esc(l.text)}" aria-label="${i + 1}번째 줄 가사"></td>
          <td class="row-tools"><button type="button" class="btn tool sm" data-play="${i}" aria-label="${i + 1}번째 줄 듣기">▶</button><button type="button" class="btn tool sm skip-btn" data-skip="${i}" title="${l.skip ? "연습에 되살리기" : "연습에서 빼기"}" aria-label="${i + 1}번째 줄 ${l.skip ? "되살리기" : "빼기"}">${l.skip ? "↩" : "🚫"}</button></td>
        </tr>`;
      }).join("");
    }
    renderPads();
    renderReviewCount();
    M.nowRow = -1;
  }

  function renderPads() {
    const tap = $("#mTapPad");
    const rev = $("#mReviewPad");
    tap.hidden = M.mode !== "tap";
    rev.hidden = M.mode !== "review";
    if (M.mode === "tap") {
      const n = M.lines.length;
      tap.innerHTML = M.tapIdx >= n
        ? `<strong>모든 줄에 시작 시간을 찍었어요 ✓</strong><span>마지막 줄 노래가 끝나는 순간 <kbd>Enter</kbd>를 눌러 끝을 표시해 주세요.</span>`
        : `<span class="pad-label">다음에 찍을 줄 (${M.tapIdx + 1}/${n})</span><strong>${esc(M.lines[M.tapIdx].text)}</strong><span>이 줄 노래가 <b>시작되는 순간</b> <kbd>Space</kbd></span>`;
    }
    if (M.mode === "review") {
      const i = M.revIdx;
      const l = M.lines[i];
      if (!l) { rev.innerHTML = ""; return; }
      const own = lineEnd(i);
      const heard = playEnd(i);
      const state = l.skip ? "· 🚫 연습에서 뺀 줄" : l.ok ? "· ✓ 확인함" : "";
      rev.innerHTML = `
        <span class="pad-label">검수 중 · ${i + 1}/${M.lines.length}번째 줄 ${state}</span>
        <strong class="${l.skip ? "skipped" : ""}">${esc(l.text)}</strong>
        <span class="pad-time">${fmtTime(l.start)} ~ ${fmtTime(own)}${heard > own + 0.05 ? ` <span class="pad-note">(뒤의 뺀 줄 소리까지 ${fmtTime(heard)})</span>` : ""}</span>
        <div class="pad-actions">
          <span class="pad-group">시간</span>
          <button type="button" class="btn tool sm" data-rv="replay">↻ 다시 듣기 <kbd>R</kbd></button>
          <button type="button" class="btn tool sm" data-rv="earlier">◀ 시작 빨리 <kbd>←</kbd></button>
          <button type="button" class="btn tool sm" data-rv="later">시작 늦게 ▶ <kbd>→</kbd></button>
          <button type="button" class="btn tool sm" data-rv="endEarlier">◀ 끝 줄이기 <kbd>Shift</kbd>+<kbd>←</kbd></button>
          <button type="button" class="btn tool sm" data-rv="endLater">끝 늘리기 ▶ <kbd>Shift</kbd>+<kbd>→</kbd></button>
        </div>
        <div class="pad-actions">
          <span class="pad-group">줄</span>
          <button type="button" class="btn tool sm" data-rv="edit">✎ 가사 고치기 <kbd>E</kbd></button>
          <button type="button" class="btn tool sm" data-rv="merge">⤓ 아래 줄과 합치기 <kbd>M</kbd></button>
          <button type="button" class="btn tool sm" data-rv="split">✂ 두 줄로 나누기 <kbd>S</kbd></button>
          <button type="button" class="btn tool sm" data-rv="skip">${l.skip ? "↩ 되살리기" : "🚫 연습에서 빼기"} <kbd>D</kbd></button>
        </div>
        <div class="pad-actions">
          <button type="button" class="btn primary" data-rv="ok">✓ 맞아요 · 다음 줄 <kbd>Enter</kbd></button>
        </div>`;
    }
  }

  function scrollToRow(i) {
    const row = $(`#mTable tr[data-i="${i}"]`);
    if (row) row.scrollIntoView({ block: "nearest" });
  }

  // ── 모드: 시간 찍기 / 검수 ──
  function setMode(mode, quiet) {
    if (mode && !M.lines.length) {
      if (!quiet) toast("먼저 2단계에서 가사를 가져오거나 붙여 넣어 주세요.");
      mode = null;
    }
    if (mode === "review") {
      const miss = M.lines.findIndex((l) => l.start == null && !l.skip);
      if (miss >= 0) {
        if (!quiet) toast(`${miss + 1}번째 줄에 시작 시간이 없어요. 먼저 [⌨ 시간 찍기]로 시간을 넣어 주세요.`, 4500);
        mode = null;
      }
    }
    M.mode = mode;
    M.segEnd = null;
    $("#mTapMode").textContent = mode === "tap" ? "⌨ 시간 찍기 끄기" : "⌨ 시간 찍기";
    $("#mTapMode").classList.toggle("active", mode === "tap");
    $("#mReview").textContent = mode === "review" ? "⏸ 검수 멈추기" : "✔ 한 줄씩 검수하기";
    $("#mReview").classList.toggle("active", mode === "review");
    if (mode && document.activeElement) document.activeElement.blur();
    if (mode === "tap") {
      M.tapIdx = firstUntimed();
      if (M.tapIdx >= M.lines.length && !quiet) toast("모든 줄에 시간이 있어요. 다시 찍으려면 Backspace로 지우거나 표에서 고쳐 주세요.");
    }
    renderTable();
    if (mode === "review") {
      const i = firstUnchecked(M.revIdx >= 0 ? M.revIdx : 0);
      M.revIdx = i < 0 ? 0 : i;
      if (i < 0 && !quiet) toast("모든 줄을 이미 ✓ 했어요. 다시 들어 보려면 표의 ▶를 눌러요.");
      renderTable();
      scrollToRow(M.revIdx);
      playReview();
    } else if (!mode && M.player && M.player.ready && !quiet) {
      M.player.pause();
    }
  }

  // ── 시간 찍기 ──
  function markStart() {
    if (!M.player || !M.player.ready) return;
    if (M.tapIdx >= M.lines.length) { toast("모든 줄을 찍었어요. 마지막 줄이 끝나면 Enter를 눌러 주세요."); return; }
    const t = Math.max(0, M.player.time() - REACT);
    const prev = M.lines[M.tapIdx - 1];
    if (prev && prev.start != null && t <= prev.start) { toast("앞 줄보다 빠른 시간이에요. 조금 뒤에 눌러 주세요."); return; }
    M.lines[M.tapIdx].start = round2(t);
    M.tapIdx++;
    renderTable();
    scrollToRow(M.tapIdx);
  }
  function markEnd() {
    const i = M.tapIdx - 1;
    if (i < 0 || !M.player) return;
    const t = round2(M.player.time());
    if (t <= M.lines[i].start) return;
    M.lines[i].end = t;
    renderTable();
    toast(`${i + 1}번째 줄의 끝을 ${fmtTime(t)}로 표시했어요.`);
  }
  function undoMark() {
    if (M.tapIdx <= 0) return;
    M.tapIdx--;
    const l = M.lines[M.tapIdx];
    l.start = null;
    l.end = null;
    const prev = M.lines[M.tapIdx - 1];
    if (prev) prev.end = null;
    if (M.player) M.player.seek(Math.max(0, (prev && prev.start != null ? prev.start : 0) - 0.5));
    renderTable();
    scrollToRow(M.tapIdx);
  }

  // ── 검수: 한 줄 재생 → 멈춤 → ✓ 또는 고치기 ──
  function playReview() {
    const l = M.lines[M.revIdx];
    if (!l || !M.player || !M.player.ready || l.start == null) return;
    M.segEnd = playEnd(M.revIdx);
    M.player.seek(Math.max(0, l.start - 0.3));
    M.player.play();
  }
  // 끝을 고친 뒤에는 줄 끝부분(약 2.5초)만 다시 들려줍니다.
  function playTail() {
    const i = M.revIdx;
    const l = M.lines[i];
    if (!l || !M.player || !M.player.ready || l.start == null) return;
    const end = playEnd(i);
    M.segEnd = end;
    M.player.seek(Math.max(l.start, end - 2.5));
    M.player.play();
  }
  // 다음에 검수할 줄로 넘어가고, 다 했으면 마칩니다.
  function nextReview() {
    const next = firstUnchecked(M.revIdx + 1);
    if (next < 0) {
      setMode(null, true);
      if (M.player) M.player.pause();
      renderState();
      const kept = M.lines.length - skipCount();
      toast(kept > 0
        ? "🎉 모든 줄의 검수를 마쳤어요! 이제 아들·학생의 곡 목록에 공개돼요."
        : "모든 줄을 뺐어요. 연습할 줄이 하나는 있어야 공개돼요.", 6000);
      return;
    }
    M.revIdx = next;
    renderTable();
    scrollToRow(M.revIdx);
    playReview();
  }
  function markOk() {
    const l = M.lines[M.revIdx];
    if (!l) return;
    l.ok = true;
    l.skip = false;   // ✓ = 이 줄을 연습에 씁니다
    autoSave();
    nextReview();
  }

  // ── 줄 빼기·되살리기 ──
  function toggleSkip(i) {
    const l = M.lines[i];
    if (!l) return;
    l.skip = !l.skip;
    if (l.skip) l.ok = false;
    autoSave();
    if (M.mode === "review" && i === M.revIdx && l.skip) {
      toast(`${i + 1}번째 줄을 연습에서 뺐어요. 이 줄 소리는 앞 줄에 붙어 이어 들려요.`, 3500);
      nextReview();
      return;
    }
    renderTable();
    toast(l.skip ? `${i + 1}번째 줄을 연습에서 뺐어요. ↩를 누르면 되살아나요.` : `${i + 1}번째 줄을 되살렸어요. 들어 보고 ✓ 해 주세요.`, 3500);
  }
  async function skipRest() {
    const idx = M.lines.map((l, i) => (todo(l) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) { toast("✓ 하지 않은 줄이 없어요."); return; }
    const nums = idx.map((i) => i + 1).join(", ");
    const ok = await confirmBox(
      "✓ 안 한 줄을 연습에서 뺄까요?",
      `${nums}번 줄(${idx.length}개)을 연습에서 빼요. 표에는 흐리게 남고, 🚫 자리의 ↩를 누르면 되살아나요. 뺀 줄의 소리는 앞 줄에 붙어 이어 들려요.`,
      "빼기");
    if (!ok) return;
    idx.forEach((i) => { M.lines[i].skip = true; M.lines[i].ok = false; });
    if (M.mode) setMode(null, true);
    renderTable();
    autoSave();
    renderState();
    const saved = TT.store.song(M.vid);
    toast(saved && saved.reviewed
      ? `🚫 ${idx.length}줄을 뺐어요. 검수 완료 — 아들·학생 목록에 공개돼요.`
      : `🚫 ${idx.length}줄을 뺐어요.`, 5000);
  }

  // ── 줄 끝 늘리기·줄이기 (다음에 남는 줄의 시작까지만) ──
  function nudgeEnd(d) {
    const i = M.revIdx;
    const l = M.lines[i];
    if (!l || l.start == null) return;
    let t = round2(lineEnd(i) + d);
    if (t < l.start + 0.3) t = round2(l.start + 0.3);
    const cap = nextKeptStart(i);
    if (cap != null && t > cap) {
      t = cap;
      toast("다음 줄 시작까지만 늘릴 수 있어요. 더 늘리려면 아래 줄과 합치거나 아래 줄을 빼 주세요.", 4500);
    }
    l.end = t;
    renderTable();
    autoSave();
    playTail();
  }

  // ── 아래 줄과 합치기 ──
  function mergeDown() {
    const i = M.revIdx;
    const a = M.lines[i];
    const b = M.lines[i + 1];
    if (!a || !b) { toast("아래에 합칠 줄이 없어요."); return; }
    a.text = `${a.text.trim()} ${b.text.trim()}`.trim();
    if (a.start == null) a.start = b.start;
    a.end = b.end;              // 아래 줄의 끝(자동이면 그다음 줄 시작)
    const words = [...(a.words || []), ...(b.words || [])];
    a.words = words.length ? words : undefined;
    a.ok = false;
    a.skip = false;
    M.lines.splice(i + 1, 1);
    M.tapIdx = firstUntimed();
    renderTable();
    autoSave();
    scrollToRow(i);
    toast(`${i + 1}번째 줄과 아래 줄을 한 줄로 합쳤어요. 들어 보고 ✓ 해 주세요.`, 4000);
    playReview();
  }

  // ── 두 줄로 나누기: 둘째 줄이 시작할 낱말을 고르면, 시간은 글자 수 비율로 어림합니다 ──
  async function splitLine() {
    const i = M.revIdx;
    const l = M.lines[i];
    if (!l || l.start == null) return;
    const words = l.text.trim().split(/\s+/);
    if (words.length < 2) { toast("낱말이 하나뿐이라 나눌 수 없어요."); return; }
    if (M.player) M.player.pause();
    // 기본 선택: 글자 수로 가운데에 가장 가까운 낱말
    const total = l.text.trim().length;
    let best = 1, bestGap = Infinity, run = 0;
    for (let k = 1; k < words.length; k++) {
      run += words[k - 1].length + 1;
      const gap = Math.abs(run - total / 2);
      if (gap < bestGap) { bestGap = gap; best = k; }
    }
    const body = document.createElement("div");
    body.innerHTML = `<p>둘째 줄이 <b>시작할 낱말</b>을 골라 주세요. 시간은 글자 수로 어림하니, 나눈 뒤 들어 보며 맞춰 주세요.</p>
      <div class="split-words">${words.map((w, k) => k === 0
        ? `<span class="split-word first">${esc(w)}</span>`
        : `<label class="split-word"><input type="radio" name="splitAt" value="${k}" ${k === best ? "checked" : ""}><span>${esc(w)}</span></label>`).join("")}</div>`;
    const k = await TT.ui.modal({
      title: `${i + 1}번째 줄 나누기`,
      body,
      actions: [
        { label: "취소", value: null, kind: "ghost" },
        { label: "✂ 여기서 나누기", kind: "primary", value: (el) => { const r = el.querySelector("input[name=splitAt]:checked"); return r ? Number(r.value) : undefined; } }
      ]
    });
    if (!k) return;
    const first = words.slice(0, k).join(" ");
    const second = words.slice(k).join(" ");
    const s = l.start;
    const e = lineEnd(i);
    let t = round2(s + (e - s) * (first.length / (first.length + second.length + 1)));
    t = Math.min(Math.max(t, round2(s + 0.2)), round2(e - 0.2));
    const pick = (txt) => (l.words || []).filter((w) => txt.toLowerCase().includes(String(w.word).toLowerCase()));
    const b = { start: t, end: l.end, text: second, words: pick(second), ok: false, skip: false };
    l.text = first;
    l.words = pick(first);
    l.end = null;               // 첫째 줄은 둘째 줄 시작까지
    l.ok = false;
    l.skip = false;
    M.lines.splice(i + 1, 0, b);
    M.tapIdx = firstUntimed();
    renderTable();
    autoSave();
    scrollToRow(i);
    toast(`두 줄로 나눴어요. 둘째 줄은 ${fmtTime(t)}부터예요. 들어 보며 ←/→로 맞춰 주세요.`, 5000);
    playReview();
  }
  function nudge(d) {
    const i = M.revIdx;
    const l = M.lines[i];
    if (!l || l.start == null) return;
    const prev = M.lines[i - 1];
    const next = M.lines[i + 1];
    let t = round2(Math.max(0, l.start + d));
    if (prev && prev.start != null && t <= prev.start + 0.1) t = round2(prev.start + 0.1);
    if (next && next.start != null && t >= next.start - 0.1) t = round2(next.start - 0.1);
    l.start = t;
    if (prev && prev.end != null && prev.end > t) prev.end = t;
    if (l.end != null && l.end <= t + 0.1) l.end = null;
    renderTable();
    playReview();
  }
  function editLine() {
    const inp = $(`#mTable .l-in[data-i="${M.revIdx}"]`);
    if (!inp) return;
    if (M.player) M.player.pause();
    inp.focus();
    inp.select();
    toast("가사를 고친 뒤 Enter를 누르고, 다시 Enter(✓)로 다음 줄로 가요.", 4000);
  }
  function shiftAll(d) {
    if (!M.lines.length) return;
    M.lines.forEach((l) => {
      if (l.start != null) l.start = round2(Math.max(0, l.start + d));
      if (l.end != null) l.end = round2(Math.max((l.start || 0) + 0.1, l.end + d));
    });
    renderTable();
    autoSave();
    toast(`모든 줄을 ${Math.abs(d)}초 ${d > 0 ? "늦췄어요" : "당겼어요"}.`);
    if (M.mode === "review") playReview();
  }

  function onKey(e) {
    if (!M.mode || TT.app.screen() !== "maker") return;
    const tag = (document.activeElement && document.activeElement.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag) || document.querySelector(".modal-back")) return;
    if (M.mode === "tap") {
      if (e.code === "Space" || e.key === " ") { e.preventDefault(); markStart(); }
      else if (e.key === "Enter") { e.preventDefault(); markEnd(); }
      else if (e.key === "Backspace") { e.preventDefault(); undoMark(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); seekBy(-5); }
    } else if (M.mode === "review") {
      if (e.key === "Enter") { e.preventDefault(); markOk(); }
      else if (e.code === "KeyR") { e.preventDefault(); playReview(); }
      else if (e.code === "KeyE") { e.preventDefault(); editLine(); }
      else if (e.code === "KeyD") { e.preventDefault(); toggleSkip(M.revIdx); }
      else if (e.code === "KeyM") { e.preventDefault(); mergeDown(); }
      else if (e.code === "KeyS") { e.preventDefault(); splitLine(); }
      else if (e.key === "ArrowLeft" && e.shiftKey) { e.preventDefault(); nudgeEnd(-0.1); }
      else if (e.key === "ArrowRight" && e.shiftKey) { e.preventDefault(); nudgeEnd(0.1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); nudge(-0.1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); nudge(0.1); }
      else if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    }
  }

  // ── 재생 도구 ──
  function togglePlay() {
    if (!M.player || !M.player.ready) return;
    M.segEnd = null;
    if (M.player.state() === TT.YTState.PLAYING) M.player.pause(); else M.player.play();
  }
  function seekBy(d) {
    if (!M.player || !M.player.ready) return;
    M.player.seek(Math.max(0, M.player.time() + d));
  }
  function playLine(i) {
    const l = M.lines[i];
    if (!M.player || !M.player.ready || !l || l.start == null) { toast("먼저 이 줄의 시작 시간을 넣어 주세요."); return; }
    if (M.mode === "review") { M.revIdx = i; renderTable(); playReview(); return; }
    M.segEnd = lineEnd(i);
    M.player.seek(Math.max(0, l.start - 0.1));
    M.player.play();
  }
  function tick() {
    if (!M.player || !M.player.ready) return;
    const t = M.player.time();
    $("#mTime").textContent = fmtTime(t);
    if (M.segEnd != null && t >= M.segEnd - 0.1) { M.player.pause(); M.segEnd = null; }
    let now = -1;
    for (let i = 0; i < M.lines.length; i++) {
      const l = M.lines[i];
      if (l.start == null) break;
      if (t >= l.start && t < lineEnd(i)) { now = i; break; }
    }
    if (now !== M.nowRow) {
      const old = $("#mTable tr.now");
      if (old) old.classList.remove("now");
      const row = $(`#mTable tr[data-i="${now}"]`);
      if (row) row.classList.add("now");
      M.nowRow = now;
    }
  }

  // ── 가사 자동 찾기 (LRCLIB: 사람들이 함께 올리는 공개 가사 자료실) ──
  async function findLyrics() {
    const title = $("#mFindTitle").value.trim();
    const artist = $("#mFindArtist").value.trim();
    if (!title) { toast("곡 제목을 입력해 주세요."); return; }
    const btn = $("#mFind");
    btn.disabled = true;
    btn.textContent = "찾는 중…";
    try {
      const url = `${LRCLIB}?track_name=${encodeURIComponent(title)}` + (artist ? `&artist_name=${encodeURIComponent(artist)}` : "");
      const res = await fetch(url);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      const list = (Array.isArray(data) ? data : []).filter((r) => r && !r.instrumental && r.syncedLyrics && String(r.syncedLyrics).trim());
      const dur = M.player && M.player.ready ? M.player.duration() : 0;
      list.forEach((r) => {
        r._gap = dur ? Math.abs((r.duration || 0) - dur) : null;
        // 줄 수·글자 수는 시간 표시를 뺀 실제 줄로 셉니다(LRC 원문 길이에는 시간·머리말이 섞여 있음).
        const lines = parsePaste(r.syncedLyrics);
        r._lines = lines.length;
        r._chars = lines.reduce((n, l) => n + l.text.length, 0);
      });
      // 영상과 길이가 맞는 버전(±3초)을 먼저, 그 안에서는 가사가 가장 긴(빠진 줄이 없는) 버전을 먼저.
      // 예: 「Sing」은 200초 버전이 38줄(뒷부분 없음), 199초 버전이 51줄(온전)이라 199초가 먼저 와야 합니다.
      if (dur) list.sort((a, b) => {
        const fa = a._gap <= FIT_GAP, fb = b._gap <= FIT_GAP;
        if (fa !== fb) return fa ? -1 : 1;
        if (fa) return (b._chars - a._chars) || (a._gap - b._gap);
        return a._gap - b._gap;
      });
      M.found = list.slice(0, 12);
      if (!M.found.length) {
        $("#mFindResult").hidden = true;
        toast("시간이 붙은 가사를 찾지 못했어요. 제목·가수를 바꿔 보거나 아래에 직접 붙여 넣어 주세요.", 5000);
        return;
      }
      $("#mFindPick").innerHTML = M.found.map((r, i) => {
        const fit = r._gap == null ? "" : r._gap <= FIT_GAP ? " · 영상과 길이 같음 ✓" : ` · 영상과 ${Math.round(r._gap)}초 차이`;
        return `<option value="${i}">${esc(r.trackName)} — ${esc(r.artistName)} · ${esc(r.albumName || "앨범 정보 없음")} · ${fmtLen(r.duration)} · ${r._lines}줄${fit}</option>`;
      }).join("");
      $("#mFindResult").hidden = false;
      toast(`${M.found.length}개 버전을 찾았어요.${dur ? " 영상과 길이가 맞는 버전 가운데 가사가 가장 긴 버전을 골라 두었어요." : ""}`, 4000);
    } catch (e) {
      toast("가사 자료실에 연결하지 못했어요. 인터넷을 확인하거나 아래에 가사를 직접 붙여 넣어 주세요.", 5000);
    } finally {
      btn.disabled = false;
      btn.textContent = "🔎 가사 자동 찾기";
    }
  }

  async function applyFound() {
    const r = M.found[Number($("#mFindPick").value)];
    if (!r) return;
    if (M.lines.length && !(await confirmBox("가져온 가사로 바꿀까요?", "지금 표에 있는 줄·시간·검수 표시가 모두 새것으로 바뀌어요.", "바꾸기", true))) return;
    const parsed = parsePaste(r.syncedLyrics);
    if (!parsed.length) { toast("이 버전에서는 줄을 읽지 못했어요. 다른 버전을 골라 주세요."); return; }
    setMode(null, true);
    M.lines = parsed.map((l) => Object.assign(l, { ok: false }));
    M.source = { kind: "lrclib", id: r.id, album: r.albumName || "", duration: r.duration || 0 };
    M.tapIdx = firstUntimed();
    M.revIdx = 0;
    if (!$("#mGloss").value.trim()) suggestGloss(true);
    renderTable();
    autoSave();
    renderState();
    const step = $("#mStep3");
    if (step) step.scrollIntoView({ behavior: "smooth", block: "start" });
    toast(`${M.lines.length}줄을 채웠어요. 이제 [✔ 한 줄씩 검수하기]를 눌러 들어 보며 확인해 주세요.`, 5500);
  }

  // ── 단어 뜻 ──
  function parseGloss(text) {
    const out = [];
    const seen = new Set();
    String(text || "").split(/\r?\n/).forEach((row) => {
      const m = row.match(/^\s*([A-Za-z][A-Za-z' -]*?)\s*(?:=|:|\t)\s*(.+?)\s*$/);
      if (!m) return;
      const word = m[1].trim().toLowerCase();
      if (seen.has(word)) return;
      seen.add(word);
      out.push({ word, ko: m[2] });
    });
    return out;
  }
  function suggestGloss(quiet) {
    if (!M.lines.length) { if (!quiet) toast("먼저 줄을 나눠 주세요."); return; }
    const have = parseGloss($("#mGloss").value);
    const known = new Set(have.map((g) => g.word));
    const add = [];
    M.lines.forEach((l) => {
      (TT.typing.normalizeText(l.text).match(/[A-Za-z'-]+/g) || []).forEach((w) => {
        const base = TT.typing.dictBase(w);
        if (base && !known.has(base)) { known.add(base); add.push(`${base} = ${TT.dict[base]}`); }
      });
    });
    if (!add.length) { if (!quiet) toast("단어장에서 더 찾은 단어가 없어요. 직접 「단어 = 뜻」으로 적어 주세요."); return; }
    const cur = $("#mGloss").value.trim();
    $("#mGloss").value = (cur ? cur + "\n" : "") + add.join("\n");
    if (!quiet) toast(`단어장에서 ${add.length}개를 찾아 넣었어요. 뜻을 다듬어 주세요.`);
  }

  // ── 저장 ──
  // silent: 검수 ✓ 때마다 조용히 저장(문제가 있으면 저장하지 않고 넘어감)
  function buildSong(silent) {
    M.saveError = "";
    const say = (msg, row) => { M.saveError = msg; if (!silent) { toast(msg); if (row != null) scrollToRow(row); } return null; };
    if (!M.lines.length) return say("먼저 가사를 가져오거나 붙여 넣고 [줄 나누기]를 눌러 주세요.");
    const miss = M.lines.findIndex((l) => !l.skip && (l.start == null || isNaN(l.start)));
    if (miss >= 0) return say(`${miss + 1}번째 줄에 시작 시간이 없어요.`, miss);
    // 시작 순서는 연습에 쓰는 줄(빼지 않은 줄)끼리만 봅니다.
    let prevKept = -1;
    for (let i = 0; i < M.lines.length; i++) {
      if (M.lines[i].skip) continue;
      if (prevKept >= 0 && M.lines[i].start <= M.lines[prevKept].start) return say(`${i + 1}번째 줄 시작이 앞 줄(${prevKept + 1}번)보다 빠르거나 같아요.`, i);
      prevKept = i;
    }
    const dur = M.player && M.player.ready ? M.player.duration() : 0;
    let guessed = false;
    const lines = M.lines.map((l, i) => {
      const hasStart = l.start != null && !isNaN(l.start);
      const next = M.lines.slice(i + 1).find((n) => n.start != null && !isNaN(n.start));
      let end = null;
      if (!hasStart) end = null;                       // 시간 없는 뺀 줄
      else if (l.end != null && l.end > l.start) end = l.end;
      else if (next && next.start > l.start) end = next.start;
      else {
        if (!l.skip) guessed = true;
        end = l.start + Math.min(8, Math.max(3, l.text.length * 0.12));
        if (dur) end = Math.min(end, dur);
      }
      const out = { start: hasStart ? round2(l.start) : null, end: end == null ? null : round2(end), text: TT.typing.normalizeText(l.text), ok: !!l.ok && !l.skip };
      if (l.skip) out.skip = true;
      if (l.words && l.words.length) out.words = l.words;
      return out;
    });
    const kept = lines.filter((l) => !l.skip);
    if (guessed && !silent) toast("마지막 줄의 끝 시간을 어림해서 넣었어요. 정확히 하려면 시간 찍기에서 마지막 줄이 끝날 때 Enter를 눌러 주세요.", 5000);
    const meta = TT.songs.meta(M.vid) || {};
    return {
      app: "typing-tube", kind: "song",
      videoId: M.vid, title: meta.title || "", artist: meta.artist || "", level: meta.level || "",
      lines,
      // 공개 조건: 연습할 줄이 하나 이상 있고, 그 줄이 모두 ✓
      reviewed: kept.length > 0 && kept.every((l) => l.ok),
      source: M.source || { kind: "manual" },
      glossary: parseGloss($("#mGloss").value),
      updatedAt: new Date().toISOString()
    };
  }

  function autoSave() {
    const song = buildSong(true);
    if (song) {
      if (TT.store.saveSong(song)) { TT.cloud.songChanged(song.videoId); renderState(); }
      return;
    }
    // 자동 저장이 안 될 때 조용히 넘어가지 않고 이유를 알려 줍니다(고칠 때까지 ✓가 저장되지 않으므로).
    if (M.saveError) toast(`⚠ 자동 저장이 안 됐어요: ${M.saveError} 표에서 시간을 고치면 다시 저장돼요.`, 6000);
  }

  function save() {
    const song = buildSong(false);
    if (!song) return;
    if (TT.store.saveSong(song)) {
      TT.cloud.songChanged(song.videoId);
      renderState();
      const kept = song.lines.filter((l) => !l.skip);
      const skipped = song.lines.length - kept.length;
      const skipNote = skipped ? ` (뺀 줄 ${skipped}개 따로)` : "";
      toast(song.reviewed
        ? `💾 「${song.title}」 ${kept.length}줄${skipNote}을 저장했어요. 검수 완료 — 아들·학생 목록에 공개돼요.`
        : `💾 저장했어요. 검수 ✓ ${kept.filter((l) => l.ok).length}/${kept.length}줄${skipNote} — 모두 ✓하면 공개돼요.`, 4500);
    }
  }

  function exportSong() {
    const song = buildSong(false);
    if (!song) return;
    TT.ui.download(`곡-${song.title || song.videoId}.json`, song);
  }

  async function importSong() {
    const text = await TT.ui.pickTextFile();
    if (!text) return;
    let obj;
    try { obj = JSON.parse(text); } catch (e) { toast("곡 파일을 읽지 못했어요."); return; }
    if (!obj || !obj.videoId || !Array.isArray(obj.lines)) { toast("타이핑 튜브 곡 파일이 아니에요."); return; }
    if (!TT.songs.meta(obj.videoId)) { toast("지금 영상 목록에 없는 곡이에요. 목록에 먼저 더해야 해요."); return; }
    $("#mSong").value = obj.videoId;
    loadSong(obj.videoId);
    M.lines = fromSaved(obj.lines);
    M.source = obj.source || null;
    $("#mGloss").value = (obj.glossary || []).map((g) => `${g.word} = ${g.ko}`).join("\n");
    M.tapIdx = firstUntimed();
    M.revIdx = firstUnchecked();
    renderTable();
    toast("곡 파일을 불러왔어요. 확인한 뒤 [이 기기에 저장]을 눌러 주세요.", 4000);
  }

  async function removeSong() {
    if (!TT.store.song(M.vid)) { toast("이 기기에 저장된 줄 자료가 없어요."); return; }
    const meta = TT.songs.meta(M.vid) || {};
    const ok = await confirmBox("줄 자료 지우기", `「${meta.title}」의 줄 자료를 이 기기에서 지울까요? 연습 기록은 남아 있어요.`, "지우기", true);
    if (!ok) return;
    TT.store.removeSong(M.vid);
    TT.cloud.songRemoved(M.vid);
    loadSong(M.vid);
    toast("줄 자료를 지웠어요.");
  }

  // 구간(clip)이 정해진 영상: 스크립트를 통째로 붙여 넣어도 그 구간의 줄만 남깁니다.
  function trimToClip(parsed, clip) {
    if (!clip || !parsed.length || !parsed.every((l) => l.start != null)) return { lines: parsed, cut: 0 };
    const inClip = parsed.filter((l) => l.start >= clip.start - 0.5 && l.start < clip.end);
    if (!inClip.length) return { lines: [], cut: parsed.length, none: true };
    const last = inClip[inClip.length - 1];
    const after = parsed[parsed.indexOf(last) + 1];
    const lastEnd = last.end != null ? last.end : after ? after.start : clip.end;
    last.end = Math.min(lastEnd, clip.end);
    return { lines: inClip, cut: parsed.length - inClip.length };
  }

  async function split() {
    let parsed = parsePaste($("#mPaste").value);
    if (!parsed.length) { toast("붙여 넣은 가사가 없어요."); return; }
    // 한국어 화면의 유튜브는 번역 자막이 있는 영상(TED 등)의 스크립트를 한국어로 보여 줍니다.
    const korean = parsed.filter((l) => /[가-힣]/.test(l.text)).length;
    if (korean > parsed.length * 0.3) {
      toast("붙여 넣은 스크립트가 한국어예요. 유튜브 오른쪽 위 프로필 사진(로그인 안 했으면 ⋮) → 언어 → English로 바꾼 뒤, 스크립트를 다시 열어 복사해 주세요. 다 하면 같은 곳에서 한국어로 되돌리면 돼요.", 9000);
      return;
    }
    const dropped = parsed.untimedDropped || 0;
    const clip = (TT.songs.meta(M.vid) || {}).clip;
    const t = trimToClip(parsed, clip);
    if (t.none) {
      toast(`붙여 넣은 스크립트에 이 영상의 구간(${fmtTime(clip.start, 0)}~${fmtTime(clip.end, 0)}) 줄이 없어요. 다른 영상의 스크립트가 아닌지 확인해 주세요.`, 6000);
      return;
    }
    parsed = t.lines;
    if (M.lines.length) {
      const ok = await confirmBox("줄을 다시 나눌까요?", "지금 표의 줄·시간·검수 표시가 모두 지워져요. (가사 한두 군데만 고치려면 아래 표에서 바로 고치면 시간이 남아요)", "다시 나누기", true);
      if (!ok) return;
    }
    setMode(null, true);
    M.lines = parsed.map((l) => Object.assign(l, { ok: false }));
    M.source = { kind: "manual" };
    M.tapIdx = firstUntimed();
    M.revIdx = 0;
    renderTable();
    const timed = parsed.filter((l) => l.start != null).length;
    const extra = (t.cut ? ` 정해 둔 구간 ${fmtTime(clip.start, 0)}~${fmtTime(clip.end, 0)}만 남기고 ${t.cut}줄은 뺐어요.` : "") +
      (dropped ? ` 시간 없는 제목 줄 ${dropped}개는 건너뛰었어요.` : "");
    toast(timed === parsed.length
      ? `${parsed.length}줄로 나눴어요. 시간이 함께 들어 있어요.${extra} 3단계에서 [✔ 한 줄씩 검수하기]로 확인해 주세요.`
      : `${parsed.length}줄로 나눴어요. 이제 3단계에서 [⌨ 시간 찍기]로 시간을 넣어 주세요.`, 6500);
  }

  function init() {
    $("#mSong").addEventListener("change", (e) => loadSong(e.target.value));
    $("#mFind").addEventListener("click", findLyrics);
    $("#mFindApply").addEventListener("click", applyFound);
    $("#mSplit").addEventListener("click", split);
    $("#mPlayStart").addEventListener("click", () => { if (M.player && M.player.ready) { M.segEnd = null; M.player.seek(0); M.player.play(); } });
    $("#mPlayPause").addEventListener("click", togglePlay);
    // 영상 위 투명 덮개: 유튜브로 나가는 링크를 막고, 키보드 초점이 영상 안으로 들어가지 않게 합니다.
    $("#mShield").addEventListener("click", togglePlay);
    $("#mBack5").addEventListener("click", () => seekBy(-5));
    $("#mSlow").addEventListener("click", () => {
      M.rate = M.rate === 1 ? 0.75 : 1;
      if (M.player) M.player.setRate(M.rate);
      $("#mSlow").textContent = M.rate === 1 ? "🐢 느리게" : "🐇 보통 빠르기";
    });
    $("#mTapMode").addEventListener("click", () => setMode(M.mode === "tap" ? null : "tap"));
    $("#mReview").addEventListener("click", () => setMode(M.mode === "review" ? null : "review"));
    $("#mReviewPad").addEventListener("click", (e) => {
      const b = e.target.closest("[data-rv]");
      if (!b) return;
      const act = b.dataset.rv;
      if (act === "ok") markOk();
      else if (act === "replay") playReview();
      else if (act === "earlier") nudge(-0.1);
      else if (act === "later") nudge(0.1);
      else if (act === "edit") editLine();
      else if (act === "endEarlier") nudgeEnd(-0.1);
      else if (act === "endLater") nudgeEnd(0.1);
      else if (act === "merge") mergeDown();
      else if (act === "split") splitLine();
      else if (act === "skip") toggleSkip(M.revIdx);
    });
    $("#mSkipRest").addEventListener("click", skipRest);
    $("#mHideSong").addEventListener("click", toggleSongHidden);
    $("#mAddVideo").addEventListener("click", addVideoFlow);
    $$("[data-shift]").forEach((b) => b.addEventListener("click", () => shiftAll(Number(b.dataset.shift))));
    $("#mSuggest").addEventListener("click", () => suggestGloss(false));
    $("#mSave").addEventListener("click", save);
    $("#mExport").addEventListener("click", exportSong);
    $("#mImport").addEventListener("click", importSong);
    $("#mDelete").addEventListener("click", removeSong);
    $("#mTable").addEventListener("click", (e) => {
      const b = e.target.closest("[data-play]");
      if (b) playLine(Number(b.dataset.play));
      const s = e.target.closest("[data-skip]");
      if (s) toggleSkip(Number(s.dataset.skip));
    });
    $("#mTable").addEventListener("change", (e) => {
      const el = e.target;
      const i = Number(el.dataset.i);
      if (!M.lines[i]) return;
      const k = el.dataset.k;
      if (k === "text") M.lines[i].text = el.value;
      else if (k === "ok") {
        M.lines[i].ok = el.checked;
        if (el.checked && M.lines[i].skip) { M.lines[i].skip = false; renderTable(); }   // ✓ = 연습에 씀
        el.blur();
      }
      else {
        const v = el.value === "" ? null : round2(parseFloat(el.value));
        M.lines[i][k] = v == null || isNaN(v) ? null : v;
        M.tapIdx = firstUntimed();
      }
      renderPads();
      renderReviewCount();
      autoSave();
    });
    // 표 안에서 Enter = 입력 마침(검수 ✓로 넘어가지 않게 여기서 멈춤)
    $("#mTable").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") {
        e.preventDefault();
        e.stopPropagation();
        e.target.blur();
      }
    });
    // 버튼을 누른 뒤 초점을 풀어, 단축키(Space·Enter)가 버튼을 또 누르지 않게 합니다.
    $('[data-screen="maker"]').addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b && M.mode) setTimeout(() => b.blur(), 0);
    });
    document.addEventListener("keydown", onKey);
  }

  TT.maker = { init, open, close, parsePaste };
})();
