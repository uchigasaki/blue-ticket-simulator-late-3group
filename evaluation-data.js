(function (global) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.getOwnPropertyNames(value).forEach(function (key) {
      deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }

  // Authoring helpers keep the public contract as plain ja/en item arrays.
  function pair(id, type, jaTitle, enTitle, jaChoices, enChoices, extra) {
    const ja = Object.assign({ id: id, type: type, title: jaTitle }, extra || {});
    const en = Object.assign({ id: id, type: type, title: enTitle }, extra || {});
    if (jaChoices) { ja.choices = jaChoices; en.choices = enChoices; }
    return { ja: ja, en: en };
  }
  function illustrated(item, path, jaAlt, enAlt) {
    item.ja.image = path; item.en.image = path;
    item.ja.imageAlt = jaAlt; item.en.imageAlt = enAlt;
    return item;
  }
  function scale(id, jaTitle, enTitle, jaMin, jaMax, enMin, enMax) {
    const item = pair(id, "scale", jaTitle, enTitle, null, null, { points: [1, 2, 3, 4], construct: "self_report", modality: "text" });
    item.ja.min = jaMin; item.ja.max = jaMax;
    item.en.min = enMin; item.en.max = enMax;
    return item;
  }
  function bilingualItems(items) {
    return { ja: items.map(function (item) { return item.ja; }), en: items.map(function (item) { return item.en; }) };
  }

  const pre = [
    pair("late_pre_licence", "single", "追加1．現在、原付を含む自動車等の運転免許を持っていますか。", "Additional 1. Do you currently hold a motor-vehicle driving licence, including a moped licence?",
      ["A．持っている", "B．持っていない", "C．回答しない"], ["A. Yes", "B. No", "C. Prefer not to answer"], { construct: "background", modality: "text" }),
    pair("late_pre_prior_participation", "single", "追加2．今回より前に、この研究の自転車青切符Web教材（Blue Ticket Simulator）を体験したことがありますか。", "Additional 2. Before this session, have you used this study's Blue Ticket Simulator web learning material?",
      ["A．ある", "B．ない", "C．覚えていない"], ["A. Yes", "B. No", "C. I do not remember"], { construct: "prior_exposure", modality: "text" })
  ];

  const post = [
    pair("late_post_transfer_notice", "notice", "追加確認：ここからは、学習時とは異なる場面で判断してください。図は位置関係を示す模式図です。正誤の解説は表示されません。", "Additional check: Judge situations that differ from the learning scenes. The diagrams show relative positions. Correctness feedback will not be shown.", null, null, { optional: true }),
    illustrated(pair("late_post_transfer_stop", "single", "追加確認1．図の交差点に自転車で近づいている。自分の進路には「止まれ」標識と停止線がある。左右がよく見えて、車は見当たらない。このあと取る行動として適切なものを1つ選んでください。", "Additional check 1. You are approaching the intersection shown by bicycle. Your approach has a stop sign and a stop line. You have a clear view left and right, and no vehicles are visible. Choose the appropriate next action.",
      ["A．車が見えないので、速度を保って進む", "B．停止線の直前で完全に止まり、安全を確認してから進む", "C．左右を見ながら、完全には止まらずゆっくり進む"],
      ["A. Keep your speed because no vehicles are visible", "B. Stop completely just before the stop line, check safety, then proceed", "C. Look left and right and proceed slowly without a complete stop"], { construct: "transfer_stop", modality: "diagram", score_domain: "situation" }),
      "assets/late-post-stop.svg", "上から見た交差点。自転車は下から上へ進む位置にあり、その前方に停止線、左側に止まれ標識がある。", "Top view of an intersection. The bicycle approaches from the bottom toward a stop line, with a stop sign on the left."),
    illustrated(pair("late_post_transfer_pedestrian", "single", "追加確認2．普通自転車の通行が認められている歩道を徐行している。図のように、前の歩行者が店の入口へ向きを変え、このまま進むとその通行を妨げる。適切な行動を1つ選んでください。", "Additional check 2. You are riding slowly on a sidewalk where ordinary bicycles are permitted. As shown, the pedestrian ahead turns toward a shop entrance. Continuing would obstruct the pedestrian. Choose the appropriate action.",
      ["A．一時停止し、歩行者の通行を妨げなくなってから進む", "B．ベルを鳴らして歩行者に待ってもらい、そのまま進む", "C．歩行者が動く前に、速度を上げて通り抜ける"],
      ["A. Stop and proceed only when you will no longer obstruct the pedestrian", "B. Ring the bell to make the pedestrian wait and keep moving", "C. Speed up and pass before the pedestrian moves"], { construct: "transfer_pedestrian", modality: "diagram", score_domain: "situation" }),
      "assets/late-post-pedestrian.svg", "上から見た歩道。左に店の入口、右に車道があり、自転車の前方の歩行者が店の方向へ移動している。", "Top view of a sidewalk with a shop entrance on the left and a roadway on the right. A pedestrian ahead of the bicycle is moving toward the shop."),
    pair("late_post_transfer_phone", "single", "追加確認3．知らない道を自転車で走っていると、スマートフォンに地図の更新通知が来た。道順を確認するための適切な行動を1つ選んでください。", "Additional check 3. While cycling on an unfamiliar route, your smartphone receives a map update notification. Choose the appropriate way to check the route.",
      ["A．低速ならよいと考え、手に持った画面を注視して走る", "B．ホルダーに固定してあるので、画面を注視して走り続ける", "C．安全な場所に止まってから画面を確認する"],
      ["A. Ride while staring at the handheld screen because your speed is low", "B. Keep riding while staring at the screen because it is mounted in a holder", "C. Stop in a safe place before checking the screen"], { construct: "transfer_phone", modality: "text", score_domain: "situation" }),
    pair("late_post_transfer_age", "single", "追加確認4．同じ学校に通う15歳と16歳の2人がいる。自転車の青切符制度の対象年齢について、正しい説明を1つ選んでください。", "Additional check 4. Two students at the same school are aged 15 and 16. Choose the correct explanation of the age threshold for bicycle blue tickets.",
      ["A．同じ学校の生徒なので、2人とも対象になる", "B．対象年齢は16歳以上なので、16歳の人が対象となる年齢に達している", "C．18歳未満なので、2人とも対象となる年齢に達していない"],
      ["A. Both are eligible because they attend the same school", "B. The threshold is age 16, so the 16-year-old has reached it", "C. Neither has reached the threshold because both are under 18"], { construct: "transfer_age", modality: "text", score_domain: "system" }),
    scale("late_post_scenario_helpful", "教材に示された場面は、交通ルールを考えるのに役立ちましたか。", "Did the situations presented in the learning material help you think about traffic rules?", "まったく役立たなかった", "とても役立った", "Not at all helpful", "Very helpful"),
    pair("late_post_useful_content", "multi", "今回の教材で、理解に役立った内容をすべて選んでください。「特にない」を選ぶ場合は、それだけを選んでください。", "Select all topics in this material that helped your understanding. If you choose None, select only that option.",
      ["A．自転車が通行する場所", "B．場面に応じた行動の判断", "C．違反となりうる行動", "D．青切符制度や手続", "E．特にない"],
      ["A. Where to ride a bicycle", "B. Choosing actions for a situation", "C. Actions that may be violations", "D. The blue-ticket system and procedures", "E. None"], { construct: "self_report", modality: "text" }),
    scale("late_post_mental_effort", "教材の内容を理解するために、どのくらい考える必要がありましたか。", "How much mental effort did you need to understand the learning material?", "ほとんど必要なかった", "非常に必要だった", "Very little", "A great deal")
  ];

  const followup = [
    pair("late_followup_notice", "notice", "1週間後の確認：今の理解で回答してください。回答中は前の教材や他の資料を見ず、迷う場合も最も適切だと思うものを選んでください。図は位置関係を示す模式図です。", "One-week check: Answer using your current understanding without consulting the earlier material or other sources. If unsure, choose the answer you consider most appropriate. The diagrams show relative positions.", null, null, { optional: true }),
    illustrated(pair("late_followup_transfer_stop", "single", "確認1．図のように、細い道から広い道へ自転車で左折する。自分の進路に「止まれ」標識と停止線があり、近づく車は見当たらない。適切な行動を1つ選んでください。", "Check 1. As shown, you will turn left by bicycle from a narrow road onto a wider road. Your approach has a stop sign and a stop line, and no approaching vehicles are visible. Choose the appropriate action.",
      ["A．左折なので、止まらずに速度を落として曲がる", "B．車がいないことを見ながら、止まらずに曲がる", "C．停止線の直前で完全に止まり、安全を確認してから曲がる"],
      ["A. Slow down and turn without stopping because it is a left turn", "B. Check that no vehicles are coming and turn without stopping", "C. Stop completely just before the stop line, check safety, then turn"], { construct: "transfer_stop", modality: "diagram", score_domain: "situation" }),
      "assets/late-followup-stop.svg", "上から見たT字路。下から来た自転車の進路に停止線があり、その左側に止まれ標識がある。広い道路は左右に伸びている。", "Top view of a T-junction. A bicycle approaches from below, with a stop line ahead and a stop sign on the left. The wider road runs left to right."),
    illustrated(pair("late_followup_transfer_pedestrian", "single", "確認2．普通自転車の通行が認められている歩道を徐行している。図のように、前方で歩行者が停留所へ移動しており、このまま進むとその通行を妨げる。適切な行動を1つ選んでください。", "Check 2. You are riding slowly on a sidewalk where ordinary bicycles are permitted. As shown, a pedestrian ahead is moving toward a bus stop. Continuing would obstruct the pedestrian. Choose the appropriate action.",
      ["A．ベルを鳴らして進路を空けてもらい、進み続ける", "B．一時停止し、歩行者の通行を妨げなくなってから進む", "C．わずかな隙間を使い、速度を保ったまま通る"],
      ["A. Ring the bell to make the pedestrian clear your path and keep moving", "B. Stop and proceed only when you will no longer obstruct the pedestrian", "C. Use a small gap and pass without reducing speed"], { construct: "transfer_pedestrian", modality: "diagram", score_domain: "situation" }),
      "assets/late-followup-pedestrian.svg", "上から見た歩道。右側に車道と停留所があり、自転車の前方の歩行者が停留所の方向へ移動している。", "Top view of a sidewalk with a roadway and bus stop on the right. A pedestrian ahead of the bicycle is moving toward the bus stop."),
    pair("late_followup_transfer_phone", "single", "確認3．自転車で待ち合わせ場所へ向かっていると、同行者からスマートフォンに連絡が来た。内容を読むための適切な行動を1つ選んでください。", "Check 3. While cycling to a meeting point, you receive a smartphone message from your companion. Choose the appropriate way to read it.",
      ["A．安全な場所に止まってから読む", "B．車の少ない道なので、手に持った画面を注視して走る", "C．両手でハンドルを持っていればよいと考え、固定した画面を注視して走る"],
      ["A. Stop in a safe place before reading", "B. Ride while staring at the handheld screen because there is little traffic", "C. Ride while staring at the mounted screen because both hands are on the handlebars"], { construct: "transfer_phone", modality: "text", score_domain: "situation" }),
    pair("late_followup_transfer_age", "single", "確認4．ある人は先週16歳になり、同じ学年の友人はまだ15歳である。自転車の青切符制度の対象年齢について、正しい説明を1つ選んでください。", "Check 4. One person turned 16 last week, while a friend in the same school grade is still 15. Choose the correct explanation of the age threshold for bicycle blue tickets.",
      ["A．学年が同じなので、2人とも対象となる年齢に達している", "B．2人とも18歳になるまでは対象となる年齢に達しない", "C．16歳になった人が対象となる年齢に達しており、15歳の友人はまだ達していない"],
      ["A. Both have reached the threshold because they are in the same school grade", "B. Neither reaches the threshold until age 18", "C. The person who turned 16 has reached the threshold; the 15-year-old has not"], { construct: "transfer_age", modality: "text", score_domain: "system" }),
    scale("late_followup_confidence", "現在、自転車の交通場面で適切な行動を判断できる自信はどのくらいありますか。", "How confident are you currently in choosing an appropriate action in bicycle traffic situations?", "まったく自信がない", "とても自信がある", "Not at all confident", "Very confident"),
    pair("late_followup_riding", "single", "前回の教材体験から今日までに、自転車を運転しましたか。", "Have you ridden a bicycle since your previous learning session?",
      ["A．運転した", "B．運転していない", "C．覚えていない"], ["A. Yes", "B. No", "C. I do not remember"], { construct: "self_report", modality: "text" }),
    pair("late_followup_rule_use", "single", "前回の教材体験から今日までに、自転車に乗る際、学んだ内容を思い出すことがありましたか。", "Since your previous learning session, did you recall the learning content while riding a bicycle?",
      ["A．あった", "B．なかった", "C．自転車に乗る機会がなかった", "D．覚えていない"], ["A. Yes", "B. No", "C. I did not ride a bicycle", "D. I do not remember"], { construct: "self_report", modality: "text" }),
    pair("late_followup_other_learning", "single", "前回の教材体験から今日までに、この教材をもう一度見たり、別の資料で自転車の交通ルールを学んだりしましたか。", "Since your previous session, have you revisited this material or learned bicycle traffic rules from another source?",
      ["A．学んだ", "B．学んでいない", "C．覚えていない"], ["A. Yes", "B. No", "C. I do not remember"], { construct: "additional_exposure", modality: "text" })
  ];

  global.EVALUATION_DATA = deepFreeze({
    schemaVersion: 2,
    instrumentVersion: "2026-late-instrument-v2",
    readyForProduction: true,
    contentStatus: "researcher_adopted",
    contentReviewIssues: [
      {
        id: "frozen_q9_mounted_phone_enforcement", status: "resolved", severity: "blocking",
        affected: ["learning:q9", "condition:original", "condition:improved", "condition:no_image"],
        source: "https://www.npa.go.jp/bureau/traffic/bicycle/portal/faq.html",
        implementedCorrectionVersion: "2026-09-common-law-v1",
        note: "後期3群共通の訂正を実装済み。q9は16歳以上・実際の交通の危険なしの手持ち通話B／手持ち注視Cで、固定画面注視を一律に青切符としないことを解説。原本は保存。内ヶ崎優斗から訂正後の日英原稿を確認し現版を採用する回答を受領し、2026-09-29に氏名を確認。第三者の監修を意味しない。"
      },
      {
        id: "frozen_q3_yellow_signal_assumption", status: "resolved", severity: "blocking",
        affected: ["learning:q3", "pre:pre_q8", "post:post_q3"],
        source: "https://laws.e-gov.go.jp/law/335CO0000000270",
        implementedCorrectionVersion: "2026-09-common-law-v1",
        note: "後期共通の学習・事前・事後へ、従うべき車両用信号と安全に停止できた距離・速度の前提を明記し、安全に停止できない場合の例外を共通解説へ実装済み。内ヶ崎優斗から訂正後の日英原稿を確認し現版を採用する回答を受領し、2026-09-29に氏名を確認。"
      },
      {
        id: "frozen_q7_nighttime_assumption", status: "resolved", severity: "blocking",
        affected: ["learning:q7", "pre:pre_q12", "post:post_q7"],
        source: "https://www.npa.go.jp/bureau/traffic/bicycle/portal/rule.html",
        implementedCorrectionVersion: "2026-09-common-law-v1",
        note: "後期共通の学習・事前・事後を日没後かつ日の出前に統一し、夜間の法的点灯義務と日没前の早め点灯推奨を区別する訂正を実装済み。内ヶ崎優斗から訂正後の日英原稿を確認し現版を採用する回答を受領し、2026-09-29に氏名を確認。"
      },
      {
        id: "draft_instrument_equivalence_review", status: "resolved", severity: "blocking",
        affected: ["evaluation:post", "evaluation:followup", "translation:en", "condition:no_image", "condition:improved"],
        source: "docs/CONTENT_REVIEW.md",
        note: "内ヶ崎優斗が日英教材・A/C教材・事後/追跡項目を確認して現版を運用採用する回答を受領し、2026-09-29に氏名を確認。予備調査は本人申告で実施済み・おおむね良好。実施日・人数・結果数値を推測しない。運用上の採用確認は完了したが、言語間や事後/追跡の統計的・心理測定的等価性は未実証のまま。"
      }
    ],
    sourceAnswerKeyFile: "事前事後アンケート答え管理.txt",

    // Each flag must be set by the researcher after the corresponding decision
    // is documented. The production readiness check requires all three.
    researcherApprovals: {
      conditionNeutralPostSurvey: true,
      lateEvaluationInstruments: true,
      followupInstrumentAndUrl: true
    },

    // Exclusion applies identically to every condition; frozen APP_DATA is intact.
    excludedBaseIds: { pre: [], post: ["post_scenario_helpful", "post_useful_content"], followup: [] },
    // Drafts shared by all three conditions; approval is tracked separately above.
    extensions: {
      pre: bilingualItems(pre),
      post: bilingualItems(post),
      followup: bilingualItems(followup)
    },

    // Reserved for future versioned additions, not placeholders required for v1.
    futureItems: {
      pre: { ja: [], en: [] },
      post: { ja: [], en: [] },
      followup: { ja: [], en: [] }
    },

    answerKeys: {
      pre: {
        pre_q6: ["B", "C"],
        pre_q7: ["B", "C"],
        pre_q8: "B",
        pre_q9: "B",
        pre_q10: ["B", "C"],
        pre_q11: ["A", "C"],
        pre_q12: ["A", "C"]
      },
      post: {
        post_q1: ["B", "C"],
        post_q2: ["B", "C"],
        post_q3: "B",
        post_q4: "B",
        post_q5: ["B", "C"],
        post_q6: ["A", "C"],
        post_q7: ["A", "C"],
        post_q8: "D",
        post_q9: "B",
        post_q10: "A",
        late_post_transfer_stop: "B",
        late_post_transfer_pedestrian: "A",
        late_post_transfer_phone: "C",
        late_post_transfer_age: "B"
      },
      followup: {
        late_followup_transfer_stop: "C",
        late_followup_transfer_pedestrian: "B",
        late_followup_transfer_phone: "A",
        late_followup_transfer_age: "C"
      }
    }
  });
})(window);
