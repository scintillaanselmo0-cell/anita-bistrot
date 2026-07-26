# Anita Bistrot — sito web

Sito statico, mobile-first, senza framework. Veloce anche su 4G debole e funzionante pure con JavaScript disattivato. Da un unico file dati si rigenera tutto il sito.

---

## Pubblicazione su GitHub Pages (automatica)

Il repository contiene un'automazione (`.github/workflows/deploy.yml`) che **ricostruisce e pubblica il sito ad ogni modifica**. Configurazione una tantum:

1. Crea il repository su GitHub e carica questi file (vedi sotto).
2. Su GitHub → **Settings** → **Pages** → in *"Build and deployment"* scegli **GitHub Actions** come sorgente.
3. Fai un push (o vai su **Actions** → esegui il workflow a mano la prima volta).
4. Dopo qualche minuto il sito è online.

Da lì in poi: ogni volta che modifichi e fai push, il sito si aggiorna da solo.

### Dominio personalizzato (anitabistrot.it)

- Su GitHub → **Settings** → **Pages** → **Custom domain** → inserisci `www.anitabistrot.it`.
- Dal pannello del tuo dominio (Aruba/registrar), imposta un record **CNAME** `www` → `TUO-UTENTE.github.io`.
- Il workflow tiene già il file `CNAME` nel sito pubblicato, così il collegamento non si perde ad ogni aggiornamento.
- Se **non** usi un dominio tuo, apri `.github/workflows/deploy.yml` ed elimina lo step *"Imposta dominio"*: il sito resterà su `TUO-UTENTE.github.io/anita-bistrot/`.

---

## Caricare i file su GitHub

**Da terminale** (dentro questa cartella):

```bash
git init
git add .
git commit -m "Primo commit: sito Anita Bistrot"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/anita-bistrot.git
git push -u origin main
```

(Crea prima il repository vuoto su github.com → *New repository* → nome `anita-bistrot`, senza README.)

**Oppure via web**: su github.com → *New repository* → *"uploading an existing file"* → trascini tutti i file di questa cartella.

---

## Modificare menu, prezzi, orari

Tutto vive in `src/data/`:

- **`menu.js`** → nomi, prezzi, descrizioni, sezioni (le ~280 voci del menu).
- **`hours.js`** → orari di apertura (guida anche la pill *"Aperto ora"* e i dati per Google).
- **`site.js`** → telefono, WhatsApp, indirizzo, social, link delivery, testi SEO.

Dopo la modifica, `git commit` + `git push`: il sito si rigenera e pubblica da solo.

Per vederlo in locale prima di pubblicare:

```bash
npm run build     # genera la cartella dist/
# apri dist/index.html nel browser
```

(Non serve `npm install`: il build non ha dipendenze esterne, i font sono già inclusi.)

---

## ⚠️ Da verificare PRIMA del lancio

Impostati con i dati del brief, ma da confermare:

1. **WhatsApp** — il numero `081 015 5330` è un fisso di Napoli. Il pulsante *"Prenota"* (wa.me) funziona **solo** se registrato su WhatsApp Business. Altrimenti metti un cellulare in `site.js` (campo `whatsapp`).
2. **Indirizzo e mappa** — *Via Passariello 60*, coord. 40.9095 / 14.397: verifica civico e posizione del pin.
3. **Link delivery** (Glovo / Alfonsino) in `site.js`: ipotesi, sostituisci con i link reali.
4. **Orari** in `hours.js`: segnaposto plausibile, correggi con quelli veri.
5. **Allergeni** — dedotti dai nomi dei piatti (Reg. UE 1169/2011): falli rivedere a chi cucina.
6. **Logo** — `src/assets/logo.svg`... n.b. il logo è un segnaposto testuale generato dal build: sostituiscilo col logo vero.
7. **Foto** — le sezioni "chi siamo" hanno riquadri segnaposto per le foto reali.
8. **P.IVA / dati fiscali**, **link recensioni Google**, **ID Google Analytics** (`ga4Id`): slot vuoti da riempire in `site.js`.

**Test consigliati su telefono reale**: tap su WhatsApp, resa su Android, Lighthouse.

---

## Struttura

```
.
├── .github/workflows/deploy.yml   # pubblicazione automatica su Pages
├── build.mjs                      # generatore del sito statico
├── package.json
├── src/
│   ├── data/{site,hours,menu}.js  # ← qui modifichi tutto
│   ├── app.js                     # pill "aperto ora", tab menu
│   ├── styles.css
│   └── assets/fonts/              # font WOFF2 self-hosted
└── dist/                          # generato dal build (non versionato)
```
