// ─────────────────────────────────────────────────────────────────────────────
// ANITA BISTROT — configurazione globale del sito (unica fonte di verità)
// Modifica qui contatti, link e SEO; poi rigenera con:  npm run build
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: "Anita Bistrot",
  tagline: "piccolo bistrot, grandi emozioni",
  // URL pubblico definitivo (usato in canonical + JSON-LD). Cambialo al deploy.
  url: "https://www.anitabistrot.it",

  // ── CONTATTI ────────────────────────────────────────────────────────────────
  // Chiamate: fisso del locale. WhatsApp: cellulare (numero diverso).
  phoneDisplay: "081 015 5330",
  phoneDial: "+390810155330",       // usato in tel: (fisso, per le chiamate)
  whatsapp: "393347727526",         // usato in wa.me/  (cellulare, solo cifre, no + né spazi)

  // ── CONSEGNA A DOMICILIO (ordine + carrello) ──────────────────────────────
  // Gli ordini arrivano su WhatsApp (stesso numero "whatsapp" qui sopra).
  // Importi in centesimi: 1500 = € 15,00. Metti 0 per disattivare una voce.
  order: {
    minCents: 1500,        // ordine minimo (0 = nessun minimo)   ⚠️ owner conferma
    feeCents: 250,         // costo consegna (0 = gratis sempre)   ⚠️ owner conferma
    freeOverCents: 3000,   // consegna gratis oltre questa soglia (null = disattiva) ⚠️ owner conferma
    zoneNote: "Consegniamo a Pomigliano d'Arco e zone limitrofe. Fuori zona, scrivici su WhatsApp.",
  },

  whatsappText:
    "Ciao Anita! Vorrei prenotare un tavolo. Persone: __ · Giorno: __ · Ora: __ · Nome: __. Grazie!",

  // ── AVVISO TEMPORANEO (es. ferie) ────────────────────────────────────────────
  // Fascia in cima a tutte le pagine. Per SPEGNERLA: metti active: false.
  // Dopo la data "until" sparisce da sola (e la pill torna normale).
  notice: {
    active: true,
    text: "🌴 Siamo in ferie fino al 30 agosto — torniamo ancora più forti il 1° settembre!",
    until: "2026-08-30",                       // ultimo giorno di ferie (AAAA-MM-GG)
    pillText: "In ferie · torniamo il 1° settembre",
  },

  address: {
    street: "Via Passariello 60",   // ⚠️ VERIFICA: 60 (Google) vs 64 (TripAdvisor)
    locality: "Pomigliano d'Arco",
    region: "NA",
    postalCode: "80038",
    country: "IT",
  },
  geo: { lat: 40.9095, lng: 14.3970 }, // ⚠️ VERIFICA il pin esatto sulla mappa

  // ── LINK ESTERNI ────────────────────────────────────────────────────────────
  delivery: {
    glovo: "https://glovoapp.com/it/it/napoli/anita-bistrot-nap",
    alfonsino:
      "https://app.alfonsino.delivery/pomigliano-d-arco/order/menu/anita-bistrot",
  },
  social: {
    instagram: "https://www.instagram.com/anita_bistrot_/",
    facebook: "https://www.facebook.com/anitabistro/",
    tiktok: "https://www.tiktok.com/@anita.bistrot",
  },
  // Slot recensioni Google — incolla qui il link "scrivi recensione" del profilo GBP.
  googleReviewUrl: "",

  // ── ANALYTICS ───────────────────────────────────────────────────────────────
  // Lascia vuoto per non caricare nulla. Metti il tuo ID GA4 (es. "G-XXXXXXX")
  // per attivare gtag caricato in modo asincrono e non bloccante.
  ga4Id: "",

  // ── SEO per pagina ──────────────────────────────────────────────────────────
  pages: {
    home: {
      path: "index.html",
      title:
        "Anita Bistrot Pomigliano d'Arco | Colazione, Aperitivo, Cena & Cocktail",
      desc:
        "Piccolo bistrot, grandi emozioni. Colazione, brunch, pranzo, aperitivo e cocktail a Pomigliano d'Arco. Prenota un tavolo su WhatsApp.",
    },
    menu: {
      path: "menu.html",
      title: "Menu | Anita Bistrot Pomigliano d'Arco",
      desc:
        "Il menu completo di Anita Bistrot: colazione, brunch, sfizi, aperitivo, primi e secondi, cocktail signature, vini e distillati.",
    },
    about: {
      path: "chi-siamo.html",
      title: "Chi siamo | Anita Bistrot",
      desc:
        "La storia di Anita Bistrot a Pomigliano d'Arco: cucina fatta in casa, aperitivi curati, serate con musica live.",
    },
    contact: {
      path: "contatti.html",
      title: "Contatti e orari | Anita Bistrot Pomigliano d'Arco",
      desc:
        "Dove siamo, orari, telefono e WhatsApp di Anita Bistrot. Via Passariello 60, Pomigliano d'Arco (NA).",
    },
    crostiera: {
      path: "crostiera.html",
      title: "Crostiera a Pomigliano d'Arco | Anita Bistrot — rivenditore ufficiale",
      desc:
        "Da Anita Bistrot gusti Crostiera, la crostata al limone della tradizione napoletana con veri Limoni di Sorrento. A fetta ogni giorno (€ 6) o intera su prenotazione (€ 38).",
    },
  },

  // ── CROSTIERA (Anita è rivenditore ufficiale) ───────────────────────────────────
  crostiera: {
    site: "https://crostiera.it",
    instagram: "https://www.instagram.com/crostiera/",
    fettaCents: 600,
    interaCents: 3800,
    prenotaText:
      "Ciao Anita! Vorrei prenotare una Crostiera intera (€ 38,00). Per quando: __ . Grazie!",
  },
};
