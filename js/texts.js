const CORPUS = {
  easy: [
    "the sun rose over the quiet lake and a small boat drifted toward the wooden dock. birds called from the trees while children ran along the path with bright kites. a baker opened the shop and the smell of warm bread filled the street. people waved and smiled as they walked to work. it was a simple morning full of light and calm.",
    "a cat sat on the window and watched the rain. drops tapped the glass in a slow rhythm. inside the room a lamp glowed and a book lay open on the table. the kettle sang and tea was poured into a blue cup. nothing needed to be rushed. the day could wait a little longer.",
    "we walked through the park and counted the yellow leaves. a dog chased a ball and brought it back every time. an old man fed the ducks near the pond. two friends shared a sandwich on a bench. the wind was cool but kind. we stayed until the sky turned pink."
  ],
  medium: [
    "Most people type every day without thinking about form. Fingers find keys by habit, and speed appears only after thousands of quiet repetitions. Accuracy is the real foundation. If you slow down just enough to land each letter cleanly, your pace will rise without extra strain. Practice in short sessions, rest your wrists, and keep your eyes on the words rather than the keyboard.",
    "Cities grow in layers. Rail lines, markets, libraries, and river walks all compete for the same square of ground. A good street invites walking: shade in summer, lights in winter, shops that stay open after dusk. When a neighborhood feels safe and useful, people linger. That lingering is the hidden engine of local life.",
    "A typing test is a small experiment. Time is limited, the passage is unknown, and every error costs a fraction of your score. The useful question is not whether you can burst to a high peak, but whether you can hold a steady cadence. Consistency often predicts real-world speed better than a single lucky minute."
  ],
  hard: [
    "Precision under pressure is a craft, not a temperament. The typist who chases raw velocity often plants silent errors that compound across a paragraph. Better to cultivate an even attack: wrists floating, shoulders quiet, gaze locked on the incoming word rather than the last mistake. Rhythm precedes speed. When the metronome of your keystrokes settles, the numbers follow without being hunted.",
    "Technological progress rarely arrives as a single thunderclap. It accumulates through unglamorous increments: a cleaner protocol, a quieter motor, a more truthful measurement. Typing itself is such an increment. The QWERTY layout, mechanical switches, and later capacitive keys each altered the texture of thought. We write differently because the machine beneath our hands changed the cost of revision.",
    "In jurisprudence, language is load-bearing. A misplaced comma can invert an obligation; an ambiguous antecedent can unravel a clause. Legal drafting therefore rewards the same virtues as high-level typing: vigilance, economy, and an intolerance for drift. The document is not merely read; it is enforced. That knowledge should slow the hand just enough to keep meaning intact."
  ],
  pop: "The film opened with a neon skyline and a synth that felt like rain on glass. Critics argued about plot holes while audiences quoted the one-liners in elevators. A sequel was inevitable, then a trilogy, then a streaming series that explained too much. Still, the original scene remained: two strangers sharing fries under a flickering sign, convinced the night would last.",
  sport: "The match turned in the seventy-third minute. A low cross skidded through the six-yard box and a late run met it with the inside of the boot. The stadium inhaled as one. After that, the visitors sat deep and the home side recycled possession without urgency. Three points were enough. In the tunnel, nobody spoke of luck, only of timing.",
  nature: "Fog hung in the valley until noon, then lifted in slow ribbons from the pines. A creek braided around granite and carried last night's rain toward the lake. Elk tracks crossed the trail and vanished in wet moss. High above, a hawk held still against a thermal. The forest did not perform. It simply continued, indifferent and complete.",
  tech: "Distributed systems fail in boring ways: clocks drift, disks fill, a retry storm looks like demand. The elegant architecture diagram rarely survives contact with a partition. Good operators design for partial outage, measure lag instead of vibes, and treat rollback as a first-class path. Complexity is not a badge. It is a tax you pay every on-call night.",
  travel: "The overnight train smelled of coffee and damp wool. Stations appeared as brief rectangles of sodium light, then the dark returned. In the morning the mountains arrived without announcement, white and close. A conductor punched tickets with a machine older than the passengers. Nobody rushed. Arrival, for once, was not the point of the journey.",
  mixed: "On Tuesday the market sold peaches, copper wire, and secondhand novels. A programmer bought both fruit and a paperback about ships. Later, in a small office above a bakery, she wrote a function that sorted invoices and ate the peach over the keyboard. Juice dotted the space bar. She laughed, wiped it, and shipped the patch before lunch.",
  fable: "A crow found a piece of cheese and flew to a high branch. A fox, hungry and clever, praised the crow's voice until the bird opened its beak to sing. The cheese fell. The fox took it and remarked that vanity is expensive. The crow, wiser and still hungry, never sang for flattery again.",
  baseball: "The pitcher worked the corners, never the heart of the plate. A 2-2 slider dove under a late swing. In the seventh, a bunt moved the runner, and a sacrifice fly scored him. Defense won the afternoon: a diving catch in right, a throw that beat the runner by a step. Box scores forget the dirt stains. Managers do not.",
  space: "The crew woke to a red planet filling the porthole. Dust storms braided the horizon like slow fire. On the surface, a rover waited with samples sealed in titanium. They would not stay long. Life support is a budget, and every extra hour costs water. Still, nobody looked away from that rust-colored world.",
  oz: "Dorothy walked the yellow road with companions who lacked, in turn, a brain, a heart, and courage. The city ahead glittered like a promise. Witches, flying monkeys, and a wizard who was mostly machinery could not stop the simple wish to go home. In the end, the shoes had been enough all along. Home was a click, not a quest.",
  legal: "The parties agree that confidential information shall not be disclosed except as required by law or with prior written consent. Notices must be delivered to the addresses listed in Exhibit A. Failure to enforce a provision shall not constitute a waiver of future enforcement. This agreement is governed by the laws of the stated jurisdiction, without regard to conflict-of-law principles.",
  medical: "The patient presented with acute shortness of breath and a productive cough. Vital signs showed mild tachycardia and an oxygen saturation of ninety-four percent on room air. Auscultation revealed crackles at the left base. A chest radiograph suggested community-acquired pneumonia. Antibiotics were started after cultures, and the care plan included incentive spirometry and close monitoring of fluid balance.",
  business: "Quarterly revenue rose eight percent, driven by subscription renewals rather than new logos. Gross margin held, though sales cycle length increased in enterprise accounts. Leadership froze discretionary hiring and redirected spend toward customer success. The board asked for a clearer path to cash-flow break-even. The answer was fewer experiments and tighter pricing discipline, not another slide about vision.",
  coding: "function measure(wpm, acc) {\n  const net = Math.round(wpm * (acc / 100));\n  if (!Number.isFinite(net)) throw new Error('bad score');\n  return { net, tag: net >= 80 ? 'fast' : 'steady' };\n}\nconst rows = tests.map(t => measure(t.wpm, t.accuracy));\nconsole.log(rows.filter(r => r.net > 40));"
};

const WORD_BANK = "the of and to a in is it you that he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end does another well large must big even such because turn here why ask went men read need land different home us move try kind hand picture again change off play spell air away animal house point page letter mother answer found study still learn should America world high every near add food between own below country plant last school father keep tree never start city earth eye light thought head under story saw left don't few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later miss idea enough eat face watch far Indian real almost let above girl sometimes mountain cut young talk soon list song being leave family it's".split(" ");

const QUOTES = [
  "The only way to do great work is to love what you do.",
  "In the middle of difficulty lies opportunity.",
  "We are what we repeatedly do. Excellence, then, is not an act but a habit.",
  "Not all those who wander are lost.",
  "It is not the mountain we conquer but ourselves.",
  "Simplicity is the ultimate sophistication.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "The future belongs to those who believe in the beauty of their dreams."
];

const CODE_SNIPPETS = [
  "const sum = nums.reduce((a, b) => a + b, 0);",
  "for (let i = 0; i < list.length; i++) { visit(list[i]); }",
  "if (user && user.active) return grant(user.id);",
  "try { await db.save(record); } catch (err) { log(err); }",
  "export function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }",
  "map.set(key, (map.get(key) || 0) + 1);",
  "const unique = [...new Set(items.filter(Boolean))];",
  "class Node { constructor(value) { this.value = value; this.next = null; } }"
];

const LESSONS = [
  { id: "home", title: "Home row", keys: "asdf jkl;", prompt: "asdf jkl; asdf jkl; aaa sss ddd fff jjj kkk lll ;;; asdf jkl; fall flask salad flask dad sad lass ask all fall flask salad flask dad" },
  { id: "top", title: "Top row", keys: "qwer uiop", prompt: "qwer uiop quiet power quote upper write pour quite rope weep pour quiet power quote upper write pour quite rope weep pour quiet" },
  { id: "bottom", title: "Bottom row", keys: "zxcv nm,.", prompt: "zxcv nm,. zinc cave next move zoom cram vain exam zoom cave next move zinc cave next move zoom cram vain exam zoom cave" },
  { id: "shift", title: "Capitals", keys: "Aa Bb", prompt: "The Quick Brown Fox Jumps Over The Lazy Dog. Please Type Each Capital With Care. Monday Tuesday Wednesday Thursday Friday." },
  { id: "digits", title: "Numbers", keys: "123 890", prompt: "In 2026 there were 480 tests and 19 errors. Call 555-0134 before 18:30. Add 12 and 90 then subtract 7." },
  { id: "punct", title: "Punctuation", keys: ",.;:'\"", prompt: "Wait, don't rush; slow down. \"Accuracy first,\" she said. It's fine: commas, periods, and quotes all count." },
  { id: "bigram", title: "Common pairs", keys: "th er in", prompt: "the there their then other another interest intern enter rather whether either neither together further" },
  { id: "tricky", title: "Tricky keys", keys: "q z x p", prompt: "quiz puzzle proxy expel equal opaque quartz exact puzzle proxy expel equal opaque quartz exact quiz puzzle proxy" }
];

const KEY_MAP = {
  "`": "lp", "1": "lp", "2": "lr", "3": "lm", "4": "li", "5": "li",
  "6": "ri", "7": "ri", "8": "rm", "9": "rr", "0": "rp", "-": "rp", "=": "rp",
  "q": "lp", "w": "lr", "e": "lm", "r": "li", "t": "li",
  "y": "ri", "u": "ri", "i": "rm", "o": "rr", "p": "rp", "[": "rp", "]": "rp", "\\": "rp",
  "a": "lp", "s": "lr", "d": "lm", "f": "li", "g": "li",
  "h": "ri", "j": "ri", "k": "rm", "l": "rr", ";": "rp", "'": "rp",
  "z": "lp", "x": "lr", "c": "lm", "v": "li", "b": "li",
  "n": "ri", "m": "ri", ",": "rm", ".": "rr", "/": "rp",
  " ": "th"
};

const FINGER_NAME = {
  lp: "Left pinky",
  lr: "Left ring",
  lm: "Left middle",
  li: "Left index",
  th: "Thumb",
  ri: "Right index",
  rm: "Right middle",
  rr: "Right ring",
  rp: "Right pinky"
};

const KEY_ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  [" "]
];

const KEY_DRILLS = [
  { id: "home-left", title: "Home left", keys: "A S D F", prompt: "aaa sss ddd fff asdf fdsa asdf as sd df fa asdf salad flask falls" },
  { id: "home-right", title: "Home right", keys: "J K L ;", prompt: "jjj kkk lll ;;; jkl; ;lkj jkl; jk kl l; ;j jkl; kill jazz all" },
  { id: "home-full", title: "Home row", keys: "ASDF JKL;", prompt: "asdf jkl; asdf jkl; fj dk sl a; fall flask salad ask all lass dad sad" },
  { id: "top-left", title: "Top left", keys: "Q W E R T", prompt: "qqq www eee rrr ttt qwer trew wet were tree quiet write" },
  { id: "top-right", title: "Top right", keys: "Y U I O P", prompt: "yyy uuu iii ooo ppp youi poiuy you pop oil up pity you" },
  { id: "bottom", title: "Bottom row", keys: "ZXCV BNM", prompt: "zzz xxx ccc vvv bbb nnn mmm zinc cave next move zoom cram vain" },
  { id: "index", title: "Index stretch", keys: "R T G B Y H N", prompt: "rtgb yhn rty fgh vbn bright thing bring thirty hanging" },
  { id: "pinky", title: "Pinky keys", keys: "Q A Z P ; /", prompt: "qaz p;/ quiz jazz puzzle equal opaque proxy pass" }
];

const KEYWORD_DRILLS = [
  { id: "home-words", title: "Home words", keys: "home row", prompt: "a sad lad asks all flasks; a lass falls; dad had a salad; jak had a flask" },
  { id: "short", title: "Short words", keys: "3-4 letters", prompt: "the and for you are not but can all day get him her was one see two" },
  { id: "common", title: "Common words", keys: "high frequency", prompt: "time people year work know place live back give most just name good think help through" },
  { id: "long", title: "Long words", keys: "8+ letters", prompt: "practice keyboard accuracy complete sentence different important together children something mountain" },
  { id: "action", title: "Action words", keys: "verbs", prompt: "start type write read learn study practice improve measure finish restart follow" },
  { id: "tech-words", title: "Tech words", keys: "code vocab", prompt: "function return console object string number array class export import module server" }
];

const FAQ = [
  { q: "What is a typing test?", a: "A typing test measures how quickly and accurately you type a sample of text. TypeFast reports net WPM, gross WPM, accuracy, errors, and consistency." },
  { q: "How is typing speed measured?", a: "Speed uses WPM. One word equals five characters, including spaces. Net WPM subtracts errors so sloppy speed does not look like skill." },
  { q: "What does WPM mean?", a: "Words per minute. It estimates how many standard five-character words you can type in one minute." },
  { q: "What is a good WPM score?", a: "Around 40 WPM is solid for everyday work. 60+ is strong. 80+ is fast. 100+ is exceptional. Accuracy above 96% matters more than a short burst." },
  { q: "How is accuracy calculated?", a: "Accuracy is correct characters divided by total characters typed, including mistakes. Extra or missing letters count as errors." },
  { q: "How long should a test be?", a: "Sixty seconds is a fair snapshot. Two to five minutes reveal whether you can hold form. Ten minutes tests endurance." },
  { q: "How can I improve?", a: "Keep eyes on the text, not the keys. Slow down until errors nearly vanish, then let speed return. Short daily drills beat occasional marathons." },
  { q: "Is my data uploaded?", a: "No. History stays in your browser. Certificates are generated locally on a canvas by TypeFast." }
];
