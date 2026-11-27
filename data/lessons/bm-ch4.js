// 💬 생활 영어 — 『빨모샘의 라이브 영어회화』 CHAPTER 4 「바로 쓰는 간단한 표현」 UNIT 1~15
// 영상 없이 기기 음성이 읽어 주는 문장 연습(js/drill.js). 책 정보는 data/lessons/books.js.
//
// ⚠ 저작권: 책의 문장·대화는 옮겨 적지 않습니다(이 파일은 공개 웹에 올라감).
//    책에서는 「배우는 표현(문법 틀)」만 가져오고, 문장·문답은 모두 새로 지었습니다(2026-11-26 사용자 결정).
// 눈높이: 중학생~고1(10학년). 긴 문장은 한 줄(약 12낱말 안)로 줄입니다.
//
// 문제은행: 단원마다 문장 12개(쉬운 것 → 긴 것 순서). 할 때마다 6개를 골라 ① 따라 치기 → 그중 4개로 ② 문답.
//   문답의 대답 = 따라 친 그 문장 그대로(글자 하나까지 같게). 질문은 그 문장이 자연스러운 대답이 되게 짓습니다.
//
// 항목 형식: { videoId: "bm-uNN"(기록 열쇠), book: "bm", chapter, unit(책 UNIT 번호), title(표현), artist(부제), cat: "talk", level,
//   note(관리자용: PDF 쪽), lesson: {
//   pattern: { en, ko },          // 단원 첫 화면의 표현 설명
//   pick: { follow: 6, qa: 4 },   // 한 번에 고를 수
//   bank: [ { en, ko, key, words?,                       // 따라 치기 문장(key = 강조할 표현, words = 낱말 뜻)
//             qa: { q: { en, ko }, decoys: [ ] } } ]      // 짝 문답: 질문 + 헷갈리게 하는 낱말 조각(틀리기 쉬운 문법으로)
// } }
// 목록은 UNIT 번호 순서로 보입니다(파일 안 순서와 상관없음).
window.TT = window.TT || {};
TT.catalog = TT.catalog || [];
TT.catalog.push(
  {
    videoId: "bm-u03", book: "bm", chapter: 4, unit: 3, title: "~치고는 (for)", artist: "기준에 비해 어떤지 말하기", cat: "talk", level: "보통",
    note: "PDF 58~61쪽. 표현 틀만 가져와 새로 지은 문장 12개",
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
  },
  {
    videoId: "bm-u01", book: "bm", chapter: 4, unit: 1, title: "일단은, 지금은 (for now)", artist: "지금 당장의 임시 해결을 말하기", cat: "talk", level: "쉬움",
    note: "PDF 50~53쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "for now / for today / for the time being", ko: "「일단은, 지금은」 — 지금 상황에서 우선 이렇게 하자고 할 때 써요. for today(오늘은), for the day(오늘 하루는), for tonight(오늘 밤은), for the time being(당분간은)도 같은 느낌이에요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "Let's use my pencil for now.", "ko": "일단은 내 연필을 쓰자.", "key": "for now", "qa": {"q": {"en": "I forgot my pencil case. What should I do?", "ko": "필통을 깜빡했어. 어떡하지?"}, "decoys": ["in", "at"]}},
        {"en": "That's all I need for now.", "ko": "지금은 그거면 돼.", "key": "for now", "qa": {"q": {"en": "Do you need anything else from the store?", "ko": "가게에서 더 필요한 거 있어?"}, "decoys": ["at", "needs"]}},
        {"en": "This old phone will be fine for now.", "ko": "일단은 이 낡은 휴대폰으로 괜찮을 거야.", "key": "for now", "qa": {"q": {"en": "Are you going to buy a new phone?", "ko": "새 휴대폰 살 거야?"}, "decoys": ["is", "in"]}},
        {"en": "The library is closed for the day.", "ko": "도서관은 오늘 문을 닫았어.", "key": "for the day", "qa": {"q": {"en": "Can we go to the library after dinner?", "ko": "저녁 먹고 도서관 갈 수 있어?"}, "decoys": ["a", "close"]}},
        {"en": "I've had enough snacks for tonight.", "ko": "오늘 밤은 간식을 충분히 먹었어.", "key": "for tonight", "qa": {"q": {"en": "Do you want some more chips?", "ko": "과자 좀 더 먹을래?"}, "decoys": ["at", "snack"]}},
        {"en": "This will be enough food for now.", "ko": "일단 이 정도 음식이면 충분할 거야.", "key": "for now", "qa": {"q": {"en": "Should we order more pizza?", "ko": "피자 더 시킬까?"}, "decoys": ["is", "much"]}},
        {"en": "I think we've studied enough for today.", "ko": "오늘은 충분히 공부한 것 같아.", "key": "for today", "qa": {"q": {"en": "Should we keep studying, or take a break?", "ko": "계속 공부할까, 아니면 좀 쉴까?"}, "decoys": ["at", "studying"]}},
        {"en": "The gym is fully booked for the week.", "ko": "체육관은 이번 주 예약이 다 찼어.", "key": "for the week", "words": [{"word": "booked", "ko": "예약된"}], "qa": {"q": {"en": "Can we use the school gym this week?", "ko": "이번 주에 학교 체육관 쓸 수 있어?"}, "decoys": ["full", "in"]}},
        {"en": "Let's sit here for the time being.", "ko": "우선은 여기 앉아 있자.", "key": "for the time being", "qa": {"q": {"en": "Our table isn't ready yet. Where should we wait?", "ko": "우리 자리가 아직 준비 안 됐대. 어디서 기다릴까?"}, "decoys": ["a", "sitting"]}},
        {"en": "Let's stop here for today and finish tomorrow.", "ko": "오늘은 여기까지 하고 내일 끝내자.", "key": "for today", "qa": {"q": {"en": "We still have two pages left. Should we keep going?", "ko": "아직 두 쪽 남았어. 계속할까?"}, "decoys": ["finished", "at"]}},
        {"en": "I'll wear my brother's jacket for the time being.", "ko": "당분간은 형 재킷을 입을 거야.", "key": "for the time being", "words": [{"word": "jacket", "ko": "재킷"}], "qa": {"q": {"en": "You lost your jacket? What will you wear?", "ko": "재킷을 잃어버렸어? 뭐 입을 거야?"}, "decoys": ["brothers", "an"]}},
        {"en": "The bus isn't coming, so let's just walk for now.", "ko": "버스가 안 오니까 일단은 그냥 걷자.", "key": "for now", "qa": {"q": {"en": "The bus is really late. What should we do?", "ko": "버스가 너무 늦네. 어떡할까?"}, "decoys": ["walking", "doesn't"]}}
      ]
    }
  },
  {
    videoId: "bm-u02", book: "bm", chapter: 4, unit: 2, title: "대체로 (for the most part)", artist: "100%는 아니지만 대부분 그렇다고 말하기", cat: "talk", level: "쉬움",
    note: "PDF 54~57쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "for the most part", ko: "「대체로, 대부분은」 — 완전히 다 그런 건 아니지만 거의 그렇다고 말할 때 써요. 그냥 yes·no로 답하는 것보다 성의 있게 들려요. 문장 앞에도 끝에도 둘 수 있어요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "For the most part, yes.", "ko": "대체로는 그래.", "key": "For the most part", "qa": {"q": {"en": "Did you finish your homework?", "ko": "숙제 다 했어?"}, "decoys": ["a", "yeah"]}},
        {"en": "I enjoyed the trip for the most part.", "ko": "대체로 여행이 즐거웠어.", "key": "for the most part", "qa": {"q": {"en": "Did you have fun on your school trip?", "ko": "수학여행 재미있었어?"}, "decoys": ["a", "enjoy"]}},
        {"en": "For the most part, the test was easy.", "ko": "대체로 시험은 쉬웠어.", "key": "For the most part", "qa": {"q": {"en": "How was the science test?", "ko": "과학 시험 어땠어?"}, "decoys": ["a", "is"]}},
        {"en": "My classmates are friendly for the most part.", "ko": "우리 반 친구들은 대체로 친절해.", "key": "for the most part", "words": [{"word": "classmates", "ko": "반 친구들"}], "qa": {"q": {"en": "How are the kids in your new class?", "ko": "새 반 친구들은 어때?"}, "decoys": ["friend", "a"]}},
        {"en": "The weather was nice for the most part.", "ko": "날씨는 대체로 좋았어.", "key": "for the most part", "qa": {"q": {"en": "Did it rain during your camping trip?", "ko": "캠핑하는 동안 비 왔어?"}, "decoys": ["a", "is"]}},
        {"en": "We get along for the most part.", "ko": "우리는 대체로 잘 지내.", "key": "for the most part", "qa": {"q": {"en": "Do you and your brother fight a lot?", "ko": "너 동생이랑 많이 싸워?"}, "decoys": ["gets", "a"]}},
        {"en": "The game went well for the most part.", "ko": "경기는 대체로 잘 풀렸어.", "key": "for the most part", "qa": {"q": {"en": "How did your basketball game go?", "ko": "농구 경기 어땠어?"}, "decoys": ["good", "a"]}},
        {"en": "I agree with you for the most part.", "ko": "대체로 네 말에 동의해.", "key": "for the most part", "words": [{"word": "agree", "ko": "동의하다"}], "qa": {"q": {"en": "Do you think my plan will work?", "ko": "내 계획 잘될 것 같아?"}, "decoys": ["to", "agrees"]}},
        {"en": "For the most part, the food at school is pretty good.", "ko": "대체로 학교 급식은 꽤 맛있어.", "key": "For the most part", "qa": {"q": {"en": "Do you like the school lunches?", "ko": "학교 급식 좋아해?"}, "decoys": ["a", "are"]}},
        {"en": "It was boring at times, but I liked it for the most part.", "ko": "가끔 지루했지만 대체로 좋았어.", "key": "for the most part", "qa": {"q": {"en": "Did you like the movie we saw?", "ko": "우리가 본 영화 좋았어?"}, "decoys": ["a", "bored"]}},
        {"en": "For the most part, I'd rather read than watch TV.", "ko": "대체로 나는 TV 보는 것보다 책 읽는 게 좋아.", "key": "For the most part", "qa": {"q": {"en": "What do you usually do on weekends, read or watch TV?", "ko": "주말에 보통 뭐 해? 책 읽어, TV 봐?"}, "decoys": ["a", "reading"]}},
        {"en": "For the most part, my parents let me choose my own clothes.", "ko": "대체로 부모님은 내 옷을 스스로 고르게 해 주셔.", "key": "For the most part", "words": [{"word": "choose", "ko": "고르다"}], "qa": {"q": {"en": "Do your parents pick your clothes for you?", "ko": "부모님이 네 옷을 골라 주셔?"}, "decoys": ["lets", "a"]}}
      ]
    }
  },
  {
    videoId: "bm-u04", book: "bm", chapter: 4, unit: 4, title: "~인 것도 아니잖아 (It's not like ~)", artist: "다 아는 사실을 짚으며 괜찮다고 말하기", cat: "talk", level: "보통",
    note: "PDF 62~65쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "It's not like + 문장", ko: "「~인 것도 아니잖아」 — 다 아는 사실을 짚어 주며 문제가 없다거나 그럴 필요가 없다고 말할 때 써요. it's의 소리를 또렷하게 익혀 두세요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "It's not like I'm late every day.", "ko": "내가 매일 늦는 것도 아니잖아.", "key": "It's not like", "qa": {"q": {"en": "You're late again!", "ko": "또 늦었네!"}, "decoys": ["was", "everyday"]}},
        {"en": "It's not like it's a big test.", "ko": "큰 시험도 아니잖아.", "key": "It's not like", "qa": {"q": {"en": "Why aren't you studying for the quiz?", "ko": "왜 쪽지 시험 공부 안 해?"}, "decoys": ["an", "is"]}},
        {"en": "It's not like I have a choice.", "ko": "나한테 선택권이 있는 것도 아니잖아.", "key": "It's not like", "words": [{"word": "choice", "ko": "선택"}], "qa": {"q": {"en": "Do you really want to go to the dentist?", "ko": "너 정말 치과 가고 싶어?"}, "decoys": ["has", "an"]}},
        {"en": "It's not like we have school tomorrow.", "ko": "내일 학교 가는 것도 아니잖아.", "key": "It's not like", "qa": {"q": {"en": "Can we stay up a little later tonight?", "ko": "오늘 밤 조금 더 늦게 자도 돼?"}, "decoys": ["has", "at"]}},
        {"en": "It's not like anyone will notice.", "ko": "누가 알아차릴 것도 아니잖아.", "key": "It's not like", "words": [{"word": "notice", "ko": "알아차리다"}], "qa": {"q": {"en": "Your socks don't match. Is that okay?", "ko": "양말이 짝짝이야. 괜찮아?"}, "decoys": ["noticed", "nobody"]}},
        {"en": "Relax. It's not like we're in a hurry.", "ko": "진정해. 우리가 급한 것도 아니잖아.", "key": "It's not like", "words": [{"word": "hurry", "ko": "서두름"}], "qa": {"q": {"en": "Hurry up! Let's walk faster!", "ko": "서둘러! 더 빨리 걷자!"}, "decoys": ["were", "an"]}},
        {"en": "It's not like I eat junk food all the time.", "ko": "내가 맨날 정크푸드를 먹는 것도 아니잖아.", "key": "It's not like", "qa": {"q": {"en": "You're eating chips again?", "ko": "또 과자 먹어?"}, "decoys": ["eats", "a"]}},
        {"en": "Why are you nervous? It's not like it's your first game.", "ko": "왜 긴장해? 첫 경기도 아니잖아.", "key": "It's not like", "words": [{"word": "nervous", "ko": "긴장한"}], "qa": {"q": {"en": "My hands are shaking before the game.", "ko": "경기 전이라 손이 떨려."}, "decoys": ["you're", "an"]}},
        {"en": "Don't worry. It's not like you broke it on purpose.", "ko": "걱정 마. 일부러 깨뜨린 것도 아니잖아.", "key": "It's not like", "words": [{"word": "purpose", "ko": "목적"}], "qa": {"q": {"en": "I broke Mom's favorite cup. I feel terrible.", "ko": "엄마가 아끼는 컵을 깼어. 너무 속상해."}, "decoys": ["break", "for"]}},
        {"en": "Just ask him. It's not like he'll get angry.", "ko": "그냥 물어봐. 걔가 화낼 것도 아니잖아.", "key": "It's not like", "qa": {"q": {"en": "Should I ask my brother to help with my homework?", "ko": "형한테 숙제 도와 달라고 할까?"}, "decoys": ["she'll", "got"]}},
        {"en": "We can try again. It's not like this is our last chance.", "ko": "다시 해 보면 돼. 이번이 마지막 기회도 아니잖아.", "key": "It's not like", "words": [{"word": "chance", "ko": "기회"}], "qa": {"q": {"en": "We lost the quiz game. What now?", "ko": "퀴즈 게임에서 졌어. 이제 어떡해?"}, "decoys": ["are", "an"]}},
        {"en": "It's not like the store closes early on weekends.", "ko": "그 가게가 주말에 일찍 닫는 것도 아니잖아.", "key": "It's not like", "qa": {"q": {"en": "Shouldn't we hurry to the store?", "ko": "가게에 서둘러 가야 하지 않아?"}, "decoys": ["close", "in"]}}
      ]
    }
  },
  {
    videoId: "bm-u05", book: "bm", chapter: 4, unit: 5, title: "그렇지 않으면 · 그것 말고는 (otherwise)", artist: "otherwise의 여러 뜻 익히기", cat: "talk", level: "어려움",
    note: "PDF 66~69쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "otherwise", ko: "① 「그렇지 않으면」(안 그러면) ② 「그것 말고는」(그것만 빼면) ③ 「다르게, 반대로」(think otherwise, suggest otherwise). 문장마다 어느 뜻인지 생각하며 쳐 보세요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "Hurry up, otherwise we'll miss the bus.", "ko": "서둘러, 안 그러면 버스 놓쳐.", "key": "otherwise", "qa": {"q": {"en": "Can I finish my game first?", "ko": "게임 먼저 끝내도 돼?"}, "decoys": ["other", "missed"]}},
        {"en": "Wear a coat. Otherwise, you'll catch a cold.", "ko": "코트 입어. 안 그러면 감기 걸려.", "key": "Otherwise", "qa": {"q": {"en": "Do I really need a coat today?", "ko": "오늘 정말 코트 입어야 해?"}, "decoys": ["your", "catches"]}},
        {"en": "Write it down, otherwise you'll forget.", "ko": "적어 둬, 안 그러면 잊어버릴 거야.", "key": "otherwise", "qa": {"q": {"en": "I'll remember the homework. I don't need to write it.", "ko": "숙제 기억할게. 적을 필요 없어."}, "decoys": ["forgot", "other"]}},
        {"en": "The soup is a little salty. Otherwise, it's perfect.", "ko": "국이 좀 짜. 그것만 빼면 완벽해.", "key": "Otherwise", "words": [{"word": "salty", "ko": "짠"}], "qa": {"q": {"en": "How do you like my soup?", "ko": "내가 끓인 국 어때?"}, "decoys": ["its", "other"]}},
        {"en": "It needs new batteries. Otherwise, it works fine.", "ko": "새 배터리만 있으면 돼. 그것 말고는 잘 작동해.", "key": "Otherwise", "words": [{"word": "batteries", "ko": "배터리"}], "qa": {"q": {"en": "Is the old remote control broken?", "ko": "옛날 리모컨 고장 났어?"}, "decoys": ["work", "need"]}},
        {"en": "My room is small. Otherwise, I really like our new house.", "ko": "내 방이 작아. 그것 말고는 새집이 정말 좋아.", "key": "Otherwise", "qa": {"q": {"en": "How do you like your new house?", "ko": "새집 어때?"}, "decoys": ["other", "are"]}},
        {"en": "I have a test tomorrow. Otherwise, I'd come with you.", "ko": "내일 시험이 있어. 안 그러면 같이 갈 텐데.", "key": "Otherwise", "qa": {"q": {"en": "Do you want to come to the movies tonight?", "ko": "오늘 밤 영화 보러 갈래?"}, "decoys": ["other", "came"]}},
        {"en": "Save your file often. Otherwise, you could lose your work.", "ko": "파일을 자주 저장해. 안 그러면 작업한 걸 잃을 수 있어.", "key": "Otherwise", "words": [{"word": "save", "ko": "저장하다"}], "qa": {"q": {"en": "Why do you keep saving your file?", "ko": "왜 자꾸 파일을 저장해?"}, "decoys": ["lost", "you're"]}},
        {"en": "Tell them we're cousins, or they might think otherwise.", "ko": "우리가 사촌이라고 말해. 안 그러면 다르게 생각할 수도 있어.", "key": "think otherwise", "words": [{"word": "cousins", "ko": "사촌"}], "qa": {"q": {"en": "People keep asking who you are. What should I say?", "ko": "사람들이 자꾸 너 누구냐고 물어. 뭐라고 하지?"}, "decoys": ["other", "thinks"]}},
        {"en": "Everyone says he's lazy, but his grades suggest otherwise.", "ko": "다들 걔가 게으르다는데, 성적은 반대를 보여 줘.", "key": "suggest otherwise", "words": [{"word": "grades", "ko": "성적"}, {"word": "suggest", "ko": "나타내다"}], "qa": {"q": {"en": "Is your new classmate really lazy?", "ko": "새로 온 친구 정말 게을러?"}, "decoys": ["suggests", "other"]}},
        {"en": "Unless you hear otherwise, practice starts at four.", "ko": "다른 말 없으면 연습은 4시에 시작해.", "key": "otherwise", "words": [{"word": "unless", "ko": "~하지 않으면"}], "qa": {"q": {"en": "When does soccer practice start tomorrow?", "ko": "내일 축구 연습 몇 시에 시작해?"}, "decoys": ["start", "hearing"]}},
        {"en": "The rain ruined what would otherwise have been a great picnic.", "ko": "비만 아니었으면 멋졌을 소풍을 비가 망쳤어.", "key": "what would otherwise have been", "words": [{"word": "ruined", "ko": "망쳤다"}], "qa": {"q": {"en": "How was the class picnic?", "ko": "반 소풍 어땠어?"}, "decoys": ["ruin", "has"]}}
      ]
    }
  },
  {
    videoId: "bm-u06", book: "bm", chapter: 4, unit: 6, title: "살펴보다 · 다시 설명하다 (go over)", artist: "go over의 여러 뜻 익히기", cat: "talk", level: "보통",
    note: "PDF 70~73쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "go over + 무엇", ko: "「(다시) 살펴보다, 검토하다, 차근차근 설명하다」 — 규칙·답·계획·글을 한 번 훑으며 확인할 때 써요. 지난 일은 went over예요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "Let's go over the rules again.", "ko": "규칙을 다시 한번 살펴보자.", "key": "go over", "qa": {"q": {"en": "I don't understand how to play this game.", "ko": "이 게임 어떻게 하는지 모르겠어."}, "decoys": ["goes", "above"]}},
        {"en": "I went over my notes before the test.", "ko": "시험 전에 필기를 다시 훑어봤어.", "key": "went over", "words": [{"word": "notes", "ko": "필기"}], "qa": {"q": {"en": "How did you get such a good score?", "ko": "어떻게 그렇게 점수를 잘 받았어?"}, "decoys": ["go", "off"]}},
        {"en": "Can you go over this math problem with me?", "ko": "이 수학 문제 같이 봐 줄래?", "key": "go over", "qa": {"q": {"en": "You look confused. What's wrong?", "ko": "헷갈리는 얼굴이네. 무슨 일이야?"}, "decoys": ["goes", "on"]}},
        {"en": "Let me go over your essay first.", "ko": "먼저 네 글을 검토해 볼게.", "key": "go over", "words": [{"word": "essay", "ko": "글"}], "qa": {"q": {"en": "Is my essay ready to hand in?", "ko": "내 글 내도 될까?"}, "decoys": ["you're", "goes"]}},
        {"en": "The teacher went over the answers in class.", "ko": "선생님이 수업 시간에 답을 설명해 주셨어.", "key": "went over", "qa": {"q": {"en": "Did you understand the homework answers?", "ko": "숙제 답 이해했어?"}, "decoys": ["goes", "on"]}},
        {"en": "We should go over the plan one more time.", "ko": "계획을 한 번 더 점검해야 해.", "key": "go over", "qa": {"q": {"en": "Are we ready for the class presentation?", "ko": "반 발표 준비 다 됐어?"}, "decoys": ["goes", "once"]}},
        {"en": "Let's go over what we learned today.", "ko": "오늘 배운 걸 정리해 보자.", "key": "go over", "qa": {"q": {"en": "Class is almost done. What should we do now?", "ko": "수업이 거의 끝났어. 이제 뭐 할까?"}, "decoys": ["learn", "goes"]}},
        {"en": "I'll go over the details with you after lunch.", "ko": "점심 먹고 자세한 내용을 같이 볼게.", "key": "go over", "words": [{"word": "details", "ko": "세부 내용"}], "qa": {"q": {"en": "When can we talk about the field trip?", "ko": "현장 학습 얘기는 언제 할 수 있어?"}, "decoys": ["detail", "goes"]}},
        {"en": "Should I go over the directions one more time?", "ko": "길 설명을 한 번 더 해 줄까?", "key": "go over", "words": [{"word": "directions", "ko": "길 안내"}], "qa": {"q": {"en": "Wait, where do we turn after the bridge?", "ko": "잠깐, 다리 지나서 어디서 돌아?"}, "decoys": ["direction", "goes"]}},
        {"en": "Before you sign anything, go over it carefully.", "ko": "서명하기 전에 꼼꼼히 살펴봐.", "key": "go over", "words": [{"word": "sign", "ko": "서명하다"}], "qa": {"q": {"en": "My club gave me a form to sign.", "ko": "동아리에서 서명할 서류를 줬어."}, "decoys": ["careful", "goes"]}},
        {"en": "My dad went over my phone bill and found a mistake.", "ko": "아빠가 내 휴대폰 요금을 살펴보다 실수를 찾으셨어.", "key": "went over", "words": [{"word": "bill", "ko": "요금 청구서"}], "qa": {"q": {"en": "Did you pay too much for your phone this month?", "ko": "이번 달 휴대폰 요금 너무 많이 냈어?"}, "decoys": ["find", "goes"]}},
        {"en": "Let's go over our mistakes so we don't repeat them.", "ko": "같은 실수를 하지 않도록 우리 실수를 짚어 보자.", "key": "go over", "words": [{"word": "repeat", "ko": "반복하다"}], "qa": {"q": {"en": "We lost the game. What should we do now?", "ko": "경기에서 졌어. 이제 뭘 해야 할까?"}, "decoys": ["doesn't", "goes"]}}
      ]
    }
  },
  {
    videoId: "bm-u07", book: "bm", chapter: 4, unit: 7, title: "꼭 ~하도록 하다 (make sure)", artist: "make sure의 진짜 쓰임 익히기", cat: "talk", level: "보통",
    note: "PDF 74~77쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "make sure + 문장 / make sure to + 동사", ko: "「꼭 ~하도록 하다, 반드시 ~하게 챙기다」 — 단순히 「확인하다」만이 아니라, 그 일이 꼭 일어나게 챙긴다는 뜻으로 많이 써요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "Make sure you lock the door.", "ko": "문 꼭 잠가.", "key": "Make sure", "qa": {"q": {"en": "I'm leaving now. Anything I should remember?", "ko": "나 이제 나가. 기억할 거 있어?"}, "decoys": ["makes", "locked"]}},
        {"en": "Make sure you drink enough water.", "ko": "물 충분히 꼭 마셔.", "key": "Make sure", "qa": {"q": {"en": "It's so hot today. Any advice?", "ko": "오늘 너무 덥다. 조언 있어?"}, "decoys": ["drinks", "much"]}},
        {"en": "Make sure to save your work.", "ko": "작업한 거 꼭 저장해.", "key": "Make sure", "qa": {"q": {"en": "I'm almost done with my project.", "ko": "과제 거의 다 했어."}, "decoys": ["saving", "makes"]}},
        {"en": "I'll make sure everyone gets the message.", "ko": "다들 꼭 연락받게 할게.", "key": "make sure", "words": [{"word": "message", "ko": "메시지"}], "qa": {"q": {"en": "Can you tell the team practice is canceled?", "ko": "팀에 연습 취소됐다고 전해 줄래?"}, "decoys": ["get", "makes"]}},
        {"en": "I'll make sure it doesn't happen again.", "ko": "다시는 그런 일 없게 할게.", "key": "make sure", "words": [{"word": "happen", "ko": "일어나다"}], "qa": {"q": {"en": "You forgot to feed the dog again!", "ko": "또 개 밥 주는 거 잊었구나!"}, "decoys": ["don't", "happens"]}},
        {"en": "Make sure you read the question carefully.", "ko": "문제를 꼭 꼼꼼히 읽어.", "key": "Make sure", "qa": {"q": {"en": "Any tips for the exam?", "ko": "시험 팁 있어?"}, "decoys": ["careful", "reads"]}},
        {"en": "Make sure your phone is charged before the trip.", "ko": "여행 전에 휴대폰 꼭 충전해 둬.", "key": "Make sure", "words": [{"word": "charged", "ko": "충전된"}], "qa": {"q": {"en": "We're leaving early tomorrow morning.", "ko": "우리 내일 아침 일찍 떠나."}, "decoys": ["charge", "you're"]}},
        {"en": "Can you make sure the lights are off?", "ko": "불 꺼졌는지 꼭 확인해 줄래?", "key": "make sure", "qa": {"q": {"en": "I'm the last one leaving the classroom.", "ko": "교실에서 내가 마지막으로 나가."}, "decoys": ["is", "of"]}},
        {"en": "I checked twice to make sure I had my ticket.", "ko": "표가 있는지 확실히 하려고 두 번 봤어.", "key": "make sure", "words": [{"word": "ticket", "ko": "표"}], "qa": {"q": {"en": "Why were you checking your bag so many times?", "ko": "왜 가방을 그렇게 여러 번 봤어?"}, "decoys": ["have", "makes"]}},
        {"en": "Make sure you tell your parents where you're going.", "ko": "어디 가는지 부모님께 꼭 말씀드려.", "key": "Make sure", "qa": {"q": {"en": "Can I go to the park with my friends?", "ko": "친구들이랑 공원 가도 돼?"}, "decoys": ["told", "were"]}},
        {"en": "We need to make sure nobody gets left behind.", "ko": "아무도 뒤처지지 않게 꼭 챙겨야 해.", "key": "make sure", "words": [{"word": "behind", "ko": "뒤에"}], "qa": {"q": {"en": "The hiking trail is long. What's most important?", "ko": "등산로가 길어. 뭐가 제일 중요해?"}, "decoys": ["anybody", "get"]}},
        {"en": "The coach made sure we all warmed up first.", "ko": "코치님은 우리가 모두 먼저 몸을 풀게 하셨어.", "key": "made sure", "words": [{"word": "warmed", "ko": "몸을 풀었다"}], "qa": {"q": {"en": "Why didn't anyone get hurt at practice?", "ko": "왜 연습 때 아무도 안 다쳤어?"}, "decoys": ["make", "warm"]}}
      ]
    }
  },
  {
    videoId: "bm-u08", book: "bm", chapter: 4, unit: 8, title: "따라가다, 뒤처지지 않다 (keep up with)", artist: "속도·변화·진도를 따라가는지 말하기", cat: "talk", level: "보통",
    note: "PDF 78~81쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "keep up (with + 무엇)", ko: "「(뒤처지지 않고) 따라가다」 — 사람의 걸음, 수업 진도, 뉴스, 숙제처럼 계속 생기는 것을 놓치지 않을 때 써요. Keep up the good work!는 「지금처럼 계속 잘해!」예요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "Slow down! I can't keep up.", "ko": "천천히! 못 따라가겠어.", "key": "keep up", "qa": {"q": {"en": "Why are you so far behind?", "ko": "왜 그렇게 뒤처져 있어?"}, "decoys": ["keeping", "with"]}},
        {"en": "I can't keep up with you.", "ko": "너를 못 따라가겠어.", "key": "keep up with", "qa": {"q": {"en": "Come on! Run faster!", "ko": "어서! 더 빨리 달려!"}, "decoys": ["keeps", "on"]}},
        {"en": "Keep up the good work!", "ko": "지금처럼 계속 잘해!", "key": "Keep up", "qa": {"q": {"en": "I got an A on my test!", "ko": "나 시험에서 A 받았어!"}, "decoys": ["keeps", "well"]}},
        {"en": "It's hard to keep up with the news.", "ko": "뉴스를 따라가기 힘들어.", "key": "keep up with", "qa": {"q": {"en": "Did you hear about the new rule?", "ko": "새 규칙 얘기 들었어?"}, "decoys": ["keeps", "on"]}},
        {"en": "I read every day to keep up with my class.", "ko": "반 진도를 따라가려고 매일 읽어.", "key": "keep up with", "qa": {"q": {"en": "Why do you read so much?", "ko": "왜 그렇게 많이 읽어?"}, "decoys": ["keeps", "everyday"]}},
        {"en": "My grandma can't keep up with new technology.", "ko": "할머니는 새 기술을 따라가기 힘들어하셔.", "key": "keep up with", "words": [{"word": "technology", "ko": "기술"}], "qa": {"q": {"en": "Does your grandma use a smartphone?", "ko": "할머니가 스마트폰 쓰셔?"}, "decoys": ["keeps", "on"]}},
        {"en": "It's hard to keep up with all the homework.", "ko": "숙제를 다 따라가기 힘들어.", "key": "keep up with", "qa": {"q": {"en": "Why do you look so tired?", "ko": "왜 그렇게 피곤해 보여?"}, "decoys": ["homeworks", "keeps"]}},
        {"en": "The teacher talks so fast that I can't keep up.", "ko": "선생님 말씀이 너무 빨라서 못 따라가겠어.", "key": "keep up", "qa": {"q": {"en": "Why didn't you take notes in class?", "ko": "수업 시간에 왜 필기 안 했어?"}, "decoys": ["talk", "too"]}},
        {"en": "She practices every day to keep up with the team.", "ko": "팀을 따라가려고 매일 연습해.", "key": "keep up with", "qa": {"q": {"en": "Why does your sister go to the gym every day?", "ko": "너희 언니는 왜 매일 체육관에 가?"}, "decoys": ["practice", "on"]}},
        {"en": "I like to keep up with my favorite singer's news.", "ko": "좋아하는 가수 소식을 계속 챙겨 봐.", "key": "keep up with", "qa": {"q": {"en": "How do you know so much about that band?", "ko": "그 밴드에 대해 어떻게 그렇게 잘 알아?"}, "decoys": ["singers", "keeps"]}},
        {"en": "Our store can't keep up with all the orders.", "ko": "가게가 주문을 다 감당하지 못해.", "key": "keep up with", "words": [{"word": "orders", "ko": "주문"}], "qa": {"q": {"en": "Why is the bakery hiring more people?", "ko": "빵집이 왜 사람을 더 뽑아?"}, "decoys": ["order", "keeps"]}},
        {"en": "If you miss a class, it's hard to keep up with the others.", "ko": "수업을 한 번 빠지면 다른 애들을 따라가기 힘들어.", "key": "keep up with", "qa": {"q": {"en": "Is it okay to skip one class?", "ko": "수업 한 번 빠져도 괜찮아?"}, "decoys": ["other", "missed"]}}
      ]
    }
  },
  {
    videoId: "bm-u09", book: "bm", chapter: 4, unit: 9, title: "계속 파악하다, 기록해 두다 (keep track of)", artist: "놓치지 않고 챙기는 것 말하기", cat: "talk", level: "보통",
    note: "PDF 82~85쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "keep track of + 무엇", ko: "「(놓치지 않게) 계속 파악하다, 기록해 두다」 — 시간·돈·점수·숙제처럼 흘러가는 것을 챙길 때 써요. 반대로 놓치면 lose track of예요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "I use an app to keep track of my homework.", "ko": "숙제를 챙기려고 앱을 써.", "key": "keep track of", "qa": {"q": {"en": "How do you remember all your assignments?", "ko": "숙제를 어떻게 다 기억해?"}, "decoys": ["keeps", "a"]}},
        {"en": "Can you keep track of the score?", "ko": "점수 좀 계속 세 줄래?", "key": "keep track of", "words": [{"word": "score", "ko": "점수"}], "qa": {"q": {"en": "Let's start the game. What can I do?", "ko": "게임 시작하자. 나는 뭘 할까?"}, "decoys": ["keeps", "on"]}},
        {"en": "I lost track of time.", "ko": "시간 가는 줄 몰랐어.", "key": "lost track of", "qa": {"q": {"en": "Why are you so late?", "ko": "왜 이렇게 늦었어?"}, "decoys": ["lose", "on"]}},
        {"en": "I keep track of my money in a notebook.", "ko": "용돈은 공책에 적어서 관리해.", "key": "keep track of", "qa": {"q": {"en": "How do you save so much money?", "ko": "어떻게 돈을 그렇게 많이 모아?"}, "decoys": ["keeps", "at"]}},
        {"en": "It's hard to keep track of everyone's birthdays.", "ko": "모두의 생일을 다 챙기기는 힘들어.", "key": "keep track of", "qa": {"q": {"en": "Did you forget Mina's birthday again?", "ko": "또 미나 생일 잊었어?"}, "decoys": ["everyones", "keeps"]}},
        {"en": "This watch keeps track of how far I run.", "ko": "이 시계가 내가 얼마나 달리는지 기록해.", "key": "keeps track of", "qa": {"q": {"en": "Why do you wear that watch when you jog?", "ko": "조깅할 때 왜 그 시계를 차?"}, "decoys": ["keep", "much"]}},
        {"en": "Our teacher keeps track of who turns in homework.", "ko": "선생님은 누가 숙제를 내는지 다 파악하셔.", "key": "keeps track of", "qa": {"q": {"en": "Does the teacher know if I skip homework?", "ko": "내가 숙제 안 하면 선생님이 아실까?"}, "decoys": ["which", "turn"]}},
        {"en": "I made a chart to keep track of my reading.", "ko": "독서를 기록하려고 표를 만들었어.", "key": "keep track of", "words": [{"word": "chart", "ko": "표"}], "qa": {"q": {"en": "How many books have you read this year?", "ko": "올해 책 몇 권 읽었어?"}, "decoys": ["make", "an"]}},
        {"en": "Write it down so you don't lose track of it.", "ko": "놓치지 않게 적어 둬.", "key": "lose track of", "qa": {"q": {"en": "I keep forgetting my locker number.", "ko": "사물함 번호를 자꾸 잊어."}, "decoys": ["doesn't", "lost"]}},
        {"en": "It's easy to lose track of time when you're gaming.", "ko": "게임하다 보면 시간 가는 줄 모르기 쉬워.", "key": "lose track of", "qa": {"q": {"en": "Why do you set an alarm before playing games?", "ko": "게임하기 전에 왜 알람을 맞춰?"}, "decoys": ["your", "lost"]}},
        {"en": "My mom keeps track of what we eat each week.", "ko": "엄마는 우리가 매주 뭘 먹는지 기록하셔.", "key": "keeps track of", "qa": {"q": {"en": "How does your family eat so healthy?", "ko": "너희 가족은 어떻게 그렇게 건강하게 먹어?"}, "decoys": ["keep", "every"]}},
        {"en": "There are so many players that I can't keep track of them all.", "ko": "선수가 너무 많아서 다 파악할 수가 없어.", "key": "keep track of", "qa": {"q": {"en": "Do you know every player on that team?", "ko": "그 팀 선수 다 알아?"}, "decoys": ["they", "too"]}}
      ]
    }
  },
  {
    videoId: "bm-u10", book: "bm", chapter: 4, unit: 10, title: "중요한 건 ~야 (It's about ~)", artist: "무엇이 진짜 중요한지 말하기", cat: "talk", level: "보통",
    note: "PDF 86~89쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "It's about ~ / It's not about ~", ko: "「중요한 건 ~이다, ~의 문제다」 — 겉으로 보이는 것 말고 진짜 중요한 점을 짚을 때 써요. It's not about A. It's about B.(A가 아니라 B가 중요해)처럼 함께 많이 써요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "It's not about winning.", "ko": "이기는 게 중요한 게 아니야.", "key": "It's not about", "qa": {"q": {"en": "We lost again. I feel terrible.", "ko": "또 졌어. 기분이 너무 안 좋아."}, "decoys": ["win", "isn't"]}},
        {"en": "It's about having fun.", "ko": "중요한 건 즐기는 거야.", "key": "It's about", "qa": {"q": {"en": "What's the point of this game?", "ko": "이 게임 하는 의미가 뭐야?"}, "decoys": ["have", "for"]}},
        {"en": "It's not about the money.", "ko": "돈이 문제가 아니야.", "key": "It's not about", "qa": {"q": {"en": "Why do you want to work at the animal shelter?", "ko": "왜 동물 보호소에서 일하고 싶어?"}, "decoys": ["moneys", "isn't"]}},
        {"en": "It's about trying your best.", "ko": "중요한 건 최선을 다하는 거야.", "key": "It's about", "qa": {"q": {"en": "What if I don't get first place?", "ko": "1등 못 하면 어떡해?"}, "decoys": ["try", "you're"]}},
        {"en": "It's not about how fast you finish.", "ko": "얼마나 빨리 끝내느냐가 중요한 게 아니야.", "key": "It's not about", "qa": {"q": {"en": "Everyone else finished the test before me.", "ko": "다들 나보다 먼저 시험을 끝냈어."}, "decoys": ["finished", "much"]}},
        {"en": "Friendship isn't about always agreeing.", "ko": "우정은 늘 의견이 같은 게 아니야.", "key": "isn't about", "words": [{"word": "agreeing", "ko": "동의하기"}], "qa": {"q": {"en": "My best friend and I argued today.", "ko": "오늘 제일 친한 친구랑 말다툼했어."}, "decoys": ["agree", "aren't"]}},
        {"en": "It's not about the grade. It's about learning.", "ko": "성적이 중요한 게 아니야. 배우는 게 중요해.", "key": "It's about", "qa": {"q": {"en": "Why do you study even when there's no test?", "ko": "시험이 없는데도 왜 공부해?"}, "decoys": ["grades", "learn"]}},
        {"en": "It's about being kind to others.", "ko": "중요한 건 다른 사람에게 친절한 거야.", "key": "It's about", "qa": {"q": {"en": "What's the most important class rule?", "ko": "반 규칙 중에 뭐가 제일 중요해?"}, "decoys": ["be", "other"]}},
        {"en": "This trip is about spending time together.", "ko": "이번 여행은 함께 시간을 보내는 게 중요해.", "key": "is about", "qa": {"q": {"en": "Why can't I bring my game console?", "ko": "왜 게임기를 가져가면 안 돼?"}, "decoys": ["spend", "times"]}},
        {"en": "Music isn't about being perfect. It's about feeling it.", "ko": "음악은 완벽한 게 중요한 게 아니야. 느끼는 게 중요해.", "key": "It's about", "qa": {"q": {"en": "I made a mistake in my piano recital.", "ko": "피아노 발표회에서 실수했어."}, "decoys": ["perfectly", "feel"]}},
        {"en": "Good teamwork is about listening to each other.", "ko": "좋은 팀워크는 서로의 말을 듣는 거야.", "key": "is about", "words": [{"word": "teamwork", "ko": "팀워크"}], "qa": {"q": {"en": "How can our group work better together?", "ko": "우리 모둠이 어떻게 더 잘 협력할 수 있을까?"}, "decoys": ["listen", "others"]}},
        {"en": "It's not about who's right. It's about solving the problem.", "ko": "누가 옳은지가 아니라 문제를 해결하는 게 중요해.", "key": "It's about", "words": [{"word": "solving", "ko": "해결하기"}], "qa": {"q": {"en": "My sister says she's right, but I'm right!", "ko": "언니는 자기가 옳대, 근데 내가 옳아!"}, "decoys": ["whose", "solve"]}}
      ]
    }
  },
  {
    videoId: "bm-u11", book: "bm", chapter: 4, unit: 11, title: "~을 잘하다 (do a good job)", artist: "무엇을 잘 해냈다고 칭찬하기", cat: "talk", level: "쉬움",
    note: "PDF 90~93쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "do a good job (of + -ing)", ko: "「(맡은 일을) 잘하다, 잘 해내다」 — 칭찬할 때 정말 많이 써요. 무엇을 잘했는지는 of + -ing로 붙여요. 지난 일은 did a good job이에요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "You did a good job!", "ko": "잘했어!", "key": "did a good job", "qa": {"q": {"en": "I finished the whole puzzle by myself!", "ko": "나 혼자 퍼즐을 다 맞췄어!"}, "decoys": ["do", "well"]}},
        {"en": "You did a great job today.", "ko": "오늘 정말 잘했어.", "key": "did a great job", "qa": {"q": {"en": "How was my speech?", "ko": "내 발표 어땠어?"}, "decoys": ["do", "an"]}},
        {"en": "She does a good job of explaining things.", "ko": "그분은 설명을 잘하셔.", "key": "does a good job of", "words": [{"word": "explaining", "ko": "설명하기"}], "qa": {"q": {"en": "Why do you like your math teacher?", "ko": "왜 수학 선생님이 좋아?"}, "decoys": ["explain", "do"]}},
        {"en": "You did a good job of cleaning your room.", "ko": "방 청소 잘했구나.", "key": "did a good job of", "qa": {"q": {"en": "Mom, look at my room!", "ko": "엄마, 내 방 좀 보세요!"}, "decoys": ["clean", "do"]}},
        {"en": "He did a good job of leading the team.", "ko": "그는 팀을 잘 이끌었어.", "key": "did a good job of", "words": [{"word": "leading", "ko": "이끌기"}], "qa": {"q": {"en": "Was the new captain okay?", "ko": "새 주장 괜찮았어?"}, "decoys": ["lead", "does"]}},
        {"en": "I think I did a good job on the test.", "ko": "시험 잘 본 것 같아.", "key": "did a good job", "qa": {"q": {"en": "How do you feel about the exam?", "ko": "시험 어떤 것 같아?"}, "decoys": ["do", "in"]}},
        {"en": "Our class did a good job of keeping the room tidy.", "ko": "우리 반은 교실을 깔끔하게 잘 유지했어.", "key": "did a good job of", "words": [{"word": "tidy", "ko": "깔끔한"}], "qa": {"q": {"en": "Why did your class get a prize?", "ko": "너희 반 왜 상 받았어?"}, "decoys": ["keep", "does"]}},
        {"en": "You're doing a good job. Keep going!", "ko": "잘하고 있어. 계속해!", "key": "doing a good job", "qa": {"q": {"en": "Am I doing this right?", "ko": "나 이거 제대로 하고 있어?"}, "decoys": ["do", "your"]}},
        {"en": "My brother does a good job of saving money.", "ko": "형은 돈을 잘 모아.", "key": "does a good job of", "qa": {"q": {"en": "How did your brother buy a new bike?", "ko": "너희 형 어떻게 새 자전거를 샀어?"}, "decoys": ["save", "do"]}},
        {"en": "The movie does a good job of making you laugh.", "ko": "그 영화는 사람을 정말 잘 웃겨.", "key": "does a good job of", "qa": {"q": {"en": "Is that comedy movie really funny?", "ko": "그 코미디 영화 정말 웃겨?"}, "decoys": ["make", "laughs"]}},
        {"en": "You did a good job of staying calm during the game.", "ko": "경기 내내 침착하게 잘 버텼어.", "key": "did a good job of", "words": [{"word": "calm", "ko": "침착한"}], "qa": {"q": {"en": "I was so nervous, but we won!", "ko": "엄청 긴장했는데, 우리가 이겼어!"}, "decoys": ["stay", "does"]}},
        {"en": "Dad did a good job of fixing my bike. It rides like new.", "ko": "아빠가 자전거를 잘 고쳐 주셨어. 새것처럼 잘 나가.", "key": "did a good job of", "words": [{"word": "fixing", "ko": "고치기"}], "qa": {"q": {"en": "Your bike looks great. Did you buy a new one?", "ko": "자전거 멋지다. 새로 샀어?"}, "decoys": ["fix", "ride"]}}
      ]
    }
  },
  {
    videoId: "bm-u12", book: "bm", chapter: 4, unit: 12, title: "활용하다 (make use of)", artist: "있는 것을 잘 써먹는다고 말하기", cat: "talk", level: "보통",
    note: "PDF 94~97쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "make use of + 무엇", ko: "「(있는 것을) 활용하다, 잘 써먹다」 — 그냥 use보다 「버리지 않고 쓸모 있게 쓴다」는 느낌이에요. make good use of는 「잘 활용하다」예요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "Let's make use of this box.", "ko": "이 상자를 활용하자.", "key": "make use of", "qa": {"q": {"en": "What should we do with this empty box?", "ko": "이 빈 상자 어떻게 할까?"}, "decoys": ["makes", "for"]}},
        {"en": "We can make use of the leftovers tomorrow.", "ko": "남은 음식은 내일 활용하면 돼.", "key": "make use of", "words": [{"word": "leftovers", "ko": "남은 음식"}], "qa": {"q": {"en": "There's so much food left. Should we throw it away?", "ko": "음식이 많이 남았어. 버릴까?"}, "decoys": ["leftover", "made"]}},
        {"en": "I make use of my free time to read.", "ko": "자유 시간을 활용해서 책을 읽어.", "key": "make use of", "qa": {"q": {"en": "When do you find time to read?", "ko": "책 읽을 시간은 언제 내?"}, "decoys": ["makes", "for"]}},
        {"en": "Make good use of your time.", "ko": "시간을 잘 활용해.", "key": "Make good use of", "qa": {"q": {"en": "I have three hours before dinner.", "ko": "저녁 먹기 전에 세 시간 있어."}, "decoys": ["well", "you're"]}},
        {"en": "You should make use of the school library.", "ko": "학교 도서관을 활용해 봐.", "key": "make use of", "qa": {"q": {"en": "Where can I find books for my report?", "ko": "보고서에 쓸 책은 어디서 찾을 수 있어?"}, "decoys": ["made", "in"]}},
        {"en": "We made use of old bottles to grow plants.", "ko": "헌 병을 활용해서 식물을 키웠어.", "key": "made use of", "words": [{"word": "bottles", "ko": "병"}], "qa": {"q": {"en": "What did your class do for Earth Day?", "ko": "지구의 날에 너희 반은 뭐 했어?"}, "decoys": ["make", "grew"]}},
        {"en": "I made use of the long weekend to finish my project.", "ko": "긴 주말을 활용해서 과제를 끝냈어.", "key": "made use of", "qa": {"q": {"en": "How did you finish your project so fast?", "ko": "과제를 어떻게 그렇게 빨리 끝냈어?"}, "decoys": ["make", "finished"]}},
        {"en": "She makes good use of every minute.", "ko": "그 애는 1분도 허투루 쓰지 않아.", "key": "makes good use of", "qa": {"q": {"en": "How does she do so many activities?", "ko": "그 애는 어떻게 그 많은 활동을 다 해?"}, "decoys": ["well", "minutes"]}},
        {"en": "Let's make use of the sunny day and go outside.", "ko": "날씨 좋은 날을 활용해서 밖에 나가자.", "key": "make use of", "qa": {"q": {"en": "It's finally sunny today!", "ko": "드디어 오늘 해가 났다!"}, "decoys": ["sun", "going"]}},
        {"en": "Grandpa makes use of everything. He never throws things away.", "ko": "할아버지는 뭐든 다 활용하셔. 절대 안 버리셔.", "key": "makes use of", "qa": {"q": {"en": "Why does your grandpa keep old jars?", "ko": "할아버지는 왜 헌 병을 모아 두셔?"}, "decoys": ["throw", "make"]}},
        {"en": "We should make use of this chance to practice English.", "ko": "이 기회를 활용해서 영어를 연습해야 해.", "key": "make use of", "words": [{"word": "chance", "ko": "기회"}], "qa": {"q": {"en": "There's an exchange student in our class!", "ko": "우리 반에 교환 학생이 왔어!"}, "decoys": ["practicing", "an"]}},
        {"en": "If you make good use of your notes, the test will be easier.", "ko": "필기를 잘 활용하면 시험이 더 쉬울 거야.", "key": "make good use of", "qa": {"q": {"en": "How can I get ready for the exam?", "ko": "시험 준비 어떻게 하면 돼?"}, "decoys": ["well", "easy"]}}
      ]
    }
  },
  {
    videoId: "bm-u13", book: "bm", chapter: 4, unit: 13, title: "~어치 (worth of)", artist: "얼마어치인지 말하기", cat: "talk", level: "보통",
    note: "PDF 98~101쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "(금액·시간) + worth of + 무엇", ko: "「~어치, ~만큼의 분량」 — 10,000 won's worth of apples(사과 만 원어치)처럼 돈이나 시간이 얼마만큼인지 말할 때 써요. 금액 뒤에 's를 붙이는 것도 함께 익혀요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "I bought five dollars' worth of candy.", "ko": "사탕을 5달러어치 샀어.", "key": "worth of", "qa": {"q": {"en": "What did you buy at the store?", "ko": "가게에서 뭐 샀어?"}, "decoys": ["dollar", "in"]}},
        {"en": "Can I get ten dollars' worth of gas?", "ko": "기름 10달러어치 넣어 주시겠어요?", "key": "worth of", "words": [{"word": "gas", "ko": "기름"}], "qa": {"q": {"en": "How much gas do you need today?", "ko": "오늘 기름 얼마나 넣으세요?"}, "decoys": ["dollar", "for"]}},
        {"en": "I have a week's worth of clothes in my bag.", "ko": "가방에 일주일 치 옷이 있어.", "key": "worth of", "qa": {"q": {"en": "How long are you staying at camp?", "ko": "캠프에 얼마나 있을 거야?"}, "decoys": ["weeks", "cloth"]}},
        {"en": "We bought twenty thousand won's worth of snacks.", "ko": "간식을 2만 원어치 샀어.", "key": "worth of", "qa": {"q": {"en": "How many snacks did you get for the party?", "ko": "파티 간식 얼마나 샀어?"}, "decoys": ["wons", "snack"]}},
        {"en": "That's a month's worth of homework!", "ko": "그건 한 달 치 숙제잖아!", "key": "worth of", "qa": {"q": {"en": "The teacher gave us forty worksheets.", "ko": "선생님이 학습지를 40장 주셨어."}, "decoys": ["months", "homeworks"]}},
        {"en": "I lost three hours' worth of work.", "ko": "세 시간 동안 한 작업을 날렸어.", "key": "worth of", "qa": {"q": {"en": "Why are you so upset?", "ko": "왜 그렇게 속상해?"}, "decoys": ["hour", "worked"]}},
        {"en": "Mom bought a year's worth of toothpaste.", "ko": "엄마가 치약을 1년 치 사셨어.", "key": "worth of", "words": [{"word": "toothpaste", "ko": "치약"}], "qa": {"q": {"en": "Why are there so many boxes in the bathroom?", "ko": "화장실에 왜 상자가 이렇게 많아?"}, "decoys": ["years", "an"]}},
        {"en": "I saved two years' worth of allowance.", "ko": "2년 치 용돈을 모았어.", "key": "worth of", "words": [{"word": "allowance", "ko": "용돈"}], "qa": {"q": {"en": "How did you buy that tablet?", "ko": "그 태블릿 어떻게 샀어?"}, "decoys": ["year", "save"]}},
        {"en": "We packed three days' worth of food for camping.", "ko": "캠핑 갈 사흘 치 음식을 쌌어.", "key": "worth of", "qa": {"q": {"en": "Do we have enough food for the trip?", "ko": "여행 갈 음식 충분해?"}, "decoys": ["day", "pack"]}},
        {"en": "He gave me a dollar's worth of stickers.", "ko": "그 애가 스티커를 1달러어치 줬어.", "key": "worth of", "words": [{"word": "stickers", "ko": "스티커"}], "qa": {"q": {"en": "Where did you get all those stickers?", "ko": "그 스티커 다 어디서 났어?"}, "decoys": ["dollars", "giving"]}},
        {"en": "We got a whole day's worth of rain in one hour.", "ko": "한 시간 만에 하루 치 비가 왔어.", "key": "worth of", "qa": {"q": {"en": "Why are the streets flooded?", "ko": "길이 왜 물에 잠겼어?"}, "decoys": ["days", "rains"]}},
        {"en": "I can't read a whole book's worth of notes in one night.", "ko": "책 한 권 분량의 필기를 하룻밤에 다 읽을 순 없어.", "key": "worth of", "qa": {"q": {"en": "Can you read all your notes before the test tomorrow?", "ko": "내일 시험 전에 필기 다 읽을 수 있어?"}, "decoys": ["books", "note"]}}
      ]
    }
  },
  {
    videoId: "bm-u14", book: "bm", chapter: 4, unit: 14, title: "~에 따라 다르다 (depend on)", artist: "상황에 따라 달라진다고 말하기", cat: "talk", level: "쉬움",
    note: "PDF 102~105쪽. 표현 틀만 가져와 새로 지은 문장 12개",
    lesson: {
      pattern: { en: "It depends (on + 무엇)", ko: "「~에 따라 다르다, ~에 달려 있다」 — 딱 잘라 말할 수 없을 때 It depends.(그때그때 달라)라고 하고, 무엇에 따라 다른지는 on 뒤에 붙여요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"en": "It depends.", "ko": "그때그때 달라.", "key": "It depends", "qa": {"q": {"en": "Do you walk to school?", "ko": "학교에 걸어가?"}, "decoys": ["depend", "on"]}},
        {"en": "It depends on the weather.", "ko": "날씨에 따라 달라.", "key": "It depends on", "qa": {"q": {"en": "Are we going to the beach tomorrow?", "ko": "내일 바닷가 가?"}, "decoys": ["depend", "at"]}},
        {"en": "It depends on the price.", "ko": "가격에 따라 달라.", "key": "It depends on", "words": [{"word": "price", "ko": "가격"}], "qa": {"q": {"en": "Are you going to buy those shoes?", "ko": "그 신발 살 거야?"}, "decoys": ["depend", "at"]}},
        {"en": "It depends on how much homework I have.", "ko": "숙제가 얼마나 있느냐에 따라 달라.", "key": "It depends on", "qa": {"q": {"en": "Can you play games with us tonight?", "ko": "오늘 밤 우리랑 게임할 수 있어?"}, "decoys": ["many", "depend"]}},
        {"en": "It depends on what time you finish.", "ko": "네가 몇 시에 끝나느냐에 따라 달라.", "key": "It depends on", "qa": {"q": {"en": "Can we meet after school?", "ko": "방과 후에 만날 수 있어?"}, "decoys": ["finished", "depend"]}},
        {"en": "Our plans depend on my mom.", "ko": "우리 계획은 엄마한테 달려 있어.", "key": "depend on", "qa": {"q": {"en": "Are you going camping this weekend?", "ko": "이번 주말에 캠핑 가?"}, "decoys": ["depends", "at"]}},
        {"en": "It depends on who's coming.", "ko": "누가 오느냐에 따라 달라.", "key": "It depends on", "qa": {"q": {"en": "Do you want to go to the party?", "ko": "파티에 가고 싶어?"}, "decoys": ["whose", "depend"]}},
        {"en": "You can always depend on me.", "ko": "언제든 나를 믿어도 돼.", "key": "depend on", "qa": {"q": {"en": "I'm scared to give my speech alone.", "ko": "혼자 발표하기 무서워."}, "decoys": ["depends", "to"]}},
        {"en": "It depends on how you look at it.", "ko": "보기에 따라 달라.", "key": "It depends on", "qa": {"q": {"en": "Is this painting good or bad?", "ko": "이 그림 잘 그린 거야, 못 그린 거야?"}, "decoys": ["see", "depend"]}},
        {"en": "How long it takes depends on the traffic.", "ko": "얼마나 걸릴지는 교통 상황에 따라 달라.", "key": "depends on", "words": [{"word": "traffic", "ko": "교통"}], "qa": {"q": {"en": "How long does it take to get to the museum?", "ko": "박물관까지 얼마나 걸려?"}, "decoys": ["depend", "took"]}},
        {"en": "Whether we win depends on how well we work together.", "ko": "이길지 말지는 우리가 얼마나 잘 협력하느냐에 달려 있어.", "key": "depends on", "words": [{"word": "whether", "ko": "~인지 아닌지"}], "qa": {"q": {"en": "Do you think we'll win the relay race?", "ko": "우리 계주에서 이길 것 같아?"}, "decoys": ["weather", "good"]}},
        {"en": "Plants are like people. What they need depends on where they live.", "ko": "식물도 사람과 같아. 필요한 게 사는 곳에 따라 달라.", "key": "depends on", "qa": {"q": {"en": "Why does this cactus need so little water?", "ko": "이 선인장은 왜 물이 조금만 필요해?"}, "decoys": ["depend", "needs"]}}
      ]
    }
  },
  {
    videoId: "bm-u15", book: "bm", chapter: 4, unit: 15, title: "어느 정도는, 마음 한편으로는 (on some level)", artist: "말하지 않아도 어느 정도는 안다고 말하기", cat: "talk", level: "어려움",
    note: "PDF 106~109쪽. 책 예문마다 상황·문형을 따라 새로 지은 문장 24개(쉬움 8 · 보통 9 · 어려움 7)",
    lesson: {
      pattern: { en: "on some level", ko: "「어느 정도는, 마음 한편으로는」 — 확실히 말은 안 했지만 속으로는 어느 정도 알거나 느끼고 있었다고 할 때 써요. 비슷하게 on a deeper level(더 깊이 보면), to an extent(어느 정도까지만), in some ways(어떤 면에서는), on so many levels(여러 면에서)도 함께 익혀요." },
      pick: { follow: 6, qa: 4 },
      bank: [
        {"lv": 1, "en": "On some level, I knew it.", "ko": "마음 한편으로는 알고 있었어.", "key": "On some level", "qa": {"q": {"en": "Were you surprised that the trip was canceled?", "ko": "여행이 취소돼서 놀랐어?"}, "decoys": ["a", "know"]}},
        {"lv": 1, "en": "On some level, he was right.", "ko": "어느 정도는 그 애 말이 맞았어.", "key": "On some level", "qa": {"q": {"en": "Was your brother right about the movie?", "ko": "그 영화에 대해 동생 말이 맞았어?"}, "decoys": ["is", "a"]}},
        {"lv": 1, "en": "On some level, I'm a little scared.", "ko": "마음 한편으로는 조금 무서워.", "key": "On some level", "qa": {"q": {"en": "Are you excited about moving to a new school?", "ko": "새 학교로 전학 가는 거 설레?"}, "decoys": ["scary", "are"]}},
        {"lv": 1, "en": "I understand him on some level.", "ko": "어느 정도는 그 애가 이해돼.", "key": "on some level", "qa": {"q": {"en": "Why do you think Minho got so angry?", "ko": "민호가 왜 그렇게 화났다고 생각해?"}, "decoys": ["understood", "a"]}},
        {"lv": 1, "en": "On some level, I think I was just tired.", "ko": "마음 한편으로는 그냥 피곤했던 것 같아.", "key": "On some level", "qa": {"q": {"en": "Why were you so grumpy yesterday?", "ko": "어제 왜 그렇게 짜증 냈어?"}, "decoys": ["tiring", "a"]}},
        {"lv": 1, "en": "On some level, I miss my old school.", "ko": "마음 한편으로는 예전 학교가 그리워.", "key": "On some level", "words": [{"word": "miss", "ko": "그리워하다"}], "qa": {"q": {"en": "Do you like your new school?", "ko": "새 학교 좋아?"}, "decoys": ["missed", "new"]}},
        {"lv": 1, "en": "On some level, we all want to be liked.", "ko": "어느 정도는 우리 모두 사랑받고 싶어 해.", "key": "On some level", "qa": {"q": {"en": "Why do people care so much about likes online?", "ko": "사람들은 왜 인터넷 좋아요에 그렇게 신경 써?"}, "decoys": ["like", "wants"]}},
        {"lv": 1, "en": "My dog knows on some level that I'm sad.", "ko": "우리 강아지는 내가 슬픈 걸 어느 정도는 알아.", "key": "on some level", "qa": {"q": {"en": "Does your dog notice when you feel down?", "ko": "기분이 처질 때 강아지가 알아차려?"}, "decoys": ["know", "sadly"]}},
        {"lv": 2, "en": "On some level, I think he's just lonely.", "ko": "어느 정도는 그 애가 그냥 외로운 것 같아.", "key": "On some level", "words": [{"word": "lonely", "ko": "외로운"}], "qa": {"q": {"en": "Why does that new kid act so tough?", "ko": "그 전학 온 애는 왜 그렇게 센 척해?"}, "decoys": ["alone", "is"]}},
        {"lv": 2, "en": "On some level, she knew she wasn't ready.", "ko": "그 애는 마음 한편으론 준비가 안 됐다는 걸 알았어.", "key": "On some level", "qa": {"q": {"en": "Why did your sister quit the contest?", "ko": "언니는 왜 대회를 포기했어?"}, "decoys": ["weren't", "knows"]}},
        {"lv": 2, "en": "On some level, the story is about growing up.", "ko": "어느 정도는 그 이야기는 자라는 것에 관한 거야.", "key": "On some level", "qa": {"q": {"en": "What do you think the book is really about?", "ko": "그 책이 진짜 하려는 얘기가 뭐라고 생각해?"}, "decoys": ["grow", "a"]}},
        {"lv": 2, "en": "On a deeper level, the song is about hope.", "ko": "더 깊이 보면 그 노래는 희망에 관한 거야.", "key": "On a deeper level", "words": [{"word": "hope", "ko": "희망"}], "qa": {"q": {"en": "Isn't that just a sad song?", "ko": "그거 그냥 슬픈 노래 아니야?"}, "decoys": ["deep", "some"]}},
        {"lv": 2, "en": "On some level, I knew the answer, but I couldn't explain it.", "ko": "마음 한편으론 답을 알았는데 설명을 못 했어.", "key": "On some level", "words": [{"word": "explain", "ko": "설명하다"}], "qa": {"q": {"en": "Why didn't you raise your hand in class?", "ko": "수업 시간에 왜 손 안 들었어?"}, "decoys": ["know", "can't"]}},
        {"lv": 2, "en": "I hate to say it, but on some level, Dad has a point.", "ko": "이런 말 하긴 싫지만, 어느 정도는 아빠 말에 일리가 있어.", "key": "on some level", "words": [{"word": "point", "ko": "일리"}], "qa": {"q": {"en": "Do you think Dad is right about the phone rule?", "ko": "휴대폰 규칙에 대해 아빠 말이 맞는 것 같아?"}, "decoys": ["says", "points"]}},
        {"lv": 2, "en": "I can see where he's coming from on some level.", "ko": "어느 정도는 그 애가 왜 그러는지 알 것 같아.", "key": "on some level", "words": [{"word": "coming from", "ko": "(생각이) 나온 곳"}], "qa": {"q": {"en": "Can you understand why Junho was upset?", "ko": "준호가 왜 속상했는지 이해돼?"}, "decoys": ["came", "is"]}},
        {"lv": 2, "en": "I said I'd think about it, but on some level, I'd already decided.", "ko": "생각해 보겠다고 했지만, 마음속으론 이미 정했었어.", "key": "on some level", "words": [{"word": "decided", "ko": "정했다"}], "qa": {"q": {"en": "Did you think hard before joining the band?", "ko": "밴드에 들어가기 전에 많이 고민했어?"}, "decoys": ["decide", "will"]}},
        {"lv": 2, "en": "This sounds strange, but I feel sorry for him on some level.", "ko": "이상하게 들리겠지만, 어느 정도는 그 애가 안됐어.", "key": "on some level", "words": [{"word": "feel sorry for", "ko": "안됐다"}], "qa": {"q": {"en": "How do you feel about the kid who got caught cheating?", "ko": "부정행위하다 걸린 그 애 어떻게 생각해?"}, "decoys": ["sorrow", "feels"]}},
        {"lv": 3, "en": "On some level, everyone in our class could relate to the main character.", "ko": "어느 정도는 우리 반 모두가 주인공에게 공감할 수 있었어.", "key": "On some level", "words": [{"word": "relate to", "ko": "공감하다"}], "qa": {"q": {"en": "Why did the class love that movie so much?", "ko": "반 친구들은 왜 그 영화를 그렇게 좋아했어?"}, "decoys": ["relates", "characters"]}},
        {"lv": 3, "en": "I support the idea, but only to an extent.", "ko": "그 생각을 지지하지만, 어느 정도까지만이야.", "key": "to an extent", "words": [{"word": "extent", "ko": "정도"}, {"word": "support", "ko": "지지하다"}], "qa": {"q": {"en": "So you're fully on board with the new schedule?", "ko": "그럼 새 일정에 완전히 찬성하는 거지?"}, "decoys": ["supported", "some"]}},
        {"lv": 3, "en": "The new rule is working in some ways, but not in others.", "ko": "새 규칙은 어떤 면에서는 효과가 있지만, 다른 면에서는 아니야.", "key": "in some ways", "qa": {"q": {"en": "Is the no-phone rule at school working?", "ko": "학교 휴대폰 금지 규칙은 효과가 있어?"}, "decoys": ["way", "works"]}},
        {"lv": 3, "en": "Moving abroad changed our family on so many levels.", "ko": "외국으로 이사한 건 여러 면에서 우리 가족을 바꿨어.", "key": "on so many levels", "words": [{"word": "abroad", "ko": "외국으로"}], "qa": {"q": {"en": "How did living overseas affect your family?", "ko": "해외에서 산 게 가족에게 어떤 영향을 줬어?"}, "decoys": ["level", "change"]}},
        {"lv": 3, "en": "AI makes studying easier in a lot of ways, but it brings new problems too.", "ko": "AI는 여러 면에서 공부를 쉽게 해 주지만, 새로운 문제도 가져와.", "key": "in a lot of ways", "qa": {"q": {"en": "Is using AI for homework a good thing?", "ko": "숙제에 AI를 쓰는 건 좋은 일이야?"}, "decoys": ["way", "bring"]}},
        {"lv": 3, "en": "On some level, we choose friends who remind us of ourselves.", "ko": "어느 정도는 우리는 자기 자신을 떠올리게 하는 사람을 친구로 골라.", "key": "On some level", "words": [{"word": "remind", "ko": "떠올리게 하다"}], "qa": {"q": {"en": "Why do you think you and Yuna became so close?", "ko": "너랑 유나는 왜 그렇게 친해졌다고 생각해?"}, "decoys": ["reminds", "myself"]}},
        {"lv": 3, "en": "Even if he never said it, on some level, he knew he had made a mistake.", "ko": "말은 안 했어도, 마음 한편으론 자기가 실수했다는 걸 알았어.", "key": "on some level", "words": [{"word": "mistake", "ko": "실수"}], "qa": {"q": {"en": "Do you think the coach knew he was wrong?", "ko": "코치님은 자기가 틀렸다는 걸 아셨을까?"}, "decoys": ["make", "knows"]}}
      ]
    }
  }
);
