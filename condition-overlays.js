(function (global) {
  "use strict";

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.getOwnPropertyNames(value).forEach(function (key) {
      deepFreeze(value[key]);
    });
    return Object.freeze(value);
  }

  function bilingual(ja, en) { return { ja: ja, en: en }; }
  function scene(ja, en) { return { sceneDescription: bilingual(ja, en) }; }
  function support(keyJa, keyEn, ruleJa, ruleEn, okJa, okEn, ngJa, ngEn) {
    return {
      keyPoint: bilingual(keyJa, keyEn),
      decisionRule: bilingual(ruleJa, ruleEn),
      okExample: bilingual(okJa, okEn),
      ngExample: bilingual(ngJa, ngEn),
      decisionFlow: null,
      highlight: null,
      explanationImage: null,
      explanationImageAlt: null,
      feedbackByAnswer: null
    };
  }

  global.CONDITION_OVERLAYS = deepFreeze({
    schemaVersion: 2,
    contentVersion: "2026-late-content-v2",
    // Draft completeness is separate from researcher approval; see CONTENT_REVIEW.md.

    // These fields belong to the shared corrected base, never to a condition overlay.
    forbiddenQuestionFields: [
      "id",
      "type",
      "order",
      "questionOrder",
      "choices",
      "correct",
      "correct_groups",
      "feedback",
      "image",
      "score_domain",
      "log_type"
    ],

    conditions: {
      // Empty: B uses the shared corrected base unchanged, not the historical frozen B.
      original: {},

      no_image: {
        readyForProduction: true,
        hideLearningImages: true,
        questions: {
          q1: scene("自転車で住宅地の道路を進んでいる。車道の左端と縁石の間は狭く、右前方にはトラックなどの車両が続いている。左側には車道より一段高い歩道があり、前方を2人が歩いている。", "You are cycling along a residential road. The space between the left edge of the roadway and the curb is narrow, and vehicles including trucks are ahead to your right. A raised sidewalk runs along the left, with two people walking ahead."),
          q2: scene("自転車は歩道上にあり、前方を2人の歩行者が横に並んで進んでいる。歩道の左側は塀や植え込み、右側は縁石と車道で、車道には大型車が走っている。", "Your bicycle is on the sidewalk. Two pedestrians are walking side by side ahead. Walls and hedges border the left side; a curb and roadway border the right. Large vehicles are on the roadway."),
          q3: scene("住宅地の交差点に車道から自転車で近づいている。正面の車両用信号は黄色に点灯している。自転車の前方には停止線と横断歩道があり、周囲に歩行者や車両は見当たらない。信号が黄色に変わった時点の距離・速度は、共通の問題文に示されている。", "You are approaching a residential intersection by bicycle on the roadway. The vehicle signal ahead is yellow. A stop line and a crosswalk are ahead, with no pedestrians or vehicles visible nearby. The common question text specifies your distance and speed when the signal turned yellow."),
          q4: scene("細い住宅街の道路が別の道路と交差している。左側に赤い逆三角形の「止まれ」標識があり、路面にも「止まれ」の文字と白い停止線がある。両側には塀が続いている。", "A narrow residential road meets another road. On the left is a red inverted-triangle stop sign. The road has a white stop line and the Japanese word for STOP. Walls run along both sides."),
          q5: scene("住宅地の細い道の先に、線路が横切る小さな踏切がある。踏切の脇には黄黒の標識と警報灯があり、進路を横断する遮断棒はない。前方に列車は見えていない。", "A railway track crosses the narrow residential road ahead. Yellow-and-black crossing signs and warning lights stand beside the crossing, but there is no barrier across your path. No train is visible ahead."),
          q6: scene("住宅街の道路を自転車で進んでおり、右横のほぼ同じ位置を友人が自転車で走っている。前方は直線で、近くに走行中の車両は見当たらない。", "You are cycling along a residential road, and a friend is riding alongside you on your right at about the same position. The road ahead is straight, with no moving vehicles visible nearby."),
          q7: scene("共通の問題文のとおり日没後の住宅街の道路で、空には少し明るさが残っている。道路沿いの街灯と建物の明かりが点いており、道路や家の輪郭が見える。自転車でこの道を進んでいる。", "As specified in the common question text, you are cycling on a residential road after sunset. Some light remains in the sky. Streetlights and lights on buildings are on, and the outlines of the road and houses are visible.")
        }
      },

      improved: {
        readyForProduction: true,
        questions: {
          q1: support("歩道に移った後の通り方まで考える。", "Consider how to travel after moving onto the sidewalk.", "この教材では、交通状況からやむを得ない歩道通行を想定する。車道寄りを徐行し、歩行者を妨げるときは一時停止する。車道通行そのものが直ちに違法という意味ではない。", "This material assumes sidewalk use is unavoidable because of traffic conditions. Ride slowly on the roadway side and stop if you might obstruct pedestrians. Riding on the roadway itself is not automatically illegal.", "B：歩道へ移って徐行する。C：降りて押して歩く。", "B: Move onto the sidewalk and ride slowly. C: Get off and push the bicycle.", "Aを選ぶだけでは、この問題が求める安全寄りの対応を選んだことにならない。", "Choosing A alone does not select the safer responses asked for in this question."),
          q2: support("歩道では歩行者を妨げないことが優先。", "Avoiding obstruction of pedestrians is the priority on sidewalks.", "通れる隙間があるかだけでなく、歩行者の通行を妨げるかを判断する。妨げそうなら一時停止する。", "Judge whether you would obstruct pedestrians, not only whether there is a gap. Stop if you might obstruct them.", "A：徐行し、妨げそうなら止まる。", "A: Ride slowly and stop if you might obstruct pedestrians.", "B：ベルでどかして抜く。C：勢いで抜ける。どちらもこの教材では青切符側。", "B: Make pedestrians move with the bell. C: Pass with momentum. Both are on the blue-ticket side in this material."),
          q3: support("黄色に変わった時点で安全に停止できたかを区別する。", "Distinguish whether you could stop safely when the signal turned yellow.", "安全に停止できる場合、停止位置を越えて進まない。黄色に変わった時点で停止位置に近すぎて安全に止まれない場合は例外。この設問は安全に停止できた前提である。", "Do not pass the stopping position if you can stop safely. The exception is being too close to stop safely when yellow first appears. This question states that you could stop safely.", "この設問の距離・速度では、停止線の手前で停止する。", "At the distance and speed stated here, stop before the stop line.", "「周りに誰もいなそうだから違反ではない」と判断して進む。", "Proceed because you assume there is no violation if nobody is nearby."),
          q4: support("「徐行」と「完全停止」を区別する。", "Distinguish slowing down from making a complete stop.", "停止線と「止まれ」がある場面では、徐行だけでは足りず、完全停止が必要である。", "Where a stop sign and stop line are present, slowing down alone is not enough; a complete stop is required.", "停止線のある「止まれ」で完全停止する。", "Make a complete stop at the stop sign with a stop line.", "左右を見ても、完全停止せず徐行だけで入る。", "Look left and right but enter after only slowing down, without a complete stop."),
          q5: support("列車が見えないことと停止が不要なことを結び付けない。", "Do not equate seeing no train with having no need to stop.", "この踏切では、直前で停止し、安全を確認してから進む。警報が鳴っていない、慣れている道だという理由で省略しない。", "At this crossing, stop just before it and check safety before proceeding. Do not omit these steps because no alarm is sounding or the route is familiar.", "A：直前で止まり、安全を確認して進む。", "A: Stop just before the crossing, check safety, then proceed.", "B：減速だけ。C：確認なし。どちらもこの問題では青切符側。", "B: Only slow down. C: Do not check. Both are on the blue-ticket side in this question."),
          q6: support("短い距離・低速・車がいないことは、並進を許す理由にはならない。", "A short distance, low speed, or no cars nearby does not make side-by-side riding permissible.", "この場面では一列に戻す。元の解説にあるとおり、並進可の標識等がある例外は別に扱う。", "Return to a single line in this situation. As stated in the original explanation, an exception where signs permit side-by-side riding is treated separately.", "B：すぐ一列に戻す。", "B: Immediately return to a single line.", "A：短い区間だけ並ぶ。C：低速のまま並ぶ。", "A: Ride alongside for a short section. C: Continue alongside at low speed."),
          q7: support("日没後の点灯義務と、日没前の早め点灯推奨を分ける。", "Separate required lighting after sunset from recommended early lighting before sunset.", "この設問は日没後かつ日の出前の夜間。明るさや街灯にかかわらず自転車の点灯が必要。日没前から点灯するのは安全上の推奨である。", "This question is set at night, after sunset and before sunrise. Bicycle lights are required regardless of remaining light or streetlights. Turning them on before sunset is a safety recommendation.", "B：ライトを点けて走る。", "B: Ride with the light turned on.", "A：「まだ明るいから不要」。C：「街灯があるから不要」として点けずに走る。", "A: Ride unlit because it is still bright. C: Ride unlit because there are streetlights."),
          q8: support("装着物の名前ではなく、必要な音が聞こえる状態を見る。", "Focus on whether necessary sounds can be heard, not the name of the device.", "この問題は、A・Cを必要な音が聞こえにくい状態、B・Dを聞こえる前提としている。骨伝導や外音取り込みという名前だけで自動的に判断しない。", "This question assumes that necessary sounds are hard to hear in A and C, and audible in B and D. Do not judge automatically from the labels bone conduction or ambient sound mode.", "B・D：この設問の聞こえるという前提では、違反にしていない。", "B and D: Under this question's assumption that sounds can be heard, they are not treated as violations.", "A・C：安全な運転に必要な音や声が聞こえにくい。", "A and C: Sounds and voices needed for safe riding are hard to hear."),
          q9: support("スマホは安全な場所で止まってから使う。", "Stop in a safe place before using a phone.", "この設問のB・Cは手持ち使用で、実際の交通の危険は生じていない。固定画面の注視を一律に青切符と分類するものではない。危険を実際に生じさせた場合は刑事手続になる。", "B and C here involve handheld use without causing an actual traffic danger. This does not classify every instance of staring at a mounted screen as a blue-ticket offence. Actually causing a traffic danger leads to criminal procedures.", "A：安全な場所に止まって確認する。", "A: Stop in a safe place before checking.", "B：走行中に手持ちで通話する。C：走行中に手持ちの画面を注視する。", "B: Make a handheld call while riding. C: Stare at a handheld screen while riding."),
          q10: support("青切符の対象は、学年ではなく年齢で決まる。", "Blue-ticket eligibility depends on age, not school grade.", "16歳以上が対象。16歳未満でも、指導警告や別の手続の対象になりうる点は別に考える。", "The system applies from age 16. Separately, people under 16 may still receive guidance, warnings, or other procedures.", "A：16歳以上が対象。C：16歳未満でも別の対応はありうる。", "A: It applies from age 16. C: Other responses remain possible below age 16.", "B：高校生という理由だけで15歳を青切符の対象にする。", "B: Treat a 15-year-old as eligible solely because they attend high school."),
          q11: support("未納付で手続が自動的に終わることはない。", "Nonpayment does not automatically end the procedure.", "翌日から原則7日以内の仮納付、仮納付しない場合の通告センターでの手続、納付すれば原則として刑事手続に移らない、という流れを区別する。", "Distinguish provisional payment within seven days from the following day, the notification-center procedure if not provisionally paid, and generally avoiding criminal procedures when payment is made.", "A・B・D：仮納付、通告センターでの手続、納付後の扱い。", "A, B, and D: Provisional payment, the notification-center procedure, and treatment after payment.", "C：払わずにいれば手続が自動終了すると考える。", "C: Assume that not paying makes the procedure end automatically."),
          q12: support("講習制度の対象年齢と、青切符の対象年齢を分けて覚える。", "Keep the training-system age threshold separate from the blue-ticket age threshold.", "講習は14歳以上が対象になりうる。3年以内に2回以上の反復で対象になりうる。講習は3時間で受講料が必要。受講命令に従わないと5万円以下の罰金がありうる。", "Training can apply from age 14, with two or more repeated qualifying incidents within three years. It lasts three hours and requires a fee. Failure to obey an attendance order may result in a fine of up to 50,000 yen.", "A・B・C：対象年齢、反復の条件、講習時間と費用を確認する。", "A, B, and C: Check the age threshold, repeated-incident condition, duration, and fee.", "D：受講しなくても口頭注意だけで終わると考える。", "D: Assume that failing to attend ends with only a verbal warning.")
        }
      }
    }
  });
})(window);
