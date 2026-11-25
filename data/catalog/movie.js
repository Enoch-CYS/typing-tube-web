// 🎬 영화 명장면 — 대사 없이 기본 정보만 둡니다(대사는 저장소에 넣지 않음).
// 이 파일은 「영화 명장면」 담당 세션만 고칩니다.
// 항목 형식: { videoId, title(장면 이름), artist(영화 제목), cat: "movie", level, durationSec, clip?: { start, end }(이 구간만 씀, 초), note }
// 영화 대사는 촘촘해서 영상 1분 ≈ 타자 7~9분. 그래서 타자 15분 안팎이 되도록 긴 클립은 clip 구간만 씁니다(2026-11-25 사용자 결정).
// level: 쉬움 · 보통 · 어려움 (초5 눈높이). 순서: 쉬움 → 보통 → 어려움, 같은 난이도에서는 애니메이션부터, 같은 영화는 이야기 순서대로.
// note는 관리자용 메모입니다(화면에 나오지 않음). 줄 수·예상 시간은 유튜브 스크립트 글자 수만 센 어림값(15 WPM). 자세한 기록: docs/자료/영화 명장면.md
window.TT = window.TT || {};
TT.catalog = TT.catalog || [];
TT.catalog.push(
  // ── 쉬움 ──
  { videoId: "6Ip9NfxgbN8", title: "Falling With Style", artist: "토이 스토리", cat: "movie", level: "쉬움", durationSec: 144,
    note: "MaxMovieClips(비공식 클립 채널). 자동 자막 · 13줄·약 8분 · 전체 관람가 · 처음 고른 「Woody Memorable Moments」(14분 모음, 스크립트 없음) 대신(2026-11-25 사용자 결정)" },
  { videoId: "FZEZukqjFKk", title: "The Last Walk", artist: "어바웃 타임", cat: "movie", level: "쉬움", durationSec: 161,
    note: "IceBloodKing(비공식). 자동 자막 · 11줄·약 7분 · 처음 받은 Movieclips 「The Last Time With Dad」 E_z2PGmUIrE는 자막이 없어 같은 장면의 이 영상으로 바꿈 · 영화는 R등급(다른 장면의 거친 말), 이 장면은 아빠와 바닷가를 걷는 잔잔한 장면(아빠의 죽음을 다룸) · 검수 때 한 줄씩 들으며 확인" },
  { videoId: "ITGEGE9v0d0", title: "Named After His Dad", artist: "포레스트 검프", cat: "movie", level: "쉬움", durationSec: 235,
    note: "Binge Society. 자동 자막 · 24줄·약 17분(통째로) · 말이 느리고 낱말이 쉬움 · PG-13 영화, 장면은 포레스트가 아들을 처음 만나는 잔잔한 장면 · 「Run, Forrest, Run!」(괴롭힘 장면·자막 없음)은 뺌(2026-11-25 사용자 결정)" },
  // ── 보통 ──
  { videoId: "g2IF5NG2vU4", title: "Woody Meets Buzz", artist: "토이 스토리", cat: "movie", level: "보통", durationSec: 150, clip: { start: 0, end: 96 },
    note: "Disney Kids 공식. 자동 자막 · 전체 17줄·약 22분 → 0:00~1:36만 약 13분 · 말이 빠름" },
  { videoId: "Hj1bin9Y4Ko", title: "The Morning Lesson", artist: "라이온 킹 (2019)", cat: "movie", level: "보통", durationSec: 154,
    note: "Clip Cut Movie(비공식). 자동 자막 · 17줄·약 16분(통째로) · 무파사가 심바에게 왕국을 보여 주는 장면 · PG" },
  { videoId: "KjKpX-axoBU", title: "The Great Kings of the Past", artist: "라이온 킹 (2019)", cat: "movie", level: "보통", durationSec: 136,
    note: "Clip Cut Movie(비공식). 자동 자막 · 15줄·약 12분 · 별 아래에서 무파사가 위대한 왕들 이야기를 하는 장면 · 처음 고른 「The Elephant Graveyard」 HfkYaLuydgw(하이에나 위협·싸움) 대신(2026-11-25 사용자 결정)" },
  { videoId: "ZuNFbzXh-hQ", title: "Broccoli", artist: "인사이드 아웃", cat: "movie", level: "보통", durationSec: 261, clip: { start: 0, end: 107 },
    note: "JoBlo Animation(비공식 클립 채널). 자동 자막 · 전체 28줄·약 30분 → 0:00~1:47(1:47에 대사 쉼)만 약 17분 · PG" },
  { videoId: "riNDhwFOHzM", title: "First Day of School", artist: "인사이드 아웃", cat: "movie", level: "보통", durationSec: 219, clip: { start: 0, end: 86 },
    note: "Animated World(비공식). 자동 자막 · 전체 20줄·약 25분 → 0:00~1:26만 약 15분 · 라일리가 반에서 자기소개하는 장면(뒤쪽에서 울게 됨) · PG" },
  { videoId: "0aKoA97cj_U", title: "You're a Wizard, Harry", artist: "해리 포터와 마법사의 돌", cat: "movie", level: "보통", durationSec: 619, clip: { start: 389, end: 480 },
    note: "ClipZone: Heroes & Villains(10분 모음). 자동 자막 · 전체 50줄·약 41분 → 장 「Harry learns he is a wizard」 앞부분 6:29~8:00만 13줄·약 12분 · 해그리드가 문을 부수고 들어오는 앞 장면은 뺌 · PG" },
  { videoId: "z4K2F_OALPQ", title: "The Sorting Ceremony", artist: "해리 포터와 마법사의 돌", cat: "movie", level: "보통", durationSec: 211,
    note: "Harry Potter 공식. 사람이 단 영어 자막 있음([스크립트 표시]에서 자동 생성 말고 English 고르기) · 15줄·약 11분 · 기숙사 이름 같은 고유명사가 나옴 · PG" },
  { videoId: "Lwt9rZaIIdE", title: "Beth & Mr. Shaibel", artist: "퀸스 갬빗", cat: "movie", level: "보통", durationSec: 120,
    note: "themartac(팬이 여러 장면을 엮은 영상). 사람이 단 영어 자막(en-GB) 있음 · 14줄·약 11분 · 어린 베스와 체스를 가르친 관리인 아저씨 장면 · 시리즈는 TV-MA라 처음 고른 Final Chess Game dtD3FVJ37Rk·Beth vs 12 Players esRZchm3Gq8(둘 다 자막 없음, 대사 적음) 대신 이 영상으로(2026-11-25 사용자 결정) · 검수 때 다른 장면이 섞였는지 확인" },
  { videoId: "ArlsU2_cUbg", title: "Can I Have Your Autograph?", artist: "노팅 힐", cat: "movie", level: "보통", durationSec: 162,
    note: "Movieclips 공식. 사람이 단 영어 자막 있음 · 16줄·약 16분(통째로) · 서점에서 처음 만나는 장면(책 도둑이 잠깐 나옴) · PG-13 로맨스 영화" },
  { videoId: "RESwG23_YGw", title: "Just a Girl", artist: "노팅 힐", cat: "movie", level: "보통", durationSec: 163,
    note: "Movieclips 공식. 사람이 단 영어 자막 있음 · 14줄·약 10분 · 안나가 마음을 고백하는 장면 · PG-13 로맨스 영화" },
  { videoId: "iUB-sCiZIUw", title: "The Secret Formula for Happiness", artist: "어바웃 타임", cat: "movie", level: "보통", durationSec: 323, clip: { start: 0, end: 124 },
    note: "Universal Pictures 공식. 사람이 단 영어 자막 있음 · 전체 31줄·약 23분 → 0:00~2:04(대사 쉼)만 약 13분 · 하루를 두 번 살아 보는 장면 · 영화는 R등급(다른 장면의 거친 말), 검수 때 한 줄씩 들으며 확인" },
  // ── 어려움 ──
  { videoId: "b2f2Kqt_KcE", title: "Andy's Interview", artist: "악마는 프라다를 입는다", cat: "movie", level: "어려움", durationSec: 143,
    note: "Movieclips 공식. 사람이 단 영어 자막 있음 · 11줄·약 13분 · 패션 잡지 면접 장면, 말이 빠르고 줄이 김 · PG-13" },
  { videoId: "-rDTRuCOs9g", title: "The Cerulean Sweater", artist: "악마는 프라다를 입는다", cat: "movie", level: "어려움", durationSec: 174, clip: { start: 80, end: 174 },
    note: "HBO 공식. 사람이 단 영어 자막 있음 · 전체 22줄·약 29분 → 1:20~끝(미란다가 「세룰리안」 색을 설명하는 부분)만 약 15분 · 앞 줄이 잘리면 검수 때 시작을 당기기 · PG-13" },
  { videoId: "1uRBxyPqkh0", title: "Better Late Than Never", artist: "인턴", cat: "movie", level: "어려움", durationSec: 70,
    note: "Rotten Tomatoes Coming Soon. 자동 자막 · 11줄·약 13분 · 영상은 1분 10초지만 말이 매우 빠름 · PG-13" },
  { videoId: "FyBh3iPwSZE", title: "First Meeting", artist: "인턴", cat: "movie", level: "어려움", durationSec: 183, clip: { start: 0, end: 90 },
    note: "TheICONTheMICKing(비공식). 자동 자막 · 전체 27줄·약 30분 → 0:00~1:30만 약 15분 · 벤과 줄스가 처음 만나는 장면 · PG-13" }
);
