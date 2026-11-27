// 브라우저 저장(localStorage) — 사용자, 관리자 PIN, 설정, 곡 줄 자료, 연습 기록
// 서버로 보내지 않고 이 기기의 브라우저에만 남습니다. 백업은 파일 내보내기로 합니다.
(function () {
  const TT = (window.TT = window.TT || {});
  const PREFIX = "tt.";
  const VERSION = 1;

  function read(key, fallback) {
    try {
      const v = localStorage.getItem(PREFIX + key);
      return v ? JSON.parse(v) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function write(key, val) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(val));
      return true;
    } catch (e) {
      if (TT.ui) TT.ui.toast("저장 공간이 부족하거나 저장이 막혀 있어요.");
      return false;
    }
  }
  function uid() {
    return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  }

  // PIN은 그대로 저장하지 않고, 소금(salt)을 섞어 SHA-256 해시로만 저장합니다.
  async function hash(text) {
    if (window.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 2166136261; // 보조 방식(보안 연결이 아닐 때)
    for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
    return "w" + (h >>> 0).toString(16);
  }

  const store = {
    // ── 관리자 ──
    // 관리자로 시작했거나, 학생으로 시작해(반 암호) 사용자가 한 명이라도 있으면 설정을 마친 것
    isSetup() { return this.hasAdmin() || this.profiles().length > 0; },
    hasAdmin() { return !!read("admin", null) && this.profiles().some((p) => p.role === "admin"); },
    async setupAdmin({ nickname, avatar, pin }) {
      const salt = uid();
      write("admin", { salt, hash: await hash(salt + ":" + pin) });
      write("version", VERSION);
      return this.addProfile({ nickname, avatar, role: "admin" });
    },
    async checkPin(pin) {
      const a = read("admin", null);
      if (!a) return false;
      return (await hash(a.salt + ":" + pin)) === a.hash;
    },
    async changePin(pin) {
      const salt = uid();
      return write("admin", { salt, hash: await hash(salt + ":" + pin) });
    },

    // ── 사용자 ──
    profiles() { return read("profiles", []); },
    profile(id) { return this.profiles().find((p) => p.id === id) || null; },
    nicknameTaken(nickname, exceptId) {
      const n = nickname.trim().toLowerCase();
      return this.profiles().some((p) => p.id !== exceptId && p.nickname.trim().toLowerCase() === n);
    },
    addProfile({ nickname, avatar, role = "learner" }) {
      const list = this.profiles();
      const p = { id: uid(), nickname: nickname.trim(), avatar, role, strict: false, createdAt: TT.ui.today() };
      list.push(p);
      write("profiles", list);
      return p;
    },
    updateProfile(id, patch) {
      const list = this.profiles().map((p) => (p.id === id ? Object.assign({}, p, patch) : p));
      write("profiles", list);
      return list.find((p) => p.id === id) || null;
    },
    removeProfile(id) {
      write("profiles", this.profiles().filter((p) => p.id !== id));
      this.clearRecords(id);
    },

    // ── 설정 ──
    settings() { return Object.assign({ theme: "light", mode: "see" }, read("settings", {})); },
    saveSettings(patch) { write("settings", Object.assign(this.settings(), patch)); },

    // ── 곡 줄 자료 (이 기기에서 만든 것) ──
    localSongs() { return read("songs", {}); },
    song(videoId) { return this.localSongs()[videoId] || null; },
    saveSong(song) {
      const all = this.localSongs();
      all[song.videoId] = song;
      return write("songs", all);
    },
    replaceSongs(all) { return write("songs", all || {}); },
    removeSong(videoId) {
      const all = this.localSongs();
      delete all[videoId];
      write("songs", all);
    },
    // ── 뺀 곡: 영상 목록에는 남기되 학생에게 보이지 않게(줄 자료는 그대로 보관) ──
    hiddenSongs() { return read("hiddenSongs", []); },
    setHidden(videoId, on) {
      const set = new Set(this.hiddenSongs());
      if (on) set.add(videoId); else set.delete(videoId);
      return write("hiddenSongs", [...set]);
    },
    setHiddenList(list) { return write("hiddenSongs", Array.isArray(list) ? list : []); },

    // ── 곡 창고(구글 시트) 연결 설정 — 백업 파일에는 넣지 않음(관리자 열쇠 보호) ──
    cloud() { return Object.assign({ url: "", code: "", adminKey: "", lastSync: null, dirtySongs: [], dirtyRemoved: [], dirtyHidden: false, dirtyVideos: [], pendingRecords: [] }, read("cloud", {})); },
    saveCloud(patch) { const next = Object.assign(this.cloud(), patch); write("cloud", next); return next; },
    // 관리자가 앱에서 더한 영상(가사 없음). 목록 파일(data/catalog) 뒤에 붙여 보여 줍니다.
    cloudCatalog() { return read("cloudCatalog", []); },
    saveCloudCatalog(list) { return write("cloudCatalog", Array.isArray(list) ? list : []); },

    // ── 연습 기록: records[사용자ID][영상ID] ──
    allRecords() { return read("records", {}); },
    record(pid, vid) {
      const r = this.allRecords();
      return (r[pid] && r[pid][vid]) || null;
    },
    saveRecord(pid, vid, rec) {
      const r = this.allRecords();
      if (!r[pid]) r[pid] = {};
      r[pid][vid] = rec;
      write("records", r);
    },
    // 기록 열쇠 바꾸기(예: 생활 영어 옛 「1단원」 lesson-u01 → 책 번호 bm-u03, 2026-11-27).
    // 새 열쇠에 기록이 이미 있으면 건드리지 않습니다. 옮긴 사용자 수를 돌려줍니다.
    renameRecordKey(from, to) {
      const r = this.allRecords();
      let n = 0;
      Object.keys(r).forEach((pid) => {
        if (r[pid] && r[pid][from] && !r[pid][to]) { r[pid][to] = r[pid][from]; delete r[pid][from]; n++; }
      });
      if (n) write("records", r);
      return n;
    },
    clearRecords(pid) {
      const r = this.allRecords();
      delete r[pid];
      write("records", r);
    },

    // ── 백업 ──
    exportAll() {
      return {
        app: "typing-tube",
        kind: "backup",
        version: VERSION,
        exportedAt: new Date().toISOString(),
        admin: read("admin", null),
        profiles: this.profiles(),
        records: this.allRecords(),
        songs: this.localSongs(),
        hiddenSongs: this.hiddenSongs(),
        settings: this.settings()
      };
    },
    isBackup(obj) {
      return obj && obj.app === "typing-tube" && obj.kind === "backup" && Array.isArray(obj.profiles);
    },
    importAll(obj) {
      if (!this.isBackup(obj)) return false;
      if (obj.admin) write("admin", obj.admin);
      write("profiles", obj.profiles);
      write("records", obj.records || {});
      write("songs", obj.songs || {});
      write("hiddenSongs", Array.isArray(obj.hiddenSongs) ? obj.hiddenSongs : []);
      if (obj.settings) write("settings", obj.settings);
      write("version", VERSION);
      return true;
    }
  };

  // 영상 목록(catalog) + 이 기기에 저장된 줄 자료를 합쳐서 보여 줍니다.
  // 2단계에서 구글 시트 「곡 창고」가 여기에 더해집니다.
  const songs = {
    // 관리자가 모든 줄을 검수(✓)한 곡만 아들·학생에게 공개합니다.
    isPublished(song) { return !!(song && Array.isArray(song.lines) && song.lines.length && song.reviewed === true); },
    // 연습에 쓰는 줄(관리자가 🚫 뺀 줄 제외)
    keptLines(song) { return ((song && song.lines) || []).filter((l) => l && !l.skip); },
    reviewProgress(song) {
      const kept = this.keptLines(song);
      return { done: kept.filter((l) => l.ok).length, total: kept.length };
    },
    isHidden(videoId) { return store.hiddenSongs().includes(videoId); },
    meta(videoId) { return (TT.catalog || []).find((c) => c.videoId === videoId) || null; },
    // 분류 정보(이름·그림·종류). 예전 자료처럼 cat이 없으면 팝송으로 봅니다.
    catOf(item) {
      const id = (item && item.cat) || "pop";
      return (TT.categories || []).find((c) => c.id === id) || { id, name: id, icon: "🎵", kind: "song" };
    },
    kindOf(videoId) { return this.catOf(this.meta(videoId)).kind; },
    list() {
      return (TT.catalog || []).map((c) => Object.assign({}, c, { song: store.song(c.videoId) }));
    },
    get(videoId) {
      const s = store.song(videoId);
      if (!s) return null;
      return Object.assign({}, this.meta(videoId) || {}, s);
    }
  };

  TT.store = store;
  TT.songs = songs;
})();
