// 💬 생활 영어 — 교재 단원으로 하는 문장 연습(영상 없음, 기기 음성이 읽어 줌)
// 이 파일은 「생활 영어」 담당 세션만 고칩니다.
//
// 기준 교재: 『빨모샘의 라이브 영어회화』 PART 2 (PDF 쪽 → 책 UNIT). 앱 1단원 = PDF 58~61쪽 = 책 UNIT 03.
// ⚠ 저작권: 책의 문장·대화는 이 파일에 옮겨 적지 않습니다(이 파일은 공개 웹에 올라감).
//    책에서는 「배우는 표현(문법 틀)」만 가져오고, 문장·문답은 모두 새로 지었습니다(2026-11-26 사용자 결정).
// 눈높이: 중학생~고1(10학년). 긴 문장은 한 줄(약 12낱말 안)로 줄입니다.
//
// 문제은행(2026-11-26 사용자 결정): 단원마다 문장 12개(쉬운 것 → 긴 것 순서)를 두고, 할 때마다
//   그중 pick.follow개를 골라 ① 따라 치기(은행 순서대로) → 고른 문장 가운데 pick.qa개로 ② 문답(순서 섞음).
//   문답의 대답은 그날 따라 친 문장 그대로라, 같은 문장을 몇 분 뒤 조각 맞추기 → 떠올려 치기로 복습합니다.
//
// 항목 형식: { videoId: "lesson-uNN"(기록 열쇠, 영문·숫자 6~20자), title, artist(부제), cat: "talk", level, lesson: {
//   pattern: { en, ko },          // 단원 첫 화면의 표현 설명
//   pick: { follow: 6, qa: 4 },   // 한 번에 고를 수
//   bank: [ { en, ko, key, words?,                       // 따라 치기 문장(key = 강조할 표현, words = 낱말 뜻)
//             qa: { q: { en, ko }, decoys: [ ] } } ]      // 짝 문답: 질문 + 헷갈리게 하는 낱말 조각
// } }
// 문답의 대답 = 따라 친 그 문장 그대로(글자 하나까지 같게, 2026-11-26 사용자 결정). 질문은 그 문장이 자연스러운 대답이 되게 짓습니다.
window.TT = window.TT || {};
TT.catalog = TT.catalog || [];
TT.catalog.push(
  {
    videoId: "lesson-u01", title: "1단원 · ~치고는 (for)", artist: "기준에 비해 어떤지 말하기", cat: "talk", level: "보통",
    note: "책 UNIT 03(PDF 58~61쪽)의 표현 틀만 가져와 새로 지은 문장 12개 문제은행",
    lesson: {
      pattern: {
        en: "for + 기준(사람·때·물건)",
        ko: "「~치고는, ~에 비해」 — 보통 기대하는 기준과 비교해서 말할 때 써요. 기준이 길면 for someone who ~ / for a team that ~ 처럼 늘일 수 있어요."
      },
      pick: { follow: 6, qa: 4 },
      bank: [
        { en: "It's really warm for November.", ko: "11월치고는 정말 따뜻하네.", key: "for November",
          qa: { q: { en: "It's November already. Isn't it cold outside?", ko: "벌써 11월이야. 밖에 춥지 않아?" },
                decoys: ["to", "at"] } },
        { en: "You're pretty tall for a seventh grader.", ko: "너 7학년(중1)치고는 키가 꽤 크다.", key: "for a seventh grader",
          words: [{ word: "grader", ko: "학년생" }],
          qa: { q: { en: "Guess what? I'm only in seventh grade.", ko: "있잖아, 나 겨우 7학년(중1)이야." },
                decoys: ["to", "an"] } },
        { en: "The test was pretty easy for a final exam.", ko: "기말고사치고는 시험이 꽤 쉬웠어.", key: "for a final exam",
          words: [{ word: "final", ko: "마지막의" }, { word: "exam", ko: "시험" }],
          qa: { q: { en: "How was your final exam?", ko: "기말고사 어땠어?" },
                decoys: ["as", "is"] } },
        { en: "For a Monday, the bus was pretty empty.", ko: "월요일치고는 버스가 꽤 한산했어.", key: "For a Monday",
          words: [{ word: "empty", ko: "텅 빈" }],
          qa: { q: { en: "Was the bus crowded this morning?", ko: "오늘 아침 버스 붐볐어?" },
                decoys: ["an", "were"] } },
        { en: "This phone is pretty light for its size.", ko: "이 휴대폰은 크기에 비해 꽤 가벼워.", key: "for its size",
          words: [{ word: "light", ko: "가벼운" }],
          qa: { q: { en: "Your new phone looks big. Is it heavy?", ko: "새 휴대폰 커 보이네. 무거워?" },
                decoys: ["it", "to"] } },
        { en: "He's very calm for someone his age.", ko: "그 애는 그 나이치고는 아주 차분해.", key: "for someone his age",
          words: [{ word: "calm", ko: "차분한" }],
          qa: { q: { en: "Your little brother didn't cry at the dentist?", ko: "네 동생 치과에서 안 울었어?" },
                decoys: ["him", "to"] } },
        { en: "Your drawing is amazing for a first try.", ko: "처음 해 본 것치고는 그림이 정말 놀라워.", key: "for a first try",
          words: [{ word: "amazing", ko: "놀라운" }],
          qa: { q: { en: "This is the first portrait I've ever drawn.", ko: "초상화는 이번에 처음 그려 봤어." },
                decoys: ["at", "amazed"] } },
        { en: "For a rainy day, a lot of people came to the festival.", ko: "비 오는 날치고는 축제에 사람이 많이 왔어.", key: "For a rainy day",
          words: [{ word: "festival", ko: "축제" }],
          qa: { q: { en: "Did many people come to the festival in the rain?", ko: "비 오는데 축제에 사람 많이 왔어?" },
                decoys: ["an", "come"] } },
        { en: "The food here is cheap for such a nice place.", ko: "이렇게 좋은 곳치고는 여기 음식이 싸네.", key: "for such a nice place",
          words: [{ word: "cheap", ko: "값싼" }],
          qa: { q: { en: "Is this restaurant expensive?", ko: "이 식당 비싸?" },
                decoys: ["an", "so"] } },
        { en: "Your English is great for someone who started last year.", ko: "작년에 시작한 사람치고는 영어를 아주 잘하네.", key: "for someone who started last year",
          qa: { q: { en: "I only started learning English last year. How do I sound?", ko: "영어는 작년에야 배우기 시작했어. 내 영어 어때?" },
                decoys: ["which", "starts"] } },
        { en: "For someone who hates math, you did really well on the test.", ko: "수학을 싫어하는 사람치고는 시험을 정말 잘 봤네.", key: "For someone who hates math",
          words: [{ word: "hates", ko: "싫어한다" }],
          qa: { q: { en: "I really hate math, but I got a B on the test.", ko: "나 수학 정말 싫어하는데, 시험에서 B 받았어." },
                decoys: ["which", "good"] } },
        { en: "For a team that never practiced together, we played really well.", ko: "한 번도 같이 연습한 적 없는 팀치고는 우리 정말 잘했어.", key: "For a team that never practiced together",
          words: [{ word: "practiced", ko: "연습했다" }],
          qa: { q: { en: "How did your soccer game go yesterday?", ko: "어제 축구 경기 어땠어?" },
                decoys: ["good", "practice"] } }
      ]
    }
  }
);
