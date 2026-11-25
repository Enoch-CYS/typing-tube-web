// 화면 공통 도구: 요소 찾기, 안전한 글자 넣기, 알림(토스트), 대화창(모달), PIN 입력, 파일 저장·열기
(function () {
  const TT = (window.TT = window.TT || {});

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // 사용자가 입력한 글자를 화면에 넣을 때 태그로 해석되지 않도록 바꿉니다.
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }

  let toastTimer = null;
  function toast(msg, ms = 2800) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), ms);
  }

  // actions: [{ label, kind: 'primary'|'ghost'|'danger', value }]
  // value가 함수이면 눌렀을 때 실행하고, undefined를 돌려주면 창을 닫지 않습니다(입력 확인용).
  function modal({ title, body = "", actions = [{ label: "확인", value: true, kind: "primary" }], onOpen } = {}) {
    return new Promise((resolve) => {
      const prevFocus = document.activeElement;
      const back = document.createElement("div");
      back.className = "modal-back";
      const id = "mdl" + Math.random().toString(36).slice(2, 7);
      back.innerHTML =
        `<div class="modal" role="dialog" aria-modal="true" aria-labelledby="${id}">` +
        `<h2 id="${id}">${esc(title)}</h2><div class="modal-body"></div><div class="modal-actions"></div></div>`;
      const bodyEl = $(".modal-body", back);
      if (typeof body === "string") bodyEl.innerHTML = body;
      else if (body) bodyEl.appendChild(body);
      const actEl = $(".modal-actions", back);

      let done = false;
      function finish(v) {
        if (done) return;
        done = true;
        document.removeEventListener("keydown", onKey, true);
        back.remove();
        if (prevFocus && prevFocus.focus) prevFocus.focus();
        resolve(v);
      }
      actions.forEach((a) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn " + (a.kind || "ghost");
        b.textContent = a.label;
        b.addEventListener("click", () => {
          const v = typeof a.value === "function" ? a.value(bodyEl) : a.value;
          if (v === undefined) return;
          finish(v);
        });
        actEl.appendChild(b);
      });
      function onKey(e) {
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); finish(null); }
        else if (e.key === "Enter" && !["TEXTAREA", "BUTTON"].includes(e.target.tagName)) {
          const p = $(".primary", actEl);
          if (p) { e.preventDefault(); e.stopPropagation(); p.click(); }
        }
      }
      document.addEventListener("keydown", onKey, true);
      back.addEventListener("mousedown", (e) => { if (e.target === back) finish(null); });
      document.body.appendChild(back);
      const first = $("input:not([type=radio]),textarea,select", bodyEl) || $(".primary", actEl) || $("button", actEl);
      if (first) first.focus();
      if (onOpen) onOpen(bodyEl);
    });
  }

  function askPin(title = "관리자 PIN을 입력해 주세요") {
    const body =
      `<label class="field">PIN (숫자 4자리)` +
      `<input type="password" inputmode="numeric" maxlength="4" autocomplete="off" class="pin-input"></label>`;
    return modal({
      title,
      body,
      actions: [
        { label: "취소", value: null, kind: "ghost" },
        {
          label: "확인", kind: "primary",
          value: (el) => {
            const v = $("input", el).value.trim();
            if (!/^\d{4}$/.test(v)) { toast("숫자 4자리를 입력해 주세요"); return undefined; }
            return v;
          }
        }
      ]
    });
  }

  function confirmBox(title, message, okLabel = "확인", danger = false) {
    return modal({
      title,
      body: `<p>${esc(message)}</p>`,
      actions: [
        { label: "취소", value: false, kind: "ghost" },
        { label: okLabel, value: true, kind: danger ? "danger" : "primary" }
      ]
    }).then((v) => v === true);
  }

  // 자료를 JSON 파일로 내려받게 합니다.
  function download(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // 파일 고르기 창을 열고, 고른 파일의 글자를 돌려줍니다(취소하면 null).
  function pickTextFile(accept = ".json,application/json") {
    return new Promise((resolve) => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = accept;
      inp.addEventListener("change", () => {
        const f = inp.files && inp.files[0];
        if (!f) return resolve(null);
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = () => resolve(null);
        r.readAsText(f, "utf-8");
      });
      inp.addEventListener("cancel", () => resolve(null));
      inp.click();
    });
  }

  function today() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  // 초 → "1:05.3"
  function fmtTime(sec, digits = 1) {
    if (sec == null || isNaN(sec)) return "–";
    const m = Math.floor(sec / 60);
    const s = sec - m * 60;
    return `${m}:${s.toFixed(digits).padStart(digits ? 3 + digits : 2, "0")}`;
  }

  // 초 → "3분 12초"
  function fmtDuration(sec) {
    sec = Math.round(sec || 0);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m ? `${m}분 ${s}초` : `${s}초`;
  }

  TT.ui = { $, $$, esc, toast, modal, askPin, confirmBox, download, pickTextFile, today, fmtTime, fmtDuration };
})();
