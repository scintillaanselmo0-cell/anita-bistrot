// ═══════════════════════════════════════════════════════════════════════════
//  ANITA BISTROT — generatore sito statico
//  Uso:  npm run build   →  genera /dist con 4 pagine HTML statiche + asset.
//  Nessun framework a runtime. L'output funziona anche con JS disattivato.
// ═══════════════════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { site } from "./src/data/site.js";
import { hours } from "./src/data/hours.js";
import { menu } from "./src/data/menu.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, "src");
const OUT = join(__dirname, "dist");

// ── Helpers ──────────────────────────────────────────────────────────────────
const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const money = (n) => "€\u00A0" + Number(n).toFixed(2).replace(".", ",");
const priceOf = (item) => (item.priceFrom ? "da " : "") + money(item.price);
const centsOf = (item) => Math.round(Number(item.price) * 100);

// Cosa è ordinabile a domicilio. item.deliverable (true/false) ha sempre priorità.
// Default: cibo/soft/dessert = sì; alcolici = no. Casi misti gestiti per gruppo.
function deliverableOf(item, sectionId, groupTitle) {
  if (typeof item.deliverable === "boolean") return item.deliverable;
  if (item.available === false || item.priceFrom) return false;
  const g = (groupTitle || "").toLowerCase();
  if (sectionId === "cocktail") return g.includes("analcolic");
  if (sectionId === "vini" || sectionId === "distillati") return false;
  if (sectionId === "soft-birre") return !/birr|beer/.test(g);
  return true; // colazione, brunch, caffetteria, ristorante
}

// id univoco e stabile per ogni voce ordinabile (usato dal carrello)
const _idSeen = new Map();
function buyId(name) {
  const base =
    "d-" +
    String(name)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
  const n = (_idSeen.get(base) || 0) + 1;
  _idSeen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}
function buyControl(item, sectionId, groupTitle, compact) {
  if (!deliverableOf(item, sectionId, groupTitle)) return "";
  const attrs = `data-id="${buyId(item.name)}" data-name="${esc(item.name)}" data-price="${centsOf(item)}"`;
  return `<div class="buy${compact ? " buy--sm" : ""}" ${attrs}></div>`;
}

const waHref = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappText)}`;
const telHref = `tel:${site.phoneDial}`;
const addrLine = `${site.address.street}, ${site.address.postalCode} ${site.address.locality} (${site.address.region})`;
const mapQuery = encodeURIComponent(`${site.name} ${site.address.street} ${site.address.locality}`);
const mapsEmbed = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

// ── Icone inline (currentColor) ──────────────────────────────────────────────
const I = {
  leaf: `<svg class="leaf" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 3s-9-1-14 4C1 12 3 20 3 20s1-6 5-10c3-3 8-4 8-4s-5 2-8 6c-2 2.5-3 6-3 6s7 1 12-4c4-4 3-11 3-11z"/></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.3 1z"/></svg>`,
  wa: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.6 14.1c-.2.6-1.2 1.2-1.7 1.2-.4 0-1 .1-3.2-.9-2.7-1.1-4.4-3.9-4.5-4.1-.1-.2-1-1.4-1-2.6s.6-1.8.9-2.1c.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2 .9.6 1.3.8 1.6.9.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.7.8c.5.2.5.5.5.7z"/></svg>`,
  ig: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.9-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.1 15.6 2.1 15.2 2.1 12s0-3.6.1-4.9C2.3 3.9 3.9 2.3 7.1 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.1A6.7 6.7 0 1 0 18.7 12 6.7 6.7 0 0 0 12 5.3zm0 11A4.3 4.3 0 1 1 16.3 12 4.3 4.3 0 0 1 12 16.3zm6.9-11.3a1.6 1.6 0 1 1-1.6-1.6 1.6 1.6 0 0 1 1.6 1.6z"/></svg>`,
  fb: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>`,
  tt: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 3c.3 2.1 1.5 3.6 3.5 3.9v2.4c-1.3.1-2.5-.3-3.6-1v6.1c0 3.6-2.9 5.9-5.9 5.6-3-.2-4.9-2.6-4.7-5.4.2-2.7 2.5-4.6 5.2-4.4v2.5c-.4-.1-.8-.1-1.2 0-1.2.3-2 1.3-1.8 2.5.2 1.1 1.2 1.8 2.4 1.6 1.1-.2 1.8-1.1 1.8-2.3V3h2.6z"/></svg>`,
  coffee: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M17 9h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M7 3v2M11 3v2"/></svg>`,
  glass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16l-7 8v6"/><path d="M9 18h6"/><path d="M6.5 7h11"/></svg>`,
  plate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/></svg>`,
  music: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l10-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`,
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>`,
  menuIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
};
const badgeLabels = { novita: "Novità", special: "Special", piccante: "Piccante", veg: "Veg" };

// ── Partials ─────────────────────────────────────────────────────────────────
function head(page, { jsonld = "" } = {}) {
  const p = site.pages[page];
  const canonical = `${site.url}/${p.path === "index.html" ? "" : p.path}`;
  const ga = site.ga4Id
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${site.ga4Id}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${site.ga4Id}');</script>`
    : "";
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="restaurant">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:locale" content="it_IT">
<meta name="theme-color" content="#5D2A6E">
<link rel="preload" href="./assets/fonts/fraunces-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="./assets/fonts/dmsans-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="./styles.css">
${jsonld ? `<script type="application/ld+json">${jsonld}</script>` : ""}
${ga}
</head>
<body>`;
}

function header(active) {
  const link = (href, label, key) =>
    `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`;
  return `<header class="site-header">
  <div class="wrap nav">
    <a class="nav__brand" href="index.html" aria-label="Anita Bistrot — home">
      <img src="./assets/logo-mark.png" width="40" height="34" alt="Anita — piccolo bistrot, grandi emozioni">
    </a>
    <nav class="nav__links" aria-label="Principale">
      ${link("index.html", "Home", "home")}
      ${link("menu.html", "Menu", "menu")}
      ${link("chi-siamo.html", "Chi siamo", "about")}
      ${link("contatti.html", "Contatti", "contact")}
    </nav>
    <a class="btn btn-primary nav__cta" href="${waHref}" target="_blank" rel="noopener">${I.wa} Prenota</a>
    <details class="nav__menu">
      <summary aria-label="Apri il menu di navigazione">${I.menuIcon}</summary>
      <div class="sheet">
        <a href="index.html">Home</a>
        <a href="menu.html">Menu</a>
        <a href="chi-siamo.html">Chi siamo</a>
        <a href="contatti.html">Contatti</a>
      </div>
    </details>
  </div>
</header>`;
}

function footer() {
  const s = site.social;
  const review = site.googleReviewUrl
    ? `<a href="${esc(site.googleReviewUrl)}" target="_blank" rel="noopener">Lasciaci una recensione su Google</a>`
    : `<a href="${directionsHref}" target="_blank" rel="noopener">Trovaci su Google Maps</a>`;
  return `<footer class="site-footer footer">
  <div class="wrap footer__grid">
    <div>
      <img src="./assets/logo-light.png" width="86" height="80" alt="Anita Bistrot" style="margin-bottom:14px">
      <p style="max-width:34ch;color:rgba(246,239,214,.8)">Piccolo bistrot, grandi emozioni. Colazione, aperitivo, cena e cocktail nel cuore di Pomigliano d'Arco.</p>
      <div class="footer__social" style="margin-top:18px">
        <a href="${s.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${I.ig}</a>
        <a href="${s.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb}</a>
        <a href="${s.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${I.tt}</a>
      </div>
    </div>
    <div>
      <h4>Naviga</h4>
      <div class="footer__links">
        <a href="menu.html">Menu</a>
        <a href="chi-siamo.html">Chi siamo</a>
        <a href="contatti.html">Contatti e orari</a>
        <a href="${site.delivery.glovo}" target="_blank" rel="noopener">Ordina su Glovo</a>
        <a href="${site.delivery.alfonsino}" target="_blank" rel="noopener">Ordina su Alfonsino</a>
      </div>
    </div>
    <div>
      <h4>Dove siamo</h4>
      <div class="footer__links">
        <a href="${directionsHref}" target="_blank" rel="noopener">${esc(addrLine)}</a>
        <a href="${telHref}">${esc(site.phoneDisplay)}</a>
        <a href="${waHref}" target="_blank" rel="noopener">Prenota su WhatsApp</a>
        ${review}
      </div>
    </div>
  </div>
  <div class="wrap footer__meta">
    <span>© ${new Date().getFullYear()} Anita Bistrot · P.IVA <span title="Inserire la partita IVA">—</span></span>
    <span>Via Passariello 60 · Pomigliano d'Arco (NA)</span>
  </div>
</footer>`;
}

function bottomBar() {
  return `<nav class="bottombar" aria-label="Azioni rapide">
  <a class="btn btn-outline" style="border-color:rgba(246,239,214,.5)" href="${telHref}">${I.phone} Chiama</a>
  <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} Prenota su WhatsApp</a>
</nav>`;
}

function hoursJsonBlob() {
  return `<script type="application/json" id="anita-hours">${JSON.stringify({
    timezone: hours.timezone,
    dayNames: hours.dayNames,
    schedule: hours.schedule,
  })}</script>`;
}

function orderJsonBlob() {
  const d = site.order || {};
  return `<script type="application/json" id="anita-order">${JSON.stringify({
    whatsapp: site.whatsapp,
    minCents: d.minCents || 0,
    feeCents: d.feeCents || 0,
    freeOverCents: d.freeOverCents ?? null,
    zoneNote: d.zoneNote || "",
  })}</script>`;
}

function scripts() {
  return `${hoursJsonBlob()}\n${orderJsonBlob()}\n<script src="./app.js" defer></script>`;
}

// ── JSON-LD Restaurant ───────────────────────────────────────────────────────
function restaurantJsonLd() {
  const dayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const spec = [];
  Object.keys(hours.schedule).forEach((d) => {
    hours.schedule[d].forEach((w) => {
      spec.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: `https://schema.org/${dayName[d]}`,
        opens: w.open,
        closes: w.close === "24:00" ? "00:00" : w.close,
      });
    });
  });
  const data = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: site.name,
    url: site.url,
    telephone: site.phoneDial,
    priceRange: "€€",
    servesCuisine: ["Italiana", "Bistrot", "Cocktail bar"],
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMenu: `${site.url}/menu.html`,
    acceptsReservations: true,
    sameAs: [site.social.instagram, site.social.facebook, site.social.tiktok],
    openingHoursSpecification: spec,
  };
  return JSON.stringify(data);
}

// ── Rendering menu ───────────────────────────────────────────────────────────
function badges(tags = []) {
  return tags
    .filter((t) => badgeLabels[t])
    .map((t) => `<span class="badge badge--${t}">${badgeLabels[t]}</span>`)
    .join("");
}
function allergenLine(a = []) {
  if (!a.length) return "";
  return `<div class="mitem__alg">${a.map((x) => x.toUpperCase()).join(" · ")}</div>`;
}
function itemRow(item, ctx = {}) {
  if (item.available === false) return "";
  return `<div class="mitem">
    <div class="mitem__body">
      <div class="mitem__name">${esc(item.name)}${badges(item.tags)}</div>
      ${item.desc ? `<div class="mitem__desc">${esc(item.desc)}</div>` : ""}
      ${allergenLine(item.allergens)}
    </div>
    <div class="mitem__side">
      <div class="mitem__price">${priceOf(item)}</div>
      ${buyControl(item, ctx.sectionId, ctx.groupTitle, false)}
    </div>
  </div>`;
}
function compactRow(item, ctx = {}) {
  if (item.available === false) return "";
  const buy = buyControl(item, ctx.sectionId, ctx.groupTitle, true);
  return `<div class="row"><span class="nm">${esc(item.name)}${badges(item.tags)}</span><span class="pr">${priceOf(item)}${buy}</span></div>`;
}
function groupHtml(g, sectionId) {
  const note = g.note ? `<p class="mgroup__note">${esc(g.note)}</p>` : "";
  const ctx = { sectionId, groupTitle: g.title };
  if (g.compact) {
    return `<div class="mgroup">
      <h3 class="mgroup__title">${esc(g.title)}</h3>${note}
      <div class="mcompact">${g.items.map((i) => compactRow(i, ctx)).join("")}</div>
    </div>`;
  }
  return `<div class="mgroup">
    <h3 class="mgroup__title">${esc(g.title)}</h3>${note}
    ${g.items.map((i) => itemRow(i, ctx)).join("")}
  </div>`;
}
function sectionHtml(sec) {
  return `<section id="${sec.id}" class="msec msec--${sec.theme}">
    <div class="wrap">
      <div class="msec__title">${I.leaf}<h2>${esc(sec.title)}</h2></div>
      <div class="msec__rule"></div>
      ${sec.groups.map((g) => groupHtml(g, sec.id)).join("")}
    </div>
  </section>`;
}

// ── Pagina: HOME ─────────────────────────────────────────────────────────────
function pageHome() {
  const heroLeaves = `<div class="hero__deco" aria-hidden="true">
    <span style="top:-10px;right:-6px;transform:rotate(20deg)">${bigLeaf(150)}</span>
    <span style="bottom:-24px;left:-20px;transform:rotate(-140deg)">${bigLeaf(180)}</span>
  </div>`;

  const tile = (icon, title, desc, href) =>
    `<a class="tile" href="${href}"><span class="ic">${icon}</span><h3>${title}</h3><p>${desc}</p></a>`;

  const fav = (kicker, name, desc, price, href) =>
    `<a class="fav" href="${href}">
      <span class="leafcorner">${bigLeaf(84)}</span>
      <span class="kicker">${kicker}</span>
      <h3>${name}</h3><p>${desc}</p><span class="price">${price}</span>
    </a>`;

  return head("home", { jsonld: restaurantJsonLd() }) +
    header("home") +
    `<main>
    <section class="hero">
      ${heroLeaves}
      <div class="wrap hero__grid">
        <div>
          <span class="livepill" data-livepill><span class="dot" aria-hidden="true"></span><span>Vedi orari di apertura</span></span>
          <h1 class="hero__brand"><img src="./assets/logo-light.png" width="300" height="280" alt="Anita — piccolo bistrot, grandi emozioni" fetchpriority="high"></h1>
          <p class="hero__hook">Colazione, aperitivo, cena e cocktail nel cuore di Pomigliano d'Arco.</p>
          <div class="hero__cta">
            <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} Prenota un tavolo</a>
            <a class="btn btn-outline" href="menu.html">Guarda il menu</a>
          </div>
        </div>
        <div class="hero__art" aria-hidden="true">
          <span class="m-leaf" style="top:-14px;left:-14px;transform:rotate(25deg)">${bigLeaf(120)}</span>
          <span class="m-leaf" style="bottom:-20px;right:-16px;transform:rotate(-150deg)">${bigLeaf(150)}</span>
          <img class="m-heart" src="./assets/heart.png" width="300" height="268" alt="">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap">
        <div class="section__head"><span class="eyebrow">${I.leaf} Dalla mattina a notte fonda</span><h2>Ogni momento ha il suo sapore</h2></div>
        <div class="tiles">
          ${tile(I.coffee, "Colazione", "Cornetti caldi e signature coffee", "menu.html#colazione")}
          ${tile(I.glass, "Aperitivo", "Apericena e cocktail curati", "menu.html#cocktail")}
          ${tile(I.plate, "Pranzo & Cena", "Cucina fatta in casa", "menu.html#ristorante")}
          ${tile(I.music, "Eventi & musica live", "Il weekend prende vita", "#eventi")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="section__head"><span class="eyebrow">${I.leaf} I preferiti di Anita</span><h2>Da non perdere</h2></div>
        <div class="favs">
          ${fav("Sfizi", "Tagliere Anita", "Consigliato per due — il nostro classico da condividere.", money(25), "menu.html#ristorante")}
          ${fav("Signature cocktail", "Il tributo di Anita", "Gin Tribute, Mezcal Tribute, tonic lemonade & oliva.", money(12), "menu.html#cocktail")}
          ${fav("Brunch", "Avocado toast", "Avocado, salmone affumicato e uovo in camicia.", money(8), "menu.html#brunch")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0" id="eventi">
      <div class="wrap">
        <div class="band band--eventi">
          <span class="leafcorner">${bigLeaf(120)}</span>
          <h2>Serate & musica live</h2>
          <p>Dal venerdì sera in poi, Anita si accende: aperitivi curati, cocktail signature e musica dal vivo. Il posto giusto per una serata tra amici, un compleanno o un dopocena diverso.</p>
          <div class="btnrow">
            <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} Prenota la tua serata</a>
            <a class="btn btn-outline" href="menu.html#cocktail">Scopri i cocktail</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="band band--delivery">
          <span class="leafcorner">${bigLeaf(120)}</span>
          <h2>Anita a casa tua</h2>
          <p>Ordina online e ricevi i tuoi piatti preferiti direttamente a casa.</p>
          <div class="btnrow">
            <a class="btn btn-primary" href="${site.delivery.glovo}" target="_blank" rel="noopener">Ordina su Glovo</a>
            <a class="btn btn-outline" href="${site.delivery.alfonsino}" target="_blank" rel="noopener">Ordina su Alfonsino</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="section__head"><span class="eyebrow">${I.pin} Dove trovarci</span><h2>Nel cuore di Pomigliano</h2></div>
        <div class="localinfo">
          <div class="map"><iframe title="Mappa Anita Bistrot" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapsEmbed}"></iframe></div>
          <div class="infocard stack-gap">
            <div>
              <h3>${esc(site.name)}</h3>
              <address>${esc(addrLine)}</address>
              <span class="livepill is-closed" data-livepill style="background:rgba(93,42,110,.08);border-color:rgba(93,42,110,.2);color:var(--purple)"><span class="dot"></span><span>Vedi orari</span></span>
            </div>
            <div class="contact-actions">
              <a class="btn btn-purple" href="${telHref}">${I.phone} Chiama</a>
              <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} WhatsApp</a>
              <a class="btn btn-outline-ink" href="${directionsHref}" target="_blank" rel="noopener">${I.pin} Come raggiungerci</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>` +
    footer() + bottomBar() + scripts() + "\n</body></html>";
}

// ── Pagina: MENU ─────────────────────────────────────────────────────────────
function pageMenu() {
  const tabs = menu.sections
    .map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`)
    .join("");
  const legend = Object.keys(menu.legend)
    .map((k) => `<span><b>${k.toUpperCase()}</b> ${esc(menu.legend[k])}</span>`)
    .join("");

  return head("menu", { jsonld: restaurantJsonLd() }) +
    header("menu") +
    `<main>
    <section class="menu-hero">
      <div class="wrap">
        <span class="eyebrow" style="color:var(--lime)">${I.leaf} Il nostro menu</span>
        <h1>Menu</h1>
        <p>Colazione, brunch, sfizi, cocktail signature, vini e distillati. I prezzi sono in euro.</p>
      </div>
    </section>

    <div class="menutabs">
      <div class="menutabs__scroll">${tabs}</div>
    </div>

    <div class="wrap">
      <div class="allergen-note">
        <div class="legend">${legend}</div>
        <p class="disc">${esc(menu.disclaimer)}</p>
      </div>
    </div>

    ${menu.sections.map(sectionHtml).join("")}

    <div class="wrap" style="padding-block:36px">
      <div class="band band--eventi">
        <span class="leafcorner">${bigLeaf(120)}</span>
        <h2>Ti aspettiamo da Anita</h2>
        <p>Prenota un tavolo o ordina online — pensiamo noi al resto.</p>
        <div class="btnrow">
          <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} Prenota un tavolo</a>
          <a class="btn btn-outline" href="${site.delivery.glovo}" target="_blank" rel="noopener">Ordina su Glovo</a>
        </div>
      </div>
    </div>
  </main>` +
    footer() + bottomBar() + scripts() + "\n</body></html>";
}

// ── Pagina: CHI SIAMO ────────────────────────────────────────────────────────
function pageAbout() {
  const diff = (icon, title, desc) =>
    `<div class="diff"><span class="ic">${icon}</span><h3>${title}</h3><p>${desc}</p></div>`;
  return head("about") +
    header("about") +
    `<main>
    <section class="about-hero">
      <div class="wrap">
        <span class="eyebrow" style="color:var(--lime)">${I.leaf} La nostra storia</span>
        <h1>Chi siamo</h1>
      </div>
    </section>

    <section class="section">
      <div class="wrap about-story">
        <p>Anita è un piccolo bistrot con una grande idea: farti stare bene dalla colazione fino a notte fonda. Cornetti caldi al mattino, un pranzo fatto in casa, aperitivi generosi e cocktail curati la sera.</p>
        <p>Ambiente accogliente, attenzione ai dettagli e prodotti scelti con cura: qui ogni momento della giornata ha il suo sapore. Piccolo bistrot, grandi emozioni.</p>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="section__head"><span class="eyebrow">${I.leaf} Cosa ci rende diversi</span></div>
        <div class="diffs">
          ${diff(I.clock, "Aperti tutto il giorno", "Dalla colazione all'ultimo drink.")}
          ${diff(I.plate, "Cucina fatta in casa", "Sfizi, primi e secondi preparati da noi.")}
          ${diff(I.music, "Serate & musica live", "Il weekend prende vita.")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="photos">
          <div class="ph"><span>Foto interni</span></div>
          <div class="ph"><span>Foto piatti</span></div>
          <div class="ph"><span>Foto cocktail</span></div>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="wrap">
        <div class="band band--delivery">
          <span class="leafcorner">${bigLeaf(120)}</span>
          <h2>Vieni a trovarci</h2>
          <p>Un tavolo, un aperitivo o una serata tra amici: siamo nel cuore di Pomigliano d'Arco.</p>
          <div class="btnrow">
            <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} Prenota un tavolo</a>
            <a class="btn btn-outline" href="contatti.html">Contatti e orari</a>
          </div>
        </div>
      </div>
    </section>
  </main>` +
    footer() + bottomBar() + scripts() + "\n</body></html>";
}

// ── Pagina: CONTATTI ─────────────────────────────────────────────────────────
function pageContact() {
  const rows = [1, 2, 3, 4, 5, 6, 0]
    .map((d) => {
      const wins = hours.schedule[d] || [];
      const txt = wins.length
        ? wins.map((w) => `${w.open}–${w.close === "24:00" ? "24:00" : w.close}`).join(" · ")
        : "Chiuso";
      return `<tr data-day="${d}"><th>${hours.dayNames[d]}</th><td>${txt}</td></tr>`;
    })
    .join("");

  return head("contact", { jsonld: restaurantJsonLd() }) +
    header("contact") +
    `<main>
    <section class="contact-hero">
      <div class="wrap">
        <span class="eyebrow" style="color:var(--lime)">${I.pin} Dove siamo</span>
        <h1>Contatti e orari</h1>
      </div>
    </section>

    <section class="section">
      <div class="wrap localinfo">
        <div class="map"><iframe title="Mappa Anita Bistrot" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${mapsEmbed}"></iframe></div>
        <div class="stack-gap">
          <div class="infocard">
            <h3>${esc(site.name)}</h3>
            <address>${esc(addrLine)}</address>
            <span class="livepill is-closed" data-livepill style="background:rgba(93,42,110,.08);border-color:rgba(93,42,110,.2);color:var(--purple)"><span class="dot"></span><span>Vedi orari</span></span>
            <div class="contact-actions" style="margin-top:16px">
              <a class="btn btn-purple" href="${telHref}">${I.phone} Chiama</a>
              <a class="btn btn-primary" href="${waHref}" target="_blank" rel="noopener">${I.wa} WhatsApp</a>
              <a class="btn btn-outline-ink" href="${directionsHref}" target="_blank" rel="noopener">${I.pin} Indicazioni</a>
            </div>
          </div>
          <div class="infocard">
            <h3>Orari di apertura</h3>
            <table class="hours-table"><tbody>${rows}</tbody></table>
            <p class="util" style="margin-top:12px">Tel. <a href="${telHref}" style="color:var(--purple);font-weight:600">${esc(site.phoneDisplay)}</a></p>
          </div>
          <div class="infocard">
            <h3>Seguici e ordina</h3>
            <div class="footer__social" style="margin-bottom:14px">
              <a href="${site.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram" style="border-color:rgba(93,42,110,.25);color:var(--purple)">${I.ig}</a>
              <a href="${site.social.facebook}" target="_blank" rel="noopener" aria-label="Facebook" style="border-color:rgba(93,42,110,.25);color:var(--purple)">${I.fb}</a>
              <a href="${site.social.tiktok}" target="_blank" rel="noopener" aria-label="TikTok" style="border-color:rgba(93,42,110,.25);color:var(--purple)">${I.tt}</a>
            </div>
            <div class="contact-actions">
              <a class="btn btn-outline-ink" href="${site.delivery.glovo}" target="_blank" rel="noopener">Ordina su Glovo</a>
              <a class="btn btn-outline-ink" href="${site.delivery.alfonsino}" target="_blank" rel="noopener">Ordina su Alfonsino</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>` +
    footer() + bottomBar() + scripts() + "\n</body></html>";
}

// ── Logo placeholder + foglia decorativa ─────────────────────────────────────
function bigLeaf(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 3s-9-1-14 4C1 12 3 20 3 20s1-6 5-10c3-3 8-4 8-4s-5 2-8 6c-2 2.5-3 6-3 6s7 1 12-4c4-4 3-11 3-11z"/></svg>`;
}
function logoSvg() {
  // ⚠️ PLACEHOLDER — sostituisci con il logo reale del cliente (PNG/SVG).
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 56" role="img" aria-label="Anita">
  <text x="0" y="40" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="600" fill="#F6EFD6" letter-spacing="1">Anita</text>
  <path transform="translate(150,6) scale(0.9)" fill="#8CC63F" d="M20 3s-9-1-14 4C1 12 3 20 3 20s1-6 5-10c3-3 8-4 8-4s-5 2-8 6c-2 2.5-3 6-3 6s7 1 12-4c4-4 3-11 3-11z"/>
</svg>`;
}

// ── Robots + sitemap ─────────────────────────────────────────────────────────
function robots() {
  return `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`;
}
function sitemap() {
  const urls = Object.values(site.pages).map((p) => {
    const loc = `${site.url}/${p.path === "index.html" ? "" : p.path}`;
    return `  <url><loc>${loc}</loc></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`;
}

// ── Build ────────────────────────────────────────────────────────────────────
function build() {
  if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  mkdirSync(join(OUT, "assets"), { recursive: true });

  // asset statici
  cpSync(join(SRC, "styles.css"), join(OUT, "styles.css"));
  cpSync(join(SRC, "app.js"), join(OUT, "app.js"));
  cpSync(join(SRC, "assets", "fonts"), join(OUT, "assets", "fonts"), { recursive: true });
  for (const f of ["logo-mark.png", "logo-light.png", "heart.png"]) {
    cpSync(join(SRC, "assets", f), join(OUT, "assets", f));
  }

  // pagine
  writeFileSync(join(OUT, "index.html"), pageHome());
  writeFileSync(join(OUT, "menu.html"), pageMenu());
  writeFileSync(join(OUT, "chi-siamo.html"), pageAbout());
  writeFileSync(join(OUT, "contatti.html"), pageContact());

  // seo
  writeFileSync(join(OUT, "robots.txt"), robots());
  writeFileSync(join(OUT, "sitemap.xml"), sitemap());

  // conteggio voci menu per log
  let itemCount = 0;
  menu.sections.forEach((s) => s.groups.forEach((g) => (itemCount += g.items.length)));
  console.log("✓ Build completata in /dist");
  console.log(`  4 pagine · ${menu.sections.length} sezioni menu · ${itemCount} voci · robots + sitemap`);
}

build();
