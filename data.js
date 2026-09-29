window.APP_DATA = {
  "config": {
    "logEndpoint": "https://script.google.com/macros/s/AKfycbxeGuRXGSECZHyzEUsBZq6_-JYrO_-NXPkcMC_j84zgzOrbh3VN2wt1pRRoGfnHOxQJ/exec",
    "followupForms": {
      "ja": "https://docs.google.com/forms/d/1w0KiLON2Iwh16YWDO0rxAsehIfFQLbGce85FYl2pvHs/viewform?hl=ja",
      "en": "https://docs.google.com/forms/d/e/1FAIpQLSdPUqYnljAeVxKN7eil14GnpuS6pmv5UNCWB1zEhq4ho2Jakw/viewform"
    },
    "followupDeliveryMode": "language"
  },
  "introCards": [
    {
      "id": "intro_1",
      "title": {
        "ja": "説明カード 1：青切符制度が始まった",
        "en": "Explanation Card 1: The blue ticket system has started"
      },
      "theme": {
        "ja": "制度の導入",
        "en": "Introduction of the system"
      },
      "body": {
        "ja": "2026年4月1日から、自転車にも青切符制度が適用された。\n\nここで押さえるのは2点だけである。\n・対象は16歳以上\n・反則金を納付すれば、原則として前科はつかない",
        "en": "From April 1, 2026, the blue ticket system also applies to bicycles.\n\nHere, you only need to remember two points.\n・It applies to people aged 16 or older\n・If the penalty fee is paid, the case generally does not result in a criminal record"
      },
      "hint": {
        "ja": "この段階では、細かい反則金額や手続の全体像までは覚えなくてよい。",
        "en": "At this stage, you do not need to memorize detailed penalty amounts or the full procedure."
      }
    },
    {
      "id": "intro_2",
      "title": {
        "ja": "説明カード 2：処理の分かれ方",
        "en": "Explanation Card 2: How cases are handled"
      },
      "theme": {
        "ja": "指導警告・青切符・刑事手続",
        "en": "Warnings, blue tickets, and criminal procedures"
      },
      "body": {
        "ja": "違反の扱いは大きく3つに分かれる。\n\n・基本は指導警告\n・16歳以上の反則行為は青切符\n・重大な違反や事故は刑事手続\n\nこのシミュレーションでは、この3分類を場面ごとに考えていく。",
        "en": "Cases are broadly handled in three ways.\n\n・In principle, guidance or a warning is given first\n・For people aged 16 or older, traffic violations can lead to a blue ticket\n・Serious violations or accidents can lead to criminal procedures\n\nIn this simulation, you will think about these three categories in each situation."
      },
      "hint": {
        "ja": "まずは『これは指導で済むのか、青切符なのか』という見方に慣れる。",
        "en": "First, get used to asking whether the case would only receive guidance or warning, or whether it could become a blue ticket."
      }
    }
  ],
  "questions": [
    {
      "id": "q1",
      "score_domain": "situation",
      "type": "multi",
      "theme": {
        "ja": "問題 1 / 安全寄りかつ法的に許される可能性",
        "en": "Question 1 / Safer actions that may also be legally allowed"
      },
      "title": {
        "ja": "左端が狭く、大型車が多い通学路",
        "en": "A school route with a narrow left edge and many large vehicles"
      },
      "image": "q1_narrow_road.png",
      "body": {
        "ja": "この場面で、安全寄りかつ法的にも許される可能性がある行動をすべて選べ。",
        "en": "Select all actions that are safer and may also be legally allowed in this situation."
      },
      "hint": {
        "ja": "歩道へ移る場合でも、その後の通り方まで含めて考える。",
        "en": "If you move onto the sidewalk, think about how you should travel there as well."
      },
      "choices": {
        "A": {
          "ja": "車道を走り続ける",
          "en": "Continue riding on the roadway"
        },
        "B": {
          "ja": "歩道へ移り、車道寄りを徐行する",
          "en": "Move onto the sidewalk and ride slowly on the side closer to the roadway"
        },
        "C": {
          "ja": "歩道へ移り、自転車を引いて歩く",
          "en": "Move onto the sidewalk, get off the bicycle, and walk while pushing it"
        }
      },
      "correct": [
        "B",
        "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aはこの教材では正答にしていない。車道通行自体が直ちに違法という意味ではないが、この場面で『安全寄りかつ法的にも許される可能性』を選ぶ問いでは、より安全側の対応を優先する。",
          "en": "A is not treated as correct in this learning material. Riding on the roadway is not automatically illegal, but in this question, which asks for a safer action that may also be legally allowed, the safer options are prioritized."
        },
        "B": {
          "ja": "Bは正答。交通状況からやむを得ない場合の歩道通行として扱う。歩道を通るなら車道寄りを徐行し、歩行者を妨げるときは一時停止が必要である。",
          "en": "B is correct. This is treated as sidewalk use that may be unavoidable because of the traffic situation. When riding on the sidewalk, you must ride slowly on the side closer to the roadway and stop if you might obstruct pedestrians."
        },
        "C": {
          "ja": "Cは正答。降りて押して歩けば歩行者として扱えるため、この教材では安全寄りの正解とする。",
          "en": "C is correct. If you get off and push the bicycle, you can be treated as a pedestrian, so this material treats it as a safer correct answer."
        }
      },
      "result_ok": {
        "ja": "正答は B・C。大型車が続き左端がかなり狭い場面では、歩道へ移って徐行する、または降りて引いて歩く判断を安全寄りとして扱う。",
        "en": "The correct answers are B and C. When large vehicles continue passing and the left edge of the roadway is very narrow, moving onto the sidewalk and riding slowly, or getting off and pushing the bicycle, is treated as safer."
      },
      "result_ng": {
        "ja": "正答は B・C。ポイントは『歩道へ移ること』だけではなく、その後を徐行で通るか、降りて歩くかまで含めて安全寄りに考えることである。",
        "en": "The correct answers are B and C. The point is not only moving onto the sidewalk, but also choosing to ride slowly there or get off and walk."
      },
      "log_type": "multiple"
    },
    {
      "id": "q2",
      "score_domain": "situation",
      "type": "multi",
      "theme": {
        "ja": "問題 2 / 青切符になりうる行動",
        "en": "Question 2 / Actions that could lead to a blue ticket"
      },
      "title": {
        "ja": "歩道に入った後、前方に歩行者が2人",
        "en": "After moving onto the sidewalk, there are two pedestrians ahead"
      },
      "image": "q2_sidewalk_pedestrians.png",
      "prelude": {
        "ja": "さきほど、歩道へ移って徐行することにした。",
        "en": "Earlier, you decided to move onto the sidewalk and ride slowly."
      },
      "body": {
        "ja": "このあと、青切符の対象になりうる行動をすべて選べ。",
        "en": "After this, select all actions that could be subject to a blue ticket."
      },
      "hint": {
        "ja": "歩道では歩行者優先で、妨げるときは一時停止が必要である。",
        "en": "On sidewalks, pedestrians have priority. If you might obstruct them, you must stop."
      },
      "choices": {
        "A": {
          "ja": "徐行して様子を見て、妨げそうなら一時停止する",
          "en": "Ride slowly, watch the situation, and stop if you might obstruct the pedestrians"
        },
        "B": {
          "ja": "ベルを鳴らして歩行者に避けてもらい、そのまま抜く",
          "en": "Ring the bell to make the pedestrians move aside, and pass without stopping"
        },
        "C": {
          "ja": "車道側に少し寄せて、勢いで抜ける",
          "en": "Move slightly toward the roadway side and pass with momentum"
        }
      },
      "correct": [
        "B",
        "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aは適切であり、この問題では青切符の対象にしていない。徐行し、妨げそうなら一時停止するのが基本である。",
          "en": "A is appropriate and is not treated as a blue-ticket action in this question. The basic rule is to ride slowly and stop if you might obstruct pedestrians."
        },
        "B": {
          "ja": "Bは青切符側。ベルで歩行者をどかしてそのまま抜く発想は、歩道での歩行者優先に反する。この教材では安全運転義務違反 6,000円 側として扱う。",
          "en": "B is on the blue-ticket side. Ringing the bell to make pedestrians move aside and passing without stopping goes against pedestrian priority on sidewalks. In this material, it is treated as a safe driving obligation violation with a 6,000 yen penalty."
        },
        "C": {
          "ja": "Cは青切符側。少し寄せれば抜けられそうでも、勢いで抜けると歩行者優先に反し、この教材では安全運転義務違反 6,000円 側として扱う。",
          "en": "C is on the blue-ticket side. Even if it looks possible to pass by moving slightly aside, passing with momentum goes against pedestrian priority. In this material, it is treated as a safe driving obligation violation with a 6,000 yen penalty."
        }
      },
      "result_ok": {
        "ja": "正答は B・C。Aが適切であり、BとCはこの教材では安全運転義務違反 6,000円 側として扱う。",
        "en": "The correct answers are B and C. A is appropriate, while B and C are treated in this material as safe driving obligation violations with a 6,000 yen penalty."
      },
      "result_ng": {
        "ja": "正答は B・C。歩道では『抜けられるか』よりも『歩行者を妨げないか』が優先である。",
        "en": "The correct answers are B and C. On sidewalks, the priority is not whether you can squeeze through, but whether you avoid obstructing pedestrians."
      },
      "log_type": "multiple"
    },
    {
      "id": "q3",
      "score_domain": "situation",
      "type": "single",
      "theme": {
        "ja": "問題 3 / どう扱われる可能性が高いか",
        "en": "Question 3 / How this is likely to be handled"
      },
      "title": {
        "ja": "黄色信号になった交差点",
        "en": "An intersection where the signal has turned yellow"
      },
      "image": "q3_yellow_signal.png",
      "body": {
        "ja": "黄色だったのでそのまま進んだ。周りに人も車両もいなそうだった。これはどう扱われる可能性が高いか。",
        "en": "The signal was yellow, so you went through. There seemed to be no pedestrians or vehicles nearby. How is this likely to be handled?"
      },
      "hint": {
        "ja": "この教材では、最も望ましいのは停止と整理する。",
              },
      "choices": {
        "A": {
          "ja": "違反ではない",
          "en": "It is not a violation"
        },
        "B": {
          "ja": "青切符の対象になりうる",
          "en": "It could be subject to a blue ticket"
        },
        "C": {
          "ja": "最初から刑事手続になる",
          "en": "It would immediately become a criminal procedure"
        }
      },
      "correct": "B",
      "feedback": {
        "A": {
          "ja": "Aではない。この教材では、黄色でそのまま進む行為を違反ではないとは扱わない。",
          "en": "A is not correct. In this material, going through on yellow is not treated as “not a violation.”"
        },
        "B": {
          "ja": "Bが正答。この教材では信号無視 → 青切符 6,000円 として扱う。解説では、最も望ましいのは停止であると整理する。",
          "en": "B is correct. In this material, this is treated as running a traffic signal, which can lead to a 6,000 yen blue ticket. The explanation organizes stopping as the most desirable action."
        },
        "C": {
          "ja": "Cではない。この場面だけで直ちに刑事手続とするのではなく、まず青切符側として扱う。",
          "en": "C is not correct. This situation alone is not treated as immediately becoming a criminal procedure; it is first placed on the blue-ticket side."
        }
      },
      "result_ok": {
        "ja": "正答は B。この教材では信号無視を青切符 6,000円 側として扱う。周囲に人や車が少なく見えても、最も望ましいのは停止である。",
        "en": "The correct answer is B. In this material, running a traffic signal is treated as a 6,000 yen blue-ticket violation. Even if there seem to be few people or vehicles nearby, stopping is the most desirable action."
      },
      "result_ng": {
        "ja": "正答は B。この教材では黄色でそのまま進む行為を、信号無視として青切符 6,000円 側に寄せて扱う。",
        "en": "The correct answer is B. In this material, going through on yellow is treated as running a traffic signal and placed on the 6,000 yen blue-ticket side."
      },
      "log_type": "single"
    },
    {
      "id": "q4",
      "score_domain": "situation",
      "type": "single",
      "theme": {
        "ja": "問題 4 / どう扱われる可能性が高いか",
        "en": "Question 4 / How this is likely to be handled"
      },
      "title": {
        "ja": "「止まれ」標識と停止線のある細い道",
        "en": "A narrow road with a “Stop” sign and a stop line"
      },
      "image": "q4_stop_line.png",
      "body": {
        "ja": "停止線のある『止まれ』で、完全停止せず徐行だけで入った。これはどう扱われる可能性が高いか。",
        "en": "At a “Stop” sign with a stop line, you entered after only slowing down, without making a complete stop. How is this likely to be handled?"
      },
      "hint": {
        "ja": "この問題は制度理解寄り。停止線と『止まれ』がある以上、徐行だけでは足りない。",
        "en": "This question focuses on understanding the system. If there is a stop line and a “Stop” sign, simply slowing down is not enough."
      },
      "choices": {
        "A": {
          "ja": "違反ではない",
          "en": "It is not a violation"
        },
        "B": {
          "ja": "青切符の対象になりうる",
          "en": "It could be subject to a blue ticket"
        },
        "C": {
          "ja": "最初から刑事手続になる",
          "en": "It would immediately become a criminal procedure"
        }
      },
      "correct": "B",
      "feedback": {
        "A": {
          "ja": "Aではない。停止線のある『止まれ』で完全停止しないのは、この教材では適法とは扱わない。",
          "en": "A is not correct. At a “Stop” sign with a stop line, failing to make a complete stop is not treated as lawful in this material."
        },
        "B": {
          "ja": "Bが正答。指定場所一時不停止等 → 青切符 5,000円 として扱う。",
          "en": "B is correct. This is treated as failure to stop at a designated place, which can lead to a 5,000 yen blue ticket."
        },
        "C": {
          "ja": "Cではない。この行為だけで最初から刑事手続とするのではなく、この教材ではまず青切符側に置く。",
          "en": "C is not correct. This action alone is not treated as immediately becoming a criminal procedure; in this material, it is first placed on the blue-ticket side."
        }
      },
      "result_ok": {
        "ja": "正答は B。指定場所一時不停止等として青切符 5,000円 側に置く。ここは『徐行したからよい』にはならない。",
        "en": "The correct answer is B. Failure to stop at a designated place is placed on the 5,000 yen blue-ticket side. “I slowed down” is not enough here."
      },
      "result_ng": {
        "ja": "正答は B。停止線と『止まれ』がある以上、完全停止が必要であり、徐行だけでは足りない。",
        "en": "The correct answer is B. If there is a stop line and a “Stop” sign, a complete stop is required. Simply slowing down is not enough."
      },
      "log_type": "single"
    },
    {
      "id": "q5",
      "score_domain": "situation",
      "type": "multi",
      "theme": {
        "ja": "問題 5 / 青切符になりうる行動",
        "en": "Question 5 / Actions that could lead to a blue ticket"
      },
      "title": {
        "ja": "遮断機のない小さな踏切",
        "en": "A small railroad crossing without a gate"
      },
      "image": "q5_railroad.png",
      "body": {
        "ja": "この場面で、青切符の対象になりうる行動をすべて選べ。",
        "en": "In this situation, select all actions that could be subject to a blue ticket."
      },
      "hint": {
        "ja": "列車が見えないことと、停止義務がないことは同じではない。",
        "en": "Not seeing a train and not having a duty to stop are not the same thing."
      },
      "choices": {
        "A": {
          "ja": "踏切の直前で止まり、安全確認してから進む",
          "en": "Stop just before the railroad crossing, check safety, and then proceed"
        },
        "B": {
          "ja": "列車が見えず警報も鳴っていないので、減速だけして進む",
          "en": "Since no train is visible and no alarm is sounding, just slow down and proceed"
        },
        "C": {
          "ja": "いつも列車が来ないので、確認せずそのまま通る",
          "en": "Since trains never come here, proceed without checking"
        }
      },
      "correct": [
        "B",
        "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aは適切であり、この問題では青切符側にしていない。踏切の直前で止まり、安全確認してから進むのが基本である。",
          "en": "A is appropriate and is not treated as a blue-ticket action in this question. The basic rule is to stop just before the crossing and check safety before proceeding."
        },
        "B": {
          "ja": "Bは青切符側。列車が見えず警報も鳴っていなくても、減速だけでは足りない。この教材では踏切不停止等 / 遮断踏切立入り → 青切符 7,000円 側として扱う。",
          "en": "B is on the blue-ticket side. Even if no train is visible and no alarm is sounding, simply slowing down is not enough. In this material, it is treated as failure to stop at a railroad crossing or entering a closed crossing, with a 7,000 yen blue ticket."
        },
        "C": {
          "ja": "Cは青切符側。『いつも列車が来ない』という慣れで確認を省くのは不適切で、この教材では青切符 7,000円 側として扱う。",
          "en": "C is on the blue-ticket side. Skipping safety checks because “trains never come here” is inappropriate. In this material, it is treated as a 7,000 yen blue-ticket violation."
        }
      },
      "result_ok": {
        "ja": "正答は B・C。踏切では、見えていない・鳴っていないことよりも、停止と確認をしたかが重要である。",
        "en": "The correct answers are B and C. At a railroad crossing, what matters is whether you stopped and checked, not simply whether you can see or hear a train."
      },
      "result_ng": {
        "ja": "正答は B・C。列車が来ないように見える場面ほど、『減速だけ』『確認なし』が混ざりやすい。",
        "en": "The correct answers are B and C. In situations where it looks like no train is coming, people are especially likely to fall into “just slowing down” or “not checking.”"
      },
      "log_type": "multiple"
    },
    {
      "id": "q6",
      "score_domain": "situation",
      "type": "multi",
      "theme": {
        "ja": "問題 6 / 青切符になりうる行動",
        "en": "Question 6 / Actions that could lead to a blue ticket"
      },
      "title": {
        "ja": "友人と並んで走っている帰り道",
        "en": "Riding side by side with a friend on the way home"
      },
      "image": "q6_parallel.png",
      "body": {
        "ja": "この場面で、青切符の対象になりうる行動をすべて選べ。",
        "en": "In this situation, select all actions that could be subject to a blue ticket."
      },
      "hint": {
        "ja": "車が来ていないこと、短い区間であること、低速であることは、そのまま免除理由にはならない。",
        "en": "No cars coming, only a short distance, or riding slowly are not automatic excuses."
      },
      "choices": {
        "A": {
          "ja": "車が来ていない短い区間だけ並んで走る",
          "en": "Ride side by side only for a short section when no cars are coming"
        },
        "B": {
          "ja": "すぐ一列に戻す",
          "en": "Immediately return to riding in a single line"
        },
        "C": {
          "ja": "低速なら並んでもよいと考え、そのまま並んで走る",
          "en": "Think that riding side by side is fine if you are going slowly, and continue doing so"
        }
      },
      "correct": [
        "A",
                "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aは青切符側。短い区間でも並進禁止違反の考え方は変わらない。この教材では 3,000円 側として扱う。",
          "en": "A is on the blue-ticket side. Even for a short section, the idea behind the prohibition on riding side by side does not change. In this material, it is treated as a 3,000 yen violation."
        },
        "B": {
          "ja": "Bはこの問題では青切符側にしていない。すぐ一列に戻すのが適切である。",
          "en": "B is not treated as a blue-ticket action in this question. Immediately returning to a single line is appropriate."
        },
        "C": {
          "ja": "Cは青切符側。低速だからよいとはならず、この教材では並進禁止違反 3,000円 側として扱う。例外的に並進可の標識等がある場合は別である。",
          "en": "C is on the blue-ticket side. Riding slowly does not make it automatically acceptable. In this material, it is treated as a 3,000 yen violation for riding side by side. An exception may apply only where signs permit it."
        }
      },
      "result_ok": {
        "ja": "正答は A・C。短い区間・低速・車がいない、という事情では並走の違反性は消えない。",
        "en": "The correct answers are A and C. A short distance, low speed, or no cars nearby does not remove the possible violation of riding side by side."
      },
      "result_ng": {
        "ja": "正答は A・C。ポイントは『このくらいならいい』と思いやすい条件でも、並進禁止違反になりうることである。",
        "en": "The correct answers are A and C. The point is that even conditions that make people think “this should be fine” can still lead to a violation for riding side by side."
      },
      "log_type": "multiple"
    },
    {
      "id": "q7",
      "score_domain": "system",
      "type": "multi",
      "theme": {
        "ja": "問題 7 / 青切符になりうる行動",
        "en": "Question 7 / Actions that could lead to a blue ticket"
      },
      "title": {
        "ja": "夕方、まだ少し明るいがライトをつけるか迷う",
        "en": "In the evening, it is still a little bright, but you are unsure whether to turn on your light"
      },
      "image": "q7_light.png",
      "body": {
        "ja": "この場面で、青切符の対象になりうる行動をすべて選べ。",
        "en": "In this situation, select all actions that could be subject to a blue ticket."
      },
      "hint": {
        "ja": "街灯があることと、自転車のライト義務が消えることは別である。",
        "en": "Having streetlights does not remove the bicycle lighting requirement."
      },
      "choices": {
        "A": {
          "ja": "まだ少し明るいので点けない",
          "en": "Do not turn on the light because it is still a little bright"
        },
        "B": {
          "ja": "少し早めでもライトを点ける",
          "en": "Turn on the light even if it feels slightly early"
        },
        "C": {
          "ja": "街灯があるので、ライトは不要だと考える",
          "en": "Think that bicycle lights are unnecessary because there are streetlights"
        }
      },
      "correct": [
        "A",
        "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aは青切符側。夜間はライト点灯義務があり、この教材では無灯火 5,000円 側として扱う。",
          "en": "A is on the blue-ticket side. At night, bicycle lights must be turned on. In this material, it is treated as a 5,000 yen violation for riding without lights."
        },
        "B": {
          "ja": "Bは適切であり、この問題では違反にしていない。少し早めでも点灯する判断が安全寄りである。",
          "en": "B is appropriate and is not treated as a violation in this question. Turning on the light slightly early is a safer decision."
        },
        "C": {
          "ja": "Cは青切符側。街灯があってもライト義務はなくならない。この教材では無灯火 5,000円 側として扱う。",
          "en": "C is on the blue-ticket side. Streetlights do not remove the lighting requirement. In this material, it is treated as a 5,000 yen violation for riding without lights."
        }
      },
      "result_ok": {
        "ja": "正答は A・C。『まだ見える』『街灯がある』は、無灯火が許される理由にはならない。",
        "en": "The correct answers are A and C. “I can still see” or “there are streetlights” is not a reason that riding without a light is allowed."
      },
      "result_ng": {
        "ja": "正答は A・C。この問題では、夕方の『まだ少し明るい』という迷いをどう処理するかがポイントである。",
        "en": "The correct answers are A and C. This question focuses on how to handle the evening feeling that it is “still a little bright.”"
      },
      "log_type": "multiple"
    },
    {
      "id": "q8",
      "score_domain": "system",
      "type": "multi",
      "theme": {
        "ja": "問題 8 / 違反になりうるもの",
        "en": "Question 8 / Things that could become violations"
      },
      "title": {
        "ja": "イヤホン・耳当て",
        "en": "Earphones and earmuffs"
      },
      "image": null,
      "body": {
        "ja": "違反になりうるものをすべて選べ。",
        "en": "Select all items that could become violations."
      },
      "hint": {
        "ja": "軸は何を付けているかではなく、安全な運転に必要な音や声が聞こえない状態かどうかである。",
        "en": "The key point is not what you are wearing, but whether you can hear sounds and voices necessary for safe driving."
      },
      "choices": {
        "A": {
          "ja": "両耳イヤホンで、車の接近音や声かけがほとんど聞こえない",
          "en": "Using earphones in both ears, so you can hardly hear approaching vehicles or people calling out"
        },
        "B": {
          "ja": "両耳イヤホンで、外音取り込み機能を付けていて、ある程度は周囲の音が聞こえる",
          "en": "Using earphones in both ears with ambient sound mode on, so you can hear surrounding sounds to some extent"
        },
        "C": {
          "ja": "外が寒く耳当てをしていて、周囲の音が聞こえにくい",
          "en": "Wearing earmuffs because it is cold outside, making it hard to hear surrounding sounds"
        },
        "D": {
          "ja": "骨伝導イヤホンで、ある程度周囲の音や声が聞こえる",
          "en": "Using bone-conduction earphones, so you can hear surrounding sounds and voices to some extent"
        }
      },
      "correct": [
        "A",
        "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aは違反寄り。安全な運転に必要な音がほとんど聞こえないため、この教材では 5,000円 側の解説に寄せる。",
          "en": "A is violation-leaning. Because sounds necessary for safe driving can hardly be heard, this material explains it on the 5,000 yen side."
        },
        "B": {
          "ja": "Bはこの問題設定では違反にしない。ポイントは装着物そのものではなく、必要な音が聞こえる状態かである。",
          "en": "B is not treated as a violation under this question setting. The point is not the device itself, but whether necessary sounds can be heard."
        },
        "C": {
          "ja": "Cは違反寄り。耳当てであっても、必要な音や声が聞こえにくいなら問題になる。",
          "en": "C is violation-leaning. Even with earmuffs, it can become a problem if necessary sounds and voices are hard to hear."
        },
        "D": {
          "ja": "Dはこの問題設定では違反にしない。骨伝導だから自動的にOKではないが、ここでは『ある程度聞こえる』前提で違反にしない。",
          "en": "D is not treated as a violation under this question setting. Bone conduction is not automatically OK, but here it is assumed that surrounding sounds can be heard to some extent."
        }
      },
      "result_ok": {
        "ja": "正答は A・C。イヤホンか耳当てかよりも、『安全な運転に必要な音や声が聞こえない状態』かどうかが軸になる。",
        "en": "The correct answers are A and C. The main issue is not whether the item is earphones or earmuffs, but whether necessary sounds and voices for safe driving cannot be heard."
      },
      "result_ng": {
        "ja": "正答は A・C。この問題では、装着物の名前ではなく『聞こえる状態か』で判断する。",
        "en": "The correct answers are A and C. In this question, judge based on whether sounds can be heard, not based on the name of the item."
      },
      "log_type": "multiple"
    },
    {
      "id": "q9",
      "score_domain": "system",
      "type": "classify",
      "theme": {
        "ja": "問題 9 / 青切符と違反なしの分類",
        "en": "Question 9 / Classifying blue tickets and no violation"
      },
      "title": {
        "ja": "自転車のスマホホルダーのスマホに通知が来た",
        "en": "A notification arrives on a smartphone mounted in a bicycle phone holder"
      },
      "image": null,
      "body": {
        "ja": "次の行動のうち、青切符になりうるもの と 違反なし をそれぞれ選べ。",
        "en": "For each action below, choose whether it could lead to a blue ticket or whether it is not a violation."
      },
      "hint": {
        "ja": "手で保持して通話・注視する行為、またはホルダー画面を注視する行為は反則行為であり、この教材では 12,000円 側として扱う。",
        "en": "Holding a phone by hand to make a call or stare at the screen, or staring at the screen while it is mounted in a holder, is treated as a violation. In this material, it is placed on the 12,000 yen side."
      },
      "choices": {
        "A": {
          "ja": "安全な場所に止まってから通知を確認した",
          "en": "You stopped in a safe place before checking the notification"
        },
        "B": {
          "ja": "スマホを手に持って通知を読んだ",
          "en": "You held the smartphone in your hand and read the notification"
        },
        "C": {
          "ja": "スマホホルダーの画面を注視しながら走り続けた",
          "en": "You continued riding while staring at the screen on the smartphone holder"
        }
      },
      "groups": [
        "blue_ticket",
        "no_violation"
      ],
      "correct_groups": {
        "A": "no_violation",
        "B": "blue_ticket",
        "C": "blue_ticket"
      },
      "result_ok": {
        "ja": "正答は『青切符：B・C』『違反なし：A』。実際に交通の危険を生じさせた場合は青切符ではなく刑事手続側になる。",
        "en": "The correct classification is “Blue ticket: B and C” and “No violation: A.” If the action actually creates a traffic danger, it would move from the blue-ticket side to the criminal-procedure side."
      },
      "result_ng": {
        "ja": "正答は『青切符：B・C』『違反なし：A』。ホルダーに付いていても、画面注視は反則行為に含まれる。",
        "en": "The correct classification is “Blue ticket: B and C” and “No violation: A.” Even if the phone is mounted in a holder, staring at the screen while riding is included in prohibited conduct."
      },
      "per_choice_feedback": {
        "A": {
          "ja": "Aは違反なし。安全な場所に止まってから確認するのが適切である。",
          "en": "A is no violation. Stopping in a safe place before checking is appropriate."
        },
        "B": {
          "ja": "Bは青切符側。手で保持して読めば、手持ちのながらスマホとして反則行為になる。",
          "en": "B is on the blue-ticket side. If you hold the phone in your hand and read it, it becomes a hand-held smartphone violation."
        },
        "C": {
          "ja": "Cは青切符側。ホルダーに付いていても、画面を注視しながら走り続ければ禁止対象に含まれる。",
          "en": "C is on the blue-ticket side. Even when the phone is mounted in a holder, continuing to ride while staring at the screen is included in prohibited conduct."
        }
      },
      "log_type": "classification",
      "group_labels": {
        "blue_ticket": {
          "ja": "青切符",
          "en": "Blue ticket"
        },
        "no_violation": {
          "ja": "違反なし",
          "en": "No violation"
        }
      }
    },
        {
      "id": "q10",
      "score_domain": "system",
      "type": "single",
      "theme": {
        "ja": "問題 10 / 誤っているものを1つ選ぶ",
        "en": "Question 10 / Select the one incorrect statement"
      },
      "title": {
        "ja": "青切符の対象は誰か",
        "en": "Who is subject to the blue ticket system?"
      },
      "image": null,
      "body": {
        "ja": "誤っているものを1つ選べ。",
        "en": "Select the one incorrect statement."
      },
      "hint": {
        "ja": "学年ではなく、年齢が基準である。",
        "en": "The standard is age, not school grade."
      },
      "choices": {
        "A": {
          "ja": "青切符は16歳以上の反則行為が対象",
          "en": "Blue tickets apply to traffic violations committed by people aged 16 or older"
        },
        "B": {
          "ja": "15歳の高校生でも、高校生なら青切符の対象になる",
          "en": "Even a 15-year-old high school student is subject to blue tickets because they are in high school"
        },
        "C": {
          "ja": "16歳未満でも、危険な違反なら指導警告や別の手続の対象にはなりうる",
          "en": "Even people under 16 can receive guidance, warnings, or other procedures if they commit dangerous violations"
        }
      },
      "correct": "B",
      "feedback": {
        "A": {
          "ja": "Aは正しい。青切符の対象は16歳以上の反則行為である。",
          "en": "A is correct. Blue tickets apply to traffic violations committed by people aged 16 or older."
        },
        "B": {
          "ja": "Bが誤りであり正答。学年ではなく年齢が基準なので、15歳なら高校生でも青切符の対象ではない。",
          "en": "B is incorrect and therefore the correct answer. The standard is age, not school grade. A 15-year-old is not subject to blue tickets even if they are in high school."
        },
        "C": {
          "ja": "Cは正しい。16歳未満でも、危険な違反なら指導警告や別の手続の対象にはなりうる。",
          "en": "C is correct. Even people under 16 can receive guidance, warnings, or other procedures if they commit dangerous violations."
        }
      },
      "result_ok": {
        "ja": "正答は B。青切符は学年ではなく年齢で決まり、対象は16歳以上である。",
        "en": "The correct answer is B. Blue tickets are based on age, not school grade, and apply to people aged 16 or older."
      },
      "result_ng": {
        "ja": "正答は B。高校生かどうかではなく、16歳以上かどうかが基準になる。",
        "en": "The correct answer is B. The standard is not whether someone is a high school student, but whether they are aged 16 or older."
      },
      "log_type": "single"
    },
    {
      "id": "q11",
      "score_domain": "system",
      "type": "multi",
      "theme": {
        "ja": "問題 11 / 正しいものをすべて選ぶ",
        "en": "Question 11 / Select all correct statements"
      },
      "title": {
        "ja": "青切符を受けた後の流れ",
        "en": "The process after receiving a blue ticket"
      },
      "image": null,
      "body": {
        "ja": "正しいものをすべて選べ。",
        "en": "Select all correct statements."
      },
      "hint": {
        "ja": "仮納付しなければ通告センター経由の手続に進み、納付しなければ刑事手続へ移る。",
        "en": "If provisional payment is not made, the procedure moves through the traffic violation notification center, and if payment is still not made, it can move to criminal procedures."
      },
      "choices": {
        "A": {
          "ja": "告知を受けた翌日から原則7日以内に反則金を仮納付できる",
          "en": "In principle, the penalty fee can be provisionally paid within seven days from the day after the notice is issued"
        },
        "B": {
          "ja": "仮納付しなくても、指定の期日に交通反則通告センターで納付手続を進められる",
          "en": "Even if provisional payment is not made, payment procedures can be continued at the traffic violation notification center on the designated date"
        },
        "C": {
          "ja": "反則金を納付しなければ、そのまま自動的に手続は終わる",
          "en": "If the penalty fee is not paid, the procedure automatically ends"
        },
        "D": {
          "ja": "反則金を納付すれば、原則として刑事手続に移らず、前科もつかない",
          "en": "If the penalty fee is paid, the case generally does not move to criminal procedures and does not result in a criminal record"
        }
      },
      "correct": [
        "A",
        "B",
        "D"
      ],
      "feedback": {
        "A": {
          "ja": "Aは正しい。告知を受けた翌日から原則7日以内に仮納付できる。",
          "en": "A is correct. In principle, provisional payment can be made within seven days from the day after the notice is issued."
        },
        "B": {
          "ja": "Bは正しい。仮納付しなかった場合でも、指定期日に交通反則通告センターで納付手続を進める流れがある。",
          "en": "B is correct. If provisional payment is not made, there is a procedure for payment at the traffic violation notification center on the designated date."
        },
        "C": {
          "ja": "Cは誤り。納付しなければ自動終了ではなく、刑事手続へ移る可能性がある。",
          "en": "C is incorrect. If payment is not made, the procedure does not automatically end; it may move to criminal procedures."
        },
        "D": {
          "ja": "Dは正しい。反則金を納付すれば、原則として刑事手続に移らず、前科もつかない。",
          "en": "D is correct. If the penalty fee is paid, the case generally does not move to criminal procedures and does not result in a criminal record."
        }
      },
      "result_ok": {
        "ja": "正答は A・B・D。『仮納付』『通告センター』『納付すれば原則前科なし』という流れを押さえる。",
        "en": "The correct answers are A, B, and D. Remember the flow: provisional payment, notification center, and generally no criminal record if the penalty fee is paid."
      },
      "result_ng": {
        "ja": "正答は A・B・D。反則金を払わなければ手続が自動終了するわけではなく、刑事手続へ進みうる。",
        "en": "The correct answers are A, B, and D. If the penalty fee is not paid, the procedure does not automatically end; it can move to criminal procedures."
      },
      "log_type": "multiple"
    },
    {
      "id": "q12",
      "score_domain": "system",
      "type": "multi",
      "theme": {
        "ja": "問題 12 / 正しいものをすべて選ぶ",
        "en": "Question 12 / Select all correct statements"
      },
      "title": {
        "ja": "危険違反を繰り返したときの講習",
        "en": "Training after repeated dangerous violations"
      },
      "image": null,
      "body": {
        "ja": "正しいものをすべて選べ。",
        "en": "Select all correct statements."
      },
      "hint": {
        "ja": "対象年齢、反復の条件、講習時間、命令違反時の罰則を整理する。",
        "en": "Organize the target age, repeated-violation condition, training time, and penalty for disobeying an order."
      },
      "choices": {
        "A": {
          "ja": "14歳以上が対象になりうる",
          "en": "People aged 14 or older can be subject to the training system"
        },
        "B": {
          "ja": "3年以内に2回以上反復して検挙されたり、事故を起こしたりすると対象になりうる",
          "en": "A person can become subject to it if they are repeatedly caught two or more times within three years, or if they cause an accident"
        },
        "C": {
          "ja": "講習は3時間で、受講料が必要",
          "en": "The training lasts three hours and requires a fee"
        },
        "D": {
          "ja": "命令されたのに受講しなくても、口頭注意で終わる",
          "en": "Even if someone is ordered to take the training but does not attend, it ends with only a verbal warning"
        }
      },
      "correct": [
        "A",
        "B",
        "C"
      ],
      "feedback": {
        "A": {
          "ja": "Aは正しい。自転車運転者講習は14歳以上が対象になりうる。",
          "en": "A is correct. Bicycle rider training can apply to people aged 14 or older."
        },
        "B": {
          "ja": "Bは正しい。3年以内に2回以上の反復で対象になりうる。",
          "en": "B is correct. It can apply when someone is repeatedly caught two or more times within three years."
        },
        "C": {
          "ja": "Cは正しい。講習は3時間で、受講料が必要である。",
          "en": "C is correct. The training lasts three hours and requires a fee."
        },
        "D": {
          "ja": "Dは誤り。命令に従わなければ、5万円以下の罰金がありうる。",
          "en": "D is incorrect. If someone does not obey the order, they may face a fine of up to 50,000 yen."
        }
      },
      "result_ok": {
        "ja": "正答は A・B・C。講習は14歳以上が対象になりうり、3年以内に2回以上の反復で対象、3時間・受講料ありである。",
        "en": "The correct answers are A, B, and C. The training can apply from age 14, can be triggered by two or more repeated violations within three years, lasts three hours, and requires a fee."
      },
      "result_ng": {
        "ja": "正答は A・B・C。命令されたのに受講しなければ、口頭注意ではなく5万円以下の罰金がありうる。",
        "en": "The correct answers are A, B, and C. If someone is ordered to take the training but does not attend, it does not end with a verbal warning; they may face a fine of up to 50,000 yen."
      },
      "log_type": "multiple"
    }
  ],
  "survey": {
  "ja": [
    {
      "id": "age",
      "type": "number",
      "title": "Q1．年齢を入力してください。",
      "min": 6,
      "max": 100,
      "placeholder": "例：18"
    },
    {
      "id": "bike_frequency",
      "type": "single",
      "title": "Q2．普段，自転車を利用する頻度を選んでください。",
      "choices": [
        "A．ほぼ毎日",
        "B．週に数回",
        "C．月に数回",
        "D．ほとんど利用しない"
      ]
    },
    {
      "id": "blue_ticket_awareness",
      "type": "single",
      "title": "Q3．2026年4月から導入される自転車の青切符制度を知っていますか。",
      "choices": [
        "A．よく知っている",
        "B．聞いたことはある",
        "C．知らなかった"
      ]
    },
    {
      "id": "rule_understanding",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q4．自転車の交通ルールについて，自分は理解できていると思いますか。",
      "min": "まったくそう思わない",
      "max": "とてもそう思う"
    },
    {
      "id": "knowledge_judgment_gap",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q5．自転車の交通ルールについて，「知識として知っていること」と「実際の場面で正しく判断できること」には差があると思いますか。",
      "min": "まったくそう思わない",
      "max": "とてもそう思う"
    },
    {
      "id": "pre_check_notice",
      "type": "notice",
      "title": "ここからは，自転車の交通ルールに関する確認問題です。画像は表示されません。文章を読んで判断してください。",
      "optional": true
    },
    {
      "id": "pre_q6",
      "type": "multi",
      "title": "Q6．左端が狭く，後方から大型車が続けて近づいている道路を自転車で走っている。安全寄りかつ法的にも許される可能性がある行動をすべて選んでください。",
      "choices": [
        "A．そのまま車道の左端を無理に走り続ける",
        "B．歩道へ移り，車道寄りを徐行する",
        "C．歩道へ移り，自転車を降りて押して歩く"
      ]
    },
    {
      "id": "pre_q7",
      "type": "multi",
      "title": "Q7．歩道を自転車で徐行していると，前方に歩行者がいる。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．徐行して様子を見て，妨げそうなら一時停止する",
        "B．ベルを鳴らして歩行者に避けてもらい，そのまま通過する",
        "C．歩行者の横を勢いを落とさずに抜ける"
      ]
    },
    {
      "id": "pre_q8",
      "type": "single",
      "title": "Q8．交差点に近づいたところで信号が黄色になった。周囲に人や車両が少なそうだったため，そのまま進んだ。この行動はどう扱われる可能性が高いですか。",
      "choices": [
        "A．違反ではない",
        "B．青切符の対象になりうる",
        "C．最初から刑事手続になる"
      ]
    },
    {
      "id": "pre_q9",
      "type": "single",
      "title": "Q9．「止まれ」の標識と停止線がある場所で，完全停止せず，徐行だけで進入した。この行動はどう扱われる可能性が高いですか。",
      "choices": [
        "A．違反ではない",
        "B．青切符の対象になりうる",
        "C．最初から刑事手続になる"
      ]
    },
    {
      "id": "pre_q10",
      "type": "multi",
      "title": "Q10．遮断機のない小さな踏切を通る場面で，青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．踏切の直前で止まり，安全確認してから進む",
        "B．列車が見えず警報も鳴っていないので，減速だけして進む",
        "C．いつも列車が来ないので，確認せずそのまま通る"
      ]
    },
    {
      "id": "pre_q11",
      "type": "multi",
      "title": "Q11．友人と自転車で帰っている。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．車が来ていない短い区間だけ並んで走る",
        "B．すぐ一列に戻す",
        "C．低速なら並んでもよいと考え，そのまま並んで走る"
      ]
    },
    {
      "id": "pre_q12",
      "type": "multi",
      "title": "Q12．夕方でまだ少し明るく，街灯もある道路を自転車で走る。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．まだ少し明るいのでライトを点けない",
        "B．少し早めでもライトを点ける",
        "C．街灯があるので，自転車のライトは不要だと考える"
      ]
    },
    {
      "id": "learning_needs",
      "type": "multi",
      "title": "Q13．自転車の交通ルールについて，今後知っておきたいと思うものをすべて選んでください。",
      "choices": [
        "A．自転車が走ってよい場所について",
        "B．危険な場面での正しい判断について",
        "C．青切符の対象になる行動について",
        "D．青切符制度や反則金の仕組みについて",
        "E．特にない",
        "F．その他"
      ]
    },
    {
      "id": "free_text",
      "type": "text",
      "title": "Q14．自転車の交通ルールや青切符制度について，現在知りたいこと，不安に感じていること，迷いやすいと思う場面があれば自由に記入してください。",
      "optional": true
    }
  ],
  "en": [
    {
      "id": "age",
      "type": "number",
      "title": "Q1. Please enter your age.",
      "min": 6,
      "max": 100,
      "placeholder": "Example: 18"
    },
    {
      "id": "bike_frequency",
      "type": "single",
      "title": "Q2. How often do you usually use a bicycle?",
      "choices": [
        "A. Almost every day",
        "B. Several times a week",
        "C. Several times a month",
        "D. Rarely or never"
      ]
    },
    {
      "id": "blue_ticket_awareness",
      "type": "single",
      "title": "Q3. Do you know about the bicycle blue ticket system introduced in April 2026?",
      "choices": [
        "A. I know it well",
        "B. I have heard of it",
        "C. I did not know about it"
      ]
    },
    {
      "id": "rule_understanding",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q4. Do you think you understand bicycle traffic rules?",
      "min": "Strongly disagree",
      "max": "Strongly agree"
    },
    {
      "id": "knowledge_judgment_gap",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q5. Do you think there is a gap between knowing bicycle traffic rules and correctly judging what to do in real situations?",
      "min": "Strongly disagree",
      "max": "Strongly agree"
    },
    {
      "id": "pre_check_notice",
      "type": "notice",
      "title": "From here, these are check questions about bicycle traffic rules. Images will not be shown. Please read the text and judge each situation.",
      "optional": true
    },
    {
      "id": "pre_q6",
      "type": "multi",
      "title": "Q6. You are riding on a road with a narrow left edge, and large vehicles are continuously approaching from behind. Select all actions that are safer and may also be legally allowed.",
      "choices": [
        "A. Keep forcing yourself to ride along the far-left edge of the roadway",
        "B. Move onto the sidewalk and ride slowly on the side closer to the roadway",
        "C. Move onto the sidewalk, get off, and walk while pushing your bicycle"
      ]
    },
    {
      "id": "pre_q7",
      "type": "multi",
      "title": "Q7. You are riding slowly on the sidewalk and there is a pedestrian ahead. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Ride slowly, watch the situation, and stop if you might obstruct the pedestrian",
        "B. Ring the bell to make the pedestrian move aside and pass through",
        "C. Pass the pedestrian without reducing speed"
      ]
    },
    {
      "id": "pre_q8",
      "type": "single",
      "title": "Q8. As you approached an intersection, the signal turned yellow. Because there seemed to be few people or vehicles around, you went through. How is this action most likely to be handled?",
      "choices": [
        "A. It is not a violation",
        "B. It could be subject to a blue ticket",
        "C. It would immediately become a criminal procedure"
      ]
    },
    {
      "id": "pre_q9",
      "type": "single",
      "title": "Q9. At a place with a stop sign and a stop line, you entered after only slowing down without making a complete stop. How is this action most likely to be handled?",
      "choices": [
        "A. It is not a violation",
        "B. It could be subject to a blue ticket",
        "C. It would immediately become a criminal procedure"
      ]
    },
    {
      "id": "pre_q10",
      "type": "multi",
      "title": "Q10. In a situation where you pass a small railroad crossing without a barrier, select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Stop just before the crossing and proceed only after checking safety",
        "B. Since no train is visible and no alarm is sounding, slow down and proceed without stopping",
        "C. Since trains almost never come, proceed without checking"
      ]
    },
    {
      "id": "pre_q11",
      "type": "multi",
      "title": "Q11. You are riding home with a friend. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Ride side by side only for a short stretch when no cars are coming",
        "B. Return to single file immediately",
        "C. Think side-by-side riding is acceptable at low speed and continue riding side by side"
      ]
    },
    {
      "id": "pre_q12",
      "type": "multi",
      "title": "Q12. In the evening, it is still a little bright and there are streetlights, and you are riding a bicycle. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Do not turn on the light because it is still a little bright",
        "B. Turn on the light even a little early",
        "C. Think bicycle lights are unnecessary because there are streetlights"
      ]
    },
    {
      "id": "learning_needs",
      "type": "multi",
      "title": "Q13. Regarding bicycle traffic rules, select all topics you want to know more about from now on.",
      "choices": [
        "A. Where bicycles are allowed to ride",
        "B. Correct decisions in dangerous situations",
        "C. Actions that can lead to a blue ticket",
        "D. The blue ticket system and penalty fee structure",
        "E. None in particular",
        "F. Other"
      ]
    },
    {
      "id": "free_text",
      "type": "text",
      "title": "Q14. If there is anything you currently want to know, feel anxious about, or find confusing regarding bicycle traffic rules or the blue ticket system, please write it freely.",
      "optional": true
    }
  ]
},
  "ui": {
    "ja": {
      "appTitle": "自転車青切符ルール診断",
      "subtitle": "実際の場面を見ながら，自転車交通ルールの理解度と判断傾向を確認します。",
      "chooseLanguage": "言語を選択してください",
      "start": "開始する",
      "next": "次へ進む",
      "submit": "回答を確定する",
      "seeResult": "結果を見る",
      "participantId": "参加者ID",
      "participantPlaceholder": "例：P001",
      "consent": "このサイトでは，回答内容，正誤，回答時間を研究目的で記録します。氏名など個人を直接特定する情報は入力しないでください。",
      "surveyTitle": "事前アンケート（研究用）",
      "simulationTitle": "シミュレーション",
      "required": "この項目に回答してください。",
      "correct": "正解",
      "review": "要再確認",
      "yourAnswer": "あなたの回答",
      "correctAnswer": "正答",
      "download": "ログCSVをダウンロード",
      "restart": "もう一度プレイ",
      "score": "正答数",
      "resultTitle": "診断結果",
      "introLabel": "説明カード",
      "otherText": "その他の内容"
    },
    "en": {
      "appTitle": "Bicycle Blue Ticket Rule Check",
      "subtitle": "Check your understanding and judgment of bicycle traffic rules through realistic situations.",
      "chooseLanguage": "Choose your language",
      "start": "Start",
      "next": "Next",
      "submit": "Submit answer",
      "seeResult": "See result",
      "participantId": "Participant ID",
      "participantPlaceholder": "Example: P001",
      "consent": "This site records your answers, correctness, and response time for research purposes. Please do not enter information that directly identifies you, such as your real name.",
      "surveyTitle": "Pre-survey (Research)",
      "simulationTitle": "Simulation",
      "required": "Please answer this item.",
      "correct": "Correct",
      "review": "Review needed",
      "yourAnswer": "Your answer",
      "correctAnswer": "Correct answer",
      "download": "Download log CSV",
      "restart": "Play again",
      "score": "Score",
      "resultTitle": "Result",
            "introLabel": "Explanation card",
      "otherText": "Other details"
    }
  },
  "postSurvey": {
  "ja": [
    {
      "id": "post_q1",
      "type": "multi",
      "title": "Q1．交通量が多く，道路端に十分な幅がない場所を自転車で走っている。車との距離がかなり近く危険を感じる場合，安全寄りかつ法的にも許される可能性がある行動をすべて選んでください。",
      "choices": [
        "A．車道上でふらつきながら走り続ける",
        "B．歩道に移り，歩行者に注意しながら徐行する",
        "C．歩道に移った後，自転車を押して歩く"
      ]
    },
    {
      "id": "post_q2",
      "type": "multi",
      "title": "Q2．歩道を自転車で走っていると，前方の歩行者との距離が近くなった。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．歩行者を妨げないように徐行し，必要なら止まる",
        "B．ベルで知らせればよいと考え，歩行者をどかして進む",
        "C．少し隙間があるので，速度を保ったまま追い抜く"
      ]
    },
    {
      "id": "post_q3",
      "type": "single",
      "title": "Q3．自転車で交差点に入る直前，信号が黄色に変わった。「急げば渡れそう」と考えてそのまま通過した。この行動はどう扱われる可能性が高いですか。",
      "choices": [
        "A．違反ではない",
        "B．青切符の対象になりうる",
        "C．最初から刑事手続になる"
      ]
    },
    {
      "id": "post_q4",
      "type": "single",
      "title": "Q4．一時停止の標識がある交差点で，左右を見ながらゆっくり進んだが，停止線の前で完全には止まらなかった。この行動はどう扱われる可能性が高いですか。",
      "choices": [
        "A．違反ではない",
        "B．青切符の対象になりうる",
        "C．最初から刑事手続になる"
      ]
    },
    {
      "id": "post_q5",
      "type": "multi",
      "title": "Q5．普段あまり列車が通らない踏切を自転車で通る。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．踏切の前で一時停止し，左右を確認してから進む",
        "B．列車の気配がないので，止まらずにゆっくり通過する",
        "C．慣れている道なので，安全確認を省いて通過する"
      ]
    },
    {
      "id": "post_q6",
      "type": "multi",
      "title": "Q6．友人と会話しながら自転車で走っている。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．道が空いているので，しばらく横に並んで走る",
        "B．会話をする場合でも，一列で走る",
        "C．ゆっくり走れば問題ないと考え，並んだまま走る"
      ]
    },
    {
      "id": "post_q7",
      "type": "multi",
      "title": "Q7．日が暮れ始めた時間帯に自転車で走る。周囲はまだ見えるが，薄暗くなってきている。青切符の対象になりうる行動をすべて選んでください。",
      "choices": [
        "A．自分からは見えているので，ライトを点けずに走る",
        "B．早めにライトを点灯して走る",
        "C．街灯がある道路なので，ライトを点けなくてもよいと考える"
      ]
    },
    {
      "id": "post_penalty_notice",
      "type": "notice",
      "title": "ここからは，青切符の反則金に関する確認問題です。",
      "optional": true
    },
    {
      "id": "post_q8",
      "type": "single",
      "title": "Q8．自転車で走行中にスマートフォンを手に持って画面を注視した場合，この教材では青切符の反則金をいくらとして扱っていましたか。",
      "choices": ["A．3,000円", "B．5,000円", "C．6,000円", "D．12,000円"]
    },
    {
      "id": "post_q9",
      "type": "single",
      "title": "Q9．「止まれ」の標識と停止線がある場所で完全停止しなかった場合，この教材では青切符の反則金をいくらとして扱っていましたか。",
      "choices": ["A．3,000円", "B．5,000円", "C．6,000円", "D．7,000円"]
    },
    {
      "id": "post_q10",
      "type": "single",
      "title": "Q10．友人と並んで自転車を走らせる並進禁止違反について，この教材では青切符の反則金をいくらとして扱っていましたか。",
      "choices": ["A．3,000円", "B．5,000円", "C．6,000円", "D．12,000円"]
    },
    {
      "id": "post_attitude_notice",
      "type": "notice",
      "title": "ここからは，シミュレーション体験後の意識について答えてください。",
      "optional": true
    },
    {
      "id": "post_understanding",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q11．シミュレーション後，自転車の交通ルールへの理解は深まったと思いますか。",
      "min": "まったくそう思わない",
      "max": "とてもそう思う"
    },
    {
      "id": "post_judgment_confidence",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q12．シミュレーション後，実際の場面でどの行動が違反になりうるか判断しやすくなったと思いますか。",
      "min": "まったくそう思わない",
      "max": "とてもそう思う"
    },
    {
      "id": "post_scenario_helpful",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q13．画像や具体的な場面を用いた問題は，交通ルールの理解に役立ったと思いますか。",
      "min": "まったくそう思わない",
      "max": "とてもそう思う"
    },
    {
      "id": "post_behavior_intention",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q14．今後，自転車に乗る機会がある場合，今回学んだ内容を意識して行動しようと思いましたか。",
      "min": "まったくそう思わない",
      "max": "とてもそう思う"
    },
    {
      "id": "post_useful_content",
      "type": "multi",
      "title": "Q15．今回のシミュレーションで，特に理解に役立った内容をすべて選んでください。",
      "choices": [
        "A．自転車が走ってよい場所について",
        "B．危険な場面での正しい判断について",
        "C．青切符の対象になる行動について",
        "D．青切符制度や反則金の仕組みについて",
        "E．画像を使った場面判断について",
        "F．特にない",
        "G．その他"
      ]
    },
    {
      "id": "post_free_text",
      "type": "text",
      "title": "Q16．シミュレーションを体験して，分かりやすかった点，分かりにくかった点，改善してほしい点があれば自由に記入してください。",
      "optional": true
    }
  ],
  "en": [
    {
      "id": "post_q1",
      "type": "multi",
      "title": "Q1. You are riding in a high-traffic area where the road edge is too narrow. If you feel danger because cars are very close, select all actions that are safer and may also be legally allowed.",
      "choices": [
        "A. Keep riding on the roadway while wobbling",
        "B. Move onto the sidewalk and ride slowly while paying attention to pedestrians",
        "C. After moving onto the sidewalk, get off and walk while pushing the bicycle"
      ]
    },
    {
      "id": "post_q2",
      "type": "multi",
      "title": "Q2. While riding on the sidewalk, your distance to a pedestrian ahead becomes short. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Ride slowly so as not to obstruct the pedestrian, and stop if necessary",
        "B. Think ringing the bell is enough, make the pedestrian move aside, and proceed",
        "C. Since there is a small gap, overtake without reducing speed"
      ]
    },
    {
      "id": "post_q3",
      "type": "single",
      "title": "Q3. Just before entering an intersection by bicycle, the signal turned yellow. Thinking “I can make it if I hurry,” you went through. How is this action most likely to be handled?",
      "choices": [
        "A. It is not a violation",
        "B. It could be subject to a blue ticket",
        "C. It would immediately become a criminal procedure"
      ]
    },
    {
      "id": "post_q4",
      "type": "single",
      "title": "Q4. At an intersection with a stop sign, you moved forward slowly while looking left and right, but you did not come to a complete stop before the stop line. How is this action most likely to be handled?",
      "choices": [
        "A. It is not a violation",
        "B. It could be subject to a blue ticket",
        "C. It would immediately become a criminal procedure"
      ]
    },
    {
      "id": "post_q5",
      "type": "multi",
      "title": "Q5. You are crossing a railroad crossing where trains do not usually pass often. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Stop before the crossing and proceed after checking both directions",
        "B. Since there are no signs of a train, pass through slowly without stopping",
        "C. Because you are used to this route, skip safety checks and pass through"
      ]
    },
    {
      "id": "post_q6",
      "type": "multi",
      "title": "Q6. You are riding while talking with a friend. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Because the road is open, ride side by side for a while",
        "B. Even while talking, ride in single file",
        "C. Think side-by-side riding is fine if slow, and continue side by side"
      ]
    },
    {
      "id": "post_q7",
      "type": "multi",
      "title": "Q7. You are riding at dusk. You can still see around you, but it is getting dim. Select all actions that could be subject to a blue ticket.",
      "choices": [
        "A. Since you can still see, ride without turning on the light",
        "B. Turn on the light early",
        "C. Because there are streetlights, think bicycle lights are unnecessary"
      ]
    },
    {
      "id": "post_penalty_notice",
      "type": "notice",
      "title": "From here, these are check questions about blue-ticket penalty amounts.",
      "optional": true
    },
    {
      "id": "post_q8",
      "type": "single",
      "title": "Q8. If a person rides a bicycle while holding a smartphone and staring at the screen, what blue-ticket penalty amount was used in this material?",
      "choices": ["A. 3,000 yen", "B. 5,000 yen", "C. 6,000 yen", "D. 12,000 yen"]
    },
    {
      "id": "post_q9",
      "type": "single",
      "title": "Q9. If a person did not make a complete stop at a stop sign and stop line, what blue-ticket penalty amount was used in this material?",
      "choices": ["A. 3,000 yen", "B. 5,000 yen", "C. 6,000 yen", "D. 7,000 yen"]
    },
    {
      "id": "post_q10",
      "type": "single",
      "title": "Q10. For the violation of riding side by side with a friend where parallel riding is prohibited, what blue-ticket penalty amount was used in this material?",
      "choices": ["A. 3,000 yen", "B. 5,000 yen", "C. 6,000 yen", "D. 12,000 yen"]
    },
    {
      "id": "post_attitude_notice",
      "type": "notice",
      "title": "From here, please answer questions about your attitudes after the simulation experience.",
      "optional": true
    },
    {
      "id": "post_understanding",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q11. After the simulation, do you think your understanding of bicycle traffic rules deepened?",
      "min": "Strongly disagree",
      "max": "Strongly agree"
    },
    {
      "id": "post_judgment_confidence",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q12. After the simulation, do you think it became easier to judge which actions could be violations in real situations?",
      "min": "Strongly disagree",
      "max": "Strongly agree"
    },
    {
      "id": "post_scenario_helpful",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q13. Do you think image-based and concrete scenario questions helped you understand traffic rules?",
      "min": "Strongly disagree",
      "max": "Strongly agree"
    },
    {
      "id": "post_behavior_intention",
      "type": "scale",
      "points": [1, 2, 3, 4],
      "title": "Q14. If you ride a bicycle in the future, did this make you want to act with what you learned in mind?",
      "min": "Strongly disagree",
      "max": "Strongly agree"
    },
    {
      "id": "post_useful_content",
      "type": "multi",
      "title": "Q15. In this simulation, select all content that was especially helpful for your understanding.",
      "choices": [
        "A. Where bicycles are allowed to ride",
        "B. Correct decisions in dangerous situations",
        "C. Actions that can lead to a blue ticket",
        "D. The blue ticket system and penalty fee structure",
        "E. Image-based scenario judgment",
        "F. None in particular",
        "G. Other"
      ]
    },
    {
      "id": "post_free_text",
      "type": "text",
      "title": "Q16. After experiencing the simulation, if there were points that were easy to understand, difficult to understand, or things you want improved, please write freely.",
      "optional": true
    }
  ]
}
};