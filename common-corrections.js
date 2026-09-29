(function (global) {
  "use strict";

  // This is a shared late-term correction layer, NOT a condition overlay.
  // data.js and baseline-original remain byte-for-byte historical evidence.
  function bilingual(ja, en) { return { ja: ja, en: en }; }
  function freeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.keys(value).forEach(function (key) { freeze(value[key]); });
    return Object.freeze(value);
  }
  const yellowRule = bilingual(
    "黄色信号では停止位置を越えて進んではならない。ただし、黄色に変わった時点で停止位置に近すぎて安全に停止できない場合は例外である。この設問では安全に停止できたため、信号無視として青切符（反則金6,000円）の対象になりうる。",
    "At a yellow signal, you must not proceed beyond the stopping position, except when you are already too close to stop safely when it turns yellow. In this question you could stop safely, so proceeding can lead to a blue ticket for disregarding the signal (6,000 yen)."
  );
  const nightRule = bilingual(
    "正答は A・C。日没後から日の出前までは夜間で、ライトの点灯が必要である。空に明るさが残っていても街灯があっても、無灯火でよい理由にはならない。日没前からの早めの点灯は安全上の推奨であり、この夜間の義務とは区別する。",
    "The correct answers are A and C. Nighttime runs from sunset to sunrise, when bicycle lights are required. Remaining daylight or streetlights do not remove that requirement. Switching lights on before sunset is a safety recommendation, distinct from this nighttime requirement."
  );
  const phoneRule = bilingual(
    "正答は『青切符：B・C』『違反なし：A』。B・Cは走行中の手持ち通話・画面注視で、実際の交通の危険は生じていないため、携帯電話使用等（保持）の反則金12,000円の対象になりうる。実際に交通の危険を生じさせた場合は青切符ではなく刑事手続となる。固定端末の注視を一律に青切符と分類するものではない。スマホは安全な場所で止まってから使う。",
    "The correct classification is Blue ticket: B and C; No violation: A. B and C involve handheld calling or screen-gazing while moving, without causing an actual traffic danger, and can incur the 12,000 yen handheld-use penalty. Causing an actual traffic danger is handled through criminal procedures rather than a blue ticket. This does not classify every instance of staring at a mounted screen as a blue-ticket offence. Stop in a safe place before using a phone."
  );
  const corrections = {
    version: "2026-09-common-law-v1",
    contentVersion: "2026-late-content-v2",
    baselineVariant: "late_common_corrected_v1",
    approvedChangeScopeDate: "2026-09-22",
    implementedDate: "2026-09-23",
    reviewStatus: "implemented_pending_researcher_review",
    sources: [
      "https://www.npa.go.jp/bureau/traffic/bicycle/portal/faq.html",
      "https://www.npa.go.jp/bureau/traffic/keitai/info.html",
      "https://www.npa.go.jp/bureau/traffic/bicycle/portal/pdf/guide_traffic-rules.pdf",
      "https://laws.e-gov.go.jp/law/335CO0000000270",
      "https://laws.e-gov.go.jp/law/335AC0000000105",
      "https://www.npa.go.jp/bureau/traffic/bicycle/portal/rule.html",
      "https://www.npa.go.jp/bureau/traffic/anzen/hakubo.html"
    ],
    learning: {
      q3: {
        body: bilingual("車道を自転車で走り交差点に近づいたとき、従うべき車両用信号が黄色に変わった。その時点で停止線の手前に安全に停止できる距離・速度だったが、周囲に人や車両がいなそうだったので停止線を越えて進んだ。これはどう扱われる可能性が高いか。", "While cycling on the roadway toward an intersection, the vehicle signal you must follow turned yellow. At that moment, your distance and speed allowed you to stop safely before the stop line, but you proceeded past it because no pedestrians or vehicles seemed to be nearby. How is this likely to be handled?"),
        hint: bilingual("信号が黄色に変わった時点で、安全に停止できたという前提で考える。", "Consider the stated premise: you could stop safely when the signal turned yellow."),
        feedback: {
          A: bilingual("Aではない。この設問では安全に停止できたのに進んだため、違反ではないとはいえない。", "A is not correct. In this question you could stop safely but proceeded, so this is not a non-violation."),
          B: yellowRule,
          C: bilingual("Cではない。この場面だけで直ちに刑事手続になると断定せず、青切符の対象になりうる行動とする。", "C is not correct. This situation alone does not automatically mean criminal procedures; the action can be subject to a blue ticket.")
        },
        result_ok: yellowRule,
        result_ng: yellowRule
      },
      q7: {
        title: bilingual("日没後、空にはまだ明るさが残る道路", "A road after sunset, with some light still in the sky"),
        body: bilingual("日没を過ぎており、日の出前である。空にはまだ少し明るさが残り、街灯も点いている。この場面で、青切符の対象になりうる行動をすべて選べ。", "It is after sunset and before sunrise. Some light remains in the sky and streetlights are on. Select all actions that could be subject to a blue ticket in this situation."),
        hint: bilingual("自分から周囲が見えることと、夜間のライト義務は別である。", "Being able to see your surroundings does not remove the nighttime lighting requirement."),
        choices: {
          A: bilingual("まだ少し明るいので、ライトを点けずに走る", "Ride without turning on the light because it is still a little bright"),
          B: bilingual("ライトを点けて走る", "Ride with the light turned on"),
          C: bilingual("街灯があるのでライトは不要だと考え、点けずに走る", "Ride without the light because you think streetlights make it unnecessary")
        },
        feedback: {
          A: bilingual("Aは青切符の対象になりうる。この設問は日没後の夜間で、明るさが残っていても点灯が必要である。無灯火の反則金は5,000円。", "A can be subject to a blue ticket. This is nighttime after sunset, so lights are required even with remaining daylight. The penalty for riding without lights is 5,000 yen."),
          B: bilingual("Bは適切で、違反ではない。この場面は日没後であり、点灯は早めの推奨ではなく夜間の義務である。", "B is appropriate and not a violation. Because it is after sunset, lighting is a nighttime requirement here, not merely an early-lighting recommendation."),
          C: bilingual("Cは青切符の対象になりうる。街灯があっても、夜間の自転車の点灯義務はなくならない。無灯火の反則金は5,000円。", "C can be subject to a blue ticket. Streetlights do not remove the requirement to use bicycle lights at night. The penalty for riding without lights is 5,000 yen.")
        },
        result_ok: nightRule,
        result_ng: nightRule
      },
      q9: {
        title: bilingual("自転車で走行中、スマートフォンに連絡が来た", "A smartphone receives a message while you are cycling"),
        body: bilingual("16歳以上の人が自転車を運転している。B・Cはいずれも走行中の行動で、実際の交通の危険は生じていない。次の行動を『青切符になりうるもの』『違反なし』に分類せよ。", "A person aged 16 or older is cycling. B and C both occur while moving and have not caused an actual traffic danger. Classify each action as potentially subject to a blue ticket or not a violation."),
        hint: bilingual("停止してから使ったか、走行中に手で持って使ったかを区別する。通話は緊急やむを得ないものではない。", "Distinguish use after stopping from handheld use while moving. The call is not an unavoidable emergency call."),
        choices: {
          A: bilingual("安全な場所に止まってから通知を確認した", "You stopped in a safe place before checking the notification"),
          B: bilingual("走行中にスマホを手に持ち、友人と通話した", "While riding, you held the smartphone in your hand and called a friend"),
          C: bilingual("走行中にスマホを手に持ち、通知を読むため画面を注視した", "While riding, you held the smartphone in your hand and stared at the screen to read the notification")
        },
        result_ok: phoneRule,
        result_ng: phoneRule,
        per_choice_feedback: {
          A: bilingual("Aは違反なし。安全な場所に止まってから確認するのが適切である。", "A is not a violation. It is appropriate to stop in a safe place before checking."),
          B: bilingual("Bは青切符の対象になりうる。走行中に手で保持して通常の通話をした行為で、実際の交通の危険を生じさせた場合とは区別する。", "B can be subject to a blue ticket. This is an ordinary handheld call while riding, distinct from a case that causes an actual traffic danger."),
          C: bilingual("Cは青切符の対象になりうる。走行中に手で保持した画面を注視した行為であり、ホルダーに固定した画面の事例ではない。", "C can be subject to a blue ticket. This is staring at a handheld screen while riding, not an example involving a mounted screen.")
        }
      }
    },
    surveys: {
      pre: {
        pre_q8: { title: bilingual("Q8．車道を自転車で走り交差点に近づいたとき、従うべき車両用信号が黄色に変わった。その時点で停止線の手前に安全に停止できる距離・速度だったが、周囲に人や車両が少なそうだったため、そのまま停止線を越えて進んだ。この行動はどう扱われる可能性が高いですか。", "Q8. While cycling on the roadway toward an intersection, the vehicle signal you must follow turned yellow. At that moment, your distance and speed allowed a safe stop before the stop line, but you went past it because few people or vehicles seemed to be around. How is this action most likely to be handled?") },
        pre_q12: {
          title: bilingual("Q12．日没を過ぎ、日の出前の時間に自転車で走る。空にはまだ少し明るさが残り、街灯もある。青切符の対象になりうる行動をすべて選んでください。", "Q12. You are cycling after sunset and before sunrise. Some light remains in the sky and there are streetlights. Select all actions that could be subject to a blue ticket."),
          choices: { ja: ["A．まだ少し明るいのでライトを点けずに走る", "B．ライトを点けて走る", "C．街灯があるので自転車のライトは不要だと考え、点けずに走る"], en: ["A. Ride without the light because it is still a little bright", "B. Ride with the light turned on", "C. Ride without the light because you think streetlights make it unnecessary"] }
        }
      },
      post: {
        post_q3: { title: bilingual("Q3．車道を自転車で走り、交差点に入る前に従うべき車両用信号が黄色に変わった。その時点で停止線の手前に安全に停止できる距離・速度だったが、「急げば渡れそう」と考え、停止線を越えて通過した。この行動はどう扱われる可能性が高いですか。", "Q3. While cycling on the roadway, the vehicle signal you must follow turned yellow before you entered an intersection. At that moment, your distance and speed allowed a safe stop before the stop line, but you went past it, thinking you could make it if you hurried. How is this action most likely to be handled?") },
        post_q7: {
          title: bilingual("Q7．日没を過ぎ、日の出前の時間に自転車で走る。空には明るさが残り、周囲はまだ見える。青切符の対象になりうる行動をすべて選んでください。", "Q7. You are cycling after sunset and before sunrise. Some light remains in the sky and you can still see your surroundings. Select all actions that could be subject to a blue ticket."),
          choices: { ja: ["A．自分からは見えているので、ライトを点けずに走る", "B．ライトを点灯して走る", "C．街灯がある道路なのでライトは不要だと考え、点けずに走る"], en: ["A. Ride without the light because you can still see", "B. Ride with the light turned on", "C. Ride without the light because you think streetlights make it unnecessary"] }
        },
        post_q8: { title: bilingual("Q8．16歳以上の人が自転車で走行中にスマートフォンを手に持って画面を注視し、実際の交通の危険は生じなかった場合、この教材では青切符の反則金をいくらとして扱っていましたか。", "Q8. A person aged 16 or older rode a bicycle while holding a smartphone and staring at its screen, without causing an actual traffic danger. What blue-ticket penalty amount was used for this case in the material?") }
      }
    }
  };

  if (!global.APP_DATA || global.COMMON_CORRECTIONS) throw new Error("Common corrections require data.js exactly once before this script.");
  const frozen = global.APP_DATA;
  const corrected = JSON.parse(JSON.stringify(frozen));
  Object.keys(corrections.learning).forEach(function (id) {
    const question = corrected.questions.find(function (item) { return item.id === id; });
    if (!question) throw new Error("Missing common correction question: " + id);
    Object.assign(question, corrections.learning[id]);
  });
  ["pre", "post"].forEach(function (phase) {
    const items = phase === "pre" ? corrected.survey : corrected.postSurvey;
    ["ja", "en"].forEach(function (language) {
      Object.keys(corrections.surveys[phase]).forEach(function (id) {
        const item = items[language].find(function (entry) { return entry.id === id; });
        if (!item) throw new Error("Missing common correction survey item: " + id);
        const patch = corrections.surveys[phase][id];
        Object.keys(patch).forEach(function (field) { item[field] = patch[field][language]; });
      });
    });
  });
  global.FROZEN_APP_DATA = freeze(frozen);
  global.COMMON_CORRECTIONS = freeze(corrections);
  global.APP_DATA = freeze(corrected);
})(window);
