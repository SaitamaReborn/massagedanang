/* massage-da-nang.com — Massage Da Nang.  node build.js → ./docs
   Third guide on the shared engine (lib/engine.js), built 27/11/2026.
   No pick, no placement: every list is the 100-point score (lib/score100.js,
   scale "massage" v1), the same rule for every venue, Reborn included. */
const fs=require('fs');
const {buildSite,esc,slugify,human,ld}=require('./lib/engine.js');
const css=require('./lib/css-massage.js');
const {LOCALES}=require('./lib/i18n.js');
const PUB=require('./lib/publisher.js');

const DOMAIN="massage-da-nang.com", NAME="Massage Da Nang", SITE="https://"+DOMAIN;
const NOW=process.env.BUILD_DATE?new Date(process.env.BUILD_DATE):new Date();
const GSC=fs.existsSync('./gsc.txt')?fs.readFileSync('./gsc.txt','utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#')):[];

/* The guide's own reading of the venues' websites (27/11/2026): which venues
   list massage on their menu, and the published price of a 60-minute body
   massage where the website gives one. */
const BAREME=fs.existsSync('./data/bareme-100.json')?JSON.parse(fs.readFileSync('./data/bareme-100.json','utf8')):{faits:{}};
const FA=BAREME.faits||{};
/* Who is in it, one rule for all: massage and spa venues by their Google
   category; a venue of another care category (a nail salon, a beautician) only
   when its own website lists a body or foot massage. Hotel listings are out:
   their Google rating is for the hotel, not for its spa. */
const MASSAGE_TYPES=["Massage spa","Spa","Massage service","Foot care","Day spa","Health spa","Massage therapist","Thai massage therapist","Physical therapist"];
const PLACE_FILTER=p=>MASSAGE_TYPES.includes(p.type)
  ||(["Nail salon","Beautician","Beauty salon"].includes(p.type)&&((FA[p.id]||{}).soins||[]).some(k=>k==='massage_corps'||k==='pieds'));

const med=a=>{const v=[...a].sort((x,y)=>x-y);if(!v.length) return null;const h=v.length>>1;return v.length%2?v[h]:Math.round((v[h-1]+v[h])/2);};

const SERVICES=[
{slug:"body-massage",kw:"Body massage Da Nang",eyebrow:"Sixty to ninety minutes",h1:"Body massage in Da Nang",photo:"stones",
 lede:"Oil, aromatherapy, deep tissue or Thai: what the names on a Da Nang massage menu mean, and how to read the price per minute.",
 desc:"Body massage in Da Nang: the venues that publish a body massage on their own menu, ranked on the guide's 100-point score, with what each style involves.",
 prices:[],filter:p=>((FA[p.id]||{}).soins||[]).includes('massage_corps'),
 body:`<h2>Read the minutes, not the name</h2>
<p>Menus in Da Nang sell the same hour under many names: relaxing, aroma, oil, Swedish, signature. Compare the minutes and what is listed inside them; a price without a duration tells you little.</p>
<h2>Oil, Thai and deep tissue</h2>
<p>An oil or aromatherapy massage is long gliding strokes on the skin. A Thai massage is done clothed, with stretches and pressure along the body. Deep tissue is slower and firmer, aimed at knots. Ask for the style you want by name.</p>
<h2>Say what hurts</h2>
<p>Pressure is adjustable and therapists expect to be told. Say more or less, and point to where it hurts.</p>`,
 faq:[["What is the difference between a Thai and an oil massage?","A Thai massage is done in loose clothes, with stretching and pressure; an oil or aromatherapy massage uses long strokes with oil on the skin."],
      ["How long should a first massage be?","Sixty minutes is the common length on Da Nang menus; ninety gives the back and legs proper time."]]},
{slug:"foot-massage",kw:"Foot massage Da Nang",eyebrow:"Thirty to ninety minutes",h1:"Foot massage & reflexology in Da Nang",photo:"stones",
 lede:"The cheapest way to undo a day of walking a beach city.",
 desc:"Foot massage and reflexology in Da Nang: the venues that publish one on their own menu, ranked on the guide's 100-point score.",
 prices:[],filter:p=>((FA[p.id]||{}).soins||[]).includes('pieds'),
 body:`<h2>What a foot massage usually includes</h2>
<p>A warm soak, then work on the feet and calves in a reclining chair. Longer sessions often add the shoulders or a short head massage: check what the menu lists for the minutes.</p>
<h2>Reflexology</h2>
<p>Reflexology is pressure on points of the sole. It can be firm; say so if it hurts.</p>`,
 faq:[["Is a foot massage done in a private room?","Often in a shared room of reclining chairs; ask the venue if you prefer a private room."]]},
{slug:"head-spa",kw:"Head spa Da Nang",eyebrow:"Herbal hair wash and scalp massage",h1:"Head spa & herbal hair wash in Da Nang",photo:"scalp",
 lede:"The Vietnamese herbal hair wash, often sold alongside massage.",
 desc:"Head spa and herbal hair wash at Da Nang massage venues: the venues that publish one on their own menu, ranked on the guide's 100-point score.",
 prices:[],filter:p=>((FA[p.id]||{}).soins||[]).includes('headspa'),
 body:`<h2>A massage that starts with a wash</h2>
<p>Gội đầu dưỡng sinh is a reclined herbal hair wash with a scalp, neck and shoulder massage. Many massage venues offer it on its own or as part of a combo. The head spa guide of the same publisher compares the houses that specialise in it.</p>`,
 faq:[["Do I need to wash my hair before a head spa?","No. The wash is the treatment."]]},
];

const BESTOF=[
{slug:"best-massage-da-nang",count:10,noun:"massage",what:"a massage",
 h1:"Best massage in Da Nang",listH2:"The 10 first massage venues in Da Nang on the score",
 question:"Where is the best massage in Da Nang?",
 desc:"The best massage in Da Nang, scored out of 100 on nine criteria.",
 answerTail:"",intro:"",prices:[],reason:()=>'',faq:[]},
];

const LANGS=[
 {code:"en",path:"/",native:"English"},
 {code:"vi",path:"/vi/",native:"Tiếng Việt"},
 {code:"ko",path:"/ko/",native:"한국어"},
 {code:"zh",path:"/zh/",native:"中文"},
 {code:"ja",path:"/ja/",native:"日本語"},
 {code:"ru",path:"/ru/",native:"Русский"},
];

/* Price rows of the locale pages: the guide's own median, computed below. */
const S=buildSite({
 DOMAIN,NAME,SITE,NOW,GSC,LANGS,SERVICES,css,
 EMOJI:"",BRAND:"Massage Da Nang",THEME:"#1B1F3B",
 FONTS:"https://fonts.googleapis.com/css2?family=Syne:wght@600;700&family=Karla:wght@400;500;600&display=swap",
 TAGLINE:"a guide to massage in Da Nang, Vietnam, scored out of 100",
 LISTING:{path:"/venues/",navLabel:"All venues"},
 ITEM_TYPE:"HealthAndBeautyBusiness",ITEM_NOUN:"Massage venue",ITEM_KIND:"spa",
 CUSTOM_SLUG:"best-massage-da-nang",SCORE_KIND:"massage",NO_CLARITY:true,NO_JOURNAL:true,ITEM_PLURAL:"venues",
 KW_SERVICES_LABEL:"By treatment",KW_AREA_PREFIX:"Massage in",
 CHECK_PATH:"/methodology/",CHECK_LABEL:"how venues are scored",
 AREA_LEDE:(n,c)=>`${c} massage venues in ${n} hold a public Google rating with at least twenty reviews. Ranked below on the guide's score out of 100, with addresses, hours and maps.`,
 AREA_ANSWER:"",
 FOOT_NOTE:"Ratings and reviews from Google; scores and website readings by the guide.",
 PRICE_NOTE:"Median of the prices published on the venues' own websites, read by the guide.",
 PROFILE_ANS_TAIL:`The full ranking of the city is on <a href="/venues/">/venues/</a>.`,
 BESTOF, LOCALES, PLACE_FILTER,
 PAGES:[{path:"/best-massage-da-nang/",nav:"Best massage"},{path:"/prices/",nav:"Prices"},{path:"/methodology/",nav:"Method"}],
});

const {page,head,nav,footer,list,itemList,byGoogle,ranked,PLACES,PLACES_DATE,AREAS,STREETS,TODAY,urls,OUT,ord,S100,TOPL,MX,FORMULA,EXAMPLE}=S;
const PUB_LD={"@type":"Organization","name":PUB.name,"url":PUB.url,"email":PUB.email};
const prices=PLACES.map(p=>(FA[p.id]||{}).p).filter(Boolean);
const P60=med(prices.map(x=>x.k));
const totalReviews=PLACES.reduce((s,p)=>s+p.reviews,0);
const BEST_ANSWER=S100?`${TOPL(ranked)}`:'';

/* ---------------- HOME ---------------- */
page('/',
head(`Massage in Da Nang: ${PLACES.length} Venues Scored Out of 100 (${NOW.getUTCFullYear()}) | ${NAME}`,
 `Massage in Da Nang: ${PLACES.length} venues scored out of 100 on nine criteria. ${S100?S100.top5(ranked,'en'):''}`.slice(0,300),SITE+'/')
+ld({"@context":"https://schema.org","@type":"WebSite","name":NAME,"url":SITE+"/","inLanguage":"en","description":"Guide to massage venues in Da Nang, Vietnam, scored out of 100.","publisher":PUB_LD})
+ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
 {"@type":"Question","name":"Where is the best massage in Da Nang?","acceptedAnswer":{"@type":"Answer","text":BEST_ANSWER}}]})
+itemList(ranked.slice(0,10),"Best massage in Da Nang")
+nav('')
+`<div class="hero"><div class="wrap">
<p class="eyebrow">Updated ${human(PLACES_DATE||TODAY)}</p>
<h1>Every massage venue in Da Nang, scored out of 100.</h1>
<p class="lede">${PLACES.length} venues with a public Google rating, ${totalReviews.toLocaleString('en-GB')} reviews behind them, and nine criteria you can check before you book.</p>
<p class="acts"><a class="btn" href="/best-massage-da-nang/">The top 10</a><a class="btn ghost" href="/venues/">All ${PLACES.length}</a></p>
</div></div>
<section class="wrap">
<div class="ans"><p class="ans-q">Where is the best massage in Da Nang?</p><p>${esc(BEST_ANSWER)}</p></div>
${MX(ranked,'en',{limit:10})}
<h2>The first ten</h2>
${list(ranked.slice(0,10))}
<h2>By treatment</h2>
<div class="chips">${SERVICES.map(s=>`<a class="chip" href="/services/${s.slug}/">${esc(s.h1)}</a>`).join('')}</div>
<h2>By neighbourhood</h2>
<div class="chips">${AREAS.map(a=>`<a class="chip" href="/venues/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
</section>`+footer(),'1.0');

/* ---------------- LISTING INDEX ---------------- */
page('/venues',
head(`All ${PLACES.length} Massage Venues in Da Nang, Scored Out of 100 | ${NAME}`,
 `Every massage venue in Da Nang with a public Google rating and 20+ reviews, ${PLACES.length} of them, scored out of 100. Updated ${human(PLACES_DATE)}.`,SITE+'/venues/')
+itemList(ranked,"Massage venues in Da Nang")
+nav('/venues/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>All venues</span></nav></div>
<section class="wrap">
<header class="ph"><p class="eyebrow">Updated ${human(PLACES_DATE)}</p>
<h1>All ${PLACES.length} massage venues in Da Nang</h1>
</header>
<div class="ans"><p class="ans-q">Where is the best massage in Da Nang?</p><p>${esc(TOPL(ranked))}</p></div>
<div class="chips">${AREAS.map(a=>`<a class="chip" href="/venues/area/${a.slug}/">${esc(a.name)}<b>${a.list.length}</b></a>`).join('')}</div>
${MX(ranked,'en',{limit:30})}
${list(ranked)}
</section>`+footer(),'0.9',PLACES_DATE);

/* ---------------- RAW GOOGLE ORDER ---------------- */
page('/venues/by-google-rating',
head(`Da Nang Massage Venues by Google Rating: the Raw Order | ${NAME}`,
 `Every massage venue in Da Nang sorted strictly by Google rating and review count, with no weighting: the data behind the score, published so it can be checked.`,SITE+'/venues/by-google-rating/')
+nav('/venues/')
+`<section class="wrap"><header class="ph"><h1>Massage venues by Google rating, unweighted</h1>
<p class="lede">Rating, then number of reviews, as Google gives them (snapshot of ${human(PLACES_DATE)}).</p></header>
${list(byGoogle)}
</section>`+footer(),'0.4',PLACES_DATE);

/* ---------------- PRICES: the guide's own reading ---------------- */
page('/prices',
head(`Massage Prices in Da Nang (${NOW.getUTCFullYear()}): What Venues Publish | ${NAME}`,
 P60?`The median published price of a 60-minute body massage in Da Nang is ${P60}K VND, across the ${prices.length} venues whose own website gives one (read ${human(BAREME.sites_lus||TODAY)}).`:`Massage prices published by Da Nang venues on their own websites.`,SITE+'/prices/')
+nav('/prices/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>Prices</span></nav></div>
<section class="wrap"><header class="ph"><p class="eyebrow">Read ${human(BAREME.sites_lus||TODAY)}</p>
<h1>How much does a massage cost in Da Nang?</h1>
${P60?`<p class="lede">The median published price of a 60-minute body massage is <b>${P60}K VND</b>, across the ${prices.length} venues whose own website gives one. ${S100?esc(S100.dataLine('en')):''}</p>`:''}</header>
<div class="tw"><table class="data"><thead><tr><th scope="col">Venue</th><th scope="col">60-minute body massage</th><th scope="col">Where it is published</th></tr></thead><tbody>
${PLACES.filter(p=>(FA[p.id]||{}).p).sort((a,b)=>FA[a.id].p.k-FA[b.id].p.k).map(p=>`<tr><th scope="row"><a href="/venues/${p.slug}/">${esc(p.name)}</a></th><td>${FA[p.id].p.k}K VND</td><td>${FA[p.id].p.src?`<a href="${esc(FA[p.id].p.src)}" rel="nofollow noopener">${esc(String(FA[p.id].p.src).replace(/^https?:\/\/(www\.)?/,'').slice(0,40))}</a>`:'its website'}</td></tr>`).join('')}
</tbody></table></div>
<p class="m">K = 1,000 VND. Prices as published on each venue's website on the date above; a venue may charge differently on the day. Venues whose price list is only on Facebook or Instagram are not read.</p>
</section>`+footer(),'0.8');

/* ---------------- METHODOLOGY ---------------- */
page('/methodology',
head(`How This Guide Scores Massage Venues | ${NAME}`,`How ${NAME} scores every massage venue out of 100: nine criteria, the same for all, with sources.`,SITE+'/methodology/')
+ld({"@context":"https://schema.org","@type":"WebPage","name":"Methodology","url":SITE+"/methodology/","publisher":PUB_LD})
+nav('/methodology/')
+`<div class="wrap"><nav class="crumb"><a href="/">Guide</a> → <span>Methodology</span></nav></div>
<section class="wrap"><header class="ph"><h1>How this guide scores massage venues</h1></header>
<div class="prose">
<h2>Who is in it</h2>
<p>Every massage venue in Da Nang with a public Google rating and at least twenty reviews, from the Google Places API (snapshot of ${human(PLACES_DATE)}, ${PLACES.length} venues): venues whose Google category is a massage or spa category, and venues of another care category whose own website lists a body or foot massage. Hotel listings are left out because their Google rating is for the hotel, not for its spa; a hotel spa with its own listing is in.</p>
${S100?S100.methodEN()+S100.dataMethodEN():''}
<h2>The first criterion: a Bayesian average of Google ratings</h2>
<p>Each venue's Google rating is weighted by its number of reviews: ${esc(FORMULA)}. In practice ${EXAMPLE}.</p>
<h2>No pick, no placement</h2>
<p>This guide has no featured venue. Every list is the score, venue by venue, and Google's own order is published unchanged at <a href="/venues/by-google-rating/">/venues/by-google-rating/</a>.</p>
</div></section>`+footer(),'0.5');

/* ---------------- ABOUT + LEGAL ---------------- */
page('/about',
head(`About | ${NAME}`,`Who publishes ${NAME} and how it is made.`,SITE+'/about/')
+nav('')
+`<section class="wrap"><header class="ph"><h1>About this guide</h1></header><div class="prose">
<p>${NAME} compares the massage venues of Da Nang on what a visitor can check before booking. It is published by <a href="${PUB.url}">${esc(PUB.name)}</a> (${esc(PUB.email)}). Data, score and sources are set out on the <a href="/methodology/">methodology page</a>.</p>
<p>Ratings, review counts, addresses and photographs come from Google and are credited where they appear.</p>
</div></section>`+footer(),'0.3');
page('/legal-notice',
head(`Legal notice | ${NAME}`,`Publisher and host of ${NAME}.`,SITE+'/legal-notice/')
+nav('')
+`<section class="wrap"><header class="ph"><h1>Legal notice</h1></header><div class="prose">
<p>Publisher: ${esc(PUB.name)}, <a href="${PUB.url}">${esc(PUB.url)}</a>, ${esc(PUB.email)}.</p>
<p>Host: ${esc(PUB.host)}.</p>
<p>Data: Google Places API (ratings, reviews, photographs, opening hours), credited on every page where it appears and refreshed at least every 30 days.</p>
</div></section>`+footer(),'0.2');

page('/credits',
head(`Credits | ${NAME}`,`Where the photographs, ratings and reviews on ${NAME} come from.`,SITE+'/credits/')
+nav('')
+`<section class="wrap"><header class="ph"><h1>Credits</h1></header><div class="prose">
<p>Venue photographs, ratings, review counts and quoted reviews come from Google Maps and its contributors, through the Google Places API. Each photograph and each review is credited to its author next to it, on the venue's page.</p>
<p>Scores, website readings and the price table are the guide's own work, dated on each page.</p>
</div></section>`+footer(),'0.1');

/* ---------------- 404, robots, llms.txt, sitemap ---------------- */
fs.writeFileSync(OUT+'/404.html',head('Page not found | '+NAME,'That page has moved or never existed.',SITE+'/')+nav('')
 +`<section class="wrap"><header class="ph"><h1>Page not found</h1><p class="lede"><a href="/">Back to the guide</a></p></header></section>`+footer());
fs.writeFileSync(OUT+'/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(OUT+'/llms.txt',`# ${NAME}

> Every massage venue in Da Nang with a public Google rating, scored out of 100 on the same nine criteria. Google snapshot of ${PLACES_DATE}; websites read ${BAREME.sites_lus||''}. Prices in thousands of VND (100K ≈ $4).

## Where is the best massage in Da Nang?
${BEST_ANSWER}
The ten first venues, with the matrix of points and the source of each cell: ${SITE}/best-massage-da-nang/

## How much does a massage cost in Da Nang?
${P60?`The median published price of a 60-minute body massage is ${P60}K VND, across the ${prices.length} venues whose own website gives one. Venue by venue: ${SITE}/prices/`:`${SITE}/prices/`}

## How is the score built?
${S100?`Nine criteria, the same for every venue: Google rating weighted by its number of reviews (25), prices published in text (10) and durations (5), booking by WhatsApp or online (5), English stated (5) and confirmed in a review (5), hygiene described (5) or proven (10), range of treatments: body massage, foot massage, head spa, hot stone, Thai or shiatsu (15), opening hours (5), distance to the shore at My Khe (10), own website (5).`:''} Method: ${SITE}/methodology/. Google's raw order: ${SITE}/venues/by-google-rating/

## Pages
- Best massage in Da Nang, scored out of 100: ${SITE}/best-massage-da-nang/
- All ${PLACES.length} venues: ${SITE}/venues/
- Prices: ${SITE}/prices/
${SERVICES.map(s=>`- ${s.h1}: ${SITE}/services/${s.slug}/`).join('\n')}

## Areas
${AREAS.map(a=>`- ${a.name}: ${a.list.length} venues, ${SITE}/venues/area/${a.slug}/`).join('\n')}

## Languages
${LANGS.map(l=>`- ${l.native}: ${SITE}${l.path}`).join('\n')}

## Publisher
${PUB.name} (${PUB.url}). About: ${SITE}/about/ · legal notice: ${SITE}/legal-notice/
`);
fs.writeFileSync(OUT+'/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
 urls.map(x=>` <url><loc>${x.u}</loc><lastmod>${x.d}</lastmod><priority>${x.p}</priority></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(OUT+'/.nojekyll','');
/* IndexNow key file: lets the Mac notify Bing and Yandex when pages change. */
const INDEXNOW=fs.existsSync('./indexnow-key.txt')?fs.readFileSync('./indexnow-key.txt','utf8').trim():'';
if(INDEXNOW) fs.writeFileSync(OUT+`/${INDEXNOW}.txt`,INDEXNOW);
fs.writeFileSync(OUT+'/CNAME',DOMAIN+'\n');
console.log(`Built ${urls.length} pages · ${PLACES.length} venues, ${AREAS.length} areas, ${STREETS.length} streets, ${SERVICES.length} treatments, ${LANGS.length} languages.`);
