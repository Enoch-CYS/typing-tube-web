// 🙏 CCM — 가사 없이 기본 정보만 둡니다(가사는 저장소에 넣지 않음).
// 이 파일은 「CCM」 담당 세션만 고칩니다.
// 항목 형식: { videoId, title, artist, cat: "ccm", level, durationSec, note }
// title·artist는 ✎ 자막 준비실의 [🔎 가사 자동 찾기] 검색어로도 쓰입니다(LRCLIB에서 맞는 버전이 찾아지는 이름 그대로).
// level: 쉬움 · 보통 · 어려움 (초5 눈높이). 순서: 쉬운 곡부터, 같은 난이도 안에서는 예상 시간이 짧은 곡부터(앱 목록이 이 순서 그대로 나옴).
// note는 관리자용 메모입니다(화면에 나오지 않음). 자세한 확인 기록: docs/자료/CCM.md
window.TT = window.TT || {};
TT.catalog = TT.catalog || [];
TT.catalog.push(
  // ── 쉬움 ──
  { videoId: "LuvfMDhTyMA", title: "Lord, I Need You", artist: "Matt Maher", cat: "ccm", level: "쉬움", durationSec: 208,
    note: "mattmaherVEVO 공식 가사 영상. LRCLIB 208초 버전 ✓ · 28줄·약 10분" },
  { videoId: "Obp-9BEZe1c", title: "Amazing Grace", artist: "Pentatonix", cat: "ccm", level: "쉬움", durationSec: 281,
    note: "PentatonixVEVO 공식 영상(My Chains Are Gone). LRCLIB 281초 버전 ✓ · 34줄·약 13분 · 첫 줄 시간이 버전마다 2.9초/7.3초, 검수 때 확인 · 옛말 몇 개(wretch 등)는 단어 뜻으로 도움" },
  // ── 보통 ──
  { videoId: "OQ4ePVo_hiw", title: "Way Maker", artist: "Sinach", cat: "ccm", level: "보통", durationSec: 306,
    note: "MultiTracks 세션 영상(원곡 음원 길이). LRCLIB 307초 버전 ✓ · 42줄·약 17분 · 처음 받은 SINACH 라이브 QM8jQHE5AAk(526초)는 맞는 가사가 없어 바꿈(2026-11-25 사용자 결정)" },
  { videoId: "MstpgDV5O_M", title: "10,000 Reasons", artist: "Matt Redman", cat: "ccm", level: "보통", durationSec: 342,
    note: "공식 음원(Topic) 앨범판. LRCLIB 342초 버전 ✓ · 38줄·약 17분 · 처음 받은 뮤직비디오 XtwIT8JjddM(262초)은 올라온 가사가 모두 앨범판 시간(마지막 줄 5:21)이라 바꿈(2026-11-25 사용자 결정)" },
  { videoId: "n2wvVo8_xjc", title: "Oceans (Where Feet May Fail) (Radio Version)", artist: "Hillsong UNITED", cat: "ccm", level: "보통", durationSec: 250,
    note: "공식 음원(Topic) 라디오판. LRCLIB 250초 버전 ✓ · 40줄·약 17분 · 제목에 (Radio Version)이 있어야 맞는 가사가 찾아짐(「Oceans」만 쓰면 9분판 68줄이 나옴) · 처음 받은 dy9nwe9_xzw(540초, 약 27분)는 너무 길어 바꿈(2026-11-25 사용자 결정)" },
  // Raise A Hallelujah(G2XtRuPfaAU)·Good Grace(EhKSRIvDFI0)는 2026-11-25 사용자 결정으로 뺌 — docs/자료/CCM.md 참고
  // ── 어려움 ──
  { videoId: "Yf6C0L_7-CA", title: "How Great Thou Art", artist: "Carrie Underwood", cat: "ccm", level: "어려움", durationSec: 331,
    note: "carrieunderwoodVEVO 공식 공연 영상. LRCLIB 331초 버전 ✓ · 26줄·약 13분 · 줄이 길고 옛말(Thou·art·hast)이 많음" },
  { videoId: "m_063OI38RQ", title: "In Christ Alone", artist: "Keith & Kristyn Getty", cat: "ccm", level: "어려움", durationSec: 250,
    note: "Keith & Kristyn Getty 공식 가사 영상(CityAlight와 함께). LRCLIB 250초 버전 ✓ · 36줄·약 16분 · 찬송 낱말이 어려움" },
  { videoId: "nQWFzMvCfLE", title: "What a Beautiful Name", artist: "Hillsong Worship", cat: "ccm", level: "어려움", durationSec: 343,
    note: "Hillsong Worship 공식 영상. LRCLIB 343초 버전 ✓ · 41줄·약 22분(가장 긴 곡) · 버전 목록에 1:17에서 끝나는 잘못된 버전이 섞여 있으나 자동 선택은 올바름 · 3:59 짧은 판도 가사 줄 수가 같아 그대로 둠" }
);
