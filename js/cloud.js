// 곡 창고(구글 시트) 연결 — 영상 목록·검수한 줄 자료·뺀 곡을 주고받고, 완주 기록을 보냅니다.
//   반 암호  : 곡 받기 + 기록 보내기 (아들·학생 기기)
//   관리자 열쇠: 위에 더해 곡 올리기·영상 더하기·모인 기록 보기 (아빠 기기에만)
// 주소는 data/config.js의 TT.config.storeUrl(관리 화면에서 이 기기만 바꿀 수도 있음).
(function () {
  const TT = (window.TT = window.TT || {});
  const store = TT.store;
  const PUSH_DELAY = 3000; // 줄 자료를 고친 뒤 3초 동안 더 고치지 않으면 올립니다
  const TIMEOUT = 20000;

  const state = { status: "off", message: "", busy: false, timer: null };

  // ── 설정 ──
  const cfg = () => store.cloud();
  const url = () => (cfg().url || (TT.config && TT.config.storeUrl) || "").trim();
  const enabled = () => /^https?:\/\//.test(url());
  const hasCode = () => !!(cfg().code || cfg().adminKey);
  const isAdmin = () => !!cfg().adminKey;

  function emit(status, message) {
    if (status) state.status = status;
    if (message != null) state.message = message;
    document.dispatchEvent(new CustomEvent("tt-cloud", { detail: { status: state.status, message: state.message } }));
  }

  // ── 곡 창고 부르기: 미리 확인(preflight)이 없도록 text/plain으로 보냅니다 ──
  async function call(action, body = {}, auth) {
    if (!enabled()) throw new Error("곡 창고 주소가 아직 없어요.");
    const c = auth || cfg();
    const ctrl = typeof AbortController === "function" ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT) : null;
    let res;
    try {
      res = await fetch(url(), {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(Object.assign({ action, code: c.code || "", key: c.adminKey || "" }, body)),
        redirect: "follow",
        signal: ctrl ? ctrl.signal : undefined
      });
    } catch (e) {
      throw new Error("곡 창고에 닿지 못했어요. 인터넷 연결을 확인해 주세요.");
    } finally {
      if (t) clearTimeout(t);
    }
    if (!res.ok) throw new Error(`곡 창고에 닿지 못했어요 (${res.status}).`);
    let data;
    try { data = await res.json(); } catch (e) { throw new Error("곡 창고의 대답을 읽지 못했어요. 주소를 확인해 주세요."); }
    if (!data.ok) { const err = new Error(data.error || "곡 창고에서 문제가 생겼어요."); err.auth = !!data.auth; throw err; }
    return data;
  }

  // ── 영상 목록: 목록 파일 + 곡 창고(관리자가 앱에서 더한 영상) ──
  function applyCatalog(list) {
    (list || []).forEach((it) => {
      if (!it || !it.videoId) return;
      const cur = (TT.catalog || []).find((c) => c.videoId === it.videoId);
      if (cur) { if (cur.added) Object.assign(cur, it); }
      else TT.catalog.push(Object.assign({}, it, { added: true }));
    });
  }
  function mergeCloudCatalog(remote) {
    const local = store.cloudCatalog();
    const dirty = new Set(cfg().dirtyVideos);
    const byId = new Map(local.filter((it) => dirty.has(it.videoId)).map((it) => [it.videoId, it]));
    (remote || []).forEach((it) => { if (!byId.has(it.videoId)) byId.set(it.videoId, it); });
    const list = [...byId.values()];
    store.saveCloudCatalog(list);
    applyCatalog(list);
  }

  const newer = (a, b) => String(a || "") > String(b || "");

  // ── 받기 ──
  function applyPull(data) {
    mergeCloudCatalog(data.catalog);
    const local = store.localSongs();
    const remoteIds = new Set();
    (data.songs || []).forEach((s) => {
      if (!s || !s.videoId) return;
      remoteIds.add(s.videoId);
      const mine = local[s.videoId];
      if (data.admin) {
        // 관리자: 아직 올리지 못한 이 기기의 고친 내용은 지키고, 더 새것만 받습니다.
        if (cfg().dirtySongs.includes(s.videoId)) return;
        if (!mine || newer(s.updatedAt, mine.updatedAt)) local[s.videoId] = s;
      } else if (!mine || mine.fromCloud || !newer(mine.updatedAt, s.updatedAt)) {
        local[s.videoId] = Object.assign({}, s, { fromCloud: true });
      }
    });
    if (!data.admin) {
      // 학생: 곡 창고에서 내려온 곡이 더는 공개가 아니면(뺀 곡·검수 되돌림) 지웁니다.
      Object.keys(local).forEach((vid) => { if (local[vid].fromCloud && !remoteIds.has(vid)) delete local[vid]; });
    }
    store.replaceSongs(local);
    if (!cfg().dirtyHidden) store.setHiddenList(data.hidden || []);
    const hidden = new Set(data.hidden || []);
    return { songs: (data.songs || []).filter((s) => s.reviewed && !hidden.has(s.videoId)).length };
  }

  // ── 올리기(관리자): 고친 곡·지운 곡·뺀 곡·더한 영상 ──
  async function flush() {
    if (!isAdmin()) return 0;
    let n = 0;
    const c = cfg();
    for (const vid of c.dirtyVideos) {
      const it = store.cloudCatalog().find((x) => x.videoId === vid);
      if (it) await call("addVideo", { item: it });
      store.saveCloud({ dirtyVideos: cfg().dirtyVideos.filter((x) => x !== vid) });
      n++;
    }
    for (const vid of c.dirtySongs) {
      const song = store.song(vid);
      if (song) await call("saveSong", { song: strip(song) });
      store.saveCloud({ dirtySongs: cfg().dirtySongs.filter((x) => x !== vid) });
      n++;
    }
    for (const vid of c.dirtyRemoved) {
      await call("removeSong", { videoId: vid });
      store.saveCloud({ dirtyRemoved: cfg().dirtyRemoved.filter((x) => x !== vid) });
      n++;
    }
    if (c.dirtyHidden) {
      await call("setHidden", { hidden: store.hiddenSongs() });
      store.saveCloud({ dirtyHidden: false });
      n++;
    }
    return n;
  }
  const strip = (song) => { const s = Object.assign({}, song); delete s.fromCloud; return s; };

  async function sendRecords() {
    let sent = 0;
    while (cfg().pendingRecords.length) {
      const rec = cfg().pendingRecords[0];
      await call("addRecord", { record: rec });
      store.saveCloud({ pendingRecords: cfg().pendingRecords.slice(1) });
      sent++;
    }
    return sent;
  }

  // ── 주고받기: 올릴 것 먼저 올리고, 기록 보내고, 받기 ──
  async function sync({ quiet } = {}) {
    if (!enabled() || !hasCode()) { emit(enabled() ? "nocode" : "off", ""); return null; }
    if (state.busy) return null;
    state.busy = true;
    emit("syncing", "곡 창고와 주고받는 중…");
    try {
      await flush();
      await sendRecords();
      const data = await call("pull");
      const r = applyPull(data);
      store.saveCloud({ lastSync: new Date().toISOString() });
      emit("ok", `곡 창고와 맞췄어요 · 공개된 곡 ${r.songs}개`);
      return r;
    } catch (e) {
      emit(e.auth ? "auth" : "error", e.message);
      if (!quiet) throw e;
      return null;
    } finally {
      state.busy = false;
    }
  }

  function schedule() {
    clearTimeout(state.timer);
    state.timer = setTimeout(() => { sync({ quiet: true }).then(() => document.dispatchEvent(new CustomEvent("tt-cloud-pulled"))); }, PUSH_DELAY);
  }
  const addTo = (key, vid) => { const list = cfg()[key]; if (!list.includes(vid)) store.saveCloud({ [key]: list.concat(vid) }); };

  // ── 자막 준비실이 부르는 곳 ──
  function songChanged(vid) {
    if (!isAdmin()) return;
    store.saveCloud({ dirtyRemoved: cfg().dirtyRemoved.filter((x) => x !== vid) });
    addTo("dirtySongs", vid);
    schedule();
  }
  function songRemoved(vid) {
    if (!isAdmin()) return;
    store.saveCloud({ dirtySongs: cfg().dirtySongs.filter((x) => x !== vid) });
    addTo("dirtyRemoved", vid);
    schedule();
  }
  function hiddenChanged() {
    if (!isAdmin()) return;
    store.saveCloud({ dirtyHidden: true });
    schedule();
  }
  // 영상 더하기: 이 기기 목록에 먼저 넣고(바로 보이게), 연결돼 있으면 곧 올립니다.
  function addVideo(item) {
    const list = store.cloudCatalog().filter((x) => x.videoId !== item.videoId);
    list.push(Object.assign({}, item, { added: true }));
    store.saveCloudCatalog(list);
    applyCatalog([item]);
    addTo("dirtyVideos", item.videoId);
    if (isAdmin()) schedule();
  }

  // ── 완주 기록 보내기(반 암호가 있는 기기) ──
  function recordDone(rec) {
    if (!enabled() || !hasCode()) return;
    store.saveCloud({ pendingRecords: cfg().pendingRecords.concat([rec]).slice(-200) });
    sendRecords().catch(() => { /* 다음 주고받기 때 다시 보냄 */ });
  }

  // ── 연결하기 ──
  // 반 암호: 맞는지 확인한 뒤 저장하고 받기
  async function connectCode(code) {
    const c = String(code || "").trim();
    if (!c) throw new Error("반 암호를 넣어 주세요.");
    const r = await call("ping", {}, { code: c });
    if (!r.member) throw new Error("반 암호가 맞지 않아요. 선생님(부모님)께 다시 물어봐 주세요.");
    store.saveCloud({ code: c });
    return sync();
  }
  // 관리자 열쇠: 처음 연결할 때 이 기기의 곡·뺀 곡·더한 영상을 곡 창고와 합칩니다.
  async function connectAdmin(key) {
    const k = String(key || "").trim();
    if (!k) throw new Error("관리자 열쇠를 넣어 주세요.");
    const r = await call("ping", {}, { adminKey: k });
    if (!r.admin) throw new Error("관리자 열쇠가 맞지 않아요. 앱스 스크립트 실행 로그의 열쇠를 다시 확인해 주세요.");
    store.saveCloud({ adminKey: k });
    const data = await call("pull");
    const remote = new Map((data.songs || []).map((s) => [s.videoId, s]));
    const local = store.localSongs();
    const up = Object.values(local).filter((s) => !remote.has(s.videoId) || newer(s.updatedAt, remote.get(s.videoId).updatedAt)).map((s) => s.videoId);
    const remoteCat = new Set((data.catalog || []).map((x) => x.videoId));
    const videos = store.cloudCatalog().filter((x) => !remoteCat.has(x.videoId)).map((x) => x.videoId);
    const hidden = [...new Set(store.hiddenSongs().concat(data.hidden || []))];
    const hiddenDiff = hidden.length !== (data.hidden || []).length;
    store.setHiddenList(hidden);
    store.saveCloud({
      dirtySongs: [...new Set(cfg().dirtySongs.concat(up))],
      dirtyVideos: [...new Set(cfg().dirtyVideos.concat(videos))],
      dirtyHidden: cfg().dirtyHidden || hiddenDiff
    });
    const res = await sync();
    return Object.assign({ uploaded: up.length }, res);
  }
  function disconnect() {
    store.saveCloud({ code: "", adminKey: "", dirtySongs: [], dirtyRemoved: [], dirtyHidden: false, dirtyVideos: [], pendingRecords: [] });
    emit(enabled() ? "nocode" : "off", "");
  }

  async function setClassCode(newCode) {
    await call("setClassCode", { newCode });
    if (cfg().code) store.saveCloud({ code: String(newCode).trim() });
  }
  async function records() { return (await call("records")).records || []; }
  const pending = () => { const c = cfg(); return c.dirtySongs.length + c.dirtyRemoved.length + c.dirtyVideos.length + (c.dirtyHidden ? 1 : 0); };

  function init() {
    applyCatalog(store.cloudCatalog());
    if (!enabled()) { emit("off", ""); return; }
    if (!hasCode()) { emit("nocode", ""); return; }
    sync({ quiet: true }).then((r) => { if (r) document.dispatchEvent(new CustomEvent("tt-cloud-pulled")); });
    window.addEventListener("online", () => sync({ quiet: true }).then((r) => { if (r) document.dispatchEvent(new CustomEvent("tt-cloud-pulled")); }));
  }

  // 목록 파일이 읽힌 바로 뒤라, 앱이 시작되기 전에 더한 영상을 목록에 붙여 둡니다.
  applyCatalog(store.cloudCatalog());

  TT.cloud = {
    init, sync, call, connectCode, connectAdmin, disconnect, setClassCode, records,
    songChanged, songRemoved, hiddenChanged, addVideo, recordDone,
    enabled, hasCode, isAdmin, pending, url, status: () => ({ status: state.status, message: state.message }),
    _applyPull: applyPull
  };
})();
