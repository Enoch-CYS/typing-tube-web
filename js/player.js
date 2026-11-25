// 유튜브 IFrame Player API 감싸기 — 재생·멈춤·이동·현재 시간만 다룹니다.
(function () {
  const TT = (window.TT = window.TT || {});

  let apiPromise = null;
  function loadApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof prev === "function") { try { prev(); } catch (e) { /* 무시 */ } }
        resolve(window.YT);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.async = true;
      s.onerror = () => { apiPromise = null; reject(new Error("youtube-api")); };
      document.head.appendChild(s);
    });
    return apiPromise;
  }

  const ERRORS = {
    2: "영상 주소가 올바르지 않아요.",
    5: "이 브라우저에서는 영상을 재생할 수 없어요.",
    100: "영상을 찾을 수 없어요. 삭제되었거나 비공개로 바뀌었을 수 있어요.",
    101: "이 영상은 앱에서 재생할 수 없어요. (영상 주인이 퍼가기를 막아 두었어요)",
    150: "이 영상은 앱에서 재생할 수 없어요. (영상 주인이 퍼가기를 막아 두었어요)",
    153: "영상 재생 설정 오류예요. 파일을 더블클릭하지 말고 「실행하기.bat」으로 열어 주세요."
  };

  const STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

  class Player {
    // handlers: { onReady(player), onState(state), onError(code, message) }
    constructor(container, videoId, handlers = {}) {
      this.h = handlers;
      this.videoId = videoId;
      this.ready = false;
      this.yt = null;
      const el = document.createElement("div");
      container.innerHTML = "";
      container.appendChild(el);

      loadApi()
        .then((YT) => {
          const vars = {
            autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3,
            rel: 0, playsinline: 1, cc_load_policy: 0, modestbranding: 1, enablejsapi: 1
          };
          if (/^https?:$/.test(location.protocol)) vars.origin = location.origin;
          this.yt = new YT.Player(el, {
            videoId,
            width: "100%",
            height: "100%",
            playerVars: vars,
            events: {
              onReady: () => { this.ready = true; if (this.h.onReady) this.h.onReady(this); },
              onStateChange: (e) => {
                if (e.data === STATE.PLAYING) this._captionsOff();
                if (this.h.onState) this.h.onState(e.data);
              },
              onError: (e) => {
                if (this.h.onError) this.h.onError(e.data, ERRORS[e.data] || `영상 오류가 생겼어요. (코드 ${e.data})`);
              }
            }
          });
        })
        .catch(() => {
          if (this.h.onError) this.h.onError("api", "유튜브에 연결하지 못했어요. 인터넷 연결을 확인해 주세요.");
        });
    }
    // 유튜브 자체 자막을 끕니다(우리 자막과 겹치지 않게).
    _captionsOff() {
      try { this.yt.unloadModule("captions"); this.yt.unloadModule("cc"); } catch (e) { /* 무시 */ }
    }
    play() { if (this.ready) this.yt.playVideo(); }
    pause() { if (this.ready) this.yt.pauseVideo(); }
    seek(t) { if (this.ready) this.yt.seekTo(Math.max(0, t), true); }
    time() { return this.ready ? this.yt.getCurrentTime() || 0 : 0; }
    state() { return this.ready ? this.yt.getPlayerState() : STATE.UNSTARTED; }
    duration() { return this.ready ? this.yt.getDuration() || 0 : 0; }
    setRate(r) { if (this.ready) this.yt.setPlaybackRate(r); }
    destroy() {
      try { if (this.yt && this.yt.destroy) this.yt.destroy(); } catch (e) { /* 무시 */ }
      this.ready = false;
      this.h = {};
    }
  }

  TT.Player = Player;
  TT.YTState = STATE;
})();
