// 영상 분류 — 곡 목록의 탭 순서와 이름입니다.
// kind: song(노래 → [가사 자동 찾기]) / talk(강의·대화·영화 → 유튜브 [스크립트 표시] 붙여넣기)
//       lesson(교재 단원 → 영상 없이 기기 음성이 읽어 주는 문장 연습, 자막 준비실에는 나오지 않음)
// 영상 목록은 분류마다 data/catalog/<id>.js 파일에 따로 둡니다(분류별 담당 세션이 자기 파일만 고침).
window.TT = window.TT || {};
TT.categories = [
  { id: "pop", name: "팝송", icon: "🎵", kind: "song" },
  { id: "ccm", name: "CCM", icon: "🙏", kind: "song" },
  { id: "talk", name: "빨모샘의 라이브 영어회화", icon: "💬", kind: "lesson" },
  { id: "movie", name: "영화 명장면", icon: "🎬", kind: "talk" },
  { id: "ted", name: "TED 강의", icon: "🎤", kind: "talk" }
];
TT.catalog = TT.catalog || [];
