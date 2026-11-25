// 앱 전체 흐름 — 첫 설정 → 사용자 고르기 → 곡 고르기 → 연습 → 완료, 그리고 관리 화면
(function () {
  const TT = (window.TT = window.TT || {});
  const { $, $$, esc, toast, modal, askPin, confirmBox, today } = TT.ui;
  const store = TT.store;

  const AVATARS = ["🦊", "🐻", "🐰", "🐼", "🐯", "🐧", "🦉", "🐢", "🐳", "🦁", "🐨", "🐥"];
  const ADMIN_MINUTES = 10; // PIN을 한 번 넣으면 10분 동안 다시 묻지 않습니다

  const app = { screen: null, profile: null, adminUntil: 0, lastDone: null, cat: null };

  // ── 화면 전환 ──
  function show(name) {
    if (app.screen === "practice" && name !== "practice") TT.practice.close();
    if (app.screen === "maker" && name !== "maker") TT.maker.close();
    $$("main > [data-screen]").forEach((s) => { s.hidden = s.dataset.screen !== name; });
    app.screen = name;
    document.body.dataset.view = name; // 화면별 여백 조정용(data-screen과 이름이 겹치지 않게)
    window.scrollTo(0, 0);
    updateWho();
  }
  function updateWho() {
    const chip = $("#whoChip");
    const showChip = app.profile && !["setup", "profiles"].includes(app.screen);
    chip.hidden = !showChip;
    if (showChip) chip.textContent = `${app.profile.avatar} ${app.profile.nickname}`;
  }

  // ── 밝게·어둡게 ──
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const btn = $("#themeBtn");
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "밝은 화면으로 바꾸기" : "어두운 화면으로 바꾸기");
    btn.title = btn.getAttribute("aria-label");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#151a23" : "#2f6f6a";
  }
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    store.saveSettings({ theme: next });
    applyTheme(next);
  }

  // ── 관리자 확인 ──
  async function requireAdmin() {
    if (!store.hasAdmin()) {
      await modal({ title: "관리자가 없는 기기예요", body: "<p>학생으로 시작한 기기라 관리 화면이 없어요. 곡 고르기와 연습만 할 수 있어요.</p>" });
      return false;
    }
    if (Date.now() < app.adminUntil) return true;
    const pin = await askPin();
    if (pin == null) return false;
    if (await store.checkPin(pin)) {
      app.adminUntil = Date.now() + ADMIN_MINUTES * 60 * 1000;
      return true;
    }
    toast("PIN이 맞지 않아요. 다시 확인해 주세요.");
    return false;
  }

  function avatarOptions(name, selected) {
    return AVATARS.map((a) =>
      `<label class="av-opt"><input type="radio" name="${name}" value="${a}" ${a === selected ? "checked" : ""}><span>${a}</span></label>`
    ).join("");
  }

  // 닉네임·그림 입력 창
  function profileModal({ title, nickname = "", avatar, exceptId } = {}) {
    const pick = avatar || AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const body =
      `<label class="field">닉네임 (12자 이내)<input type="text" class="nick" maxlength="12" value="${esc(nickname)}" placeholder="예: 별빛, 축구왕"></label>` +
      `<div class="field"><span>그림 고르기</span><div class="avatar-pick">${avatarOptions("avatarModal", pick)}</div></div>` +
      `<p class="note">실명 대신 닉네임을 써 주세요. 사진은 넣지 않아요.</p>`;
    return modal({
      title, body,
      actions: [
        { label: "취소", value: null, kind: "ghost" },
        {
          label: "저장", kind: "primary",
          value: (el) => {
            const n = $(".nick", el).value.trim();
            if (!n) { toast("닉네임을 입력해 주세요."); return undefined; }
            if (store.nicknameTaken(n, exceptId)) { toast("이미 있는 닉네임이에요. 다른 이름을 골라 주세요."); return undefined; }
            const a = ($("input[name=avatarModal]:checked", el) || {}).value || pick;
            return { nickname: n, avatar: a };
          }
        }
      ]
    });
  }

  // ── 첫 설정 ──
  function initSetup() {
    $("#setupAvatars").innerHTML = avatarOptions("avatar", "🦉");
    // 곡 창고가 있으면 「학생으로 시작하기」(반 암호)를 먼저 보여 줍니다.
    const cloudOn = TT.cloud.enabled();
    $("#studentForm").hidden = !cloudOn;
    $("#adminSetupHead").hidden = !cloudOn;
    $("#studentAvatars").innerHTML = avatarOptions("avatarStudent", AVATARS[Math.floor(Math.random() * AVATARS.length)]);
    $("#studentForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const code = f.code.value.trim();
      const nickname = f.nickname.value.trim();
      const avatar = (f.querySelector("input[name=avatarStudent]:checked") || {}).value || "🦉";
      if (!code) return toast("반 암호를 넣어 주세요.");
      if (!nickname) return toast("닉네임을 넣어 주세요.");
      const btn = f.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = "반 암호 확인 중…";
      try {
        const r = await TT.cloud.connectCode(code);
        const p = store.addProfile({ nickname, avatar, role: "learner" });
        f.reset();
        chooseProfile(p.id);
        toast(`반가워요, ${p.nickname} 님! 곡 ${r ? r.songs : 0}개를 받았어요.`, 4000);
      } catch (err) {
        toast(err.message, 5000);
      } finally {
        btn.disabled = false;
        btn.textContent = "시작하기";
      }
    });
    $("#setupForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const nickname = f.nickname.value.trim();
      const pin = f.pin.value.trim();
      const avatar = (f.querySelector("input[name=avatar]:checked") || {}).value || "🦉";
      if (!nickname) return toast("관리자 닉네임을 입력해 주세요.");
      if (!/^\d{4}$/.test(pin)) return toast("PIN은 숫자 4자리로 정해 주세요.");
      if (pin !== f.pin2.value.trim()) return toast("두 번 입력한 PIN이 서로 달라요.");
      await store.setupAdmin({ nickname, avatar, pin });
      app.adminUntil = Date.now() + ADMIN_MINUTES * 60 * 1000;
      f.reset();
      renderProfiles();
      show("profiles");
      toast("관리자를 만들었어요. 이제 [＋ 사용자 추가]로 자녀·학생을 더해 보세요.", 4500);
    });
  }

  // ── 사용자 고르기 ──
  function renderProfiles() {
    const list = store.profiles();
    $("#profileGrid").innerHTML = list.map((p) => `
      <button type="button" class="profile-card" data-id="${esc(p.id)}">
        <span class="av-big">${esc(p.avatar)}</span>
        <strong>${esc(p.nickname)}</strong>
        ${p.role === "admin" ? `<span class="tag">관리자</span>` : `<span class="tag soft">${p.strict ? "엄격하게" : "너그럽게"}</span>`}
      </button>`).join("");
    $("#adminBtn").hidden = !store.hasAdmin();
  }
  function chooseProfile(id) {
    const p = store.profile(id);
    if (!p) return;
    app.profile = p;
    store.saveSettings({ lastProfile: p.id });
    app.cat = null;
    goCats();
  }
  async function addProfileFlow() {
    // 학생으로 시작한 기기(관리자 없음)에서는 형제·자매를 PIN 없이 더할 수 있어요.
    if (store.hasAdmin() && !(await requireAdmin())) return null;
    const r = await profileModal({ title: "사용자 추가" });
    if (!r) return null;
    const p = store.addProfile(r);
    renderProfiles();
    if (app.screen === "admin") renderAdmin();
    toast(`${p.avatar} ${p.nickname} 님을 추가했어요.`);
    return p;
  }

  // ── 분류 고르기 ──
  // 학생에게는 검수를 마친 곡만, 관리자에게는 준비 중인 것까지 보여 줍니다.
  // 뺀 곡(🚫)은 학생에게 보이지 않고, 관리자에게는 맨 아래에 흐리게 남습니다.
  function songSets(isAdmin) {
    const all = TT.songs.list();
    const out = (it) => TT.songs.isHidden(it.videoId);
    const active = all.filter((it) => !out(it));
    const published = active.filter((it) => TT.songs.isPublished(it.song));
    const visible = isAdmin ? active.concat(all.filter(out)) : published;
    return { all, out, active, published, visible };
  }
  const inCat = (id) => (it) => TT.songs.catOf(it).id === id;

  function goCats() {
    if (!app.profile) { renderProfiles(); show("profiles"); return; }
    app.profile = store.profile(app.profile.id) || app.profile;
    renderCats();
    show("cats");
  }
  // 분류 카드: 곡 수 + 내 완주 수. 학생에게 아직 곡이 없는 분류는 「곧 열려요」로 흐리게.
  function renderCats() {
    const p = app.profile;
    const isAdmin = p.role === "admin";
    $("#catsHello").textContent = `${p.avatar} ${p.nickname} 님, 무엇으로 연습할까요?`;
    const { active, published } = songSets(isAdmin);
    const doneIn = (list) => list.filter((it) => { const r = store.record(p.id, it.videoId); return r && r.completed; }).length;
    $("#catGrid").innerHTML = (TT.categories || []).map((c) => {
      const pub = published.filter(inCat(c.id));
      const ready = active.filter(inCat(c.id)).length - pub.length;
      const done = doneIn(pub);
      const soon = !isAdmin && !pub.length;
      const meta = soon ? "곧 열려요"
        : isAdmin ? `공개 ${pub.length}곡${ready ? ` · 준비 중 ${ready}곡` : ""}${done ? ` · 완주 ${done}곡` : ""}`
        : `${pub.length}곡 · 완주 ${done}곡`;
      return `
        <button type="button" class="cat-card${soon ? " is-soon" : ""}${done && done === pub.length ? " all-done" : ""}" data-cat="${esc(c.id)}">
          <span class="cat-icon" aria-hidden="true">${c.icon}</span>
          <strong>${esc(c.name)}</strong>
          <span class="cat-meta">${esc(meta)}</span>
        </button>`;
    }).join("");
    $("#catsNote").textContent = isAdmin ? "관리자에게는 준비 중인 곡도 보여요. 학생에게는 검수를 마친 곡만 보여요." : "";
    renderCloudBar();
  }
  function chooseCat(id) {
    const isAdmin = app.profile && app.profile.role === "admin";
    if (!isAdmin && !songSets(false).published.some(inCat(id))) {
      toast("곧 열려요! 선생님(부모님)이 준비하면 여기에 나와요.");
      return;
    }
    app.cat = id;
    goSongs();
  }

  // ── 곡 고르기 ──
  function goSongs() {
    if (!app.profile) { renderProfiles(); show("profiles"); return; }
    if (!app.cat) { goCats(); return; }
    app.profile = store.profile(app.profile.id) || app.profile;
    renderSongs();
    show("songs");
  }
  // 예상 시간: 너그럽게 채점에서 칠 글자 수 ÷ 보통 속도(15 WPM = 분당 75자)
  function estMinutes(song) {
    const chars = TT.songs.keptLines(song).reduce((n, l) => n + String(l.text || "").replace(/[^A-Za-z0-9 ]/g, "").length, 0);
    return Math.max(1, Math.round(chars / 75));
  }
  function songStatus(item, rec, isAdmin) {
    const total = item.song ? TT.songs.keptLines(item.song).length : 0;
    if (TT.songs.isHidden(item.videoId)) return { text: "🚫 뺀 곡 · 학생에게 보이지 않아요 (자막 준비실에서 되살리기)", cls: "muted" };
    if (!item.song) return { text: "줄 자료 준비 중", cls: "muted" };
    if (!TT.songs.isPublished(item.song)) {
      const pr = TT.songs.reviewProgress(item.song);
      return isAdmin
        ? { text: `검수 중 ✓ ${pr.done}/${pr.total}줄 · 아직 공개 전 (관리자 미리 연습 가능)`, cls: "go" }
        : { text: "곧 열려요 · 준비 중", cls: "muted" };
    }
    if (rec && rec.current && rec.current.lineIndex > 0) return { text: `이어서 하기 · ${rec.current.lineIndex}/${total}줄`, cls: "go" };
    if (rec && rec.completed && rec.last) return { text: `완주 ${rec.completions || 1}회 · 지난번 정확도 ${rec.last.accuracy}% · ${rec.last.wpm} WPM`, cls: "done" };
    return { text: `${total}줄 · 약 ${estMinutes(item.song)}분 · 처음 도전`, cls: "new" };
  }
  function renderSongs() {
    const p = app.profile;
    const isAdmin = p.role === "admin";
    const cat = (TT.categories || []).find((c) => c.id === app.cat) || { icon: "🎵", name: "곡" };
    $("#songsHello").textContent = `${cat.icon} ${cat.name}`;
    const { out, active, visible } = songSets(isAdmin);
    const items = visible.filter(inCat(app.cat));
    const hidden = active.filter(inCat(app.cat)).length - items.filter((it) => !out(it)).length; // 학생에게: 이 분류의 곧 열릴 곡 수
    $("#songsNote").textContent = isAdmin
      ? "관리자에게는 검수 중이거나 줄 자료가 없는 곡도 보여요. 학생에게는 검수를 마친 곡만 보여요."
      : hidden ? `곧 열릴 곡·영상이 ${hidden}개 준비 중이에요. 조금만 기다려 주세요!` : "";
    if (!items.length) {
      $("#songGrid").innerHTML = isAdmin
        ? `<p class="empty-songs">이 분류에는 아직 영상이 없어요. ⚙ 관리 → ✎ 자막 준비실의 [➕ 영상 더하기]로 더할 수 있어요.</p>`
        : `<p class="empty-songs">아직 연습할 수 있는 곡이 없어요. 관리자가 곡을 준비하면 여기에 나타나요.</p>`;
      return;
    }
    $("#songGrid").innerHTML = items.map((item) => {
      const rec = store.record(p.id, item.videoId);
      const st = songStatus(item, rec, isAdmin);
      return `
        <button type="button" class="song-card${out(item) ? " is-out" : ""}" data-vid="${esc(item.videoId)}">
          <span class="thumb"><img src="https://i.ytimg.com/vi/${encodeURIComponent(item.videoId)}/hqdefault.jpg" alt="" loading="lazy"></span>
          <span class="song-body">
            <span class="song-tags">${item.level ? `<span class="tag soft">${esc(item.level)}</span>` : ""}</span>
            <strong>${esc(item.title)}</strong>
            <span class="artist">${esc(item.artist || "")}</span>
            <span class="song-state ${st.cls}">${esc(st.text)}</span>
          </span>
        </button>`;
    }).join("");
  }
  async function startSong(vid, opts = {}) {
    const song = TT.songs.get(vid);
    const p = app.profile;
    if (TT.songs.isHidden(vid)) {
      if (p.role !== "admin") return;
      const go = await modal({
        title: "뺀 곡이에요",
        body: "<p>이 곡은 연습 목록에서 뺐어요. 아들·학생에게는 보이지 않아요.<br>[자막 준비실]에서 ↩ 되살리기를 누르면 다시 목록에 나와요. 검수한 줄 자료는 그대로 있어요.</p>",
        actions: [{ label: "닫기", value: false, kind: "ghost" }, { label: "✎ 자막 준비실로 가기", value: true, kind: "primary" }]
      });
      if (go) openMaker(vid);
      return;
    }
    if (opts.replay && song && song.lines && song.lines.length) {
      show("practice");
      TT.practice.open(song, p, { replay: true });
      return;
    }
    if (!song || !song.lines || !song.lines.length) {
      if (p.role === "admin") {
        const go = await modal({
          title: "아직 줄 자료가 없어요",
          body: "<p>이 곡은 아직 연습용 줄(가사+시간)이 없어요. [자막 준비실]에서 가사를 가져오고 한 줄씩 검수해 주세요.</p>",
          actions: [{ label: "닫기", value: false, kind: "ghost" }, { label: "✎ 자막 준비실로 가기", value: true, kind: "primary" }]
        });
        if (go && (await requireAdmin())) openMaker(vid);
      } else {
        await modal({ title: "아직 준비 중이에요", body: "<p>관리자가 이 곡의 줄 자료를 만들면 바로 연습할 수 있어요. 조금만 기다려 주세요!</p>" });
      }
      return;
    }
    if (!TT.songs.isPublished(song)) {
      if (p.role !== "admin") {
        await modal({ title: "아직 준비 중이에요", body: "<p>관리자가 가사를 한 줄씩 확인하고 있어요. 확인이 끝나면 바로 연습할 수 있어요. 조금만 기다려 주세요!</p>" });
        return;
      }
      const pr = TT.songs.reviewProgress(song);
      const v = await modal({
        title: "검수 중인 곡이에요",
        body: `<p>검수 ✓ ${pr.done}/${pr.total}줄. 아들·학생에게는 아직 보이지 않아요.<br>관리자 미리 연습으로 열까요?</p>`,
        actions: [
          { label: "✎ 검수 이어서 하기", value: "maker", kind: "ghost" },
          { label: "미리 연습하기", value: "preview", kind: "primary" }
        ]
      });
      if (v == null) return;
      if (v === "maker") { if (await requireAdmin()) openMaker(vid); return; }
    }
    const rec = store.record(p.id, vid);
    let resume = false;
    // 완주한 곡: 다시 듣기(자동 타자)와 다시 연습하기 가운데 고릅니다(완료 화면의 [한 번 더 하기]는 바로 연습).
    if (!opts.again && rec && rec.completed && !(rec.current && rec.current.lineIndex > 0)) {
      const v = await modal({
        title: `「${song.title}」 완주한 곡이에요`,
        body: `<p>🎵 <b>다시 듣기</b>: 노래를 끝까지 들으며 글자가 노래에 맞춰 저절로 쳐지는 모습을 봐요.<br>⌨ <b>다시 연습하기</b>: 처음부터 다시 쳐서 지난번 기록과 비교해요.</p>`,
        actions: [
          { label: "🎵 다시 듣기", value: "replay", kind: "ghost" },
          { label: "⌨ 다시 연습하기", value: "practice", kind: "primary" }
        ]
      });
      if (v == null) return;
      if (v === "replay") { show("practice"); TT.practice.open(song, p, { replay: true }); return; }
    }
    if (rec && rec.current && rec.current.lineIndex > 0 && rec.current.lineIndex < TT.songs.keptLines(song).length) {
      const v = await modal({
        title: "이어서 할까요?",
        body: `<p>지난번에 ${rec.current.lineIndex}줄까지 쳤어요.</p>`,
        actions: [
          { label: "처음부터", value: "restart", kind: "ghost" },
          { label: `${rec.current.lineIndex + 1}번째 줄부터 이어서`, value: "resume", kind: "primary" }
        ]
      });
      if (v == null) return;
      resume = v === "resume";
    }
    show("practice");
    TT.practice.open(song, p, { resume });
  }

  // ── 완료 화면 ──
  function cmpRow(label, now, prev, unit, digits = 0, lowerIsBetter = false) {
    let diff = "";
    if (prev != null) {
      const d = Math.round((now - prev) * Math.pow(10, digits)) / Math.pow(10, digits);
      const good = lowerIsBetter ? d < 0 : d > 0;
      const cls = d === 0 ? "same" : good ? "up" : "down";
      const arrow = d === 0 ? "＝" : d > 0 ? "▲" : "▼";
      diff = `<span class="diff ${cls}">${arrow} ${d === 0 ? "같아요" : Math.abs(d).toFixed(digits) + unit}</span>`;
    }
    return `<div class="cmp-row"><span class="cmp-label">${label}</span>
      <strong class="cmp-now">${Number(now).toFixed(digits)}${unit}</strong>
      <span class="cmp-prev">${prev != null ? "지난번 " + Number(prev).toFixed(digits) + unit : "첫 기록"}</span>${diff}</div>`;
  }
  function showDone({ song, profile, result, prev }) {
    app.lastDone = song.videoId;
    const pr = TT.praise.pick(result, prev, song.title);
    $("#dBadge").innerHTML = TT.praise.badge(pr.kind);
    $("#dTitle").textContent = `${pr.emoji} ${pr.title}`;
    $("#dMsg").textContent = pr.message;
    $("#dExtra").textContent = pr.extra;
    $("#dExtra").hidden = !pr.extra;
    $("#dCompare").innerHTML =
      cmpRow("정확도", result.accuracy, prev ? prev.accuracy : null, "%", 1) +
      cmpRow("타자 속도", result.wpm, prev ? prev.wpm : null, " WPM") +
      `<div class="cmp-row"><span class="cmp-label">걸린 시간</span><strong class="cmp-now">${TT.ui.fmtDuration(result.seconds)}</strong><span class="cmp-prev">${result.lines}줄 완주</span></div>`;
    const words = result.wrongWords;
    $("#dWords").innerHTML = words.length
      ? `<h3>다시 보면 좋은 단어</h3><div class="chips">${words.map((w) => {
          const ko = TT.typing.meaningFor(w, null, song);
          return `<span class="chip">${esc(w)}${ko ? `<small>${esc(ko)}</small>` : ""}</span>`;
        }).join("")}</div>`
      : `<p class="perfect">틀린 단어가 하나도 없어요! 👏</p>`;
    $("#doneWho").textContent = `${profile.avatar} ${profile.nickname}`;
    show("done");
  }

  // ── 관리 화면 ──
  function renderAdmin() {
    const records = store.allRecords();
    $("#userList").innerHTML = store.profiles().map((p) => {
      const recs = records[p.id] || {};
      const doneCount = Object.values(recs).filter((r) => r && r.completed).length;
      return `
        <div class="user-row" data-id="${esc(p.id)}">
          <span class="av">${esc(p.avatar)}</span>
          <span class="u-main"><strong>${esc(p.nickname)}</strong>
            <small>${p.role === "admin" ? "관리자 · " : ""}채점 ${p.strict ? "엄격하게" : "너그럽게"} · 완주한 곡 ${doneCount}개</small></span>
          <span class="u-actions">
            <button type="button" class="btn tool sm" data-act="edit">이름·그림</button>
            <button type="button" class="btn tool sm" data-act="strict">채점 바꾸기</button>
            <button type="button" class="btn tool sm" data-act="reset">기록 지우기</button>
            ${p.role === "admin" ? "" : `<button type="button" class="btn tool sm danger" data-act="del">삭제</button>`}
          </span>
        </div>`;
    }).join("");
    renderRecords();
    renderCloudPanel();
  }

  // 관리 화면의 연습 기록: 사용자 → 곡별 완주 횟수·마지막·가장 좋은 기록·다시 볼 단어
  function renderRecords() {
    const records = store.allRecords();
    const titleOf = (vid) => { const m = TT.songs.meta(vid); return m ? m.title : vid; };
    const rows = store.profiles().map((p) => {
      const recs = Object.entries(records[p.id] || {});
      if (!recs.length) {
        return `<div class="rec-user"><h3>${esc(p.avatar)} ${esc(p.nickname)}</h3><p class="note">아직 연습 기록이 없어요.</p></div>`;
      }
      const items = recs.map(([vid, r]) => {
        const last = r.last;
        const prog = r.current && r.current.lineIndex > 0 ? `<span class="tag soft">진행 중 ${r.current.lineIndex}/${r.totalLines}줄</span>` : "";
        const words = (last ? last.wrongWords : r.wrongWords) || [];
        return `
          <div class="rec-item">
            <div class="rec-head"><strong>${esc(titleOf(vid))}</strong>
              ${r.completed ? `<span class="tag">완주 ${r.completions || 1}회</span>` : ""} ${prog}</div>
            ${last ? `<div class="rec-line">마지막 완주 <b>${esc(last.date)}</b> · 정확도 <b>${last.accuracy}%</b> · <b>${last.wpm}</b> WPM · ${TT.ui.fmtDuration(last.seconds)}</div>` : ""}
            ${r.best ? `<div class="rec-line muted">가장 좋은 기록 · 정확도 ${r.best.accuracy}% · ${r.best.wpm} WPM</div>` : ""}
            ${words.length ? `<details class="rec-words"><summary>다시 보면 좋은 단어 ${words.length}개</summary><p>${words.map(esc).join(", ")}</p></details>` : ""}
          </div>`;
      }).join("");
      return `<div class="rec-user"><h3>${esc(p.avatar)} ${esc(p.nickname)}</h3>${items}</div>`;
    }).join("");
    $("#recordList").innerHTML = rows || `<p class="note">아직 사용자가 없어요.</p>`;
    const cr = $("#cloudRecords");
    cr.hidden = !TT.cloud.isAdmin();
    if (!cr.hidden && !cr.dataset.loaded) {
      cr.innerHTML = `<h3>☁ 곡 창고에 모인 기록</h3><p class="note">아들·학생이 자기 기기에서 완주하면 여기로 모여요.</p>` +
        `<button type="button" class="btn" data-cact="loadRecords">☁ 모인 기록 불러오기</button>`;
    }
  }

  async function userAction(id, act) {
    const p = store.profile(id);
    if (!p || !(await requireAdmin())) return;
    if (act === "edit") {
      const r = await profileModal({ title: "이름·그림 바꾸기", nickname: p.nickname, avatar: p.avatar, exceptId: p.id });
      if (!r) return;
      store.updateProfile(p.id, r);
      if (app.profile && app.profile.id === p.id) app.profile = store.profile(p.id);
      toast("바꿨어요.");
    } else if (act === "strict") {
      store.updateProfile(p.id, { strict: !p.strict });
      if (app.profile && app.profile.id === p.id) app.profile = store.profile(p.id);
      toast(`${p.nickname}: 채점을 「${!p.strict ? "엄격하게" : "너그럽게"}」로 바꿨어요.`);
    } else if (act === "reset") {
      if (!(await confirmBox("기록 지우기", `${p.nickname} 님의 연습 기록을 모두 지울까요? 되돌릴 수 없어요.`, "기록 지우기", true))) return;
      store.clearRecords(p.id);
      toast("기록을 지웠어요.");
    } else if (act === "del") {
      if (!(await confirmBox("사용자 삭제", `${p.nickname} 님과 연습 기록을 모두 지울까요? 되돌릴 수 없어요.`, "삭제", true))) return;
      store.removeProfile(p.id);
      if (app.profile && app.profile.id === p.id) app.profile = null;
      toast("삭제했어요.");
    }
    renderAdmin();
    renderProfiles();
    updateWho();
  }
  async function openAdmin() {
    if (!(await requireAdmin())) return;
    renderAdmin();
    show("admin");
  }
  async function openMaker(vid) {
    if (!(await requireAdmin())) return;
    show("maker");
    TT.maker.open(vid);
  }
  function exportAll() {
    TT.ui.download(`typing-tube-기록백업-${today()}.json`, store.exportAll());
    toast("백업 파일을 내려받았어요. 안전한 곳에 보관해 주세요.");
  }
  async function importAll() {
    if (!(await requireAdmin())) return;
    const text = await TT.ui.pickTextFile();
    if (!text) return;
    let obj;
    try { obj = JSON.parse(text); } catch (e) { toast("백업 파일을 읽지 못했어요."); return; }
    if (!store.isBackup(obj)) { toast("타이핑 튜브 백업 파일이 아니에요."); return; }
    const ok = await confirmBox("백업 가져오기",
      `지금 이 기기의 사용자·기록·줄 자료를 백업 파일(${(obj.exportedAt || "").slice(0, 10)}) 내용으로 바꿀까요?`, "가져오기", true);
    if (!ok) return;
    store.importAll(obj);
    app.profile = null;
    app.adminUntil = 0;
    applyTheme(store.settings().theme);
    renderProfiles();
    show("profiles");
    toast("백업을 가져왔어요. 관리자 PIN은 백업 파일의 PIN으로 바뀌었어요.", 4500);
  }
  async function changePin() {
    if (!(await requireAdmin())) return;
    const body =
      `<label class="field">새 PIN (숫자 4자리)<input type="password" inputmode="numeric" maxlength="4" class="p1" autocomplete="off"></label>` +
      `<label class="field">한 번 더<input type="password" inputmode="numeric" maxlength="4" class="p2" autocomplete="off"></label>`;
    const pin = await modal({
      title: "관리자 PIN 바꾸기", body,
      actions: [
        { label: "취소", value: null, kind: "ghost" },
        {
          label: "바꾸기", kind: "primary",
          value: (el) => {
            const a = $(".p1", el).value.trim();
            const b = $(".p2", el).value.trim();
            if (!/^\d{4}$/.test(a)) { toast("숫자 4자리를 입력해 주세요."); return undefined; }
            if (a !== b) { toast("두 번 입력한 PIN이 서로 달라요."); return undefined; }
            return a;
          }
        }
      ]
    });
    if (!pin) return;
    await store.changePin(pin);
    toast("PIN을 바꿨어요.");
  }

  // ── 연결 ──
  function bind() {
    $("#themeBtn").addEventListener("click", toggleTheme);
    $("#profileGrid").addEventListener("click", (e) => {
      const b = e.target.closest(".profile-card");
      if (b) chooseProfile(b.dataset.id);
    });
    $("#addProfileBtn").addEventListener("click", addProfileFlow);
    $("#adminBtn").addEventListener("click", openAdmin);
    $("#switchUserBtn").addEventListener("click", () => { app.profile = null; renderProfiles(); show("profiles"); });
    $("#songGrid").addEventListener("click", (e) => {
      const b = e.target.closest(".song-card");
      if (b) startSong(b.dataset.vid);
    });
    $("#catGrid").addEventListener("click", (e) => {
      const b = e.target.closest(".cat-card");
      if (b) chooseCat(b.dataset.cat);
    });
    $("#backToCats").addEventListener("click", goCats);
    $("#dHome").addEventListener("click", goSongs);
    $("#dAgain").addEventListener("click", () => { if (app.lastDone) startSong(app.lastDone, { again: true }); });
    $("#dReplay").addEventListener("click", () => { if (app.lastDone) startSong(app.lastDone, { replay: true }); });
    $("#adminBack").addEventListener("click", () => (app.profile ? goSongs() : (renderProfiles(), show("profiles"))));
    $("#adminAddUser").addEventListener("click", addProfileFlow);
    $("#userList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]");
      if (b) userAction(b.closest(".user-row").dataset.id, b.dataset.act);
    });
    $("#openMaker").addEventListener("click", () => openMaker());
    $("#exportAll").addEventListener("click", exportAll);
    $("#importAll").addEventListener("click", importAll);
    $("#changePin").addEventListener("click", changePin);
    $("#lockAdmin").addEventListener("click", () => { app.adminUntil = 0; toast("관리를 잠갔어요."); goSongsOrProfiles(); });
    $("#mBack").addEventListener("click", () => { renderAdmin(); show("admin"); });
  }
  // ── 곡 창고(구글 시트) 화면 ──
  const whenText = (iso) => (iso ? new Date(iso).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "아직 없음");

  // 곡 목록 위 알림줄: 반 암호 넣기 / 받는 중 / 문제
  function renderCloudBar() {
    const bar = $("#cloudBar");
    const { status, message } = TT.cloud.status();
    if (!TT.cloud.enabled() || status === "ok" || status === "off") { bar.hidden = true; return; }
    bar.hidden = false;
    if (status === "nocode" || status === "auth") {
      bar.innerHTML =
        `<p>🔒 ${status === "auth" ? esc(message) + " " : ""}선생님(부모님)께 받은 <b>반 암호</b>를 넣으면 준비된 곡을 받아요.</p>` +
        `<div class="row"><input id="cloudCodeIn" type="text" class="cloud-in" placeholder="반 암호" autocomplete="off" autocapitalize="off" spellcheck="false">` +
        `<button type="button" class="btn primary" data-cact="code">받기</button></div>`;
    } else if (status === "syncing") {
      bar.innerHTML = `<p>☁ 곡 창고에서 곡을 받는 중이에요…</p>`;
    } else {
      bar.innerHTML = `<p>⚠ ${esc(message)}</p><button type="button" class="btn" data-cact="sync">다시 해 보기</button>`;
    }
  }

  // 관리 화면의 곡 창고 칸
  function renderCloudPanel() {
    const el = $("#cloudPanel");
    const c = store.cloud();
    const { status, message } = TT.cloud.status();
    const urlBox =
      `<details class="cloud-adv"><summary>곡 창고 주소 (고급)</summary>` +
      `<p class="note">보통은 앱에 들어 있는 주소를 써요. 이 기기만 다른 주소를 쓰려면 넣어 주세요.</p>` +
      `<div class="row"><input id="cloudUrlIn" type="url" class="cloud-in" value="${esc(c.url)}" placeholder="https://script.google.com/macros/s/…/exec" spellcheck="false">` +
      `<button type="button" class="btn" data-cact="url">저장</button></div></details>`;
    if (!TT.cloud.enabled()) {
      el.innerHTML = `<p class="cloud-state">아직 곡 창고 주소가 없어요. (구글 시트를 만든 뒤 앱에 넣어요)</p>` + urlBox;
      return;
    }
    const stateLine = status === "syncing" ? "☁ 주고받는 중…"
      : status === "error" || status === "auth" ? `⚠ ${esc(message)}`
      : status === "ok" ? `✅ ${esc(message)}` : "";
    const pend = TT.cloud.pending();
    const keyField = (label) =>
      `<label class="field">관리자 열쇠 <small>${label}</small>` +
      `<span class="row"><input id="cloudKeyIn" type="password" class="cloud-in" autocomplete="off" spellcheck="false"><button type="button" class="btn primary" data-cact="admin">연결</button></span></label>`;
    if (!TT.cloud.hasCode()) {
      el.innerHTML =
        `<p class="cloud-state">연결 안 됨${stateLine ? " · " + stateLine : ""}</p>` +
        `<label class="field">반 암호 <small>(아들·학생 기기: 곡 받기·기록 보내기)</small>` +
        `<span class="row"><input id="cloudCodeIn" type="text" class="cloud-in" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="btn" data-cact="code">연결</button></span></label>` +
        keyField("(아빠 기기에만: 곡 올리기·영상 더하기·모인 기록)") + urlBox;
      return;
    }
    el.innerHTML =
      `<p class="cloud-state">${TT.cloud.isAdmin() ? "🔑 관리자 열쇠로 연결됨 — 검수한 곡이 자동으로 올라가요" : "🔒 반 암호로 연결됨 — 곡 받기·기록 보내기"}</p>` +
      `<p class="note">마지막으로 맞춘 때: ${esc(whenText(c.lastSync))}${pend ? ` · 아직 올리지 못한 것 ${pend}개` : ""}${c.pendingRecords.length ? ` · 보낼 기록 ${c.pendingRecords.length}개` : ""}</p>` +
      (stateLine ? `<p class="note">${stateLine}</p>` : "") +
      `<div class="row wrap">` +
      `<button type="button" class="btn primary" data-cact="sync">☁ 지금 주고받기</button>` +
      (TT.cloud.isAdmin() ? `<button type="button" class="btn" data-cact="classCode">반 암호 바꾸기</button>` : "") +
      `<button type="button" class="btn ghost" data-cact="disconnect">연결 끊기</button></div>` +
      (TT.cloud.isAdmin() ? "" : keyField("(이 기기를 아빠 기기로 쓰려면)")) +
      urlBox;
  }

  // 모인 기록: 닉네임 → 곡별 완주 횟수·마지막·가장 좋은 기록
  function renderCloudRecords(list) {
    const titleOf = (vid, t) => { const m = TT.songs.meta(vid); return m ? m.title : t || vid; };
    const people = new Map();
    list.forEach((r) => {
      const who = r.nickname || "(이름 없음)";
      if (!people.has(who)) people.set(who, new Map());
      const songs = people.get(who);
      if (!songs.has(r.videoId)) songs.set(r.videoId, []);
      songs.get(r.videoId).push(r);
    });
    if (!people.size) return `<p class="note">아직 모인 기록이 없어요. 학생이 곡을 완주하면 여기에 나와요.</p>`;
    return [...people.entries()].map(([who, songs]) => {
      const items = [...songs.entries()].map(([vid, rs]) => {
        rs.sort((a, b) => String(a.at).localeCompare(String(b.at)));
        const last = rs[rs.length - 1];
        const bestAcc = Math.max(...rs.map((x) => x.accuracy || 0));
        const bestWpm = Math.max(...rs.map((x) => x.wpm || 0));
        const words = last.wrongWords || [];
        return `<div class="rec-item"><div class="rec-head"><strong>${esc(titleOf(vid, last.title))}</strong><span class="tag">완주 ${rs.length}회</span></div>` +
          `<div class="rec-line">마지막 완주 <b>${esc(last.date)}</b> · 정확도 <b>${last.accuracy}%</b> · <b>${last.wpm}</b> WPM · ${TT.ui.fmtDuration(last.seconds)}</div>` +
          `<div class="rec-line muted">가장 좋은 기록 · 정확도 ${bestAcc}% · ${bestWpm} WPM</div>` +
          (words.length ? `<details class="rec-words"><summary>다시 보면 좋은 단어 ${words.length}개</summary><p>${words.map(esc).join(", ")}</p></details>` : "") +
          `</div>`;
      }).join("");
      return `<div class="rec-user"><h3>${esc(who)}</h3>${items}</div>`;
    }).join("");
  }

  async function cloudAction(act, btn) {
    const val = (id) => { const i = $(id); return i ? i.value.trim() : ""; };
    if (btn) btn.disabled = true;
    try {
      if (act === "code") {
        const r = await TT.cloud.connectCode(val("#cloudCodeIn"));
        toast(`곡 창고에 연결했어요. 공개된 곡 ${r ? r.songs : 0}개를 받았어요.`);
      } else if (act === "admin") {
        const key = val("#cloudKeyIn");
        if (!(await requireAdmin())) return;
        const r = await TT.cloud.connectAdmin(key);
        toast(`관리자 열쇠로 연결했어요. 이 기기의 곡 ${r.uploaded}개를 올리고 맞췄어요.`, 4500);
      } else if (act === "sync") {
        await TT.cloud.sync();
        toast("곡 창고와 맞췄어요.");
      } else if (act === "disconnect") {
        if (!(await confirmBox("곡 창고 연결 끊기", "이 기기에서 반 암호·관리자 열쇠를 지울까요? 받은 곡과 기록은 이 기기에 남아요.", "끊기"))) return;
        TT.cloud.disconnect();
        toast("연결을 끊었어요.");
      } else if (act === "classCode") {
        if (!(await requireAdmin())) return;
        const v = await modal({
          title: "반 암호 바꾸기",
          body: `<label class="field">새 반 암호 (4~30자)<input class="nc" type="text" maxlength="30" autocomplete="off" spellcheck="false"></label><p class="note">바꾸면 아들·학생 기기에서 새 암호를 다시 넣어야 곡을 받아요.</p>`,
          actions: [{ label: "취소", value: null, kind: "ghost" }, { label: "바꾸기", kind: "primary", value: (el) => { const t = $(".nc", el).value.trim(); if (t.length < 4) { toast("4자 이상으로 정해 주세요."); return undefined; } return t; } }]
        });
        if (!v) return;
        await TT.cloud.setClassCode(v);
        toast(`반 암호를 「${v}」(으)로 바꿨어요. 아들·학생에게 알려 주세요.`, 5000);
      } else if (act === "url") {
        const u = val("#cloudUrlIn");
        if (!(await requireAdmin())) return;
        store.saveCloud({ url: u });
        toast(u ? "이 기기의 곡 창고 주소를 저장했어요." : "앱에 들어 있는 주소를 쓰도록 되돌렸어요.");
      } else if (act === "loadRecords") {
        btn.textContent = "불러오는 중…";
        const list = await TT.cloud.records();
        const cr = $("#cloudRecords");
        cr.dataset.loaded = "1";
        cr.innerHTML = `<h3>☁ 곡 창고에 모인 기록</h3>` + renderCloudRecords(list) +
          `<button type="button" class="btn" data-cact="loadRecords">↻ 다시 불러오기</button>`;
        return;
      }
    } catch (e) {
      toast(e.message, 5000);
      if (act === "loadRecords" && btn) btn.textContent = "☁ 모인 기록 불러오기";
    } finally {
      if (btn) btn.disabled = false;
      if (act !== "loadRecords") {
        if (app.screen === "admin") renderAdmin();
        if (app.screen === "songs") renderSongs();
        if (app.screen === "cats") renderCats();
      }
    }
  }

  function bindCloud() {
    document.addEventListener("click", (e) => {
      const b = e.target.closest("[data-cact]");
      if (b) cloudAction(b.dataset.cact, b);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target && ["cloudCodeIn", "cloudKeyIn", "cloudUrlIn"].includes(e.target.id)) {
        e.preventDefault();
        const b = e.target.parentElement.querySelector("[data-cact]");
        if (b) b.click();
      }
    });
    document.addEventListener("tt-cloud", () => {
      if (app.screen === "cats") renderCloudBar();
      if (app.screen === "admin") renderCloudPanel();
    });
    // 새 곡을 받으면 보고 있는 목록을 다시 그립니다(연습 중에는 건드리지 않음).
    document.addEventListener("tt-cloud-pulled", () => {
      if (app.screen === "songs") renderSongs();
      if (app.screen === "cats") renderCats();
      if (app.screen === "admin") renderAdmin();
    });
  }

  function goSongsOrProfiles() {
    if (app.profile) goSongs();
    else { renderProfiles(); show("profiles"); }
  }

  function registerSW() {
    if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
      navigator.serviceWorker.register("sw.js").catch(() => { /* 설치 기능만 빠질 뿐 앱은 동작 */ });
    }
  }

  function init() {
    applyTheme(store.settings().theme);
    bind();
    bindCloud();
    initSetup();
    TT.practice.init();
    TT.maker.init();
    if (location.protocol === "file:") {
      $("#fileWarn").hidden = false;
    }
    if (!store.isSetup()) {
      show("setup");
    } else {
      renderProfiles();
      show("profiles");
    }
    registerSW();
    TT.cloud.init();
  }

  TT.app = { show, showDone, goSongs, requireAdmin, screen: () => app.screen };
  document.addEventListener("DOMContentLoaded", init);
})();
