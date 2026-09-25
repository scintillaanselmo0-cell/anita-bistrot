/* ═══════════════════════════════════════════════════════════════════════════
   ANITA BISTROT — progressive enhancement
   Nessuna dipendenza. Se il JS è disattivato, il sito resta pienamente usabile:
   menu, telefono e orari (pagina Contatti) sono già HTML statico.
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  // Legge gli orari iniettati dal build in <script id="anita-hours">.
  var hoursEl = document.getElementById("anita-hours");
  var HOURS = null;
  try { HOURS = hoursEl ? JSON.parse(hoursEl.textContent) : null; } catch (e) { HOURS = null; }

  // Avviso temporaneo (ferie) iniettato in <script id="anita-notice">.
  var NOTICE = null;
  try { var nEl = document.getElementById("anita-notice"); if (nEl) NOTICE = JSON.parse(nEl.textContent); } catch (e) { NOTICE = null; }
  function romeDate() {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: (HOURS && HOURS.timezone) || "Europe/Rome",
        year: "numeric", month: "2-digit", day: "2-digit",
      }).format(new Date());
    } catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function noticeOn() {
    if (!NOTICE || !NOTICE.active) return false;
    if (NOTICE.until && romeDate() > NOTICE.until) return false; // scaduto: torna normale
    return true;
  }
  // Nasconde la fascia se la data di fine è passata (auto-scadenza).
  function applyNoticeExpiry() {
    var bar = document.querySelector(".notice[data-until]");
    if (!bar) return;
    var until = bar.getAttribute("data-until");
    if (until && romeDate() > until) bar.style.display = "none";
  }

  // ── Utility ────────────────────────────────────────────────────────────────
  function toMin(hhmm) {
    if (hhmm === "24:00") return 1440;
    var p = hhmm.split(":");
    return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  }
  function fmt(min) {
    var m = ((min % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
  }

  // Ora corrente nel fuso di Roma, indipendente dal fuso del dispositivo.
  function nowInRome() {
    var tz = (HOURS && HOURS.timezone) || "Europe/Rome";
    var parts;
    try {
      parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false,
      }).formatToParts(new Date());
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var wd = 0, hh = 0, mm = 0;
    parts.forEach(function (p) {
      if (p.type === "weekday") wd = map[p.value] != null ? map[p.value] : 0;
      else if (p.type === "hour") hh = parseInt(p.value, 10) % 24;
      else if (p.type === "minute") mm = parseInt(p.value, 10);
    });
    return { day: wd, min: hh * 60 + mm };
  }

  // Calcola lo stato di apertura corrente.
  // Ritorna { open:bool, closeMin?:int, openMin?:int, openDay?:int }
  function computeStatus() {
    if (!HOURS || !HOURS.schedule) return null;
    var sched = HOURS.schedule;
    var now = nowInRome();
    var today = sched[now.day] || [];
    var yest = sched[(now.day + 6) % 7] || [];

    // 1) Finestra di IERI che sfora oltre mezzanotte fino a oggi.
    for (var i = 0; i < yest.length; i++) {
      if (yest[i].overnight) {
        var c = toMin(yest[i].close);       // es. 02:00 = 120, valido stamattina
        if (now.min < c) return { open: true, closeMin: c };
      }
    }
    // 2) Finestre di OGGI.
    for (var j = 0; j < today.length; j++) {
      var o = toMin(today[j].open);
      var cl = today[j].overnight ? toMin(today[j].close) + 1440 : toMin(today[j].close);
      if (now.min >= o && now.min < cl) return { open: true, closeMin: cl };
    }
    // 3) Chiuso: trova la prossima apertura (oggi o nei giorni successivi).
    for (var d = 0; d < 7; d++) {
      var day = (now.day + d) % 7;
      var wins = sched[day] || [];
      for (var k = 0; k < wins.length; k++) {
        var om = toMin(wins[k].open);
        if (d === 0 && om <= now.min) continue; // già passata oggi
        return { open: false, openMin: om, openDay: day };
      }
    }
    return { open: false };
  }

  // ── Pill "Aperto ora" ────────────────────────────────────────────────────
  function renderPills() {
    var st = computeStatus();
    var pills = document.querySelectorAll("[data-livepill]");
    if (!pills.length) return;
    // Durante le ferie la pill mostra l'avviso invece di aperto/chiuso.
    if (noticeOn()) {
      pills.forEach(function (el) {
        el.classList.remove("is-open");
        el.classList.add("is-closed");
        el.innerHTML = '<span class="dot" aria-hidden="true"></span><span>' + (NOTICE.pillText || "In ferie") + '</span>';
      });
      return;
    }
    pills.forEach(function (el) {
      el.classList.remove("is-open", "is-closed");
      var dot = '<span class="dot" aria-hidden="true"></span>';
      var label;
      if (!st) { label = "Vedi orari di apertura"; }
      else if (st.open) {
        el.classList.add("is-open");
        label = "Aperto ora" + (st.closeMin != null ? " · chiude alle " + fmt(st.closeMin) : "");
      } else {
        el.classList.add("is-closed");
        var when = "";
        if (st.openMin != null) {
          var now = nowInRome();
          var dayTxt = (st.openDay != null && st.openDay !== now.day && HOURS.dayNames)
            ? HOURS.dayNames[st.openDay].toLowerCase() + " "
            : "";
          when = " · apre " + dayTxt + "alle " + fmt(st.openMin);
        }
        label = "Chiuso" + when;
      }
      el.innerHTML = dot + "<span>" + label + "</span>";
    });
  }

  // ── Evidenzia il giorno corrente nella tabella orari ───────────────────────
  function markToday() {
    var rows = document.querySelectorAll("[data-day]");
    if (!rows.length) return;
    var today = nowInRome().day;
    rows.forEach(function (r) {
      if (parseInt(r.getAttribute("data-day"), 10) === today) r.setAttribute("data-today", "");
      else r.removeAttribute("data-today");
    });
  }

  // ── Tab menu: stato attivo mentre si scorre ───────────────────────────────
  function menuTabs() {
    var tabs = Array.prototype.slice.call(document.querySelectorAll(".menutabs a"));
    if (!tabs.length || !("IntersectionObserver" in window)) return;
    var byId = {};
    tabs.forEach(function (t) { byId[t.getAttribute("href").slice(1)] = t; });

    function setActive(id) {
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      if (byId[id]) {
        byId[id].classList.add("is-active");
        // porta la tab attiva in vista nella barra orizzontale
        byId[id].scrollIntoView({ inline: "center", block: "nearest" });
      }
    }

    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
      });
      var best = null, bestR = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestR) { bestR = visible[id]; best = id; }
      });
      if (best) setActive(best);
    }, { rootMargin: "-140px 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] });

    document.querySelectorAll(".msec[id]").forEach(function (s) { io.observe(s); });
  }

  // ── Avvio ──────────────────────────────────────────────────────────────────
  function init() {
    applyNoticeExpiry();
    renderPills();
    markToday();
    menuTabs();
    // aggiorna la pill ogni minuto
    setInterval(function () { renderPills(); markToday(); }, 60000);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* ══════════════════════════════════════════════════════════════════════════
   ORDINE A DOMICILIO — carrello lato client + invio ordine su WhatsApp
   Nessun backend, nessun pagamento. Dati in centesimi (interi).
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var CART_KEY = "anita_cart";

  // Config iniettata da build (id="anita-order")
  var CFG = { whatsapp: "", minCents: 0, feeCents: 0, freeOverCents: null, zoneNote: "" };
  try {
    var cfgEl = document.getElementById("anita-order");
    if (cfgEl) CFG = Object.assign(CFG, JSON.parse(cfgEl.textContent));
  } catch (e) {}

  // ── Denaro ────────────────────────────────────────────────────────────────
  function fmt(c) { return "€\u00A0" + (c / 100).toFixed(2).replace(".", ","); }

  // ── Stato carrello ─────────────────────────────────────────────────────────
  var cart = load();
  function load() {
    try { var v = JSON.parse(localStorage.getItem(CART_KEY)); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function save() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {}
  }
  function clearCart() { cart = []; save(); }
  function qtyOf(id) { for (var i = 0; i < cart.length; i++) if (cart[i].id === id) return cart[i].qty; return 0; }
  function count() { return cart.reduce(function (n, l) { return n + l.qty; }, 0); }
  function subtotal() { return cart.reduce(function (n, l) { return n + l.price * l.qty; }, 0); }
  function deliveryFee(sub) {
    if (sub <= 0 || CFG.feeCents <= 0) return 0;
    if (CFG.freeOverCents != null && sub >= CFG.freeOverCents) return 0;
    return CFG.feeCents;
  }
  function total() { var s = subtotal(); return s + deliveryFee(s); }

  function addItem(id, name, price, from) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) { cart[i].qty++; save(); return; }
    cart.push({ id: id, name: name, price: price, qty: 1, from: !!from }); save();
  }
  function setQty(id, q) {
    for (var i = 0; i < cart.length; i++) if (cart[i].id === id) {
      cart[i].qty = q; if (q <= 0) cart.splice(i, 1); save(); return;
    }
  }
  function incQty(id) { setQty(id, qtyOf(id) + 1); }
  function decQty(id) { setQty(id, qtyOf(id) - 1); }

  // ── Controlli "Aggiungi" / stepper sulle righe del menu ────────────────────
  function renderBuy(el) {
    var id = el.getAttribute("data-id");
    var q = qtyOf(id);
    if (q <= 0) {
      var label = el.getAttribute("data-label") || "Aggiungi";
      el.innerHTML = '<button class="addbtn" type="button">' + label + '</button>';
    } else {
      el.innerHTML =
        '<div class="stepper" role="group" aria-label="Quantità">' +
        '<button class="st" data-act="dec" type="button" aria-label="Riduci">–</button>' +
        '<span class="st__n">' + q + '</span>' +
        '<button class="st" data-act="inc" type="button" aria-label="Aumenta">+</button>' +
        '</div>';
    }
  }
  function refreshBuys() {
    var els = document.querySelectorAll(".buy[data-id]");
    for (var i = 0; i < els.length; i++) renderBuy(els[i]);
  }

  // Delega click sui controlli riga
  document.addEventListener("click", function (ev) {
    var wrap = ev.target.closest ? ev.target.closest(".buy[data-id]") : null;
    if (!wrap) return;
    var id = wrap.getAttribute("data-id");
    if (ev.target.closest(".addbtn")) {
      addItem(id, wrap.getAttribute("data-name"), parseInt(wrap.getAttribute("data-price"), 10) || 0, wrap.getAttribute("data-from") === "1");
    } else {
      var b = ev.target.closest(".st");
      if (!b) return;
      if (b.getAttribute("data-act") === "inc") incQty(id); else decQty(id);
    }
    afterChange();
  });

  // ── Pulsante carrello flottante (FAB) ──────────────────────────────────────
  var fab;
  function ensureFab() {
    if (fab) return;
    fab = document.createElement("button");
    fab.type = "button";
    fab.className = "cartfab";
    fab.setAttribute("aria-label", "Apri il carrello");
    fab.addEventListener("click", openModal);
    document.body.appendChild(fab);
  }
  function updateFab() {
    ensureFab();
    var n = count();
    if (n <= 0) { fab.classList.remove("is-on"); return; }
    fab.classList.add("is-on");
    fab.innerHTML =
      '<span class="cartfab__ico" aria-hidden="true">🛒</span>' +
      '<span class="cartfab__n">' + n + '</span>' +
      '<span class="cartfab__t">' + fmt(subtotal()) + '</span>';
  }

  function afterChange() {
    refreshBuys();
    updateFab();
    if (modal && modal.classList.contains("is-open")) renderView(); // aggiorna vista aperta
  }

  // ── Modale (carrello → checkout → conferma) ────────────────────────────────
  var modal, panel, view = "cart", lastMsg = "", lastCode = "";
  function ensureModal() {
    if (modal) return;
    modal = document.createElement("div");
    modal.className = "cartmodal";
    modal.innerHTML = '<div class="cartmodal__bg" data-close></div><div class="cartmodal__panel" role="dialog" aria-modal="true" aria-label="Il tuo ordine"></div>';
    document.body.appendChild(modal);
    panel = modal.querySelector(".cartmodal__panel");
    modal.addEventListener("click", function (ev) {
      if (ev.target.hasAttribute("data-close")) closeModal();
    });
  }
  function openModal() { ensureModal(); view = "cart"; renderView(); modal.classList.add("is-open"); document.body.classList.add("noscroll"); }
  function closeModal() { if (modal) { modal.classList.remove("is-open"); document.body.classList.remove("noscroll"); } }

  function head(title) {
    return '<div class="cartmodal__head"><h2>' + title + '</h2>' +
      '<button class="cartmodal__x" type="button" data-close aria-label="Chiudi">✕</button></div>';
  }

  function renderView() {
    if (view === "checkout") return renderCheckout();
    if (view === "confirm") return renderConfirm();
    return renderCart();
  }

  // Vista 1 — carrello
  function renderCart() {
    var sub = subtotal(), fee = deliveryFee(sub), tot = sub + fee;
    if (!cart.length) {
      panel.innerHTML = head("Il tuo ordine") +
        '<div class="cartmodal__body"><p class="cart-empty">Il carrello è vuoto.<br>Aggiungi qualcosa dal menu per ordinare a domicilio.</p>' +
        '<a class="btn btn-primary" href="menu.html" data-close>Vai al menu</a></div>';
      return;
    }
    var lines = cart.map(function (l) {
      return '<div class="cartline">' +
        '<div class="cartline__nm">' + escapeHtml(l.name) +
          (l.from ? '<span class="cartline__from">da ' + fmt(l.price) + ' · scrivi le varianti nelle note</span>' : '') +
        '</div>' +
        '<div class="stepper stepper--sm" data-line="' + l.id + '">' +
          '<button class="st" data-act="dec" type="button" aria-label="Riduci">–</button>' +
          '<span class="st__n">' + l.qty + '</span>' +
          '<button class="st" data-act="inc" type="button" aria-label="Aumenta">+</button>' +
        '</div>' +
        '<div class="cartline__pr">' + fmt(l.price * l.qty) + '</div>' +
      '</div>';
    }).join("");

    var below = CFG.minCents > 0 && sub < CFG.minCents;
    var notice = below
      ? '<p class="cart-min">Ordine minimo ' + fmt(CFG.minCents) + ' — aggiungi ' + fmt(CFG.minCents - sub) + ' per procedere.</p>'
      : "";
    var feeRow = fee === 0 && sub > 0
      ? '<span>Consegna gratis 🎉</span>'
      : '<span>' + fmt(fee) + '</span>';

    panel.innerHTML = head("Il tuo ordine") +
      '<div class="cartmodal__body">' +
        '<div class="cartlines">' + lines + '</div>' +
        '<div class="cartsum">' +
          '<div class="cartsum__row"><span>Subtotale</span><span>' + fmt(sub) + '</span></div>' +
          '<div class="cartsum__row"><span>Consegna</span>' + feeRow + '</div>' +
          '<div class="cartsum__row cartsum__tot"><span>Totale</span><span>' + fmt(tot) + '</span></div>' +
        '</div>' + notice +
      '</div>' +
      '<div class="cartmodal__foot">' +
        '<button class="btn btn-primary" type="button" id="toCheckout"' + (below ? " disabled" : "") + '>Procedi</button>' +
      '</div>';

    // stepper delle righe carrello
    panel.querySelectorAll(".stepper[data-line]").forEach(function (s) {
      var id = s.getAttribute("data-line");
      s.addEventListener("click", function (ev) {
        var b = ev.target.closest(".st"); if (!b) return;
        if (b.getAttribute("data-act") === "inc") incQty(id); else decQty(id);
        afterChange();
      });
    });
    var go = panel.querySelector("#toCheckout");
    if (go) go.addEventListener("click", function () { view = "checkout"; renderView(); });
  }

  // Vista 2 — checkout
  function renderCheckout() {
    var sub = subtotal(), fee = deliveryFee(sub), tot = sub + fee;
    var hasFrom = cart.some(function (l) { return l.from; });
    var sumLines = cart.map(function (l) {
      return '<div class="cartsum__row"><span>' + l.qty + '× ' + escapeHtml(l.name) + (l.from ? ' (da)' : '') + '</span><span>' + fmt(l.price * l.qty) + '</span></div>';
    }).join("");
    panel.innerHTML = head("Completa l'ordine") +
      '<div class="cartmodal__body">' +
        (CFG.zoneNote ? '<p class="zone-note">' + escapeHtml(CFG.zoneNote) + '</p>' : "") +
        (hasFrom ? '<p class="from-note">Hai prodotti a prezzo variabile (es. Club Sandwich): il totale è il prezzo di partenza. Scrivi nelle note come li vuoi — ti confermiamo il prezzo finale in chat.</p>' : "") +
        '<div class="field"><label>Nome e cognome *</label><input type="text" id="f_name" autocomplete="name" inputmode="text"></div>' +
        '<div class="field"><label>Telefono *</label><input type="tel" id="f_phone" autocomplete="tel" inputmode="tel"></div>' +
        '<div class="field"><label>Indirizzo (via e civico) *</label><input type="text" id="f_addr" autocomplete="street-address"></div>' +
        '<div class="field"><label>Interno / citofono / piano</label><input type="text" id="f_int"></div>' +
        '<div class="field"><label>Note' + (hasFrom ? ' (indica qui le varianti)' : ' (allergie, citofono rotto…)') + '</label><textarea id="f_note" rows="2"></textarea></div>' +
        '<div class="cartsum">' + sumLines +
          '<div class="cartsum__row"><span>Consegna</span><span>' + (fee === 0 && sub > 0 ? "Gratis" : fmt(fee)) + '</span></div>' +
          '<div class="cartsum__row cartsum__tot"><span>Totale</span><span>' + fmt(tot) + '</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="cartmodal__foot cartmodal__foot--2">' +
        '<button class="btn btn-outline-ink" type="button" id="backCart">Indietro</button>' +
        '<a class="btn btn-primary is-disabled" id="sendWa" target="_blank" rel="noopener" href="#">Invia ordine su WhatsApp</a>' +
      '</div>';

    var name = panel.querySelector("#f_name"), phone = panel.querySelector("#f_phone"),
        addr = panel.querySelector("#f_addr"), interno = panel.querySelector("#f_int"),
        note = panel.querySelector("#f_note"), send = panel.querySelector("#sendWa");
    var code = orderCode();
    function curData() {
      return {
        name: name.value.trim(), phone: phone.value.trim(),
        addr: addr.value.trim(), interno: interno.value.trim(), note: note.value.trim(),
      };
    }
    function valid() { return !!(name.value.trim() && phone.value.trim() && addr.value.trim()); }
    // Tiene il link WhatsApp sempre pronto: così al tocco si apre davvero (niente popup bloccato)
    function updateSend() {
      if (valid()) {
        lastCode = code;
        lastMsg = buildMessage(curData(), code);
        send.href = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(lastMsg);
        send.classList.remove("is-disabled");
        send.removeAttribute("aria-disabled");
      } else {
        send.href = "#";
        send.classList.add("is-disabled");
        send.setAttribute("aria-disabled", "true");
      }
    }
    [name, phone, addr, interno, note].forEach(function (i) { i.addEventListener("input", updateSend); });
    updateSend();
    panel.querySelector("#backCart").addEventListener("click", function () { view = "cart"; renderView(); });

    // [SEGNAPOSTO PAGAMENTO] — qui in futuro si potrà aggiungere la scelta del
    // metodo di pagamento senza riscrivere il resto. Per ora nessun pagamento.

    send.addEventListener("click", function (ev) {
      if (!valid()) { ev.preventDefault(); return; }     // campi mancanti: non fare nulla
      // il link (target=_blank) apre WhatsApp; noi passiamo alla conferma e svuotiamo il carrello
      lastCode = code; lastMsg = buildMessage(curData(), code);
      setTimeout(function () { clearCart(); afterFabOnly(); view = "confirm"; renderView(); }, 350);
    });
  }

  // Vista 3 — conferma
  function renderConfirm() {
    var url = "https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent(lastMsg);
    panel.innerHTML = head("Ci siamo quasi!") +
      '<div class="cartmodal__body">' +
        '<p class="confirm-copy">Apri WhatsApp e premi invio per inviarci l\'ordine: lo riceviamo direttamente in chat e ti confermiamo tutto lì. 💜</p>' +
        '<textarea class="confirm-msg" readonly rows="10">' + escapeHtml(lastMsg) + '</textarea>' +
      '</div>' +
      '<div class="cartmodal__foot">' +
        '<a class="btn btn-primary" href="' + url + '" target="_blank" rel="noopener">Apri WhatsApp e invia l\'ordine</a>' +
      '</div>';
    var ta = panel.querySelector(".confirm-msg");
    if (ta) ta.addEventListener("focus", function () { this.select(); });
  }

  function afterFabOnly() { refreshBuys(); updateFab(); }

  // ── Messaggio WhatsApp (compatto) ──────────────────────────────────────────
  function orderCode() {
    var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", s = "";
    for (var i = 0; i < 4; i++) s += A.charAt(Math.floor(Math.random() * A.length));
    return "AN-" + s;
  }
  function buildMessage(d, code) {
    var sub = subtotal(), fee = deliveryFee(sub), tot = sub + fee;
    var hasFrom = false;
    var lines = cart.map(function (l) {
      if (l.from) hasFrom = true;
      return l.qty + "× " + l.name + (l.from ? " (da)" : "") + " — " + fmt(l.price * l.qty).replace("\u00A0", " ");
    }).join("\n");
    return "🧾 *Nuovo ordine — Anita Bistrot* (#" + code + ")\n\n" +
      "*Prodotti:*\n" + lines + "\n\n" +
      "Consegna: " + (fee === 0 ? "Gratis" : fmt(fee).replace("\u00A0", " ")) + "\n" +
      "*TOTALE: " + fmt(tot).replace("\u00A0", " ") + "*" +
      (hasFrom ? "\n(voci con \"da\" = prezzo di partenza, da confermare)" : "") + "\n\n" +
      "*Nome:* " + d.name + "\n" +
      "*Telefono:* " + d.phone + "\n" +
      "*Indirizzo:* " + d.addr + (d.interno ? " (" + d.interno + ")" : "") + "\n" +
      "*Note:* " + (d.note || "-");
  }

  // ── util ───────────────────────────────────────────────────────────────────
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ── API pubblica (usata dal compositore piadina) ────────────────────────────
  // Aggiunge una voce personalizzata; compositori identici si sommano (stesso id).
  window.AnitaCart = {
    add: function (name, priceCents) {
      addItem("piada:" + name, name, priceCents, false);
      afterChange();
    },
    open: openModal,
  };

  // ── Avvio ───────────────────────────────────────────────────────────────────
  function start() { refreshBuys(); updateFab(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();

/* ══════════════════════════════════════════════════════════════════════════
   COMPOSITORE PIADINA — carne principale obbligatoria, extra sbloccati dopo,
   formaggi/contorni liberi. Totale live → aggiunge una voce al carrello.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";
  var form = document.querySelector("[data-piada]");
  if (!form) return;

  function fmt(c) { return "€\u00A0" + (c / 100).toFixed(2).replace(".", ","); }
  function mainInput() { return form.querySelector('input[name="piada-main"]:checked'); }
  function extraInputs() {
    var g = form.querySelector('.piada__group[data-kind="extra"]');
    return g ? Array.prototype.slice.call(g.querySelectorAll('input[type="checkbox"]')) : [];
  }

  function recompute() {
    var main = mainInput();
    var hasMain = !!main;
    // sblocca/blocca la carne extra
    extraInputs().forEach(function (i) {
      i.disabled = !hasMain;
      if (!hasMain) i.checked = false;
    });
    var extraGroup = form.querySelector('.piada__group[data-kind="extra"]');
    if (extraGroup) extraGroup.classList.toggle("is-locked", !hasMain);

    // totale
    var total = 0;
    if (main) total += parseInt(main.getAttribute("data-price"), 10) || 0;
    form.querySelectorAll('input[type="checkbox"]:checked').forEach(function (i) {
      total += parseInt(i.getAttribute("data-price"), 10) || 0;
    });

    var totEl = form.querySelector("[data-piada-tot]");
    if (totEl) totEl.textContent = fmt(total);
    var addBtn = form.querySelector("[data-piada-add]");
    if (addBtn) addBtn.disabled = !hasMain;
    var hint = form.querySelector("[data-piada-hint]");
    if (hint) hint.style.display = hasMain ? "none" : "";
    return total;
  }

  function buildName() {
    var parts = [];
    form.querySelectorAll(".piada__group").forEach(function (g) {
      var title = (g.querySelector(".mgroup__title") || {}).textContent || "";
      title = title.replace(/obbligatoria/i, "").trim();
      var sel;
      if (g.getAttribute("data-kind") === "main") {
        var m = g.querySelector('input:checked');
        sel = m ? [m.getAttribute("data-name")] : [];
      } else {
        sel = Array.prototype.slice.call(g.querySelectorAll('input:checked'))
          .map(function (i) { return i.getAttribute("data-name"); });
      }
      if (sel.length) parts.push(title + ": " + sel.join(", "));
    });
    return "Piadina — " + parts.join(" · ");
  }

  form.addEventListener("change", recompute);

  var addBtn = form.querySelector("[data-piada-add]");
  if (addBtn) addBtn.addEventListener("click", function () {
    var main = mainInput();
    if (!main) return;
    var total = recompute();
    var name = buildName();
    if (window.AnitaCart && typeof window.AnitaCart.add === "function") {
      window.AnitaCart.add(name, total);
    }
    // reset e conferma breve
    form.reset();
    recompute();
    var old = addBtn.textContent;
    addBtn.textContent = "Aggiunta al carrello ✓";
    addBtn.disabled = true;
    setTimeout(function () { addBtn.textContent = old; recompute(); }, 1600);
  });

  recompute();
})();
