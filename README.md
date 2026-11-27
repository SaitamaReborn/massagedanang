# massage-da-nang.com — Massage Da Nang

Third Da Nang guide on the shared engine (`lib/engine.js`), built 27/11/2026. Every massage venue in Da Nang with a public Google rating and 20+ reviews, scored out of 100 (`lib/score100.js`, scale "massage" v1, nine criteria, the same for every venue; no pick, no placement).

- Data: `places.json` (Google Places API, snapshot date in `fetchedAt`). Google's terms cap the cache at 30 days: `build.js` refuses to build past 30 days and warns from day 25. Refresh: `node fetch-places.js && node fetch-details.js` (GOOGLE_PLACES_KEY, MAX_PHOTOS=2), always BOTH fetchers.
- Website reading: `data/bareme-100.json`, written by `~/.claude/seo-index/danang-100-2711/export_bareme.py massage` after `releve.py`, `releve_rendu.py`, `reextraire.py`. Re-run after each refresh (the build warns when a venue has no reading).
- Content: `content/best-massage.en.md` (tokens {{TOP5}}, {{DONNEES}}, {{MATRICE:10}}, items auto:10).
- Publisher: WebGuard Agency (`lib/publisher.js`). DNS at Porkbun (4 A to GitHub Pages + www CNAME).
