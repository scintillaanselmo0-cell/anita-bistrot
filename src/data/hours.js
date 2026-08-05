// ─────────────────────────────────────────────────────────────────────────────
// ANITA BISTROT — orari di apertura (unica fonte di verità)
// Guida sia la pill "Aperto ora" sul sito sia gli openingHoursSpecification
// dello schema JSON-LD. Timezone di riferimento: Europe/Rome.
//
// Formato: ogni giorno ha una lista di finestre [apertura, chiusura] in "HH:MM".
// Una chiusura oltre la mezzanotte si scrive col giorno dopo, es. "02:00"
// nel campo `overnight: true`, così la logica sa che sfora la mezzanotte.
// day: 0 = Domenica ... 6 = Sabato (come Date.getDay()).
// ─────────────────────────────────────────────────────────────────────────────

export const hours = {
  timezone: "Europe/Rome",
  // Nome dei giorni per la tabella orari
  dayNames: [
    "Domenica",
    "Lunedì",
    "Martedì",
    "Mercoledì",
    "Giovedì",
    "Venerdì",
    "Sabato",
  ],
  // Finestre per giorno. Ogni finestra: { open:"HH:MM", close:"HH:MM", overnight?:true }
  // overnight:true significa che `close` è nel giorno SUCCESSIVO (dopo mezzanotte).
  schedule: {
    1: [], // Lunedì — Chiuso
    2: [ // Martedì
      { open: "08:00", close: "17:00" },
    ],
    3: [ // Mercoledì
      { open: "08:00", close: "24:00" },
    ],
    4: [ // Giovedì
      { open: "08:00", close: "24:00" },
    ],
    5: [ // Venerdì
      { open: "08:00", close: "03:00", overnight: true },
    ],
    6: [ // Sabato
      { open: "08:00", close: "01:00", overnight: true },
    ],
    0: [ // Domenica
      { open: "18:30", close: "01:00", overnight: true },
    ],
  },
};
