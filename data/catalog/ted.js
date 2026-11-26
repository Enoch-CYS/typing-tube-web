// 🎤 TED 강의 — 대사 없이 기본 정보만 둡니다(강의 대본은 저장소에 넣지 않음).
// 이 파일은 「TED 강의」 담당 세션만 고칩니다.
// 항목 형식: { videoId, title(강의 제목), artist(연사), cat: "ted", level, durationSec, clip: { start, end }(이 구간만 씀, 초), note }
// 강연은 말이 촘촘해서 영상 1분 ≈ 타자 약 10분. 그래서 영화처럼 이야기가 한 덩어리로 끝나는 1분 30초 안팎(타자 약 15분)만 씁니다(2026-11-26 사용자 결정).
// ⚠ 한국어 화면의 유튜브는 TED 스크립트를 한국어로 보여 줍니다. 유튜브 언어를 English로 바꾼 뒤 복사하세요(자막 준비실 안내 참고).
// level: 쉬움 · 보통 · 어려움 (초5 눈높이). 순서: 쉬움 → 보통 → 어려움.
// note는 관리자용 메모입니다(화면에 나오지 않음). 줄 수·예상 시간은 유튜브 영어 스크립트 글자 수만 센 어림값(15 WPM). 자세한 기록: docs/자료/TED 강의.md
window.TT = window.TT || {};
TT.catalog = TT.catalog || [];
TT.catalog.push(
  // ── 쉬움 ──
  { videoId: "aISXCw0Pi94", title: "How Every Child Can Thrive by Five", artist: "몰리 라이트 (7세)", cat: "ted", level: "쉬움", durationSec: 463, clip: { start: 0, end: 128 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 51줄·약 53분 → 0:00~2:08만 15줄·약 15분 · 일곱 살 연사가 또박또박 말함" },
  { videoId: "Fkd9TWUtFm0", title: "A 12-year-old App Developer", artist: "토머스 수아레스 (12세)", cat: "ted", level: "쉬움", durationSec: 281, clip: { start: 0, end: 95 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 32줄·약 45분 → 0:00~1:35만 12줄·약 16분 · 열두 살에 앱을 만든 이야기" },
  { videoId: "JnfBXjWm7hc", title: "Try Something New for 30 Days", artist: "맷 커츠", cat: "ted", level: "쉬움", durationSec: 207, clip: { start: 14, end: 99 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 27줄·약 31분 → 0:14~1:39만 12줄·약 16분 · 소설 쓰기 도전(1:40~) 앞에서 자름" },
  { videoId: "Y6bbMQXQ180", title: "Secrets of Success in 8 Words", artist: "리처드 세인트 존", cat: "ted", level: "쉬움", durationSec: 226, clip: { start: 24, end: 95 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 32줄·약 37분 → 0:24~1:35만 13줄·약 15분 · 앞 24초는 소개 화면" },
  // ── 보통 ──
  { videoId: "RAoo--SeUIk", title: "My Invention That Made Peace with Lions", artist: "리처드 투레레 (13세)", cat: "ted", level: "보통", durationSec: 441, clip: { start: 0, end: 107 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 57줄·약 66분 → 0:00~1:47만 13줄·약 15분 · 케냐 억양, 사자가 소를 해친 이야기가 잠깐 나옴(사용자 확인)" },
  { videoId: "1K5SycZjGhI", title: "Weird, or Just Different?", artist: "데릭 시버스", cat: "ted", level: "보통", durationSec: 192, clip: { start: 14, end: 87 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 21줄·약 32분 → 0:14~1:27만 10줄·약 16분 · 일본 주소 이야기, 말이 조금 빠름" },
  { videoId: "M0yhHKWUa0g", title: "Don't Eat the Marshmallow!", artist: "호아킴 데 포사다", cat: "ted", level: "보통", durationSec: 435, clip: { start: 133, end: 311 },
    note: "TED 공식. 사람이 단 영어 자막 · 전체 37줄·약 42분 → 2:13~5:11만 12줄·약 14분 · 3:10~4:50 아이들 실험 영상(대사 거의 없음)이 들어가도록 고름. 3:09 줄은 영상 앞 짧은 줄이라 검수 때 🚫 빼면 앞 줄에 붙어 영상이 이어 나옴 · 다른 안: 0:17~1:58(실험 설명, 13줄·약 16분)" },
  { videoId: "QEzlsjAqADA", title: "Why Do Honeybees Love Hexagons?", artist: "TED-Ed 애니메이션", cat: "ted", level: "보통", durationSec: 238, clip: { start: 0, end: 78 },
    note: "TED-Ed 공식. 사람이 단 영어 자막 · 전체 32줄·약 46분 → 0:00~1:18만 12줄·약 15분" },
  { videoId: "sI8NsYIyQ2A", title: "Why Do Cats Act So Weird?", artist: "TED-Ed 애니메이션", cat: "ted", level: "보통", durationSec: 298, clip: { start: 0, end: 97 },
    note: "TED-Ed 공식. 사람이 단 영어 자막 · 전체 31줄·약 49분 → 0:00~1:37만 9줄·약 15분 · 줄이 길다" },
  // ── 어려움 ──
  { videoId: "MMmOLN5zBLY", title: "The Benefits of a Bilingual Brain", artist: "TED-Ed 애니메이션", cat: "ted", level: "어려움", durationSec: 304, clip: { start: 0, end: 85 },
    note: "TED-Ed 공식. 사람이 단 영어 자막 · 전체 33줄·약 59분 → 0:00~1:25만 10줄·약 15분 · 뇌·언어 낱말이 어렵고 줄이 길다" }
);
