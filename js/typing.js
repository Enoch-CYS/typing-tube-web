// 타자 엔진 — 한 줄을 한 글자씩 받아 채점합니다. (화면과 유튜브는 모릅니다)
// 규칙
//  · 틀린 칸에서 기다림: 맞는 글자를 칠 때까지 커서가 그 칸에 머뭅니다.
//  · 너그럽게(기본): 대소문자 무시, 문장부호는 쳐도 되고 건너뛰어도 됩니다.
//  · 엄격하게: 대소문자·문장부호까지 똑같이 쳐야 합니다.
//  · 정확도 = 맞게 친 글자 ÷ 누른 글자(틀리게 누른 것 포함)
(function () {
  const TT = (window.TT = window.TT || {});

  // 굽은 따옴표·긴 줄표 등 키보드로 치기 어려운 글자를 보통 글자로 바꿉니다.
  function normalizeText(s) {
    return String(s || "")
      .normalize("NFKC")
      .replace(/[‘’‛′`´]/g, "'")
      .replace(/[“”‟″]/g, '"')
      .replace(/[‐-―−]/g, "-")
      .replace(/[ \t]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  // é → e 처럼 꾸밈표를 떼고 비교합니다.
  const fold = (ch) => ch.normalize("NFD").replace(/[̀-ͯ]/g, "");
  const isAlnum = (ch) => /[\p{L}\p{N}]/u.test(ch);
  const isPunct = (ch) => !isAlnum(ch) && ch !== " ";
  // 키보드로 칠 수 있는 글자(영문 자판의 보이는 글자 + 띄어쓰기)
  const typeable = (ch) => /^[\x20-\x7E]$/.test(fold(ch));

  class Engine {
    constructor(text, strict) {
      // 칠 수 없는 기호(♪, 이모지, 한글 등)는 줄에서 빼고, 남은 띄어쓰기를 정리합니다.
      this.text = normalizeText(Array.from(normalizeText(text)).filter(typeable).join(""));
      this.strict = !!strict;
      this.pos = 0;
      this.state = new Array(this.text.length).fill("todo"); // todo | ok | fixed | skip
      this.errAt = new Set();
      this.correct = 0;
      this.typed = 0;
      this.streak = 0; // 같은 칸에서 연달아 틀린 횟수
      this.lastWrong = null; // { at, ch }
      this.startTime = 0;
      this.endTime = 0;
      this._autoSkip();
    }
    get done() { return this.pos >= this.text.length; }

    eq(a, b) {
      a = fold(a); b = fold(b);
      return this.strict ? a === b : a.toLowerCase() === b.toLowerCase();
    }

    // 칠 수 없는 글자(♪ 등)와, 너그럽게 모드에서 줄 끝에 남은 문장부호는 자동으로 넘깁니다.
    _autoSkip() {
      const t = this.text;
      while (this.pos < t.length && !typeable(t[this.pos])) {
        this.state[this.pos] = "skip";
        this.pos++;
      }
      if (!this.strict && this.pos < t.length && !/[\p{L}\p{N}]/u.test(t.slice(this.pos))) {
        for (let k = this.pos; k < t.length; k++) this.state[k] = "skip";
        this.pos = t.length;
      }
      if (this.done && !this.endTime) this.endTime = performance.now();
    }

    _accept(j) {
      for (let k = this.pos; k < j; k++) this.state[k] = "skip";
      this.state[j] = this.errAt.has(j) ? "fixed" : "ok";
      this.pos = j + 1;
      this.correct++;
      this.typed++;
      this.streak = 0;
      this.lastWrong = null;
      this._autoSkip();
    }

    // 한 글자를 받아 결과를 돌려줍니다: ok | wrong | ignored
    input(ch) {
      if (this.done) return { kind: "ignored" };
      if (!this.startTime) this.startTime = performance.now();
      const t = this.text;
      const i = this.pos;
      if (this.eq(ch, t[i])) { this._accept(i); return { kind: "ok" }; }

      if (!this.strict) {
        // 커서가 문장부호 위에 있으면, 그 뒤 글자를 바로 쳐도 맞은 것으로 봅니다.
        if (isPunct(t[i])) {
          let j = i;
          while (j < t.length && isPunct(t[j])) j++;
          if (j < t.length && this.eq(ch, t[j])) { this._accept(j); return { kind: "ok" }; }
        }
        // 필요 없는 문장부호를 더 쳐도 틀린 것으로 세지 않습니다.
        if (isPunct(ch)) return { kind: "ignored" };
      }

      this.typed++;
      this.errAt.add(i);
      this.streak++;
      this.lastWrong = { at: i, ch };
      return { kind: "wrong", expected: this.expected(), streak: this.streak };
    }

    // 다음에 쳐야 할 글자(너그럽게 모드에서는 문장부호를 건너뛴 글자)
    expected() {
      const t = this.text;
      let j = this.pos;
      if (!this.strict) while (j < t.length && isPunct(t[j])) j++;
      return t[j] || "";
    }

    elapsedMs() {
      if (!this.startTime) return 0;
      return (this.endTime || performance.now()) - this.startTime;
    }

    // 틀린 칸이 있던 단어 목록
    wrongWords() {
      const spans = [];
      const re = /[\p{L}\p{N}'-]+/gu;
      let m;
      while ((m = re.exec(this.text))) spans.push({ s: m.index, e: m.index + m[0].length, w: m[0] });
      const out = new Set();
      for (const i of this.errAt) {
        let sp = spans.find((x) => i >= x.s && i < x.e);
        if (!sp) sp = spans.filter((x) => x.e <= i).pop(); // 띄어쓰기에서 틀리면 앞 단어로
        if (sp) {
          const w = sp.w.replace(/^['-]+|['-]+$/g, "");
          if (w) out.add(w);
        }
      }
      return Array.from(out);
    }
  }

  // 단어의 한글 뜻 찾기: 줄에 붙은 뜻 → 곡 단어장 → 앱 단어장 순서
  function stemCandidates(word) {
    const w = word.toLowerCase().replace(/^['-]+|['-]+$/g, "");
    const c = [w];
    const add = (x) => { if (x && x.length > 2 && !c.includes(x)) c.push(x); };
    if (w.endsWith("'s")) add(w.slice(0, -2));
    if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
    if (w.endsWith("es")) add(w.slice(0, -2));
    if (w.endsWith("s")) add(w.slice(0, -1));
    if (w.endsWith("ied")) add(w.slice(0, -3) + "y");
    if (w.endsWith("ed")) { add(w.slice(0, -2)); add(w.slice(0, -1)); if (/(.)\1ed$/.test(w)) add(w.slice(0, -3)); }
    if (w.endsWith("ing")) { add(w.slice(0, -3)); add(w.slice(0, -3) + "e"); if (/(.)\1ing$/.test(w)) add(w.slice(0, -4)); }
    if (w.endsWith("ly")) add(w.slice(0, -2));
    if (w.endsWith("est")) add(w.slice(0, -3));
    if (w.endsWith("er")) add(w.slice(0, -2));
    return c;
  }
  function findIn(list, cands) {
    if (!Array.isArray(list)) return null;
    for (const c of cands) {
      const f = list.find((x) => x && x.word && x.word.toLowerCase() === c);
      if (f && f.ko) return f.ko;
    }
    return null;
  }
  function meaningFor(word, line, song) {
    const cands = stemCandidates(word);
    const fromLine = findIn(line && line.words, cands);
    if (fromLine) return fromLine;
    const fromSong = findIn(song && song.glossary, cands);
    if (fromSong) return fromSong;
    const dict = TT.dict || {};
    for (const c of cands) if (dict[c]) return dict[c];
    return null;
  }
  // 앱 단어장에서 찾은 기본형(예: sprinkled → sprinkle)
  function dictBase(word) {
    const dict = TT.dict || {};
    for (const c of stemCandidates(word)) if (dict[c]) return c;
    return null;
  }

  TT.typing = { Engine, normalizeText, isAlnum, isPunct, meaningFor, dictBase };
})();
