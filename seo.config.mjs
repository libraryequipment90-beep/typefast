// Central technical-SEO configuration.
//
// SITE_ORIGIN is a PLACEHOLDER. Replace it with the real custom domain before
// the production deploy, then run `npm run seo:build`. Every canonical URL,
// sitemap entry, robots.txt pointer and Open Graph absolute URL is derived
// from this single value.
export const SITE_ORIGIN = "https://example.com";

export const SITE_NAME = "TypeFast";

// Public routes. `path` is the crawlable pretty path, `view` is the matching
// app view id, `pane` (optional) selects a Practice pane.
export const ROUTES = [
  {
    path: "/",
    view: "home",
    out: "index.html",
    title: "TypeFast — Free Typing Test to Practice, Improve and Type Faster",
    description:
      "Take a free typing test online. Measure WPM and accuracy, practice letters, keys and keywords, and track your speed with TypeFast.",
    priority: "1.0",
    changefreq: "weekly",
    inSitemap: true,
  },
  {
    path: "/typing-test/",
    view: "test",
    out: "typing-test/index.html",
    title: "Free Typing Speed Test — WPM & Accuracy | TypeFast",
    description:
      "Start a free timed typing test. Choose 30 seconds to 10 minutes, type the passage, and see your WPM, accuracy and errors when the timer ends.",
    priority: "0.9",
    changefreq: "weekly",
    inSitemap: true,
  },
  {
    path: "/practice/",
    view: "practice",
    pane: "letter",
    out: "practice/index.html",
    title: "Typing Practice — Letters, Keys & Keywords | TypeFast",
    description:
      "Practice typing with letter drills, key tests, keyword lessons and custom text on a live keyboard that shows the right finger for every key.",
    priority: "0.8",
    changefreq: "weekly",
    inSitemap: true,
  },
  {
    path: "/leaderboard/",
    view: "history",
    out: "leaderboard/index.html",
    title: "Typing Leaderboard & History | TypeFast",
    description:
      "Track your typing scores locally and compare WPM, accuracy and errors across timed tests on this device.",
    priority: "0.6",
    changefreq: "monthly",
    inSitemap: true,
  },
  {
    path: "/balloon/",
    view: "game",
    out: "balloon/index.html",
    title: "Type a Balloon — Fun Typing Game | TypeFast",
    description:
      "Play Type a Balloon, a free typing game. Type the letter on each floating balloon to pop it and build your speed and accuracy.",
    priority: "0.7",
    changefreq: "weekly",
    inSitemap: true,
  },
  {
    path: "/about/",
    view: "faq",
    out: "about/index.html",
    title: "About TypeFast — Typing Test FAQ",
    description:
      "Learn how WPM is measured, what a good typing speed is, and how TypeFast helps you type faster with free tests and drills.",
    priority: "0.7",
    changefreq: "monthly",
    inSitemap: true,
  },
];

// Practice sub-modes exposed as their own crawlable URLs (query based).
export const PRACTICE_MODES = ["letter", "key", "keyword", "lesson", "custom"];

export const OG_IMAGE = "/og-image.png";
