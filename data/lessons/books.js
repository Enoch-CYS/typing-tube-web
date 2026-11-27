// 📚 생활 영어 교재 목록 — 책이 늘어나면 여기에 한 권씩 더합니다(책 고르기 화면은 두 번째 책이 생길 때 만듦, 2026-11-27 결정).
// 단원 자료는 책·장마다 data/lessons/<책id>-ch<장>.js 파일에 두고, 단원 항목은 TT.catalog에 cat: "talk"로 들어갑니다.
// 기록 열쇠(videoId) = "<책id>-u<UNIT 두 자리>" (예: bm-u03). 영문·숫자 6~20자.
// ⚠ 저작권: 책의 문장·대화·목차 글은 옮겨 적지 않습니다. 장 이름은 우리말로 새로 붙였습니다.
window.TT = window.TT || {};
TT.books = [
  {
    id: "bm", title: "빨모샘의 라이브 영어회화", short: "빨모샘",
    note: "PART 2 연습 가이드 75단원(CHAPTER 4~8). 책 쪽 − 8 = PDF 쪽. 한 단원 4쪽",
    chapters: [
      { no: 4, title: "바로 쓰는 간단한 표현", units: [1, 15] },
      { no: 5, title: "뉘앙스를 살리는 표현", units: [16, 30] },
      { no: 6, title: "대화를 자연스럽게 잇는 표현", units: [31, 45] },
      { no: 7, title: "영어다운 말하기 방식", units: [46, 60] },
      { no: 8, title: "고쳐 쓰는 한국식 영어", units: [61, 75] }
    ]
  }
];
