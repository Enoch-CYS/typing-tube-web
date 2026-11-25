// 🎵 팝송 — 가사 없이 기본 정보만 둡니다(가사·대사는 저장소에 넣지 않음).
// 이 파일은 「팝송」 담당 세션만 고칩니다.
// 항목 형식: { videoId, title, artist, cat: "pop", level, durationSec, note }
// title은 ✎ 자막 준비실의 [🔎 가사 자동 찾기] 검색어로도 쓰입니다(LRCLIB에서 찾아지는 이름 그대로).
// level: 쉬움 · 보통 · 어려움 (2026-11-24 사용자 결정). 순서: 쉬운 곡부터(앱 목록이 이 순서 그대로 나옴).
// note는 관리자용 메모입니다(화면에 나오지 않음). 자세한 확인 기록: docs/자료/팝송.md
window.TT = window.TT || {};
TT.catalog = TT.catalog || [];
TT.catalog.push(
  // ── 쉬움 ──
  { videoId: "1kvc_dWs1f4", title: "Sing", artist: "Carpenters", cat: "pop", level: "쉬움", durationSec: 200,
    note: "공식 음원(Topic). LRCLIB 199초 버전(51줄·약 9분)이 맞음 — 200초 버전은 38줄이라 끝부분 줄이 없음. 가사 긴 버전 자동 선택(2026-11-24 결정)이 반영되면 저절로 골라짐" },
  { videoId: "zEx0-EZbqT0", title: "There's a Kind of Hush", artist: "Carpenters", cat: "pop", level: "쉬움", durationSec: 184,
    note: "공식 음원(Topic) 1985 리믹스. LRCLIB 184초 버전 ✓ · 28줄·약 10분" },
  { videoId: "6yUq_-_v4rI", title: "Close to You", artist: "Carpenters", cat: "pop", level: "쉬움", durationSec: 221 },
  // ── 보통 ──
  { videoId: "uaqoQr-aCtQ", title: "We've Only Just Begun", artist: "Carpenters", cat: "pop", level: "보통", durationSec: 185,
    note: "공식 음원(Topic). LRCLIB 185초 버전 ✓ · 27줄·약 10분" },
  { videoId: "zKo5ASVgusw", title: "Rainy Days and Mondays", artist: "Carpenters", cat: "pop", level: "보통", durationSec: 215,
    note: "공식 음원(Topic). LRCLIB 215초 버전 ✓ · 31줄·약 14분 · 처음 받은 뮤직비디오 PjFoQxjgbrs(211초)는 가사 시간과 4초 달라 바꿈(2026-11-24 사용자 결정)" },
  { videoId: "chb661WIIHM", title: "Yesterday Once More", artist: "Carpenters", cat: "pop", level: "보통", durationSec: 239,
    note: "공식 음원(Topic). LRCLIB 239초 버전 ✓ · 53줄·약 15분" },
  { videoId: "fyGWEq8IXlQ", title: "Please Mr. Postman", artist: "Carpenters", cat: "pop", level: "보통", durationSec: 167,
    note: "공식 음원(Topic) 1991 리믹스. LRCLIB 169초 버전(+2초) · 37줄·약 15분 · 리믹스라 검수 때 시간 확인" },
  { videoId: "dTMPTC4Bo5M", title: "Top of the World", artist: "Carpenters", cat: "pop", level: "보통", durationSec: 179,
    note: "공식 음원(Topic). LRCLIB 179초 버전 ✓ · 28줄·약 16분" },
  // ── 어려움 ──
  { videoId: "7qC4YzleGtQ", title: "I Won't Last a Day Without You", artist: "Carpenters", cat: "pop", level: "어려움", durationSec: 233,
    note: "공식 음원(Topic). LRCLIB 233초 버전 ✓ · 34줄·약 18분" },
  { videoId: "evETS8_WFGE", title: "Only Yesterday", artist: "Carpenters", cat: "pop", level: "어려움", durationSec: 227,
    note: "CarpentersVEVO 뮤직비디오. LRCLIB 227초 버전 ✓ · 42줄·약 20분 · 첫 줄 시간이 버전마다 다름(3.0초/8.9초), 검수 때 확인" }
);
