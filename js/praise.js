// 완료 화면의 칭찬 — 지난번과 비교해 "무엇이 자랐는지"를 구체적으로 짚어 줍니다.
// (막연한 칭찬이나 요란한 효과 대신, 숫자로 보이는 성장을 차분하게 칭찬)
(function () {
  const TT = (window.TT = window.TT || {});

  // 앱 전용 칭찬 배지(직접 그린 그림). viewBox 0 0 120 120
  const BADGES = {
    // 🌱 첫 완주: 새싹
    first: `
      <circle cx="60" cy="60" r="56" fill="#dff1e4"/>
      <circle cx="60" cy="60" r="49" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
      <ellipse cx="60" cy="90" rx="27" ry="7" fill="#b98a5a"/>
      <path d="M60 89 C60 76 60 66 60 55" stroke="#3f9a62" stroke-width="5" stroke-linecap="round" fill="none"/>
      <path d="M60 66 C45 66 36 56 36 43 C50 43 60 52 60 66Z" fill="#5cbf7f"/>
      <path d="M60 58 C60 43 70 32 86 32 C86 47 76 58 60 58Z" fill="#45a96a"/>`,
    // 🎯 정확도 향상: 과녁
    target: `
      <circle cx="60" cy="60" r="56" fill="#fde7e4"/>
      <circle cx="58" cy="62" r="31" fill="#ef6f61"/>
      <circle cx="58" cy="62" r="22" fill="#fff"/>
      <circle cx="58" cy="62" r="13" fill="#ef6f61"/>
      <circle cx="58" cy="62" r="5" fill="#fff"/>
      <path d="M59 61 L89 31" stroke="#25304a" stroke-width="4" stroke-linecap="round"/>
      <path d="M86 26 L95 25 L94 34 L89 31Z" fill="#25304a"/>`,
    // ⚡ 속도 향상: 번개
    bolt: `
      <circle cx="60" cy="60" r="56" fill="#fff3cf"/>
      <path d="M22 50 H36 M18 62 H34 M24 74 H38" stroke="#e5b54a" stroke-width="4" stroke-linecap="round"/>
      <path d="M70 20 L44 64 H60 L54 100 L84 52 H66 L76 20Z" fill="#f2b134" stroke="#c98a12" stroke-width="3" stroke-linejoin="round"/>`,
    // ⭐ 정확도·속도 모두 향상: 별
    star: `
      <circle cx="60" cy="60" r="56" fill="#e9e5fb"/>
      <path d="M60 26 L69 49 L94 50 L74 65 L81 89 L60 75 L39 89 L46 65 L26 50 L51 49Z" fill="#f5c542" stroke="#d9a21b" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 26 L31 33 L38 36 L31 39 L28 46 L25 39 L18 36 L25 33Z" fill="#8a7ae0"/>
      <path d="M93 80 L95 85 L100 87 L95 89 L93 94 L91 89 L86 87 L91 85Z" fill="#8a7ae0"/>`,
    // 💪 꾸준함: 정상의 깃발
    steady: `
      <circle cx="60" cy="60" r="56" fill="#e2eef7"/>
      <path d="M18 92 L50 44 L63 62 L74 50 L102 92Z" fill="#6d8fb0"/>
      <path d="M50 44 L42 56 L50 53 L56 58 L58 56Z" fill="#fff"/>
      <path d="M74 50 L74 26" stroke="#25304a" stroke-width="3" stroke-linecap="round"/>
      <path d="M74 27 L93 33 L74 40Z" fill="#ef6f61"/>`,
    // 🌈 다시 도전: 무지개
    retry: `
      <circle cx="60" cy="60" r="56" fill="#e6f3f7"/>
      <path d="M26 84 A34 34 0 0 1 94 84" stroke="#ef6f61" stroke-width="7" fill="none"/>
      <path d="M34 84 A26 26 0 0 1 86 84" stroke="#f2b134" stroke-width="7" fill="none"/>
      <path d="M42 84 A18 18 0 0 1 78 84" stroke="#5cbf7f" stroke-width="7" fill="none"/>
      <path d="M50 84 A10 10 0 0 1 70 84" stroke="#5b8fd6" stroke-width="7" fill="none"/>
      <g fill="#fff"><circle cx="24" cy="86" r="9"/><circle cx="34" cy="88" r="7"/><circle cx="96" cy="86" r="9"/><circle cx="86" cy="88" r="7"/></g>`
  };

  function badge(kind) {
    return `<svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-hidden="true">${BADGES[kind] || BADGES.first}</svg>`;
  }

  const signed = (n, digits = 0) => (n > 0 ? "+" : "") + Number(n).toFixed(digits);

  // result: { accuracy, wpm, lines }, prev: 지난번 결과(없으면 null), title: 곡 제목
  function pick(result, prev, title) {
    const acc = result.accuracy;
    const wpm = result.wpm;
    let out;
    if (!prev) {
      out = {
        kind: "first", emoji: "🌱",
        title: "첫 완주를 축하해요!",
        message: `「${title}」 ${result.lines}${result.unit === "문제" ? "문제를 끝까지 해냈어요" : "줄을 끝까지 따라 쳤어요"}. 시작한 일을 끝까지 해낸 것, 그것이 가장 큰 실력이에요.`
      };
    } else {
      const dA = Math.round((acc - prev.accuracy) * 10) / 10;
      const dW = wpm - prev.wpm;
      const upA = dA >= 1;
      const upW = dW >= 2;
      if (upA && upW) {
        out = {
          kind: "star", emoji: "⭐",
          title: "정확도도 속도도 함께 자랐어요!",
          message: `지난번보다 정확도 ${signed(dA, 1)}%p, 속도 ${signed(dW)} WPM. 꾸준히 연습한 열매예요.`
        };
      } else if (upA) {
        out = {
          kind: "target", emoji: "🎯",
          title: `정확도가 ${dA.toFixed(1)}%p 올랐어요!`,
          message: "서두르지 않고 한 글자씩 또박또박 친 덕분이에요."
        };
      } else if (upW) {
        out = {
          kind: "bolt", emoji: "⚡",
          title: `손이 더 빨라졌어요! (${signed(dW)} WPM)`,
          message: dA <= -3
            ? "손가락이 자판 자리를 기억하기 시작했어요. 다음엔 정확도도 함께 지켜 봐요."
            : "손가락이 자판 자리를 기억하기 시작했어요."
        };
      } else if (dA > -3 && dW > -5) {
        out = {
          kind: "steady", emoji: "💪",
          title: "지난번만큼 든든하게 해냈어요",
          message: "실력을 지키는 것도 꾸준함이에요. 아래 단어를 한 번 더 눈여겨보면 다음엔 더 자랄 거예요."
        };
      } else {
        out = {
          kind: "retry", emoji: "🌈",
          title: "오늘도 끝까지 해냈어요",
          message: "기록이 조금 낮아도 괜찮아요. 끝까지 해낸 마음이 소중해요. 다음엔 천천히, 정확하게 쳐 봐요."
        };
      }
    }
    out.extra = acc >= 98 ? `💎 정확도 ${acc}% — 거의 완벽해요!` : "";
    return out;
  }

  TT.praise = { pick, badge };
})();
